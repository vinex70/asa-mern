import express from "express";

const router = express.Router();

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

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

  return res.status(200).json({ status: "success" });
});

export default router;
