import { Link } from 'react-scroll'
import './navbar.css'
const Navbar = () => {
  return (
    <nav className="navbar">
        <img src="" alt="logo" className="nav-logo" />
        <div className="nav-menu">
          <Link className="nav-item" to="home" smooth={true} duration={500} offset={-80}>Home</Link>
          <Link className="nav-item" to="about" smooth={true} duration={500} offset={-80}>About</Link>
          <Link className="nav-item" to="projects" smooth={true} duration={500} offset={-80}>Projects</Link>
          <a className="nav-item" href="/knowledge.html">Knowledge Map</a>
        </div>

        <button className="nav-contact">
          <img src="" alt="" className="nav-contact-img" />
          <span className="nav-contact-text">Contact Me</span>
        </button>

    </nav>
  )
}

export default Navbar
