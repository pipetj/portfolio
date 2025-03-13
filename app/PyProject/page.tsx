'use client';

import { useState, useEffect, JSX, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LETTERS: { [key: string]: number[][] } = {
  'A': [[0,1,1,0],[1,0,0,1],[1,1,1,1],[1,0,0,1],[1,0,0,1]],
  'B': [[1,1,1,0],[1,0,0,1],[1,1,1,0],[1,0,0,1],[1,1,1,0]],
  'C': [[0,1,1,1],[1,0,0,0],[1,0,0,0],[1,0,0,0],[0,1,1,1]],
  'D': [[1,1,1,0],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,1,1,0]],
  'E': [[1,1,1,1],[1,0,0,0],[1,1,1,1],[1,0,0,0],[1,1,1,1]],
  'F': [[1,1,1,1],[1,0,0,0],[1,1,1,1],[1,0,0,0],[1,0,0,0]],
  'G': [[1,1,1,1],[1,0,0,0],[1,0,1,1],[1,0,0,1],[1,1,1,1]],
  'H': [[1,0,0,1],[1,0,0,1],[1,1,1,1],[1,0,0,1],[1,0,0,1]],
  'I': [[1,1,1,1],[0,1,1,0],[0,1,1,0],[0,1,1,0],[1,1,1,1]],
  'J': [[1,1,1,1],[0,0,0,1],[0,0,0,1],[1,0,0,1],[0,1,1,0]],
  'K': [[1,0,0,1],[1,0,1,0],[1,1,0,0],[1,0,1,0],[1,0,0,1]],
  'L': [[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,1,1,1]],
  'M': [[1,0,0,1],[1,1,1,1],[1,1,1,1],[1,0,0,1],[1,0,0,1]],
  'N': [[1,0,0,1],[1,1,0,1],[1,1,1,1],[1,0,1,1],[1,0,0,1]],
  'O': [[1,1,1,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,1,1,1]],
  'P': [[1,1,1,1],[1,0,0,1],[1,1,1,1],[1,0,0,0],[1,0,0,0]],
  'Q': [[1,1,1,1],[1,0,0,1],[1,0,1,1],[1,1,1,1],[0,0,0,1]],
  'R': [[1,1,1,1],[1,0,0,1],[1,1,1,1],[1,0,1,0],[1,0,0,1]],
  'S': [[0,1,1,1],[1,0,0,0],[0,1,1,1],[0,0,0,1],[1,1,1,0]],
  'T': [[1,1,1,1],[0,1,1,0],[0,1,1,0],[0,1,1,0],[0,1,1,0]],
  'U': [[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,1,1,1]],
  'V': [[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[0,1,1,0]],
  'W': [[1,0,0,1],[1,0,0,1],[1,1,1,1],[1,1,1,1],[1,0,0,1]],
  'X': [[1,0,0,1],[1,0,0,1],[0,1,1,0],[1,0,0,1],[1,0,0,1]],
  'Y': [[1,0,0,1],[1,0,0,1],[0,1,1,0],[0,1,1,0],[0,1,1,0]],
  'Z': [[1,1,1,1],[0,0,1,0],[0,1,0,0],[1,0,0,0],[1,1,1,1]],
  ' ': [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],
  "'": [[0,0,1,0],[0,0,1,0],[0,1,0,0],[0,0,0,0],[0,0,0,0]],
  '?': [[1,1,1,0],[0,0,0,1],[0,1,1,0],[0,0,0,0],[0,1,0,0]],
  '!': [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,0,0,0],[0,1,0,0]],
  ',': [[0,0,0,0],[0,0,0,0],[0,0,1,0],[0,0,1,0],[0,1,0,0]],
  '.': [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,1,1,0],[0,1,1,0]]
};

const isValidChar = (char: string): boolean => {
  return !!LETTERS[char.toUpperCase()];
};

const GRID_SIZE = 30;
const CELL_SIZE = 16.6;
const FPS = 10;

type Enemy = {
  segments: { x: number; y: number }[];
  target: { x: number; y: number };
  direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  directionFrames: number;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
};

