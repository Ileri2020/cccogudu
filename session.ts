'use server'
import { auth } from "./auth";

export const usersession = async () => {
  try {
    const session = await auth();
    return session?.user ? session : null;
  } catch (error) {
    // A stale or malformed session cookie should not prevent the page from rendering.
    console.error("Unable to read the Auth.js session:", error);
    return null;
  }
  }




//   session from login component {
//   user: {
//     name: 'Adepoju Ololade',
//     email: 'adepojuololade2020@gmail.com',
//     image: 'https://lh3.googleusercontent.com/a/ACg8ocLdrFmljf-SPXpYAl7HcdIPIVgBam0jRZ5YkySzCZW8zI7oIik2=s96-c'
//   },
//   expires: '2025-12-06T18:59:49.210Z'
// }