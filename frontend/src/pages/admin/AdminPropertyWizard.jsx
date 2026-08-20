import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, ArrowLeft, Globe } from 'lucide-react';
import { adminApi } from '../../utils/api';
import AdminLayout from '../../components/admin/AdminLayout';
import Button from '../../components/public/Button';
import { useI18n } from '../../i18n/I18nContext';
import { useAdminToast } from '../../hooks/useAdminToast';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { CATEGORIES } from '../../utils/amenityIcons';
import TypeStep from './wizard/TypeStep';
import BuildingStep from './wizard/BuildingStep';
import BasicInfoStep from './wizard/BasicInfoStep';
import DetailsStep from './wizard/DetailsStep';
import DescriptionStep from './wizard/DescriptionStep';
import ImagesStep from './wizard/ImagesStep';
import AmenitiesStep from './wizard/AmenitiesStep';
import SeoStep from './wizard/SeoStep';

const steps = [
  { label: 'Type', labelAr: 'النوع' },
  { label: 'Building', labelAr: 'المبنى' },
  { label: 'Basic Info', labelAr: 'المعلومات الأساسية' },
  { label: 'Details', labelAr: 'التفاصيل' },
  { label: 'Description', labelAr: 'الوصف' },
  { label: 'Images', labelAr: 'الصور' },
  { label: 'Amenities', labelAr: 'المرافق' },
  { label: 'SEO & Publish', labelAr: 'SEO والنشر' },
];

const emptyForm = {
  // Type
  property_type: 'Apartment',
  // Building / Community
  building_id: '', community_id: '', landlord_id: '', apartment_number: '',
  // Unit details
  house_type: '', internet_provider: '', internet_account_number: '',
  dewa_premises_number: '', commission_percent: '',
  // Basic info
  title: '', title_ar: '',
  // Legacy fields kept for backward compat (auto-populated from building/community)
  building_name: '', building_name_ar: '', location: '', location_ar: '',
  address: '', address_ar: '',
  // Property details
  bedrooms: '1', bathrooms: '1', max_guests: '2', parking_spots: '1', size_sqft: '', price_per_night: '',
  // Description
  short_description: '', short_description_ar: '', description: '', description_ar: '',
  // Location
  map_url: '', plus_code: '', latitude: '', longitude: '',
  // SEO & Publish
  status: 'draft', is_featured: 0,
  meta_title: '', meta_title_ar: '', meta_description: '', meta_description_ar: '',
  // Amenities
  amenities: [],
};

