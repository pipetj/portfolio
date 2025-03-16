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
    const targetCooldowns = new Map<Phaser.GameObjects.Sprite, number>();
    let sceneRef: Phaser.Scene | null = null;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: dimensions.width,
      height: dimensions.height,
      parent: "game-container",
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 800, x: 0 },
          debug: false, // Mettre à true pour déboguer les collisions
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

      // Murs
      const walls = this.physics.add.staticGroup();
      walls.create(55, dimensions.height / 2, undefined).setSize(10, dimensions.height).setVisible(false);
      walls.create(dimensions.width - 45, dimensions.height / 2, undefined).setSize(10, dimensions.height).setVisible(false);
      walls.create(dimensions.width / 2, 40, undefined).setSize(dimensions.width - 80, 10).setVisible(false);
      walls.create(10, dimensions.height / 2, undefined).setSize(10, dimensions.height).setVisible(false);
      walls.create(dimensions.width - 10, dimensions.height / 2, undefined).setSize(10, dimensions.height).setVisible(false);
      walls.create(dimensions.width / 2, 10, undefined).setSize(dimensions.width - 20, 10).setVisible(false);
      walls.create(dimensions.width - 32, 159, undefined).setSize(45, 10).setVisible(false);
      walls.create(60, 300, undefined).setSize(10, 400).setVisible(false);
      walls.create(dimensions.width - 50, 300, undefined).setSize(10, 400).setVisible(false);
      walls.create(dimensions.width / 2, 100, undefined).setSize(200, 10).setVisible(false);

      // Triangles inclinés (ajustement pour collisions précises)
      const leftTriangle = walls.create(80, 720, undefined).setSize(50, 10).setAngle(20).setVisible(true).setTint(0x808080);
      const rightTriangle = walls.create(dimensions.width - 80, 720, undefined).setSize(50, 10).setAngle(-20).setVisible(true).setTint(0x808080);
      (leftTriangle.body as Phaser.Physics.Arcade.StaticBody).setOffset(-10, -5);
      (rightTriangle.body as Phaser.Physics.Arcade.StaticBody).setOffset(10, -5);

      const graphics = this.add.graphics();
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
      graphics.moveTo(55, dimensions.height * 0.7);
      graphics.lineTo(105, dimensions.height * 0.85);
      graphics.lineTo(55, dimensions.height - 30);
      graphics.moveTo(dimensions.width - 45, dimensions.height * 0.7);
      graphics.lineTo(dimensions.width - 105, dimensions.height * 0.85);
      graphics.lineTo(dimensions.width - 45, dimensions.height - 30);
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
        .setBounce(0.7)
        .setMass(0.5)
        .setDamping(true)
        .setDrag(0.99, 0.99);

      this.physics.world.setBounds(0, 0, dimensions.width, dimensions.height);

      const staticGroup = this.physics.add.staticGroup();
      leftFlipperRef.current = staticGroup.create(140, 700, "flipper").setAngle(30).setTint(0xff69b4);
      rightFlipperRef.current = staticGroup.create(260, 700, "flipper").setAngle(-30).setTint(0xff69b4);

      slingshots.push(staticGroup.create(140, 500, "gslingshot").setAngle(20).setScale(1.5).setTint(0x800080));
      slingshots.push(staticGroup.create(260, 500, "rslingshot").setAngle(-20).setScale(1.5).setTint(0x800080));

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

      slingshots.forEach(slingshot => {
        this.physics.add.existing(slingshot, true);
        if (slingshot.body) (slingshot.body as Phaser.Physics.Arcade.StaticBody).setSize(5, 5);
      });

      if (leftFlipperRef.current?.body) (leftFlipperRef.current.body as Phaser.Physics.Arcade.StaticBody).setSize(80, 20);
      if (rightFlipperRef.current?.body) (rightFlipperRef.current.body as Phaser.Physics.Arcade.StaticBody).setSize(80, 20);

      scoreTextRef.current = this.add.text(10, 10, `Score: ${score}`, { fontSize: "18px", color: "#fff" });
      highScoreTextRef.current = this.add.text(10, 30, `HIGH SCORE: ${highScore}`, { fontSize: "18px", color: "#fff" });

      this.physics.add.collider(ballRef.current!, walls);
      this.physics.add.collider(ballRef.current!, leftFlipperRef.current!, (ball, flipper) => {
        applyFlipperForce(ball as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, flipper as Phaser.GameObjects.Sprite, true);
      });
      this.physics.add.collider(ballRef.current!, rightFlipperRef.current!, (ball, flipper) => {
        applyFlipperForce(ball as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, flipper as Phaser.GameObjects.Sprite, false);
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
          ball.setPosition(
            bumper.x + Math.cos(angle) * minDistance,
            bumper.y + Math.sin(angle) * minDistance
          );
        }
        if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send("hitBumper");
      }, undefined, this);

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
            onComplete: () => {
              setTimeout(() => t.setTint(0xff0000), 10000);
            },
          });
          if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send("hitTarget");
        }
      }, undefined, this);

      this.physics.add.collider(ballRef.current!, slingshots, (ball, slingshot) => {
        const s = slingshot as Phaser.GameObjects.Sprite;
        score += 50;
        updateScore();
        s.setTint(0x0000ff);
        this.tweens.add({
          targets: s,
          alpha: { from: 0.5, to: 1 },
          duration: 100,
          onComplete: () => s.setTint(0x800080),
        });
        const isLeft = s.x < dimensions.width / 2;
        if (ballRef.current) ballRef.current.setVelocity(isLeft ? -400 : 400, -200);
        if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send("hitSlingshot");
      }, undefined, this);

      function updateScore() {
        if (scoreTextRef.current) scoreTextRef.current.setText(`Score: ${score}`);
        if (score > highScore && highScoreTextRef.current) {
          highScore = score;
          highScoreTextRef.current.setText(`HIGH SCORE: ${highScore}`);
          localStorage.setItem("highScore", highScore.toString());
        }
      }

      function applyCollisionForce(ball: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, object: Phaser.GameObjects.Sprite, force: number) {
        const velocityX = ball.body.velocity.x;
        const velocityY = ball.body.velocity.y;
        const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
        const angle = Math.atan2(object.y - ball.y, object.x - ball.x);
        ball.setVelocity(
          -Math.cos(angle) * Math.max(speed * 1.1, force),
          -Math.sin(angle) * Math.max(speed * 1.1, force)
        );
      }

      function applyFlipperForce(ball: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, flipper: Phaser.GameObjects.Sprite, isLeft: boolean) {
        const angle = Math.atan2(ball.y - flipper.y, ball.x - flipper.x);
        const force = 800;
        ball.setVelocity(
          Math.cos(angle + (isLeft ? -Math.PI / 4 : Math.PI / 4)) * force,
          Math.sin(angle + (isLeft ? -Math.PI / 4 : Math.PI / 4)) * force
        );
      }

      setupControls(this);

      function setupControls(scene: Phaser.Scene) {
        if (scene.input.keyboard) {
          scene.input.keyboard.on("keydown-SPACE", () => {
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

              sceneRef.tweens.add({
                targets: ballRef.current,
                x: dimensions.width - 46,
                y: dimensions.height * 0.2,
                duration: 300,
                ease: "Quad.easeOut",
                onUpdate: () => {
                  if (ballRef.current!.body.velocity.y === 0) {
                    ballRef.current!.setVelocity(0, initialVelocityY);
                  }
                },
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
              leftFlipperRef.current.setAngle(-30);
              if (ballRef.current && isNearFlipper(ballRef.current!, leftFlipperRef.current!)) {
                applyFlipperForce(ballRef.current!, leftFlipperRef.current!, true);
              }
              if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send("leftFlipperUp");
            }
          });

          scene.input.keyboard.on("keyup-A", () => {
            if (leftFlipperRef.current) {
              leftFlipperRef.current.setAngle(30);
              if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send("leftFlipperDown");
            }
          });

          scene.input.keyboard.on("keydown-E", () => {
            if (rightFlipperRef.current) {
              rightFlipperRef.current.setAngle(30);
              if (ballRef.current && isNearFlipper(ballRef.current!, rightFlipperRef.current!)) {
                applyFlipperForce(ballRef.current!, rightFlipperRef.current!, false);
              }
              if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send("rightFlipperUp");
            }
          });

          scene.input.keyboard.on("keyup-E", () => {
            if (rightFlipperRef.current) {
              rightFlipperRef.current.setAngle(-30);
              if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send("rightFlipperDown");
            }
          });

          function isNearFlipper(ball: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, flipper: Phaser.GameObjects.Sprite) {
            const dx = ball.x - flipper.x;
            const dy = ball.y - flipper.y;
            return Math.sqrt(dx * dx + dy * dy) < 40;
          }
        }
      }
    }

    function update(this: Phaser.Scene) {
      if (ballRef.current && ballRef.current.y > dimensions.height + 20) {
        isLaunching = true;
        if (ballRef.current) {
          ballRef.current.setPosition(dimensions.width - 25, dimensions.height - 170);
          ballRef.current.setVelocity(0, 0);
        }
        score = 0;
        if (scoreTextRef.current) scoreTextRef.current.setText(`Score: ${score}`);
        if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send("ballLost");
      }

      if (ballRef.current && !isLaunching) {
        const vx = ballRef.current.body.velocity.x;
        const vy = ballRef.current.body.velocity.y;
        const speed = Math.sqrt(vx * vx + vy * vy);
        const maxSpeed = 1000;
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
      }
    }

    const connectWebSocket = () => {
      try {
        const ws = new WebSocket("ws://localhost:8080");
        wsRef.current = ws;
        ws.onopen = () => console.log("WebSocket connected successfully");
        ws.onmessage = (event) => console.log("Message from server:", event.data);
        ws.onerror = (error) => console.error("WebSocket error details:", error);
        ws.onclose = (event) => {
          console.log("WebSocket closed with code:", event.code, "reason:", event.reason);
          setTimeout(connectWebSocket, 5000);
        };
      } catch (error) {
        console.error("WebSocket connection failed:", error);
        setTimeout(connectWebSocket, 5000);
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
        <p>Controls: A/E keys for flippers, SPACE to launch</p>
      </div>
    </div>
  );
}