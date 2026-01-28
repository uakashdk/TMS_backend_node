import express from "express";
import {
  createRoute,
  getAllRoutes,
  getRouteDropdown,
  getRouteById,
  updateRoute,
  deleteRoute
} from "../../../controller/operational-domain-controller/Route-module/RouteMasterController.js";

import validateRequest from "../../../middleware/validationRequest.js";
import { createRouteSchema, updateRouteSchema } from "../../../validation/operational-domain-validation/route-module/RouteMasterValidation.js";
import { ROLES } from "../../../constant/roles.js";
import requireRole from "../../../middleware/requireRole.js";
import verifyAccessToken from "../../../middleware/verifyAccessToken.js";

const router = express.Router();
router.post(
  "/create-route",
  verifyAccessToken,
  requireRole([ROLES.COMPANY_ADMIN, ROLES.OPERATIONAL_MANAGER]),
  validateRequest(createRouteSchema),
  createRoute
);

router.get(
  "/get-all-routes",
  verifyAccessToken,
  requireRole([ROLES.COMPANY_ADMIN, ROLES.OPERATIONAL_MANAGER, ROLES.DRIVER]),
  getAllRoutes
);

router.get(
  "/get-route-dropdown",
  verifyAccessToken,
  requireRole([ROLES.COMPANY_ADMIN, ROLES.OPERATIONAL_MANAGER, ROLES.DRIVER]),
  getRouteDropdown
);

router.get(
  "/get-route-by-id/:id",
  verifyAccessToken,
  requireRole([ROLES.COMPANY_ADMIN, ROLES.OPERATIONAL_MANAGER, ROLES.DRIVER]),
  getRouteById
);

router.put(
  "/update-route/:id",
  verifyAccessToken,    
    requireRole([ROLES.COMPANY_ADMIN, ROLES.OPERATIONAL_MANAGER]),
    validateRequest(updateRouteSchema),
    updateRoute
);

router.delete(
  "/delete-route/:id",
  verifyAccessToken,
  requireRole([ROLES.COMPANY_ADMIN, ROLES.OPERATIONAL_MANAGER]),
  deleteRoute
);



export default router;