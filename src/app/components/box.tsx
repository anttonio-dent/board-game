import { useAnimation, motion } from "framer-motion";
import React, { useEffect } from "react";
import {
  Heart,
  Droplet,
  Leaf,
  Sun,
  Flower,
  Moon,
  MoveHorizontal,
  MoveVertical,
  Bomb,
  Magnet,
} from "lucide-react";

const boxStyle = (type: string) => {
  switch (type) {
    case "red":
      return "relative flex items-center justify-center w-10 h-10 border-none rounded bg-[var(--box-red-normal)] cursor-pointer shadow-[0_4px_0_var(--box-red-dark)]";
    case "green":
      return "relative flex items-center justify-center w-10 h-10 border-none rounded bg-[var(--box-green-normal)] cursor-pointer shadow-[0_4px_0_var(--box-green-dark)]";
    case "blue":
      return "relative flex items-center justify-center w-10 h-10 border-none rounded bg-[var(--box-blue-normal)] cursor-pointer shadow-[0_4px_0_var(--box-blue-dark)]";
    case "pink":
      return "relative flex items-center justify-center w-10 h-10 border-none rounded bg-[var(--box-pink-normal)] cursor-pointer shadow-[0_4px_0_var(--box-pink-dark)]";
    case "purple":
      return "relative flex items-center justify-center w-10 h-10 border-none rounded bg-[var(--box-purple-normal)] cursor-pointer shadow-[0_4px_0_var(--box-purple-dark)]";
    case "yellow":
      return "relative flex items-center justify-center w-10 h-10 border-none rounded bg-[var(--box-yellow-normal)] cursor-pointer shadow-[0_4px_0_var(--box-yellow-dark)]";
    case "v-rocket":
      return "relative flex items-center justify-center w-10 h-10 border-none rounded-full bg-[var(--box-black-normal)] cursor-pointer shadow-[0_4px_0_var(--box-black-dark)]";
    case "h-rocket":
      return "relative flex items-center justify-center w-10 h-10 border-none rounded-full bg-[var(--box-black-normal)] cursor-pointer shadow-[0_4px_0_var(--box-black-dark)]";
    case "bomb":
      return "relative flex items-center justify-center w-10 h-10 border-none rounded-full bg-[var(--box-gray-normal)] cursor-pointer shadow-[0_4px_0_var(--box-gray-dark)]";
    case "red-magnet":
      return "relative flex items-center justify-center w-10 h-10 border-none rounded-full bg-[var(--box-red-normal)] cursor-pointer shadow-[0_4px_0_var(--box-red-dark)]";
    case "green-magnet":
      return "relative flex items-center justify-center w-10 h-10 border-none rounded-full bg-[var(--box-green-normal)] cursor-pointer shadow-[0_4px_0_var(--box-green-dark)]";
    case "blue-magnet":
      return "relative flex items-center justify-center w-10 h-10 border-none rounded-full bg-[var(--box-blue-normal)] cursor-pointer shadow-[0_4px_0_var(--box-blue-dark)]";
    case "pink-magnet":
      return "relative flex items-center justify-center w-10 h-10 border-none rounded-full bg-[var(--box-pink-normal)] cursor-pointer shadow-[0_4px_0_var(--box-pink-dark)]";
    case "purple-magnet":
      return "relative flex items-center justify-center w-10 h-10 border-none rounded-full bg-[var(--box-purple-normal)] cursor-pointer shadow-[0_4px_0_var(--box-purple-dark)]";
    case "yellow-magnet":
      return "relative flex items-center justify-center w-10 h-10 border-none rounded-full bg-[var(--box-yellow-normal)] cursor-pointer shadow-[0_4px_0_var(--box-yellow-dark)]";
  }
  return "";
};

const frameStyle = (type: string) => {
  if (
    type === "red" ||
    type === "green" ||
    type === "blue" ||
    type === "pink" ||
    type === "purple" ||
    type === "yellow"
  )
    return "absolute top-[-2px] left-[-2px] w-11 h-12 border-2 border-white cursor-pointer rounded-lg";
  return "absolute top-[-2px] left-[-2px] w-11 h-12 border-2 border-white cursor-pointer rounded-full";
};

interface BoxProps {
  type: string; // Specify the possible types
  state?: string;
  onClick?: () => void;
  offset?: number;
}

export const Box: React.FC<BoxProps> = ({
  type,
  state = "normal",
  onClick,
  offset = 0,
}) => {
  const controls = useAnimation();
  const frameControls = useAnimation();

  const handleClick = () => {
    if (onClick) onClick();
  };

  const intializeBox = () => {};

  useEffect(() => {
    intializeBox();
  }, []);

  useEffect(() => {
    if (state === "select") {
      controls.start({ y: -3 });
      frameControls.start({ opacity: 1 });
    } else if (state === "normal") {
      controls.start({ y: 0, scale: 1, opacity: 1 });
      frameControls.start({ opacity: 0 });
    } else if (state === "explode") {
      controls.start({ opacity: 0, scale: 1.5 });
      frameControls.start({ opacity: 0 });
    } else if (state === "drop") {
      controls.start({ y: -offset, opacity: 1, scale: 1 }, { duration: 0 });
    } else if (state === "new") {
      controls.start({ y: -offset, opacity: 0, scale: 1 }, { duration: 0 });
    }
  }, [state]);

  return (
    <motion.div
      className={boxStyle(type)}
      animate={controls}
      onClick={handleClick}
      whileHover={state === "normal" ? { y: -3 } : {}}
      whileTap={state === "normal" ? { y: -1 } : {}}
    >
      {(() => {
        switch (type) {
          case "red":
            return <Heart color="var(--box-red-dark)" size={20} />;
          case "green":
            return <Leaf color="var(--box-green-dark)" size={20} />;
          case "blue":
            return <Droplet color="var(--box-blue-dark)" size={20} />;
          case "yellow":
            return <Sun color="var(--box-yellow-dark)" size={20} />;
          case "pink":
            return <Flower color="var(--box-pink-dark)" size={20} />;
          case "purple":
            return <Moon color="var(--box-purple-dark)" size={20} />;
          case "v-rocket":
            return <MoveVertical color="var(--box-black-dark)" size={20} />;
          case "h-rocket":
            return <MoveHorizontal color="var(--box-black-dark)" size={20} />;
          case "bomb":
            return <Bomb color="var(--box-gray-dark)" size={20} />;
          case "red-magnet":
            return <Magnet color="var(--box-red-dark)" size={20} />;
          case "green-magnet":
            return <Magnet color="var(--box-green-dark)" size={20} />;
          case "blue-magnet":
            return <Magnet color="var(--box-blue-dark)" size={20} />;
          case "yellow-magnet":
            return <Magnet color="var(--box-yellow-dark)" size={20} />;
          case "pink-magnet":
            return <Magnet color="var(--box-pink-dark)" size={20} />;
          case "purple-magnet":
            return <Magnet color="var(--box-purple-dark)" size={20} />;
        }
      })()}
      <motion.button
        className={frameStyle(type)}
        animate={frameControls}
        initial={{ opacity: 0 }}
      />
    </motion.div>
  );
};
