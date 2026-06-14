import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcryptjs"; // Make sure to install this: npm install bcryptjs

const prisma = new PrismaClient();

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "FUNAI Portal",
      credentials: {
        matricNumber: { label: "Matric Number", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.matricNumber || !credentials?.password) return null;

        // Fetch user from DB
        const user = await prisma.user.findUnique({
          where: { matricNumber: credentials.matricNumber },
        });

        if (user && (await compare(credentials.password, user.password))) {
          return { id: user.id, matricNumber: user.matricNumber, role: user.role };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).role = token.role;
      return session;
    },
  },
});

export { handler as GET, handler as POST };