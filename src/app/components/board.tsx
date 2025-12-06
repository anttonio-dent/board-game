"use client";

import { Box } from "./box";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

// Define the colors for our tiles
const TYPES = [
  "red",
  "blue",
  "green",
  "yellow",
  "purple",
  "pink",
  "bomb",
  "v-rocket",
  "h-rocket",
  "red-magnet",
  "blue-magnet",
  "green-magnet",
  "yellow-magnet",
  "purple-magnet",
  "pink-magnet",
];

const BOARD_SIZE = 10;

export const Board = () => {
  const [boxTypes, setBoxTypes] = useState<string[][]>([]);
  const [boxStates, setBoxStates] = useState<string[][]>([]);
  const [boxOffsets, setBoxOffsets] = useState<number[][]>([]);
  const selectedBoxes = useRef<[number, number, string][]>([]);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [state, setState] = useState<string>("");
  const [score, setScore] = useState<number>(0);

  const findAdjacentSameColor = (row: number, col: number, color: string): Set<string> => {
    const visited = new Set<string>();
    const toBreak = new Set<string>();
    
    const dfs = (r: number, c: number) => {
      const key = `${r},${c}`;
      
      // Check bounds
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) {
        return;
      }
      
      // Check if already visited
      if (visited.has(key)) {
        return;
      }
      
      // Check if same color
      if (boxTypes[r] && boxTypes[r][c] === color) {
        visited.add(key);
        toBreak.add(key);
        
        // Check all 4 adjacent directions
        dfs(r + 1, c); // down
        dfs(r - 1, c); // up
        dfs(r, c + 1); // right
        dfs(r, c - 1); // left
      }
    };
    
    dfs(row, col);
    return toBreak;
  };

  const initializeBoxStyle = () => {
    const newBoxTypes = Array(BOARD_SIZE)
      .fill(null)
      .map(() =>
        Array(BOARD_SIZE)
          .fill(null)
          .map(() => TYPES[Math.floor(Math.random() * 6)])
      );
    setBoxTypes(newBoxTypes);
  };

  const initializeBoxState = () => {
    const newBoxStates = Array(BOARD_SIZE)
      .fill(null)
      .map(() =>
        Array(BOARD_SIZE)
          .fill(null)
          .map(() => "normal")
      );
    setBoxStates(newBoxStates);
  };

  const initializeBoxOffsets = () => {
    const newBoxOffsets = Array(BOARD_SIZE)
      .fill(null)
      .map(() =>
        Array(BOARD_SIZE)
          .fill(null)
          .map(() => 0)
      );
    setBoxOffsets(newBoxOffsets);
  };

  const initializeBoard = () => {
    initializeBoxState();
    initializeBoxStyle();
    initializeBoxOffsets();
    setIsAnimating(false);
    setScore(0);
    if (state === "normal") setState("renormal");
    else setState("normal");
  };

  const applyGravity = () => {
    const newBoxTypes = boxTypes.map((row) => [...row]);
    const newBoxOffsets = Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(0));
    const newBoxStates = Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill("normal"));

    // For each column, move boxes down
    for (let col = 0; col < BOARD_SIZE; col++) {
      let writeIndex = BOARD_SIZE - 1; // Start from bottom
      
      // First, move all non-exploded boxes down
      for (let row = BOARD_SIZE - 1; row >= 0; row--) {
        if (boxStates[row] && boxStates[row][col] !== "explode" && newBoxTypes[row][col]) {
          if (writeIndex !== row) {
            // Calculate offset for animation
            newBoxOffsets[writeIndex][col] = 56 * (row - writeIndex);
            newBoxTypes[writeIndex][col] = newBoxTypes[row][col];
            newBoxStates[writeIndex][col] = "drop";
          } else {
            newBoxStates[writeIndex][col] = "normal";
          }
          writeIndex--;
        }
      }
      
      // Fill empty spaces at top with new boxes
      for (let row = writeIndex; row >= 0; row--) {
        newBoxTypes[row][col] = TYPES[Math.floor(Math.random() * 6)];
        newBoxOffsets[row][col] = 56 * (writeIndex - row + 1);
        newBoxStates[row][col] = "new";
      }
    }

    setBoxTypes(newBoxTypes);
    setBoxOffsets(newBoxOffsets);
    setBoxStates(newBoxStates);
  };


  useEffect(() => {
    if (state === "explode") {
      // After explosion animation, apply gravity
      setTimeout(() => {
        applyGravity();
        setState("drop");
      }, 400);
    } else if (state === "drop") {
      // After drop animation, reset and check for more matches
      setTimeout(() => {
        initializeBoxOffsets();
        initializeBoxState();
        setState("normal");
        setIsAnimating(false);
        selectedBoxes.current = [];
      }, 400);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const breakBoxes = (row: number, col: number) => {
    if (isAnimating) return;
    if (!boxTypes[row] || !boxTypes[row][col]) return;

    const color = boxTypes[row][col];
    const boxesToBreak = findAdjacentSameColor(row, col, color);

    // Need at least 2 boxes (the clicked one + at least one neighbor)
    if (boxesToBreak.size < 2) {
      return;
    }

    setIsAnimating(true);
    
    // Mark boxes for explosion
    const newBoxStates = Array(BOARD_SIZE)
      .fill(null)
      .map(() =>
        Array(BOARD_SIZE)
          .fill(null)
          .map(() => "normal")
      );

    boxesToBreak.forEach((pos) => {
      const [r, c] = pos.split(",").map(Number);
      newBoxStates[r][c] = "explode";
    });

    setBoxStates(newBoxStates);
    selectedBoxes.current = Array.from(boxesToBreak).map((pos) => {
      const [r, c] = pos.split(",").map(Number);
      return [r, c, boxTypes[r][c]];
    });

    setScore((prev) => prev + boxesToBreak.size * 10);
    setState("explode");
  };



  const handleBoxClick = (row: number, col: number) => {
    if (isAnimating) {
      return;
    }
    breakBoxes(row, col);
  };

  useEffect(() => {
    initializeBoard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen py-8 px-4">
      <div className="mb-6 text-center">
        <h1 className="text-4xl font-bold mb-2 text-[var(--foreground)]">Match 3 Game</h1>
        <div className="text-2xl font-semibold text-[var(--foreground)]">
          Score: <span className="text-[var(--box-blue-normal)]">{score}</span>
        </div>
        <p className="text-sm text-[var(--foreground-dark)] mt-2">
          Click a box to break all adjacent boxes of the same color
        </p>
      </div>
      <div className="board-container relative z-10">
        <div className="grid grid-cols-10 gap-2 w-max h-max">
          {boxTypes.length > 0 && boxTypes.map((row, rowIndex) =>
            row.map((color, colIndex) => {
              return (
                <Box
                  type={color}
                  state={(boxStates[rowIndex] && boxStates[rowIndex][colIndex]) || "normal"}
                  key={`${rowIndex}-${colIndex}`}
                  offset={(boxOffsets[rowIndex] && boxOffsets[rowIndex][colIndex]) || 0}
                  onClick={() => handleBoxClick(rowIndex, colIndex)}
                />
              );
            })
          )}
        </div>
      </div>
      <motion.button
        className="mt-8 px-8 py-3 bg-gradient-to-br from-[var(--foreground)] to-[var(--foreground-dark)] cursor-pointer rounded-full text-[var(--background)] font-semibold text-lg shadow-[0_6px_0_rgba(0,0,0,0.4),0_8px_16px_rgba(0,0,0,0.3),inset_0_2px_4px_rgba(255,255,255,0.2)] hover:shadow-[0_8px_0_rgba(0,0,0,0.4),0_12px_20px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.2)] transition-all duration-200"
        onClick={initializeBoard}
        whileHover={{ y: -4, scale: 1.05 }}
        whileTap={{ y: -2, scale: 0.98 }}
      >
        New Game
      </motion.button>
    </div>
  );
};
