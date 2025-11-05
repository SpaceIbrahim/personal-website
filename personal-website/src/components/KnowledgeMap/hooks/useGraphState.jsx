import { useMemo, useRef, useState, useEffect } from "react";
import {
  normalizeTopic, cloneTopics, buildLookup, buildIndex,
  buildAdjacency, computePaths, laneifyLinks
} from "../graph/graphUtils.jsx";

export default function useGraphState(mapData) {
  const initialTopics = useMemo(
    () => cloneTopics((mapData.topics || []).map(normalizeTopic)),
    [mapData.topics]
  );

  const linkDefs = useMemo(() => laneifyLinks(mapData.links || []), [mapData.links]);
  const adjacency = useMemo(() => buildAdjacency(linkDefs), [linkDefs]);

  const [topics, setTopics] = useState(initialTopics);
  const [paths, setPaths]   = useState(() => computePaths(initialTopics, linkDefs));
  const [activeTopic, setActiveTopic] = useState(null);

  const topicsRef = useRef(cloneTopics(initialTopics));
  const lookupRef = useRef(buildLookup(topicsRef.current));
  const indexRef  = useRef(buildIndex(topicsRef.current));

  useEffect(() => {
    const cloned = cloneTopics(topics);
    topicsRef.current = cloned;
    lookupRef.current = buildLookup(cloned);
    indexRef.current  = buildIndex(cloned);
  }, [topics]);

  return {
    topics, setTopics, paths, setPaths, activeTopic, setActiveTopic,
    linkDefs, adjacency, topicsRef, lookupRef, indexRef
  };
}
