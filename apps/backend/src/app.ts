
import express, { type Express } from "express";
import type { Server } from "socket.io";

import authRouter from "./modules/auth";
import projectRouter from "./modules/project";
import sandboxRouter from "./modules/sandbox";
import { createAiRouter } from "./modules/ai";


export function createApp(): Express {
  const app = express();
  app.use(express.json());
  return app;
}

export function mountRoutes(app: Express, io: Server): void {
  app.use("/auth", authRouter);
  app.use("/projects", projectRouter);
  app.use("/sandbox", sandboxRouter);
  app.use("/ai", createAiRouter(io));

}