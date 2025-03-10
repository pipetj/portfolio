"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

function Robot({ position, rotation, onUpdateTilt }) {
  const robotRef = useRef();
  // Make sure the path to the model is correct
  const { scene } = useGLTF("/models/robot.glb");
  
  // Tilt state
  const [tiltAngle, setTiltAngle] = useState(0);
  const [targetTilt, setTargetTilt] = useState(0);
  
  // Sensor offset
  const sensorOffset = { x: 0, y: 0, z: 0.2 };

  // Expose the updateTilt function via onUpdateTilt prop
  useEffect(() => {
    if (onUpdateTilt) {
      onUpdateTilt((rotationDelta) => {
        if (rotationDelta > 0) {
          setTargetTilt(-0.2);
        } else if (rotationDelta < 0) {
          setTargetTilt(0.2);
        } else {
          setTargetTilt(0);
        }
      });
    }
  }, [onUpdateTilt]);

  useFrame(() => {
    if (robotRef.current) {
      // Rotate the robot 90 degrees to face forward properly
      robotRef.current.rotation.y = rotation.y + Math.PI / 2;
      
      // Smooth tilt
      setTiltAngle(prev => prev + (targetTilt - prev) * 0.1);
      robotRef.current.rotation.z = tiltAngle;
      
      // Global position
      robotRef.current.position.set(position.x, position.y, position.z);
      
      // Adjust position for sensor
      const localOffset = new THREE.Vector3(sensorOffset.x, sensorOffset.y, sensorOffset.z);
      localOffset.applyEuler(new THREE.Euler(0, rotation.y + Math.PI / 2, tiltAngle));
      robotRef.current.position.sub(localOffset);
    }
  });

  return <primitive ref={robotRef} object={scene} scale={[10, 10, 10]} />;
}

// Furniture components
function Sofa({ position }) {
  return (
    <group position={position}>
      // Sofa base
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[3, 0.6, 1]} />
        <meshStandardMaterial color="#964B00" />
      </mesh>
      // Sofa back
      <mesh position={[0, 0.9, -0.4]}>
        <boxGeometry args={[3, 0.6, 0.2]} />
        <meshStandardMaterial color="#964B00" />
      </mesh>
      // Sofa cushions
      <mesh position={[-0.9, 0.7, 0]}>
        <boxGeometry args={[0.9, 0.2, 0.8]} />
        <meshStandardMaterial color="#C19A6B" />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[0.9, 0.2, 0.8]} />
        <meshStandardMaterial color="#C19A6B" />
      </mesh>
      <mesh position={[0.9, 0.7, 0]}>
        <boxGeometry args={[0.9, 0.2, 0.8]} />
        <meshStandardMaterial color="#C19A6B" />
      </mesh>
    </group>
  );
}

function CoffeeTable({ position }) {
  return (
    <group position={position}>
      // Table top
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1.5, 0.1, 0.8]} />
        <meshStandardMaterial color="#5C4033" />
      </mesh>
      // Table legs
      <mesh position={[-0.6, 0.15, -0.3]}>
        <boxGeometry args={[0.1, 0.3, 0.1]} />
        <meshStandardMaterial color="#5C4033" />
      </mesh>
      <mesh position={[0.6, 0.15, -0.3]}>
        <boxGeometry args={[0.1, 0.3, 0.1]} />
        <meshStandardMaterial color="#5C4033" />
      </mesh>
      <mesh position={[-0.6, 0.15, 0.3]}>
        <boxGeometry args={[0.1, 0.3, 0.1]} />
        <meshStandardMaterial color="#5C4033" />
      </mesh>
      <mesh position={[0.6, 0.15, 0.3]}>
        <boxGeometry args={[0.1, 0.3, 0.1]} />
        <meshStandardMaterial color="#5C4033" />
      </mesh>
    </group>
  );
}

