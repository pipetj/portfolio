"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

function Robot({ position, rotation }) {
  const robotRef = useRef();
  const { scene } = useGLTF("/models/robot.glb");

  useFrame(() => {
    if (robotRef.current) {
      robotRef.current.position.set(position.x, position.y, position.z);
      robotRef.current.rotation.set(0, rotation.y + Math.PI / 2, 0);
    }
  });

  return (
    <primitive ref={robotRef} object={scene} scale={[10, 10, 10]} />
  );
}

function Sofa({ position, setObstacleRef }) {
  const groupRef = useRef();
  useEffect(() => {
    if (groupRef.current) setObstacleRef(groupRef.current);
  }, [setObstacleRef]);

  return (
    <group ref={groupRef} position={position} rotation={[0, Math.PI, 0]} userData={{ isSolid: true }}>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[3, 0.6, 1]} />
        <meshStandardMaterial color="#4A90E2" roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.9, -0.4]}>
        <boxGeometry args={[3, 0.6, 0.2]} />
        <meshStandardMaterial color="#4A90E2" roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh position={[-0.9, 0.7, 0]}>
        <boxGeometry args={[0.9, 0.2, 0.8]} />
        <meshStandardMaterial color="#E6E6E6" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[0.9, 0.2, 0.8]} />
        <meshStandardMaterial color="#E6E6E6" roughness={0.6} />
      </mesh>
      <mesh position={[0.9, 0.7, 0]}>
        <boxGeometry args={[0.9, 0.2, 0.8]} />
        <meshStandardMaterial color="#E6E6E6" roughness={0.6} />
      </mesh>
    </group>
  );
}

function CoffeeTable({ position, setObstacleRef }) {
  const groupRef = useRef();
  useEffect(() => {
    if (groupRef.current) setObstacleRef(groupRef.current);
  }, [setObstacleRef]);

  return (
    <group ref={groupRef} position={position} userData={{ isSolid: true }}>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1.5, 0.1, 0.8]} />
        <meshStandardMaterial color="#D4A017" roughness={0.2} metalness={0.4} />
      </mesh>
      <mesh position={[-0.6, 0.15, -0.3]}>
        <boxGeometry args={[0.1, 0.3, 0.1]} />
        <meshStandardMaterial color="#333333" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[0.6, 0.15, -0.3]}>
        <boxGeometry args={[0.1, 0.3, 0.1]} />
        <meshStandardMaterial color="#333333" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[-0.6, 0.15, 0.3]}>
        <boxGeometry args={[0.1, 0.3, 0.1]} />
        <meshStandardMaterial color="#333333" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[0.6, 0.15, 0.3]}>
        <boxGeometry args={[0.1, 0.3, 0.1]} />
        <meshStandardMaterial color="#333333" roughness={0.3} metalness={0.5} />
      </mesh>
    </group>
  );
}

function Carpet({ position }) {
  return (
    <mesh position={[position.x, position.y, position.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[6, 4]} />
      <meshStandardMaterial color="#8B5A2B" roughness={0.7} />
    </mesh>
  );
}

function TV({ position, setObstacleRef }) {
  const groupRef = useRef();
  useEffect(() => {
    if (groupRef.current) setObstacleRef(groupRef.current);
  }, [setObstacleRef]);

  return (
    <group ref={groupRef} position={position} userData={{ isSolid: true }}>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[2, 0.6, 0.4]} />
        <meshStandardMaterial color="#1C2526" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0, 1.3, 0]}>
        <boxGeometry args={[1.8, 1, 0.1]} />
        <meshStandardMaterial color="#000000" roughness={0.1} metalness={0.8} />
      </mesh>
      <mesh position={[0, 1.3, 0.06]}>
        <planeGeometry args={[1.7, 0.9]} />
        <meshStandardMaterial color="#1E90FF" emissive="#1E90FF" emissiveIntensity={0.5} roughness={0.1} />
      </mesh>
    </group>
  );
}

function Lamp({ position, setObstacleRef }) {
  const groupRef = useRef();
  useEffect(() => {
    if (groupRef.current) setObstacleRef(groupRef.current);
  }, [setObstacleRef]);

  return (
    <group ref={groupRef} position={position} userData={{ isSolid: true }}>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#B8860B" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.4, 8]} />
        <meshStandardMaterial color="#C0C0C0" roughness={0.2} metalness={0.7} />
      </mesh>
      <mesh position={[0, 1.6, 0]}>
        <coneGeometry args={[0.3, 0.4, 16, 1, true]} />
        <meshStandardMaterial 
          color="#F0F0F0" 
          side={THREE.DoubleSide} 
          emissive="#FFF9E5" 
          emissiveIntensity={0.3} 
          roughness={0.5}
        />
      </mesh>
      <pointLight position={[0, 1.6, 0]} intensity={0.8} distance={5} color="#FFF9E5" />
    </group>
  );
}

