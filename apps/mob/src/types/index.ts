export type SandboxStatus = "idle" | "creating" | "running" | "error" | "stopped";

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
  sandboxId: string | null;
  previewUrl: string | null;
  sandboxStatus: SandboxStatus;
  createdAt: string;
  updatedAt: string;
}

export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  projectId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  path: string;
  content: string;
  updatedAt: string;
}

export type FileMap = Record<string, string>;

export interface GeneratedFile {
  path: string;
  content: string;
}

export interface GenerateCodeRequest {
  projectId: string;
  prompt: string;
}

export interface GenerateCodeResponse {
  files: GeneratedFile[];
  explanation: string;
}

export interface SandboxRunResult {
  previewUrl: string;
  sandboxId: string;
}

export type StreamEvent =
  | { type: "generation-started" }
  | { type: "plan-ready"; files: string[] }
  | { type: "file-generating"; path: string }
  | { type: "file-generated"; path: string; content: string }
  | { type: "generation-complete"; previewUrl: string | null }
  | { type: "generation-error"; message: string };

export interface CreateProjectRequest {
  name: string;
}

export interface SendMessageRequest {
  content: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}