export default function AdminPropertyWizard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, locale } = useI18n();
  const isRTL = locale === 'ar';
  
  const toast = useAdminToast();
  const isEdit = Boolean(id);

  const [searchParams] = useSearchParams();
  const unitId = searchParams.get('unit_id');

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [allAmenities, setAllAmenities] = useState([]);
  const [images, setImages] = useState([]);
  const [propertyId, setPropertyId] = useState(id || null); // Track auto-created listing ID
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [errors, setErrors] = useState({});
  const [amenitySearch, setAmenitySearch] = useState('');

  // New state for buildings, communities, landlords
  const [buildings, setBuildings] = useState([]);
  const [landlords, setLandlords] = useState([]);
  const [communities, setCommunities] = useState([]);

  const fileInputRef = useRef(null);

  useEffect(() => {
    // Fetch amenities, buildings, landlords, communities in parallel
    adminApi.get('/amenities/admin')
      .then(r => setAllAmenities(r.data.data || []))
      .catch(() => {});

    adminApi.get('/buildings', { params: { limit: 9999 } })
      .then(r => setBuildings(r.data.data || []))
      .catch(() => {});

    adminApi.get('/landlords', { params: { limit: 9999 } })
      .then(r => setLandlords(r.data.data || []))
      .catch(() => {});

    adminApi.get('/communities', { params: { limit: 9999 } })
      .then(r => setCommunities(r.data.data || []))
      .catch(() => {});

    if (isEdit) {
      adminApi.get(`/properties/detail/${id}`)
        .then(r => {
          const p = r.data;
          setForm({
            // Type
            property_type: p.property_type || 'Apartment',
            // Building / Community
            building_id: p.building_id ? String(p.building_id) : '',
            community_id: p.community_id || '',
            landlord_id: p.landlord_id ? String(p.landlord_id) : '',
            apartment_number: p.apartment_number || '',
            // Unit details
            house_type: p.house_type || '',
            internet_provider: p.internet_provider || '',
            internet_account_number: p.internet_account_number || '',
            dewa_premises_number: p.dewa_premises_number || '',
            commission_percent: p.commission_percent ? String(p.commission_percent) : '',
            // Basic info
            title: p.title || '', title_ar: p.title_ar || '',
            // Legacy fields
            building_name: p.building_name || '', building_name_ar: p.building_name_ar || '',
            location: p.location || '', location_ar: p.location_ar || '',
            address: p.address || '', address_ar: p.address_ar || '',
            // Property details
            bedrooms: String(p.bedrooms ?? 0), bathrooms: String(p.bathrooms ?? 0),
            max_guests: String(p.max_guests ?? 0), parking_spots: String(p.parking_spots ?? 0),
            size_sqft: p.size_sqft ? String(p.size_sqft) : '',
            price_per_night: String(p.price_per_night ?? 0),
            // Description
            short_description: p.short_description || '', short_description_ar: p.short_description_ar || '',
            description: p.description || '', description_ar: p.description_ar || '',
            // Documents
            documents: p.documents || [], permit_number: p.permit_number || '',
            // Location
            map_url: p.map_url || '', plus_code: p.plus_code || '',
            latitude: p.latitude ? String(p.latitude) : '',
            longitude: p.longitude ? String(p.longitude) : '',
            // SEO & Publish
            status: p.status || 'draft', is_featured: p.is_featured || 0,
            meta_title: p.meta_title || p.title || '',
            meta_title_ar: p.meta_title_ar || '',
            meta_description: p.meta_description || '',
            meta_description_ar: p.meta_description_ar || '',
            // Amenities
            amenities: p.amenities ? p.amenities.map(a => a.id) : [],
          });
          if (p.images) setImages(p.images);
        })
        .catch(() => navigate('/admin/listings'));
    }
  }, [id, isEdit, navigate]);

  useEffect(() => {
    if (!isEdit && unitId) {
      adminApi.get(`/units/${unitId}`)
        .then(r => {
          const u = r.data.unit;
          setForm(f => ({
            ...f,
            building_id: u.building_id ? String(u.building_id) : f.building_id,
            landlord_id: u.landlord_id ? String(u.landlord_id) : f.landlord_id,
            apartment_number: u.apartment_number || f.apartment_number,
            property_type: u.property_type || f.property_type,
            house_type: u.house_type || f.house_type,
            internet_provider: u.internet_provider || f.internet_provider,
            internet_account_number: u.internet_account_number || f.internet_account_number,
            dewa_premises_number: u.dewa_premises_number || f.dewa_premises_number,
            commission_percent: u.commission_percent != null ? String(u.commission_percent) : f.commission_percent,
            bedrooms: u.bedrooms != null ? String(u.bedrooms) : f.bedrooms,
            bathrooms: u.bathrooms != null ? String(u.bathrooms) : f.bathrooms,
            parking_spots: u.parking_spots != null ? String(u.parking_spots) : f.parking_spots,
            max_guests: u.max_guests ? String(u.max_guests) : f.max_guests,
            size_sqft: u.size_sqft ? String(u.size_sqft) : f.size_sqft,
            description: u.description || f.description,
            building_name: u.building_name || f.building_name,
            location: u.location || f.location,
          }));
        })
        .catch(() => {});
    }
  }, [unitId, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? (checked ? 1 : 0) : value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const toggleAmenity = (amenityId) => {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(amenityId)
        ? f.amenities.filter(a => a !== amenityId)
        : [...f.amenities, amenityId]
    }));
  };

  const filteredAmenities = useMemo(() => {
    if (!amenitySearch.trim()) return allAmenities;
    const q = amenitySearch.toLowerCase();
    return allAmenities.filter(a => a.name.toLowerCase().includes(q));
  }, [allAmenities, amenitySearch]);

  const groupedAmenities = useMemo(() => {
    const map = {};
    for (const a of filteredAmenities) {
      const cat = a.category || 'Other';
      if (!map[cat]) map[cat] = [];
      map[cat].push(a);
    }
    const order = [...CATEGORIES, 'Other'];
    return order.filter(c => map[c]).map(c => ({ category: c, items: map[c] }));
  }, [filteredAmenities]);

  const validateStep = (s) => {
    const errs = {};
    switch (s) {
      case 0: // Type
        if (!form.property_type) errs.property_type = 'Property type is required';
        break;
      case 1: // Building
        if (['Apartment', 'Penthouse', 'Studio'].includes(form.property_type) && !form.building_id) {
          errs.building_id = 'Building is required for this property type';
        }
        if (['Townhouse', 'Villa'].includes(form.property_type) && !form.community_id) {
          errs.community_id = 'Community is required for this property type';
        }
        break;
      case 2: // Basic Info
        if (!form.title.trim()) errs.title = 'Title is required';
        if (!form.title_ar.trim()) errs.title_ar = 'العنوان مطلوب';
        break;
      case 3: // Details
        if (!form.price_per_night || parseFloat(form.price_per_night) <= 0)
          errs.price_per_night = 'Valid price per night is required';
        break;
      case 7: // SEO & Publish
        if (form.status === 'published' && !form.meta_title.trim())
          errs.meta_title = 'Meta title is recommended for published properties';
        if (form.status === 'published' && !form.meta_title_ar.trim())
          errs.meta_title_ar = 'عنوان ميتا مطلوب للنشر';
        break;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const canProceed = () => {
    switch (step) {
      case 0: return Boolean(form.property_type);
      case 1:
        if (['Apartment', 'Penthouse', 'Studio'].includes(form.property_type)) {
          return Boolean(form.building_id);
        }
        return Boolean(form.community_id);
      case 2: return form.title.trim() && form.title_ar.trim();
      case 3: return form.price_per_night && parseFloat(form.price_per_night) > 0;
      default: return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    if (step < steps.length - 1) setStep(s => s + 1);
  };

  const handlePrev = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const handleSubmit = async (statusOverride) => {
    if (!validateStep(step)) return;
    setSubmitting(true);
    try {
      const data = {
        ...form,
        status: statusOverride || form.status,
        // Numeric conversions
        unit_id: unitId ? parseInt(unitId) : null,
        building_id: form.building_id ? parseInt(form.building_id) : null,
        landlord_id: form.landlord_id ? parseInt(form.landlord_id) : null,
        bedrooms: parseInt(form.bedrooms) || 0,
        bathrooms: parseInt(form.bathrooms) || 0,
        max_guests: parseInt(form.max_guests) || 0,
        parking_spots: parseInt(form.parking_spots) || 0,
        size_sqft: form.size_sqft ? parseInt(form.size_sqft) : null,
        price_per_night: parseFloat(form.price_per_night) || 0,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        commission_percent: form.commission_percent ? parseFloat(form.commission_percent) : null,
        // Exclude client-only fields from payload
        documents: undefined,
      };

      if (propertyId) {
        await adminApi.put(`/properties/${propertyId}`, data);
      } else {
        const res = await adminApi.post('/properties', data);
        setPropertyId(res.data.id);
      }

      toast.success(isEdit ? 'Property saved successfully' : 'Property created successfully');
      navigate('/admin/listings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save property');
    } finally {
      setSubmitting(false);
    }
  };

  /** Build a sanitized folder name from form state: {unit_number} - {building_name} */
  const getFolderName = () => {
    const unit = (form.apartment_number || '').trim();
    const building = (form.building_name || '').trim();
    if (unit && building) return `${unit} - ${building}`;
    if (building) return building;
    if (unit) return unit;
    return propertyId ? `listing-${propertyId}` : 'listing-new';
  };

  /** Save the current form as a draft listing and return its ID */
  const saveDraft = async () => {
    const data = {
      ...form,
      status: 'draft',
      unit_id: unitId ? parseInt(unitId) : null,
      building_id: form.building_id ? parseInt(form.building_id) : null,
      landlord_id: form.landlord_id ? parseInt(form.landlord_id) : null,
      bedrooms: parseInt(form.bedrooms) || 0,
      bathrooms: parseInt(form.bathrooms) || 0,
      max_guests: parseInt(form.max_guests) || 0,
      parking_spots: parseInt(form.parking_spots) || 0,
      size_sqft: form.size_sqft ? parseInt(form.size_sqft) : null,
      price_per_night: parseFloat(form.price_per_night) || 0,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      commission_percent: form.commission_percent ? parseFloat(form.commission_percent) : null,
      documents: undefined,
    };
    if (propertyId) {
      await adminApi.put(`/properties/${propertyId}`, data);
      return propertyId;
    }
    const res = await adminApi.post('/properties', data);
    const newId = res.data.id;
    setPropertyId(newId);
    return newId;
  };

  /** Handle files selected in ImagesStep — upload immediately */
  const handleFilesSelected = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      // Ensure listing exists (auto-create draft if new)
      let pid = propertyId;
      if (!pid) {
        pid = await saveDraft();
      }

      const formData = new FormData();
      // Append folder_name FIRST so multer reads it before processing files
      formData.append('folder_name', getFolderName());
      files.forEach(f => formData.append('images', f));

      const res = await adminApi.post(`/properties/${pid}/images`, formData, {
        headers: { 'Content-Type': undefined }
      });
      if (res.data) {
        setImages(prev => [...prev, ...res.data]);
      }
      toast.success(`${files.length} image${files.length > 1 ? 's' : ''} uploaded`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!propertyId) {
      setImages(prev => prev.filter(i => i.id !== imageId));
      return;
    }
    try {
      await adminApi.delete(`/properties/${propertyId}/images/${imageId}`);
      setImages(prev => prev.filter(i => i.id !== imageId));
      toast.success('Image deleted');
    } catch { toast.error('Failed to delete image'); }
  };

  const handleSetCover = async (imageId) => {
    if (!propertyId) {
      setImages(prev => prev.map(i => ({ ...i, is_cover: i.id === imageId ? 1 : 0 })));
      return;
    }
    try {
      await adminApi.put(`/properties/${propertyId}/images/${imageId}/cover`);
      setImages(prev => prev.map(i => ({ ...i, is_cover: i.id === imageId ? 1 : 0 })));
      toast.success('Cover image updated');
    } catch { toast.error('Failed to set cover image'); }
  };

  const handleDragStart = (index) => setDragIndex(index);
  const handleDragOver = (e, index) => { e.preventDefault(); setOverIndex(index); };

  const handleDrop = async () => {
    if (dragIndex === null || overIndex === null || dragIndex === overIndex) {
      setDragIndex(null); setOverIndex(null); return;
    }
    const reordered = [...images];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(overIndex, 0, moved);
    setImages(reordered);
    setDragIndex(null);
    setOverIndex(null);
    if (propertyId) {
      try {
        await adminApi.put(`/properties/${propertyId}/images/reorder`, { image_ids: reordered.map(i => i.id) });
        toast.success('Images reordered');
      } catch { toast.error('Failed to reorder images'); }
    }
  };

  const handleDragEnd = () => { setDragIndex(null); setOverIndex(null); };

  const handleCancel = () => {
    if (form.title.trim() || form.title_ar.trim() || images.length > 0) {
      setShowCancelDialog(true);
    } else {
      navigate('/admin/listings');
    }
  };

  const renderFieldError = (field) => {
    if (!errors[field]) return null;
    return <small className="form-hint" style={{ color: 'var(--color-error)' }}>{errors[field]}</small>;
  };

  const renderStep = () => {
    const stepProps = { form, errors, handleChange, renderFieldError, setForm };
    switch (step) {
      case 0: return <TypeStep form={form} handleChange={handleChange} />;
      case 1: return <BuildingStep
        buildings={buildings}
        communities={communities}
        landlords={landlords}
        form={form}
        handleChange={handleChange}
        errors={errors}
        renderFieldError={renderFieldError}
        listing={{ unit_id: unitId, ...form }} // Pass unit_id to indicate linked status
      />;
      case 2: return <BasicInfoStep {...stepProps} />;
      case 3: return <DetailsStep {...stepProps} listing={{ unit_id: unitId, ...form }} />;
      case 4: return <DescriptionStep form={form} handleChange={handleChange} />;
      case 5: return <ImagesStep
        images={images} onFilesSelected={handleFilesSelected} uploading={uploading}
        dragIndex={dragIndex} overIndex={overIndex} previewUrl={previewUrl}
        handleDragStart={handleDragStart} handleDragOver={handleDragOver}
        handleDrop={handleDrop} handleDragEnd={handleDragEnd}
        handleDeleteImage={handleDeleteImage} handleSetCover={handleSetCover}
        fileInputRef={fileInputRef} isEdit={isEdit}
      />;
      case 6: return <AmenitiesStep
        amenitySearch={amenitySearch} setAmenitySearch={setAmenitySearch}
        groupedAmenities={groupedAmenities} form={form}
        toggleAmenity={toggleAmenity} setForm={setForm}
      />;
      case 7: return <SeoStep form={form} errors={errors} setForm={setForm} renderFieldError={renderFieldError} />;
      default: return null;
    }
  };

  return (
    <AdminLayout
      title={isEdit ? 'Edit Listing' : 'New Listing'}
      actions={[{ label: 'Back to Properties', icon: <ArrowLeft size={16} />, onClick: () => navigate('/admin/listings') }]}
    >
      <div className="wizard-step-indicator-mobile">
        <span className="wizard-step-count">Step {step + 1} of {steps.length}</span>
        <h3 className="wizard-step-title-mobile">{isRTL ? steps[step].labelAr : steps[step].label}</h3>
        <div className="wizard-dots">
          {steps.map((_, i) => (
            <span key={i} className={`wizard-dot${i === step ? ' active' : ''}${i < step ? ' completed' : ''}`} />
          ))}
        </div>
      </div>
      <div className="wizard-progress">
        {steps.map((s, i) => (
          <div
            key={i}
            className={`wizard-step-indicator ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`}
            onClick={() => setStep(i)}
          >
            <div className="wizard-step-dot">
              {i < step ? <Check size={14} /> : null}
            </div>
            <span className="wizard-step-label">{isRTL ? s.labelAr : s.label}</span>
          </div>
        ))}
      </div>

      <form className="admin-form" onSubmit={e => e.preventDefault()}>
        {renderStep()}
        <div className="wizard-nav">
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={step === 0 ? handleCancel : handlePrev}>
              {step === 0 ? 'Cancel' : <><ChevronLeft size={16} /> Previous</>}
            </Button>
            <Button type="button" variant="secondary" onClick={() => handleSubmit('draft')} loading={submitting} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Draft'}
            </Button>
          </div>
          {step < steps.length - 1 ? (
            <Button type="button" variant="primary" onClick={handleNext} disabled={!canProceed()}>
              Next <ChevronRight size={16} />
            </Button>
          ) : (
            <Button type="button" variant="primary" onClick={() => handleSubmit('published')} loading={submitting} disabled={submitting}>
              {submitting ? 'Saving...' : 'Publish'}
            </Button>
          )}
        </div>
      </form>

      <ConfirmDialog
        open={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={() => navigate('/admin/listings')}
        title="Discard Changes?"
        message="You have unsaved changes. Are you sure you want to leave this page?"
        confirmLabel="Discard"
        variant="danger"
      />
    </AdminLayout>
  );
}
