import express from "express";
import verifyAccessToken from "../../../middleware/verifyAccessToken.js";
import requireRole from "../../../middleware/requireRole.js";
import validateRequest from "../../../middleware/validationRequest.js";
import {createPartySchema,updatePartySchema} from "../../../validation/operational-domain-validation/party-module/partyControllerValidation.js"
import {ROLES} from "../../../constant/roles.js";
import {createParty,getParties,getPartyById,updateParty,deleteParty, getPartyDropdown} from "../../../controller/operational-domain-controller/party-Module/partyController.js"

const router = express.Router();


router.post(
  "/create-parties",
  verifyAccessToken,
  requireRole([ROLES.COMPANY_ADMIN, ROLES.OPERATIONAL_MANAGER]),
  validateRequest(createPartySchema),
  createParty
);

router.get("/get-all-parties",verifyAccessToken,getParties)

router.get("/get-parties-By-Id/:partyId",verifyAccessToken,getPartyById)

router.put(
  "/update-party/:id",
  verifyAccessToken,
  requireRole([ROLES.COMPANY_ADMIN, ROLES.OPERATIONAL_MANAGER]),
  validateRequest(updatePartySchema),
  updateParty
);

router.delete(
  "/delete-parties/:id",
  verifyAccessToken,
  requireRole([ROLES.COMPANY_ADMIN, ROLES.OPERATIONAL_MANAGER]),
  deleteParty
);

router.get("/parties/dropdown", verifyAccessToken, getPartyDropdown);



export default router;