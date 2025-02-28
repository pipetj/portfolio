import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email", required: true },
        password: { label: "Mot de passe", type: "password", required: true },
      },
      async authorize(credentials) {
        // Remplace ça par un vrai check en DB
        if (credentials.email === "test@email.com" && credentials.password === "password") {
          return { id: "1", name: "Test User", email: credentials.email };
        }
        return null;
      },
    }),
  ],
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
