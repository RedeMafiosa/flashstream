import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EFFECT_STYLES = {
  stars: {
    particles: ["⭐", "✨", "💫"],
    className: "animate-pulse",
  },
  bubbles: {
    particles: ["🫧", "⚪", "🔵"],
    className: "animate-bounce",
  },
  sparkle: {
    particles: ["✨", "💥", "⚡"],
    className: "animate-spin",
  },
  rainbow: {
    particles: ["🌈", "💎", "🎨"],
    className: "",
    rainbow: true,
  },
  fire: {
    particles: ["🔥", "💥", "⚡"],
    className: "animate-pulse",
  },
  none: {
    particles: [],
    className: "",
  },
};

export default function TagBadge({ tag }) {
  const [hovered, setHovered] = useState(false);
  if (!tag) return null;

  const effect = EFFECT_STYLES[tag.effect] || EFFECT_STYLES.none;
  const isRainbow = tag.effect === "rainbow";

  return (
    <span
      className="relative inline-flex items-center cursor-default"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        className={`
          inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border select-none
          transition-all duration-200
          ${hovered ? "scale-110 shadow-lg" : "scale-100"}
        `}
        style={{
          backgroundColor: tag.bg_color || "#1e1b2e",
          borderColor: tag.color || "#8b5cf6",
          color: tag.color || "#ffffff",
          boxShadow: hovered ? `0 0 12px ${tag.color || "#8b5cf6"}60` : undefined,
          background: isRainbow && hovered
            ? "linear-gradient(90deg, #ff0080, #ff8c00, #ffd700, #00ff00, #00bfff, #8b5cf6)"
            : undefined,
        }}
      >
        {tag.icon && <span>{tag.icon}</span>}
        {tag.label}
      </span>

      {/* Floating Particles on hover */}
      <AnimatePresence>
        {hovered && effect.particles.length > 0 && (
          <>
            {effect.particles.map((particle, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 0, x: 0, scale: 0.5 }}
                animate={{
                  opacity: [0, 1, 0],
                  y: -20 - i * 8,
                  x: (i - 1) * 12,
                  scale: [0.5, 1, 0.5],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
                className="absolute text-xs pointer-events-none"
                style={{ top: -4, left: "50%" }}
              >
                {particle}
              </motion.span>
            ))}
          </>
        )}
      </AnimatePresence>
    </span>
  );
}