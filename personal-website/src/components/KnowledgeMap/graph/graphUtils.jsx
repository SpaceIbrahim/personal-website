import { CANVAS_EXTENT, NODE_RADIUS } from "./constants.js";

export const clampWithinCanvas = (v) =>
  Math.max(-CANVAS_EXTENT, Math.min(CANVAS_EXTENT, v));

export const computeIdleDelay = (id) => {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) % 1024;
  }
  return (hash % 10) / 10;
};

export const normalizeTopic = (topic) => {
  if (!topic) return topic;
  const detail = topic.detail || {};
  const deepDives = Array.isArray(detail.deepDives) ? detail.deepDives : [];
  const resources = Array.isArray(detail.resources) ? detail.resources : [];

  const position = {
    x: (topic.position?.x ?? 0) + (topic.anchor && topic.anchor !== "center" ? NODE_RADIUS : 0),
    y: (topic.position?.y ?? 0) + (topic.anchor && topic.anchor !== "center" ? NODE_RADIUS : 0),
  };

  return {
    ...topic,
    anchor: "center",
    position,
    detail: { overview: detail.overview || "", deepDives, resources },
  };
};

export const cloneTopics = (topics) =>
  topics.map((t) => ({ ...t, position: { ...t.position } }));

export const buildLookup = (topics) => {
  const m = new Map();
  topics.forEach((t) => m.set(t.id, t));
  return m;
};

export const buildIndex = (topics) => {
  const m = new Map();
  topics.forEach((t, i) => m.set(t.id, i));
  return m;
};

export const buildAdjacency = (links) => {
  const a = new Map();
  links.forEach((l) => {
    if (!a.has(l.source)) a.set(l.source, []);
    if (!a.has(l.target)) a.set(l.target, []);
    a.get(l.source).push(l);
    a.get(l.target).push(l);
  });
  return a;
};

export const computeLinkPath = (link, lookup) => {
  const source = lookup.get(link.source);
  const target = lookup.get(link.target);
  if (!source || !target) return null;

  const x1 = source.position.x + CANVAS_EXTENT;
  const y1 = source.position.y + CANVAS_EXTENT;
  const x2 = target.position.x + CANVAS_EXTENT;
  const y2 = target.position.y + CANVAS_EXTENT;

  const dx = x2 - x1, dy = y2 - y1;
  const distance = Math.hypot(dx, dy) || 1;
  const normalX = -dy / distance;
  const normalY =  dx / distance;
  const laneOffset = link.laneCount > 1 ? (link.laneIndex - (link.laneCount - 1) / 2) * 18 : 0;

  const offsetX = normalX * laneOffset;
  const offsetY = normalY * laneOffset;

  return `M ${x1 + offsetX} ${y1 + offsetY} L ${x2 + offsetX} ${y2 + offsetY}`;
};

export const computePaths = (topics, links) => {
  const lookup = buildLookup(topics);
  return links
    .map((l) => {
      const path = computeLinkPath(l, lookup);
      return path ? { ...l, path } : null;
    })
    .filter(Boolean);
};

export const laneifyLinks = (rawLinks) => {
  const groups = new Map();
  rawLinks.forEach((link, index) => {
    const pairKey = [link.source, link.target].sort().join("__");
    if (!groups.has(pairKey)) groups.set(pairKey, []);
    groups.get(pairKey).push({ ...link, rawIndex: index });
  });

  const ordered = [];
  groups.forEach((linksForPair) => {
    linksForPair.sort((a, b) => a.rawIndex - b.rawIndex);
    const count = linksForPair.length;
    linksForPair.forEach((link, laneIndex) => {
      ordered.push({
        id: `${link.source}-${link.target}-${link.rawIndex}`,
        source: link.source,
        target: link.target,
        laneIndex,
        laneCount: count,
        rawIndex: link.rawIndex,
      });
    });
  });

  ordered.sort((a, b) => a.rawIndex - b.rawIndex);
  return ordered.map(({ rawIndex, ...rest }) => rest);
};