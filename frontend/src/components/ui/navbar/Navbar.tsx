import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button"
import Link from "next/link";
import { useRouter } from "next/router";

const Navbar = () => {
  const router = useRouter();
  return (
    <nav className="flex justify-between items-center w-[95%] mx-auto my-3">
        <div className="flex items-center gap-x-4">
            <Image src="./solar.svg" alt="Solar Image" width={50} height={50} />
            <p>Home</p>
        </div>
        <Button onClick={() => router.push('/map')}>View Map</Button>
    </nav>
  );
};

export default Navbar;
