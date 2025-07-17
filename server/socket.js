import { Server as SocketIOServer } from "socket.io";

const setupSocket = (server) => {
    const io = new SocketIOServer(server, {
        cors: {
            origin: process.env.ORIGIN,
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    const userSocketMap = new Map();

    const disconnect = (socket) => {
        console.log(`Client ${socket.id} disconnected`);
        for (const [userID, socketID] of userSocketMap.entries()) {
            if (socketID === socket.id) {
                userSocketMap.delete(userID);
                break;
            }
        }
    };

    io.on("connection", (socket) => {
        const userID = socket.handshake.query.userID;
        if (userID) {
            userSocketMap.set(userID, socket.id);
            console.log(`Client ${socket.id} connected to user ${userID}`);
        } else {
            console.log("User ID not found");
        }
        socket.on("disconnect", () => disconnect(socket));
    });
};

export default setupSocket;