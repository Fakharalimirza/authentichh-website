import { Routes, Route, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useI18n } from './i18n/I18nContext';
import Header from './components/shared/Header';
import Footer from './components/shared/Footer';
import Home from './pages/public/Home';
import Apartments from './pages/public/Apartments';
import Favorites from './pages/public/Favorites';
import PropertyDetails from './pages/public/PropertyDetails';
import About from './pages/public/About';
import Facilities from './pages/public/Facilities';
import ListProperty from './pages/public/ListProperty';
import Contact from './pages/public/Contact';
import Terms from './pages/public/Terms';
import Privacy from './pages/public/Privacy';
import DesignSystem from './pages/public/DesignSystem';
import AreaArticle from './pages/public/AreaArticle';
import Areas from './pages/public/Areas';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminListings from './pages/admin/AdminListings';
import AdminPropertyWizard from './pages/admin/AdminPropertyWizard';
import AdminLandlordRequests from './pages/admin/AdminLandlordRequests';
import AdminEnquiries from './pages/admin/AdminEnquiries';
import AdminContactMessages from './pages/admin/AdminContactMessages';
import AdminAmenities from './pages/admin/AdminAmenities';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';
import AdminCommunities from './pages/admin/AdminCommunities';
import AdminArticles from './pages/admin/AdminArticles';
import AdminBuildings from './pages/admin/AdminBuildings';
import AdminLandlords from './pages/admin/AdminLandlords';
import AdminUnits from './pages/admin/AdminUnits';
import AdminOnboarding from './pages/admin/AdminOnboarding';
import BuildingMapTest from './pages/admin/BuildingMapTest';
import { AdminAuthProvider } from './context/AdminAuthContext';

function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminAuthProvider><AdminLogin /></AdminAuthProvider>} />
      <Route path="/admin" element={<AdminAuthProvider><AdminDashboard /></AdminAuthProvider>} />
      <Route path="/admin/listings" element={<AdminAuthProvider><AdminListings /></AdminAuthProvider>} />
      <Route path="/admin/listings/new" element={<AdminAuthProvider><AdminPropertyWizard /></AdminAuthProvider>} />
      <Route path="/admin/listings/edit/:id" element={<AdminAuthProvider><AdminPropertyWizard /></AdminAuthProvider>} />
      <Route path="/admin/landlord-requests" element={<AdminAuthProvider><AdminLandlordRequests /></AdminAuthProvider>} />
      <Route path="/admin/enquiries" element={<AdminAuthProvider><AdminEnquiries /></AdminAuthProvider>} />
      <Route path="/admin/contact-messages" element={<AdminAuthProvider><AdminContactMessages /></AdminAuthProvider>} />
      <Route path="/admin/amenities" element={<AdminAuthProvider><AdminAmenities /></AdminAuthProvider>} />
      <Route path="/admin/admins" element={<AdminAuthProvider><AdminUsers /></AdminAuthProvider>} />
      <Route path="/admin/settings" element={<AdminAuthProvider><AdminSettings /></AdminAuthProvider>} />
      <Route path="/admin/communities" element={<AdminAuthProvider><AdminCommunities /></AdminAuthProvider>} />
      <Route path="/admin/buildings" element={<AdminAuthProvider><AdminBuildings /></AdminAuthProvider>} />
      <Route path="/admin/landlords" element={<AdminAuthProvider><AdminLandlords /></AdminAuthProvider>} />
      <Route path="/admin/units" element={<AdminAuthProvider><AdminUnits /></AdminAuthProvider>} />
      <Route path="/admin/smart-scan" element={<AdminAuthProvider><AdminOnboarding /></AdminAuthProvider>} />
      <Route path="/admin/articles" element={<AdminAuthProvider><AdminArticles /></AdminAuthProvider>} />
      <Route path="/test-map" element={<BuildingMapTest />} />
      <Route path="/design-system" element={<DesignSystem />} />
      <Route path="*" element={<PublicLayout />} />
    </Routes>
  );
}

function PublicLayout() {
  const location = useLocation();
  const { locale } = useI18n();
  const canonicalUrl = `https://authenticholidayhomes.ae${location.pathname}`;
  return (
    <>
      <Helmet>
        <html lang={locale} />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Authentic Holiday Homes" />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Authentic Holiday Homes" />
        <meta name="twitter:description" content="Luxury holiday homes and professionally managed apartments in prime Dubai locations." />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': ['Organization', 'LocalBusiness'],
          name: 'Authentic Holiday Homes',
          url: 'https://authenticholidayhomes.ae',
          logo: 'https://authenticholidayhomes.ae/ahh%20white%20logo.webp',
          description: 'Luxury holiday homes and professionally managed apartments in prime Dubai locations.',
          foundingDate: '2021',
          areaServed: { '@type': 'City', name: 'Dubai' },
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+971-50-000-0000',
            contactType: 'customer service',
            email: 'info@authenticholidayhomes.ae',
            availableLanguage: ['English', 'Arabic'],
          },
          address: { '@type': 'PostalAddress', addressLocality: 'Dubai', addressCountry: 'AE' },
          sameAs: ['https://wa.me/971569969332'],
        })}</script>
      </Helmet>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/apartments" element={<Apartments />} />
          <Route path="/apartments/:slug" element={<PropertyDetails />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/about" element={<About />} />
          <Route path="/facilities" element={<Facilities />} />
          <Route path="/list-your-property" element={<ListProperty />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/areas" element={<Areas />} />
          <Route path="/areas/:slug" element={<AreaArticle />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
