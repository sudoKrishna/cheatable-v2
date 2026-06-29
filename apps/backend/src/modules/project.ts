import express, { Router } from "express";
import {prisma} from "@repo/db"
import z from "zod";
import { requireAuth } from "../../middlewares/auth.middleware";


const app = express();

app.use(express.json());
const router = Router();
type FileMap = Record<string, string>;

const createProjectSchema = z.object({
    name : z.string().min(1, 'name is required')
})

export async function createProject(ownerId :string , name :string)  {
   return prisma.project.create({data : {
        name ,
        ownerId
    }})
}

export async function getProjectById(id :string , ownerId :string) {
   return await prisma.project.findFirst({
        where : {id , ownerId},
         include : {
        projectFile : true,
        message : true
      }
    } , 
    
   );
}

export async function listProjectsForUser(ownerId : string) {
    return await prisma.project.findMany({
        where  : {ownerId}
    })
}

export async function deleteProject(id : string, ownerId :string) {
    const project =  await prisma.project.findFirst({
        where : {id ,ownerId}
    })
    if(!project) {
        throw new Error("project not found")
    }
    return await prisma.project.delete({
        where : {id}
    })
}

export async function updateProject(id :string , ownerId :string , data : Partial<{name :string}>) {
    const project = await prisma.project.findFirst({
        where : {id , ownerId}
    })
    if(!project) {
        throw new Error("project not found")
    }

   return await prisma.project.update({
    where : {id}, data
   })
}

export async function saveFileSnapShot(projectId  : string , files : FileMap) : Promise<void> {
   await prisma.$transaction(
    Object.entries(files).map(([path , content]) => 
        prisma.projectFile.upsert({
            where : {projectId_path  : {projectId , path}}, 
            update: {content},
            create: {projectId , path , content},
        })
    )
   ) 
}

router.post('/' , requireAuth , async (req , res) => {
    const parsed = createProjectSchema.safeParse(req.body);

    if(!parsed.success) {
        return res.status(400).json({
            error : 'invalid request body',
            issues : parsed.error.flatten(),
        });
    }
    const ownerId = req.ownerId!; 
    const project = await createProject(ownerId , parsed.data.name);
    return res.status(201).json({project})
})

router.get("/" , requireAuth , async (req , res) => {
    const ownerId = req.ownerId!; 

    const projects = await listProjectsForUser(ownerId)
    return res.status(201).json({projects})
})

router.get("/:id" , requireAuth , async (req , res) =>{ 
    const projectId = req.params.id as string;
    const ownerId = req.ownerId!;

    const project = await getProjectById(projectId , ownerId);

    if(!project) {
        throw new Error("Project not found")
    }
    return res.status(201).json({project})
})

router.patch("/projects/:id" , requireAuth , async (req , res) => {
    const projectId = req.params.id as string;
     
    const updateProjectSchema = z.object({name : z.string().min(1)}).partial();

    const parsed = updateProjectSchema.safeParse(req.body);

    if(!parsed.success) {
        return res.status(400).json({error : "Invalid request body " ,issuse : parsed.error.flatten()})
    }
    const ownerId = req.ownerId!;

    const project = await updateProject(projectId , ownerId , parsed.data)

    if(!project) {
        throw new Error("project not found")
    }
    return res.status(201).json({project})
})

router.delete("/project/:id" , requireAuth , async (req , res) => {
    const projectId = req.params.id as string;
    const ownerId = req.ownerId!;
    const project = await deleteProject(projectId , ownerId);
    if(!project) {
        throw new Error("project not found")
    }

    return res.status(200).json({project})
})

export default router;
