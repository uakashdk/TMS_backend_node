import express from "express";
import { createCompany,getAllCompanies } from "../../controller/system-identies-domain-controller/company-module/companyController.js";
import verifyAccessToken from "../../middleware/AuthMiddleware.js";
import requireSuperAdmin from "../../middleware/requireSuperAdmin.js";
import {createCompanySchema} from "../../validation/system-identites-domain-validation/companiesValidation.js"
import validateRequest from "../../middleware/validationRequest.js"
const router = express.Router();

router.post(
  "/add-new-companies",
  verifyAccessToken,
  requireSuperAdmin,
  validateRequest(createCompanySchema),
  createCompany
);


 router.get("/get-all-companies",verifyAccessToken,requireSuperAdmin,getAllCompanies);


export default router;