import { useState, useRef, useEffect } from 'react';
import {
  Star, ShieldCheck, MapPin, Users, ChevronRight,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import AgentAdminCard from '../components/ui/AgentAdminCard';

function useOnScreen(ref, threshold = 0.15) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold]);
  return visible;
}

function AnimateSection({ children, className = '', threshold }) {
  const ref = useRef(null);
  const visible = useOnScreen(ref, threshold);
  return (
    <div ref={ref} className={`animate-section ${visible ? 'animate-in' : ''} ${className}`}>
      {children}
    </div>
  );
}

const values = [
  { icon: Star, title: 'Premium Quality', desc: 'We maintain the highest standards for all our properties, ensuring every stay exceeds expectations.' },
  { icon: ShieldCheck, title: 'Trusted Service', desc: 'Transparent communication and reliable Emirati hospitality service at every step.' },
  { icon: MapPin, title: 'Prime Locations', desc: 'Properties in the most desirable areas across Dubai, from Marina to Palm.' },
  { icon: Users, title: 'Expert Team', desc: 'Experienced professionals dedicated to your comfort and satisfaction since 2021.' },
];

const ceo = {
  name: 'Ahmed Al Doulah',
  role: 'CEO',
  image: '/images/about/ceo.png',
};

const manager = {
  name: 'Mohammad Al Doulah',
  role: 'Manager',
  image: '/images/about/manager.jpg',
};

const agents = [
  { name: 'Ahmed', role: 'Agent', image: '/images/about/ahmed.png' },
  { name: 'Issa', role: 'Agent', image: '/images/about/issa.png' },
  { name: 'Yousuf', role: 'Agent', image: '' },
];

const admins = [
  { name: 'Admin 1', role: 'Administration', image: '/images/about/admin-1.png' },
  { name: 'Admin 2', role: 'Administration', image: '/images/about/admin-2.png' },
  { name: 'Admin 3', role: 'Administration', image: '/images/about/admin-3.png' },
  { name: 'Admin 4', role: 'Administration', image: '/images/about/admin-4.jpg' },
  { name: 'Admin 5', role: 'Administration', image: '/images/about/admin-5.png' },
];

