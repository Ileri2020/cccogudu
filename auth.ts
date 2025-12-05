// @ts-nocheck
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt, { compare } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;

        if (!email || !password) {
          throw new Error("Please provide both email & password");
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const isMatched = await compare(password, user.password);
        if (!isMatched) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          contact: user.contact,
          role: user.role,
          avatarUrl: user.avatarUrl,
          department: user.department,
          sex: user.sex,
        };
      },
    }),

    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const email = user.email;
          const name = user.name;
          const googleId = user.id;
          const avatarUrl = user.image?.replace(/=s\d+(-c)?$/, "=s500-c") ?? null;

          let existingUser = await prisma.user.findUnique({ where: { email } });

          if (!existingUser) {
            existingUser = await prisma.user.create({
              data: {
                email,
                name,
                username: name.replace(/\s+/g, "").toLowerCase(),
                avatarUrl,
                role: "user",
                department: "none",
                providerid: await bcrypt.hash(googleId, parseInt(process.env.SALT_ROUNDS)),
              },
            });
          }

          user.id = existingUser.id;
          user.username = existingUser.username;
          user.role = existingUser.role;
          user.department = existingUser.department;
          user.contact = existingUser.contact;
          user.avatarUrl = existingUser.avatarUrl;
          user.sex = existingUser.sex;

          return true;
        } catch (err) {
          console.error("Google signIn error:", err);
          return false;
        }
      }

      // Credentials provider always returns true if authorize() succeeds
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.department = user.department;
        token.contact = user.contact;
        token.avatarUrl = user.avatarUrl;
        token.sex = user.sex;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.username = token.username;
      session.user.role = token.role;
      session.user.department = token.department;
      session.user.contact = token.contact;
      session.user.avatarUrl = token.avatarUrl;
      session.user.sex = token.sex;

      return session;
    },
  },

  session: {
    strategy: "jwt",
  },

  debug: false,
});
