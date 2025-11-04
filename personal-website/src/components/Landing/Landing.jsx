import React from "react";
import "./landing.css";
import ibrahim from "../../assets/ibrahim.png";
import { Link } from "react-scroll";
import { FaFacebook, FaTwitter, FaFileAlt } from "react-icons/fa";
import { TiSocialInstagram, TiSocialLinkedin } from "react-icons/ti";

const Landing = () => {
  return (
    <section className="intro">
      <div className="intro-content">
        <div className="intro-text">
          <span className="intro-hello">Hello,</span>
          <h1 className="intro-title">
            I'm <span className="intro-name">Muhammad Ibrahim</span>
          </h1>
          <h2 className="intro-subtitle">Computer Engineer</h2>
          <p className="intro-para">
            Passionate about creating innovative solutions and pushing the boundaries of technology. 
            With expertise in software development and hardware design, I strive to build efficient 
            and user-friendly systems that make a positive impact.
          </p>
          
          <Link to="resume" smooth={true} duration={500}>
            <button className="btn btn-resume">
              <FaFileAlt /> View Resume
            </button>
          </Link>
        </div>
        <div className="intro-image-container">
          <img src={ibrahim} alt="Muhammad Ibrahim" className="intro-image" />
          <div className="intro-image-circle"></div>
          <div className="social-links">
            {[
              { icon: FaFacebook, label: "Facebook", href: "#" },
              { icon: FaTwitter, label: "Twitter", href: "#" },
              { icon: TiSocialLinkedin, label: "LinkedIn", href: "#" },
              { icon: TiSocialInstagram, label: "Instagram", href: "#" },
            ].map((social, index) => (
              <a 
                key={social.label}
                href={social.href}
                aria-label={social.label}
              >
                <social.icon />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Landing;