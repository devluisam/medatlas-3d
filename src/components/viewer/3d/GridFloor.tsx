"use client";

import { Grid } from "@react-three/drei";

export function GridFloor() {
  return (
    <Grid
      position={[0, -1.05, 0]}
      args={[10, 10]}
      cellSize={0.3}
      cellThickness={0.5}
      cellColor="#1e3a5f"
      sectionSize={1.5}
      sectionThickness={1}
      sectionColor="#2563eb"
      fadeDistance={8}
      fadeStrength={1}
      infiniteGrid
    />
  );
}
