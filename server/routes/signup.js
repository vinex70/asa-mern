import express from "express";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";

//Schemas
import User from "../Schema/User.js";

const router = express.Router();

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

const formatDatatoSend = (user) => {
  const access_token = jwt.sign({ id: user._id }, process.env.SECRET_KEY);

  return {
    access_token,
    profile_img: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname,
  };
};

const generateUserName = async (email) => {
  let username = email.split("@")[0];

  let isUserNameNotUnique = await User.exists({
    "personal_info.username": username,
  }).then((result) => result);

  isUserNameNotUnique ? (username += nanoid(5)) : "";

  return username;
};

router.post("/signup", (req, res) => {
  let { fullname, email, password } = req.body;

  //validation the data from frontend
  if (!fullname) {
    return res.status(403).json({ error: "fullname is required" });
  }

  if (fullname.length < 3) {
    return res.status(403).json({ error: "fullname must be 3 letters long" });
  }

  if (!email || !email.length) {
    return res.status(403).json({ error: "email is required" });
  }

  if (!emailRegex.test(email)) {
    return res.status(403).json({ error: "invalid email" });
  }

  if (!passwordRegex.test(password)) {
    return res.status(403).json({
      error:
        "Password should be 6 to 20 characters long with a numeric, 1 uppercase, 1 lowercase",
    });
  }

  bcrypt.hash(password, 10, async (err, hash) => {
    let username = await generateUserName(email);

    let user = new User({
      personal_info: {
        fullname,
        email,
        password: hash,
        username,
      },
    });

    user
      .save()
      .then((u) => {
        return res.status(200).json(formatDatatoSend(u));
      })
      .catch((err) => {
        if (err.code == 11000) {
          return res.status(500).json({ error: "Email already exists" });
        }

        return res.status(500).json({ error: err.massage });
      });
  });

  //   return res.status(200).json({ status: "success" });
});

export default router;
