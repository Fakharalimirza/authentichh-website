import { useState, useRef, useEffect } from 'react';
import {
  FileText, Calendar, Ban, Users, Building2, Shield, RefreshCw, Mail,
} from 'lucide-react';
import Card from '../components/ui/Card';

function useOnScreen(ref) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return visible;
}

function AnimateSection({ children, className = '' }) {
  const ref = useRef(null);
  const visible = useOnScreen(ref);
  return (
    <div ref={ref} className={`animate-section ${visible ? 'animate-in' : ''} ${className}`}>
      {children}
    </div>
  );
}

const sections = [
  {
    icon: FileText,
    title: 'Introduction',
    content: (
      <p>
        These Terms and Conditions govern your use of the Authentic Holiday Homes website
        and services. By accessing or using our website, you agree to be bound by these terms.
        If you do not agree with any part of these terms, you should not use our services.
      </p>
    ),
  },
  {
    icon: Calendar,
    title: 'Booking and Reservations',
    content: (
      <>
        <p>
          All bookings are subject to availability and confirmation. Authentic Holiday Homes
          reserves the right to decline any booking request. A confirmation will be sent once
          the booking is accepted and payment terms are agreed upon.
        </p>
        <p>
          Guests must provide accurate information when making a reservation. Any false or
          misleading information may result in cancellation of the booking without refund.
        </p>
      </>
    ),
  },
  {
    icon: Ban,
    title: 'Cancellation Policy',
    content: (
      <p>
        Cancellation terms vary depending on the property and season. Specific cancellation
        policies will be communicated at the time of booking. We recommend guests review
        the cancellation policy carefully before confirming a reservation.
      </p>
    ),
  },
  {
    icon: Users,
    title: 'Guest Responsibilities',
    content: (
      <>
        <p>Guests agree to:</p>
        <ul>
          <li>Use the property in a responsible manner</li>
          <li>Comply with all building and community rules</li>
          <li>Not exceed the maximum occupancy stated in the booking</li>
          <li>Report any damages or issues promptly</li>
          <li>Not use the property for any illegal or commercial activities</li>
          <li>Leave the property in a reasonable condition at check-out</li>
        </ul>
      </>
    ),
  },
  {
    icon: Building2,
    title: 'Property Listings',
    content: (
      <p>
        While we strive to ensure all property information is accurate, Authentic Holiday
        Homes does not guarantee that all descriptions, images, and details are completely
        error-free. Features and amenities may change without notice.
      </p>
    ),
  },
  {
    icon: Shield,
    title: 'Limitation of Liability',
    content: (
      <p>
        Authentic Holiday Homes shall not be liable for any indirect, incidental, or
        consequential damages arising from the use of our services or properties.
        Our total liability is limited to the amount paid for the specific booking in question.
      </p>
    ),
  },
  {
    icon: RefreshCw,
    title: 'Changes to Terms',
    content: (
      <p>
        We reserve the right to update these terms at any time. Changes will be effective
        immediately upon posting to our website. Continued use of our services after any
        changes constitutes acceptance of the new terms.
      </p>
    ),
  },
  {
    icon: Mail,
    title: 'Contact',
    content: (
      <p>
        For questions regarding these terms, please contact us at:<br />
        Email: info@authenticholidayhomes.ae<br />
        Phone: +971 50 000 0000
      </p>
    ),
  },
];

export default function Terms() {
  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1 style={{ color: 'white' }}>Terms & Conditions</h1>
          <p>Please read these terms carefully before using our services</p>
        </div>
      </div>

      <section className="section contact-section">
        <div className="container">
          <AnimateSection>
            <Card variant="elevated" className="legal-content">
              {sections.map((s, i) => (
                <div key={i}>
                  <h2 className="contact-info-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-accent-light)',
                      color: 'var(--color-accent)',
                      flexShrink: 0,
                    }}>
                      <s.icon size={20} strokeWidth={1.6} />
                    </span>
                    {s.title}
                  </h2>
                  {s.content}
                </div>
              ))}
            </Card>
          </AnimateSection>
        </div>
      </section>
    </>
  );
}
