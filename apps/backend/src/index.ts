import { createServer } from "http";
import { Server } from "socket.io";
import { createApp } from "./app";
import { registerSandboxSocket } from "./sockets/sandbox.socket";
import { createAiRouter } from "./modules/ai";


const PORT = 3000;

const app = createApp();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {  }
});

registerSandboxSocket(io);

app.use('/ai', createAiRouter(io));

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});