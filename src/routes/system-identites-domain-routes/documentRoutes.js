import express from "express";
import verifyAccessToken from "../../middleware/AuthMiddleware.js";
import requireRole from "../../middleware/requireRole.js";
import { ROLES } from "../../constant/roles.js";
import { uploadDocument,verifyDocument } from "../../controller/system-identies-domain-controller/documentController.js";
import upload from "../../middleware/uploadMiddleware.js"; // multer config
import multerErrorHandler from "../../middleware/multerErrorHandler.js";
const router = express.Router();
router.post(
  "/upload",
  verifyAccessToken,
  requireRole([ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN]),
  upload.single("document"),
  multerErrorHandler,
  uploadDocument
);

router.patch(
  "/verify/:documentId",
  verifyAccessToken,
  requireRole([ROLES.SUPER_ADMIN]),
  verifyDocument
);


export default router;
