import { createServer } from "http";
import { Server } from "socket.io";
import { createApp } from "./app";
import { registerSandboxSocket } from "./sockets/sandbox.socket";
import { createAiRouter } from "./modules/ai";




const app = createApp();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { /* ... */ }
});

registerSandboxSocket(io);

app.use('/ai', createAiRouter(io));

httpServer.listen(3000, () => {
    console.log(`Server running on port ${3000}`);
});