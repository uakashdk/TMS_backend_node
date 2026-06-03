import express from "express";
import {
  createRoute,
  getAllRoutes,
  getRouteDropdown,
  getRouteById,
  updateRoute,
  deleteRoute,
  getAllState
} from "../../../controller/operational-domain-controller/Route-module/RouteMasterController.js";

import validateRequest from "../../../middleware/validationRequest.js";
import { createRouteSchema, updateRouteSchema } from "../../../validation/operational-domain-validation/route-module/RouteMasterValidation.js";
import { ROLES } from "../../../constant/roles.js";
import requireRole from "../../../middleware/requireRole.js";
import verifyAccessToken from "../../../middleware/verifyAccessToken.js";
import { Permission } from "../../../constant/Permission.js";
import { requirePermission } from "../../../middleware/requirePermission.js";

const router = express.Router();
router.post(
  "/create-route",
  verifyAccessToken,
  requirePermission(Permission.ROUTE.CreateRoute),
  validateRequest(createRouteSchema),
  createRoute
);

router.get(
  "/get-all-routes",
  verifyAccessToken,
  requirePermission(Permission.ROUTE.View),
  getAllRoutes
);

router.get(
  "/get-route-dropdown",
  verifyAccessToken,
  requirePermission(Permission.ROUTE.View),
  getRouteDropdown
);

router.get(
  "/get-route-by-id/:id",
  verifyAccessToken,
  requirePermission(Permission.ROUTE.View),
  getRouteById
);

router.put(
  "/update-route/:id",
  verifyAccessToken,
  requirePermission(Permission.ROUTE.UpdateRoute),
  validateRequest(updateRouteSchema),
  updateRoute
);

router.delete(
  "/delete-route/:id",
  verifyAccessToken,
  requirePermission(Permission.ROUTE.DeleteRoute),
  deleteRoute
);

router.get(
  "/get-all-states",
  verifyAccessToken,
  requirePermission(Permission.ROUTE.View),
  getAllState
);



export default router;