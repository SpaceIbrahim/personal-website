import React from 'react'
import { Link } from 'react-scroll'
import './navbar.css'
const Navbar = () => {
  return (
    <nav className="navbar">
        <img src="" alt="logo" className="nav-logo" />
        <div className="nav-menu">
          <Link className="nav-item">Home</Link>
          <Link className="nav-item">About</Link>
          <Link className="nav-item">Projects</Link>
          {/* <Link className="nav-item">Map</Link> */}
        </div>

        <button className="nav-contact">
          <img src="" alt="" className="nav-contact-img" />
          <span className="nav-contact-text">Contact Me</span>
        </button>

    </nav>
  )
}

export default Navbar
