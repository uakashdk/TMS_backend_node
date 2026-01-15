import express from "express";
import { createCompany,getAllCompanies,verifyCompanyDocument, getMyCompany, getCompanyDetailsById,statusVerification,deleteCompanyById } from "../../controller/system-identies-domain-controller/company-module/companyController.js";
import verifyAccessToken from "../../middleware/AuthMiddleware.js";
import requireSuperAdmin from "../../middleware/requireSuperAdmin.js";
import {createCompanySchema} from "../../validation/system-identites-domain-validation/companiesValidation.js"
import validateRequest from "../../middleware/validationRequest.js";
import requireComapnyAdmin from "../../middleware/requireComapnyAdmin.js";

const router = express.Router();

router.post(
  "/add-new-companies",
  verifyAccessToken,
  requireSuperAdmin,
  validateRequest(createCompanySchema),
  createCompany
);


 router.get("/get-all-companies",verifyAccessToken,requireSuperAdmin,getAllCompanies);

 router.patch(
  "/:companyId/documents/:documentId/verify",
  verifyAccessToken,
  verifyCompanyDocument
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