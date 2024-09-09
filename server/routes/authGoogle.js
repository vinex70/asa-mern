import express from "express";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import admin from "firebase-admin";
// import serviceAccountKey from "../auth-asa-firebase-adminsdk-60lxc-8bcebd68a0.js";
import serviceAccountKey from "../auth-asa-firebase-adminsdk-60lxc-8bcebd68a0.json" assert { type: "json" };
import { getAuth } from "firebase-admin/auth";
import generateUserName from "../service/generate-username.js";

//Schemas
import User from "../Schema/User.js";

const router = express.Router();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

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

router.post("/google-auth", async (req, res) => {
  let { access_token } = req.body;

  getAuth()
    .verifyIdToken(access_token)
    .then(async (decodedUser) => {
      let { email, name, picture } = decodedUser;

      picture = picture.replace("s96-c", "s384-c");

      let user = await User.findOne({ "personal_info.email": email })
        .select(
          "personal_info.fullname personal_info.username personal_info.profile_img google_auth"
        )
        .then((u) => {
          return u || null;
        })
        .catch((err) => {
          return res.status(500).json({ error: err.massage });
        });

      if (user) {
        // login
        if (!user.google_auth) {
          return res.status(403).json({
            error:
              "This email was signed Up without google. please log in with password to access your account",
          });
        } else {
          // sign up
          let username = await generateUserName(email);

          user = new User({
            personal_info: {
              fullname: name,
              email,
              profile_img: picture,
              username,
            },
            google_auth: true,
          });

          await user
            .save()
            .then((u) => {
              user = u;
            })
            .catch((err) => {
              return res.status(500).json({ error: err.massage });
            });
        }

        return res.status(200).json(formatDatatoSend(user));
      }
    })
    .catch((err) => {
      return res.status(500).json({
        error:
          "Failed to authenticate you with google, Try with some other google account",
      });
    });
});

export default router;
