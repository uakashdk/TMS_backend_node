import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sequelize } from "../../Config/Db.js";
import { QueryTypes } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admins = await sequelize.query(
      `SELECT 
        a.id,
        a.username,
        a.email,
        a.password,
        a.role_id,
        a.company_id,
        r.name AS role
      FROM admins a
      JOIN roles r ON r.id = a.role_id
      WHERE a.email = ?`,
      {
        replacements: [email],
        type: QueryTypes.SELECT,
      }
    );

    if (!admins.length) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const admin = admins[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const permissions = await sequelize.query(
      `SELECT p.name
       FROM role_permission_mappings pm
       JOIN permissions p ON p.id = pm.permission_id
       WHERE pm.role_id = ?`,
      {
        replacements: [admin.role_id],
        type: QueryTypes.SELECT,
      }
    );

    const permissionList = permissions.map(p => p.name);

    // ✅ ACCESS TOKEN
    const accessToken = jwt.sign(
      {
        userId: admin.id,
        roleId: admin.role_id,
        companyId: admin.company_id || null,
        permissions: permissionList,   // 🔥 Added here
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );


    // ✅ REFRESH TOKEN
    const refreshToken = jwt.sign(
      { userId: admin.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // true in production (HTTPS)
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: permissionList,
        companyId: admin.company_id,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



export const logoutAdmin = async (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res.status(200).json({
      message: "Logout successful",
    });

  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    // ✅ VERIFY REFRESH TOKEN
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const admins = await sequelize.query(
      `SELECT 
        a.id,
        a.username,
        a.email,
        a.role_id,
        a.company_id,
        r.name AS role
      FROM admins a
      JOIN roles r ON r.id = a.role_id
      WHERE a.id = ?`,
      {
        replacements: [decoded.userId], // ✅ MATCH PAYLOAD
        type: QueryTypes.SELECT,
      }
    );

    if (!admins.length) {
      return res.status(401).json({ message: "User not found" });
    }

    const admin = admins[0];

    const permissions = await sequelize.query(
      `SELECT p.name
       FROM role_permission_mappings pm
       JOIN permissions p ON p.id = pm.permission_id
       WHERE pm.role_id = ?`,
      {
        replacements: [admin.role_id],
        type: QueryTypes.SELECT,
      }
    );

    const permissionList = permissions.map(p => p.name);

    // ✅ NEW ACCESS TOKEN
    const newAccessToken = jwt.sign(
      {
        userId: admin.id,
        roleId: admin.role_id,
        companyId: admin.company_id || null,
        permissions:permissionList
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    return res.status(200).json({
      accessToken: newAccessToken,
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: permissionList,
      },
    });

  } catch (error) {
    console.error("Refresh token error:", error.message);
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

