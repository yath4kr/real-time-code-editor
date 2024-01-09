import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/Users.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, password, email } = req.body;
  const user = await UserModel.findOne({ username });
  if (user) {
    return res.json({ message: "User already exists" });
  }
  const hashed = await bcrypt.hash(password, 10);
  const newUser = new UserModel({
    username,
    password: hashed,
    email,
    score: 0,
    total: 0,
  });
  await newUser.save();
  res.send(email);
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await UserModel.findOne({ username });
    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(404).send({ msg: "Password not matched..!!" });
      } else {
        const token = await jwt.sign({ id: user._id }, "secret");
        res.send({ token, userid: user._id });
      }
    } else {
      console.log(`${username} not found`);
      res.status(404).send({ msg: "user not found" });
    }
  } catch (err) {
    res.status(404).send({ error: "not good" });
  }
});

router.get("/fetch/:uid", async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.uid);
    res.json({ details: user });
  } catch (err) {
    res.json(err);
  }
});

router.post("/update", async (req, res) => {
  try {
    const { userID, score } = req.body;
    const newScore = score;
    const user = await UserModel.findById(userID);
    await UserModel.findByIdAndUpdate(userID, {
      score: user.score + newScore,
      total: user.total + 1,
    });
    res.json({ message: "Updated" });
  } catch (err) {
    res.json({ message: err });
  }
});

export { router as userRouter };
