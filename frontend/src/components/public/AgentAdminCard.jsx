import { useEffect, useState } from 'react';
import styles from './AgentAdminCard.module.css';

function PhotoCarousel({ images, title }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className={styles.carousel}>
      <div className={styles.carouselViewport}>
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`${title} ${index + 1}`}
            className={`${styles.carouselImage} ${
              index === currentIndex ? styles.active : ''
            }`}
            loading="lazy"
          />
        ))}
      </div>
    </div>
  );
}

export default function AgentAdminCard({ agentImages = [], adminImages = [] }) {
  return (
    <div className={styles.comparisonCard}>
      <div className={styles.grid}>
        <div className={styles.section}>
          <div className={styles.heading}>
            <h3>Agents</h3>
          </div>
          <PhotoCarousel images={agentImages} title="Agent" />
        </div>

        <div className={styles.section}>
          <div className={styles.heading}>
            <h3>Admins</h3>
          </div>
          <PhotoCarousel images={adminImages} title="Admin" />
        </div>
      </div>
    </div>
  );
}
