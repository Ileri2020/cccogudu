import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username?: string | null;
      role?: string | null;
      department?: string | null;
      contact?: string | null;
      avatarUrl?: string | null;
      sex?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    username?: string | null;
    role?: string | null;
    department?: string | null;
    contact?: string | null;
    avatarUrl?: string | null;
    sex?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username?: string | null;
    role?: string | null;
    department?: string | null;
    contact?: string | null;
    avatarUrl?: string | null;
    sex?: string | null;
  }
}
