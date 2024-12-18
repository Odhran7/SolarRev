import Map from "@/components/ map/Map";
import { Navbar } from "@/components/navbar/Navbar";

export default function Home() {
  return (
    <main className="h-screen w-screen flex flex-col">
      <Navbar />
      <div className="flex-grow relative"> 
        <Map
          initialCenter={[-6.2603, 53.3498]}
          initialZoom={6}
        />
      </div>
    </main>
  );
}