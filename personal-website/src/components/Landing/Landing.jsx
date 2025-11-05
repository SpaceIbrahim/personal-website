import { useEffect, useState } from "react";
import "./landing.css";
import ibrahim from "../../assets/ibrahim.png";
import resumePdf from "../../assets/Muhammad Ibrahim Resume.pdf";
import { FaDiscord, FaTwitter, FaFileAlt } from "react-icons/fa";
import { TiSocialInstagram, TiSocialLinkedin } from "react-icons/ti";

const Landing = () => {
  const [isResumeOpen, setResumeOpen] = useState(false);

  useEffect(() => {
    if (!isResumeOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setResumeOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isResumeOpen]);

  return (
    <section className="intro" id="home">
      <div className="intro-content">
        <div className="intro-text">
          <span className="intro-hello">Hello,</span>
          <h1 className="intro-title">
            I&apos;m <span className="intro-name">Muhammad Ibrahim</span>
          </h1>
          <h2 className="intro-subtitle">Computer Engineer</h2>
          <p className="intro-para">
            Passionate about creating innovative solutions and pushing the boundaries of technology. 
            With expertise in software development and hardware design, I strive to build efficient 
            and user-friendly systems that make a positive impact.
          </p>
          
          <button
            type="button"
            className="btn btn-resume"
            onClick={() => setResumeOpen(true)}
          >
            <FaFileAlt /> View Resume
          </button>
        </div>
        <div className="intro-image-container">
          <img src={ibrahim} alt="Muhammad Ibrahim" className="intro-image" />
          <div className="intro-image-circle"></div>
          <div className="social-links">
            {[
              { icon: FaDiscord, label: "Discord", href: "https://discordapp.com/users/SpaceIbrahim" },
              { icon: FaTwitter, label: "Twitter", href: "#" },
              { icon: TiSocialLinkedin, label: "LinkedIn", href: "https://www.linkedin.com/in/muhammad-ibrahim-541225226/" },
              { icon: TiSocialInstagram, label: "Instagram", href: "https://www.instagram.com/ibrahimm4566/" },
            ].map((social) => (
              <a 
                key={social.label}
                href={social.href}
                aria-label={social.label}
                target="_blank"
                rel="noopener noreferrer"
              >
                <social.icon />
              </a>
            ))}
          </div>
        </div>
      </div>

      {isResumeOpen && (
        <div
          className="resume-modal__overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="resume-title"
          onClick={() => setResumeOpen(false)}
        >
          <article
            className="resume-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="resume-modal__header">
              <h2 id="resume-title">Resume</h2>
              <button
                type="button"
                className="resume-modal__close"
                onClick={() => setResumeOpen(false)}
                aria-label="Close resume"
              >
                ×
              </button>
            </header>
            <iframe
              className="resume-modal__iframe"
              src={resumePdf}
              title="Muhammad Ibrahim Resume"
            />
            <footer className="resume-modal__footer">
              <a href={resumePdf} download className="resume-modal__download">
                Download PDF
              </a>
            </footer>
          </article>
        </div>
      )}
    </section>
  );
};

export default Landing;