export default function About() {
  const valuesRef = useRef(null);
  const statsRef = useRef(null);

  function useCarousel(ref) {
    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      const items = Array.from(el.children);
      if (items.length < 2) return;
      let index = 0;
      const interval = setInterval(() => {
        index = (index + 1) % items.length;
        const itemRect = items[index].getBoundingClientRect();
        const containerRect = el.getBoundingClientRect();
        el.scrollBy({ left: itemRect.left - containerRect.left, behavior: 'smooth' });
      }, 3000);
      return () => clearInterval(interval);
    }, [ref]);
  }

  useCarousel(valuesRef);
  useCarousel(statsRef);

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1 style={{ color: 'white' }}>About Us</h1>
          <p>Discover the story behind Authentic Holiday Homes</p>
        </div>
      </div>

      <section className="section contact-section">
        <div className="container">
          <div className="about-lead-grid">
            <AnimateSection>
              <div className="about-image-wrap">
                <img src={ceo.image} alt={ceo.name} />
              </div>
            </AnimateSection>
            <AnimateSection>
              <Card variant="elevated" className="about-content-card">
                <div className="about-greeting">
                  Hello, it's me, <strong>{ceo.name} ({ceo.role})</strong>
                </div>
                <p>
                  Welcome to Authentic Holiday Homes! the local Emirati company. Me and my team
                  are here to make sure that you have the perfect stay in Dubai. We aim to create
                  a comfortable and beautiful luxurious new place for you, away from home.
                </p>
                <p>
                  We feel proud to manage more than 200 properties across Dubai. We hope to see
                  you soon so we can take care of you and make sure you have a wonderful stay.
                  Always available for you, we'll make sure that you have a memorable stay with us!
                </p>
                <p className="about-signoff">Thank You</p>
              </Card>
            </AnimateSection>
          </div>
        </div>
      </section>

      <section className="section contact-section">
        <div className="container">
          <AnimateSection>
            <div className="section-label">Why Choose Us</div>
            <h2 className="section-title">Redefining Luxury in the Heart of Dubai</h2>
            <p className="section-subtitle">
              As a local Emirati company, we are committed to long term relationships with our
              satisfied customers by providing reliable hospitality services and quality.
            </p>
          </AnimateSection>

          <div className="about-values-grid" ref={valuesRef}>
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <AnimateSection key={i} threshold={0.1}>
                  <Card variant="elevated" className="about-value-card">
                    <div className="about-value-icon"><Icon size={24} strokeWidth={1.5} /></div>
                    <h3 className="about-value-title">{v.title}</h3>
                    <p className="about-value-desc">{v.desc}</p>
                  </Card>
                </AnimateSection>
              );
            })}
          </div>

          <AnimateSection threshold={0.1}>
            <div className="about-why-text">
              <p>
                We provide a community-feel atmosphere in a specialized environment. Focusing
                on the details and expectations of our happy customers since <strong>2021</strong>.
              </p>
            </div>
          </AnimateSection>
        </div>
      </section>

      <section className="section contact-section">
        <div className="container">
          <div className="about-lead-grid flipped">
            <AnimateSection>
              <Card variant="elevated" className="about-content-card">
                <div className="about-greeting">
                  <strong>{manager.name}</strong>, ({manager.role})
                </div>
                <p>
                  At Authentic Holiday Homes, we are committed to providing you with an exceptional
                  and memorable stay. Our team is dedicated to ensuring your comfort and satisfaction,
                  whether you seek a tranquil retreat, a vibrant city break, or a family-friendly
                  adventure. We invite you to discover the Authentic Dubai with us.
                </p>
                <p>
                  Thank you for choosing Authentic Holiday Homes. We look forward to welcoming you soon.
                </p>
              </Card>
            </AnimateSection>
            <AnimateSection>
              <div className="about-image-wrap">
                <img src={manager.image} alt={manager.name} />
              </div>
            </AnimateSection>
          </div>
        </div>
      </section>

      <section className="section contact-section">
        <div className="container">
          <AnimateSection>
            <div className="section-label">Our Team</div>
            <h2 className="section-title">Meet the People Behind Authentic Holiday Homes</h2>
            <p className="section-subtitle">
              A dedicated team of hospitality professionals working to make every stay exceptional.
            </p>
          </AnimateSection>

          <Card variant="elevated">
            <AgentAdminCard
              agentImages={agents.map(a => a.image).filter(Boolean)}
              adminImages={admins.map(a => a.image).filter(Boolean)}
            />
          </Card>
        </div>
      </section>

      <section className="section stats-section">
        <div className="container">
          <div className="stats-bar" ref={statsRef}>
            <div className="stat-item">
              <div className="stat-number">200+</div>
              <div className="stat-label">Properties Managed</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">Since 2021</div>
              <div className="stat-label">Years Experience</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">4.2<Star size={18} fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 2 }} /></div>
              <div className="stat-label">Google Rating</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">Local</div>
              <div className="stat-label">Emirati Company</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section contact-section" style={{ textAlign: 'center', paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-16)' }}>
        <div className="container">
          <AnimateSection>
            <h2 className="cta-title">Ready to Experience Authentic Dubai?</h2>
            <p className="cta-sub">
              Browse our collection of luxury holiday homes or get in touch with our team.
            </p>
            <div className="cta-actions">
              <Button variant="primary" size="xl" onClick={() => window.location.href = '/apartments'}>
                View Our Properties
              </Button>
              <Button variant="accent" size="xl" onClick={() => window.location.href = '/contact'}>
                Contact Us <ChevronRight size={20} />
              </Button>
            </div>
          </AnimateSection>
        </div>
      </section>
    </>
  );
}
