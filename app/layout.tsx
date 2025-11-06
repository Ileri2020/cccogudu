
import type { Metadata } from "next";
// import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "@/store/providers";
import Navbar from "@/components/utility/navbar";
import { AppContextProvider } from "@/context/appContext";
import { Footer3 } from "@/components/myComponents/subs/footer3";
import { SessionProvider } from "next-auth/react"
import { usersession } from "@/session";
// import { getSession } from "next-auth/react";
// import {Roboto} from "next/font/google"

// const roboto = Roboto({
//   subsets : ["latin"], style : "normal"
// });

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });
interface Session {
  user?: {
    name?: string
    email?: string
    image?: string
  }
  expires: string
}


export const metadata: Metadata = {
  title: "CCC Ogudu",
  description: "All about christ",
};





export const SEO_CONFIG = {
  description:
    "All about christ",
  fullName: "CCC Ogudu Express Way Cathedral",
  name: "CCC Ogudu",
  slogan: "O good forever",
};

export const SYSTEM_CONFIG = {
  redirectAfterSignIn: "/dashboard/uploads",
  redirectAfterSignUp: "/dashboard/uploads",
  // repoName: "relivator",
  // repoOwner: "blefnk",
  // repoStars: true,
};

// export const ADMIN_CONFIG = {
//   displayEmails: false,
// };

// export const DB_DEV_LOGGER = false;





export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session : Session | null =  await usersession();

  return (
    <html lang="en">
      <SessionProvider  session={session}>
        <AppContextProvider>
          <body
            className={`font-roboto_mono antialiased`}
            // ${geistSans.variable} ${geistMono.variable}
          >
            <Providers>
              <ThemeProvider
                  attribute="class"
                  defaultTheme="light"
                  enableSystem
                  disableTransitionOnChange
                >
                  <Navbar />
                  {children}
                  <Footer3 className="mt-2" />
                </ThemeProvider>
              </Providers>
          </body>
        </AppContextProvider>
      </SessionProvider>
    </html>
  );
}












