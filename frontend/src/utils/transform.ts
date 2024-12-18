export default function transform(data) {
  const features = data.projects.map((project) => ({
    type: "Feature",
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
      type: "Point",
      coordinates: [project.longitude, project.latitude],
    },
  }));
  return {
    type: "FeatureCollection",
    features: features
  };
}
