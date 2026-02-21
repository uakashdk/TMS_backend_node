import express from "express";
import verifyAccessToken from "../../middleware/AuthMiddleware.js";
import requireRole from "../../middleware/requireRole.js";
import { ROLES } from "../../constant/roles.js";
import { uploadDocument,verifyDocument,documentStatusVerification } from "../../controller/system-identies-domain-controller/documentController.js";
import upload from "../../middleware/uploadMiddleware.js"; // multer config
import multerErrorHandler from "../../middleware/multerErrorHandler.js";
import requireSuperAdmin from "../../middleware/requireSuperAdmin.js";
import { requirePermission } from "../../middleware/requirePermission.js";
import { Permission } from "../../constant/Permission.js";
const router = express.Router();
router.post(
  "/upload",
  verifyAccessToken,
   requirePermission(Permission.DOCUMENT.UploadDOCS),
  upload.single("document"),
  multerErrorHandler,
  uploadDocument
);

router.patch(
  "/verify/:documentId",
  verifyAccessToken,
  requireRole([ROLES.SUPER_ADMIN]),
  requirePermission(Permission.DOCUMENT.VerifyDocs),
  verifyDocument
);
 
router.post("/documentStatus/:documentId",verifyAccessToken,requireSuperAdmin,requirePermission(Permission.DOCUMENT.DocumentStatus),documentStatusVerification)

router.post("/documentUsers/:documentId",verifyAccessToken,documentStatusVerification)


export default router;
