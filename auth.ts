
// @ts-nocheck
import NextAuth, { CredentialsSignin } from "next-auth";
// @ts-nocheck
import Credentials from "next-auth/providers/credentials";
// import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";
// import connectDB from "./lib/db";
// import { User } from "./models/User";
import bcrypt, { compare } from "bcryptjs";
// import bcrypt, { compare } from 'bcrypt';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true, 
  providers: [
    // Github({
    //   clientId: process.env.GITHUB_CLIENT_ID,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET,
    // }),

    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),

    Credentials({
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      authorize: async (credentials) => {
        const email = credentials.email as string | undefined;
        const password = credentials.password as string | undefined;

        if (!email || !password) {
          throw new CredentialsSignin("Please provide both email & password");
        }

        // await connectDB();

        // const user = await User.findOne({ email }).select("+password +role");
        const user = await prisma.user.findUnique({
          where: { email },
          // select: { password: true, role: true },
        });

        if (!user) {
          throw new Error("Invalid email or password");
        }

        if (!user.password) {
          throw new Error("Invalid email or password");
        }

        const isMatched = await compare(password, user.password);

        if (!isMatched) {
          throw new Error("Password did not matched");
        }

        const userData = {
          name: user.name,
          username: user.username,
          email: user.email,
          contact: user.contact,
          role: user.role,
          avatarUrl: user.avatarUrl,
          department: user.department,
          sex: user.sex,
        };

        return userData;
      },
    }),
  ],

  // pages: {
  //   signIn: "/login",
  // },

  callbacks: {
    async session({ session, token, user }) {
      if (token?.sub && token?.role) {
        //add whatever else to session here
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },

    signIn: async ({ user, account }) => {
      if (account?.provider === "google") {
        try {
          const { email, name, image, id } = user;
          const avatarUrl = image?.replace(/=s\d+-c$/, "=s500-c") ?? image;
          // await connectDB();
          const alreadyUser = await prisma.user.findUnique({
            where: { email },
            // select: { password: true, role: true },
          });

          if (!alreadyUser) {
            // await User.create({ email, name, image, authProviderId: id });
            const user = await prisma.user.create({
              data: {
                email,
                name,
                avatarUrl : image.replace(/=s\d+(-c)?/, "=s250-c") ?? image,
                // authProviderId: id,
                providerid: await bcrypt.hash(id, parseInt(process.env.SALT_ROUNDS)),
              },
            });
            
          } else {
            return true;
          }
        } catch (error) {
          throw new Error("Error while creating user");
        }
      }

      if (account?.provider === "credentials") {
        return true;
      } else {
        return false;
      }
    },
  },
});







// signin user from 
// google: {"id":"4bebdf1d-2753-4047-ab31-8a6a9db26d0c",
//   "name":"Adepoju Ololade",
//   "email":"adepojuololade2020@gmail.com",
//   "image":"https://lh3.googleusercontent.com/a/ACg8ocLdrFmljf-SPXpYAl7HcdIPIVgBam0jRZ5YkySzCZW8zI7oIik2=s96-c"
// }
//  GET /api/auth/callback/google?code=4%2F0Ab32j90_a7v-5QU2RibG3S8IjethT361aaX-zs2MbKjnfg5ipPemiIGXQFosoJmCzXEtJg&scope=
// email+profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email
// +openid&authuser=0&prompt=consent 302 in 21974ms