export type ProjectPlan = {
    files : {
        path : string,
        purpose : string;
    }[];
}

export type FileMap = {
    [path : string] :string;
}
export const PLANNING_SYSTEM_PROMPT = `You are a senior software architect for React + Vite + TypeScript applications.

You will be given a one-line app idea. Your job is to decide what NEW files are needed to build this app, beyond the existing Vite scaffold. Do NOT include files that already exist in a standard Vite + React + TypeScript template, such as:
- vite.config.ts
- index.html
- package.json
- tsconfig.json
- src/main.tsx
- src/index.css

Only list files that need to be CREATED for this specific app's features (e.g. components, hooks, types, utility files).

Return ONLY a JSON object in exactly this shape, with no other text:
{"files": [{"path": "src/components/TodoList.tsx", "purpose": "renders the list of todos"}]}

Rules:
- "path" must be a relative path starting with "src/"
- "purpose" must be a short, one-sentence description of what that file does
- Do not include any markdown, explanation, or code fences
- Do not include vite.config.ts, index.html, package.json, or any file that already exists in the template
- Return valid JSON only, nothing before or after it`;

export const FILE_GENERATION_SYSTEM_PROMPT = `You are an expert React + TypeScript developer.

You will be given the path and purpose of ONE file, along with context about the rest of the project (other files and their purposes). Your job is to write the COMPLETE, valid content of that ONE file only.

Conventions to follow:
- Use functional components with hooks, not class components
- Use named exports for components (export function ComponentName() {...}), unless the file is the app's entry point
- Use Tailwind CSS utility classes for all styling — do not write separate CSS files or inline style objects
- Use TypeScript types/interfaces for props and data structures
- Import other project files using relative paths matching the project structure you're given
- Write clean, working code with no placeholders or TODOs

Output rules:
- Return ONLY the raw file content
- Do not wrap the output in markdown code fences
- Do not explain anything before or after the code
- Do not include any text that is not valid content for this file`;

export const EDIT_SYSTEM_PROMPT = `You are the same expert React + TypeScript developer, now making a change to an existing project.

You will be given the current content of all files in the project, followed by a plain-English instruction describing a change the user wants.

Your job is to:
1. Decide which files actually need to change to satisfy the instruction. This could be zero files, one file, or several files.
2. Return the FULL new content for each file that needs to change — not a diff, not a partial snippet, the entire file content as it should be after the change.
3. Do not return files that don't need to change.

Return ONLY a JSON object in exactly this shape, with no other text:
{"files": [{"path": "src/components/Button.tsx", "content": "<the full new file content>"}]}

Rules:
- Follow the same conventions as the rest of the project: functional components, Tailwind CSS for styling, TypeScript types
- "content" must be the complete, valid file content after the change, ready to be written directly to disk
- Do not include any markdown, explanation, or code fences
- Return valid JSON only, nothing before or after it`;



export function buildFileGenerationUserMessage(
  plan: ProjectPlan,
  targetPath: string
): string {
  const targetFile = plan.files.find((f) => f.path === targetPath);

  if (!targetFile) {
    throw new Error(`File ${targetPath} not found in plan`);
  }

  const otherFiles = plan.files.filter((f) => f.path !== targetPath);

  const otherFilesList = otherFiles
    .map((f) => `- ${f.path}: ${f.purpose}`)
    .join("\n");

  return `Here is the full plan for this project (so you know what other files exist and can import from them correctly):

${otherFilesList || "(no other files)"}

Now write the complete content for this file:

Path: ${targetFile.path}
Purpose: ${targetFile.purpose}

Write the full, valid content for this file only.`;
}

export function buildEditUserMessage(
  existingFiles: FileMap,
  instruction: string
): string {
  const filesList = Object.entries(existingFiles)
    .map(([path, content]) => `--- ${path} ---\n${content}`)
    .join("\n\n");

  return `Here is the current state of all files in the project:

${filesList}

The user has requested this change:
"${instruction}"

Decide which files need to change to satisfy this request, and return their full new content.`;
}
