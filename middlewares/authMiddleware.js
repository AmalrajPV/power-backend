import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token)
    return res.status(400).json({ message: "you are not authenticated" });
  jwt.verify(token, process.env.SECRET, (err, user) => {
    if (err) return res.status(400).json({ message: "invalid token" });
    req.user = user;
    next();
  });
};
