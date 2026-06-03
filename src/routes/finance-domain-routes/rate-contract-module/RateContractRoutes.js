import express from "express";
import {createRateContract, getAllRateContracts, deactivateRateContract, getRateContractById} from "../../../controller/finance-domain-controller/rate-contract-module/RateContractController.js";
import verifyAccessToken from "../../../middleware/verifyAccessToken.js";
import {ROLES} from "../../../constant/roles.js";
import requireRole from "../../../middleware/requireRole.js";
import validateRequest from "../../../middleware/validationRequest.js";
import {createRateContractSchema} from "../../../validation/finance-domain-validation/rate-contract-module/RateContractValidation.js"
import {Permission} from "../../../constant/Permission.js";
import {requirePermission} from "../../../middleware/requirePermission.js";
const router = express.Router();


router.post("/create-rate-contract",verifyAccessToken,requirePermission(Permission.RATE_CONTRACT.CreateRateContract),validateRequest(createRateContractSchema),createRateContract);

router.get("/get-all-rateContract",verifyAccessToken,requirePermission(Permission.RATE_CONTRACT.ViewRateContract),getAllRateContracts);

router.put("/deactivate-rate-contract/:id",verifyAccessToken,requirePermission(Permission.RATE_CONTRACT.DeactivateRateContract),deactivateRateContract);

router.get("/getRateContractById/:id",verifyAccessToken,requirePermission(Permission.RATE_CONTRACT.ViewRateContract),getRateContractById);

export default router;