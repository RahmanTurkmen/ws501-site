import type { Metadata } from "next";
import { ClickBursts } from "@/components/motion";
import "./admin.css";

export const metadata: Metadata = { title: "Espace équipe", robots: { index: false, follow: false } };

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ClickBursts />
    </>
  );
}
