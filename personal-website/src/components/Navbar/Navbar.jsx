import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-scroll'
import logo from '../../assets/simple_logo.png'
import contactIcon from '../../assets/mail.svg'
import './navbar.css'

const Navbar = () => {
  const [isHidden, setIsHidden] = useState(false)
  const lastScrollYRef = useRef(typeof window !== 'undefined' ? window.scrollY : 0)
  const shouldHideAfterScrollRef = useRef(false)
  const mouseRevealedRef = useRef(false)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const lastScrollY = lastScrollYRef.current
      lastScrollYRef.current = currentScrollY

      if (currentScrollY < 80) {
        shouldHideAfterScrollRef.current = false
        setIsHidden(false)
        return
      }

      const scrollingDown = currentScrollY > lastScrollY + 6
      const scrollingUp = currentScrollY < lastScrollY - 6

      if (scrollingDown) {
        shouldHideAfterScrollRef.current = true
        setIsHidden(true)
      } else if (scrollingUp) {
        shouldHideAfterScrollRef.current = false
        setIsHidden(false)
      }
    }

    const handleMouseMove = (event) => {
      const isNearTop = event.clientY <= 90
      const movedAway = event.clientY > 120

      if (isNearTop) {
        mouseRevealedRef.current = true
        setIsHidden(false)
      } else if (mouseRevealedRef.current && movedAway) {
        mouseRevealedRef.current = false
        if (shouldHideAfterScrollRef.current && window.scrollY > 120) {
          setIsHidden(true)
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  const handleContactClick = () => {
    window.open('mailto:ibrahimm4566@gmail.com', '_blank', 'noopener,noreferrer')
  }

  return (
    <nav className={`navbar${isHidden ? ' navbar--hidden' : ''}`}>
      <Link
        className="nav-logo-link"
        to="home"
        smooth={true}
        duration={500}
        offset={-80}
        aria-label="Navigate to home"
      >
        <img src={logo} alt="Muhammad Ibrahim logo" className="nav-logo" />
      </Link>
      <div className="nav-menu">
        <Link className="nav-item" to="home" smooth={true} duration={500} offset={-80}>
          Home
        </Link>
        <Link className="nav-item" to="projects" smooth={true} duration={500} offset={-80}>
          Projects
        </Link>
        <a className="nav-item" href="/knowledge.html">
          Knowledge Map
        </a>
      </div>

      <button type="button" className="nav-contact" onClick={handleContactClick}>
        <img src={contactIcon} alt="Envelope icon" className="nav-contact-img" />
        <span className="nav-contact-text">Contact Me</span>
      </button>
    </nav>
  )
}

export default Navbar
