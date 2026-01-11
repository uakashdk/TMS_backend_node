import { Document } from "../../modals/index.js";
import { ROLES } from "../../constant/roles.js";
import { DOCUMENT_STATUS } from "../../constant/documentStatus.js";

export const uploadDocument = async (req, res) => {
  try {
    // 1️⃣ File required
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Document file is required",
      });
    }

    const {
      entity_type,
      entity_id,
      document_group,
      document_type,
      content,
      parent_id,
    } = req.body;

    // 2️⃣ Decide verification status BASED ON ROLE
    let documentStatus = DOCUMENT_STATUS.PENDING;

    if (req.user.roleId === ROLES.SUPER_ADMIN) {
      documentStatus = DOCUMENT_STATUS.VERIFIED;
    }

    if (![ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN].includes(req.user.roleId)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to upload documents",
      });
    }

    // 3️⃣ Create document
    const document = await Document.create({
      parent_id: parent_id || null,
      entity_type,
      entity_id,
      document_group,
      document_type,
      file_url: `/uploads/documents/${req.file.filename}`,
      file_format: req.file.mimetype,
      content,
      status: documentStatus,
      created_by: req.user.userId,
      verified_by:
        documentStatus === DOCUMENT_STATUS.VERIFIED
          ? req.user.userId
          : null,
      verified_at:
        documentStatus === DOCUMENT_STATUS.VERIFIED
          ? new Date()
          : null,
    });

    return res.status(201).json({
      success: true,
      message:
        documentStatus === DOCUMENT_STATUS.VERIFIED
          ? "Document uploaded and verified"
          : "Document uploaded and pending verification",
      data: document,
    });

  } catch (error) {
    console.error("Upload Document Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const verifyDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findByPk(documentId);

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

    await document.update({
      status: "VERIFIED",
      verified_by: req.user.userId,
      verified_at: new Date(),
      updated_by: req.user.userId,
    });

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

