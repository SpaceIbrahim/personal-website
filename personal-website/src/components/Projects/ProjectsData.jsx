// Just place holder images for now
const createPlaceholder = (width, height, label, gradient = ["#1f1f1f", "#0d0d0d"]) => {
  const [start, end] = gradient;
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'>
      <defs>
        <linearGradient id='g' x1='0%' x2='100%' y1='0%' y2='100%'>
          <stop offset='0%' stop-color='${start}' />
          <stop offset='100%' stop-color='${end}' />
        </linearGradient>
      </defs>
      <rect width='${width}' height='${height}' rx='32' fill='url(#g)' />
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
            font-family='Helvetica, Arial, sans-serif' font-size='${Math.min(width, height) / 10}'
            fill='#ffd700' opacity='0.85'>
        ${label}
      </text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

// Exported array of project objects
export const projects = [
  {
    id: "portfolio-redesign",
    title: "Portfolio Redesign",
    headline: "Responsive React + Vite portfolio focused on performance and storytelling.",
    mainImage: createPlaceholder(960, 540, "Portfolio UI"),
    thumbnail: createPlaceholder(320, 320, "Style Guide", ["#ffd700", "#e1a403"]),
    description:
      "A complete overhaul of my personal portfolio with component-driven design, subtle motion, and accessibility baked in from the start.",
    highlights: [
      "Dynamic sections driven by JSON content for quick updates",
      "Lightweight animation system using IntersectionObserver",
      "Automated Lighthouse audits on every commit via GitHub Actions",
    ],
    tech: ["React", "Vite", "Framer Motion", "Styled Components"],
    links: [
      { label: "View Case Study", href: "#" },
      { label: "Live Site", href: "#" },
    ],
  },
  {
    id: "iot-dashboard",
    title: "IoT Device Dashboard",
    headline: "Real-time monitoring dashboard aggregating sensor data from edge devices.",
    mainImage: createPlaceholder(960, 540, "IoT Dashboard", ["#0f2027", "#203a43"]),
    thumbnail: createPlaceholder(280, 280, "Live Metrics", ["#2c5364", "#0f2027"]),
    description:
      "Designed a modular analytics dashboard where new device types can be onboarded via config, unlocking fast experimentation.",
    highlights: [
      "WebSocket data ingestion with intelligent batching and caching",
      "Role-based layouts so operators and engineers see the right KPIs",
      "Exportable deep-dive reports with CSV and PDF pipelines",
    ],
    tech: ["React", "Recharts", "Node.js", "Socket.IO"],
    links: [{ label: "Product Overview", href: "#" }],
  },
  {
    id: "campus-nav",
    title: "Campus Navigator",
    headline: "Mobile-first progressive web app that guides students across campus.",
    mainImage: createPlaceholder(960, 540, "Campus Map", ["#141e30", "#243b55"]),
    thumbnail: createPlaceholder(260, 260, "Route Planner", ["#ffd700", "#f7971e"]),
    description:
      "Built around offline-first principles to keep navigation available even when cell service is spotty between buildings.",
    highlights: [
      "Turn-by-turn guidance with accessible voice cues and haptics",
      "Crowdsourced accessibility notes for elevators, ramps, and obstacles",
      "App shell caching that keeps core features working offline",
    ],
    tech: ["React", "Leaflet", "Workbox", "Mapbox"],
    links: [
      { label: "Download Prototype", href: "#" },
      { label: "Design Files", href: "#" },
    ],
  },
];

export default projects;
