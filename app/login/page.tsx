import type { Metadata } from "next";
import LoginPage from "@/components/auth/LoginPage";

export const metadata: Metadata = {
  title: "Sign in — Poinqu Admin",
  description: "Sign in to the Poinqu support admin workspace.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginRoute() {
  return <LoginPage />;
}
