import { useEffect, useState } from "react";
import "./projectpage.css";
import { projects } from "./ProjectsData";

const ProjectPage = () => {
  const [activeProject, setActiveProject] = useState(null);
  
  // Make it soo we can't scroll the background when modal is open
  useEffect(() => {
    if (!activeProject) {
      document.body.style.overflow = "";
      return undefined;
    }
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [activeProject]);

  // Close modal on ESC key
  useEffect(() => {
    if (!activeProject) {
      return undefined;
    }
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setActiveProject(null);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [activeProject]);

  // Handlers for opening and closing project modal
  const handleOpenProject = (project) => {
    setActiveProject(project);
  };

  const handleCloseProject = () => {
    setActiveProject(null);
  };

  // Keyboard enter to open project cards
  const handleKeyDown = (event, project) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpenProject(project);
    }
  };

  return (
    <>
      <section className="project-page" id="projects">
        {/* Project Header */}
        <div className="project-header">
          {/* <span className="project-kicker">Selected Work</span> */}
          <h2 className="project-title">Projects</h2>
          <p className="project-subtitle">
            Blah Blah Blah Blah Blah.
          </p>
        </div>

        {/* Projects Grids */}
        <div className="project-grid">
          {projects.map((project) => (
            <article
              key={project.id}
              className="project-card"
              role="button"
              tabIndex={0}
              onClick={() => handleOpenProject(project)}
              onKeyDown={(event) => handleKeyDown(event, project)}
            >
              <div className="project-media">
                <div className="project-main">
                  <img src={project.mainImage} alt={`${project.title} main visual`} />
                </div>
                <div className="project-thumb">
                  <img src={project.thumbnail} alt={`${project.title} supporting visual`} />
                </div>
              </div>
              <div className="project-card-body">
                <h3>{project.title}</h3>
                <p>{project.headline}</p>
                <div className="project-tags">
                  {project.tech.slice(0, 3).map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      
      {/* Model Pop up */}
      {activeProject && (
        <div
          className="project-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${activeProject.id}-title`}
          onClick={handleCloseProject}
        >
          <div className="project-modal" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="project-modal-close" onClick={handleCloseProject} aria-label="Close project details">
              ×
            </button>
            <div className="project-modal-media">
              <img src={activeProject.mainImage} alt={`${activeProject.title} detail`} />
              <img src={activeProject.thumbnail} alt={`${activeProject.title} alternate perspective`} />
            </div>
            <header className="project-modal-header">
              <span className="project-modal-kicker">Project</span>
              <h3 id={`${activeProject.id}-title`}>{activeProject.title}</h3>
              <p>{activeProject.description}</p>
            </header>
            <section className="project-modal-content">
              <h4>Highlights</h4>
              <ul>
                {activeProject.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </section>
            <section className="project-modal-meta">
              <h4>Toolkit</h4>
              <div className="project-modal-tags">
                {activeProject.tech.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </section>
            {activeProject.links.length > 0 && (
              <footer className="project-modal-footer">
                {activeProject.links.map((link) => (
                  <a key={link.label} href={link.href}>
                    {link.label}
                  </a>
                ))}
              </footer>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectPage;
