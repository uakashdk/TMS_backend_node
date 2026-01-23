import bcrypt from "bcrypt";
import { Admins } from "../../../modals/index.js";
import { ROLES, ROLE_NAME_MAP } from "../../../constant/roles.js";
import { Op } from "sequelize";
import dotenv from "dotenv"
import { Document } from "../../../modals/index.js";

dotenv.config();

export const userCreation = async (req, res) => {
  try {
    const loggedInUser = req.user;

    console.log("loggedin user is ===========>",loggedInUser);

    // 🔒 STRICT AUTHORIZATION: ONLY COMPANY ADMIN
    if (!loggedInUser || loggedInUser.roleId !== ROLES.COMPANY_ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Only Company Admin can create users",
      });
    }

    const { name, email, phone, password, role } = req.body;

    // 🔒 BASIC VALIDATION
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // 🔒 ROLE RESTRICTION (Company Admin cannot create higher roles)
    const allowedRolesToCreate = [
      ROLES.ACCOUNTS_MANAGER,
      ROLES.OPERATIONAL_MANAGER,
      ROLES.SUPPORT_MANAGER,
      ROLES.DRIVER,
    ];

    if (!allowedRolesToCreate.includes(role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to assign this role",
      });
    }

    const companyId = loggedInUser.companyId;

    // ✅ Check duplicate user inside same company
    const existingUser = await Admins.findOne({
      where: { email, company_id: companyId },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists in this company",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await Admins.create({
      username: name,
      email,
      password: hashedPassword,
      role_id: role,
      phone: phone || null,
      company_id: companyId,
      created_by: loggedInUser.id,
      status: true,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        id: admin.id,
        name: admin.username,
        email: admin.email,
        role_id: admin.role_id,
        phone: admin.phone,
        company_id: admin.company_id,
      },
    });

  } catch (error) {
    console.log("User Creation Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};



export const getAssignableRoles = (req, res) => {
  const loggedInUser = req.user;

  // 🔒 Only Company Admin can access
  if (!loggedInUser || loggedInUser.roleId !== ROLES.COMPANY_ADMIN) {
    return res.status(403).json({
      success: false,
      message: "Only Company Admin can fetch assignable roles",
    });
  }

  // ✅ Roles Company Admin can create
  const roles = [
    { id: ROLES.OPERATIONAL_MANAGER, name: "Operational Manager" },
    { id: ROLES.ACCOUNTS_MANAGER, name: "Accounts Manager" },
    { id: ROLES.SUPPORT_MANAGER, name: "Support Manager" },
    { id: ROLES.DRIVER, name: "Driver" },
  ];

  return res.status(200).json({
    success: true,
    data: roles,
  });
};



export const getAllUsers = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const search = req.query.search || "";

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const allowedRoles = [
      ROLES.OPERATIONAL_MANAGER,
      ROLES.ACCOUNTS_MANAGER,
      ROLES.SUPPORT_MANAGER,
      ROLES.DRIVER,
    ];

    const whereCondition = {
      company_id: companyId,
      role_id: {
        [Op.in]: allowedRoles,   // ✅ IMPORTANT FIX
      },
    };

    if (search) {
      whereCondition.username = {
        [Op.like]: `%${search}%`,
      };
    }

    const { rows, count } = await Admins.findAndCountAll({
      where: whereCondition,
      attributes: ["id", "username", "email", "phone", "role_id", "status"],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      distinct: true,           // ✅ PREVENT DUPLICATE ROW COUNT
    });

    const formattedUsers = rows.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      status: user.status,
      role: {
        id: user.role_id,
        name: ROLE_NAME_MAP[user.role_id] || "Unknown",
      },
    }));

    return res.status(200).json({
      success: true,
      data: formattedUsers,
      pagination: {
        totalRecords: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        pageSize: limit,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const getUserDetailsById = async (req, res) => {
  try {
    const { userId } = req.params;
    const loggedInUser = req.user;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await Admins.findOne({
      where: {
        id: userId,
        company_id: loggedInUser.companyId,
      },
      attributes: [
        "id",
        "username",
        "email",
        "phone",
        "role_id",
        "status",
        "createdAt",
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found in your company",
      });
    }

        const documents = await Document.findAll({
          where: {
            entity_id: userId,
            entity_type: "User",
          },
          attributes: [
            "id",
            "entity_type",
            "document_group",
            "document_type",
            "file_url",
            "content",
            "status",
          ],
        });

         const URL = process.env.local_URL;

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
      documents,
      api:URL
    });

  } catch (error) {
    console.error("getUserDetailsById error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};



export const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const companyId = req.user.companyId;

    const user = await Admins.findOne({
      where: {
        id: userId,
        company_id: companyId,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found in your company",
      });
    }

    // 🔒 Allowed roles only
    const ALLOWED_ROLES = [
      ROLES.OPERATIONAL_MANAGER,
      ROLES.ACCOUNTS_MANAGER,
      ROLES.SUPPORT_MANAGER,
    ];

    if (!ALLOWED_ROLES.includes(user.role_id)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this user",
      });
    }

    const { name, email, phone, status } = req.body;

    await user.update({
      name,
      email,
      phone,
      status,
    });

    return res.status(200).json({
      success: true,
      message: "User profile updated successfully",
    });

  } catch (error) {
    console.error("updateUserProfile error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



