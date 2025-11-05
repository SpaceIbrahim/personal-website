import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import "./knowledgemap.css";
import mapData from "../../data/knowledgeMap.json";

const CANVAS_EXTENT = 4000;
const NODE_RADIUS = 90;
const MAX_LINK_LENGTH = 420;
const STRETCH_BAND = 100;
const FOLLOW_FACTOR = 0.45;
const MIN_NODE_DISTANCE = 190;


const computeIdleDelay = (id) => {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) % 1024;
  }
  return (hash % 10) / 10;
};

const normalizeTopic = (topic) => {
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
    detail: {
      overview: detail.overview || "",
      deepDives,
      resources,
    },
  };
};

const cloneTopics = (topics) =>
  topics.map((topic) => ({
    ...topic,
    position: { ...topic.position },
  }));

const buildLookup = (topics) => {
  const lookup = new Map();
  topics.forEach((topic) => {
    lookup.set(topic.id, topic);
  });
  return lookup;
};

const buildIndex = (topics) => {
  const index = new Map();
  topics.forEach((topic, idx) => {
    index.set(topic.id, idx);
  });
  return index;
};

const computeLinkPath = (link, lookup, options = {}) => {
  const { laneSpacing = 1, wiggle = 0 } = options;
  const source = lookup.get(link.source);
  const target = lookup.get(link.target);
  if (!source || !target) return null;

  const x1 = source.position.x + CANVAS_EXTENT;
  const y1 = source.position.y + CANVAS_EXTENT;
  const x2 = target.position.x + CANVAS_EXTENT;
  const y2 = target.position.y + CANVAS_EXTENT;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.hypot(dx, dy) || 1;
  const normalX = -dy / distance;
  const normalY = dx / distance;
  const baseOffset = link.laneCount > 1 ? (link.laneIndex - (link.laneCount - 1) / 2) * 18 : 0;
  const laneOffset = baseOffset * laneSpacing + wiggle;

  const offsetX = normalX * laneOffset;
  const offsetY = normalY * laneOffset;

  const startX = x1 + offsetX;
  const startY = y1 + offsetY;
  const endX = x2 + offsetX;
  const endY = y2 + offsetY;

  return `M ${startX} ${startY} L ${endX} ${endY}`;
};

const computePaths = (topics, links, laneSpacing = 1) => {
  const lookup = buildLookup(topics);
  return links
    .map((link) => {
      const path = computeLinkPath(link, lookup, { laneSpacing, wiggle: 0 });
      if (!path) return null;
      return { ...link, path };
    })
    .filter(Boolean);
};

const buildAdjacency = (links) => {
  const adjacency = new Map();
  links.forEach((link) => {
    if (!adjacency.has(link.source)) adjacency.set(link.source, []);
    if (!adjacency.has(link.target)) adjacency.set(link.target, []);
    adjacency.get(link.source).push(link);
    adjacency.get(link.target).push(link);
  });
  return adjacency;
};

