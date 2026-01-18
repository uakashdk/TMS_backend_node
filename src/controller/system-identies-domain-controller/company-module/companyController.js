import { Admins, Companies } from "../../../modals/index.js";
import { Op, where } from "sequelize";
import { Document } from "../../../modals/index.js";
import { ROLES } from "../../../constant/roles.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { sequelize } from "../../../Config/Db.js";
import { response } from "express";
dotenv.config();

export const createCompany = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      name,
      address,
      company_code,
      company_email,
      contact_person,
      status,
      Adminname,
      Adminemail,
      Adminphone,
      Adminpassword,
    } = req.body;

    // 🔒 HARD VALIDATION (admin is mandatory)
    if (!Adminname || !Adminemail || !Adminpassword) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Company admin details are required",
      });
    }

    // ✅ Check company uniqueness
    const existingCompany = await Companies.findOne({
      where: { company_email },
      transaction,
    });

    if (existingCompany) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: "Company with this email already exists",
      });
    }

    // ✅ Check admin uniqueness BEFORE company creation
    const existingAdmin = await Admins.findOne({
      where: { email: Adminemail },
      transaction,
    });

    if (existingAdmin) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: "Admin with this email already exists",
      });
    }

    // ✅ Create company
    const company = await Companies.create(
      {
        name,
        address,
        company_code,
        company_email,
        contact_person,
        status,
      },
      { transaction }
    );

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(Adminpassword, 12);

    // ✅ Create company admin (MANDATORY)
    const admin = await Admins.create(
      {
        username: Adminname,
        email: Adminemail,
        password: hashedPassword,
        phone: Adminphone,
        role_id: ROLES.COMPANY_ADMIN, // 🔒 constant
        company_id: company.id,
        status,
      },
      { transaction }
    );

    // ✅ Commit ONLY when BOTH succeed
    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Company and company admin created successfully",
      data: {
        company,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
        },
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Create Company Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



export const getAllCompanies = async (req, res) => {
  try {
    // ✅ Pagination (safe defaults)
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const offset = (page - 1) * limit;

    // ✅ Filters
    const { search, status } = req.query;

    const whereCondition = {
      is_active: "Y", // ✅ ALWAYS fetch only active companies
    };

    // 🔍 Search (name / email / code)
    if (search) {
      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { company_email: { [Op.like]: `%${search}%` } },
        { company_code: { [Op.like]: `%${search}%` } },
      ];
    }

    // ✅ Status filter (boolean)
    if (status !== undefined) {
      whereCondition.status = status === "true";
    }

    const { rows: companies, count } = await Companies.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [["created_at", "DESC"]],
      attributes: [
        "id",
        "name",
        "company_code",
        "company_email",
        "contact_person",
        "status",
        "created_at",
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Companies fetched successfully",
      data: companies,
      pagination: {
        totalRecords: count,
        currentPage: page,
        pageSize: limit,
        totalPages: Math.ceil(count / limit),
      },
    });

  } catch (error) {
    console.error("Get All Companies Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



export const updateEntityDocumentProfile = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { entityType, entityId, documentId } = req.params;
    const payload = req.body;

    // 1️⃣ Validate params
    if (!entityType || !entityId || !documentId) {
      return res.status(400).json({
        success: false,
        message: "Entity type, entity ID, and document ID are required",
      });
    }

    // 2️⃣ Resolve model dynamically
    let EntityModel;

    switch (entityType) {
      case "COMPANY":
        EntityModel = Companies;
        break;

      case "COMPANY_ADMIN":
        EntityModel = CompanyAdmins;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid entity type",
        });
    }

    // 3️⃣ Check entity exists
    const entity = await EntityModel.findByPk(entityId, { transaction });
    if (!entity) {
      return res.status(404).json({
        success: false,
        message: `${entityType} not found`,
      });
    }

    // 4️⃣ Check document exists (NO STATUS CHANGE)
    const document = await Document.findOne({
      where: {
        id: documentId,
        entity_type: entityType,
        entity_id: entityId,
      },
      transaction,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // 5️⃣ Prepare update payload
    const updatePayload = {
      document_id: document.id, // mapping only
    };

    // Company fields
    if (payload.address) updatePayload.address = payload.address;
    if (payload.contactPerson)
      updatePayload.contact_person = payload.contactPerson;

    // Admin fields
    if (payload.fullName) updatePayload.full_name = payload.fullName;
    if (payload.mobile) updatePayload.mobile = payload.mobile;

    // 6️⃣ Update entity (STATUS REMAINS PENDING)
    await entity.update(updatePayload, { transaction });

    // 7️⃣ Commit
    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        entityType,
        entityId,
        documentId: document.id,
        entityStatus: "PENDING",
        documentStatus: "PENDING",
      },
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Update Entity Document Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};





export const getMyCompany = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID not found for this user",
      });
    }

    const company = await Companies.findOne({
      where: {
  id: companyId,
  is_active: "Y",
},

      attributes: [
        "id",
        "name",
        "address",
        "company_code",
        "company_email",
        "contact_person",
        "status",
        "created_at",
        "updated_at",
      ],
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Company fetched successfully",
      data: [company],
    });

  } catch (error) {
    console.error("Get My Company Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const getCompanyDetailsById = async (req, res) => {
  try {
    const { companyId } = req.params;
    const loggedInUser = req.user;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID is required",
      });
    }

    if (
      loggedInUser.roleId === ROLES.COMPANY_ADMIN &&
      Number(loggedInUser.companyId) !== Number(companyId)
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to access this company",
      });
    }

    const company = await Companies.findOne({
      where: {
        id: companyId,
        is_active: "Y",
      },
      attributes: [
        "id",
        "name",
        "address",
        "company_code",
        "company_email",
        "contact_person",
        "document_id",
        "status",
        "created_at",
        "updated_at",
      ],
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const documents = await Document.findAll({
      where: {
        entity_id: companyId,
        entity_type: "COMPANY",
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
      message: "Company details fetched successfully",
      data: company,
      documents,
      URL,
    });

  } catch (error) {
    console.error("Get Company Details By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteCompanyById = async (req, res) => {
  try {
    const { companyId } = req.params;

    // ✅ Check company existence
    const company = await Companies.findOne({
      where: { id: companyId, is_active: "Y" },
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // ✅ Soft delete
    await Companies.update(
      { is_active: "N" },
      { where: { id: companyId } }
    );

    return res.status(200).json({
      success: true,
      message: "Company deleted successfully",
    });

  } catch (error) {
    console.error("Delete Company Error:", error);
    return res.status(500).json({
      success: false,
      message: "Company could not be deleted. Try again later.",
    });
  }
};

export const statusVerification = async (req, res) => {
  try {
    const { CompanyId } = req.params;
    const { status } = req.query;

    // ✅ Validate inputs
    if (!CompanyId) {
      return res.status(400).json({
        success: false,
        message: "CompanyId is required",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    // ✅ Check company existence
    const company = await Companies.findOne({
      where: { id: CompanyId, is_active: "Y" },
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // ✅ Update status
    await Companies.update(
      { status },
      { where: { id: CompanyId, is_active: "Y" } }
    );

    return res.status(200).json({
      success: true,
      message: "Company status updated successfully",
    });

  } catch (error) {
    console.error("Status Verification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server is busy right now. Try again later.",
    });
  }
};




