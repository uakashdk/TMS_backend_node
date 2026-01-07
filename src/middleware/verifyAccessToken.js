import jwt from "jsonwebtoken";

const verifyAccessToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access token missing or invalid",
      });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded; 
    // { userId, role, permissions, iat, exp }
    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired access token",
    });
  }
};

export default verifyAccessToken;
