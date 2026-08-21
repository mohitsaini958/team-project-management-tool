import dotenv from "dotenv"

dotenv.config();

const requiredEnvVars=[
    "DATABASE_URL",
    "JWT_SECRET",
    "STRIPE_SECRET_KEY",
    "STRIPE_PRICE_ID",
] as const;

for(const key of requiredEnvVars){
    if(!process.env[key]){
        throw new Error(`Missing required environment variable: ${key}`);
    }
}

export const env={
    DATABASE_URL:process.env.DATABASE_URL!,
    JWT_SECRET:process.env.JWT_SECRET!,
    STRIPE_SECRET_KEY:process.env.STRIPE_SECRET_KEY!,
    STRIPE_WEBHOOK_SECRET:process.env.STRIPE_WEBHOOK_SECRET!,
    STRIPE_PRICE_ID:process.env.STRIPE_PRICE_ID!,
    FRONTEND_URL:process.env.FRONTEND_URL!,
    PORT:Number(process.env.PORT) || "5000",
};