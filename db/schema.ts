
import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import * as models from "./models/auth"

if (!process.env.AUTH_DRIZZLE_URL) {
        console.log('🔴 Cannot find database url');
}    

const connectionString = process.env.AUTH_DRIZZLE_URL!
const pool = postgres(connectionString, { max: 1 })

export const db = drizzle(pool)

export const {
        users,
        accounts,
        sessions,
        verificationTokens,
        authenticators,
        roles,
        userRoles,
        } = models
