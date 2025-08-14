"use client";

import React, { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <div suppressHydrationWarning>{children}</div>;
}
