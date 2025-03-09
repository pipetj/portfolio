// pages/flipper.tsx
"use client";

import { useEffect, useRef, useState } from 'react';

interface PinballState {
  ballX: number;
  ballY: number;
  ballSpeedX: number;
  ballSpeedY: number;
  leftFlipperUp: boolean;
  rightFlipperUp: boolean;
  upperLeftFlipperUp: boolean;
  score: number;
  isLaunching: boolean;
  bumpersHit: boolean[];
  fixedTargetsHit: boolean[];
  dropTargetsHit: boolean[];
  holeActive: boolean;
  spinnerRotation: number;
  stopperActive: boolean;
}

export default function Flipper() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [score, setScore] = useState(0);
  const [isLaunching, setIsLaunching] = useState(true);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [lastBumperHit, setLastBumperHit] = useState(-1);
  const [bumperHitTime, setBumperHitTime] = useState(0);

  // Préchargement des images
  useEffect(() => {
    const loadImages = async () => {
      const tableImg = new Image();
      tableImg.src = '/pinball/table-texture.svg';
      
      // Attendez que les images se chargent avant de commencer
      await new Promise(resolve => {
        tableImg.onload = resolve;
      });
    };
    
    loadImages();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Activer l'anti-aliasing
    (ctx as any).imageSmoothingEnabled = true;
    (ctx as any).imageSmoothingQuality = "high";

    // Stocker les états précédents pour les animations fluides
    let prevState: PinballState | null = null;
    let animationFrame = 0;
    
    wsRef.current = new WebSocket('wss://localhost:3000/game'); //wss://portfolio-spring-boot-backend.onrender.com/game

    wsRef.current.onmessage = (event: MessageEvent) => {
      const gameState: PinballState = JSON.parse(event.data);
      setScore(gameState.score);
      setIsLaunching(gameState.isLaunching);
      
      // Vérifier si un bumper a été touché
      if (prevState) {
        for (let i = 0; i < gameState.bumpersHit.length; i++) {
          if (gameState.bumpersHit[i] && !prevState.bumpersHit[i]) {
            setLastBumperHit(i);
            setBumperHitTime(Date.now());
          }
        }
      }
      
      // Mettre à jour le high score
      if (gameState.score > highScore) {
        setHighScore(gameState.score);
      }
      
      // Détecter le game over
      if (isLaunching && !prevState?.isLaunching) {
        setGameOver(true);
        setTimeout(() => setGameOver(false), 2000);
      }
      
      animationFrame++;
      
      // Fond de table avec gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#000033');
      gradient.addColorStop(1, '#000055');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Ajouter une texture d'arrière-plan (option)
      // ctx.globalAlpha = 0.2;
      // ctx.drawImage(tableImg, 0, 0, canvas.width, canvas.height);
      // ctx.globalAlpha = 1.0;
      
      // Murs inclinés avec gradient
      const wallGradient = ctx.createLinearGradient(0, 0, 150, 0);
      wallGradient.addColorStop(0, '#606060');
      wallGradient.addColorStop(1, '#808080');
      
      ctx.fillStyle = wallGradient;
      ctx.beginPath();
      ctx.moveTo(0, 500);
      ctx.lineTo(100, 150);
      ctx.lineTo(100, 0);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();

      const wallRightGradient = ctx.createLinearGradient(800, 0, 650, 0);
      wallRightGradient.addColorStop(0, '#606060');
      wallRightGradient.addColorStop(1, '#808080');
      
      ctx.fillStyle = wallRightGradient;
      ctx.beginPath();
      ctx.moveTo(600, 500);
      ctx.lineTo(500, 150);
      ctx.lineTo(500, 0);
      ctx.lineTo(600, 0);
      ctx.closePath();
      ctx.fill();

      // Ajouter détails métalliques aux murs
      ctx.strokeStyle = '#A0A0A0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 300);
      ctx.lineTo(75, 100);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(800, 300);
      ctx.lineTo(725, 100);
      ctx.stroke();

      // Rampe de lancement avec effet métallique
      const launchGradient = ctx.createLinearGradient(750, 0, 800, 0);
      launchGradient.addColorStop(0, '#A0A0A0');
      launchGradient.addColorStop(0.5, '#E0E0E0');
      launchGradient.addColorStop(1, '#A0A0A0');
      
      ctx.fillStyle = launchGradient;
      ctx.fillRect(550, 0, 50, 500);
      
      // Détails de la rampe
      ctx.strokeStyle = '#606060';
      ctx.lineWidth = 1;
      for (let y = 50; y < 600; y += 50) {
        ctx.beginPath();
        ctx.moveTo(750, y);
        ctx.lineTo(800, y);
        ctx.stroke();
      }

      // Zone centrale avec texture
      const playFieldGradient = ctx.createRadialGradient(400, 300, 100, 400, 300, 500);
      playFieldGradient.addColorStop(0, '#000077');
      playFieldGradient.addColorStop(1, '#000055');
      
      ctx.fillStyle = playFieldGradient;
      ctx.beginPath();
      ctx.moveTo(150, 200);
      ctx.lineTo(650, 200);
      ctx.lineTo(650, 600);
      ctx.lineTo(150, 600);
      ctx.closePath();
      ctx.fill();
      
      // Ajouter des lignes décoratives
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let x = 150; x <= 650; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 200);
        ctx.lineTo(x, 600);
        ctx.stroke();
      }
      
      for (let y = 200; y <= 600; y += 50) {
        ctx.beginPath();
        ctx.moveTo(150, y);
        ctx.lineTo(650, y);
        ctx.stroke();
      }

      // Bumpers avec effets lumineux
      const bumperColors = ['#FF0000', '#FFFF00', '#FF00FF'];
      const hitColors = ['#FF5555', '#FFFF55', '#FF55FF'];
      
      [
        { x: 200, y: 150, radius: 20, index: 0 },
        { x: 300, y: 200, radius: 20, index: 1 },
        { x: 400, y: 150, radius: 20, index: 2 }
      ].forEach(bumper => {
        const isHit = gameState.bumpersHit[bumper.index];
        const isRecentlyHit = lastBumperHit === bumper.index && Date.now() - bumperHitTime < 300;
        
        // Animation de pulsation pour les bumpers récemment touchés
        let radius = bumper.radius;
        if (isRecentlyHit) {
          radius += 5 * Math.sin((Date.now() - bumperHitTime) / 30);
        }
        
        // Effet de lueur (glow)
        if (isHit || isRecentlyHit) {
          ctx.shadowColor = bumperColors[bumper.index];
          ctx.shadowBlur = 15;
        }
        
        drawBumper(
          ctx, 
          bumper.x, 
          bumper.y, 
          radius, 
          isHit || isRecentlyHit ? hitColors[bumper.index] : bumperColors[bumper.index],
          isRecentlyHit
        );
        
        ctx.shadowBlur = 0;
      });

      // Slingshots avec effet de rebond
      const slingshotGradient = ctx.createLinearGradient(0, 450, 0, 470);
      slingshotGradient.addColorStop(0, '#00CC00');
      slingshotGradient.addColorStop(1, '#00AA00');
      
      ctx.fillStyle = slingshotGradient;
      ctx.fillRect(150, 450, 50, 20);
      ctx.fillRect(600, 450, 50, 20);
      
      // Contour des slingshots
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.strokeRect(150, 450, 50, 20);
      ctx.strokeRect(600, 450, 50, 20);

      // Rampe avec effet 3D
      const rampGradient = ctx.createLinearGradient(600, 400, 650, 200);
      rampGradient.addColorStop(0, '#404040');
      rampGradient.addColorStop(1, '#707070');
      
      ctx.fillStyle = rampGradient;
      ctx.beginPath();
      ctx.moveTo(600, 400);
      ctx.lineTo(700, 400);
      ctx.lineTo(650, 200);
      ctx.closePath();
      ctx.fill();
      
      // Contour de la rampe
      ctx.strokeStyle = '#A0A0A0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(600, 400);
      ctx.lineTo(700, 400);
      ctx.lineTo(650, 200);
      ctx.closePath();
      ctx.stroke();
      
      // Détails de la rampe
      ctx.strokeStyle = '#808080';
      ctx.lineWidth = 1;
      for (let y = 400; y > 200; y -= 20) {
        const width = (400 - y) / 200 * 100;
        ctx.beginPath();
        ctx.moveTo(650 - width/2, y);
        ctx.lineTo(650 + width/2, y);
        ctx.stroke();
      }

      // Cibles fixes avec animation
      [
        { x: 250, y: 100, width: 20, height: 20, index: 0 },
        { x: 450, y: 100, width: 20, height: 20, index: 1 }
      ].forEach(target => {
        const isHit = gameState.fixedTargetsHit[target.index];
        const color = isHit ? '#5555FF' : '#0000FF';
        
        // Ajouter effet de lueur pour les cibles touchées
        if (isHit) {
          ctx.shadowColor = '#0000FF';
          ctx.shadowBlur = 10;
        }
        
        drawTarget(ctx, target.x, target.y, target.width, target.height, color);
        ctx.shadowBlur = 0;
      });

      // Cibles tombantes avec animation de disparition
      [
        { x: 300, y: 300, width: 20, height: 20, index: 0 },
        { x: 330, y: 300, width: 20, height: 20, index: 1 },
        { x: 360, y: 300, width: 20, height: 20, index: 2 }
      ].forEach(target => {
        if (!gameState.dropTargetsHit[target.index]) {
          drawTarget(ctx, target.x, target.y, target.width, target.height, '#FFAA00');
        } else {
          // Animation de disparition
          ctx.globalAlpha = 0.3;
          drawTarget(ctx, target.x, target.y + 10, target.width, target.height, '#FFAA00');
          ctx.globalAlpha = 1.0;
        }
      });

      // Trou avec effet d'ombre
      ctx.beginPath();
      const holeGradient = ctx.createRadialGradient(500, 250, 0, 500, 250, 15);
      holeGradient.addColorStop(0, '#000000');
      holeGradient.addColorStop(1, '#000000');
      
      ctx.fillStyle = holeGradient;
      ctx.arc(500, 250, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // Contour du trou
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Effet de lueur pour le trou actif
      if (gameState.holeActive) {
        ctx.beginPath();
        ctx.arc(500, 250, 20, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Ajouter une animation de particules autour du trou
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2 + (animationFrame / 10);
          const x = 500 + Math.cos(angle) * 25;
          const y = 250 + Math.sin(angle) * 25;
          
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.fill();
        }
      }

      // Spinner avec rotation animée
      ctx.save();
      ctx.translate(400, 400);
      ctx.rotate((gameState.spinnerRotation + animationFrame * 5) * Math.PI / 180);
      
      const spinnerGradient = ctx.createLinearGradient(-20, 0, 20, 0);
      spinnerGradient.addColorStop(0, '#00FFFF');
      spinnerGradient.addColorStop(1, '#00AAAA');
      
      ctx.fillStyle = spinnerGradient;
      ctx.fillRect(-20, -5, 40, 10);
      
      // Ajouter un effet de lueur pendant la rotation
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.strokeRect(-20, -5, 40, 10);
      
      ctx.restore();

      // Balle avec effet 3D
      ctx.beginPath();
      const ballGradient = ctx.createRadialGradient(
        gameState.ballX - 3, gameState.ballY - 3, 0,
        gameState.ballX, gameState.ballY, 10
      );
      ballGradient.addColorStop(0, '#FFFFFF');
      ballGradient.addColorStop(1, '#DDDDDD');
      
      ctx.fillStyle = ballGradient;
      ctx.arc(gameState.ballX, gameState.ballY, 10, 0, Math.PI * 2);
      ctx.fill();
      
      // Reflet sur la balle
      ctx.beginPath();
      ctx.arc(gameState.ballX - 3, gameState.ballY - 3, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fill();

      // Flippers avec animation d'angle
      drawFlipper(ctx, 80, 450, 80, 15, gameState.leftFlipperUp, -Math.PI/6, true);
      drawFlipper(ctx, 350, 450, 80, 15, gameState.rightFlipperUp, Math.PI/6, false);
      drawFlipper(ctx, 150, 300, 60, 15, gameState.upperLeftFlipperUp, -Math.PI/6, true);

      // Stopper avec effet lumineux
      if (gameState.stopperActive) {
        ctx.fillStyle = '#00FF00';
        ctx.shadowColor = '#00FF00';
        ctx.shadowBlur = 10;
        ctx.fillRect(250, 580, 30, 20);
        ctx.shadowBlur = 0;
        
        // Animation de pulsation
        ctx.strokeStyle = 'rgba(255, 255, 255, ' + (0.5 + 0.5 * Math.sin(Date.now() / 200)) + ')';
        ctx.lineWidth = 2;
        ctx.strokeRect(250, 580, 30, 20);
      }
      
      // Traînée derrière la balle quand elle va vite
      if (prevState && Math.sqrt(gameState.ballSpeedX*gameState.ballSpeedX + gameState.ballSpeedY*gameState.ballSpeedY) > 5) {
        ctx.beginPath();
        ctx.moveTo(gameState.ballX, gameState.ballY);
        ctx.lineTo(prevState.ballX, prevState.ballY);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
      
      // Animation Game Over
      if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = 'bold 48px Arial';
        ctx.fillStyle = '#FF0000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 50);
        
        ctx.font = '24px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('Press ENTER to play again', canvas.width/2, canvas.height/2 + 20);
      }
      
      prevState = {...gameState};
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!wsRef.current) return;
      if (e.key === 'a') wsRef.current.send('leftFlipperUp');
      if (e.key === 'd') wsRef.current.send('rightFlipperUp');
      if (e.key === 'q') wsRef.current.send('upperLeftFlipperUp');
      if (e.key === 'Enter') wsRef.current.send('launch');
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (!wsRef.current) return;
      if (e.key === 'a') wsRef.current.send('leftFlipperDown');
      if (e.key === 'd') wsRef.current.send('rightFlipperDown');
      if (e.key === 'q') wsRef.current.send('upperLeftFlipperDown');
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      if (wsRef.current) wsRef.current.close();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [lastBumperHit, bumperHitTime, highScore, gameOver]);

  return (
    <div style={{
      backgroundColor: '#000022',
      color: '#FFFFFF',
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      border: '10px solid #404040',
      boxShadow: 'inset 0 0 40px #000000, 0 0 30px #0000FF',
      borderRadius: '15px',
      maxWidth: '900px',
      margin: '0 auto',
      backgroundImage: 'linear-gradient(to bottom, #000022, #000044)',
    }}>
      <h1 style={{
        fontSize: '2.5rem',
        margin: '10px 0',
        textShadow: '0 0 10px #00FFFF, 0 0 20px #0000FF',
        color: '#00FFFF',
        fontFamily: '"Press Start 2P", cursive',
      }}>
        Space Pinball XP
      </h1>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        width: '100%', 
        maxWidth: '800px',
        margin: '10px 0'
      }}>
        <div style={{ 
          background: 'rgba(0, 0, 0, 0.5)', 
          padding: '10px', 
          borderRadius: '10px',
          boxShadow: '0 0 10px #0000FF'
        }}>
          <p style={{ 
            fontSize: '1.5rem', 
            margin: '0', 
            color: '#00FF00',
            textShadow: '0 0 5px #00FF00'
          }}>
            Score: {score}
          </p>
        </div>
        
        <div style={{ 
          background: 'rgba(0, 0, 0, 0.5)', 
          padding: '10px', 
          borderRadius: '10px',
          boxShadow: '0 0 10px #FF00FF'
        }}>
          <p style={{ 
            fontSize: '1.5rem', 
            margin: '0', 
            color: '#FF00FF',
            textShadow: '0 0 5px #FF00FF'
          }}>
            High Score: {highScore}
          </p>
        </div>
      </div>
      
      <p style={{ 
        fontSize: '1rem', 
        margin: '5px 0', 
        color: '#FFFF00',
        textShadow: '0 0 5px #FFFF00',
        fontWeight: 'bold'
      }}>
        {isLaunching ? 'Appuyez sur ENTRÉE pour lancer la balle !' : 'A/D pour flippers, Q pour flipper haut.'}
      </p>
      
      <canvas
        ref={canvasRef}
        width={600}
        height={500}
        style={{
          border: '5px solid #505050',
          borderRadius: '10px',
          boxShadow: '0 0 30px rgba(0, 100, 255, 0.7)',
          backgroundColor: '#000044',
        }}
      />
      
      <div style={{ 
        marginTop: '20px',
        display: 'flex',
        gap: '10px'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          background: 'rgba(0, 0, 0, 0.5)', 
          padding: '5px 10px', 
          borderRadius: '5px'
        }}>
          <div style={{ 
            width: '20px', 
            height: '20px', 
            backgroundColor: '#FF0000',
            borderRadius: '50%', 
            marginRight: '5px'
          }}></div>
          <span>100 pts</span>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          background: 'rgba(0, 0, 0, 0.5)', 
          padding: '5px 10px', 
          borderRadius: '5px'
        }}>
          <div style={{ 
            width: '20px', 
            height: '20px', 
            backgroundColor: '#FFAA00',
            marginRight: '5px'
          }}></div>
          <span>200 pts</span>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          background: 'rgba(0, 0, 0, 0.5)', 
          padding: '5px 10px', 
          borderRadius: '5px'
        }}>
          <div style={{ 
            width: '15px', 
            height: '15px', 
            backgroundColor: '#000000',
            borderRadius: '50%', 
            border: '1px solid white',
            marginRight: '5px'
          }}></div>
          <span>500 pts</span>
        </div>
      </div>
    </div>
  );
}