export default function Home() {
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');
  const [displayedText, setDisplayedText] = useState<JSX.Element[]>([]);
  const [showSnake, setShowSnake] = useState<boolean>(false);
  const [editingText, setEditingText] = useState<boolean>(false);
  const [color1, setColor1] = useState<string>('#ffffff');
  const [color2, setColor2] = useState<string>('#00bcd4');

  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number>(0);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  
  const [snake, setSnake] = useState<{ x: number; y: number }[]>([{ x: 15, y: 15 }]);
  const [food, setFood] = useState<{ x: number; y: number }[]>([{ x: 20, y: 20 }]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT');
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowWelcome(false);
    setEditingText(false);
    displayMessage();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const filteredInput = input.split('').filter(char => isValidChar(char)).join('');
    setMessage(filteredInput);
  };

  const displayMessage = () => {
    const chars: JSX.Element[] = [];
    let xOffset = 0;
    const messageLength = message.length || 1;
    const scaleFactor = Math.min(2.5, 45 / (messageLength * 5));

    let totalWidth = 0;
    const processedMessage = message.toUpperCase();

    for (let i = 0; i < processedMessage.length; i++) {
      totalWidth += 5 * 6 * scaleFactor;
    }

    for (let i = 0; i < processedMessage.length; i++) {
      const char = processedMessage[i];
      const letter = LETTERS[char] || LETTERS[' '];
      const charPixels: JSX.Element[] = [];

      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 4; x++) {
          if (letter[y][x] === 1) {
            charPixels.push(
              <div
                key={`${i}-${x}-${y}`}
                className="absolute rounded-sm"
                style={{
                  width: `${4 * scaleFactor}px`,
                  height: `${4 * scaleFactor}px`,
                  left: `${x * 6 * scaleFactor}px`,
                  top: `${y * 6 * scaleFactor}px`,
                  background: `linear-gradient(to right, ${color1}, ${color2 || color1})`,
                }}
              />
            );
          }
        }
      }

      chars.push(
        <motion.div
          key={`char-${i}`}
          className="absolute"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          style={{
            position: 'absolute',
            width: `${4 * 6 * scaleFactor}px`,
            height: `${5 * 6 * scaleFactor}px`,
            left: `${xOffset * 6 * scaleFactor}px`,
          }}
        >
          {charPixels}
        </motion.div>
      );

      xOffset += 5;
    }

    setDisplayedText(
      chars.map(char => (
        <div key={char.key} style={{ position: 'absolute', left: `calc(50% - ${totalWidth / 2}px)` }}>
          {char}
        </div>
      )).concat([
        <div 
          key="edit-icon" 
          className="absolute cursor-pointer"
          style={{ right: `calc(50% - ${totalWidth / 2}px - 20px)`, top: '-5px' }}
          onClick={() => setEditingText(true)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
        </div>
      ])
    );

    setTimeout(() => setShowSnake(true), 1000);
  };

  const gameLoop = (time: number) => {
    if (!gameStarted || gameOver) return;

    if (previousTimeRef.current === 0) {
      previousTimeRef.current = time;
    }

    const deltaTime = time - previousTimeRef.current;
    const interval = 1000 / FPS;

    if (deltaTime >= interval) {
      previousTimeRef.current = time - (deltaTime % interval);
      const now = Date.now();
      const baseSpeed = 200;
      const speed = Math.max(baseSpeed - score * 5, 100);

      if (now - lastUpdateTime >= speed) {
        updateGame();
        updateParticles();
        setLastUpdateTime(now);
      }
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const updateParticles = () => {
    setParticles(prev => prev.map(p => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      life: p.life - 0.05,
      vy: p.vy + 0.1
    })).filter(p => p.life > 0));
  };

  const spawnDeathParticles = (x: number, y: number) => {
    const newParticles: Particle[] = [];
    const colors = ['#ff0000', '#ff6600', '#ffff00', '#00ff00', '#00ffff'];
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        x: x * CELL_SIZE,
        y: y * CELL_SIZE,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 4 + 2,
        life: 1
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  const updateGame = () => {
    setSnake(prev => {
      const newSnake = [...prev];
      const head = { ...newSnake[0] };
      switch (direction) {
        case 'RIGHT': head.x += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
      }

      if (
        head.x < 0 || head.x >= GRID_SIZE ||
        head.y < 0 || head.y >= GRID_SIZE ||
        newSnake.some(segment => segment.x === head.x && segment.y === head.y)
      ) {
        setGameOver(true);
        setGameStarted(false);
        return prev;
      }

      newSnake.unshift(head);
      const foodEatenIndex = food.findIndex(f => f.x === head.x && f.y === head.y);
      if (foodEatenIndex !== -1) {
        setScore(prevScore => prevScore + 5); // +5 par fruit
        setFood(prev => {
          const newFood = [...prev];
          newFood.splice(foodEatenIndex, 1);
          return newFood;
        });
      } else {
        newSnake.pop();
      }

      return newSnake;
    });

    setEnemies(prev => {
      let newEnemies = prev.map(enemy => {
        const newSegments = [...enemy.segments];
        const head = { ...newSegments[0] };
        let newDirection = enemy.direction;
        let directionFrames = enemy.directionFrames - 1;

        if (directionFrames <= 0) {
          const closestFood = food.length > 0 ? food[Math.floor(Math.random() * food.length)] : { x: head.x, y: head.y };
          const dx = closestFood.x - head.x;
          const dy = closestFood.y - head.y;

          const possibleDirections = ['UP', 'DOWN', 'LEFT', 'RIGHT'].filter(dir => {
            const testHead = { x: head.x, y: head.y };
            switch (dir) {
              case 'RIGHT': testHead.x += 1; break;
              case 'LEFT': testHead.x -= 1; break;
              case 'UP': testHead.y -= 1; break;
              case 'DOWN': testHead.y += 1; break;
            }
            return dir !== oppositeDirection(enemy.direction) &&
                   testHead.x > 1 && testHead.x < GRID_SIZE - 2 &&
                   testHead.y > 1 && testHead.y < GRID_SIZE - 2;
          });

          if (Math.random() < 0.7 && food.length > 0) {
            if (Math.abs(dx) > Math.abs(dy)) {
              newDirection = dx > 0 ? 'RIGHT' : 'LEFT';
            } else {
              newDirection = dy > 0 ? 'DOWN' : 'UP';
            }
            if (!possibleDirections.includes(newDirection)) {
              newDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)] as 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
            }
          } else {
            newDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)] as 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
          }
          directionFrames = Math.floor(Math.random() * 4) + 2;
        }

        const nextHead = { x: head.x, y: head.y };
        switch (newDirection) {
          case 'RIGHT': nextHead.x += 1; break;
          case 'LEFT': nextHead.x -= 1; break;
          case 'UP': nextHead.y -= 1; break;
          case 'DOWN': nextHead.y += 1; break;
        }

        if (snake.some(seg => seg.x === nextHead.x && seg.y === nextHead.y)) {
          const safeDirections = ['UP', 'DOWN', 'LEFT', 'RIGHT'].filter(dir => {
            const testHead = { x: head.x, y: head.y };
            switch (dir) {
              case 'RIGHT': testHead.x += 1; break;
              case 'LEFT': testHead.x -= 1; break;
              case 'UP': testHead.y -= 1; break;
              case 'DOWN': testHead.y += 1; break;
            }
            return !snake.some(seg => seg.x === testHead.x && seg.y === testHead.y) &&
                   testHead.x > 1 && testHead.x < GRID_SIZE - 2 &&
                   testHead.y > 1 && testHead.y < GRID_SIZE - 2;
          });
          if (safeDirections.length > 0) {
            newDirection = safeDirections[Math.floor(Math.random() * safeDirections.length)] as 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
            directionFrames = Math.floor(Math.random() * 4) + 2;
          }
        }

        switch (newDirection) {
          case 'RIGHT': head.x += 1; break;
          case 'LEFT': head.x -= 1; break;
          case 'UP': head.y -= 1; break;
          case 'DOWN': head.y += 1; break;
        }

        if (head.x <= 1 || head.x >= GRID_SIZE - 2 || head.y <= 1 || head.y >= GRID_SIZE - 2) {
          spawnDeathParticles(head.x, head.y);
          return null;
        }

        newSegments.unshift(head);
        const foodEatenIndex = food.findIndex(f => f.x === head.x && f.y === head.y);
        if (foodEatenIndex !== -1) {
          setFood(prev => {
            const newFood = [...prev];
            newFood.splice(foodEatenIndex, 1);
            return newFood;
          });
          newSegments.push({ x: newSegments[newSegments.length - 1].x, y: newSegments[newSegments.length - 1].y });
        } else {
          newSegments.pop();
        }

        return { segments: newSegments, target: food.length > 0 ? food[0] : head, direction: newDirection, directionFrames };
      }).filter(enemy => enemy !== null) as Enemy[];

      for (let i = 0; i < newEnemies.length; i++) {
        const enemy = newEnemies[i];
        const enemyHead = enemy.segments[0];

        if (snake.some(seg => seg.x === enemyHead.x && seg.y === enemyHead.y && seg !== snake[0])) {
          setScore(prev => prev + 10 + enemy.segments.length); // +10 + longueur de l'ennemi
          spawnDeathParticles(enemyHead.x, enemyHead.y);
          newEnemies.splice(i, 1);
          i--;
          continue;
        }

        for (let j = 0; j < newEnemies.length; j++) {
          if (i === j) continue;
          const otherEnemy = newEnemies[j];
          if (otherEnemy.segments.some(seg => seg.x === enemyHead.x && seg.y === enemyHead.y && seg !== otherEnemy.segments[0])) {
            spawnDeathParticles(enemyHead.x, enemyHead.y);
            newEnemies.splice(i, 1);
            i--;
            break;
          }
        }
      }

      if (Math.random() < 0.015 && newEnemies.length < 4) {
        let newX: number;
        let newY: number;
        let validPosition = false;
        do {
          newX = Math.floor(Math.random() * (GRID_SIZE - 4)) + 2;
          newY = Math.floor(Math.random() * (GRID_SIZE - 4)) + 2;
          validPosition = !snake.some(segment => segment.x === newX && segment.y === newY) &&
                          !newEnemies.some(enemy => enemy.segments.some(seg => seg.x === newX && seg.y === newY));
        } while (!validPosition);
        const initialDirection = ['UP', 'DOWN', 'LEFT', 'RIGHT'][Math.floor(Math.random() * 4)] as 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
        newEnemies.push({
          segments: [
            { x: newX, y: newY },
            { x: newX - (initialDirection === 'RIGHT' ? 1 : initialDirection === 'LEFT' ? -1 : 0), 
              y: newY - (initialDirection === 'DOWN' ? 1 : initialDirection === 'UP' ? -1 : 0) }
          ],
          target: food.length > 0 ? { x: food[0].x, y: food[0].y } : { x: newX, y: newY },
          direction: initialDirection,
          directionFrames: Math.floor(Math.random() * 4) + 2
        });
      }

      return newEnemies;
    });

    if (food.length === 0 || (Math.random() < 0.015 && food.length < 3)) {
      spawnNewFood(snake, enemies);
    }
  };

  const oppositeDirection = (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    switch (dir) {
      case 'UP': return 'DOWN';
      case 'DOWN': return 'UP';
      case 'LEFT': return 'RIGHT';
      case 'RIGHT': return 'LEFT';
    }
  };

  const spawnNewFood = (snakeBody: {x: number, y: number}[], enemyList: Enemy[]) => {
    let newX: number;
    let newY: number;
    let validPosition = false;

    while (!validPosition) {
      newX = Math.floor(Math.random() * (GRID_SIZE - 4)) + 2;
      newY = Math.floor(Math.random() * (GRID_SIZE - 4)) + 2;
      validPosition = !snakeBody.some(segment => segment.x === newX && segment.y === newY) &&
                      !enemyList.some(enemy => enemy.segments.some(seg => seg.x === newX && seg.y === newY)) &&
                      !food.some(f => f.x === newX && f.y === newY);
    }

    setFood(prev => [...prev, { x: newX, y: newY }]);
  };

  useEffect(() => {
    if (gameStarted && !gameOver) {
      requestRef.current = requestAnimationFrame(gameLoop);
      // Forcer le focus sur le conteneur du jeu quand il démarre
      if (gameContainerRef.current) {
        gameContainerRef.current.focus();
      }
      return () => {
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
        }
      };
    }
  }, [gameStarted, gameOver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver || !showSnake) return;

      console.log(`Key pressed: ${e.key}`); // Debug pour vérifier les touches

      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') {
            e.preventDefault();
            setDirection('UP');
          }
          break;
        case 'ArrowDown':
          if (direction !== 'UP') {
            e.preventDefault();
            setDirection('DOWN');
          }
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') {
            e.preventDefault();
            setDirection('LEFT');
          }
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') {
            e.preventDefault();
            setDirection('RIGHT');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, gameOver, direction, showSnake]);

  const restartGame = () => {
    setGameOver(false);
    setScore(0);
    setSnake([{ x: 15, y: 15 }]);
    setFood([{ x: 20, y: 20 }]);
    setEnemies([]);
    setParticles([]);
    setDirection('RIGHT');
    setLastUpdateTime(0);
    setGameStarted(true);
  };

  const getSnakeTexture = (index: number, isHead: boolean) => {
    if (isHead) {
      return "bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg";
    } else if (index % 2 === 0) {
      return "bg-gradient-to-r from-teal-400 to-teal-500";
    } else {
      return "bg-gradient-to-l from-teal-500 to-teal-400";
    }
  };

  const getEnemyTexture = (index: number, isHead: boolean) => {
    if (isHead) {
      return "bg-gradient-to-r from-red-500 to-orange-500 shadow-md";
    } else {
      return "bg-orange-400";
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-5 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent">
        Voici la reconstitution de mon premier projet
      </h1>

      <AnimatePresence>
        {showWelcome && (
          <motion.div
            className="w-full flex flex-col items-center mb-10"
            initial={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
          >
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 z-10">
              <input
                type="text"
                value={message}
                onChange={handleInputChange}
                placeholder="Entrez votre message"
                className="p-3 rounded-full bg-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 w-72 text-center"
              />
              <div className="flex gap-4 items-center">
                <div className="flex flex-col items-center">
                  <span className="text-white text-sm mb-1">Couleur 1</span>
                  <div className="relative">
                    <input
                      type="color"
                      value={color1}
                      onChange={(e) => setColor1(e.target.value)}
                      className="w-12 h-12 rounded-full cursor-pointer opacity-0 absolute inset-0 z-10"
                    />
                    <div 
                      className="w-12 h-12 rounded-full border-2 border-white/50" 
                      style={{ backgroundColor: color1 }}
                    />
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-white text-sm mb-1">Couleur 2</span>
                  <div className="relative">
                    <input
                      type="color"
                      value={color2}
                      onChange={(e) => setColor2(e.target.value)}
                      className="w-12 h-12 rounded-full cursor-pointer opacity-0 absolute inset-0 z-10"
                    />
                    <div 
                      className="w-12 h-12 rounded-full border-2 border-white/50" 
                      style={{ backgroundColor: color2 || '#00bcd4' }}
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="relative px-6 py-2 overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 text-white font-sans font-bold text-base hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105 transition-all duration-300 mt-4"
              >
                Valider
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {!showWelcome && (
        <div className="relative w-full h-32 flex justify-center mt-2 mb-10">
          <div className="relative top-0">
            {displayedText}
            {editingText && (
              <motion.div
                className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-black/90 p-6 rounded-xl z-20 shadow-lg border border-teal-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h3 className="text-white text-lg font-bold mb-4">Modifier le message</h3>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center">
                  <input
                    type="text"
                    value={message}
                    onChange={handleInputChange}
                    className="p-2 rounded-full bg-white/20 text-white w-64"
                  />
                  <div className="flex gap-4 items-center">
                    <div className="relative">
                      <input
                        type="color"
                        value={color1}
                        onChange={(e) => setColor1(e.target.value)}
                        className="w-10 h-10 rounded-full cursor-pointer opacity-0 absolute inset-0 z-10"
                      />
                      <div 
                        className="w-10 h-10 rounded-full border-2 border-white/50" 
                        style={{ backgroundColor: color1 }}
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="color"
                        value={color2}
                        onChange={(e) => setColor2(e.target.value)}
                        className="w-10 h-10 rounded-full cursor-pointer opacity-0 absolute inset-0 z-10"
                      />
                      <div 
                        className="w-10 h-10 rounded-full border-2 border-white/50" 
                        style={{ backgroundColor: color2 || '#00bcd4' }}
                      />
                    </div>
                  </div>
                  <button type="submit" className="px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg text-white font-bold">
                    Appliquer
                  </button>
                </form>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {showSnake && (
        <div 
          ref={gameContainerRef} 
          tabIndex={0} // Permet au div d’être focusable
          className="relative bg-white/10 backdrop-blur-lg rounded-xl p-5 w-[520px] flex flex-col items-center focus:outline-none"
        >
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-teal-500 px-4 py-1 rounded-full text-white font-sans font-bold text-base shadow-md">
            Score: {score}
          </div>
          <div className="relative w-[500px] h-[500px] bg-gray-800/80 rounded-lg overflow-hidden border-4 border-teal-500 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0 bg-gray-800">
              <div className="absolute inset-0 grid grid-cols-30 grid-rows-30 opacity-30 pointer-events-none">
                {Array.from({ length: 900 }).map((_, i) => (
                  <div key={i} className="border-[0.5px] border-white/30" />
                ))}
              </div>
            </div>

            {snake.map((segment, i) => (
              <div
                key={`segment-${i}`}
                className={`absolute w-4 h-4 ${getSnakeTexture(i, i === 0)} rounded-md ${i === 0 ? 'z-10' : ''}`}
                style={{
                  transform: `translate3d(${segment.x * CELL_SIZE}px, ${segment.y * CELL_SIZE}px, 0)`,
                  transition: 'transform 0.02s linear'
                }}
              >
                {i === 0 && (
                  <>
                    <div className="absolute w-1.5 h-1.5 rounded-full bg-black top-0.5 left-0.5"></div>
                    <div className="absolute w-1.5 h-1.5 rounded-full bg-black top-0.5 right-0.5"></div>
                  </>
                )}
              </div>
            ))}

            {enemies.map((enemy, i) => (
              <motion.div
                key={`enemy-${i}`}
                className="absolute"
                initial={{ scale: 1 }}
                exit={{
                  scale: 0,
                  opacity: 0,
                  transition: { duration: 0.2 }
                }}
                animate={{ scale: 1 }}
              >
                {enemy.segments.map((seg, j) => (
                  <div
                    key={`enemy-${i}-${j}`}
                    className={`absolute w-4 h-4 ${getEnemyTexture(j, j === 0)} rounded-md`}
                    style={{
                      transform: `translate3d(${seg.x * CELL_SIZE}px, ${seg.y * CELL_SIZE}px, 0)`,
                      transition: 'transform 0.02s linear'
                    }}
                  >
                    {j === 0 && (
                      <>
                        <div className="absolute w-1 h-1 rounded-full bg-white/70 top-0.5 right-0.5"></div>
                        <div className="absolute w-1 h-1 rounded-full bg-white/70 top-0.5 left-0.5"></div>
                      </>
                    )}
                  </div>
                ))}
              </motion.div>
            ))}

            {particles.map((p, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute rounded-full"
                style={{
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  transform: `translate3d(${p.x}px, ${p.y}px, 0)`,
                }}
                animate={{
                  opacity: [1, 0],
                  scale: [1, 0.5],
                  transition: { duration: p.life }
                }}
              />
            ))}

            {food.map((f, i) => (
              <div
                key={`food-${i}`}
                className="absolute w-4 h-4 bg-gradient-to-br from-red-500 via-yellow-400 to-green-500 rounded-full animate-pulse shadow-lg border border-white/50"
                style={{
                  transform: `translate3d(${f.x * CELL_SIZE}px, ${f.y * CELL_SIZE}px, 0)`,
                  boxShadow: '0 0 8px rgba(255, 0, 0, 0.7), inset 0 0 4px rgba(255, 255, 255, 0.5)'
                }}
              >
                <div className="absolute w-1 h-1 bg-white/80 rounded-full top-1 left-1"></div>
              </div>
            ))}

            {gameOver && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
                <h2 className="text-3xl font-bold text-white mb-4">Game Over!</h2>
                <p className="text-xl text-teal-400 mb-8">Score: {score}</p>
                <button
                  onClick={restartGame}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 text-white font-bold hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105 transition-all duration-300"
                >
                  Rejouer
                </button>
              </div>
            )}

            {!gameStarted && !gameOver && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20">
                <h2 className="text-3xl font-bold text-white mb-4">Snake Game</h2>
                <p className="text-md text-gray-300 mb-2">Utilisez les flèches du clavier pour vous déplacer</p>
                <p className="text-md text-gray-300 mb-8">Mangez les fruits et évitez les ennemis</p>
                <button
                  onClick={() => { restartGame(); setGameStarted(true); }}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 text-white font-bold hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105 transition-all duration-300"
                >
                  Commencer
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}