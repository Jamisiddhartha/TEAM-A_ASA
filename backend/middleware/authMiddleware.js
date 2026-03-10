import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(403).json({ message: "No token provided, authorization denied" });
  }

  // usually in format "Bearer <token>"
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: "Malformed token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, "6Lc20X8sAAAAAOjt5oDFxYY31qLAVjN8e3JofLOy");
    req.user = decoded; // add user id to req
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};
