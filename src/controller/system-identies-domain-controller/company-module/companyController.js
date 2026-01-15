import { Companies } from "../../../modals/index.js";
import { Op, where } from "sequelize";
import { Document } from "../../../modals/index.js";
import {ROLES} from "../../../constant/roles.js";
import dotenv from "dotenv";
import { sequelize } from "../../../Config/Db.js";
dotenv.config();

export const createCompany = async (req, res) => {
  try {
    // ✅ Data is already validated by Joi
    const {
      name,
      address,
      company_code,
      company_email,
      contact_person,
      // document_id,
      status,
    } = req.body;

    // ✅ Check unique email
    const existingCompany = await Companies.findOne({
      where: { company_email },
    });

    if (existingCompany) {
      return res.status(409).json({
        success: false,
        message: "Company with this email already exists",
      });
    }

    // ✅ Create company
    const company = await Companies.create({
      name,
      address,
      company_code,
      company_email,
      contact_person,
      // document_id,
      status,
    });

    return res.status(201).json({
      success: true,
      message: "Company created successfully",
      data: company,
    });

  } catch (error) {
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
      isActive: "Y", // ✅ ALWAYS fetch only active companies
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



export const verifyCompanyDocument = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { companyId, documentId } = req.params;
    const { companyAddress, contactPerson } = req.body;


    // console.log("req of user role",req.user.role)
    // // 🔐 Only SUPER_ADMIN can verify
    // if (req.user.role !== "SUPER_ADMIN") {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Access denied",
    //   });
    // }

    // ✅ Validate params
    if (!companyId || !documentId) {
      return res.status(400).json({
        success: false,
        message: "Company ID and Document ID are required",
      });
    }

    // ✅ Check company exists
    const company = await Companies.findByPk(companyId, { transaction });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // ✅ Find document
    const document = await Document.findOne({
      where: {
        id: documentId,
        entity_type: "COMPANY",
        entity_id: companyId,
      },
      transaction,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    if (document.status === "VERIFIED") {
      return res.status(400).json({
        success: false,
        message: "Document already verified",
      });
    }

    // ✅ Verify document
    await document.update(
      {
        status: "VERIFIED",
        verified_by: req.user.id,
        verified_at: new Date(),
      },
      { transaction }
    );

    // ✅ Prepare safe company update payload
    const updatePayload = {
      document_id: document.id,
      status: "VERIFIED",
    };

    if (companyAddress) updatePayload.address = companyAddress;
    if (contactPerson) updatePayload.contact_person = contactPerson;

    // ✅ Update company
    await company.update(updatePayload, { transaction });

    // ✅ Commit transaction
    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Company document verified successfully",
      data: {
        companyId: company.id,
        documentId: document.id,
        status: "VERIFIED",
      },
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Verify Company Document Error:", error);
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
      where: { id: companyId && isActive=="Y" },
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
      data: company,
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
        isActive: "Y",
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
      where: { id: companyId, isActive: "Y" },
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // ✅ Soft delete
    await Companies.update(
      { isActive: "N" },
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
      where: { id: CompanyId, isActive: "Y" },
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
      { where: { id: CompanyId, isActive: "Y" } }
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




