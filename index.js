import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import http from "http";
import { Server } from "socket.io";
import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRoutes.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

dotenv.config();

const connect = () => {
  try {
    mongoose.connect(process.env.DB);
    console.log("connected to database");
  } catch (error) {
    throw error;
  }
};

app.use(bodyParser.json());
app.use(express.json());

io.on("connection", (socket) => {
  console.log("connected...!");
  socket.on("join_verification", (userId) => {
    console.log("user joined", userId);
    socket.join(userId);
  });

    const randomEnergy = Math.random() * 20; // Random value between 0 and 20
    const randomPower = Math.random() * 15; // Random value between 0 and 15
    const randomVoltage = Math.random() * 230; // Random value between 0 and 230
    const randomCurrent = Math.random() * 10; // Random value between 0 and 10
    const randomFrequency = Math.random() * 60; // Random value between 0 and 60

    socket.to('64e48d0a91632e7cf622fa18').emit('sensorUpdate', {
      energy: randomEnergy,
      power: randomPower,
      voltage: randomVoltage,
      current: randomCurrent,
      frequency: randomFrequency,
    });
});



io.on('connection', (socket) => {
  socket.on('sensorData', (data) => {
    const { productId, energy, power, voltage, current, frequency } = JSON.parse(data);
    // Use productId to map to the appropriate user ID
    console.log(productId, energy, power, voltage, current, frequency);
    // Emit sensor data to the user's room
    io.to('64e48d0a91632e7cf622fa18').emit('sensorUpdate', { energy, power, voltage, current, frequency });
  });
});

app.use((req, res, next) => {
  req.app.set("socketio", io);
  next();
});

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);

server.listen(8000, () => {
  console.log("App running...");
  connect();
});
