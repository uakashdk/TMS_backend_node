import express from "express";
import verifyAccessToken from "../../../middleware/AuthMiddleware.js";
import multerErrorHandler from "../../../middleware/multerErrorHandler.js";
import {createPaymentSnap} from "../../../controller/finance-domain-controller/payment-snap-module/PaymentSnapContrller.js"
import uploadPaymentSnap from "../../../middleware/uploadPaymentSnap.js"; 

const router = express.Router();

router.post("/upload-payment",verifyAccessToken,uploadPaymentSnap.single("payment"),multerErrorHandler,createPaymentSnap)

export default router;