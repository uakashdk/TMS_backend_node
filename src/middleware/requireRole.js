const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roleId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!allowedRoles.includes(req.user.roleId)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have access to this resource",
      });
    }

    next();
  };
};

export default requireRole;
