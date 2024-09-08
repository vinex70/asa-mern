import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import cors from "cors";
//Routes
import signupRoute from "./routes/signup.js";
import signinRoute from "./routes/signin.js";

const server = express();
let PORT = process.env.BASE_PORT || 3000;

server.use(express.json());
server.use(cors());

mongoose.connect(process.env.DB_HOST, {
  autoIndex: true,
});

server.use(signupRoute);
server.use(signinRoute);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
