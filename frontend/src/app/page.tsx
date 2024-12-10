// src/app/page.tsx
'use client'
import { Map, Marker, ZoomControl } from "pigeon-maps";
import { osm } from 'pigeon-maps/providers';

export default function Home() {
  return (
    <main className="p-4">
      <Map provider={osm} height={1000} defaultCenter={[53.4495, -7.5030]} defaultZoom={7}>
        <ZoomControl />
        <Marker width={50} anchor={[53.350140, -6.266155]} />
      </Map>
    </main>
  );
}
