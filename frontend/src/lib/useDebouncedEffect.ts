import { useEffect, useRef } from "react";

// Runs `effect` `delay` ms after the last time `deps` changed, cancelling any
// pending run if deps change again before the delay elapses. Used for autosave
// so we don't fire a network request on every single keystroke/drag frame.
export function useDebouncedEffect(effect: () => void, deps: unknown[], delay: number) {
  const effectRef = useRef(effect);
  effectRef.current = effect;

  useEffect(() => {
    const timeout = setTimeout(() => effectRef.current(), delay);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delay]);
}