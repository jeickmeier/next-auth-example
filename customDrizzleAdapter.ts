import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { users, userRoles, accounts, roles } from "./db/models/auth";
import { eq, and } from "drizzle-orm";

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

        // Fetch user roles from the 'user_roles' table
        const userRolesData = await tx
          .select({
            roleId: userRoles.roleId,
            roleName: roles.name,
          })
          .from(userRoles)
          .innerJoin(roles, eq(userRoles.roleId, roles.id))
          .where(eq(userRoles.userId, user.id));

        const userWithRoles = {
          ...user,
          roles: userRolesData.map((role: any) => role.roleName),
        };

        console.log("Create User", userWithRoles);

        // Return the new user object with roles
        return userWithRoles;
      });

      return result;
    },

    // Override the getUser method to include roles
    async getUser(userId: string) {
      // Fetch user information from the 'users' table
      const userResult = await db.select().from(users).where(eq(users.id, userId));
      const user = userResult[0];

      if (!user) {
        return null;
      }

      // Fetch user roles from the 'user_roles' table
      const userRolesData = await db
        .select({
          roleId: userRoles.roleId,
          roleName: roles.name,
        })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .where(eq(userRoles.userId, user.id));

      const userWithRoles = {
        ...user,
        roles: userRolesData.map((role: any) => role.roleName),
      };

      console.log("Get User", userWithRoles);

      return userWithRoles;
    },

    // Override the getUserByEmail method to include roles
    async getUserByEmail(email: string) {
      // Fetch user information from the 'users' table
      const userResult = await db.select().from(users).where(eq(users.email, email));
      const user = userResult[0];

      if (!user) {
        return null;
      }

      // Fetch user roles from the 'user_roles' table
      const userRolesData = await db
        .select({
          roleId: userRoles.roleId,
          roleName: roles.name,
        })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .where(eq(userRoles.userId, user.id));

      const userWithRoles = {
        ...user,
        roles: userRolesData.map((role: any) => role.roleName),
      };

      console.log("Get User by Email", userWithRoles);

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
        );

      const user = result[0]?.user ?? null;

      if (!user) {
        return null;
      }

      const userRolesData = await db
        .select({
          roleId: userRoles.roleId,
          roleName: roles.name,
        })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .where(eq(userRoles.userId, user.id));

      const userWithRoles = {
        ...user,
        roles: userRolesData.map((role: any) => role.roleName),
      };

      console.log("Get User by Account", userWithRoles);

      return userWithRoles;
    },
  };
}