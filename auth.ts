import NextAuth from "next-auth"
import "next-auth/jwt"

import GitHub from "next-auth/providers/github"
import type { NextAuthConfig } from "next-auth"

import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "./db/schema"

const config = {
  adapter: DrizzleAdapter(db),
  providers: [
    GitHub,
  ],
  basePath: "/auth",
  //debug: process.env.NODE_ENV !== "production" ? true : false,
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)

declare module "next-auth" {
  interface Session {
    accessToken?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
  }
}
