import NextAuth from 'next-auth';

declare module "next-auth" {
  interface User extends DefaultUser {
    roles: string[]; // Changed from 'role: string' to 'roles: string[]'
  }

  interface Session extends DefaultSession {
    user: User;
  }

}

declare module "next-auth/jwt" {
  interface JWT extends NextAuthJWT {
    roles: string[]; // Changed from 'role: string' to 'roles: string[]'
  }
}