function Carpet({ position }) {
  return (
    <mesh position={[position.x, position.y, position.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[6, 4]} />
      <meshStandardMaterial color="#B22222" side={THREE.DoubleSide} />
    </mesh>
  );
}

function TV({ position }) {
  return (
    <group position={position}>
      // TV Stand
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[2, 0.6, 0.4]} />
        <meshStandardMaterial color="#2F4F4F" />
      </mesh>
      // TV
      <mesh position={[0, 1.8, 0]}>
        <boxGeometry args={[1.8, 1, 0.1]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      // TV Screen
      <mesh position={[0, 1.8, 0.06]}>
        <planeGeometry args={[1.7, 0.9]} />
        <meshStandardMaterial color="#1E90FF" emissive="#1E90FF" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function Lamp({ position }) {
  return (
    <group position={position}>
      // Lamp Base
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#696969" />
      </mesh>
      // Lamp Pole
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.4, 8]} />
        <meshStandardMaterial color="#A9A9A9" />
      </mesh>
      // Lamp Shade
      <mesh position={[0, 1.6, 0]}>
        <coneGeometry args={[0.3, 0.4, 16, 1, true]} />
        <meshStandardMaterial color="#F5F5DC" side={THREE.DoubleSide} emissive="#F5F5DC" emissiveIntensity={0.3} />
      </mesh>
      // Light
      <pointLight position={[0, 1.6, 0]} intensity={0.8} distance={5} color="#FFF9E5" />
    </group>
  );
}

export default function RobotScene() {
  // Position and orientation of the robot
  const robotPosition = useRef(new THREE.Vector3(0, 0, 0));
  const robotRotation = useRef({ y: 0 });
  
  // Direction vector and speed
  const direction = useRef(new THREE.Vector3(0, 0, -1)); // Initial direction (towards -Z)
  const speed = useRef(0); // Current speed
  
  // Movement constants
  const SPEED_VALUE = 0.05;
  const ROTATION_SPEED = 0.05;
  
  // Reference to updateTilt function
  const updateTiltRef = useRef(null);
  
  // Define the function that will be called by Robot
  const setUpdateTilt = (updateTiltFn) => {
    updateTiltRef.current = updateTiltFn;
  };

  // Update direction based on rotation
  const updateDirection = () => {
    // Calculate direction based on rotation
    direction.current.set(0, 0, -1); // Reset to default direction (forward)
    
    // Create a rotation matrix based on Y angle
    const rotationMatrix = new THREE.Matrix4().makeRotationY(robotRotation.current.y);
    
    // Apply rotation to direction
    direction.current.applyMatrix4(rotationMatrix);
    direction.current.normalize(); // Normalize to maintain consistent speed
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      let rotationDelta = 0;

      switch (event.key) {
        case "ArrowUp":
          // Inversé: maintenant flèche haut = reculer
          speed.current = -SPEED_VALUE;
          break;
        case "ArrowDown":
          // Inversé: maintenant flèche bas = avancer
          speed.current = SPEED_VALUE;
          break;
        case "ArrowLeft":
          robotRotation.current.y += ROTATION_SPEED; // Tourner à gauche
          rotationDelta = ROTATION_SPEED;
          updateDirection(); // Mettre à jour la direction
          break;
        case "ArrowRight":
          robotRotation.current.y -= ROTATION_SPEED; // Tourner à droite
          rotationDelta = -ROTATION_SPEED;
          updateDirection(); // Mettre à jour la direction
          break;
      }

      // Mettre à jour l'inclinaison
      if (updateTiltRef.current) {
        updateTiltRef.current(rotationDelta);
      }
    };

    const handleKeyUp = (event) => {
      switch (event.key) {
        case "ArrowUp":
        case "ArrowDown":
          speed.current = 0; // Arrêter
          break;
        case "ArrowLeft":
        case "ArrowRight":
          if (updateTiltRef.current) {
            updateTiltRef.current(0);
          }
          break;
      }
    };

    // Animation
    const animate = () => {
      // Calculer le déplacement
      const movement = direction.current.clone().multiplyScalar(speed.current);
      
      // Appliquer le déplacement
      robotPosition.current.add(movement);
      
      // Limites de la pièce - pièce plus grande
      if (robotPosition.current.x > 7.5) robotPosition.current.x = 7.5;
      if (robotPosition.current.x < -7.5) robotPosition.current.x = -7.5;
      if (robotPosition.current.z > 7.5) robotPosition.current.z = 7.5;
      if (robotPosition.current.z < -7.5) robotPosition.current.z = -7.5;

      requestAnimationFrame(animate);
    };
    
    // Initialiser la direction
    updateDirection();
    animate();

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas
        camera={{ position: [0, 7, 15], fov: 60 }}
        style={{ background: "#87CEEB" }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 10, 5]} intensity={0.8} />
        <hemisphereLight skyColor="#87CEEB" groundColor="#5A4C35" intensity={0.5} />

        {/* Robot */}
        <Robot 
          position={robotPosition.current} 
          rotation={robotRotation.current} 
          onUpdateTilt={setUpdateTilt}
        />

        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
          <planeGeometry args={[16, 16]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>

        {/* Carpet */}
        <Carpet position={[0, -0.48, 0]} />

        {/* Living Room Furniture */}
        <Sofa position={[0, -0.1, 5]} />
        <CoffeeTable position={[0, -0.1, 3]} />
        <TV position={[0, -0.1, -5]} />
        <Lamp position={[5, -0.1, 5]} />
        <Lamp position={[-5, -0.1, 5]} />

        {/* North Wall */}
        <mesh position={[0, 4.5, -8]}>
          <planeGeometry args={[16, 10]} />
          <meshStandardMaterial color="#FDF5E6" side={THREE.DoubleSide} />
        </mesh>

        {/* South Wall */}
        <mesh position={[0, 4.5, 8]}>
          <planeGeometry args={[16, 10]} />
          <meshStandardMaterial color="#FDF5E6" side={THREE.DoubleSide} />
        </mesh>

        {/* West Wall */}
        <mesh position={[-8, 4.5, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[16, 10]} />
          <meshStandardMaterial color="#F5DEB3" side={THREE.DoubleSide} />
        </mesh>

        {/* East Wall */}
        <mesh position={[8, 4.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[16, 10]} />
          <meshStandardMaterial color="#F5DEB3" side={THREE.DoubleSide} />
        </mesh>

        {/* Window on North Wall */}
        <mesh position={[-3, 4.5, -7.95]}>
          <planeGeometry args={[2, 3]} />
          <meshStandardMaterial color="#ADD8E6" transparent opacity={0.7} />
        </mesh>

        {/* Picture Frame on East Wall */}
        <mesh position={[7.95, 4.5, -2]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[1.5, 1.5]} />
          <meshStandardMaterial color="#4682B4" />
        </mesh>

        <OrbitControls enablePan={false} enableZoom={true} />
      </Canvas>
    </div>
  );
}