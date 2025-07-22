const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).send({
        success: false,
        message: "Authorization header missing",
      });
    }
    const token = authHeader.split(" ")[1];
    const decryptedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decryptedToken.userId; 
    next();
  } catch (error) {
    res.status(401).send({
      success: false,
      message: error.message,
    });
  }
};