import React from "react";
import Image from "next/image";
import { solar } from "../../../public";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";

const Navbar = () => {
  return (
    <div className="px-4 py-2 flex justify-between items-center">
      <Image src={solar} width={50} height={800} alt="SolarRev Logo" />
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Metric System</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink>Metric</NavigationMenuLink>
              <NavigationMenuLink>Imperial</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuViewport />
      </NavigationMenu>
    </div>
  );
};

export default Navbar;
