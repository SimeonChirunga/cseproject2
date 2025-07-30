const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      displayName: user.displayName,
      email: user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

const isAuthenticated = (req, res, next) => {
  const token = req.cookies?.token || 
               req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json("You do not have access");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json("Invalid token");
  }
};

module.exports = {
  generateToken,
  isAuthenticated
};