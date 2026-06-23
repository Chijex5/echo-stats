// Moti `from`/`animate`/`exit`/`transition` presets mirroring the web app's
// framer-motion configs (see app/dashboard/sotd/page.tsx, components/Sidebar.tsx).
// Moti's transition shape maps near-mechanically from framer's.

export const sheetSlideUp = {
  from: { translateY: 60, opacity: 0, scale: 0.97 },
  animate: { translateY: 0, opacity: 1, scale: 1 },
  exit: { translateY: 60, opacity: 0, scale: 0.97 },
  transition: { type: "spring" as const, stiffness: 340, damping: 32 },
};

export const drawerSlideX = {
  from: { translateX: -280 },
  animate: { translateX: 0 },
  exit: { translateX: -280 },
  transition: { type: "spring" as const, stiffness: 320, damping: 32 },
};

export function fadeSlideIn(index: number, axis: "x" | "y" = "x") {
  const offset = axis === "x" ? { translateX: -20 } : { translateY: 20 };
  return {
    from: { opacity: 0, ...offset },
    animate: { opacity: 1, translateX: 0, translateY: 0 },
    transition: { duration: 400, delay: index * 50 },
  };
}

export function staggerChild(index: number, delayStepMs = 60) {
  return {
    from: { opacity: 0, translateY: 16 },
    animate: { opacity: 1, translateY: 0 },
    transition: { duration: 350, delay: index * delayStepMs },
  };
}

export function floatAmbient(durationMs = 6000, delayMs = 0) {
  return {
    from: { translateY: -8, opacity: 0.15 },
    animate: { translateY: 8, opacity: 0.7 },
    transition: {
      type: "timing" as const,
      duration: durationMs,
      delay: delayMs,
      loop: true,
      repeatReverse: true,
    },
  };
}

export const pressLift = {
  pressIn: { scale: 0.97 },
  pressOut: { scale: 1 },
  transition: { type: "timing" as const, duration: 120 },
};

export const progressRingTransition = {
  type: "timing" as const,
  duration: 200,
};
