import React from "react";
import "./landing.css";
import ibrahim from "../../assets/ibrahim.png";
import { Link } from "react-scroll";
import { FaFacebook, FaTwitter, FaFileAlt } from "react-icons/fa";
import { TiSocialInstagram, TiSocialLinkedin } from "react-icons/ti";
import { motion } from "framer-motion";

const Landing = () => {
  return (
    <section className="intro">
      <motion.div 
        className="intro-content"
        initial={{ opacity: 0.1, y: 0 }}
        animate={{ opacity: 1, y: -500 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          className="intro-text"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
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
            <motion.button 
              className="btn btn-resume"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaFileAlt /> View Resume
            </motion.button>
          </Link>
        </motion.div>
        <motion.div 
          className="intro-image-container"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <img src={ibrahim} alt="Muhammad Ibrahim" className="intro-image" />
          <div className="intro-image-circle"></div>
          <div className="social-links">
            {[
              { icon: FaFacebook, label: "Facebook", href: "#" },
              { icon: FaTwitter, label: "Twitter", href: "#" },
              { icon: TiSocialLinkedin, label: "LinkedIn", href: "#" },
              { icon: TiSocialInstagram, label: "Instagram", href: "#" },
            ].map((social, index) => (
              <motion.a 
                key={social.label}
                href={social.href}
                aria-label={social.label}
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              >
                <social.icon />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Landing;