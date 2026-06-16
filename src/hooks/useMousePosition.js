import { useState, useEffect, useRef, useCallback } from "react";

const IDLE_TIMEOUT = 2000; // ms sin mover = idle

export default function useMousePosition() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isIdle, setIsIdle] = useState(true);
  const [isOverConsole, setIsOverConsole] = useState(false);
  const idleTimer = useRef(null);

  const handleMouseMove = useCallback((e) => {
    setPosition({ x: e.clientX, y: e.clientY });
    setIsIdle(false);

    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIsIdle(true), IDLE_TIMEOUT);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsIdle(true);
    setPosition({ x: -100, y: -100 });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(idleTimer.current);
    };
  }, [handleMouseMove, handleMouseLeave]);

  // El electrón está activo solo si el mouse se mueve Y no está sobre la consola
  const electronActive = !isIdle && !isOverConsole;

  return { position, electronActive, setIsOverConsole };
}
