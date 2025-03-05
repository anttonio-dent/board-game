"use client";

import { Box } from "./box";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { stat } from "fs";

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
];

const BOARD_SIZE = 8;

export const Board = () => {
  const boxTypes = useRef<string[][]>([]);
  const boxStates = useRef<string[][]>([]);
  const boxOffsets = useRef<number[][]>([]);
  const selectedBoxes = useRef<[number, number][]>([]);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [state, setState] = useState<string>("");

  const initializeBoxStyle = () => {
    const newBoxTypes = Array(BOARD_SIZE)
      .fill(null)
      .map(() =>
        Array(BOARD_SIZE)
          .fill(null)
          .map(() => TYPES[Math.floor(Math.random() * 4)])
      );
    boxTypes.current = newBoxTypes;
  };

  const initializeBoxState = () => {
    const newBoxStates = Array(BOARD_SIZE)
      .fill(null)
      .map(() =>
        Array(BOARD_SIZE)
          .fill(null)
          .map(() => "normal")
      );
    boxStates.current = newBoxStates;
  };

  const initializeBoxOffsets = () => {
    const newBoxOffsets = Array(BOARD_SIZE)
      .fill(null)
      .map(() =>
        Array(BOARD_SIZE)
          .fill(null)
          .map(() => 0)
      );
    boxOffsets.current = newBoxOffsets;
  };

  const initializeBoard = () => {
    initializeBoxState();
    initializeBoxStyle();
    initializeBoxOffsets();
    setIsAnimating(false);
    if (state === "normal") setState("renormal");
    else setState("normal");
  };

  const findConnectedBoxes = (row: number, col: number, type: string) => {
    const visited = new Set<string>();
    const connected: [number, number][] = [];

    const dfs = (r: number, c: number) => {
      // Check if out of bounds or already visited or different color
      if (
        r < 0 ||
        r >= BOARD_SIZE ||
        c < 0 ||
        c >= BOARD_SIZE ||
        visited.has(`${r},${c}`) ||
        boxTypes.current[r][c] !== type
      ) {
        return;
      }

      visited.add(`${r},${c}`);
      connected.push([r, c]);

      // Check all four directions
      dfs(r + 1, c);
      dfs(r - 1, c);
      dfs(r, c + 1);
      dfs(r, c - 1);
    };

    dfs(row, col);
    return connected;
  };

  useEffect(() => {
    if (state === "explode") {
      setTimeout(() => {
        dropBoxes();
        setState("drop");
      }, 300);
    } else if (state === "drop") {
      setTimeout(() => {
        initializeBoxOffsets();
        initializeBoxState();
        setState("normal");
        setIsAnimating(false);
        selectedBoxes.current = [];
      }, 100);
    }
  }, [state]);

  const selectBoxes = (row: number, col: number) => {
    const type = boxTypes.current[row][col];
    const connectedBoxes = findConnectedBoxes(row, col, type);
    if (connectedBoxes.length >= 2) {
      const newBoxStates = Array(BOARD_SIZE)
        .fill(null)
        .map(() =>
          Array(BOARD_SIZE)
            .fill(null)
            .map(() => "normal")
        );
      connectedBoxes.forEach(([r, c]) => {
        newBoxStates[r][c] = "select";
      });
      boxStates.current = newBoxStates;
      selectedBoxes.current = connectedBoxes;
      if (state === "select") setState("reselect");
      else setState("select");
    }
  };

  const explodeBoxes = () => {
    const newBoxStates = Array(BOARD_SIZE)
      .fill(null)
      .map(() =>
        Array(BOARD_SIZE)
          .fill(null)
          .map(() => "normal")
      );
    selectedBoxes.current.forEach(([r, c]) => {
      newBoxStates[r][c] = "explode";
    });
    boxStates.current = newBoxStates;
    setIsAnimating(true);
    setState("explode");
  };

  const dropBoxes = () => {
    const newBoxTypes = [...boxTypes.current];
    const newBoxStates = [...boxStates.current];
    const newBoxOffsets = [...boxOffsets.current];

    for (let col = 0; col < BOARD_SIZE; col++) {
      let lastRow = -1;
      for (let row = BOARD_SIZE - 1; row >= 0; row--) {
        if (newBoxStates[row][col] === "explode") {
          let firstRow = -1;
          for (let newRow = row - 1; newRow >= 0; newRow--) {
            if (newBoxStates[newRow][col] === "normal") {
              firstRow = newRow;
              break;
            }
          }
          if (firstRow !== -1) {
            newBoxStates[firstRow][col] = "explode";
            newBoxTypes[row][col] = newBoxTypes[firstRow][col];
            newBoxOffsets[row][col] = 48 * (row - firstRow);
            newBoxStates[row][col] = "drop";
          } else {
            if (lastRow == -1) lastRow = row;
            newBoxTypes[row][col] = TYPES[Math.floor(Math.random() * 4)];
            newBoxOffsets[row][col] = 48 * lastRow + 48;
            newBoxStates[row][col] = "new";
          }
        }
      }
    }
    console.log(newBoxTypes);
    console.log(newBoxStates);
    boxTypes.current = newBoxTypes;
    boxStates.current = newBoxStates;
    boxOffsets.current = newBoxOffsets;
  };

  const handleBoxClick = (row: number, col: number) => {
    const state = boxStates.current[row][col];
    if (isAnimating) {
      return;
    }
    if (state === "normal") {
      selectBoxes(row, col);
    } else if (state === "select") {
      explodeBoxes();
    }
  };

  useEffect(() => {
    initializeBoard();
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-8 gap-x-1 gap-y-2 w-max h-max p-10">
        {boxTypes.current.map((row, rowIndex) =>
          row.map((color, colIndex) => (
            <Box
              type={color}
              state={boxStates.current[rowIndex][colIndex]}
              key={`${rowIndex}-${colIndex}`}
              offset={boxOffsets.current[rowIndex][colIndex]}
              onClick={() => handleBoxClick(rowIndex, colIndex)}
            />
          ))
        )}
      </div>
      <motion.button
        className="px-6 py-2 bg-[var(--foreground)] cursor-pointer rounded-full text-[var(--background)] shadow-[0_4px_0_var(--foreground-dark)]"
        onClick={initializeBoard}
        whileHover={{ y: -3 }}
        whileTap={{ y: -1 }}
      >
        Reset
      </motion.button>
    </div>
  );
};
