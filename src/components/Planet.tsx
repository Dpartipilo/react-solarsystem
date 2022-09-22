import { ThreeEvent, useFrame } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SpotLight } from "three";
import { Html } from "@react-three/drei";
import axios from "axios";

const textureLoader = new THREE.TextureLoader();

type PlanetProps = {
  name?: string;
  size: number;
  texture: string;
  position: any;
  selfRotation: any;
  orbitRotation: any;
  ring?: { innerRadius: number; outerRadius: number; texture: any };
};

type PlanetRingProps = {
  innerRadius: number;
  outerRadius: number;
  texture?: any;
};

type DescriptionProps = {
  active: boolean;
  planetData?: any;
};

/****************************************************** Planet component *****************************************************************/

export const Planet = ({
  name,
  size,
  texture,
  position,
  selfRotation,
  orbitRotation,
  ring,
}: PlanetProps) => {
  const planetRef = useRef<THREE.Mesh>(null);
  const planetAnchorRef = useRef<THREE.Mesh>(null);
  const planetLabelRef = useRef<HTMLHeadingElement>(null);
  const spotLightRef = useRef<SpotLight>(null);

  // const vec = new THREE.Vector3();

  // useHelper(spotLightRef, SpotLightHelper, "teal");

  const [hovered, setHovered] = useState<boolean>(false);
  const [hidden, setHidden] = useState<boolean>(true);
  const [active, setActive] = useState<boolean>(false);
  const [planetData, setPlanetData] = useState<any>({});

  useEffect(() => {
    console.log(planetData);
  }, [planetData, name]);

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto";
    if (spotLightRef.current) {
      spotLightRef.current.intensity = hovered ? 1.5 : 0;
    }
  }, [hovered]);

  useEffect(() => {
    if (!spotLightRef.current || !planetRef.current) return;
    spotLightRef.current.target = planetRef.current;
  }, []);

  useFrame((state, delta) => {
    if (!planetRef.current || !planetAnchorRef.current) return;
    planetRef.current.rotation.y += selfRotation; //Self planet rotation
    planetAnchorRef.current.rotation.y += orbitRotation; //Orbit planet rotation
    if (!spotLightRef.current) return;
    // spotLightRef.current.intensity = hovered ? 2 : 0;
  });

  const handleOnPointOver = (e: ThreeEvent<PointerEvent>) => {
    setHovered(true);
    setHidden(false);
  };

  const handleOnPointOut = (e: ThreeEvent<PointerEvent>) => {
    setHovered(false);
    setHidden(true);
  };

  const handleOnClick = (e: ThreeEvent<MouseEvent>) => {
    // console.log(e.object);
    setActive(!active);
    if (name) setPlanetData(getPlanetData(name));
  };

  const getPlanetData = (planet: string) => {
    axios
      .get(`https://api.le-systeme-solaire.net/rest/bodies/${planet}`)
      .then(function ({ data }) {
        // handle success
        // console.log(data);
        setPlanetData(data);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      });
    // .then(function () {
    //   // always executed
    // });
  };

  return (
    //Sets a point [0,0,0] that will rotate and make children rotate relatively to this parent
    <mesh
      ref={planetAnchorRef}
      onPointerOver={handleOnPointOver}
      onPointerLeave={handleOnPointOut}
      onClick={handleOnClick}
    >
      <mesh rotation-x={0.5 * Math.PI}>
        <ringGeometry args={[position[0] - 0.5, position[0], 150]} />
        <meshStandardMaterial
          emissive={0xb30000}
          color={0xffffff}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh name={name} ref={planetRef} position={position}>
        <spotLight
          ref={spotLightRef}
          position={[0, 55, 0]}
          args={[0xffb885, 1.5, 80]}
          penumbra={1}
          angle={0.4}
          target={planetRef.current ? planetRef.current : undefined}
        />
        <sphereGeometry name={name} args={[size, 30, 30]} />
        {name === "Sun" ? (
          <meshBasicMaterial map={textureLoader.load(texture)} />
        ) : (
          <meshStandardMaterial map={textureLoader.load(texture)} />
        )}

        <Html
          style={{
            transition: "all 0.5s",
            opacity: hidden ? 0 : 1,
            transform: `scale(${
              hidden ? 0.5 : 0.9
            }) translate3d(-50%, -140%, 0)`,
          }}
          wrapperClass="label-container"
          distanceFactor={500}
        >
          <h1 ref={planetLabelRef} className={`planet-label`}>
            {name}
          </h1>
        </Html>

        {active ? (
          <Description active={active} planetData={planetData} />
        ) : null}

        {ring && <PlanetRing {...ring} />}
      </mesh>
    </mesh>
  );
};

/***************************************************** Ring component ******************************************************************/

const PlanetRing = ({ innerRadius, outerRadius, texture }: PlanetRingProps) => {
  const planetRingRef = useRef<any>(null);
  return (
    <mesh rotation-x={-0.55 * Math.PI} ref={planetRingRef}>
      <ringGeometry args={[innerRadius, outerRadius, 32]} />
      <meshBasicMaterial
        map={textureLoader.load(texture)}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

const Description = (props: DescriptionProps) => {
  const { active, planetData } = props;
  return (
    <>
      <Html
        style={{
          transition: "all 0.5s",
          opacity: active ? 1 : 0,
          transform: `translate3d(50%, -50%, 0)`,
        }}
        wrapperClass="description-container"
        distanceFactor={400}
      >
        <div className={`planet-description`}>
          <h2>{planetData?.englishName}</h2>
          <div>
            <span>Type: </span>
            <span>{planetData?.bodyType}</span>
          </div>
          <div>
            <span>Gravity: </span>
            <span>{planetData?.gravity}</span>
          </div>
          <div>
            <span>Inclination: </span>
            <span>{planetData?.inclination}</span>
          </div>
          <div>
            <span>Density: </span>
            <span>{planetData?.density}</span>
          </div>
          <div>
            <span>Mass: </span>
            <span>
              {(
                planetData?.mass.massValue * planetData?.mass.massExponent
              ).toFixed(2)}
            </span>
          </div>
          <div>
            <span>Volume: </span>
            <span>
              {(planetData?.vol.volValue * planetData?.vol.volExponent).toFixed(
                2
              )}
            </span>
          </div>
        </div>
      </Html>
    </>
  );
};
