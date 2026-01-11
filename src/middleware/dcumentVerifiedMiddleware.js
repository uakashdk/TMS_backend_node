import { Document } from "../modals/index.js";
import { DOCUMENT_STATUS } from "../constant/documentStatus.js";

const blockVerifiedDocument = async (req, res, next) => {
  try {
    const documentId = req.params.documentId;

    const document = await Document.findByPk(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }
    if (
      document.status === DOCUMENT_STATUS.VERIFIED &&
      req.user.roleId !== ROLES.SUPER_ADMIN
    ) {
      return res.status(403).json({
        success: false,
        message: "Verified document cannot be modified",
      });
    }
    req.document = document;
    next();

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Document validation failed",
    });
  }
};

export default blockVerifiedDocument;
