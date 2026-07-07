import { motion, useScroll, useSpring } from 'framer-motion';

/** Тонкая cyan-линия прогресса скролла сверху страницы — signature «системности». */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed left-0 top-0 z-[60] h-0.5 w-full origin-left bg-primary"
    />
  );
}
