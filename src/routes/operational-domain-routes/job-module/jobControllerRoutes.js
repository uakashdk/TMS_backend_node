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
import {Permission} from "../../../constant/Permission.js";
import {requirePermission} from "../../../middleware/requirePermission.js";
import verifyAccessToken from "../../../middleware/verifyAccessToken.js";

const router = express.Router();

// Route to create a new job
router.post(
  "/create-jobs",
  verifyAccessToken,
  requirePermission(Permission.JOB.CreateJob),
  validateRequest(createJobSchema),

  createJob
);


router.get(
  "/get-all-jobs",
  verifyAccessToken,
   requirePermission(Permission.JOB.ViewJob),
  getAllJobs
);

router.get(
    "/get-job-by-id/:id",
    verifyAccessToken,
    getJobById
)
router.get(
  "/get-jobs-dropdown",
  verifyAccessToken,
getJobsDropdown
);

router.put(
  "/update-job/:id",
  verifyAccessToken,
    requirePermission(Permission.JOB.UpdateJob),
    validateRequest(updateJobSchema),
    updateJob
);

export default router;