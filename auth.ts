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
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture?.replace(/=s\d+(-c)?$/, "=s360-c"), // Higher resolution
        };
      },
    }),
    // Facebook provider with high-res picture
    {
      id: "facebook",
      name: "Facebook",
      type: "oauth",
      authorization: "https://www.facebook.com/v11.0/dialog/oauth?scope=email,public_profile",
      token: "https://graph.facebook.com/v11.0/oauth/access_token",
      userinfo: "https://graph.facebook.com/me?fields=id,name,email,picture.width(360).height(360)",
      clientId: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
      profile(profile) {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.picture?.data?.url,
        };
      },
    },
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "facebook") {
        try {
          const email = user.email;
          const name = user.name;
          const providerId = user.id;
          const providerAvatar = user.image;

          let existingUser = await prisma.user.findUnique({ where: { email } });

          if (!existingUser) {
            existingUser = await prisma.user.create({
              data: {
                email,
                name,
                username: name.replace(/\s+/g, "").toLowerCase() + Math.floor(Math.random() * 1000),
                avatarUrl: providerAvatar,
                role: "user",
                department: "none",
                providerid: await bcrypt.hash(providerId, parseInt(process.env.SALT_ROUNDS || "10")),
              },
            });
          } else {
            // If already has avatar, check if it's a google one and fix resolution if needed
            if (existingUser.avatarUrl && existingUser.avatarUrl.includes("googleusercontent.com")) {
              existingUser.avatarUrl = existingUser.avatarUrl.replace(/=s\d+(-c)?$/, "=s360-c");
            }
          }

          user.id = existingUser.id;
          user.username = existingUser.username;
          user.role = existingUser.role;
          user.department = existingUser.department;
          user.contact = existingUser.contact;
          // Priority: Existing user avatar (if any) > provider avatar
          user.avatarUrl = existingUser.avatarUrl || providerAvatar;
          user.sex = existingUser.sex;

          return true;
        } catch (err) {
          console.error("OAuth signIn error:", err);
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
