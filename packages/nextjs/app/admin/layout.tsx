import type { ReactNode } from "react";

export const metadata = {
  title: "Admin",
  description: "Pipette admin portal for user review and faucet access control.",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
