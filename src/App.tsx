import React, { Suspense, useEffect, useRef, useState } from "react";

import "./App.css";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bounds, useBounds, OrbitControls } from "@react-three/drei";

import starsTexture from "./textures/stars.jpg";
import sunTexture from "./textures/sun.jpg";
import mercuryTexture from "./textures/mercury.jpg";
import venusTexture from "./textures/venus.jpg";
import earthTexture from "./textures/earth.jpg";
import marsTexture from "./textures/mars.jpg";
import jupiterTexture from "./textures/jupiter.jpg";
import saturnTexture from "./textures/saturn.jpg";
import saturnRingTexture from "./textures/saturn ring.png";
import uranusTexture from "./textures/uranus.jpg";
import uranusRingTexture from "./textures/uranus ring.png";
import neptuneTexture from "./textures/neptune.jpg";
import plutoTexture from "./textures/pluto.jpg";

import * as THREE from "three";
import { Planet } from "./components/Planet";
import { Object3D } from "three";

const planetsData = [
  {
    name: "Sun",
    size: 16,
    texture: sunTexture,
    position: [0, 0, 0],
    selfRotation: 0.01,
    orbitRotation: 0,
  },
  {
    name: "Mercury",
    size: 3.5,
    texture: mercuryTexture,
    position: [28, 0, 0],
    selfRotation: 0.004,
    orbitRotation: 0.03,
  },
  {
    name: "Venus",
    size: 5.8,
    texture: venusTexture,
    position: [44, 0, 0],
    selfRotation: 0.002,
    orbitRotation: 0.015,
  },
  {
    name: "Earth",
    size: 6,
    texture: earthTexture,
    position: [62, 0, 0],
    selfRotation: 0.02,
    orbitRotation: 0.01,
  },
  {
    name: "Mars",
    size: 4,
    texture: marsTexture,
    position: [78, 0, 0],
    selfRotation: 0.018,
    orbitRotation: 0.008,
  },
  {
    name: "Jupiter",
    size: 12,
    texture: jupiterTexture,
    position: [100, 0, 0],
    selfRotation: 0.04,
    orbitRotation: 0.002,
  },
  {
    name: "Saturn",
    size: 10,
    texture: saturnTexture,
    position: [138, 0, 0],
    selfRotation: 0.005,
    orbitRotation: 0.01,
    ring: {
      innerRadius: 10,
      outerRadius: 20,
      ringTexture: saturnRingTexture,
    },
  },
  {
    name: "Uranus",
    size: 7,
    texture: uranusTexture,
    position: [176, 0, 0],
    selfRotation: 0.03,
    orbitRotation: 0.0004,
    ring: {
      innerRadius: 7,
      outerRadius: 12,
      ringTexture: uranusRingTexture,
    },
  },
  {
    name: "Neptune",
    size: 7,
    texture: neptuneTexture,
    position: [200, 0, 0],
    selfRotation: 0.032,
    orbitRotation: 0.00022,
  },
  {
    name: "Pluto",
    size: 2.8,
    texture: plutoTexture,
    position: [216, 0, 0],
    selfRotation: 0.008,
    orbitRotation: 0.00017,
  },
];

const cubeTextureLoader = new THREE.CubeTextureLoader();
// The CubeTextureLoader load method takes an array of images representing all 6 sides of the cube.
const backgroundTexture = cubeTextureLoader.load([
  starsTexture,
  starsTexture,
  starsTexture,
  starsTexture,
  starsTexture,
  starsTexture,
]);

function App() {
  return (
    <div className="App">
      <Canvas
        camera={{ position: [10, 80, 80], near: 0.1 }}
        onCreated={({ scene }) => {
          scene.background = backgroundTexture;
        }}
      >
        <ambientLight intensity={1} color={0x333333} />
        <pointLight position={[0, 0, 0]} args={[0xfff1db, 2, 300]} />
        <Suspense fallback={null}>
          <Bounds clip observe damping={0.5} margin={2}>
            <SelectToZoom>
              {planetsData.map((planet) => (
                <Planet
                  key={planet.name}
                  name={planet.name}
                  size={planet.size}
                  texture={planet.texture}
                  position={planet.position}
                  selfRotation={planet.selfRotation}
                  orbitRotation={planet.orbitRotation}
                  ring={{
                    innerRadius: planet.ring?.innerRadius || 1,
                    outerRadius: planet.ring?.outerRadius || 1,
                    texture: planet.ring?.ringTexture,
                  }}
                />
              ))}
            </SelectToZoom>
          </Bounds>
        </Suspense>
        <OrbitControls makeDefault zoomSpeed={0.5} />
      </Canvas>
    </div>
  );
}

const SelectToZoom = ({ children }: any) => {
  const [focused, setFocused] = useState(false);
  const planetRef = useRef<Object3D>();

  const boundsApi = useBounds();
  useFrame((state, delta) => {
    if (focused) {
      if (planetRef.current?.parent) {
        planetRef.current.parent.rotation.y = 0;
        delta <= 2 && boundsApi.refresh(planetRef.current).fit();
      }
    }

    return null;
  });
  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        e.delta <= 2 && boundsApi.refresh(e.object).fit();
        planetRef.current = e.object;

        console.log("parent", e.object);
        setFocused(true);
      }}
      onPointerMissed={(e) => {
        e.button === 0 && boundsApi.refresh().fit();

        setFocused(false);
      }}
    >
      {children}
    </group>
  );
};

export default App;
