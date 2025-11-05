import { useRef, useCallback } from "react";

export default function useStretchStyles(linkRefs) {
  const stretchStateRef = useRef(new Map());

  const updateStretchStyles = useCallback((activeMap) => {
    const prev = stretchStateRef.current;
    prev.forEach((_, id) => {
      if (!activeMap.has(id)) {
        const el = linkRefs.current.get(id);
        if (el) {
          el.style.removeProperty("--stretch");
          el.classList.remove("knowledge-link--stretched");
        }
      }
    });

    activeMap.forEach((ratio, id) => {
      const el = linkRefs.current.get(id);
      if (el) {
        el.style.setProperty("--stretch", ratio.toFixed(3));
        el.classList.add("knowledge-link--stretched");
      }
    });

    stretchStateRef.current = activeMap;
  }, [linkRefs]);

  return { updateStretchStyles };
}
