import NextAuth from "next-auth"
import SpotifyProvider from "next-auth/providers/spotify"

const handler = NextAuth({
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            "user-read-email",
            "user-read-private",
            "user-top-read",
            "user-read-recently-played",
            "user-library-read",
          ].join(" "),
        },
      },
    }),
  ],
  cookies: {
    sessionToken: {
      name: `${process.env.NEXTAUTH_URL?.startsWith("https") ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NEXTAUTH_URL?.startsWith("https") ?? false,
      },
    },
  },
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
})

export { handler as GET, handler as POST }