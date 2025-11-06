import { useCallback, useEffect, useMemo, useState } from 'react'
import { galleryPhotos } from '../../data/galleryPhotos'
import './gallery.css'

const Gallery = () => {
  const photos = useMemo(() => galleryPhotos, [])

  const [activePhotoId, setActivePhotoId] = useState(null)

  const activePhoto = useMemo(
    () => photos.find((photo) => photo.id === activePhotoId),
    [activePhotoId, photos],
  )

  const openPhoto = useCallback((photoId) => {
    setActivePhotoId(photoId)
  }, [])

  const closePhoto = useCallback(() => {
    setActivePhotoId(null)
  }, [])

  useEffect(() => {
    if (!activePhoto) {
      return
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closePhoto()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [activePhoto, closePhoto])

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      closePhoto()
    }
  }

  return (
    <div className="gallery-page">
      <header className="gallery-header">
        <a className="gallery-back-link" href="/">
          ← Back to Main Site
        </a>
        <h1 className="gallery-title">Photo Gallery</h1>
        <p className="gallery-subtitle">
          I like taking photos in my free time. Here are some of my favorite shots.
        </p>
      </header>

      <section className="gallery-grid" aria-label="Photo gallery">
        {photos.map((photo) => (
          <article key={photo.id} className="gallery-card">
            <button
              type="button"
              className="gallery-card-button"
              onClick={() => openPhoto(photo.id)}
              aria-label={`View full-size image: ${photo.title}`}
            >
              <img className="gallery-card-image" src={photo.thumbnail} alt={photo.alt} loading="lazy" />
              <span className="gallery-card-title">{photo.title}</span>
            </button>
          </article>
        ))}
      </section>

      {activePhoto && (
        <div
          className="gallery-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`Full size image: ${activePhoto.title}`}
          onClick={handleOverlayClick}
        >
          <div className="gallery-modal-content">
            <button
              type="button"
              className="gallery-modal-close"
              onClick={closePhoto}
              aria-label="Close image viewer"
            >
              ×
            </button>
            <img className="gallery-modal-image" src={activePhoto.full} alt={activePhoto.alt} />
            <div className="gallery-modal-caption">
              <h2>{activePhoto.title}</h2>
              <p>{activePhoto.alt}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Gallery
