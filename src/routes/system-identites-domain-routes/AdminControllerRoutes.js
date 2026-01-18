import express from "express";
import {userCreation,getAssignableRoles,getAllUsers,getUserDetailsById,updateUserProfile} from "../../controller/system-identies-domain-controller/AdminCreation/AdminController.js";
import {createAdminSchema,updateAdminSchema} from "../../validation/system-identites-domain-validation/AdminValidation.js"
import validateRequest from "../../middleware/validationRequest.js";
import verifyAccessToken from "../../middleware/verifyAccessToken.js";
import requireCompanyAdmin from "../../middleware/requireComapnyAdmin.js";


const router = express.Router();

router.post("/create-new-user",verifyAccessToken,requireCompanyAdmin,validateRequest(createAdminSchema),userCreation)

router.get("/get-roles",verifyAccessToken,getAssignableRoles)

router.get("/get-all-users",verifyAccessToken,getAllUsers);

router.get("/get-userdetailsById/:userId",verifyAccessToken,getUserDetailsById);

router.put("/update-users/:userId",verifyAccessToken,requireCompanyAdmin,validateRequest(updateAdminSchema),updateUserProfile)


export default router;

