'use client';

import { useState, useEffect, JSX, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Fonctions utilitaires pour gérer les cookies
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const setCookie = (name: string, value: string, days: number = 365) => {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value}; ${expires}; path=/`;
  console.log(`Cookie défini : ${name}=${value}`);
};

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

const GRID_SIZE = 20;
const CELL_SIZE = 25;
const FPS = 10;

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
  const directionRef = useRef<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT');
  const foodRef = useRef<{ x: number; y: number } | null>(null);
  const snakeRef = useRef<{ x: number; y: number }[]>([{ x: 10, y: 10 }]);

  const [snake, setSnake] = useState<{ x: number; y: number }[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<{ x: number; y: number } | null>(null);
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT');
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);

  // Utilisation d'une référence pour le record persistant
  const recordRef = useRef<number>(0);
  const isFirstGameRef = useRef<boolean>(true);
  const [record, setRecord] = useState<number>(recordRef.current); // État pour l'affichage

  // Charger le record au montage
  useEffect(() => {
    const savedRecord = getCookie('snakeRecord');
    console.log('Initialisation - Valeur du cookie "snakeRecord":', savedRecord);
    if (savedRecord !== null && !isNaN(parseInt(savedRecord, 10))) {
      const parsedRecord = parseInt(savedRecord, 10);
      recordRef.current = parsedRecord;
      isFirstGameRef.current = false;
      setRecord(parsedRecord);
      console.log('Record chargé depuis le cookie:', parsedRecord);
    } else {
      console.log('Aucun record trouvé, première partie détectée');
    }
  }, []);

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
    const maxWidth = 600;
    const charWidth = 5 * 6;
    const scaleFactor = Math.min(2.5, Math.max(0.5, maxWidth / (messageLength * charWidth)));
    let totalWidth = messageLength * charWidth * scaleFactor;

    const processedMessage = message.toUpperCase();

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

    setTimeout(() => {
      setShowSnake(true);
      if (gameContainerRef.current) {
        gameContainerRef.current.focus();
      }
    }, 1000);
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
      const speed = 150;

      if (now - lastUpdateTime >= speed) {
        updateGame();
        setLastUpdateTime(now);
      }
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const updateGame = () => {
    const currentDirection = directionRef.current;
    const currentSnake = [...snakeRef.current];
    const head = { ...currentSnake[0] };

    switch (currentDirection) {
      case 'RIGHT': head.x += 1; break;
      case 'LEFT': head.x -= 1; break;
      case 'UP': head.y -= 1; break;
      case 'DOWN': head.y += 1; break;
    }

    if (
      head.x < 0 || head.x >= GRID_SIZE ||
      head.y < 0 || head.y >= GRID_SIZE ||
      currentSnake.some(segment => segment.x === head.x && segment.y === head.y)
    ) {
      setGameOver(true);
      setGameStarted(false);
      const newRecord = Math.max(recordRef.current, score);
      recordRef.current = newRecord;
      setRecord(newRecord);
      setCookie('snakeRecord', newRecord.toString());
      isFirstGameRef.current = false;
      console.log('Fin de partie - Score:', score, 'Record final:', newRecord);
      return;
    }

    currentSnake.unshift(head);

    if (foodRef.current && head.x === foodRef.current.x && head.y === foodRef.current.y) {
      setScore(prev => {
        const newScore = prev + 1;
        console.log('Nourriture mangée - Nouveau score:', newScore, 'Record actuel:', recordRef.current);
        if (isFirstGameRef.current) {
          recordRef.current = newScore;
          setRecord(newScore);
          console.log('Première partie - Record mis à jour à:', newScore);
        } else if (newScore > recordRef.current) {
          recordRef.current = newScore;
          setRecord(newScore);
          console.log('Record dépassé - Nouveau record:', newScore);
        }
        return newScore;
      });
      spawnNewFood(currentSnake);
    } else {
      currentSnake.pop();
    }

    snakeRef.current = currentSnake;
    setSnake([...currentSnake]);
  };

  const spawnNewFood = (snakeBody: { x: number; y: number }[]) => {
    let newX = Math.floor(Math.random() * GRID_SIZE);
    let newY = Math.floor(Math.random() * GRID_SIZE);
    let validPosition = false;

    while (!validPosition) {
      newX = Math.floor(Math.random() * GRID_SIZE);
      newY = Math.floor(Math.random() * GRID_SIZE);
      validPosition = !snakeBody.some(segment => segment.x === newX && segment.y === newY);
    }

    const newFood = { x: newX, y: newY };
    foodRef.current = newFood;
    setFood(newFood);
  };

  useEffect(() => {
    if (gameStarted && !gameOver) {
      requestRef.current = requestAnimationFrame(gameLoop);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!gameStarted || gameOver || !showSnake) return;

    e.preventDefault();

    switch (e.key) {
      case 'ArrowUp':
        if (directionRef.current !== 'DOWN') {
          directionRef.current = 'UP';
          setDirection('UP');
        }
        break;
      case 'ArrowDown':
        if (directionRef.current !== 'UP') {
          directionRef.current = 'DOWN';
          setDirection('DOWN');
        }
        break;
      case 'ArrowLeft':
        if (directionRef.current !== 'RIGHT') {
          directionRef.current = 'LEFT';
          setDirection('LEFT');
        }
        break;
      case 'ArrowRight':
        if (directionRef.current !== 'LEFT') {
          directionRef.current = 'RIGHT';
          setDirection('RIGHT');
        }
        break;
    }
  };

  const restartGame = () => {
    console.log('Avant restart - Score:', score, 'Record:', recordRef.current);
    setGameOver(false);
    setScore(0); // Réinitialise uniquement le score
    const initialSnake = [{ x: 10, y: 10 }];
    snakeRef.current = initialSnake;
    setSnake(initialSnake);
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setLastUpdateTime(0);
    spawnNewFood(initialSnake);
    setGameStarted(true);
    if (gameContainerRef.current) {
      gameContainerRef.current.focus();
    }
    console.log('Après restart - Score:', 0, 'Record maintenu à:', recordRef.current);
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
          tabIndex={0} 
          onKeyDown={handleKeyDown}
          onClick={() => gameContainerRef.current?.focus()}
          className="relative bg-white/10 backdrop-blur-lg rounded-xl p-5 w-[520px] flex flex-col items-center focus:outline-none"
        >
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-teal-500 px-4 py-1 rounded-full text-white font-sans font-bold text-base shadow-md">
            Score: {score} | Record: {record}
          </div>
          <div className="relative w-[500px] h-[500px] bg-gray-800/80 rounded-lg overflow-hidden border-4 border-teal-500 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0 bg-gray-800">
              <div className="absolute inset-0 grid grid-cols-20 grid-rows-20 opacity-30 pointer-events-none">
                {Array.from({ length: 400 }).map((_, i) => (
                  <div key={i} className="border-[0.5px] border-white/30" />
                ))}
              </div>
            </div>

            {snake.map((segment, i) => (
              <div
                key={`segment-${i}-${segment.x}-${segment.y}`}
                className={`absolute w-6 h-6 ${getSnakeTexture(i, i === 0)} rounded-md ${i === 0 ? 'z-10' : ''}`}
                style={{
                  transform: `translate3d(${segment.x * CELL_SIZE}px, ${segment.y * CELL_SIZE}px, 0)`,
                  transition: 'transform 0.02s linear'
                }}
              >
                {i === 0 && (
                  <>
                    <div className="absolute w-2 h-2 rounded-full bg-black top-1 left-1"></div>
                    <div className="absolute w-2 h-2 rounded-full bg-black top-1 right-1"></div>
                  </>
                )}
              </div>
            ))}

            {food && (
              <div
                className="absolute w-6 h-6 bg-red-500 rounded-full animate-pulse shadow-lg border border-white/50"
                style={{
                  transform: `translate3d(${food.x * CELL_SIZE}px, ${food.y * CELL_SIZE}px, 0)`,
                  boxShadow: '0 0 8px rgba(255, 0, 0, 0.7)'
                }}
              />
            )}

            {gameOver && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
                <h2 className="text-3xl font-bold text-white mb-4">Game Over!</h2>
                <p className="text-xl text-teal-400 mb-8">Score: {score} | Record: {record}</p>
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
                <h2 className="text-3xl font-bold text-white mb-4">Snake</h2>
                <p className="text-md text-gray-300 mb-8">Utilisez les flèches pour jouer</p>
                <button
                  onClick={() => { 
                    restartGame(); 
                    setGameStarted(true); 
                    if (gameContainerRef.current) gameContainerRef.current.focus();
                  }}
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