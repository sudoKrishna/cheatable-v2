import express, { Router } from "express";
import {prisma} from "@repo/db"
import  { ensureSandboxRunning  } from "../lib/e2bRunner";
import {applyFilesToSandbox, resumeSandbox , type GeneratedFile} from "../lib/e2bRunner"
import { requireAuth } from "../../middlewares/auth.middleware";
const app = express();

app.use(express.json());

async function getOwnedProject(projectId : string , ownerId :string) {
    return prisma.project.findFirst({
        where : {id : projectId , ownerId}
    })
}

export async function startSandboxForProject(
  projectId: string,
  ownerId: string
) {
  const project = await getOwnedProject(projectId, ownerId);

  if (!project) {
    throw new Error("Project not found");
  }

  const existingFiles = await prisma.projectFile.findMany({
    where: {
      projectId,
    },
  });

  const { sandboxId, previewUrl } = await ensureSandboxRunning(
    project.sandboxId,
    existingFiles
  );

  return prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      sandboxId,
      previewUrl,
      sandboxStatus: "running",
    },
  });
}

export async function stopSandboxForProject(projectId :string ,ownerId :string) {
  const project = await getOwnedProject(projectId , ownerId);
  if(!project) {
    throw new Error("project was not found")
  }
  if (project.sandboxId) {
    const resumed = await resumeSandbox(project.sandboxId);
    if (resumed) {
      await resumed.sandbox.kill();
    }
  }
  return prisma.project.update({
    where : {
        id : projectId,
    },
    data : {
        sandboxId : null,
        previewUrl :null,
        sandboxStatus : "stopped"
    }
  }) 
}

export async function execInSandbox(projectId :string , ownerId : string , commands :string) {
    const project = await getOwnedProject(projectId , ownerId);

    if(!project?.sandboxId) {
      const err : any = new Error("Sandbox is not running this project")
      err.status = 409;
      throw err;
    }
    
        const resumed = await resumeSandbox(project.sandboxId)
        if(!resumed) {
            const err : any = new Error("sandbox is not running for this project");
            err.status = 409;
            throw err;
        }


    const result = await resumed.sandbox.commands.run(commands)
    return {
        stdout : result.stdout,
        stderr : result.stderr,
        exitCode : result.exitCode,
    };

}

export async function getSandboxStatus(projectId : string, ownerId : string) {
    const project = await getOwnedProject(projectId, ownerId)
    return {
        previewUrl : project?.previewUrl,
        sandboxStatus : project?.sandboxStatus
    }

}

export async function pushGeneratedFiles(projectId  :string, ownerId : string, files : GeneratedFile[]) {
    const project = await getOwnedProject(projectId , ownerId);
    if(!project?.sandboxId) {
        const err : any = new Error("sandbox is  not running for this project")
        err.status = 400;
        throw err;
    }
    await applyFilesToSandbox(project.sandboxId , files)
}

const router = Router();


router.post("/:id/start", requireAuth, async (req, res, next) => {
  try {
    const project = await startSandboxForProject(req.params.id as string, req.user!.id);
    res.json(project);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/stop" ,requireAuth, async (req , res, next) => {
    try {
        const project = await  stopSandboxForProject(req.params.id as string, req.user!.id);
        res.json(project)
    } catch (error) {
        next(error)
    }
})
router.post("/:id/exec", requireAuth, async (req, res, next) => {
  try {
    const result = await execInSandbox(req.params.id as string, req.user!.id, req.body.commands);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/status", requireAuth, async (req, res, next) => {
  try {
    const status = await getSandboxStatus(req.params.id as string, req.user!.id);
    res.json(status);
  } catch (err) {
    next(err);
  }
});

export default router;