function drawBumper(
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  radius: number, 
  color: string,
  animate: boolean = false
) {
  // Ombre portée
  ctx.beginPath();
  ctx.arc(x + 2, y + 2, radius, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fill();
  
  // Corps principal du bumper
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  
  // Gradient radial pour effet 3D
  const gradient = ctx.createRadialGradient(x - radius/3, y - radius/3, 0, x, y, radius);
  gradient.addColorStop(0, '#FFFFFF');
  gradient.addColorStop(0.3, color);
  gradient.addColorStop(1, '#880000');
  
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // Contour du bumper
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Anneau intérieur
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.7, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Point de lumière
  ctx.beginPath();
  ctx.arc(x - radius/3, y - radius/3, radius/6, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fill();
  
  // Animation flash quand touché
  if (animate) {
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.2, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, ' + (0.7 * Math.random()) + ')';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

function drawTarget(
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  width: number, 
  height: number, 
  color: string
) {
  // Ombre portée
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(x + 2, y + 2, width, height);
  
  // Corps principal
  const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, shadeColor(color, -30));
  
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, width, height);
  
  // Contour
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, width, height);
  
  // Détails
  ctx.beginPath();
  ctx.moveTo(x + 2, y + 2);
  ctx.lineTo(x + width - 2, y + height - 2);
  ctx.moveTo(x + width - 2, y + 2);
  ctx.lineTo(x + 2, y + height - 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.stroke();
  
  // Effet lumineux
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + width/4, y);
  ctx.lineTo(x, y + height/4);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fill();
}

