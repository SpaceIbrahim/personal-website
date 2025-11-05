import { useCallback } from "react";
import { computeLinkPath, clampWithinCanvas } from "../graph/graphUtils.jsx";
import { rebuildStretchMap, pullConnected, resolveCollisions } from "../graph/layoutPhysics.jsx";

export default function useDragNodes({
  zoom, linkDefs, adjacency, topicsRef, lookupRef, indexRef,
  setTopics, setPaths, linkRefs, nodeRefs, updateStretchStyles
}) {
  const updateVisualForTopic = useCallback((topicId) => {
    const index = indexRef.current.get(topicId);
    if (index === undefined) return;
    const topic = topicsRef.current[index];

    const nodeEl = nodeRefs.current.get(topicId);
    if (nodeEl) {
      nodeEl.style.left = `${topic.position.x}px`;
      nodeEl.style.top  = `${topic.position.y}px`;
    }

    const connected = adjacency.get(topicId) || [];
    connected.forEach((link) => {
      const pathEl = linkRefs.current.get(link.id);
      if (!pathEl) return;
      const path = computeLinkPath(link, lookupRef.current);
      if (path) pathEl.setAttribute("d", path);
    });
  }, [adjacency, indexRef, linkRefs, nodeRefs, topicsRef, lookupRef]);

  const startNodeDrag = useCallback((topicId, event) => {
    if (event.button !== 2) return;
    event.preventDefault();
    event.stopPropagation();

    const index = indexRef.current.get(topicId);
    if (index === undefined) return;

    const nodeEl = nodeRefs.current.get(topicId);
    const pointerId = event.pointerId;
    nodeEl?.setPointerCapture?.(pointerId);

    const topic = topicsRef.current[index];
    const startPointer = { x: event.clientX, y: event.clientY };
    const startPos = { ...topic.position };
    const snapshot = topicsRef.current.map(t => ({ ...t, position: { ...t.position }}));

    nodeEl?.classList.add("knowledge-node--dragging");

    let finished = false;

    const handleMove = (e) => {
      e.preventDefault();
      const dx = (e.clientX - startPointer.x) / zoom;
      const dy = (e.clientY - startPointer.y) / zoom;

      topic.position = { x: clampWithinCanvas(startPos.x + dx), y: clampWithinCanvas(startPos.y + dy) };
      lookupRef.current.set(topicId, topic);
      topicsRef.current[index] = topic;
      updateVisualForTopic(topicId);

      const movedIds = pullConnected(
        topicId,
        adjacency,
        lookupRef.current,
        topicsRef.current,
        indexRef.current,
        updateVisualForTopic
      );
      movedIds.add(topicId);
      const collisionMoves = resolveCollisions(
        movedIds,
        lookupRef.current,
        topicsRef.current,
        indexRef.current,
        updateVisualForTopic
      );
      collisionMoves.forEach(id => movedIds.add(id));

      const stretchMap = rebuildStretchMap(linkDefs, lookupRef.current);
      updateStretchStyles(stretchMap);
    };

    const finishDrag = (commit) => {
      if (finished) return;
      finished = true;

      nodeEl?.classList.remove("knowledge-node--dragging");
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleCancel);

      if (commit) {
        const nextTopics = topicsRef.current.map(t => ({ ...t, position: { ...t.position }}));
        const nextPaths  = linkDefs.map((l) => {
          const pathEl = linkRefs.current.get(l.id);
          return pathEl ? { ...l, path: pathEl.getAttribute("d") } : l;
        });
        setTopics(nextTopics);
        setPaths(nextPaths);
      } else {
        topicsRef.current = snapshot;
        snapshot.forEach((item) => updateVisualForTopic(item.id));
        setTopics(snapshot.map(t => ({ ...t, position: { ...t.position }})));
      }
      const stretchMap = rebuildStretchMap(linkDefs, lookupRef.current);
      updateStretchStyles(stretchMap);
    };

    const handleUp = (e) => { e.preventDefault(); finishDrag(true); };
    const handleCancel = (e) => { e.preventDefault(); finishDrag(false); };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleCancel);
  }, [
    zoom, linkDefs, adjacency, topicsRef, lookupRef, indexRef,
    setTopics, setPaths, linkRefs, nodeRefs, updateStretchStyles, updateVisualForTopic
  ]);

  return { startNodeDrag };
}