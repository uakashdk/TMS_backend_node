import express from "express";
import {createRateContract, getAllRateContracts, deactivateRateContract, getRateContractById} from "../../../controller/finance-domain-controller/rate-contract-module/RateContractController.js";
import verifyAccessToken from "../../../middleware/verifyAccessToken.js";
import {ROLES} from "../../../constant/roles.js";
import requireRole from "../../../middleware/requireRole.js";
import validateRequest from "../../../middleware/validationRequest.js";
import {createRateContractSchema} from "../../../validation/finance-domain-validation/rate-contract-module/RateContractValidation.js"

const router = express.Router();


router.post("/create-rate-contract",verifyAccessToken,requireRole([ROLES.ACCOUNTS_MANAGER,ROLES.COMPANY_ADMIN]),validateRequest(createRateContractSchema),createRateContract);

router.get("/get-all-rateContract",verifyAccessToken,requireRole([ROLES.COMPANY_ADMIN,ROLES.ACCOUNTS_MANAGER,ROLES.OPERATIONAL_MANAGER]),getAllRateContracts);

router.put("/deactivate-rate-contract/:id",verifyAccessToken,requireRole([ROLES.COMPANY_ADMIN,ROLES.ACCOUNTS_MANAGER]),deactivateRateContract);

router.get("/getRateContractById/:id",verifyAccessToken,requireRole([ROLES.COMPANY_ADMIN,ROLES.ACCOUNTS_MANAGER]),getRateContractById);

export default router;