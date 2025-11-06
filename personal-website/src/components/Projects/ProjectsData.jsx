import rawProjects from "../../data/projects.json";

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

const resolveImage = (imageConfig) => {
  if (!imageConfig) {
    return "";
  }

  if (typeof imageConfig === "string") {
    return imageConfig;
  }

  if (imageConfig.type === "placeholder") {
    const { width, height, label, gradient } = imageConfig;
    return createPlaceholder(width, height, label, gradient);
  }

  if (imageConfig.type === "asset") {
    return imageConfig.src ?? "";
  }

  return imageConfig.src ?? "";
};

const normalizeProject = (project) => ({
  ...project,
  mainImage: resolveImage(project.mainImage),
  thumbnail: resolveImage(project.thumbnail),
  highlights: project.highlights ?? [],
  tech: project.tech ?? [],
  links: project.links ?? [],
});

export const projects = rawProjects.map(normalizeProject);

export default projects;
