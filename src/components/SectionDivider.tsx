'use client';

import { motion } from 'framer-motion';

interface SectionDividerProps {
  variant?: 'line' | 'dots' | 'gradient';
  color?: string;
}

export default function SectionDivider({
  variant = 'line',
  color = '#c9a96e',
}: SectionDividerProps) {
  if (variant === 'dots') {
    return (
      <div className="flex items-center justify-center py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex items-center gap-3"
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: 0.4,
                delay: 0.1 + i * 0.08,
                ease: 'easeOut',
              }}
              className="rounded-full"
              style={{
                width: i === 2 ? '8px' : '5px',
                height: i === 2 ? '8px' : '5px',
                backgroundColor:
                  i === 2 ? color : `rgba(201, 169, 110, ${0.2 + i * 0.05})`,
                boxShadow:
                  i === 2 ? `0 0 8px ${color}60` : 'none',
              }}
            />
          ))}
        </motion.div>
      </div>
    );
  }

  if (variant === 'gradient') {
    return (
      <div className="py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mx-auto max-w-4xl h-[1px]"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${color}40 30%, ${color}80 50%, ${color}40 70%, transparent 100%)`,
          }}
        />
      </div>
    );
  }

  // Default: 'line' variant — thin gold line that expands from center with diamond/dot
  return (
    <div className="py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative mx-auto max-w-xs sm:max-w-sm flex items-center justify-center"
      >
        {/* Left line */}
        <div
          className="flex-1 h-[1px]"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${color}50 100%)`,
          }}
        />
        {/* Center diamond */}
        <motion.div
          initial={{ opacity: 0, scale: 0, rotate: 45 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 45 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
          className="mx-3 w-2 h-2 shrink-0"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}80`,
          }}
        />
        {/* Right line */}
        <div
          className="flex-1 h-[1px]"
          style={{
            background: `linear-gradient(90deg, ${color}50 0%, transparent 100%)`,
          }}
        />
      </motion.div>
    </div>
  );
}
