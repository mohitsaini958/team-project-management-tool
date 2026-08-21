import type {Request,Response} from "express";

import { createCheckoutSession, handleStripeWebhook, createPortalSession} from "../services/stripe.service.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { success } from "zod";

export const webhook = async (
  req: Request,
  res: Response
) => {
  const signature = req.headers["stripe-signature"];

  if (!signature || Array.isArray(signature)) {
    return res.status(400).json({
      success: false,
      message: "Missing Stripe signature",
    });
  }

  try {
    const result = await handleStripeWebhook(
      req.body as Buffer,
      signature
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("Stripe webhook error:", error);

    return res.status(400).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
};

export const checkout = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await createCheckoutSession(
      req.user!.userId
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  }
);

export const portal=asyncHandler(async(req:Request,res:Response)=>{
    const result=await createPortalSession(req.user!.userId);

    res.status(200).json({
        success:true,
        data:result,
    });
});

