import {Companies} from "../../../modals/index.js";
import { Op } from "sequelize";
import {Document} from "../../../modals/index.js";

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

    const whereCondition = {};

    // 🔍 Search (name / email / code)
    if (search) {
      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { company_email: { [Op.like]: `%${search}%` } },
        { company_code: { [Op.like]: `%${search}%` } },
      ];
    }

    // ✅ Status filter
    if (status) {
      whereCondition.status = status;
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
  try {
    const { companyId, documentId } = req.params;

    // 🔒 Only SUPER_ADMIN
    // if (req.user.role !== "SUPER_ADMIN") {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Access denied",
    //   });
    // }

    const document = await Document.findOne({
      where: {
        id: documentId,
        entity_type: "COMPANY",
        entity_id: companyId,
      },
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
    await document.update({
      status: "VERIFIED",
      verified_by: req.user.id,
      verified_at: new Date(),
    });

    // 🔗 Attach verified document to company
    await Company.update(
      { document_id: document.id },
      { where: { id: companyId } }
    );

    return res.status(200).json({
      success: true,
      message: "Document verified successfully",
      data: document,
    });
  } catch (error) {
    console.error("Verify Document Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
