import express from "express";
import {createVehicles,getAllVehicles,getVehiclesDetailsById,UpdateVehicleById} from "../../../controller/operational-domain-controller/vehicle-Module/VehicleController.js"
import verifyAccessToken from "../../../middleware/verifyAccessToken.js"
import validateRequest from "../../../middleware/validationRequest.js";
import requireRole from "../../../middleware/requireRole.js";
import { ROLES } from "../../../constant/roles.js";
import {createVehicleSchema,updateVehicleSchema} from "../../../validation/operational-domain-validation/vehicle-module/VehicleValidation.js"
const router = express.Router();

router.post("/create-vehicles",verifyAccessToken,requireRole([ROLES.COMPANY_ADMIN,ROLES.OPERATIONAL_MANAGER]),validateRequest(createVehicleSchema),createVehicles);

router.get("/get-allVehicles",verifyAccessToken,getAllVehicles);

router.get("/get-vehicleDetailsById/:id",verifyAccessToken,requireRole([ROLES.COMPANY_ADMIN,ROLES.OPERATIONAL_MANAGER]),getVehiclesDetailsById)

router.put("/update-vehicleById/:id",verifyAccessToken,requireRole([ROLES.COMPANY_ADMIN,ROLES.OPERATIONAL_MANAGER]),validateRequest(updateVehicleSchema),UpdateVehicleById)

export default router;