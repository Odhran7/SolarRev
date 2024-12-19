"use client";
import React, { useState } from "react";
import Image from "next/image";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";

export const Navbar = () => {
  const [isMetricSystem, setMetricSystem] = useState(true);
  return (
    <Menubar className="py-2 gap-x-3">
      <MenubarMenu>
        <div className="font-lg font-bold flex gap-x-3 items-center">
          <Image src="./solar.svg" alt="Solar logo" width={30} height={30} />
          SolarRev
        </div>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Select Metric System</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={() => setMetricSystem(false)}>
            Imperial System
          </MenubarItem>
          <MenubarItem onClick={() => setMetricSystem(true)}>Metric System</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        {isMetricSystem ? (
          <div>Metric</div>
        ) : (
          <div>Imperial</div>
        )}
      </MenubarMenu>
    </Menubar>
  );
};
