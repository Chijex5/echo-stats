import NextAuth, { NextAuthOptions, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import SpotifyProvider from "next-auth/providers/spotify";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";

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

    return {
      ...token,
      accessToken: refreshed.access_token,
      tokenExpiresAt: Date.now() + refreshed.expires_in * 1000,
      // Spotify only returns a new refresh_token occasionally
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
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

        await connectDB();

        // ── Upsert user in MongoDB ──
        const existingUser = await User.findOne({
          $or: [
            { spotifyId: spotifyProfile.id },
            { email: spotifyProfile.email },
          ],
        });

        if (existingUser) {
          // Refresh tokens on every login
          existingUser.accessToken   = account.access_token!;
          existingUser.refreshToken  = account.refresh_token!;
          existingUser.tokenExpiresAt = account.expires_at! * 1000;
          await existingUser.save();

          token.mongoId             = existingUser._id.toString();
          token.onboardingCompleted = existingUser.onboardingCompleted;
        } else {
          // New user — create with onboardingCompleted: false
          const newUser = await User.create({
            spotifyId:           spotifyProfile.id,
            email:               spotifyProfile.email,
            displayName:         spotifyProfile.display_name ?? "Spotify User",
            avatarUrl:           spotifyProfile.images?.[0]?.url,
            country:             spotifyProfile.country,
            spotifyProduct:      spotifyProfile.product,
            accessToken:         account.access_token!,
            refreshToken:        account.refresh_token!,
            tokenExpiresAt:      account.expires_at! * 1000,
            onboardingCompleted: false,
          });

          token.mongoId             = newUser._id.toString();
          token.onboardingCompleted = false;
        }

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