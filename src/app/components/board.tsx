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

const isNormalType = (type: string) => {
  return (
    type === "red" ||
    type === "blue" ||
    type === "green" ||
    type === "yellow" ||
    type === "purple" ||
    type === "pink"
  );
};

export const Board = () => {
  const boxTypes = useRef<string[][]>([]);
  const boxStates = useRef<string[][]>([]);
  const boxOffsets = useRef<number[][]>([]);
  const selectedBoxes = useRef<[number, number, string][]>([]);
  const currentBox = useRef<[number, number, string]>([0, 0, ""]);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [state, setState] = useState<string>("");
  const [score, setScore] = useState<number>(0);
  const [selectedTile, setSelectedTile] = useState<[number, number] | null>(null);
  const [swappingTiles, setSwappingTiles] = useState<[[number, number], [number, number]] | null>(null);

  const hasMatches = (board: string[][]): boolean => {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const type = board[row][col];
        if (!isNormalType(type)) continue;

        // Check horizontal match
        if (col >= 2) {
          if (
            board[row][col - 2] === type &&
            board[row][col - 1] === type
          ) {
            return true;
          }
        }
        if (col <= BOARD_SIZE - 3) {
          if (
            board[row][col + 1] === type &&
            board[row][col + 2] === type
          ) {
            return true;
          }
        }

        // Check vertical match
        if (row >= 2) {
          if (
            board[row - 2][col] === type &&
            board[row - 1][col] === type
          ) {
            return true;
          }
        }
        if (row <= BOARD_SIZE - 3) {
          if (
            board[row + 1][col] === type &&
            board[row + 2][col] === type
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const initializeBoxStyle = () => {
    let newBoxTypes: string[][];
    let attempts = 0;
    do {
      newBoxTypes = Array(BOARD_SIZE)
        .fill(null)
        .map(() =>
          Array(BOARD_SIZE)
            .fill(null)
            .map(() => TYPES[Math.floor(Math.random() * 6)])
        );
      attempts++;
    } while (hasMatches(newBoxTypes) && attempts < 50);
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
    setScore(0);
    setSelectedTile(null);
    setSwappingTiles(null);
    if (state === "normal") setState("renormal");
    else setState("normal");
  };

  const findAllMatches = (board: string[][]): Set<string> => {
    const matches = new Set<string>();

    // Check horizontal matches
    for (let row = 0; row < BOARD_SIZE; row++) {
      let count = 1;
      let currentType = board[row][0];
      for (let col = 1; col < BOARD_SIZE; col++) {
        if (board[row][col] === currentType && isNormalType(currentType)) {
          count++;
        } else {
          if (count >= 3 && isNormalType(currentType)) {
            for (let c = col - count; c < col; c++) {
              matches.add(`${row},${c}`);
            }
          }
          count = 1;
          currentType = board[row][col];
        }
      }
      if (count >= 3 && isNormalType(currentType)) {
        for (let c = BOARD_SIZE - count; c < BOARD_SIZE; c++) {
          matches.add(`${row},${c}`);
        }
      }
    }

    // Check vertical matches
    for (let col = 0; col < BOARD_SIZE; col++) {
      let count = 1;
      let currentType = board[0][col];
      for (let row = 1; row < BOARD_SIZE; row++) {
        if (board[row][col] === currentType && isNormalType(currentType)) {
          count++;
        } else {
          if (count >= 3 && isNormalType(currentType)) {
            for (let r = row - count; r < row; r++) {
              matches.add(`${r},${col}`);
            }
          }
          count = 1;
          currentType = board[row][col];
        }
      }
      if (count >= 3 && isNormalType(currentType)) {
        for (let r = BOARD_SIZE - count; r < BOARD_SIZE; r++) {
          matches.add(`${r},${col}`);
        }
      }
    }

    return matches;
  };

  const findConnectedBoxes = (row: number, col: number, type: string) => {
    const visited = new Set<string>();
    const connected: [number, number, string][] = [];

    if (!isBomb(type)) {
      const dfs = (r: number, c: number) => {
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

        dfs(r + 1, c);
        dfs(r - 1, c);
        dfs(r, c + 1);
        dfs(r, c - 1);
      };

      dfs(row, col);
    } else {
      const dfs = (r: number, c: number) => {
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

        dfs(r + 1, c);
        dfs(r - 1, c);
        dfs(r, c + 1);
        dfs(r, c - 1);
      };

      dfs(row, col);

      const newconnected: [number, number, string][] = [];

      connected.forEach(([row, col, newtype]) => {
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
      }, 400);
    } else if (state === "item") {
      setTimeout(() => {
        dropBoxes();
        setState("drop");
      }, 400);
    } else if (state === "drop") {
      setTimeout(() => {
        initializeBoxOffsets();
        const matches = findAllMatches(boxTypes.current);
        if (matches.size > 0) {
          // Chain reaction - more matches found
          const newBoxStates = Array(BOARD_SIZE)
            .fill(null)
            .map(() =>
              Array(BOARD_SIZE)
                .fill(null)
                .map(() => "normal")
            );
          matches.forEach((pos) => {
            const [r, c] = pos.split(",").map(Number);
            newBoxStates[r][c] = "explode";
          });
          boxStates.current = newBoxStates;
          selectedBoxes.current = Array.from(matches).map((pos) => {
            const [r, c] = pos.split(",").map(Number);
            return [r, c, boxTypes.current[r][c]];
          });
          setScore((prev) => prev + matches.size * 10);
          setIsAnimating(true);
          setState("explode");
        } else {
          initializeBoxState();
          setState("normal");
          setIsAnimating(false);
          selectedBoxes.current = [];
          setSwappingTiles(null);
        }
      }, 400);
    }
  }, [state]);

  const checkSwapCreatesMatch = (
    r1: number,
    c1: number,
    r2: number,
    c2: number
  ): boolean => {
    // Create a copy of the board
    const testBoard = boxTypes.current.map((row) => [...row]);
    
    // Swap the tiles
    [testBoard[r1][c1], testBoard[r2][c2]] = [
      testBoard[r2][c2],
      testBoard[r1][c1],
    ];

    // Check if this creates any matches
    const matches = findAllMatches(testBoard);
    return matches.size > 0;
  };

  const swapTiles = (r1: number, c1: number, r2: number, c2: number) => {
    if (isAnimating) return;

    // Check if tiles are adjacent
    const isAdjacent =
      (Math.abs(r1 - r2) === 1 && c1 === c2) ||
      (Math.abs(c1 - c2) === 1 && r1 === r2);

    if (!isAdjacent) {
      setSelectedTile(null);
      const newBoxStates = Array(BOARD_SIZE)
        .fill(null)
        .map(() =>
          Array(BOARD_SIZE)
            .fill(null)
            .map(() => "normal")
        );
      boxStates.current = newBoxStates;
      return;
    }

    // Check if swap creates a match
    if (!checkSwapCreatesMatch(r1, c1, r2, c2)) {
      setSelectedTile(null);
      setSwappingTiles(null);
      const newBoxStates = Array(BOARD_SIZE)
        .fill(null)
        .map(() =>
          Array(BOARD_SIZE)
            .fill(null)
            .map(() => "normal")
        );
      boxStates.current = newBoxStates;
      return;
    }

    // Show swap animation
    setSwappingTiles([[r1, c1], [r2, c2]]);
    const newBoxStates = Array(BOARD_SIZE)
      .fill(null)
      .map(() =>
        Array(BOARD_SIZE)
          .fill(null)
          .map(() => "normal")
      );
    newBoxStates[r1][c1] = "swap";
    newBoxStates[r2][c2] = "swap";
    boxStates.current = newBoxStates;
    setIsAnimating(true);

    // Perform the swap after animation
    setTimeout(() => {
      const temp = boxTypes.current[r1][c1];
      boxTypes.current[r1][c1] = boxTypes.current[r2][c2];
      boxTypes.current[r2][c2] = temp;

      // Find all matches after swap
      const matches = findAllMatches(boxTypes.current);
      const finalBoxStates = Array(BOARD_SIZE)
        .fill(null)
        .map(() =>
          Array(BOARD_SIZE)
            .fill(null)
            .map(() => "normal")
        );

      matches.forEach((pos) => {
        const [r, c] = pos.split(",").map(Number);
        finalBoxStates[r][c] = "explode";
      });

      boxStates.current = finalBoxStates;
      selectedBoxes.current = Array.from(matches).map((pos) => {
        const [r, c] = pos.split(",").map(Number);
        return [r, c, boxTypes.current[r][c]];
      });

      setScore((prev) => prev + matches.size * 10);
      setState("explode");
      setSelectedTile(null);
    }, 300);
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
            newBoxOffsets[row][col] = 56 * (row - firstRow);
            newBoxStates[row][col] = "drop";
          } else {
            if (lastRow == -1) lastRow = row;
            newBoxTypes[row][col] = TYPES[Math.floor(Math.random() * 4)];
            newBoxOffsets[row][col] = 56 * lastRow + 56;
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
    if (isAnimating) {
      return;
    }

    if (selectedTile === null) {
      // First tile selected
      setSelectedTile([row, col]);
      const newBoxStates = Array(BOARD_SIZE)
        .fill(null)
        .map(() =>
          Array(BOARD_SIZE)
            .fill(null)
            .map(() => "normal")
        );
      newBoxStates[row][col] = "select";
      boxStates.current = newBoxStates;
    } else {
      const [selectedRow, selectedCol] = selectedTile;
      if (selectedRow === row && selectedCol === col) {
        // Clicked the same tile - deselect
        setSelectedTile(null);
        const newBoxStates = Array(BOARD_SIZE)
          .fill(null)
          .map(() =>
            Array(BOARD_SIZE)
              .fill(null)
              .map(() => "normal")
          );
        boxStates.current = newBoxStates;
      } else {
        // Try to swap
        swapTiles(selectedRow, selectedCol, row, col);
      }
    }
  };

  useEffect(() => {
    initializeBoard();
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen py-8 px-4">
      <div className="mb-6 text-center">
        <h1 className="text-4xl font-bold mb-2 text-[var(--foreground)]">Match 3 Game</h1>
        <div className="text-2xl font-semibold text-[var(--foreground)]">
          Score: <span className="text-[var(--box-blue-normal)]">{score}</span>
        </div>
        <p className="text-sm text-[var(--foreground-dark)] mt-2">
          Click two adjacent tiles to swap them
        </p>
      </div>
      <div className="board-container relative z-10">
        <div className="grid grid-cols-8 gap-2 w-max h-max">
          {boxTypes.current.map((row, rowIndex) =>
            row.map((color, colIndex) => {
              const isSelected =
                selectedTile &&
                selectedTile[0] === rowIndex &&
                selectedTile[1] === colIndex;
              const isSwapping =
                swappingTiles &&
                ((swappingTiles[0][0] === rowIndex &&
                  swappingTiles[0][1] === colIndex) ||
                  (swappingTiles[1][0] === rowIndex &&
                    swappingTiles[1][1] === colIndex));
              return (
                <Box
                  type={color}
                  state={
                    isSelected
                      ? "select"
                      : isSwapping
                      ? "swap"
                      : boxStates.current[rowIndex][colIndex]
                  }
                  key={`${rowIndex}-${colIndex}`}
                  offset={boxOffsets.current[rowIndex][colIndex]}
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
