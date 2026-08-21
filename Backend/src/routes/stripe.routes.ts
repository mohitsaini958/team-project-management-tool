import { Router } from "express";
import express from "express";

import { authenticate } from "../middlewares/auth.middleware.js";
import { checkout,portal,webhook } from "../controllers/stripe.controller.js";

const router=Router();

router.post("/checkout",authenticate,checkout);
router.post("/portal",authenticate,portal);
router.post("/webhook",express.raw({type:"application/json"}),webhook);

export default router;