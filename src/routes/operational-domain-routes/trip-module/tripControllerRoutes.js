import express from "express";
import {
  createTrip,
  getAllTrips,
  getTripById,
  updateTrip,
  updateTripStatus,
  startTripByDriver,
  upsertTripAdvance,
  completeTrip,
  createPOD,
  getPodById,
  createTripExpense,
  getTripExpensesByTripId,
  getTripAdvanceByTripId
} from "../../../controller/operational-domain-controller/tripModule/tripController.js";
import verifyAccessToken from "../../../middleware/verifyAccessToken.js";
import validateRequest from "../../../middleware/validationRequest.js";
import requieRole from "../../../middleware/requireRole.js";
import {ROLES} from "../../../constant/roles.js";
import { createTripSchema, updateTripSchema, TripAdvanceSchema, PodCreationSchema, TripExpenseSchema } from "../../../validation/operational-domain-validation/trip-module/tipvalidation.js";

const router = express.Router();

// Create Trip
router.post(
    "/crete-trip",
  verifyAccessToken,
  requieRole([ROLES.OPERATIONAL_MANAGER, ROLES.COMPANY_ADMIN]),
  validateRequest(createTripSchema),
  createTrip
);

router.get(
    "/get-all-trips",   
    verifyAccessToken,
    requieRole([ROLES.OPERATIONAL_MANAGER, ROLES.COMPANY_ADMIN, ROLES.DRIVER]),
    validateRequest(TripAdvanceSchema),
    getAllTrips
)


router.get(
    "/get-trip-by-id/:tripId",   
    verifyAccessToken,
    requieRole([ROLES.OPERATIONAL_MANAGER, ROLES.COMPANY_ADMIN, ROLES.DRIVER]),
    getTripById
)

router.put(
    "/update-trip/:id",
    verifyAccessToken,
    requieRole([ROLES.OPERATIONAL_MANAGER, ROLES.COMPANY_ADMIN]),
    validateRequest(updateTripSchema),
    updateTrip
);


router.patch(
    "/update-trip-status/:id",
    verifyAccessToken,
    requieRole([ROLES.OPERATIONAL_MANAGER, ROLES.COMPANY_ADMIN]),
    updateTripStatus
);

router.patch(
  "/start-trip/:tripId",
  verifyAccessToken,
  requieRole([ROLES.DRIVER]),
  startTripByDriver
);


router.post(
    "/create-trip-advance",
    verifyAccessToken,
    requieRole([ROLES.COMPANY_ADMIN, ROLES.ACCOUNTS_MANAGER]),
    validateRequest(TripAdvanceSchema),
    upsertTripAdvance
)

router.put(
    "/complete-trip/:id",   
    verifyAccessToken,
    requieRole([ROLES.DRIVER]),
    completeTrip
);

router.post(
    "/create-pod",
    verifyAccessToken,
    requieRole([ROLES.DRIVER, ROLES.OPERATIONAL_MANAGER, ROLES.COMPANY_ADMIN,ROLES.ACCOUNTS_MANAGER]),
    validateRequest(PodCreationSchema),
    createPOD
)

router.get(
    "/get-pod-by-id/:podId",   
    verifyAccessToken,
    requieRole([ROLES.DRIVER, ROLES.OPERATIONAL_MANAGER, ROLES.COMPANY_ADMIN, ROLES.ACCOUNTS_MANAGER]),
    getPodById
)

router.post(
    "/create-trip-expense",
    verifyAccessToken,
    requieRole([ROLES.DRIVER]),
    validateRequest(TripExpenseSchema),
    createTripExpense
)

router.get(
    "/get-trip-expenses/:tripId",   
    verifyAccessToken,
    requieRole([ROLES.DRIVER, ROLES.OPERATIONAL_MANAGER, ROLES.COMPANY_ADMIN, ROLES.ACCOUNTS_MANAGER]),
    getTripExpensesByTripId
);

router.get("/get-trip-advanceById/:tripId",
  verifyAccessToken,
  requieRole([ROLES.COMPANY_ADMIN,ROLES.ACCOUNTS_MANAGER, ROLES.DRIVER]),
  getTripAdvanceByTripId  
)

export default router;

