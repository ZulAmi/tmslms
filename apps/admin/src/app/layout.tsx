import "../styles/globals.css";

import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin - System Administration",
  description: "System Administration Dashboard",
};

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers children={children} />
      </body>
    </html>
  );
}
