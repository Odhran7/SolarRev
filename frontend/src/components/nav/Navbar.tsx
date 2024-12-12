import React from "react";
import Image from "next/image";
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
      <Image src="/logo/solar.svg" width={50} height={800} alt="SolarRev Logo" />
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Metric System</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink>
                <ul className="w-[200px]">
                  <li className="p-1 hover:bg-gray-100 cursor-pointer">
                    Metric System
                  </li>
                  <li className="p-1 hover:bg-gray-100 cursor-pointer">
                    Imperial System
                  </li>
                </ul>
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuViewport />
      </NavigationMenu>
    </div>
  );
};

export default Navbar;
