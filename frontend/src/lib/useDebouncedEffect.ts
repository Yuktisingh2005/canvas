import { useEffect, useRef } from "react";


export function useDebouncedEffect(effect: () => void, deps: unknown[], delay: number) {
  const effectRef = useRef(effect);
  effectRef.current = effect;

  useEffect(() => {
    const timeout = setTimeout(() => effectRef.current(), delay);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delay]);
}