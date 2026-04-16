import express from "express";
import {createRole, getAllRoles, getAllPermissions, assignPermissionsToRole, DeleteRole, getRoleDetailsById, updateRoleWithPermissions} from "../../controller/system-identies-domain-controller/AdminCreation/RoleController.js";
import validateRequest from "../../middleware/validationRequest.js";
import verifyAccessToken from "../../middleware/verifyAccessToken.js";
import { createRoleSchema, UpdateRoleSchema } from "../../validation/system-identites-domain-validation/RoleValidation.js";
import { requirePermission } from "../../middleware/requirePermission.js";
import { Permission } from "../../constant/Permission.js";


const router = express.Router();

router.post("/create-role",verifyAccessToken,requirePermission(Permission.ROLE.CreateRole),validateRequest(createRoleSchema),createRole);


router.get("/get-all-roles",verifyAccessToken,requirePermission(Permission.ROLE.View),getAllRoles);


router.delete("/delete-role/:id",verifyAccessToken,requirePermission(Permission.ROLE.DeleteRole),DeleteRole);


router.get("/permissions",verifyAccessToken,getAllPermissions);


router.post("/assign-permissions",verifyAccessToken,assignPermissionsToRole);

router.get("/getroleById/:id",verifyAccessToken,requirePermission(Permission.ROLE.View),getRoleDetailsById);

router.put("/update-role/:id",verifyAccessToken,requirePermission(Permission.ROLE.UpdateRole),validateRequest(UpdateRoleSchema),updateRoleWithPermissions);

export default router;
