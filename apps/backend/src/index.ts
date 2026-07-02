console.log("DB URL LOADED:", process.env.DATABASE_URL ? "YES" : "NO");
import { createServer } from "http";
import { Server } from "socket.io";
import { createApp, mountRoutes } from "./app";
import { registerSandboxSocket } from "./sockets/sandbox.socket";

const PORT = 3000;

const app = createApp();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {}
});

registerSandboxSocket(io);
mountRoutes(app, io);  

httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on 0.0.0.0:${PORT}`);
});