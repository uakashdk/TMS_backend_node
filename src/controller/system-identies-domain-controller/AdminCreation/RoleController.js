
import { sequelize } from "../../../Config/Db.js";
import { Roles, RolePermissions, Permissions } from "../../../modals/index.js";
import { Op } from "sequelize";

export const createRole = async (req, res) => {
  try {
    const { name, description } = req.body;
    const company_id = req.user.companyId;

    // Normalize name (avoid case issues like Admin vs admin)
    const normalizedName = name.trim().toLowerCase();

    // 1️⃣ Check if role exists (active or inactive)
    const existingRole = await Roles.findOne({
      where: {
        company_id,
        name: normalizedName
      }
    });

    // 2️⃣ If role exists and is ACTIVE → throw error
    if (existingRole && existingRole.isActive === "Y") {
      return res.status(400).json({
        success: false,
        message: "Role already exists for this company"
      });
    }

    // 3️⃣ If role exists but INACTIVE → reactivate it
    if (existingRole && existingRole.isActive === "N") {
      existingRole.description = description;
      existingRole.isActive = "Y";
      await existingRole.save();

      return res.status(200).json({
        success: true,
        message: "Role reactivated successfully",
        data: existingRole
      });
    }

    // 4️⃣ Create new role
    const role = await Roles.create({
      name: normalizedName,
      description,
      company_id,
      isActive: "Y"
    });

    return res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: role
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllRoles = async (req, res) => {
  try {
    const company_id = req.user.companyId;

    const roles = await Roles.findAll({
      where: { company_id, isActive: "Y" },
      attributes: ["id", "name", "description"],
      order: [["created_at", "DESC"]]
    });

    return res.status(200).json({
      success: true,
      message: roles.length ? "Roles retrieved successfully" : "No roles found",
      data: roles
    });

  } catch (error) {
    console.log("error=======>", error)
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const DeleteRole = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const company_id = req.user.companyId;

    const role = await Roles.findOne({
      where: { id },
      transaction: t
    });

    if (!role || role.isActive === "N") {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Role not found"
      });
    }

    // 1️⃣ Soft delete role
    role.isActive = "N";
    await role.save({ transaction: t });

    // 2️⃣ Delete role-Permissions mappings
    await RolePermissions.destroy({
      where: { role_id: id },
      transaction: t
    });

    await t.commit();

    return res.status(200).json({
      success: true,
      message: "Role deleted successfully"
    });

  } catch (error) {
    await t.rollback();
    console.log("error=====>", error)

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permissions.findAll({
      attributes: ["id", "name", "description", "module_name", "action"],
      order: [["module_name", "ASC"], ["action", "ASC"]]
    });

    // Group by module
    const groupedPermissions = {};

    permissions.forEach((perm) => {
      if (!groupedPermissions[perm.module_name]) {
        groupedPermissions[perm.module_name] = [];
      }

      groupedPermissions[perm.module_name].push({
        id: perm.id,
        name: perm.name,
        action: perm.action,
        description: perm.description
      });
    });

    return res.status(200).json({
      success: true,
      message: permissions.length
        ? "Permissions retrieved successfully"
        : "No permissions found",
      data: groupedPermissions
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const assignPermissionsToRole = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { role_id, permission_ids } = req.body;
    const company_id = req.user.companyId;

    // 1️⃣ Validate Role
    const role = await Roles.findOne({
      where: {
        id: role_id,
        company_id,
        isActive: "Y"
      },
      transaction: t
    });

    if (!role) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Role not found"
      });
    }

    // 2️⃣ Validate permissions exist (optional but recommended)
    const validPermissions = await Permissions.findAll({
      where: {
        id: permission_ids
      },
      attributes: ["id"],
      transaction: t
    });

    const validPermissionIds = validPermissions.map(p => p.id);

    // 3️⃣ Remove old mappings
    await RolePermissions.destroy({
      where: { role_id },
      transaction: t
    });

    // 4️⃣ Insert new mappings
    const newMappings = validPermissionIds.map(permission_id => ({
      role_id,
      permission_id
    }));

    if (newMappings.length > 0) {
      await RolePermissions.bulkCreate(newMappings, {
        transaction: t
      });
    }

    await t.commit();

    return res.status(200).json({
      success: true,
      message: "Permissions assigned successfully"
    });

  } catch (error) {
    await t.rollback();
    console.log("error=========>", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const getRoleDetailsById = async (req, res) => {
  try {
    const { id } = req.params;
    const company_id = req.user.companyId;
    // 1️⃣ Fetch role details
    const role = await Roles.findOne({
      where: {
        id,
        company_id,
        isActive: "Y"
      },
      attributes: ["id", "name", "description"]
    });
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found"
      });
    }

    // 2️⃣ Fetch assigned permissions
    const assignedPermissions = await RolePermissions.findAll({
      where: { role_id: id },
      include: {
        model: Permissions,
        as: "permission", // 🔥 IMPORTANT
        attributes: ["id", "name", "description", "module_name", "action"]
      }
    });
    const permissions = assignedPermissions.map(rp => rp.permission.id);
    return res.status(200).json({
      success: true,
      message: "Role details retrieved successfully",
      data: {
        id: role.id,
        name: role.name,
        description: role.description,
        permissions
      }
    });
  } catch (error) {
    console.log("error=====>", error)
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const updateRoleWithPermissions = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { name, description, permission_ids } = req.body;
    const company_id = req.user.companyId;

    // ✅ 1. Validate input
    if (!id) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Role id is required"
      });
    }

    if (!name || !name.trim()) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Role name is required"
      });
    }

    if (!Array.isArray(permission_ids)) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "permission_ids must be an array"
      });
    }

    const normalizedName = name.trim().toLowerCase();

    // ✅ 2. Find role
    const role = await Roles.findOne({
      where: {
        id,
        company_id,
        isActive: "Y"
      },
      transaction: t
    });

    if (!role) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Role not found"
      });
    }

    // ✅ 3. Check duplicate role name
    const existingRole = await Roles.findOne({
      where: {
        company_id,
        name: normalizedName,
        isActive: "Y",
        id: { [Op.ne]: id }   // IMPORTANT: import Op
      },
      transaction: t
    });

    if (existingRole) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Another role with same name already exists"
      });
    }

    // ✅ 4. Update role details
    role.name = normalizedName;
    role.description = description;
    await role.save({ transaction: t });

    // ✅ 5. Validate permissions (optional but recommended)
    let validPermissionIds = [];

    if (permission_ids.length > 0) {
      const validPermissions = await Permissions.findAll({
        where: { id: permission_ids },
        attributes: ["id"],
        transaction: t
      });

      validPermissionIds = validPermissions.map(p => p.id);
    }

    // ✅ 6. Remove old permissions
    await RolePermissions.destroy({
      where: { role_id: id },
      transaction: t
    });

    // ✅ 7. Insert new permissions
    if (validPermissionIds.length > 0) {
      const newMappings = validPermissionIds.map(permission_id => ({
        role_id: id,
        permission_id
      }));

      await RolePermissions.bulkCreate(newMappings, {
        transaction: t
      });
    }

    // ✅ 8. Commit transaction
    await t.commit();

    return res.status(200).json({
      success: true,
      message: "Role and permissions updated successfully"
    });

  } catch (error) {
    await t.rollback();
    console.log("error=========>", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



