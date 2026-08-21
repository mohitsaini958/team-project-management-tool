
import Stripe from "stripe";

import {prisma} from "../config/prisma.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

const stripe=new Stripe(env.STRIPE_SECRET_KEY);

const mapStripeStatus=(status:Stripe.Subscription.Status)=>{
    switch(status){
        case "trialing":
            return "TRIAL";
        
        case "active":
            return "ACTIVE";
        
        case "past_due":
        case "unpaid":
        case "incomplete":
        case "paused":
            return "PAST_DUE";
        
        case "canceled":
        case "incomplete_expired":
            return "CANCELED";
        
        default:
            return "PAST_DUE";
    }
};

export const handleStripeWebhook=async(rawBody:Buffer,signature:string)=>{
    let event : Stripe.Event;

    try {
        event=stripe.webhooks.constructEvent(rawBody,signature,env.STRIPE_WEBHOOK_SECRET);
    } catch (error) {
        console.error("Stripe signature verification failed");

        throw new AppError("Invalid Stripe webhook signature",400);
    }

    switch(event.type){
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted":{
            const subscription=event.data.object as Stripe.Subscription;

            const customerId=typeof subscription.customer=="string"?subscription.customer:subscription.customer.id;

            const subscriptionStatus=mapStripeStatus(subscription.status);
            const user=await prisma.user.findUnique({
                where:{
                    stripeCustomerId:customerId,
                },
            });

            if(!user){
                console.warn(`No user found for stripe customer ${customerId}`);
                break;
            }

            await prisma.user.update({
                where:{
                    id:user.id,
                },
                data:{
                    subscriptionStatus,
                },
            });

            console.log(`Updated ${user.email} subscription to ${subscriptionStatus}`);
            break;
        }

        default: console.log(`Unlimited Stripe event: ${event.type}`);
    }

    return {
        received:true,
    };
};



export const createCheckoutSession=async (userId: string)=>{
    const user=await prisma.user.findUnique({
        where:{
            id:userId,
        },
    });

    if(!user){
        throw new AppError("User not found",404);
    }

    let stripeCustomerId=user.stripeCustomerId;

    if(!stripeCustomerId){
        const customer=await stripe.customers.create({
            email:user.email,
            name:user.name,
            metadata:{
                userId:user.id,
            },
        });

        stripeCustomerId=customer.id;

        await prisma.user.update({
            where:{
                id:user.id,
            },
            data:{
                stripeCustomerId,
            },
        });
    }

    const session=await stripe.checkout.sessions.create({
        customer:stripeCustomerId,

        mode:"subscription",

        line_items:[
            {
                price:env.STRIPE_PRICE_ID,
                quantity:1,
            },
        ],

        success_url:`${env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url:`${env.FRONTEND_URL}/billing/cancel`,
        client_reference_id:user.id,
        metadata:{
            user:userId,
        },
    });

    if(!session.url){
        throw new AppError(
            "Failed to create Stripe checkout URL",
            500
        );
    }

    return {
        url:session.url,
        sessionId:session.id,
    };
};

export const createPortalSession=async(userId:string)=>{
    const user=await prisma.user.findUnique({
        where:{
            id:userId,
        },
        select:{
            id:true,
            stripeCustomerId:true,
        },
    });

    if(!user){
        throw new AppError("User not found",404);
    }

    if(!user.stripeCustomerId){
        throw new AppError("No Stripe customer found for this user",400);
    }

    const session=await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url:`${env.FRONTEND_URL}/settings/billing`,
    });

    return {
        url:session.url,
    };
};

