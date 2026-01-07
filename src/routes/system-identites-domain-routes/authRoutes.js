import express from 'express';

import validateRequest from '../../middleware/validationRequest.js';
import { loginValidation } from '../../validation/system-identites-domain-validation/authValidation.js';
 import { loginAdmin,logoutAdmin,refreshAccessToken } from '../../controller/system-identies-domain-controller/authController.js';
import verifyAccessToken from "../../middleware/verifyAccessToken.js";
const router = express.Router();

router.post(
  '/login',
  validateRequest(loginValidation), // runs FIRST
  loginAdmin                              // runs ONLY if valid
);

router.post(
  "/logout",
  verifyAccessToken,
  logoutAdmin
);

router.post("/refresh-token",refreshAccessToken)




export default router;
