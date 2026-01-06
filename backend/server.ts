import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "./routes/api.js";
// import { setSocketIOInstance } from "./services/socket-emitter";

dotenv.config();

const app = express();
const httpServer = createServer(app);
// const io = new Server(httpServer, {
//   cors: {
//     origin: process.env.FRONTEND_URL || "http://localhost:3000",
//     methods: ["GET", "POST"],
//   },
// });

app.use(cors());
app.use(express.json());
app.use("/api", apiRoutes);

// Socket.io connection handling
// io.on("connection", (socket) => {
//   console.log("Client connected:", socket.id);

//   socket.on("disconnect", () => {
//     console.log("Client disconnected:", socket.id);
//   });
// });

// Set Socket.io instance for listener to use
// setSocketIOInstance(io);

// Export io instance so listener can emit events
// export { io };

const PORT = process.env.PORT || 3002;

httpServer.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  // console.log(`Socket.io server ready`);
});