function drawFlipper(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  length: number,
  width: number,
  isUp: boolean,
  angle: number,
  isLeft: boolean
) {
  ctx.save();
  ctx.translate(x, y);
  
  // Angle de rotation basé sur l'état du flipper
  const rotationAngle = isUp ? (isLeft ? -angle : angle) : 0;
  ctx.rotate(rotationAngle);
  
  // Ombre du flipper
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  if (isLeft) {
    ctx.ellipse(-5, 2, length, width, 0, 0, Math.PI * 2);
  } else {
    ctx.ellipse(5, 2, length, width, 0, 0, Math.PI * 2);
  }
  ctx.fill();
  
  // Corps principal du flipper avec gradient
  const flipperGradient = ctx.createLinearGradient(
    isLeft ? -length : 0, 
    0, 
    isLeft ? 0 : length, 
    0
  );
  flipperGradient.addColorStop(0, '#FF0000');  // Rouge
  flipperGradient.addColorStop(1, '#AA0000');  // Rouge foncé
  
  ctx.fillStyle = flipperGradient;
  ctx.beginPath();
  if (isLeft) {
    ctx.ellipse(0, 0, length, width, 0, 0, Math.PI * 2);
  } else {
    ctx.ellipse(0, 0, length, width, 0, 0, Math.PI * 2);
  }
  ctx.fill();
  
  // Contour métallique
  ctx.strokeStyle = '#DDDDDD';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Highlight/reflet sur le flipper
  ctx.beginPath();
  ctx.moveTo(isLeft ? -length + 10 : -length + 10, -width/2 + 2);
  ctx.lineTo(isLeft ? length - 10 : length - 10, -width/2 + 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Point de pivot (axe) du flipper
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#DDDDDD';
  ctx.fill();
  ctx.strokeStyle = '#888888';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  ctx.restore();
}

// Utilitaire pour assombrir une couleur (pour les gradients)
function shadeColor(color: string, percent: number): string {
  // Parse la couleur hex et applique un pourcentage de luminosité
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = Math.floor(R * (100 + percent) / 100);
  G = Math.floor(G * (100 + percent) / 100);
  B = Math.floor(B * (100 + percent) / 100);

  R = R < 255 ? R : 255;
  G = G < 255 ? G : 255;
  B = B < 255 ? B : 255;

  R = R > 0 ? R : 0;
  G = G > 0 ? G : 0;
  B = B > 0 ? B : 0;

  const RR = R.toString(16).padStart(2, '0');
  const GG = G.toString(16).padStart(2, '0');
  const BB = B.toString(16).padStart(2, '0');

  return `#${RR}${GG}${BB}`;
}