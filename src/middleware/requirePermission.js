export const requirePermission = (permissionKey) => {
  return (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const userPermissions = user.permissions || [];

      // ✅ Super Admin Bypass (Optional but recommended)
      if (user.role === "super_admin") {
        return next();
      }

      // ✅ Permission Check
      if (!userPermissions.includes(permissionKey)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You do not have this permission",
        });
      }

      next();
    } catch (error) {
      console.error("Permission Middleware Error:", error);
      return res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  };
};
