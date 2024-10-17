import React from "react";
import "./landing.css";
import ibrahim from "../../assets/ibrahim.png";
import { Link } from "react-scroll";

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
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Obcaecati,
            amet repellendus temporibus odio eum dicta similique consectetur
            quam libero magnam doloribus quae ad debitis delectus nam quia error
            esse consequatur incidunt?
          </p>
          
          <Link>
            <button className="btn btn-resume">
              <i className="fas fa-file-alt"></i> View Resume
            </button>
          </Link>
        </div>
        <div className="intro-image-container">
          <img src={ibrahim} alt="Muhammad Ibrahim" className="intro-image" />
        </div>
      </div>
    </section>
  );
};

export default Landing;
