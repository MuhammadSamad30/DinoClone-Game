"use client";
import { useEffect, useRef, useState } from "react";

const DinoRunner = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const groundYRef = useRef(0);

  const dinoRef = useRef({
    x: 75,
    y: 0,
    radius: 25,
    velocityY: 1,
    jumpForce: 15,
    isJumping: false,
  });

  const obstaclesRef = useRef<
    { x: number; y: number; width: number; height: number }[]
  >([]);
  const obstacleSpawnTimerRef = useRef(0);

  const gravity = 0.7;
  const baseGameSpeed = 5;

  const gameLoop = () => {
    const difficulty = Math.min(1 + score * 0.01, 3);
    const gameSpeed = baseGameSpeed * difficulty;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const groundY = groundYRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const dino = dinoRef.current;
    dino.y += dino.velocityY;
    dino.velocityY += gravity;

    if (dino.y > groundY - dino.radius) {
      dino.y = groundY - dino.radius;
      dino.velocityY = 0;
      dino.isJumping = false;
    }

    ctx.fillStyle = "#34D399";
    ctx.beginPath();
    ctx.arc(dino.x, dino.y, dino.radius, 0, Math.PI * 2);
    ctx.fill();

    obstacleSpawnTimerRef.current += 1;
    if (obstacleSpawnTimerRef.current > 60 / difficulty) {
      const obstacleHeight = Math.random() * 30 + 20;
      obstaclesRef.current.push({
        x: canvas.width,
        y: groundY - obstacleHeight,
        width: Math.random() * 20 + 20,
        height: obstacleHeight,
      });
      obstacleSpawnTimerRef.current = 0;
    }

    for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
      const obstacle = obstaclesRef.current[i];
      obstacle.x -= gameSpeed;

      ctx.fillStyle = "#1a95a5";
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

      const distX = Math.abs(dino.x - (obstacle.x + obstacle.width / 2));
      const distY = Math.abs(dino.y - (obstacle.y + obstacle.height / 2));

      if (
        distX < dino.radius + obstacle.width / 2 &&
        distY < dino.radius + obstacle.height / 2
      ) {
        setGameOver(true);
        cancelAnimationFrame(requestRef.current!);
        return;
      }

      if (obstacle.x + obstacle.width < 0) {
        obstaclesRef.current.splice(i, 1);
        setScore((prev) => prev + 1);
      }
    }

    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(canvas.width, groundY);
    ctx.strokeStyle = "#9CA3AF";
    ctx.lineWidth = 2;
    ctx.stroke();

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const handleJump = () => {
    const dino = dinoRef.current;
    if (!dino.isJumping) {
      dino.velocityY = -dino.jumpForce;
      dino.isJumping = true;
    }
  };

  const resetGame = () => {
    dinoRef.current = {
      x: 75,
      y: groundYRef.current - 25,
      radius: 25,
      velocityY: 0,
      jumpForce: 15,
      isJumping: false,
    };
    obstaclesRef.current = [];
    obstacleSpawnTimerRef.current = 0;
    setScore(0);
    setGameOver(false);
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth > 600 ? 600 : window.innerWidth - 40;
      canvas.height = 300;
      groundYRef.current = canvas.height - 20;
      dinoRef.current.y = groundYRef.current - dinoRef.current.radius;

      const handleKeyDown = (e: KeyboardEvent) =>
        e.code === "Space" && handleJump();
      const handleTouchStart = () => handleJump();

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("touchstart", handleTouchStart);

      requestRef.current = requestAnimationFrame(gameLoop);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("touchstart", handleTouchStart);
        cancelAnimationFrame(requestRef.current!);
      };
    }
  }, []);

  return (
    <div
      id="body"
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b"
    >
      <p className="text-xl text-gray-300 mb-10">
        Developed by{" "}
        <span className="font-bold text-green-500">Muhammad Samad</span>
      </p>
      <h1 className="text-4xl font-bold text-white mb-8">Dino Runner</h1>

      <div className="relative w-full max-w-md shadow-lg rounded overflow-hidden">
        <canvas ref={canvasRef} className="bg-[#d41f1f] block w-full " />
        {gameOver && (
          <div className="absolute inset-0 bg-[#aa1616] bg-opacity-80 flex flex-col items-center justify-center p-6 rounded">
            <p className="text-2xl text-white mb-6">
              Final Score:{" "}
              <span
                className={
                  score < 5
                    ? "text-red-400"
                    : score < 10
                    ? "text-green-500"
                    : score < 20
                    ? "text-yellow-400"
                    : "text-blue-500"
                }
              >
                {score}
              </span>
            </p>
            <p
              className={`text-xl font-semibold ${
                score < 5
                  ? "text-red-400"
                  : score < 10
                  ? "text-green-500"
                  : score < 20
                  ? "text-yellow-400"
                  : "text-blue-500"
              }`}
            >
              {score < 5
                ? "You Need More Practice! 🙃"
                : score < 10
                ? "Good Job! 🥳"
                : score < 20
                ? "Great! 😎"
                : "Excellent Performance! 🤩"}
            </p>
            <h2 className="text-3xl font-bold text-red-500 mb-4">Game Over</h2>
            <button
              onClick={resetGame}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 hover:border text-white font-semibold rounded shadow-md"
            >
              Restart
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-gray-700 rounded shadow-md text-white">
        <p className="text-xl font-medium">Score: {score}</p>
      </div>
    </div>
  );
};

export default DinoRunner;
