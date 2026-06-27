import express, { Router } from "express";
import {prisma} from "@repo/db"


const app = express();

app.use(express.json());
const router = Router();
type FileMap = Record<string, string>;

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


router.post("/" ,async (req , res) => {
    
})
