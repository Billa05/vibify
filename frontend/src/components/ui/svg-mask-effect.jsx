"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const MaskContainer = ({
  children,
  revealText,
  size = 10,
  revealSize = 600,
  className
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: null, y: null });
  const containerRef = useRef(null);

  const updateMousePosition = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  useEffect(() => {
    containerRef.current.addEventListener("mousemove", updateMousePosition);
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener("mousemove", updateMousePosition);
      }
    };
  }, []);

  let maskSize = isHovered ? revealSize : size;

  return (
    <motion.div
      ref={containerRef}
      className={cn("h-screen relative", className)}
      style={{
        backgroundColor: isHovered ? "#040404" : "#040404",
      }}
    >
      <motion.div
        className="w-full h-full flex items-center justify-center text-6xl absolute bg-black bg-grid-white/[0.2] [mask-image:url(/mask.svg)] [mask-size:40px] [mask-repeat:no-repeat]"
        animate={{
          maskPosition: `${mousePosition.x - maskSize / 2.2}px ${
            mousePosition.y - maskSize / 2.2
          }px`,
          maskSize: `${maskSize/1.2}px`,
        }}
        transition={{
          duration: 0,
        }}
      >
        <div className="absolute inset-0 bg-white h-full w-full z-0 opacity-100" />
        <div
          onMouseEnter={() => {
            setIsHovered(true);
          }}
          onMouseLeave={() => {
            setIsHovered(false);
          }}
          className="max-w-4xl mx-auto text-center text-4xl font-bold relative z-20 "
          style={{
            color: isHovered ? "black" : "white", // Text remains white on hover
          }}
        >
          {children}
        </div>
      </motion.div>
      <div className="w-full h-full flex items-center justify-center text-white">
        {revealText}
      </div>
    </motion.div>
  );
};