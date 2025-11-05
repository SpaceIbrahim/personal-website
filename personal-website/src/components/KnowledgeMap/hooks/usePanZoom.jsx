import { useEffect, useState, useCallback } from "react";

export default function usePanZoom(viewportRef) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setOffset({ x: r.width / 2, y: r.height / 2 });
  }, [viewportRef]);

  const onWheel = useCallback((event) => {
    const el = viewportRef.current;
    if (!el) return;

    event.preventDefault();
    const scaleFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const nextZoom = Math.min(Math.max(zoom * scaleFactor, 0.5), 2.4);
    if (nextZoom === zoom) return;

    const rect = el.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const worldX = (mouseX - offset.x) / zoom;
    const worldY = (mouseY - offset.y) / zoom;

    setZoom(nextZoom);
    setOffset({ x: mouseX - worldX * nextZoom, y: mouseY - worldY * nextZoom });
  }, [viewportRef, zoom, offset]);

  const onPointerDownCanvas = useCallback((event) => {
    if (event.button !== 0) return;
    if (event.target.closest(".knowledge-node")) return;
    setIsPanning(true);
    setOrigin({ x: event.clientX - offset.x, y: event.clientY - offset.y });
    event.currentTarget.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }, [offset]);

  const onPointerMoveCanvas = useCallback((event) => {
    if (!isPanning) return;
    setOffset({ x: event.clientX - origin.x, y: event.clientY - origin.y });
  }, [isPanning, origin]);

  const onPointerUpCanvas = useCallback((event) => {
    setIsPanning(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [viewportRef, onWheel]);

  return { offset, zoom, isPanning, onPointerDownCanvas, onPointerMoveCanvas, onPointerUpCanvas };
}
