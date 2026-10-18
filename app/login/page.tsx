import type { Metadata } from "next";
import LoginPage from "@/components/auth/LoginPage";

export const metadata: Metadata = {
  title: "Masuk — Poinqu Admin",
  description: "Masuk ke konsol admin Poinqu.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginRoute() {
  return <LoginPage />;
}
