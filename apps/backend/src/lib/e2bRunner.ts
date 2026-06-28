import {Filesystem, Sandbox} from "e2b";
import fs from "node:fs";
import path, { resolve } from "node:path";

export type  GeneratedFile = {
    path : string;
    content : string;
}

const MAX_TIMEOUT_MS = 10 * 60 * 1000;
const DEV_SERVER_PORT = 5173;

export type ProjectFile = {
    path : string;
    content : string;
}

const TEMPLATE_ROOT = path.join(
    process.cwd(),
    "sandbox-template",
    "react-vite"
)

const SKIP_DIRS = new Set([
    "node=modules",
    "dist",
    "/git",
])


function readTemplateFiles() : GeneratedFile[] {
const files :  GeneratedFile [] = []
function walk (dir : string, relativeTo : string ) {
   for(const entry of fs.readdirSync(dir ,{withFileTypes : true} )){
    if(entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist") {
        continue
    }
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(relativeTo , entry.name);
    if(entry.isDirectory()) {
        walk(fullPath , relativePath);
    } else {
        files.push({
            path : relativePath.split(path.sep).join("/"),
            content : fs.readFileSync(fullPath , "utf-8")
        })
    }
   }
}
walk(TEMPLATE_ROOT, "");
return files;
}

async function writeFilesSandbox(sandbox : Sandbox ,files : GeneratedFile[]) : Promise<void> {
    for(const file of files ) {
        await sandbox.files.write(file.path , file.content)
    }
}

async function installAndStartDevServer(sandbox : Sandbox): Promise<void> {
    const install = await sandbox.commands.run("npm install" , {
        timeoutMs : 120_000
    });
    if(install.exitCode !== 0) {
        throw new Error(`npm install falied : ${install.stderr}`)
    }
    await sandbox.commands.run("npm run dev" ,  {
        background : true
    });
    await new Promise((resolve) => setTimeout(resolve, 2000));
}

async function createSandboxForProject(): Promise<{sandboxId : string , previewUrl : string}> {
    const sandbox = await Sandbox.create({
        timeoutMs : MAX_TIMEOUT_MS
    })

    const templates = readTemplateFiles();
    await writeFilesSandbox(sandbox , templates);
    await installAndStartDevServer(sandbox)

    const host = sandbox.getHost(DEV_SERVER_PORT)
    const previewUrl = `http://${host}`;

    return {previewUrl , sandboxId : sandbox.sandboxId}
}




