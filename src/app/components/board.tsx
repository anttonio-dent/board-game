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
  "red-magnet",
  "blue-magnet",
  "green-magnet",
  "yellow-magnet",
  "purple-magnet",
  "pink-magnet",
];

const BOARD_SIZE = 8;

const isBomb = (type: string) => {
  if (
    type === "red" ||
    type === "blue" ||
    type === "green" ||
    type === "yellow" ||
    type === "purple" ||
    type === "pink"
  )
    return false;
  return true;
};

export const Board = () => {
  const boxTypes = useRef<string[][]>([]);
  const boxStates = useRef<string[][]>([]);
  const boxOffsets = useRef<number[][]>([]);
  const selectedBoxes = useRef<[number, number, string][]>([]);
  const currentBox = useRef<[number, number, string]>([0, 0, ""]);
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
    const connected: [number, number, string][] = [];

    if (!isBomb(type)) {
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
        connected.push([r, c, boxTypes.current[r][c]]);

        // Check all four directions
        dfs(r + 1, c);
        dfs(r - 1, c);
        dfs(r, c + 1);
        dfs(r, c - 1);
      };

      dfs(row, col);
    } else {
      const dfs = (r: number, c: number) => {
        // Check if out of bounds or already visited or different color
        if (
          r < 0 ||
          r >= BOARD_SIZE ||
          c < 0 ||
          c >= BOARD_SIZE ||
          visited.has(`${r},${c}`) ||
          !isBomb(boxTypes.current[r][c])
        ) {
          return;
        }

        visited.add(`${r},${c}`);
        connected.push([r, c, boxTypes.current[r][c]]);

        // Check all four directions
        dfs(r + 1, c);
        dfs(r - 1, c);
        dfs(r, c + 1);
        dfs(r, c - 1);
      };

      dfs(row, col);

      const newconnected: [number, number, string][] = [];

      connected.forEach(([row, col, newtype]) => {
        console.log(newtype);
        if (newtype === "bomb") {
          for (let r = row - 1; r <= row + 1; r++)
            for (let c = col - 1; c <= col + 1; c++)
              if (
                r >= 0 &&
                r < BOARD_SIZE &&
                c >= 0 &&
                c < BOARD_SIZE &&
                !visited.has(`${r},${c}`)
              ) {
                visited.add(`${r},${c}`);
                newconnected.push([r, c, boxTypes.current[r][c]]);
              }
        }
        if (newtype === "h-rocket") {
          const r = row;
          for (let c = 0; c < BOARD_SIZE; c++)
            if (
              r >= 0 &&
              r < BOARD_SIZE &&
              c >= 0 &&
              c < BOARD_SIZE &&
              !visited.has(`${r},${c}`)
            ) {
              visited.add(`${r},${c}`);
              newconnected.push([r, c, boxTypes.current[r][c]]);
            }
        }
        if (newtype === "v-rocket") {
          const c = col;
          for (let r = 0; r < BOARD_SIZE; r++)
            if (
              r < 0 ||
              r >= BOARD_SIZE ||
              c < 0 ||
              c >= BOARD_SIZE ||
              !visited.has(`${r},${c}`)
            ) {
              visited.add(`${r},${c}`);
              newconnected.push([r, c, boxTypes.current[r][c]]);
            }
        }
      });

      newconnected.forEach((connection) => {
        connected.push(connection);
      });
    }
    return connected;
  };

  useEffect(() => {
    if (state === "explode") {
      setTimeout(() => {
        addItems();
        setState("item");
      }, 300);
    } else if (state === "item") {
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
      }, 300);
    }
  }, [state]);

  const selectBoxes = (row: number, col: number) => {
    const type = boxTypes.current[row][col];
    const connectedBoxes = findConnectedBoxes(row, col, type);
    if (connectedBoxes.length >= 2 || isBomb(type)) {
      currentBox.current = [row, col, type];
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

  const addItems = () => {
    const [row, col, type] = currentBox.current;
    const newBoxTypes = [...boxTypes.current];
    const newBoxStates = [...boxStates.current];
    if (isBomb(type)) {
      return;
    }
    if (selectedBoxes.current.length >= 9) {
      newBoxStates[row][col] = "normal";
      if (type === "red") newBoxTypes[row][col] = "red-magnet";
      if (type === "blue") newBoxTypes[row][col] = "blue-magnet";
      if (type === "green") newBoxTypes[row][col] = "green-magnet";
      if (type === "yellow") newBoxTypes[row][col] = "yellow-magnet";
      if (type === "purple") newBoxTypes[row][col] = "purple-magnet";
      if (type === "pink") newBoxTypes[row][col] = "pink-magnet";
    } else if (selectedBoxes.current.length >= 7) {
      newBoxStates[row][col] = "normal";
      newBoxTypes[row][col] = "bomb";
    } else if (selectedBoxes.current.length >= 5) {
      newBoxStates[row][col] = "normal";
      newBoxTypes[row][col] = TYPES[Math.floor(Math.random() * 2) + 7];
    }
    boxTypes.current = newBoxTypes;
    boxStates.current = newBoxStates;
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
