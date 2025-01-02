interface SolarDataMetadata {
  generated_at: string;
  total_projects: number;
}
interface SolarProject {
  country: string;
  project_name: string;
  phase_name: string;
  other_names: string;
  capacity_mw: number;
  capacity_rating: string;
  technology_type: string;
  status: string;
  start_year: number | null;
  retired_year: number | null;
  operator: string | null;
  owner: string | null;
  city: string | null;
  local_area: string | null;
  longitude: number;
  latitude: number;
  website: string;
}
interface SolarDataInput {
  metadata: SolarDataMetadata;
  projects: SolarProject[];
}
interface GeoJSONFeature {
  type: "Feature";
  properties: {
    description: string;
    projectName: string;
    capacity: number;
    status: string;
    operator: string | null;
    owner: string | null;
    technology: string;
    startYear: number | null;
    website: string;
  };
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
}

interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

export default function transform(data: SolarDataInput): GeoJSONFeatureCollection {
  const features = data.projects.map((project) => ({
    type: "Feature" as const,
    properties: {
      description: `
            <strong>${project.project_name}</strong>
            <p>
              ${project.capacity_mw} MW ${project.capacity_rating || ""} ${
        project.technology_type
      } Project<br>
              Status: ${project.status}<br>
              ${project.operator ? `Operator: ${project.operator}<br>` : ""}
              ${project.owner ? `Owner: ${project.owner}<br>` : ""}
              ${
                project.start_year
                  ? `Start Year: ${project.start_year}<br>`
                  : ""
              }
              ${project.city ? `Location: ${project.city}` : ""}
              ${
                project.local_area
                  ? `${project.city ? ", " : ""}${project.local_area}`
                  : ""
              }
            </p>
          `,
      projectName: project.project_name,
      capacity: project.capacity_mw,
      status: project.status,
      operator: project.operator,
      owner: project.owner,
      technology: project.technology_type,
      startYear: project.start_year,
      website: project.website,
    },
    geometry: {
      type: "Point" as const,
      coordinates: [project.longitude, project.latitude] as [number, number],
    },
  }));

  return {
    type: "FeatureCollection" as const,
    features: features
  };
}