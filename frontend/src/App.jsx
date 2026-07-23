import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Apartments from './pages/Apartments';
import PropertyDetails from './pages/PropertyDetails';
import About from './pages/About';
import Facilities from './pages/Facilities';
import ListProperty from './pages/ListProperty';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import DesignSystem from './pages/DesignSystem';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProperties from './pages/admin/AdminProperties';
import AdminPropertyWizard from './pages/admin/AdminPropertyWizard';
import AdminLandlordRequests from './pages/admin/AdminLandlordRequests';
import AdminEnquiries from './pages/admin/AdminEnquiries';
import AdminContactMessages from './pages/admin/AdminContactMessages';

function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/properties" element={<AdminProperties />} />
      <Route path="/admin/properties/new" element={<AdminPropertyWizard />} />
      <Route path="/admin/properties/edit/:id" element={<AdminPropertyWizard />} />
      <Route path="/admin/landlord-requests" element={<AdminLandlordRequests />} />
      <Route path="/admin/enquiries" element={<AdminEnquiries />} />
      <Route path="/admin/contact-messages" element={<AdminContactMessages />} />
      <Route path="/design-system" element={<DesignSystem />} />
      <Route path="*" element={<PublicLayout />} />
    </Routes>
  );
}

function PublicLayout() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/apartments" element={<Apartments />} />
          <Route path="/apartments/:slug" element={<PropertyDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/facilities" element={<Facilities />} />
          <Route path="/list-your-property" element={<ListProperty />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
