"use client";

import { useEffect, useRef, useState } from "react";

export default function Pinball() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const wsReadyRef = useRef<boolean>(false);
  const [isGameReady, setIsGameReady] = useState(false);
  const launchForce = useRef<number>(0);
  const launchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    import("phaser").then((Phaser) => {
      console.log("Phaser loaded successfully");

      let ball: Phaser.Physics.Arcade.Sprite;
      let leftFlipper: Phaser.Physics.Arcade.Sprite;
      let rightFlipper: Phaser.Physics.Arcade.Sprite;
      let upperLeftFlipper: Phaser.Physics.Arcade.Sprite;
      let plunger: Phaser.Physics.Arcade.Sprite;
      let bumpers: Phaser.Physics.Arcade.Sprite[] = [];
      let fixedTargets: Phaser.Physics.Arcade.Sprite[] = [];
      let dropTargets: Phaser.Physics.Arcade.Sprite[] = [];
      let hole: Phaser.Physics.Arcade.Sprite;
      let spinner: Phaser.Physics.Arcade.Sprite;
      let stopper: Phaser.Physics.Arcade.Sprite;
      let scoreText: Phaser.GameObjects.Text;
      let score = 0;
      let highScore = 0;
      let isBallLaunched = false;

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 600,
        height: 500,
        parent: "game-container",
        physics: {
          default: "arcade",
          arcade: {
            gravity: { x: 0, y: 400 },
            debug: false,
          },
        },
        scene: {
          preload: preload,
          create: create,
          update: update,
        },
        audio: {
          disableWebAudio: true,
        },
      };

      function preload(this: Phaser.Scene) {
        console.log("Preloading assets...");
        try {
          this.load.image("table", "/assets/pinball-table.svg");
          this.load.image("ball", "/assets/ball.svg");
          this.load.image("flipper-left", "/assets/flipper-left.svg");
          this.load.image("flipper-right", "/assets/flipper-right.svg");
          this.load.image("plunger", "/assets/plunger.svg");
          this.load.image("bumper", "/assets/bumper.svg");
          this.load.image("target-fixed", "/assets/target-fixed.svg");
          this.load.image("target-drop", "/assets/target-drop.svg");
          this.load.image("hole", "/assets/hole.svg");
          this.load.image("spinner", "/assets/spinner.svg");
          this.load.image("stopper", "/assets/stopper.svg");
        } catch (error) {
          console.error("Error loading assets:", error);
        }
      }

      function create(this: Phaser.Scene) {
        console.log("Creating scene...");

        // Table de fond
        try {
          const table = this.add.image(300, 250, "table").setScale(1);
          table.setOrigin(0.5, 0.5);
          console.log("Table loaded successfully");
        } catch (error) {
          console.error("Error loading table:", error);
        }

        // Cadre visuel
        this.add.rectangle(300, 250, 620, 520, 0x000000, 0.9)
          .setStrokeStyle(6, 0xff00ff);
        this.add.rectangle(300, 250, 600, 500, 0x333333, 0.5);

        this.physics.world.setBounds(0, 0, 600, 500, true, true, true, true);

        // Balle
        try {
          ball = this.physics.add.sprite(50, 470, "ball").setCircle(6).setScale(0.2).setBounce(0.9);
          ball.setCollideWorldBounds(true);
          console.log("Ball loaded successfully");
        } catch (error) {
          console.error("Error loading ball:", error);
        }

        // Lanceur
        try {
          plunger = this.physics.add.staticSprite(40, 470, "plunger").setScale(0.25).setAngle(-10);
          console.log("Plunger loaded successfully");
        } catch (error) {
          console.error("Error loading plunger:", error);
        }

        // Flippers
        try {
          leftFlipper = this.physics.add.staticSprite(150, 480, "flipper-left").setScale(0.3).setAngle(0);
          rightFlipper = this.physics.add.staticSprite(450, 480, "flipper-right").setScale(0.3).setAngle(0);
          upperLeftFlipper = this.physics.add.staticSprite(200, 350, "flipper-left").setScale(0.25).setAngle(0); // Ajouté
          console.log("Flippers loaded successfully");
        } catch (error) {
          console.error("Error loading flippers:", error);
        }

        // Bumpers
        const bumperPositions = [
          { x: 200, y: 150 },
          { x: 300, y: 180 },
          { x: 400, y: 150 },
        ];
        bumperPositions.forEach((pos) => {
          try {
            const bumper = this.physics.add.staticSprite(pos.x, pos.y, "bumper").setCircle(10).setScale(0.15);
            bumpers.push(bumper);
          } catch (error) {
            console.error("Error loading bumper:", error);
          }
        });

        // Cibles fixes
        const fixedTargetPositions = [
          { x: 220, y: 100 },
          { x: 380, y: 100 },
        ];
        fixedTargetPositions.forEach((pos) => {
          try {
            const target = this.physics.add.staticSprite(pos.x, pos.y, "target-fixed").setScale(0.25);
            fixedTargets.push(target);
          } catch (error) {
            console.error("Error loading fixed target:", error);
          }
        });

        // Cibles à chute
        const dropTargetPositions = [
          { x: 270, y: 250 },
          { x: 300, y: 250 },
          { x: 330, y: 250 },
        ];
        dropTargetPositions.forEach((pos) => {
          try {
            const target = this.physics.add.staticSprite(pos.x, pos.y, "target-drop").setScale(0.25);
            dropTargets.push(target);
          } catch (error) {
            console.error("Error loading drop target:", error);
          }
        });

        // Trou, spinner, stopper
        try {
          hole = this.physics.add.staticSprite(500, 200, "hole").setScale(0.25);
          spinner = this.physics.add.staticSprite(350, 300, "spinner").setScale(0.15);
          stopper = this.physics.add.staticSprite(300, 480, "stopper").setScale(0.25);
          console.log("Hole, spinner, stopper loaded successfully");
        } catch (error) {
          console.error("Error loading hole/spinner/stopper:", error);
        }

        scoreText = this.add.text(10, 10, "Score: 0 | High: 0", {
          fontSize: "24px",
          color: "#ff00ff",
          fontStyle: "bold",
        });

        // Collisions
        this.physics.add.collider(ball, leftFlipper);
        this.physics.add.collider(ball, rightFlipper);
        this.physics.add.collider(ball, upperLeftFlipper);
        this.physics.add.collider(ball, plunger, () => {
          if (!isBallLaunched && launchForce.current > 0) {
            ball.setVelocity(0, -launchForce.current);
            isBallLaunched = true;
            launchForce.current = 0;
            if (launchTimeout.current) clearInterval(launchTimeout.current);
          }
        });
        this.physics.add.collider(ball, bumpers, (_, bumper) => {
          score += 100;
          (bumper as Phaser.Physics.Arcade.Sprite).setTint(0xff5555);
          this.time.delayedCall(300, () => (bumper as Phaser.Physics.Arcade.Sprite).clearTint());
        });
        this.physics.add.collider(ball, fixedTargets, (_, target) => {
          score += 50;
          (target as Phaser.Physics.Arcade.Sprite).setTint(0x5555ff);
          this.time.delayedCall(1000, () => (target as Phaser.Physics.Arcade.Sprite).clearTint());
        });
        this.physics.add.collider(ball, dropTargets, (_, target) => {
          score += 200;
          (target as Phaser.Physics.Arcade.Sprite).destroy();
        });
        this.physics.add.collider(ball, hole, () => {
          score += 500;
          ball.setPosition(50, 470);
          ball.setVelocity(0, 0);
          isBallLaunched = false;
        });

        // WebSocket
        try {
          wsRef.current = new WebSocket("wss://portfolio-spring-boot-backend.onrender.com/game");
          wsRef.current.onopen = () => {
            wsReadyRef.current = true;
            console.log("WebSocket connection opened");
          };
          wsRef.current.onmessage = (event) => {
            const state = JSON.parse(event.data);
            ball.setPosition(state.ballX / 1.27, state.ballY / 1.27);
            ball.setVelocity(state.ballSpeedX, state.ballSpeedY);
            leftFlipper.angle = state.leftFlipperUp ? -30 : 0;
            rightFlipper.angle = state.rightFlipperUp ? 30 : 0;
            upperLeftFlipper.angle = state.upperLeftFlipperUp ? -30 : 0; // Ajouté
            spinner.rotation = state.spinnerRotation * Math.PI / 180;
            stopper.visible = state.stopperActive;
            score = state.score;
            highScore = Math.max(highScore, score);
            scoreText.setText(`Score: ${score} | High: ${highScore}`);
          };
          wsRef.current.onerror = (error) => console.error("WebSocket error:", error);
          wsRef.current.onclose = () => {
            wsReadyRef.current = false;
            console.log("WebSocket connection closed");
          };
        } catch (error) {
          console.error("Error initializing WebSocket:", error);
        }

        // Contrôles clavier
        if (this.input.keyboard) {
          this.input.keyboard.on("keydown-A", () => sendWebSocketMessage("leftFlipperUp"));
          this.input.keyboard.on("keyup-A", () => sendWebSocketMessage("leftFlipperDown"));
          this.input.keyboard.on("keydown-D", () => sendWebSocketMessage("rightFlipperUp"));
          this.input.keyboard.on("keyup-D", () => sendWebSocketMessage("rightFlipperDown"));
          this.input.keyboard.on("keydown-Q", () => sendWebSocketMessage("upperLeftFlipperUp")); // Touche Q pour upperLeftFlipper
          this.input.keyboard.on("keyup-Q", () => sendWebSocketMessage("upperLeftFlipperDown"));
          this.input.keyboard.on("keydown-ENTER", () => {
            if (!isBallLaunched) {
              launchForce.current = 200;
              launchTimeout.current = setInterval(() => {
                launchForce.current += 50;
                if (launchForce.current > 800) launchForce.current = 800;
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

        console.log("Scene created successfully");
      }

      function update(this: Phaser.Scene) {
        if (ball && ball.y > 550) {
          ball.setPosition(50, 470);
          ball.setVelocity(0, 0);
          isBallLaunched = false;
          sendWebSocketMessage("reset");
        }
      }

      function sendWebSocketMessage(message: string) {
        if (wsRef.current && wsReadyRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(message);
        } else {
          console.warn("WebSocket not ready, message queued:", message);
        }
      }

      if (!gameRef.current) {
        gameRef.current = new Phaser.Game(config);
        setIsGameReady(true);
        console.log("Phaser game initialized");
      }
    });

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
        wsReadyRef.current = false;
      }
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return isGameReady ? (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#1a1a1a" }}>
      <div
        id="game-container"
        style={{ width: "600px", height: "500px", border: "4px solid #ff00ff", boxShadow: "0 0 15px #ff00ff" }}
      />
    </div>
  ) : (
    <div style={{ color: "#fff", textAlign: "center", paddingTop: "20%" }}>Loading game...</div>
  );
}