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

