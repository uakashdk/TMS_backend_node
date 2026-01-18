import express from "express";
import validateRequest from "../../../middleware/validationRequest.js"
import requireRole from "../../../middleware/requireRole.js"
import  {ROLES} from "../../../constant/roles.js";
import verifyAccessToken from "../../../middleware/verifyAccessToken.js"
import {createDriver,getAllDrivers,getDriverDetailsById,updateDriver} from "../../../controller/operational-domain-controller/driverModule/driverController.js"
import {createDriverSchema,updateDriverSchema} from "../../../validation/operational-domain-validation/driver-module/DriverValidation.js"


const router = express.Router();


router.post("/create-driver",verifyAccessToken,validateRequest(createDriverSchema),requireRole([ROLES.OPERATIONAL_MANAGER]),createDriver)

router.get("/driver-getAll",verifyAccessToken,getAllDrivers);

router.get("/getdriverDetailById/:id",verifyAccessToken,requireRole([ROLES.OPERATIONAL_MANAGER]),getDriverDetailsById);

router.put("/update-driver/:id",verifyAccessToken,requireRole([ROLES.OPERATIONAL_MANAGER]),validateRequest(updateDriverSchema),updateDriver)

export default  router;