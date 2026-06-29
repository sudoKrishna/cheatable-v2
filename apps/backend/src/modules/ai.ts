import { Router } from "express";
import { Server } from "socket.io";
import { prisma } from "@repo/db";
import { requireAuth } from "../../middlewares/auth.middleware";
import { createEmtter } from "../sockets/sandbox.socket";
import {askModelForJSON,askModelForText,} from "../lib/openaiClient";
import {PLANNING_SYSTEM_PROMPT,FILE_GENERATION_SYSTEM_PROMPT,
EDIT_SYSTEM_PROMPT,
  buildFileGenerationUserMessage,
  buildEditUserMessage,
  type ProjectPlan,
  type FileMap,
} from "../lib/systemPrompts";
import { pushGeneratedFiles } from "./sandbox";
import { saveFileSnapShot } from "./project";

export function generateProjectPlan(prompt : string) : Promise<ProjectPlan> {
return askModelForJSON(PLANNING_SYSTEM_PROMPT , prompt)
}

export function generateFileContent(plan : ProjectPlan , targetPath : string) : Promise<string> {
    const userMessage =  buildFileGenerationUserMessage(plan , targetPath)
   return  askModelForText(FILE_GENERATION_SYSTEM_PROMPT, userMessage)
}

export async function runFullGeneration(projectId :string, ownerId : string , prompt : string, emit : (event :string, payload : unknown) => void) : Promise<void> {
try {
    emit("generation-started", {});
    const plan =  await generateProjectPlan(prompt)
    emit("plan-ready", {files : plan.files.map(f => f.path)})
    const files : FileMap = {};
    for(const file of plan.files) {
     emit("file-generating" ,  {path : file.path})
     const content = await generateFileContent(plan, file.path)
     files[file.path] = content
     emit("file-generated" , {path : file.path , content})
    }
    const fileArray = Object.entries(files).map(([path , content]) => ({
        path, content
    }))
    await pushGeneratedFiles(projectId, ownerId, fileArray)
    await saveFileSnapShot(projectId , files)

    const project = await prisma.project.findFirst({
        where : {id : projectId , ownerId}
    })
    emit("generation-complete", {previewUrl : project?.previewUrl ?? null})
} catch (error) {
    emit("generation-error" , {
        message : error instanceof Error ? error.message : "Generation failed"
    })
}
}
export async function generateEditDiff(existingFiles: FileMap, instruction: string): Promise<FileMap> {
    const userMessage = buildEditUserMessage(existingFiles, instruction)
    return askModelForJSON(EDIT_SYSTEM_PROMPT, userMessage)
}

export async function runEditGeneration(projectId:  string , ownerId : string, existingFiles : FileMap , instruction : string, emit : (event : string , payload : unknown) => void)  : Promise<void> {
    try {
        emit("generation-started", {})
        const changedFiles = await generateEditDiff(existingFiles ,instruction)
        for(const [path ,content] of Object.entries(changedFiles)) {
            emit("file-generated", {path , content})
        }
        const filesArray = Object.entries(changedFiles).map(([path , content])=> ({
            path , content
        }))
    
        await pushGeneratedFiles(projectId , ownerId , filesArray)
        await saveFileSnapShot(projectId , changedFiles)
    
        const project= await prisma.project.findFirst({
            where : {id : projectId , ownerId}
        })
        emit("generation-complete" , {previewUrl : project?.previewUrl ?? null})
    } catch (error) {
        emit("genetaion-err", {
            message : error instanceof Error ? error.message : "generation failed"
        })
    }
}

export function createAiRouter(io :Server){
const router = Router()
router.post("/:id/generate" , requireAuth , async (req , res , next) => {
try {
    const {prompt} = req.body;
    if(!prompt || typeof prompt !== "string") {
        return res.status(400).json({error : "prompt are required"})
    }
    const projectId = req.params.id;
    if(!projectId || typeof projectId !== "string") {
        return res.status(400).json({error:  "project Id id required"})
    }
    const ownerId = req.user?.id;
    if(!ownerId || typeof ownerId !== "string") {
        return res.status(400).json({error : "owner id required"})
    }
    const project = await prisma.project.findFirst({
        where : {id : projectId , ownerId}
    })
    if(!project) {
        return res.status(400).json({error : "Project not found"})
    }
    const emit = await createEmtter(io , project.id)

    runFullGeneration(project.id , ownerId , prompt , emit).catch((err) => {
        console.error("runfullgeneration  failed:" , err)
    })

    return res.status(202).json({message : "generation started"})
} catch (error) {
    next(error)
}
})
router.post("/:id/edit" , requireAuth , async  (req, res , next) => {
    try {
        const {instruction} = req.body;
        if(!instruction || typeof instruction !== "string") {
            return res.status(400).json({error : "instruction required"})
        }
        const projectId = req.params.id;
        if(!projectId || typeof projectId !== "string") {
            return res.status(400).json({error : "projectid required"})
        }
        const ownerId = req.user?.id;
        if(!ownerId || typeof ownerId !== "string") {
            return res.status(400).json({error : "owner id required"})
        }
        const project = await prisma.project.findFirst({
            where : {id : projectId , ownerId}
        })

        if(!project) {
            return res.status(400).json({error : "project not found"})
        }
        const projectFiles = await prisma.projectFile.findMany({
            where : {projectId}
        })
        const existingFiles : FileMap  = {};
        for(const file of  projectFiles) {
            existingFiles[file.path] = file.content;
        }
        const emit = await createEmtter(io, project.id);

        runEditGeneration (
            project.id,
            ownerId,
            existingFiles,
            instruction,
            emit
        ).catch((err) => {
            console.error('runEditGenenration failed: ', err)
        })
        return res.status(200).json({message : "edit stated"})

    } catch (error) {
        next(error)
    }

})
return router;
}

