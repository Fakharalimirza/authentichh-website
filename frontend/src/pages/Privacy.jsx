import { useState, useRef, useEffect } from 'react';
import {
  Database, ListChecks, Cookie, Shield, Share2, Clock, CheckCircle, Mail, RefreshCw,
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
    icon: Database,
    title: 'Information We Collect',
    content: (
      <>
        <p>
          When you use our website or services, we may collect the following types of information:
        </p>
        <ul>
          <li><strong>Contact Form Data:</strong> Name, email address, phone number, and message content when you contact us through our website.</li>
          <li><strong>Property Enquiry Data:</strong> Name, email, phone number, check-in/check-out dates, number of guests, and messages related to property enquiries.</li>
          <li><strong>Landlord Form Data:</strong> Full name, phone number, email address, property location, building name, property type, and other details provided when submitting a property listing request.</li>
          <li><strong>Technical Data:</strong> IP address, browser type, device information, and pages visited on our website.</li>
        </ul>
      </>
    ),
  },
  {
    icon: ListChecks,
    title: 'How We Use Your Information',
    content: (
      <>
        <p>We use the collected information for the following purposes:</p>
        <ul>
          <li>To respond to your enquiries and messages</li>
          <li>To process and manage property booking requests</li>
          <li>To evaluate and respond to landlord property listing requests</li>
          <li>To improve our website and services</li>
          <li>To comply with legal obligations</li>
        </ul>
      </>
    ),
  },
  {
    icon: Cookie,
    title: 'Cookies',
    content: (
      <p>
        Our website may use cookies to enhance your browsing experience. Cookies are small
        text files stored on your device. You can control cookie settings through your browser
        preferences. Disabling cookies may affect certain features of our website.
      </p>
    ),
  },
  {
    icon: Shield,
    title: 'Data Protection',
    content: (
      <p>
        We implement appropriate security measures to protect your personal information from
        unauthorized access, alteration, disclosure, or destruction. This includes secure
        data storage, encrypted communications, and restricted access to personal data.
      </p>
    ),
  },
  {
    icon: Share2,
    title: 'Data Sharing',
    content: (
      <p>
        We do not sell, trade, or rent your personal information to third parties. We may
        share information with trusted service providers who assist us in operating our
        website and services, provided they agree to keep your information confidential.
      </p>
    ),
  },
  {
    icon: Clock,
    title: 'Data Retention',
    content: (
      <p>
        We retain your personal information only for as long as necessary to fulfill the
        purposes for which it was collected, or as required by applicable laws and regulations.
      </p>
    ),
  },
  {
    icon: CheckCircle,
    title: 'Your Rights',
    content: (
      <>
        <p>You have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data, subject to legal requirements</li>
          <li>Withdraw consent for data processing where applicable</li>
          <li>Lodge a complaint with relevant data protection authorities</li>
        </ul>
      </>
    ),
  },
  {
    icon: Mail,
    title: 'Contact Us',
    content: (
      <p>
        If you have any questions about this Privacy Policy or how we handle your data,
        please contact us:<br />
        Email: info@authenticholidayhomes.ae<br />
        Phone: +971 50 000 0000
      </p>
    ),
  },
  {
    icon: RefreshCw,
    title: 'Updates to This Policy',
    content: (
      <>
        <p>
          We may update this Privacy Policy from time to time. Changes will be posted on
          this page with an updated effective date. We encourage you to review this policy
          periodically.
        </p>
        <p><em>Last updated: July 2026</em></p>
      </>
    ),
  },
];

export default function Privacy() {
  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1 style={{ color: 'white' }}>Privacy Policy</h1>
          <p>How we collect, use, and protect your information</p>
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
