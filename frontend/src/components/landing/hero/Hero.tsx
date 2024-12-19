import React from "react";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="w-screen h-screen">
      <div className="relative w-[95%] h-[95%] mx-auto">
        <Image
          src="/images/solar_image.jpg"
          alt="Solar Hero Image"
          fill
          objectFit="cover"
          className="rounded-xl shadow-lg"
        />
        <h2 className="text-white absolute top-[30%] left-[25%] transform translate-x-[-15%] sm:top-[30%] sm:left-[20%] sm:translate-x-[-10%] sm:translate-y-[2%] font-bold text-5xl sm:text-6xl md:text-7xl lg:text-9xl text-uppercase">
          Harness
        </h2>
        <h2 className="text-solarBlue text-nowrap absolute top-[40%] left-[50%] transform translate-x-[-50%] translate-y-[2%] sm:top-[45%] sm:translate-y-[0%] font-bold text-5xl sm:text-6xl md:text-7xl lg:text-9xl text-uppercase">
          Clean Energy
        </h2>
        <h3 className="text-white absolute bottom-[25%] sm:bottom-[30%] left-[50%] translate translate-x-[-50%]">Looking to build a solar farm in Ireland. We can handle everything from finding your site to financing it.</h3>
      </div>
    </section>
  );
}
