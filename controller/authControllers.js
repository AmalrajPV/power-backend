import userModel from "../models/userModel.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const registerUser = async (req, res, next) => {
  const { email, consumerId, productId, userName, password } = req.body;
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  userModel
    .create({ email, consumerId, productId, userName, password: hash })
    .then((result) => {
      sendMail(result)
        .then((r) => res.status(200).json({ user: result, message: r }))
        .catch((e) => res.status(500).send(e));
    })
    .catch((err) => {
      res.status(400).json({ message: "User registration failed", err });
    });
};

export const verifyUser = async (req, res) => {
  const verificationToken = req.params.token;
  try {
    const decodedToken = jwt.verify(verificationToken, process.env.SECRET);

    const userId = decodedToken.userId;

    const user = await userModel.findById(userId);
    if (!user) {
      res.status(404).send("User not found. Failed to verify");
    }

    userModel.updateOne(
      { _id: userId },
      { $set: { verified: true }, $unset: { expireAt: 1 } }
    ).then((r) => {
        req.app.get("socketio").to(userId).emit("verificationSuccess");
        res.status(200).send("User verified successfully");
      })
      .catch((e) => res.status(404).send("Failed to verify"));
  } catch (error) {
    res.status(500).send("Failed to verify user");
  }
};

const sendMail = (user) => {
  return new Promise((resolve, reject) => {
    const verificationToken = jwt.sign(
      { userId: user._id },
      process.env.SECRET,
      { expiresIn: "5m" }
    );
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Power Monitor Verification",
      html: `
        <h4>Welcome to Power Monitor</h4>
        <p>Please click the button below to proceed your verification:</p>
        <a href="http://127.0.0.1:8000/api/auth/verify/${verificationToken}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">VERIFY</a>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return reject("Failed to send Verification");
      } else {
        return resolve("Verification sent successfully");
      }
    });
  });
};

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  
  try {
    const user = await userModel.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.verified) {
      return res.status(401).json({ message: "User is not verified" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET, {
      expiresIn: "1d",
    });

    return res.status(200).json({
      access_token: token,
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};

