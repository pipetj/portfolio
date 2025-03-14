"use client";

import { useEffect, useRef, useState } from "react";

export default function Pinball() {
  const gameRef = useRef(null);
  const wsRef = useRef(null);
  const wsReadyRef = useRef(false);
  const [isGameReady, setIsGameReady] = useState(false);
  const launchForce = useRef(0);
  const launchTimeout = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    import("phaser").then((Phaser) => {
      let ball, leftFlipper, rightFlipper, plunger, bumpers = [], fixedTargets = [], dropTargets = [], hole, scoreText;
      let score = 0, highScore = 0, isBallLaunched = false;

      const config = {
        type: Phaser.AUTO,
        width: 1280,
        height: 800,
        parent: "game-container",
        physics: {
          default: "arcade",
          arcade: {
            gravity: { x: 0, y: 600 },
            debug: false,
          },
        },
        scene: { preload, create, update },
        audio: { disableWebAudio: true },
      };

      function preload() {
        this.load.image("table", "/assets/space-cadet-table.png");
        this.load.image("ball", "/assets/ball-metal.png");
        this.load.image("flipper-left", "/assets/flipper-left-space.png");
        this.load.image("flipper-right", "/assets/flipper-right-space.png");
        this.load.image("plunger", "/assets/plunger-space.png");
        this.load.image("bumper", "/assets/bumper-space.png");
        this.load.image("target-fixed", "/assets/target-fixed-space.png");
        this.load.image("target-drop", "/assets/target-drop-space.png");
        this.load.image("hole", "/assets/hole-space.png");
      }

      function create() {
        // Fond Space Cadet
        this.add.image(640, 400, "table").setScale(1);

        // Cadre visuel
        this.add.rectangle(640, 400, 1300, 820, 0x000000, 0.9).setStrokeStyle(10, 0xff00ff);
        this.physics.world.setBounds(0, 0, 1280, 800);

        // Balle
        ball = this.physics.add.sprite(1200, 750, "ball").setCircle(10).setScale(0.5).setBounce(0.9);
        ball.setCollideWorldBounds(true);

        // Lanceur
        plunger = this.physics.add.staticSprite(1200, 750, "plunger").setScale(0.5).setAngle(-10);

        // Flippers
        leftFlipper = this.physics.add.staticSprite(300, 750, "flipper-left").setScale(0.6).setAngle(0);
        rightFlipper = this.physics.add.staticSprite(980, 750, "flipper-right").setScale(0.6).setAngle(0);

        // Bumpers (triangle en haut)
        const bumperPositions = [{ x: 540, y: 150 }, { x: 740, y: 150 }, { x: 640, y: 100 }];
        bumperPositions.forEach((pos) => {
          const bumper = this.physics.add.staticSprite(pos.x, pos.y, "bumper").setCircle(25).setScale(0.5);
          bumpers.push(bumper);
        });

        // Cibles fixes (côtés)
        const fixedTargetPositions = [{ x: 400, y: 300 }, { x: 880, y: 300 }];
        fixedTargetPositions.forEach((pos) => {
          const target = this.physics.add.staticSprite(pos.x, pos.y, "target-fixed").setScale(0.5);
          fixedTargets.push(target);
        });

        // Cibles à chute (ligne centrale)
        const dropTargetPositions = [{ x: 580, y: 450 }, { x: 640, y: 450 }, { x: 700, y: 450 }];
        dropTargetPositions.forEach((pos) => {
          const target = this.physics.add.staticSprite(pos.x, pos.y, "target-drop").setScale(0.5);
          dropTargets.push(target);
        });

        // Trou (haut droite)
        hole = this.physics.add.staticSprite(1100, 150, "hole").setScale(0.5);

        // Score
        scoreText = this.add.text(20, 20, "Score: 0 | High: 0", {
          fontSize: "32px",
          color: "#ff00ff",
          fontStyle: "bold",
          fontFamily: "Arial",
        });

        // Collisions
        this.physics.add.collider(ball, leftFlipper);
        this.physics.add.collider(ball, rightFlipper);
        this.physics.add.collider(ball, plunger, () => {
          if (!isBallLaunched && launchForce.current > 0) {
            ball.setVelocity(-50, -launchForce.current);
            isBallLaunched = true;
            launchForce.current = 0;
            if (launchTimeout.current) clearInterval(launchTimeout.current);
          }
        });
        this.physics.add.collider(ball, bumpers, (_, bumper) => {
          bumper.setTint(0xff5555);
          this.time.delayedCall(300, () => bumper.clearTint());
        });
        this.physics.add.collider(ball, fixedTargets, (_, target) => {
          target.setTint(0x5555ff);
          this.time.delayedCall(1000, () => target.clearTint());
        });
        this.physics.add.collider(ball, dropTargets, (_, target) => target.destroy());
        this.physics.add.collider(ball, hole, () => {
          ball.setPosition(1200, 750);
          ball.setVelocity(0, 0);
          isBallLaunched = false;
        });

        // WebSocket
        wsRef.current = new WebSocket("wss://portfolio-spring-boot-backend.onrender.com/game");
        wsRef.current.onopen = () => { wsReadyRef.current = true; };
        wsRef.current.onmessage = (event) => {
          const state = JSON.parse(event.data);
          ball.setPosition(state.ballX, state.ballY);
          ball.setVelocity(state.ballSpeedX, state.ballSpeedY);
          leftFlipper.angle = state.leftFlipperUp ? -30 : 0;
          rightFlipper.angle = state.rightFlipperUp ? 30 : 0;
          score = state.score;
          highScore = Math.max(highScore, score);
          scoreText.setText(`Score: ${score} | High: ${highScore}`);
        };

        // Contrôles
        this.input.keyboard.on("keydown-A", () => sendWebSocketMessage("leftFlipperUp"));
        this.input.keyboard.on("keyup-A", () => sendWebSocketMessage("leftFlipperDown"));
        this.input.keyboard.on("keydown-D", () => sendWebSocketMessage("rightFlipperUp"));
        this.input.keyboard.on("keyup-D", () => sendWebSocketMessage("rightFlipperDown"));
        this.input.keyboard.on("keydown-ENTER", () => {
          if (!isBallLaunched) {
            launchForce.current = 300;
            launchTimeout.current = setInterval(() => {
              launchForce.current += 50;
              if (launchForce.current > 1200) launchForce.current = 1200;
            }, 100);
          }
        });
        this.input.keyboard.on("keyup-ENTER", () => {
          if (!isBallLaunched && launchTimeout.current) {
            clearInterval(launchTimeout.current);
            sendWebSocketMessage("launch");
            isBallLaunched = true;
          }
        });
      }

      function update() {
        if (ball && ball.y > 850) {
          ball.setPosition(1200, 750);
          ball.setVelocity(0, 0);
          isBallLaunched = false;
          sendWebSocketMessage("reset");
        }
      }

      function sendWebSocketMessage(message) {
        if (wsRef.current && wsReadyRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(message);
        }
      }

      if (!gameRef.current) {
        gameRef.current = new Phaser.Game(config);
        setIsGameReady(true);
      }
    });

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (gameRef.current) gameRef.current.destroy(true);
    };
  }, []);

  return isGameReady ? (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#000" }}>
        <div id="game-container" style={{ width: "1280px", height: "800px", border: "6px solid #ff00ff", boxShadow: "0 0 20px #ff00ff" }} />
      </div>
  ) : (
      <div style={{ color: "#fff", textAlign: "center", paddingTop: "20%" }}>Loading...</div>
  );
}