import React from "react";
import { Menu } from "@/components/map/components/Menu";

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col flex-1 h-[calc(100vh-8rem)]"> {/* Adjusted for two nav bars */}
      <Menu />
      <main className="flex-1">{children}</main>
    </div>
  );
}