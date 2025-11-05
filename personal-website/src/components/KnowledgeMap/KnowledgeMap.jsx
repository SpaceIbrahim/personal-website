import { useEffect, useRef } from "react";
import "./knowledgemap.css";
import mapData from "../../data/knowledgeMap.json";

import useGraphState from "./hooks/useGraphState.jsx";
import usePanZoom from "./hooks/usePanZoom.jsx";
import useDragNodes from "./hooks/useDragNodes.jsx";
import useStretchStyles from "./hooks/useStretchStyles.jsx";
import { computeIdleDelay, computePaths } from "./graph/graphUtils.jsx";

export default function KnowledgeMap() {
  const mapRootRef = useRef(null);
  const viewportRef = useRef(null);
  const linkRefs = useRef(new Map());
  const nodeRefs = useRef(new Map());

  const {
    topics, setTopics, paths, setPaths, activeTopic, setActiveTopic,
    linkDefs, adjacency, topicsRef, lookupRef, indexRef
  } = useGraphState(mapData);

  const {
    offset, zoom, isPanning,
    onPointerDownCanvas, onPointerMoveCanvas, onPointerUpCanvas
  } = usePanZoom(viewportRef);

  const { updateStretchStyles } = useStretchStyles(linkRefs);

  const { startNodeDrag } = useDragNodes({
    zoom, linkDefs, adjacency, topicsRef, lookupRef, indexRef,
    setTopics, setPaths, linkRefs, nodeRefs, updateStretchStyles
  });

  useEffect(() => {
    setPaths(computePaths(topics, linkDefs));
  }, [topics, linkDefs, setPaths]);

  useEffect(() => {
    if (!activeTopic) { document.body.style.overflow = ""; return; }
    document.body.style.overflow = "hidden";
    const onEsc = (e) => { if (e.key === "Escape") setActiveTopic(null); };
    window.addEventListener("keydown", onEsc);
    return () => { window.removeEventListener("keydown", onEsc); document.body.style.overflow = ""; };
  }, [activeTopic, setActiveTopic]);

  return (
    <section
      className="knowledge-map"
      id="knowledge"
      ref={mapRootRef}
      onContextMenu={(e) => e.preventDefault()}
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
        onPointerDown={onPointerDownCanvas}
        onPointerMove={onPointerMoveCanvas}
        onPointerUp={onPointerUpCanvas}
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
            viewBox="0 0 8000 8000"
            width={8000}
            height={8000}
            style={{ left: -4000, top: -4000 }}
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
                ref={(el) => {
                  if (el) linkRefs.current.set(line.id, el);
                  else linkRefs.current.delete(line.id);
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
                ref={(el) => {
                  if (!el) { nodeRefs.current.delete(topic.id); return; }
                  nodeRefs.current.set(topic.id, el);
                  el.style.left = `${topic.position.x}px`;
                  el.style.top = `${topic.position.y}px`;
                  el.style.setProperty("--idle-delay", `${computeIdleDelay(topic.id)}s`);
                }}
                className={`knowledge-node ${activeTopic?.id === topic.id ? "knowledge-node--active" : ""}`}
                type="button"
                onClick={() => setActiveTopic(topic)}
                onPointerDown={(e) => startNodeDrag(topic.id, e)}
                onContextMenu={(e) => e.preventDefault()}
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
          <article className="knowledge-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="knowledge-modal__close"
              onClick={() => setActiveTopic(null)}
              aria-label="Close topic details"
            >
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
}
