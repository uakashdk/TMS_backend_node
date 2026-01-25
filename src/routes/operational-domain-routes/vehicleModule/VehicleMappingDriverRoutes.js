import express from "express";
import {assignDriverToVehicle,unassignDriverFromVehicle,getCurrentVehicleOfDriver,checkDriverAvailability,getAssignedDriversByVehicle,getVehicleDriverAssignmentHistory} from "../../../controller/operational-domain-controller/vehicle-Module/VehicleMappingDriver.js";
import requireRole from "../../../middleware/requireRole.js";
import {assignDriverToVehicleSchema, unassignDriverFromVehicleSchema,getCurrentVehicleOfDriverSchema,getActiveVehicleDriverMappingSchema,vehicleAssignmentHistorySchema} from "../../../validation/operational-domain-validation/vehicle-module/VehicleMappingDriverValidation.js";
import verifyAccessToken from "../../../middleware/verifyAccessToken.js";
import validateRequest from "../../../middleware/validationRequest.js";
import {ROLES} from "../../../constant/roles.js";
const router = express.Router();


router.post("/create-vehicle-assignment",verifyAccessToken,requireRole([ROLES.COMPANY_ADMIN,ROLES.OPERATIONAL_MANAGER]),validateRequest(assignDriverToVehicleSchema),assignDriverToVehicle);

router.post("/unassign-vehicle-assignment",verifyAccessToken,requireRole([ROLES.COMPANY_ADMIN,ROLES.OPERATIONAL_MANAGER]),validateRequest(unassignDriverFromVehicleSchema),unassignDriverFromVehicle);

router.get("/get-current-vehicle-ofADriver/:driverId",verifyAccessToken,requireRole([ROLES.COMPANY_ADMIN,ROLES.OPERATIONAL_MANAGER]),validateRequest(getCurrentVehicleOfDriverSchema),getCurrentVehicleOfDriver);

router.get("/drivers/:driverId/availability",verifyAccessToken,requireRole([ROLES.COMPANY_ADMIN,ROLES.OPERATIONAL_MANAGER]),validateRequest(getActiveVehicleDriverMappingSchema),checkDriverAvailability);

router.get("/vehicle/:vehicleId/assigned-drivers",verifyAccessToken,requireRole([ROLES.COMPANY_ADMIN,ROLES.OPERATIONAL_MANAGER]),getAssignedDriversByVehicle);

router.get("/assignment-history/:vehicleId",verifyAccessToken,requireRole([ROLES.COMPANY_ADMIN,ROLES.OPERATIONAL_MANAGER]),validateRequest(vehicleAssignmentHistorySchema),getVehicleDriverAssignmentHistory);

export default router;