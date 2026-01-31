import express from "express";
import {
  createJob,
  getAllJobs,
  getJobById,
  getJobsDropdown,
  updateJob
} from "../../../controller/operational-domain-controller/job-module/jobController.js";
import { createJobSchema, updateJobSchema } from "../../../validation/operational-domain-validation/job-module/jobValidation.js";

import validateRequest from "../../../middleware/validationRequest.js";
import requireRole from "../../../middleware/requireRole.js";
import { ROLES } from "../../../constant/roles.js";

import verifyAccessToken from "../../../middleware/verifyAccessToken.js";

const router = express.Router();

// Route to create a new job
router.post(
  "/create-jobs",
  verifyAccessToken,
  requireRole([ROLES.OPERATIONAL_MANAGER, ROLES.SUPPORT_MANAGER]),
  validateRequest(createJobSchema),
  createJob
);


router.get(
  "/get-all-jobs",
  verifyAccessToken,
  requireRole([ROLES.OPERATIONAL_MANAGER, ROLES.SUPPORT_MANAGER, ROLES.COMPANY_ADMIN,ROLES.DRIVER]),
  getAllJobs
);

router.get(
    "/get-job-by-id/:id",
    verifyAccessToken,
    requireRole([ROLES.OPERATIONAL_MANAGER, ROLES.SUPPORT_MANAGER]),
    getJobById
)
router.get(
  "/get-jobs-dropdown",
  verifyAccessToken,
  requireRole([ROLES.OPERATIONAL_MANAGER, ROLES.SUPPORT_MANAGER, ROLES.COMPANY_ADMIN]),
getJobsDropdown
);

router.put(
  "/update-job/:id",
  verifyAccessToken,
    requireRole([ROLES.OPERATIONAL_MANAGER, ROLES.SUPPORT_MANAGER]),
    validateRequest(updateJobSchema),
    updateJob
);

export default router;