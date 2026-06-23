import NextAuth, { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import SpotifyProvider from "next-auth/providers/spotify";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { upsertSpotifyUser } from "@/lib/spotify-auth";

// ─── Types ────────────────────────────────────────────────────────────────────

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      spotifyId: string;
      email: string;
      name: string;
      image?: string;
      onboardingCompleted: boolean;
    };
    accessToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    spotifyId: string;
    accessToken: string;
    refreshToken: string;
    tokenExpiresAt: number;
    onboardingCompleted: boolean;
    mongoId: string;
  }
}

// ─── Spotify token refresh ────────────────────────────────────────────────────

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const url = "https://accounts.spotify.com/api/token";
    const basic = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString("base64");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const refreshed = await response.json();
    if (!response.ok) throw refreshed;

    const refreshToken = refreshed.refresh_token ?? token.refreshToken;
    const tokenExpiresAt = Date.now() + refreshed.expires_in * 1000;

    if (token.mongoId) {
      await connectDB();
      await User.findByIdAndUpdate(token.mongoId, {
        accessToken: refreshed.access_token,
        refreshToken,
        tokenExpiresAt,
      });
    }

    return {
      ...token,
      accessToken: refreshed.access_token,
      tokenExpiresAt,
      // Spotify only returns a new refresh_token occasionally
      refreshToken,
    };
  } catch (error) {
    console.error("[NextAuth] Token refresh failed:", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

// ─── NextAuth options ─────────────────────────────────────────────────────────

export const authOptions: NextAuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        url: "https://accounts.spotify.com/authorize",
        params: {
          scope: [
            "user-read-email",
            "user-read-private",
            "user-read-currently-playing",
            "user-top-read",
            "user-read-recently-played",
            "user-library-read",
          ].join(" "),
        },
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/auth",
    error: "/auth",
  },

  callbacks: {
    // ── jwt: runs on every sign-in, token refresh, and session access ──
    async jwt({ token, account, profile }) {
      // `account` and `profile` are only present on the initial sign-in
      if (account && profile) {
        const spotifyProfile = profile as {
          id: string;
          email: string;
          display_name: string;
          images?: { url: string }[];
          country?: string;
          product?: string;
        };

        const user = await upsertSpotifyUser(spotifyProfile, {
          access_token: account.access_token!,
          refresh_token: account.refresh_token!,
          expires_at_ms: account.expires_at! * 1000,
        });

        token.mongoId             = user._id.toString();
        token.onboardingCompleted = user.onboardingCompleted;
        token.spotifyId    = spotifyProfile.id;
        token.accessToken  = account.access_token!;
        token.refreshToken = account.refresh_token!;
        token.tokenExpiresAt = account.expires_at! * 1000;
      }

      // Proactively refresh the Spotify access token if it's within 5 min of expiry
      if (Date.now() < token.tokenExpiresAt - 5 * 60 * 1000) {
        return token;
      }

      return refreshAccessToken(token);
    },

    // ── session: shapes what the client receives ──
    async session({ session, token }) {
      session.user.id                 = token.mongoId;
      session.user.spotifyId          = token.spotifyId;
      session.user.onboardingCompleted = token.onboardingCompleted;
      session.accessToken             = token.accessToken;
      return session;
    },

    // ── redirect: handles post-login routing ──
    async redirect({ url, baseUrl }) {
      // Let internal relative URLs through untouched
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