function SceneContent() {
  const robotPosition = useRef(new THREE.Vector3(0, 0, 0));
  const robotRotation = useRef({ y: 0 });
  const direction = useRef(new THREE.Vector3(0, 0, 1));
  const speed = useRef(0);
  const controlsRef = useRef();
  const obstaclesRef = useRef([]);
  const isRotatingLeft = useRef(false);
  const isRotatingRight = useRef(false);
  const isAvoiding = useRef(false);
  const avoidanceTimer = useRef(0);
  const rotationTarget = useRef(0);
  const isRecoiling = useRef(true);

  const SPEED_VALUE = 0.05;
  const MANUAL_ROTATION_SPEED = 0.02;
  const AUTO_ROTATION_SPEED = 1.2217 / 2.5; // ≈ 0.4887 radians/seconde pour 70° en 2,5s
  const DETECTION_DISTANCE = 0.8;
  const DETECTION_WIDTH = Math.PI / 6;
  const AVOIDANCE_DURATION = 0.4;
  const ROTATION_DURATION = 2.5;

  const updateDirection = () => {
    direction.current.set(0, 0, 1);
    const rotationMatrix = new THREE.Matrix4().makeRotationY(robotRotation.current.y);
    direction.current.applyMatrix4(rotationMatrix);
    direction.current.normalize();
  };

  const checkCollision = (testPosition) => {
    const robotBox = new THREE.Box3().setFromCenterAndSize(
      testPosition,
      new THREE.Vector3(0.5, 0.5, 0.5)
    );
    return obstaclesRef.current.some(obstacle => {
      if (!obstacle) return false;
      const obstacleBox = new THREE.Box3().setFromObject(obstacle);
      return robotBox.intersectsBox(obstacleBox);
    });
  };

  const detectObstacles = () => {
    const frontPosition = robotPosition.current.clone()
      .add(direction.current.clone().multiplyScalar(DETECTION_DISTANCE));
    const leftDirection = direction.current.clone()
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), DETECTION_WIDTH);
    const leftPosition = robotPosition.current.clone()
      .add(leftDirection.multiplyScalar(DETECTION_DISTANCE));
    const rightDirection = direction.current.clone()
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), -DETECTION_WIDTH);
    const rightPosition = robotPosition.current.clone()
      .add(rightDirection.multiplyScalar(DETECTION_DISTANCE));

    return {
      front: checkCollision(frontPosition),
      left: checkCollision(leftPosition),
      right: checkCollision(rightPosition)
    };
  };

  const startAvoidance = (sensors) => {
    if (!isAvoiding.current) {
      isAvoiding.current = true;
      avoidanceTimer.current = 0;
      isRecoiling.current = true;
      const seventyDegrees = 1.2217; // 70° en radians
      if (!sensors.left) {
        rotationTarget.current = robotRotation.current.y + seventyDegrees; // 70° à gauche
      } else if (!sensors.right) {
        rotationTarget.current = robotRotation.current.y - seventyDegrees; // 70° à droite
      } else {
        rotationTarget.current = robotRotation.current.y - seventyDegrees; // Droite par défaut
      }
    }
  };

  useFrame((state, delta) => {
    if (isAvoiding.current) {
      avoidanceTimer.current += delta;

      if (isRecoiling.current) {
        const recoilSpeed = SPEED_VALUE;
        const recoilVector = direction.current.clone().negate().multiplyScalar(recoilSpeed * delta);
        robotPosition.current.add(recoilVector);

        if (avoidanceTimer.current >= AVOIDANCE_DURATION) {
          isRecoiling.current = false;
          avoidanceTimer.current = 0;
        }
      } else {
        const deltaRotation = AUTO_ROTATION_SPEED * delta;
        if (robotRotation.current.y < rotationTarget.current) {
          robotRotation.current.y = Math.min(robotRotation.current.y + deltaRotation, rotationTarget.current);
        } else {
          robotRotation.current.y = Math.max(robotRotation.current.y - deltaRotation, rotationTarget.current);
        }
        updateDirection();

        if (avoidanceTimer.current >= ROTATION_DURATION || Math.abs(robotRotation.current.y - rotationTarget.current) < 0.01) {
          isAvoiding.current = false;
        }
      }
    } else {
      const sensors = detectObstacles();
      if (sensors.front) {
        startAvoidance(sensors);
      } else {
        if (isRotatingLeft.current) {
          robotRotation.current.y += MANUAL_ROTATION_SPEED;
          updateDirection();
        }
        if (isRotatingRight.current) {
          robotRotation.current.y -= MANUAL_ROTATION_SPEED;
          updateDirection();
        }
        const movement = direction.current.clone().multiplyScalar(speed.current);
        robotPosition.current.add(movement);
      }
    }

    robotPosition.current.clamp(new THREE.Vector3(-7.5, 0, -7.5), new THREE.Vector3(7.5, 0, 7.5));
  });

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isAvoiding.current) {
        switch (event.key) {
          case "ArrowUp": speed.current = SPEED_VALUE; break;
          case "ArrowDown": speed.current = -SPEED_VALUE; break;
          case "ArrowLeft": isRotatingLeft.current = true; break;
          case "ArrowRight": isRotatingRight.current = true; break;
        }
      }
    };

    const handleKeyUp = (event) => {
      switch (event.key) {
        case "ArrowUp":
        case "ArrowDown": speed.current = 0; break;
        case "ArrowLeft": isRotatingLeft.current = false; break;
        case "ArrowRight": isRotatingRight.current = false; break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const restrictCamera = () => {
    if (controlsRef.current) {
      const camera = controlsRef.current.object;
      camera.position.clamp(new THREE.Vector3(-7.5, 0.5, -7.5), new THREE.Vector3(7.5, 9, 7.5));
      controlsRef.current.minDistance = 2;
      controlsRef.current.maxDistance = 15;
      controlsRef.current.minPolarAngle = Math.PI / 4;
      controlsRef.current.maxPolarAngle = Math.PI - Math.PI / 4;
    }
  };

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <hemisphereLight skyColor="#87CEEB" groundColor="#8B5A2B" intensity={0.6} />

      <Robot position={robotPosition.current} rotation={robotRotation.current} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} ref={(ref) => obstaclesRef.current[5] = ref}>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial color="#D2B48C" roughness={0.5} metalness={0.2} />
      </mesh>

      <Carpet position={[0, -0.48, 0]} />
      <Sofa position={[0, -0.1, 5]} setObstacleRef={(ref) => obstaclesRef.current[0] = ref} />
      <CoffeeTable position={[0, -0.1, 3]} setObstacleRef={(ref) => obstaclesRef.current[1] = ref} />
      <TV position={[0, -0.1, -5]} setObstacleRef={(ref) => obstaclesRef.current[2] = ref} />
      <Lamp position={[5, -0.1, 5]} setObstacleRef={(ref) => obstaclesRef.current[3] = ref} />
      <Lamp position={[-5, -0.1, 5]} setObstacleRef={(ref) => obstaclesRef.current[4] = ref} />

      <mesh position={[0, 4.5, -8]} ref={(ref) => obstaclesRef.current[6] = ref}>
        <planeGeometry args={[16, 10]} />
        <meshStandardMaterial color="#F5F5F5" roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 4.5, 8]} ref={(ref) => obstaclesRef.current[7] = ref}>
        <planeGeometry args={[16, 10]} />
        <meshStandardMaterial color="#F5F5F5" roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-8, 4.5, 0]} rotation={[0, Math.PI / 2, 0]} ref={(ref) => obstaclesRef.current[8] = ref}>
        <planeGeometry args={[16, 10]} />
        <meshStandardMaterial color="#E0E0E0" roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[8, 4.5, 0]} rotation={[0, -Math.PI / 2, 0]} ref={(ref) => obstaclesRef.current[9] = ref}>
        <planeGeometry args={[16, 10]} />
        <meshStandardMaterial color="#E0E0E0" roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-3, 4.5, -7.95]}>
        <planeGeometry args={[2, 3]} />
        <meshStandardMaterial color="#ADD8E6" transparent opacity={0.7} roughness={0.2} />
      </mesh>
      <mesh position={[7.95, 4.5, -2]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.5, 1.5]} />
        <meshStandardMaterial color="#4682B4" roughness={0.5} metalness={0.2} />
      </mesh>

      <OrbitControls 
        ref={controlsRef}
        enablePan={false}
        enableZoom={true}
        onChange={restrictCamera}
      />
    </>
  );
}

export default function RobotScene() {
  const [showDialog, setShowDialog] = useState(true);

  const dialogStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
    zIndex: 1000,
    maxWidth: "400px",
    textAlign: "center",
  };

  const buttonStyle = {
    marginTop: "20px",
    padding: "10px 20px",
    background: "#4A90E2",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas
        camera={{ position: [0, 2, 5], fov: 60 }}
        style={{ background: "#87CEEB" }}
        shadows
      >
        <SceneContent />
      </Canvas>

      {showDialog && (
        <div style={dialogStyle}>
          <h2>Bienvenue !</h2>
          <p>
            Voici une reconstitution d’un projet de BTS. Vous pouvez déplacer le robot avec les flèches de ton clavier. Le capteur à ultrason est la face avant !
          </p>
          <button
            style={buttonStyle}
            onClick={() => setShowDialog(false)}
          >
            D'accord
          </button>
        </div>
      )}
    </div>
  );
}