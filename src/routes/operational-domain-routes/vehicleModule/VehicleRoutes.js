import express from "express";
import {createVehicles,getAllVehicles,getVehiclesDetailsById,UpdateVehicleById} from "../../../controller/operational-domain-controller/vehicle-Module/VehicleController.js"
import verifyAccessToken from "../../../middleware/verifyAccessToken.js"
import validateRequest from "../../../middleware/validationRequest.js";
import requireRole from "../../../middleware/requireRole.js";
import { ROLES } from "../../../constant/roles.js";
import {createVehicleSchema,updateVehicleSchema} from "../../../validation/operational-domain-validation/vehicle-module/VehicleValidation.js"
import { requirePermission } from "../../../middleware/requirePermission.js";
import { Permission } from "../../../constant/Permission.js";
const router = express.Router();

router.post("/create-vehicles",verifyAccessToken,requirePermission(Permission.VEHICLE.CreateVehicle),validateRequest(createVehicleSchema),createVehicles);

router.get("/get-allVehicles",verifyAccessToken,requirePermission(Permission.VEHICLE.View),getAllVehicles);

router.get("/get-vehicleDetailsById/:id",verifyAccessToken,getVehiclesDetailsById)

router.put("/update-vehicleById/:id",verifyAccessToken,requirePermission(Permission.VEHICLE.UpdateVehicle),validateRequest(updateVehicleSchema),UpdateVehicleById)

export default router;