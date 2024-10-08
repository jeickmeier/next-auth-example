import NextAuth from "next-auth"
import "next-auth/jwt"

import GitHub from "next-auth/providers/github"
import type { NextAuthConfig } from "next-auth"
import { db } from "./db/schema" 


import { and, eq } from "drizzle-orm"
import { DrizzleAdapter } from "@auth/drizzle-adapter"

import { users, userRoles, accounts, roles } from "./db/models/auth" 

export function CustomDrizzleAdapter(db: any) {
  const adapter = DrizzleAdapter(db);

  return {
    ...adapter,

    async createUser(user: any) {
      // Start a transaction
      const result = await db.transaction(async (tx: any) => {
        // Insert into 'users' table
        const newUser = await tx.insert(users).values({
          ...user,
        }).returning();

        // Insert into 'user_roles' table using the new user's ID
        await tx.insert(userRoles).values({
          userId: newUser[0].id,
          roleId: 1,
        });

        // **Fetch user roles from the 'user_roles' table**
        const userRolesData = await tx
          .select()
          .from(userRoles)
          .where(eq(userRoles.userId, newUser[0].id));

        // **Combine user information and roles**
        const userWithRoles = {
          ...newUser[0],
          roles: userRolesData.map((role: any) => role.roleId),
        };

        // **Return the new user object with roles**
        return userWithRoles;
      });

      return result;
    },

    // Override the getUser method to include roles
    async getUser(userId: string) {

      // Fetch user information from the 'users' table
      const user = await db.select().from(users).where(eq(users.id, userId)).first();

      // Fetch user roles from the 'user_roles' table
      const userRolesData = await db.select().from(userRoles).where(eq(userRoles.userId, userId));

      // Combine user information and roles
      const userWithRoles = {
        ...user,
        roles: userRolesData.map((role: any) => role.roleId)
      };

      console.log(userWithRoles)

      return userWithRoles;
    },

    // Override the getUserByEmail method to include roles
    async getUserByEmail(email: string) {
      // Fetch user information from the 'users' table
      const user = await db.select().from(users).where(eq(users.email, email)).first();

      // Fetch user roles from the 'user_roles' table
      const userRolesData = await db.select().from(userRoles).where(eq(userRoles.userId, user.id));

      // Combine user information and roles
      const userWithRoles = {
        ...user,
        roles: userRolesData.map((role: any) => role.roleId)
      };

      console.log(userWithRoles)

      return userWithRoles;
    },
    
    // Override the getUserByAccount method to include roles
    async getUserByAccount(account: any) {

      const result = await db
        .select({
          account: accounts,
          user: users,
        })
        .from(accounts)
        .innerJoin(users, eq(accounts.userId, users.id))
        .where(
          and(
            eq(accounts.provider, account.provider),
            eq(accounts.providerAccountId, account.providerAccountId)
          )
        )
        .then((res: any) => res[0])

      const user = result?.user ?? null

      const userRolesData = await db
        .select({
          roleId: userRoles.roleId,
          roleName: roles.name
        })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .where(eq(userRoles.userId, user.id));

      const userWithRoles = {
        ...user,
        roles: userRolesData.map((role: any) => role.roleName)
      };

      console.log(userWithRoles)

      return userWithRoles

    },
    

  }
}

const config = {
  adapter: CustomDrizzleAdapter(db),
  providers: [
    GitHub({

    }),
  ],
  basePath: "/auth",
  debug: false, //process.env.NODE_ENV !== "production" ? true : false,

  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.roles = user.roles;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.roles = token.roles || [];
      }
      return session;
    },
  },

  session: {
    strategy: "jwt"
  }

} as NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);