const KnowledgeMap = () => {
  const mapRootRef = useRef(null);
  const viewportRef = useRef(null);
  const pointerIdRef = useRef(null);

  const initialTopics = useMemo(
    () => cloneTopics((mapData.topics || []).map(normalizeTopic)),
    [],
  );

  const linkDefs = useMemo(() => {
    const groups = new Map();
    (mapData.links || []).forEach((link, index) => {
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
    return ordered.map((link) => {
      const rest = { ...link };
      delete rest.rawIndex;
      return rest;
    });
  }, []);

  const adjacency = useMemo(() => buildAdjacency(linkDefs), [linkDefs]);

  const [topics, setTopics] = useState(initialTopics);
  const [paths, setPaths] = useState(() => computePaths(initialTopics, linkDefs));
  const [activeTopic, setActiveTopic] = useState(null);
  const [isPanning, setIsPanning] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);

  const topicsRef = useRef(cloneTopics(initialTopics));
  const lookupRef = useRef(buildLookup(topicsRef.current));
  const indexRef = useRef(buildIndex(topicsRef.current));
  const nodeRefs = useRef(new Map());
  const linkRefs = useRef(new Map());
  const stretchStateRef = useRef(new Map());
  const isDraggingRef = useRef(false);

useEffect(() => {
  const cloned = cloneTopics(topics);
  topicsRef.current = cloned;
  lookupRef.current = buildLookup(cloned);
  indexRef.current = buildIndex(cloned);
}, [topics]);

  useEffect(() => {
    let frameId;
    const tick = () => {
      const time = performance.now() / 1000;
      nodeRefs.current.forEach((node, id) => {
        if (!node) return;
        if (isDraggingRef.current && node.classList.contains("knowledge-node--dragging")) {
          node.style.setProperty("--idle-x", "0px");
          node.style.setProperty("--idle-y", "0px");
          return;
        }
        const base = computeIdleDelay(id);
        const offsetX = Math.sin(time * 0.6 + base * 2 * Math.PI) * 6;
        const offsetY = Math.cos(time * 0.8 + base * 2 * Math.PI) * 4;
        node.style.setProperty("--idle-x", `${offsetX.toFixed(2)}px`);
        node.style.setProperty("--idle-y", `${offsetY.toFixed(2)}px`);
      });
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  useLayoutEffect(() => {
    if (isInitialized || !viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    setOffset({ x: rect.width / 2, y: rect.height / 2 });
    setIsInitialized(true);
  }, [isInitialized]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (event) => {
      event.preventDefault();

      const scaleFactor = event.deltaY > 0 ? 0.9 : 1.1;
      const nextZoom = Math.min(Math.max(zoom * scaleFactor, 0.5), 2.4);
      if (nextZoom === zoom) return;

      const rect = viewport.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const worldX = (mouseX - offset.x) / zoom;
      const worldY = (mouseY - offset.y) / zoom;

      setZoom(nextZoom);
      setOffset({
        x: mouseX - worldX * nextZoom,
        y: mouseY - worldY * nextZoom,
      });
    };

    viewport.addEventListener("wheel", handleWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", handleWheel);
  }, [offset, zoom]);

  const handlePointerDown = (event) => {
    if (event.button !== 0) return;
    if (event.target.closest(".knowledge-node")) return;

    setIsPanning(true);
    setOrigin({ x: event.clientX - offset.x, y: event.clientY - offset.y });
    pointerIdRef.current = event.pointerId;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  };

  const handlePointerMove = (event) => {
    if (!isPanning || pointerIdRef.current !== event.pointerId) return;
    setOffset({ x: event.clientX - origin.x, y: event.clientY - origin.y });
  };

  const handlePointerUp = (event) => {
    if (pointerIdRef.current !== event.pointerId) return;
    pointerIdRef.current = null;
    setIsPanning(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  const handlePointerCancel = (event) => {
    if (pointerIdRef.current !== event.pointerId) return;
    pointerIdRef.current = null;
    setIsPanning(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  useEffect(() => {
    if (!activeTopic) {
      document.body.style.overflow = "";
      return undefined;
    }
    document.body.style.overflow = "hidden";
    const handleEsc = (event) => {
      if (event.key === "Escape") setActiveTopic(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [activeTopic]);

  const handleTopicClick = (topic) => {
    setActiveTopic(topic);
  };

  const updateStretchStyles = (activeMap) => {
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
  };

  const toggleDraggingVisual = (topicId, active, pointerId, target) => {
    const nodeEl = nodeRefs.current.get(topicId);
    if (nodeEl) {
      nodeEl.classList.toggle("knowledge-node--dragging", active);
      if (active) {
        nodeEl.style.setProperty("--idle-x", "0px");
        nodeEl.style.setProperty("--idle-y", "0px");
      }
      if (pointerId != null) {
        if (active) {
          nodeEl.setPointerCapture?.(pointerId);
        } else {
          nodeEl.releasePointerCapture?.(pointerId);
        }
      }
    }

    if (target && !active) {
      target.releasePointerCapture?.(pointerId);
    }

    mapRootRef.current?.classList.toggle("knowledge-map--dragging", active);
    isDraggingRef.current = active;
  };

  const updateVisualForTopic = (topicId) => {
    const index = indexRef.current.get(topicId);
    if (index === undefined) return;

    const topic = topicsRef.current[index];
    const nodeEl = nodeRefs.current.get(topicId);
    if (nodeEl) {
      nodeEl.style.left = `${topic.position.x}px`;
      nodeEl.style.top = `${topic.position.y}px`;
      if (!isDraggingRef.current) {
        nodeEl.style.setProperty("--idle-x", nodeEl.style.getPropertyValue("--idle-x") || "0px");
        nodeEl.style.setProperty("--idle-y", nodeEl.style.getPropertyValue("--idle-y") || "0px");
      }
    }

    const connected = adjacency.get(topicId) || [];
    connected.forEach((link) => {
      const pathEl = linkRefs.current.get(link.id);
      if (!pathEl) return;
      const path = computeLinkPath(link, lookupRef.current);
      if (path) {
        pathEl.setAttribute("d", path);
      }
    });
  };

const pullConnected = (rootId) => {
  const visited = new Set([rootId]);
  const queue = [rootId];
  const processedLinks = new Set();
  const moved = new Set();

  while (queue.length > 0) {
    const currentId = queue.shift();
    const current = lookupRef.current.get(currentId);
    if (!current) continue;

    const neighbors = adjacency.get(currentId) || [];
    neighbors.forEach((link) => {
      if (processedLinks.has(link.id)) return;
      processedLinks.add(link.id);

      const neighborId = link.source === currentId ? link.target : link.source;
      const neighborIndex = indexRef.current.get(neighborId);
      const neighbor = neighborIndex !== undefined ? lookupRef.current.get(neighborId) : null;
      if (!neighbor) return;

      const dx = current.position.x - neighbor.position.x;
      const dy = current.position.y - neighbor.position.y;
      const distance = Math.hypot(dx, dy) || 1;

      if (distance > MAX_LINK_LENGTH) {
        const excess = distance - MAX_LINK_LENGTH;
        const pull = Math.min(excess, STRETCH_BAND) * FOLLOW_FACTOR;
        const directionX = dx / distance;
        const directionY = dy / distance;

        neighbor.position = {
          x: clampWithinCanvas(neighbor.position.x + directionX * pull),
          y: clampWithinCanvas(neighbor.position.y + directionY * pull),
        };

        lookupRef.current.set(neighborId, neighbor);
        topicsRef.current[neighborIndex] = neighbor;
        updateVisualForTopic(neighborId);
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

const clampWithinCanvas = (value) => Math.max(-CANVAS_EXTENT, Math.min(CANVAS_EXTENT, value));

const resolveCollisions = (originIds, lookupRef, topicsRef, indexRef, updateVisualForTopic) => {
  if (!originIds || originIds.size === 0) return new Set();

  const queue = Array.from(originIds);
  const processed = new Set(queue);
  const moved = new Set();

  while (queue.length > 0) {
    const currentId = queue.shift();
    const currentIndex = indexRef.current.get(currentId);
    if (currentIndex === undefined) continue;

    const currentTopic = lookupRef.current.get(currentId);
    if (!currentTopic) continue;

    for (let i = 0; i < topicsRef.current.length; i += 1) {
      if (i === currentIndex) continue;
      const otherTopic = topicsRef.current[i];
      const otherId = otherTopic.id;

      const dx = otherTopic.position.x - currentTopic.position.x;
      const dy = otherTopic.position.y - currentTopic.position.y;
      let distance = Math.hypot(dx, dy);

      if (distance < MIN_NODE_DISTANCE && distance > 0) {
        const overlap = MIN_NODE_DISTANCE - distance;
        const ux = dx / distance;
        const uy = dy / distance;
        const push = overlap / 2;

        otherTopic.position = {
          x: clampWithinCanvas(otherTopic.position.x + ux * push),
          y: clampWithinCanvas(otherTopic.position.y + uy * push),
        };

        if (!originIds.has(currentId)) {
          currentTopic.position = {
            x: clampWithinCanvas(currentTopic.position.x - ux * push),
            y: clampWithinCanvas(currentTopic.position.y - uy * push),
          };
          lookupRef.current.set(currentId, currentTopic);
          topicsRef.current[currentIndex] = currentTopic;
          updateVisualForTopic(currentId);
          moved.add(currentId);
          if (!processed.has(currentId)) {
            queue.push(currentId);
            processed.add(currentId);
          }
        }

        lookupRef.current.set(otherId, otherTopic);
        topicsRef.current[i] = otherTopic;
        updateVisualForTopic(otherId);
        moved.add(otherId);

        if (!processed.has(otherId)) {
          queue.push(otherId);
          processed.add(otherId);
        }
      } else if (distance === 0) {
        otherTopic.position = {
          x: clampWithinCanvas(otherTopic.position.x + Math.random() * MIN_NODE_DISTANCE - MIN_NODE_DISTANCE / 2),
          y: clampWithinCanvas(otherTopic.position.y + Math.random() * MIN_NODE_DISTANCE - MIN_NODE_DISTANCE / 2),
        };
        lookupRef.current.set(otherId, otherTopic);
        topicsRef.current[i] = otherTopic;
        updateVisualForTopic(otherId);
        moved.add(otherId);
        if (!processed.has(otherId)) {
          queue.push(otherId);
          processed.add(otherId);
        }
      }
    }
  }

  return moved;
};

const rebuildStretchMap = (linkDefs, lookup) => {
  const map = new Map();
  linkDefs.forEach((link) => {
    const source = lookup.get(link.source);
    const target = lookup.get(link.target);
    if (!source || !target) return;
    const dx = source.position.x - target.position.x;
    const dy = source.position.y - target.position.y;
    const distance = Math.hypot(dx, dy);
    if (distance > MAX_LINK_LENGTH) {
      const ratio = Math.max(0, Math.min(1, (distance - MAX_LINK_LENGTH) / STRETCH_BAND));
      if (ratio > 0.001) {
        map.set(link.id, ratio);
      }
    }
  });
  return map;
};

  const startNodeDrag = (topicId, event) => {
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
    const snapshot = cloneTopics(topicsRef.current);

    toggleDraggingVisual(topicId, true, pointerId, nodeEl);

    let finished = false;

    const handleMove = (moveEvent) => {
      moveEvent.preventDefault();
      const dx = (moveEvent.clientX - startPointer.x) / zoom;
      const dy = (moveEvent.clientY - startPointer.y) / zoom;

      topic.position = {
        x: clampWithinCanvas(startPos.x + dx),
        y: clampWithinCanvas(startPos.y + dy),
      };
      lookupRef.current.set(topicId, topic);
      topicsRef.current[index] = topic;
      updateVisualForTopic(topicId);

      const movedIds = pullConnected(topicId);
      movedIds.add(topicId);
      const collisionMoves = resolveCollisions(movedIds, lookupRef, topicsRef, indexRef, updateVisualForTopic);
      collisionMoves.forEach((id) => movedIds.add(id));

      const stretchMap = rebuildStretchMap(linkDefs, lookupRef.current);
      updateStretchStyles(stretchMap);
    };

    const finishDrag = (commit) => {
      if (finished) return;
      finished = true;

      toggleDraggingVisual(topicId, false, pointerId, nodeEl);

      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleCancel);

      if (commit) {
        const nextTopics = cloneTopics(topicsRef.current);
        topicsRef.current = cloneTopics(nextTopics);
        lookupRef.current = buildLookup(topicsRef.current);
        indexRef.current = buildIndex(topicsRef.current);
        const stretchMap = rebuildStretchMap(linkDefs, lookupRef.current);
        updateStretchStyles(stretchMap);
        setTopics(nextTopics);
        setPaths(computePaths(nextTopics, linkDefs));
      } else {
        topicsRef.current = cloneTopics(snapshot);
        lookupRef.current = buildLookup(topicsRef.current);
        indexRef.current = buildIndex(topicsRef.current);
        topicsRef.current.forEach((item) => updateVisualForTopic(item.id));
        const stretchMap = rebuildStretchMap(linkDefs, lookupRef.current);
        updateStretchStyles(stretchMap);
        const reverted = cloneTopics(snapshot);
        setTopics(reverted);
        setPaths(computePaths(reverted, linkDefs));
      }
    };

    const handleUp = (upEvent) => {
      upEvent.preventDefault();
      finishDrag(true);
    };

    const handleCancel = (cancelEvent) => {
      cancelEvent.preventDefault();
      finishDrag(false);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleCancel);
  };

  return (
    <section
      className="knowledge-map"
      id="knowledge"
      ref={mapRootRef}
      onContextMenu={(event) => event.preventDefault()}
    >
      <header className="knowledge-map__chrome">
        <a className="knowledge-map__home" href="/">← Back Home</a>

        <div className="knowledge-map__hint">
          Drag canvas with left click · Scroll to zoom · Left click opens · Right click + drag moves a node
        </div>
      </header>

      <div
        className="knowledge-map__viewport"
        ref={viewportRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <div
          className="knowledge-map__canvas"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            cursor: isPanning ? "grabbing" : "grab",
          }}
        >
          <svg
            className="knowledge-map__links"
            viewBox={`0 0 ${CANVAS_EXTENT * 2} ${CANVAS_EXTENT * 2}`}
            width={CANVAS_EXTENT * 2}
            height={CANVAS_EXTENT * 2}
            style={{ left: -CANVAS_EXTENT, top: -CANVAS_EXTENT }}
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="link-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,215,0,0.7)" />
                <stop offset="100%" stopColor="rgba(255,166,0,0.2)" />
              </linearGradient>
            </defs>
            {paths.map((line) => (
              <path
                key={line.id}
                ref={(element) => {
                  if (element) {
                    linkRefs.current.set(line.id, element);
                  } else {
                    linkRefs.current.delete(line.id);
                  }
                }}
                d={line.path}
                className="knowledge-link"
              />
            ))}
          </svg>

          <div className="knowledge-map__nodes">
            {topics.map((topic) => (
              <button
                key={topic.id}
                ref={(element) => {
                  if (element) {
                    nodeRefs.current.set(topic.id, element);
                    element.style.left = `${topic.position.x}px`;
                    element.style.top = `${topic.position.y}px`;
                    element.style.setProperty("--idle-delay", `${computeIdleDelay(topic.id)}s`);
                  } else {
                    nodeRefs.current.delete(topic.id);
                  }
                }}
                className={`knowledge-node ${activeTopic?.id === topic.id ? "knowledge-node--active" : ""}`}
                type="button"
                onClick={() => handleTopicClick(topic)}
                onPointerDown={(event) => startNodeDrag(topic.id, event)}
                onContextMenu={(event) => event.preventDefault()}
              >
                <span className="knowledge-node__inner">
                  <span className="knowledge-node__title">{topic.label}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTopic && (
        <div
          className="knowledge-modal__overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`topic-${activeTopic.id}`}
          onClick={() => setActiveTopic(null)}
        >
          <article className="knowledge-modal" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="knowledge-modal__close" onClick={() => setActiveTopic(null)} aria-label="Close topic details">
              ×
            </button>
            <header>
              <span className="knowledge-modal__kicker">Topic</span>
              <h3 id={`topic-${activeTopic.id}`}>{activeTopic.label}</h3>
              <p>{activeTopic.detail.overview}</p>
            </header>

            <section className="knowledge-modal__section">
              <h4>Deep Dives</h4>
              <ul>
                {(activeTopic.detail?.deepDives || []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="knowledge-modal__section">
              <h4>Resources</h4>
              <div className="knowledge-modal__links">
                {(activeTopic.detail?.resources || []).map((resource) => (
                  <a key={resource.label} href={resource.href} target="_blank" rel="noreferrer">
                    {resource.label}
                  </a>
                ))}
              </div>
            </section>
          </article>
        </div>
      )}
    </section>
  );
};

export default KnowledgeMap;
