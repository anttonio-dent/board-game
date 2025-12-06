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
  const baseStyle = "relative flex items-center justify-center w-12 h-12 border-none rounded-lg cursor-pointer transition-all duration-200";
  const shadowStyle = "shadow-[0_6px_0_rgba(0,0,0,0.3),0_8px_16px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.2)]";
  
  switch (type) {
    case "red":
      return `${baseStyle} bg-gradient-to-br from-[#ff4d5a] via-[var(--box-red-normal)] to-[var(--box-red-dark)] ${shadowStyle}`;
    case "green":
      return `${baseStyle} bg-gradient-to-br from-[#68d391] via-[var(--box-green-normal)] to-[var(--box-green-dark)] ${shadowStyle}`;
    case "blue":
      return `${baseStyle} bg-gradient-to-br from-[#60a5fa] via-[var(--box-blue-normal)] to-[var(--box-blue-dark)] ${shadowStyle}`;
    case "pink":
      return `${baseStyle} bg-gradient-to-br from-[#f472b6] via-[var(--box-pink-normal)] to-[var(--box-pink-dark)] ${shadowStyle}`;
    case "purple":
      return `${baseStyle} bg-gradient-to-br from-[#c084fc] via-[var(--box-purple-normal)] to-[var(--box-purple-dark)] ${shadowStyle}`;
    case "yellow":
      return `${baseStyle} bg-gradient-to-br from-[#fcd34d] via-[var(--box-yellow-normal)] to-[var(--box-yellow-dark)] ${shadowStyle}`;
    case "v-rocket":
      return `${baseStyle} rounded-full bg-gradient-to-br from-[#5a6678] via-[var(--box-black-normal)] to-[var(--box-black-dark)] ${shadowStyle}`;
    case "h-rocket":
      return `${baseStyle} rounded-full bg-gradient-to-br from-[#5a6678] via-[var(--box-black-normal)] to-[var(--box-black-dark)] ${shadowStyle}`;
    case "bomb":
      return `${baseStyle} rounded-full bg-gradient-to-br from-[#6fa8a5] via-[var(--box-gray-normal)] to-[var(--box-gray-dark)] ${shadowStyle}`;
    case "red-magnet":
      return `${baseStyle} rounded-full bg-gradient-to-br from-[#ff4d5a] via-[var(--box-red-normal)] to-[var(--box-red-dark)] ${shadowStyle} ring-2 ring-[#ff4d5a] ring-opacity-50`;
    case "green-magnet":
      return `${baseStyle} rounded-full bg-gradient-to-br from-[#68d391] via-[var(--box-green-normal)] to-[var(--box-green-dark)] ${shadowStyle} ring-2 ring-[#68d391] ring-opacity-50`;
    case "blue-magnet":
      return `${baseStyle} rounded-full bg-gradient-to-br from-[#60a5fa] via-[var(--box-blue-normal)] to-[var(--box-blue-dark)] ${shadowStyle} ring-2 ring-[#60a5fa] ring-opacity-50`;
    case "pink-magnet":
      return `${baseStyle} rounded-full bg-gradient-to-br from-[#f472b6] via-[var(--box-pink-normal)] to-[var(--box-pink-dark)] ${shadowStyle} ring-2 ring-[#f472b6] ring-opacity-50`;
    case "purple-magnet":
      return `${baseStyle} rounded-full bg-gradient-to-br from-[#c084fc] via-[var(--box-purple-normal)] to-[var(--box-purple-dark)] ${shadowStyle} ring-2 ring-[#c084fc] ring-opacity-50`;
    case "yellow-magnet":
      return `${baseStyle} rounded-full bg-gradient-to-br from-[#fcd34d] via-[var(--box-yellow-normal)] to-[var(--box-yellow-dark)] ${shadowStyle} ring-2 ring-[#fcd34d] ring-opacity-50`;
  }
  return "";
};

const frameStyle = (type: string) => {
  const baseFrame = "absolute top-[-3px] left-[-3px] w-[52px] h-[52px] border-[3px] border-white cursor-pointer shadow-[0_0_12px_rgba(255,255,255,0.6),inset_0_0_8px_rgba(255,255,255,0.3)]";
  if (
    type === "red" ||
    type === "green" ||
    type === "blue" ||
    type === "pink" ||
    type === "purple" ||
    type === "yellow"
  )
    return `${baseFrame} rounded-lg`;
  return `${baseFrame} rounded-full`;
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
      controls.start({ 
        y: -6, 
        scale: 1.1,
        rotate: [0, -2, 2, -2, 2, 0],
        filter: "brightness(1.2) drop-shadow(0 8px 16px rgba(0,0,0,0.5))"
      });
      frameControls.start({ opacity: 1, scale: 1.05 });
    } else if (state === "swap") {
      controls.start({ 
        scale: 1.2,
        rotate: [0, 180, 360],
        filter: "brightness(1.3) drop-shadow(0 0 20px currentColor)"
      }, { duration: 0.3 });
    } else if (state === "normal") {
      controls.start({ 
        y: 0, 
        scale: 1, 
        opacity: 1,
        rotate: 0,
        filter: "brightness(1) drop-shadow(0 6px 0 rgba(0,0,0,0.3))"
      });
      frameControls.start({ opacity: 0, scale: 1 });
    } else if (state === "explode") {
      controls.start({ 
        opacity: 0, 
        scale: 1.8,
        rotate: 360,
        filter: "brightness(1.5) drop-shadow(0 0 20px currentColor)"
      });
      frameControls.start({ opacity: 0, scale: 1.5 });
    } else if (state === "drop") {
      controls.start({ y: -offset, opacity: 1, scale: 1, rotate: 0 }, { duration: 0 });
    } else if (state === "new") {
      controls.start({ y: -offset, opacity: 0, scale: 0.5, rotate: 0 }, { duration: 0 });
      setTimeout(() => {
        controls.start({ opacity: 1, scale: 1 }, { duration: 0.3, type: "spring" });
      }, 50);
    }
  }, [state, offset]);

  return (
    <motion.div
      className={boxStyle(type)}
      animate={controls}
      onClick={handleClick}
      whileHover={state === "normal" ? { 
        y: -4, 
        scale: 1.05,
        filter: "brightness(1.15) drop-shadow(0 8px 12px rgba(0,0,0,0.4))"
      } : {}}
      whileTap={state === "normal" ? { 
        y: -2, 
        scale: 0.98,
        filter: "brightness(0.95)"
      } : {}}
      style={{
        transformStyle: "preserve-3d",
      }}
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
