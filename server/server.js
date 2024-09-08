import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import signupRoute from "./routes/signup.js"; // import route

const server = express();
let PORT = process.env.BASE_PORT || 3000;

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

server.use(express.json());

mongoose.connect(process.env.DB_HOST, {
  autoIndex: true,
});

server.use(signupRoute);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
