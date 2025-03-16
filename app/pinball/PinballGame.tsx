"use client";

import { useEffect, useRef, useState } from "react";
import * as Phaser from "phaser";

export default function PinballGame() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const [gameDimensions, setGameDimensions] = useState({ width: 400, height: 800 });
  const wsRef = useRef<WebSocket | null>(null);
  const ballRef = useRef<Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | null>(null);
  const leftFlipperRef = useRef<Phaser.GameObjects.Sprite | null>(null);
  const rightFlipperRef = useRef<Phaser.GameObjects.Sprite | null>(null);
  const plungerRef = useRef<Phaser.GameObjects.Sprite | null>(null);
  const scoreTextRef = useRef<Phaser.GameObjects.Text | null>(null);
  const highScoreTextRef = useRef<Phaser.GameObjects.Text | null>(null);
  const isMountedRef = useRef<boolean>(true);

  const calculateGameDimensions = () => {
    const maxWidth = Math.min(window.innerWidth * 0.9, 400);
    const maxHeight = Math.min(window.innerHeight * 0.9, 800);
    return { width: maxWidth, height: maxHeight };
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    isMountedRef.current = true;
    const dimensions = calculateGameDimensions();
    setGameDimensions(dimensions);

    let bumpers: Phaser.GameObjects.Sprite[] = [];
    let targets: Phaser.GameObjects.Sprite[] = [];
    let slingshots: Phaser.GameObjects.Sprite[] = [];
    let score = 0;
    let highScore = localStorage.getItem("highScore") ? parseInt(localStorage.getItem("highScore")!) : 0;
    let isLaunching = true;
    let launchForce = 0;
    let plungerOffset = 0;
    let isLaunchBarrierActive = false;
    const targetCooldowns = new Map<Phaser.GameObjects.Sprite, number>();
    let sceneRef: Phaser.Scene | null = null;
    let lives = 3;
    let isAKeyDown = false;
    let isEKeyDown = false;

    function updateScore() {
      if (scoreTextRef.current) scoreTextRef.current.setText(`Score: ${score}`);
      if (score > highScore && highScoreTextRef.current) {
        highScore = score;
        highScoreTextRef.current.setText(`HIGH SCORE: ${highScore}`);
        localStorage.setItem("highScore", highScore.toString());
      }
    }

    function applyCollisionForce(ball: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, object: Phaser.GameObjects.Sprite, force: number) {
      const velocityX = ball.body.velocity.x as number;
      const velocityY = ball.body.velocity.y as number;
      const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
      const angle = Math.atan2(object.y - ball.y, object.x - ball.x);
      ball.setVelocity(
        -Math.cos(angle) * Math.max(speed * 1.1, force),
        -Math.sin(angle) * Math.max(speed * 1.1, force)
      );
    }

    function applyFlipperForce(ball: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, flipper: Phaser.GameObjects.Sprite, isLeft: boolean) {
      const flipperAngle = flipper.angle * (Math.PI / 180);
      const baseForce = 600;
      const verticalBoost = 800;
      const force = Math.min(baseForce + verticalBoost * Math.abs(Math.sin(flipperAngle)), 1400);
      const flipperCenterX = flipper.x;
      const flipperHalfWidth = 40; // Moitié de la hitbox de 80px
      const ballOffsetX = ball.x - flipperCenterX; // Position relative de la bille sur le flipper

      if (isLeft) {
        // Flipper gauche : propulse vers la droite et vers le haut, avec variation selon la position
        const positionFactor = Math.min(Math.abs(ballOffsetX) / flipperHalfWidth, 1); // Plus fort près des bords
        const adjustedX = Math.cos(flipperAngle) * force * 0.8 * positionFactor;
        const adjustedY = -Math.abs(Math.sin(flipperAngle)) * force * 1.2;
        ball.setVelocity(adjustedX, adjustedY);
        console.log(`Left Flipper hit: Angle=${(flipperAngle * 180 / Math.PI).toFixed(2)}°, OffsetX=${ballOffsetX.toFixed(2)}, Force applied: x=${adjustedX.toFixed(2)}, y=${adjustedY.toFixed(2)}`);
      } else {
        // Flipper droit : propulse vers la gauche et vers le haut, avec variation selon la position
        const positionFactor = Math.min(Math.abs(ballOffsetX) / flipperHalfWidth, 1); // Plus fort près des bords
        const adjustedX = -Math.cos(-flipperAngle) * force * 1.0 * positionFactor; // Forcer une direction vers la gauche
        const adjustedY = -Math.abs(Math.sin(flipperAngle)) * force * 1.2;
        ball.setVelocity(adjustedX, adjustedY);
        console.log(`Right Flipper hit: Angle=${(flipperAngle * 180 / Math.PI).toFixed(2)}°, OffsetX=${ballOffsetX.toFixed(2)}, Force applied: x=${adjustedX.toFixed(2)}, y=${adjustedY.toFixed(2)}`);
      }
    }

    function isNearFlipper(ball: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, flipperX: number) {
      const distanceX = Math.abs(ball.x - (flipperX + 40));
      const distanceY = Math.abs(ball.y - (700 + 10));
      const isNear = distanceX < 80 && distanceY < 60; // Zone de détection verticale augmentée
      console.log(`Ball pos: x=${ball.x.toFixed(2)}, y=${ball.y.toFixed(2)} | Flipper x=${flipperX + 40}, y=710 | DistanceX=${distanceX.toFixed(2)}, DistanceY=${distanceY.toFixed(2)}, isNear=${isNear}`);
      return isNear;
    }

    function isSafePosition(x: number, y: number): boolean {
      const radius = 10;
      return x > 55 + radius && x < dimensions.width - 45 - radius && y > 10 + radius && y < dimensions.height - 10 - radius;
    }

    function checkTriangleCollision(ball: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) {
      const ballX = ball.x;
      const ballY = ball.y;
      const ballRadius = 10;

      if (ballX >= 55 && ballX <= 105 && ballY >= 560 && ballY <= 770) {
        const m = 2;
        const b = 560 - m * 55;
        const lineY = m * ballX + b;
        const distanceToWall = ballY - lineY;

        if (distanceToWall > -ballRadius && distanceToWall < ballRadius) {
          console.log(`Triangle gauche collision: Ball pos x=${ballX.toFixed(2)}, y=${ballY.toFixed(2)}, lineY=${lineY.toFixed(2)}`);
          const normalAngle = Math.atan2(-1, m);
          const incidentAngle = Math.atan2(ball.body.velocity.y as number, ball.body.velocity.x as number);
          const reflectionAngle = 2 * normalAngle - incidentAngle;
          const speed = Math.sqrt(
            (ball.body.velocity.x as number) ** 2 + (ball.body.velocity.y as number) ** 2
          );
          ball.setVelocity(
            Math.cos(reflectionAngle) * speed * 0.7,
            Math.sin(reflectionAngle) * speed * 0.7
          );
          ball.setY(lineY + ballRadius * Math.sin(normalAngle));
          ball.setX(ballX + ballRadius * Math.cos(normalAngle));
        }
      }

      if (ballX >= 275 && ballX <= 325 && ballY >= 540 && ballY <= 750) {
        const m = -2;
        const b = 540 - m * 275;
        const lineY = m * ballX + b;
        const distanceToWall = ballY - lineY;

        if (distanceToWall > -ballRadius && distanceToWall < ballRadius) {
          console.log(`Triangle droit collision: Ball pos x=${ballX.toFixed(2)}, y=${ballY.toFixed(2)}, lineY=${lineY.toFixed(2)}`);
          const normalAngle = Math.atan2(-1, m);
          const incidentAngle = Math.atan2(ball.body.velocity.y as number, ball.body.velocity.x as number);
          const reflectionAngle = 2 * normalAngle - incidentAngle;
          const speed = Math.sqrt(
            (ball.body.velocity.x as number) ** 2 + (ball.body.velocity.y as number) ** 2
          );
          ball.setVelocity(
            Math.cos(reflectionAngle) * speed * 0.7,
            Math.sin(reflectionAngle) * speed * 0.7
          );
          ball.setY(lineY + ballRadius * Math.sin(normalAngle));
          ball.setX(ballX + ballRadius * Math.cos(normalAngle));
        }
      }
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: dimensions.width,
      height: dimensions.height,
      parent: "game-container",
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 800, x: 0 },
          debug: false,
          overlapBias: 4,
        },
      },
      audio: {
        disableWebAudio: true,
      },
      scene: {
        preload,
        create,
        update,
      },
    };

    function preload(this: Phaser.Scene) {
      this.load.svg("ball", "/assets/space-ball.svg", { width: 20, height: 20 });
      this.load.svg("flipper", "/assets/ufo-flipper.svg", { width: 80, height: 20 });
      this.load.svg("bumper", "/assets/asteroid-bumper.svg", { width: 40, height: 40 });
      this.load.svg("planet-target", "/assets/planet-target.svg", { width: 40, height: 40 });
      this.load.svg("rocket-launcher", "/assets/rocket-launcher.svg", { width: 20, height: 100 });
      this.load.svg("rslingshot", "/assets/rslingshot.svg", { width: 60, height: 180 });
      this.load.svg("gslingshot", "/assets/gslingshot.svg", { width: 60, height: 180 });
      this.load.svg("background", "/assets/space-background.svg", { width: 400, height: 800 });
    }

    function create(this: Phaser.Scene) {
      sceneRef = this;
      this.add.image(dimensions.width / 2, dimensions.height / 2, "background");

      const walls = this.physics.add.staticGroup();
      walls.create(10, dimensions.height / 2, undefined).setSize(10, dimensions.height).setVisible(false).refreshBody(); // Gauche extérieur (x: 10, y: 0 à 800)
      walls.create(dimensions.width - 10, dimensions.height / 2, undefined).setSize(10, dimensions.height).setVisible(false).refreshBody(); // Droit extérieur (x: 390, y: 0 à 800)
      walls.create(dimensions.width / 2, 10, undefined).setSize(dimensions.width - 20, 10).setVisible(false).refreshBody(); // Haut extérieur (y: 10, x: 10 à 390)
      walls.create(55, dimensions.height / 2, undefined).setSize(10, dimensions.height - 40).setVisible(false).refreshBody(); // Gauche intérieur (x: 55, y: 40 à 800)
      walls.create(dimensions.width - 45, (dimensions.height + 240) / 2, undefined).setSize(10, dimensions.height - 240).setVisible(false).refreshBody(); // Droit intérieur bas (x: 355, y: 240 à 800)
      walls.create(dimensions.width - 45, 100, undefined).setSize(10, 120).setVisible(false).refreshBody(); // Droit intérieur haut (x: 355, y: 40 à 160)
      walls.create(dimensions.width / 2, 40, undefined).setSize(dimensions.width - 100, 10).setVisible(false).refreshBody(); // Haut intérieur (y: 40, x: 50 à 350)
      walls.create(dimensions.width - 32, 159, undefined).setSize(45, 10).setVisible(false).refreshBody(); // Barrière de lancement (y: 159, x: 345 à 390)

      // Barrière invisible pour le tunnel de lancement
      const launchBarrier = walls.create(dimensions.width - 25, dimensions.height * 0.2, undefined)
        .setSize(20, 10)
        .setVisible(false)
        .refreshBody();

      const leftTriangle = walls.create(80, 720, undefined).setSize(50, 210).setAngle(20).setVisible(false);
      const rightTriangle = walls.create(dimensions.width - 100, 700, undefined).setSize(50, 210).setAngle(-20).setVisible(false);
      if (leftTriangle.body) (leftTriangle.body as Phaser.Physics.Arcade.StaticBody).setOffset(-25, -105);
      if (rightTriangle.body) (rightTriangle.body as Phaser.Physics.Arcade.StaticBody).setOffset(25, -105);

      const graphics = this.add.graphics();
      graphics.fillStyle(0x808080, 1);
      graphics.beginPath();
      graphics.moveTo(55, dimensions.height * 0.7);
      graphics.lineTo(105, dimensions.height * 0.85);
      graphics.lineTo(55, dimensions.height - 30);
      graphics.closePath();
      graphics.fill();
      graphics.beginPath();
      graphics.moveTo(dimensions.width - 45, dimensions.height * 0.7);
      graphics.lineTo(dimensions.width - 105, dimensions.height * 0.85);
      graphics.lineTo(dimensions.width - 45, dimensions.height - 30);
      graphics.closePath();
      graphics.fill();

      graphics.lineStyle(2, 0x808080, 1);
      graphics.beginPath();
      graphics.moveTo(10, dimensions.height);
      graphics.lineTo(10, 10);
      graphics.lineTo(dimensions.width - 10, 10);
      graphics.lineTo(dimensions.width - 10, dimensions.height);
      graphics.moveTo(55, dimensions.height);
      graphics.lineTo(55, 40);
      graphics.moveTo(dimensions.width - 45, dimensions.height);
      graphics.lineTo(dimensions.width - 45, dimensions.height * 0.3);
      graphics.moveTo(dimensions.width - 45, dimensions.height * 0.2);
      graphics.lineTo(dimensions.width - 45, 40);
      graphics.moveTo(55, 40);
      graphics.lineTo(dimensions.width - 45, 40);
      graphics.strokePath();
      graphics.lineStyle(3, 0x808080, 1);
      graphics.beginPath();
      graphics.moveTo(dimensions.width - 45, 159);
      graphics.lineTo(dimensions.width - 10, 159);
      graphics.strokePath();

      plungerRef.current = this.add.sprite(dimensions.width - 25, dimensions.height - 150, "rocket-launcher").setTint(0xffff00);
      this.physics.add.existing(plungerRef.current, true);

      ballRef.current = this.physics.add.sprite(dimensions.width - 25, dimensions.height - 170, "ball")
        .setCircle(10)
        .setBounce(0.5)
        .setMass(1)
        .setDamping(true)
        .setDrag(0.9, 0.9);

      this.physics.world.setBounds(0, 0, dimensions.width, dimensions.height);

      const staticGroup = this.physics.add.staticGroup();

      // Rapprocher légèrement les flippers
      leftFlipperRef.current = staticGroup.create(145, 700, "flipper").setAngle(30).setTint(0xff69b4); // Déplacé de 140 à 145
      rightFlipperRef.current = staticGroup.create(255, 700, "flipper").setAngle(-30).setTint(0xff69b4); // Déplacé de 260 à 255

      if (leftFlipperRef.current?.body) {
        const body = leftFlipperRef.current.body as Phaser.Physics.Arcade.StaticBody;
        body.setSize(80, 20);
        body.setOffset(0, 0);
      }
      if (rightFlipperRef.current?.body) {
        const body = rightFlipperRef.current.body as Phaser.Physics.Arcade.StaticBody;
        body.setSize(80, 20);
        body.setOffset(0, 0);
      }

      bumpers.push(staticGroup.create(dimensions.width * 0.5, dimensions.height * 0.35, "bumper").setTint(0xffff00));
      bumpers.push(staticGroup.create(dimensions.width * 0.35, dimensions.height * 0.45, "bumper").setTint(0xffff00));
      bumpers.push(staticGroup.create(dimensions.width * 0.65, dimensions.height * 0.45, "bumper").setTint(0xffff00));

      targets.push(staticGroup.create(dimensions.width * 0.35, dimensions.height * 0.25, "planet-target").setTint(0xff0000));
      targets.push(staticGroup.create(dimensions.width * 0.65, dimensions.height * 0.25, "planet-target").setTint(0xff0000));

      bumpers.forEach(bumper => {
        this.physics.add.existing(bumper, true);
        if (bumper.body) (bumper.body as Phaser.Physics.Arcade.StaticBody).setCircle(20);
      });

      targets.forEach(target => {
        this.physics.add.existing(target, true);
        if (target.body) (target.body as Phaser.Physics.Arcade.StaticBody).setCircle(20);
      });

      scoreTextRef.current = this.add.text(10, 10, `Score: ${score}`, { fontSize: "18px", color: "#fff" });
      highScoreTextRef.current = this.add.text(10, 30, `HIGH SCORE: ${highScore}`, { fontSize: "18px", color: "#fff" });

      this.physics.add.collider(ballRef.current!, walls);
      this.physics.add.collider(ballRef.current!, leftFlipperRef.current!, (ball, flipper) => {
        const ballBody = ball as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
        if (isAKeyDown) { // Propulsion immédiate au contact si A est enfoncé
          applyFlipperForce(ballBody, flipper as Phaser.GameObjects.Sprite, true);
        }
      });
      this.physics.add.collider(ballRef.current!, rightFlipperRef.current!, (ball, flipper) => {
        const ballBody = ball as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
        if (isEKeyDown) { // Propulsion immédiate au contact si E est enfoncé
          applyFlipperForce(ballBody, flipper as Phaser.GameObjects.Sprite, false);
        }
      });
      this.physics.add.collider(ballRef.current!, plungerRef.current!, () => {
        if (isLaunching && ballRef.current) {
          ballRef.current.setPosition(dimensions.width - 25, dimensions.height - 170 + plungerOffset);
          ballRef.current.setVelocity(0, 0);
        }
      });
      this.physics.add.collider(ballRef.current!, bumpers, (object1, object2) => {
        const ball = object1 as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
        const bumper = object2 as Phaser.GameObjects.Sprite;
        score += 100;
        updateScore();
        bumper.setTint(0xff0000);
        this.tweens.add({
          targets: bumper,
          scale: { from: 1.2, to: 1 },
          duration: 100,
          onComplete: () => bumper.setTint(0xffff00),
        });
        applyCollisionForce(ball, bumper, 200);
        const dx = ball.x - bumper.x;
        const dy = ball.y - bumper.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = 30;
        if (distance < minDistance) {
          const angle = Math.atan2(dy, dx);
          ball.setPosition(bumper.x + Math.cos(angle) * minDistance, bumper.y + Math.sin(angle) * minDistance);
        }
        if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send("hitBumper");
      });
      this.physics.add.collider(ballRef.current!, targets, (ball, target) => {
        const t = target as Phaser.GameObjects.Sprite;
        const now = Date.now();
        const lastHit = targetCooldowns.get(t) || 0;
        if (now - lastHit > 10000) {
          score += 200;
          updateScore();
          t.setTint(0x00ff00);
          targetCooldowns.set(t, now);
          this.tweens.add({
            targets: t,
            scale: { from: 1.2, to: 1 },
            duration: 100,
            onComplete: () => setTimeout(() => t.setTint(0xff0000), 10000),
          });
          if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send("hitTarget");
        }
      });

      function setupControls(scene: Phaser.Scene) {
        if (scene.input.keyboard) {
          scene.input.keyboard.on("keydown-SPACE", () => {
            console.log(`Space pressed | isLaunching=${isLaunching}, ballRef.current=${!!ballRef.current}`);
            if (ballRef.current && !isLaunching) {
              const ball = ballRef.current;
              const nearLeftFlipper = isNearFlipper(ball, 145); // Ajusté pour la nouvelle position
              const nearRightFlipper = isNearFlipper(ball, 255); // Ajusté pour la nouvelle position
              console.log(`Space check: Near left=${nearLeftFlipper}, Near right=${nearRightFlipper}, Ball pos: x=${ball.x.toFixed(2)}, y=${ball.y.toFixed(2)}`);
              if (nearLeftFlipper || nearRightFlipper) {
                console.log("Initiating teleport to top");
                const targetX = dimensions.width - 25;
                let targetY = 50;
                if (!isSafePosition(targetX, targetY)) {
                  targetY = 100;
                  while (!isSafePosition(targetX, targetY) && targetY < 200) targetY += 10;
                }
                scene.physics.world.pause();
                scene.tweens.add({
                  targets: ball,
                  x: targetX,
                  y: targetY,
                  duration: 400,
                  ease: "Quadratic.InOut",
                  onComplete: () => {
                    if (ball) {
                      ball.setVelocity(0, -1200);
                      isLaunching = true;
                      launchForce = 0;
                      plungerRef.current?.setY(dimensions.height - 150);
                      scene.physics.world.resume();
                      if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send("launchAssist");
                      console.log(`Teleport completed to x=${targetX}, y=${targetY}, velocity set to 0, -1200`);
                    }
                  },
                });
              }
            }
            if (isLaunching && plungerRef.current) {
              launchForce = Math.min(launchForce + 15, 800);
              plungerOffset = Math.min(launchForce / 20, 40);
              plungerRef.current.setY(dimensions.height - 150 + plungerOffset);
              if (ballRef.current) ballRef.current.setY(dimensions.height - 170 + plungerOffset);
              if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send("chargeLaunch");
            }
          });

          scene.input.keyboard.on("keyup-SPACE", () => {
            if (isLaunching && launchForce > 0 && ballRef.current && plungerRef.current && sceneRef) {
              const initialVelocityY = -launchForce;
              ballRef.current.setVelocity(0, initialVelocityY);
              plungerRef.current.setY(dimensions.height - 150);
              plungerOffset = 0;
              isLaunching = false;
              isLaunchBarrierActive = true;
              sceneRef.tweens.add({
                targets: ballRef.current,
                x: dimensions.width - 46,
                y: dimensions.height * 0.2,
                duration: 300,
                ease: "Quad.easeOut",
                onComplete: () => {
                  if (ballRef.current) {
                    ballRef.current.setVelocity(-200, initialVelocityY * 0.8);
                  }
                },
              });
              launchForce = 0;
              if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send("launch");
            }
          });

          scene.input.keyboard.on("keydown-A", () => {
            if (leftFlipperRef.current) {
              leftFlipperRef.current.setAngle(-45);
              isAKeyDown = true;
              if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send("leftFlipperUp");
            }
          });

          scene.input.keyboard.on("keyup-A", () => {
            if (leftFlipperRef.current) {
              leftFlipperRef.current.setAngle(30);
              isAKeyDown = false;
              if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send("leftFlipperDown");
            }
          });

          scene.input.keyboard.on("keydown-E", () => {
            if (rightFlipperRef.current) {
              rightFlipperRef.current.setAngle(45);
              isEKeyDown = true;
              if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send("rightFlipperUp");
            }
          });

          scene.input.keyboard.on("keyup-E", () => {
            if (rightFlipperRef.current) {
              rightFlipperRef.current.setAngle(-30);
              isEKeyDown = false;
              if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send("rightFlipperDown");
            }
          });

          scene.physics.world.on("worldbounds", (body: Phaser.Physics.Arcade.Body) => {
            if (body.gameObject === ballRef.current && body.position.y > dimensions.height - 20) {
              resetBall();
            }
          });
        }
      }

      setupControls(this);

      function resetBall() {
        if (ballRef.current && plungerRef.current) {
          ballRef.current.setPosition(dimensions.width - 25, dimensions.height - 170);
          ballRef.current.setVelocity(0, 0);
          isLaunching = true;
          isLaunchBarrierActive = false;
          launchForce = 0;
          plungerRef.current.setY(dimensions.height - 150);
          plungerOffset = 0;
          lives--;
          if (lives <= 0) {
            score = 0;
            lives = 3;
            if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send("gameOver");
          } else {
            if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send("resetBall");
          }
          updateScore();
        
        }
      }

      if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send("gameStart");
    }

    function update(this: Phaser.Scene) {
      if (ballRef.current && ballRef.current.y > dimensions.height + 20) {
        isLaunching = true;
        if (ballRef.current) {
          const randomX = 350 + Math.random() * 50;
          const randomY = 600 + Math.random() * 50;
          ballRef.current.setPosition(randomX, randomY);
          ballRef.current.setVelocity((Math.random() - 0.5) * 200, -Math.random() * 300);
        }
        score = 0;
        if (scoreTextRef.current) scoreTextRef.current.setText(`Score: ${score}`);
        if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send("ballLost");
      }

      if (ballRef.current && !isLaunching) {
        const vx = ballRef.current.body.velocity.x as number;
        const vy = ballRef.current.body.velocity.y as number;
        const speed = Math.sqrt(vx * vx + vy * vy);
        const maxSpeed = 1200;
        if (speed > maxSpeed) {
          const scale = maxSpeed / speed;
          if (ballRef.current) ballRef.current.setVelocity(vx * scale, vy * scale);
        }
        if (Math.abs(vx) < 20 && Math.abs(vy) < 20) {
          const nudge = 50;
          if (ballRef.current) ballRef.current.setVelocity(
            vx + (Math.random() - 0.5) * nudge,
            vy - Math.random() * nudge
          );
        }
        // Vérification pour éviter la disparition hors écran
        if (ballRef.current.y < 0 || ballRef.current.x < 0 || ballRef.current.x > dimensions.width) {
          ballRef.current.setPosition(
            Math.max(10, Math.min(dimensions.width - 10, ballRef.current.x)),
            Math.max(10, ballRef.current.y)
          );
          ballRef.current.setVelocity(-vx * 0.5, -vy * 0.5); // Réinitialisation avec rebond
          console.log(`Ball repositioned from invalid position: x=${ballRef.current.x.toFixed(2)}, y=${ballRef.current.y.toFixed(2)}`);
        }
        // Faire tomber la bille entre les flippers si aucun input (zone ajustée)
        if (ballRef.current.x >= 185 && ballRef.current.x <= 215 && ballRef.current.y >= 690 && ballRef.current.y <= 710 && !isAKeyDown && !isEKeyDown && Math.abs(vy) < 50) {
          resetBall(); // Simule une perte si la bille stagne entre les flippers
          console.log(`Ball dropped between flippers at x=${ballRef.current.x.toFixed(2)}, y=${ballRef.current.y.toFixed(2)}`);
        }
        // Vérification pour empêcher le retour dans le tunnel
        if (isLaunchBarrierActive) {
          const ballX = ballRef.current.x;
          const ballY = ballRef.current.y;
          if (ballX >= dimensions.width - 35 && ballX <= dimensions.width - 15 && ballY >= dimensions.height * 0.2 && ballY <= dimensions.height - 170) {
            ballRef.current.setPosition(dimensions.width - 36, ballY);
            ballRef.current.setVelocity(-100, ballRef.current.body.velocity.y);
          }
        }
        checkTriangleCollision(ballRef.current);
      }
    }

    const connectWebSocket = () => {
      try {
        const ws = new WebSocket("wss://portfolio-spring-boot-backend.onrender.com/game");
        wsRef.current = ws;
        ws.onopen = () => console.log("WebSocket connected successfully");
        ws.onmessage = (event) => console.log("Message from server:", event.data);
        ws.onerror = (error) => console.error("WebSocket error details:", error);
        ws.onclose = (event) => {
          if (isMountedRef.current) setTimeout(connectWebSocket, 5000);
        };
      } catch (error) {
        console.error("WebSocket connection failed:", error);
        if (isMountedRef.current) setTimeout(connectWebSocket, 5000);
      }
    };

    connectWebSocket();
    gameRef.current = new Phaser.Game(config);

    const handleResize = () => {
      if (!isMountedRef.current) return;
      const dimensions = calculateGameDimensions();
      if (gameRef.current) {
        gameRef.current.scale.resize(dimensions.width, dimensions.height);
        setGameDimensions(dimensions);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener("resize", handleResize);
      wsRef.current?.close();
      gameRef.current?.destroy(true);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <h1 className="text-2xl font-bold text-white mb-4">Space Pinball</h1>
      <div id="game-container" className="border border-gray-700 rounded shadow-lg"></div>
      <div className="mt-4 text-white text-sm">
        <p>Controls: A/E keys for flippers, SPACE to launch or assist</p>
      </div>
    </div>
  );
}

function resetBall() {
  throw new Error("Function not implemented.");
}
