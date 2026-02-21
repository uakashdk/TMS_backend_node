import express from "express";
import validateRequest from "../../../middleware/validationRequest.js"
import requireRole from "../../../middleware/requireRole.js"
import  {ROLES} from "../../../constant/roles.js";
import verifyAccessToken from "../../../middleware/verifyAccessToken.js"
import {createDriver,getAllDrivers,getDriverDetailsById,updateDriver} from "../../../controller/operational-domain-controller/driverModule/driverController.js"
import {createDriverSchema,updateDriverSchema} from "../../../validation/operational-domain-validation/driver-module/DriverValidation.js"
import { requirePermission } from "../../../middleware/requirePermission.js";
import { Permission } from "../../../constant/Permission.js";

const router = express.Router();


router.post("/create-driver",verifyAccessToken,requirePermission(Permission.DRIVER.CreateDriver),validateRequest(createDriverSchema),createDriver)

router.get("/driver-getAll",verifyAccessToken,requirePermission(Permission.DRIVER.View),getAllDrivers);

router.get("/getdriverDetailById/:id",verifyAccessToken,getDriverDetailsById);

router.put("/update-driver/:id",verifyAccessToken,requirePermission(Permission.DRIVER.UpdateDriver),validateRequest(updateDriverSchema),updateDriver)

export default  router;