import express from "express";
import {createPartyAdvanceJobSchema, adjustPartyAdvanceValidation} from "../../../validation/operational-domain-validation/Party-Advance-module/partyAdvaceValidation.js";
import {createPartyAdvance, getAllPartyAdvances, getPartyAdvanceLedger, adjustPartyAdvance} from "../../../controller/operational-domain-controller/Party-Advance/partyAdvanceController.js";
import VerifyAccessToken from "../../../middleware/verifyAccessToken.js";
import requireRole from "../../../middleware/requireRole.js";
import { ROLES } from "../../../constant/roles.js";
import validateRequest from "../../../middleware/validationRequest.js"
import verifyAccessToken from "../../../middleware/verifyAccessToken.js";

const router = express.Router();

router.post("/create-party-advance",VerifyAccessToken,requireRole([ROLES.OPERATIONAL_MANAGER,ROLES.ACCOUNTS_MANAGER,ROLES.COMPANY_ADMIN]),validateRequest(createPartyAdvanceJobSchema),createPartyAdvance);

router.get("/get-all-party-advance",verifyAccessToken,requireRole([ROLES.OPERATIONAL_MANAGER,ROLES.ACCOUNTS_MANAGER,ROLES.COMPANY_ADMIN]),getAllPartyAdvances)

router.get("/getPartyAdvance-adjustment/:party_id",verifyAccessToken,requireRole([ROLES.COMPANY_ADMIN,ROLES.ACCOUNTS_MANAGER]),getPartyAdvanceLedger);

router.post("/get-party-advance-ledger",verifyAccessToken,requireRole([ROLES.ACCOUNTS_MANAGER,ROLES.COMPANY_ADMIN]), validateRequest(adjustPartyAdvanceValidation),adjustPartyAdvance)


export default router;