import {
  MAX_LINK_LENGTH, STRETCH_BAND, FOLLOW_FACTOR, MIN_NODE_DISTANCE
} from "./constants.js";
import { clampWithinCanvas } from "./graphUtils.jsx";

export const rebuildStretchMap = (links, lookup) => {
  const map = new Map();
  links.forEach((link) => {
    const src = lookup.get(link.source);
    const dst = lookup.get(link.target);
    if (!src || !dst) return;
    const dx = src.position.x - dst.position.x;
    const dy = src.position.y - dst.position.y;
    const dist = Math.hypot(dx, dy);
    if (dist > MAX_LINK_LENGTH) {
      const ratio = Math.max(0, Math.min(1, (dist - MAX_LINK_LENGTH) / STRETCH_BAND));
      if (ratio > 0.001) map.set(link.id, ratio);
    }
  });
  return map;
};

export const pullConnected = (rootId, adjacency, lookup, topics, index, updateVisual) => {
  const visited = new Set([rootId]);
  const queue = [rootId];
  const processedLinks = new Set();
  const moved = new Set();

  while (queue.length) {
    const currentId = queue.shift();
    const current = lookup.get(currentId);
    if (!current) continue;

    const neighbors = adjacency.get(currentId) || [];
    neighbors.forEach((link) => {
      if (processedLinks.has(link.id)) return;
      processedLinks.add(link.id);

      const neighborId = link.source === currentId ? link.target : link.source;
      const neighborIndex = index.get(neighborId);
      const neighbor = neighborIndex !== undefined ? lookup.get(neighborId) : null;
      if (!neighbor) return;

      const dx = current.position.x - neighbor.position.x;
      const dy = current.position.y - neighbor.position.y;
      const distance = Math.hypot(dx, dy) || 1;

      if (distance > MAX_LINK_LENGTH) {
        const excess = distance - MAX_LINK_LENGTH;
        const pull = Math.min(excess, STRETCH_BAND) * FOLLOW_FACTOR;
        const dirX = dx / distance, dirY = dy / distance;

        neighbor.position = {
          x: clampWithinCanvas(neighbor.position.x + dirX * pull),
          y: clampWithinCanvas(neighbor.position.y + dirY * pull),
        };

        lookup.set(neighborId, neighbor);
        topics[neighborIndex] = neighbor;
        updateVisual(neighborId);
        moved.add(neighborId);

        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push(neighborId);
        }
      }
    });
  }
  return moved;
};

export const resolveCollisions = (originIds, lookup, topics, index, updateVisual) => {
  if (!originIds || originIds.size === 0) return new Set();

  const queue = Array.from(originIds);
  const processed = new Set(queue);
  const moved = new Set();

  while (queue.length) {
    const currentId = queue.shift();
    const currentIndex = index.get(currentId);
    if (currentIndex === undefined) continue;

    const currentTopic = lookup.get(currentId);
    if (!currentTopic) continue;

    for (let i = 0; i < topics.length; i += 1) {
      if (i === currentIndex) continue;
      const other = topics[i];
      const otherId = other.id;

      const dx = other.position.x - currentTopic.position.x;
      const dy = other.position.y - currentTopic.position.y;
      let distance = Math.hypot(dx, dy);

      if (distance < MIN_NODE_DISTANCE && distance > 0) {
        const overlap = MIN_NODE_DISTANCE - distance;
        const ux = dx / distance, uy = dy / distance;
        const push = overlap / 2;

        other.position = {
          x: clampWithinCanvas(other.position.x + ux * push),
          y: clampWithinCanvas(other.position.y + uy * push),
        };

        if (!originIds.has(currentId)) {
          currentTopic.position = {
            x: clampWithinCanvas(currentTopic.position.x - ux * push),
            y: clampWithinCanvas(currentTopic.position.y - uy * push),
          };
          lookup.set(currentId, currentTopic);
          topics[currentIndex] = currentTopic;
          updateVisual(currentId);
          moved.add(currentId);
          if (!processed.has(currentId)) { queue.push(currentId); processed.add(currentId); }
        }

        lookup.set(otherId, other);
        topics[i] = other;
        updateVisual(otherId);
        moved.add(otherId);

        if (!processed.has(otherId)) { queue.push(otherId); processed.add(otherId); }
      } else if (distance === 0) {
        other.position = {
          x: clampWithinCanvas(other.position.x + Math.random() * MIN_NODE_DISTANCE - MIN_NODE_DISTANCE / 2),
          y: clampWithinCanvas(other.position.y + Math.random() * MIN_NODE_DISTANCE - MIN_NODE_DISTANCE / 2),
        };
        lookup.set(otherId, other);
        topics[i] = other;
        updateVisual(otherId);
        moved.add(otherId);
        if (!processed.has(otherId)) { queue.push(otherId); processed.add(otherId); }
      }
    }
  }
  return moved;
};
