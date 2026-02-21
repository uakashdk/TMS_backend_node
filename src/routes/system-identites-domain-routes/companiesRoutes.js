import express from "express";
import { createCompany,getAllCompanies,updateEntityDocumentProfile, getMyCompany, getCompanyDetailsById,statusVerification,deleteCompanyById } from "../../controller/system-identies-domain-controller/company-module/companyController.js";
import verifyAccessToken from "../../middleware/AuthMiddleware.js";
import requireSuperAdmin from "../../middleware/requireSuperAdmin.js";
import {createCompanySchema} from "../../validation/system-identites-domain-validation/companiesValidation.js"
import validateRequest from "../../middleware/validationRequest.js";
import requireComapnyAdmin from "../../middleware/requireComapnyAdmin.js";
import {requirePermission} from "../../middleware/requirePermission.js";
import {Permission} from "../../constant/Permission.js"
const router = express.Router();

router.post(
  "/add-new-companies",
  verifyAccessToken,
  requirePermission(Permission.COMPANY.CREATE),
  validateRequest(createCompanySchema),
  createCompany
);


 router.get("/get-all-companies",verifyAccessToken,requirePermission(Permission.COMPANY.View),getAllCompanies);

 router.patch(
  "/:companyId/documents/:documentId/verify",
  verifyAccessToken,
  requirePermission(Permission.COMPANY.VERIFFYCOMPANYDOCS),
  updateEntityDocumentProfile
);

router.get(
  "/get-my-company",
  verifyAccessToken,
  requireComapnyAdmin,
  getMyCompany
);


router.get(
  "/company/:companyId",
  verifyAccessToken,
  getCompanyDetailsById
);

router.post("/companyStatus/:companyId",verifyAccessToken,requireSuperAdmin, statusVerification)

router.delete("/company-delete/:companyId",verifyAccessToken,requireSuperAdmin,deleteCompanyById)



export default router;