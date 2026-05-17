import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Echo Stats | Login",
  description: "Sign in with Spotify to view your listening insights.",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}