import NextAuth from "next-auth"
import "next-auth/jwt"
import GitHub from "next-auth/providers/github"
import type { NextAuthConfig } from "next-auth"
import { db } from "./db/schema" 
import { eq } from "drizzle-orm"
import { CustomDrizzleAdapter } from "./customDrizzleAdapter"
import { userRoles, roles } from "./db/models/auth" 

const config = {
  adapter: CustomDrizzleAdapter(db),
  providers: [GitHub],
  basePath: "/auth",
  debug: process.env.NODE_ENV !== "production" ? true : false,
  callbacks: {
    async session({ session, user }) {
      if (user) {
        const userRolesData = await db
          .select({
            roleId: userRoles.roleId,
            roleName: roles.name
          })
          .from(userRoles)
          .innerJoin(roles, eq(userRoles.roleId, roles.id))
          .where(eq(userRoles.userId, user.id));

        session.user.roles = userRolesData.map((role: any) => role.roleName);
      }
      return session;
    },
  },


} as NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);