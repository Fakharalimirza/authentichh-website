import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Pencil, Trash2, Eye, ExternalLink, Building2, User, Upload, Download, FileText, ScanText } from 'lucide-react';
import { adminApi } from '../../utils/api';
import Button from '../../components/public/Button';
import Badge from '../../components/public/Badge';
import Modal from '../../components/public/Modal';
import RowActions from '../../components/admin/RowActions';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { useAdminToast } from '../../hooks/useAdminToast';
import AdminTablePage from '../../components/admin/AdminTablePage';

const statusBadgeVariant = (status) => {
  switch (status) {
    case 'published': return 'success';
    case 'draft': return 'warning';
    case 'unpublished': return 'error';
    default: return 'default';
  }
};

const emptyForm = {
  building_id: '',
  landlord_id: '',
  apartment_number: '',
  property_type: 'Apartment',
  house_type: 'Standard',
  internet_provider: 'Etisalat',
  internet_account_number: '',
  dewa_premises_number: '',
  dewa_account_number: '',
  utility_bills_paid_by: 'management',
  floor: '',
  size_sqm: '',
  wifi_username: '',
  wifi_password: '',
  commission_percent: '',
  bedrooms: '',
  bathrooms: '',
  parking_spots: '',
  parking_spot_numbers: [],
  max_guests: '',
  size_sqft: '',
  description: '',
};

const fmtNum = (n) => {
  if (n === null || n === undefined || n === '' || isNaN(Number(n))) return '—';
  return Number(n).toLocaleString('en-US');
};

const unitDocLabels = { title_deed: 'Title Deed', permit: 'DTCM Apartment Permit', contract: 'Contract' };

function ViewUnitDocs({ unitId }) {
  const [docs, setDocs] = useState([]);
  useEffect(() => {
    if (!unitId) return;
    adminApi.get(`/units/${unitId}/documents`).then(({ data }) => setDocs(data)).catch(() => {});
  }, [unitId]);

  if (docs.length === 0) return null;

  return (
    <>
      <h4 style={{ margin: '16px 0 8px', fontSize: 14, fontWeight: 600, opacity: 0.7 }}>Documents</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
        {docs.map(doc => (
          <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 6 }}>
            <FileText size={14} style={{ opacity: 0.4, flexShrink: 0 }} />
            <span style={{ fontWeight: 500 }}>{unitDocLabels[doc.document_type] || doc.document_type}</span>
            <span style={{ color: 'var(--color-text-muted)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              {doc.document_url.split('/').pop()}
            </span>
            {doc.permit_number && (
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                Permit #: {doc.permit_number}
              </span>
            )}
            {doc.expiry_date && (
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                Exp: {new Date(doc.expiry_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            )}
            <a href={`/${doc.document_url}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, color: 'var(--color-primary)', textDecoration: 'none', flexShrink: 0 }}>
              <Eye size={12} /> View
            </a>
          </div>
        ))}
      </div>
    </>
  );
}

export default function AdminUnits() {
  const navigate = useNavigate();
  const toast = useAdminToast();

  const [units, setUnits] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [landlords, setLandlords] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [listingFilter, setListingFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(25);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [pendingDocs, setPendingDocs] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [scanningDoc, setScanningDoc] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [scanFile, setScanFile] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanReviewOpen, setScanReviewOpen] = useState(false);
  const [applyArabic, setApplyArabic] = useState(false);
  const [buildingSearch, setBuildingSearch] = useState('');
  const [landlordSearch, setLandlordSearch] = useState('');
  const [buildingFocused, setBuildingFocused] = useState(false);
  const [landlordFocused, setLandlordFocused] = useState(false);
  const [selectedBuildingName, setSelectedBuildingName] = useState('');
  const [selectedLandlordName, setSelectedLandlordName] = useState('');

  const fetchUnits = useCallback(async () => {
    try {
      const params = { page, limit: perPage };
      if (search.trim()) params.search = search.trim();
      if (buildingFilter) params.building_id = buildingFilter;
      if (typeFilter) params.property_type = typeFilter;
      if (listingFilter) params.has_listing = listingFilter;
      const { data } = await adminApi.get('/units', { params });
      setUnits(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || (data.units || []).length);
    } catch {
      toast.error('Failed to load units');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, buildingFilter, typeFilter, listingFilter]);

  const fetchLookups = async () => {
    try {
      const [b, l, c] = await Promise.all([
        adminApi.get('/buildings', { params: { limit: 9999 } }),
        adminApi.get('/landlords', { params: { limit: 9999 } }),
        adminApi.get('/communities', { params: { limit: 9999 } }),
      ]);
      setBuildings(b.data.data || []);
      setLandlords(l.data.data || []);
      setCommunities(c.data.data || []);
    } catch {
      // lookups are optional context for dropdowns
    }
  };

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  useEffect(() => {
    fetchLookups();
  }, []);

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  const filteredBuildings = buildings.filter(b =>
    !buildingSearch || b.name.toLowerCase().includes(buildingSearch.toLowerCase())
  );

  const filteredLandlords = landlords.filter(l =>
    !landlordSearch || (l.full_name || l.name || l.email || '').toLowerCase().includes(landlordSearch.toLowerCase())
  );

  const matchedScanBuilding = scanResult?.fields?.building_name
    ? buildings.find(x => x.name?.toLowerCase() === scanResult.fields.building_name.trim().toLowerCase())
    : null;

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setDocuments([]);
    setPendingDocs([]);
    setBuildingSearch('');
    setLandlordSearch('');
    setBuildingFocused(false);
    setLandlordFocused(false);
    setSelectedBuildingName('');
    setSelectedLandlordName('');
    setShowForm(true);
  };

  const editListing = (u) => {
    if (u.listing_id) {
      navigate(`/admin/listings/edit/${u.listing_id}`);
    } else {
      toast.error('No listing linked to this unit yet');
    }
  };

  const createListing = (u) => {
    navigate(`/admin/listings/new?unit_id=${u.id}`);
  };

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const updateParkingSpotNumber = (index, value) => {
    setForm((f) => {
      const arr = [...(f.parking_spot_numbers || [])];
      arr[index] = value;
      return { ...f, parking_spot_numbers: arr };
    });
  };

  const handleSave = async () => {
    if (!form.building_id) { toast.error('Please select a building'); return; }
    if (!form.apartment_number) { toast.error('Apartment number is required'); return; }
    setSaving(true);
    const payload = {
      ...form,
      parking_spot_numbers: (form.parking_spot_numbers || []).filter(Boolean).join(', ') || null,
    };
    try {
      if (editId) {
        await adminApi.put(`/units/${editId}`, payload);
        toast.success('Unit updated');
      } else {
        const { data } = await adminApi.post('/units', payload);
        const newId = data?.unit?.id || data?.unit;
        if (newId && pendingDocs.length > 0) {
          for (const pd of pendingDocs) {
            try {
              const fd = new FormData();
              fd.append('document', pd.file);
              fd.append('type', pd.type);
              if (pd.expiryDate) fd.append('expiry_date', pd.expiryDate);
              await adminApi.post(`/units/${newId}/documents`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
              });
            } catch (err) {
              toast.error(err.response?.data?.message || `Failed to upload ${pd.type} document`);
            }
          }
          setPendingDocs([]);
          toast.success('Pending documents uploaded');
        }
        toast.success('Unit added');
      }
      setShowForm(false);
      fetchUnits();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save unit');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.delete(`/units/${deleteTarget.id}`);
      toast.success('Unit deleted');
      setDeleteTarget(null);
      if (units.length === 1 && page > 1) {
        setPage(p => p - 1);
      } else {
        fetchUnits();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete unit');
    }
  };

  const downloadTemplate = () => {
    const headers = ['building_name', 'apartment_number', 'landlord_name', 'property_type', 'house_type', 'internet_provider', 'internet_account_number', 'dewa_premises_number', 'bedrooms', 'bathrooms', 'parking_spots', 'commission_percent', 'max_guests', 'size_sqft', 'description'];
    const example = ['Marina Heights Tower', '101', 'John Smith', 'Apartment', 'Standard', 'Etisalat', '12345678', '98765432', '75000', '15', '4', '1200', 'Spacious 2BR apartment'];
    const csv = headers.join(',') + '\n' + example.join(',') + '\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'units-template.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleImport = async () => {
    if (!importFile) { toast.error('Please select a CSV file'); return; }
    setImporting(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      const { data } = await adminApi.post('/units/bulk-import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImportResult(data);
      toast.success(data.message);
      if (data.imported > 0) fetchUnits();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const openEdit = (u) => {
    setEditId(u.id);
    setForm({
      building_id: u.building_id ? String(u.building_id) : '',
      landlord_id: u.landlord_id ? String(u.landlord_id) : '',
      apartment_number: u.apartment_number || '',
      property_type: u.property_type || 'Apartment',
      house_type: u.house_type || 'Standard',
      internet_provider: u.internet_provider || 'Etisalat',
      internet_account_number: u.internet_account_number || '',
      dewa_premises_number: u.dewa_premises_number || '',
      dewa_account_number: u.dewa_account_number || '',
      utility_bills_paid_by: u.utility_bills_paid_by || 'management',
      floor: u.floor || '',
      size_sqm: u.size_sqm ?? '',
      wifi_username: u.wifi_username || '',
      wifi_password: u.wifi_password || '',
      commission_percent: u.commission_percent ?? '',
      bedrooms: u.bedrooms ?? '',
      bathrooms: u.bathrooms ?? '',
      parking_spots: u.parking_spots ?? '',
      parking_spot_numbers: (u.parking_spot_numbers || '').split(',').map(s => s.trim()).filter(Boolean),
      max_guests: u.max_guests ?? '',
      size_sqft: u.size_sqft || '',
      description: u.description || '',
    });
    setBuildingSearch('');
    setLandlordSearch('');
    setBuildingFocused(false);
    setLandlordFocused(false);
    setSelectedBuildingName(u.building_name || '');
    setSelectedLandlordName(u.landlord_name || '');
    setShowForm(true);
    fetchDocuments(u.id);
  };

  const fetchDocuments = async (unitId) => {
    try {
      const { data } = await adminApi.get(`/units/${unitId}/documents`);
      setDocuments(data);
    } catch {
      setDocuments([]);
    }
  };

  const handleUploadDocument = async (type, file, expiryDate = null) => {
    if (!file) return;
    if (!editId) {
      setPendingDocs(prev => [...prev, { type, file, expiryDate }]);
      toast.success('Document added — will upload after save');
      return;
    }
    setUploadingDoc(type);
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', type);
      if (expiryDate) formData.append('expiry_date', expiryDate);
      await adminApi.post(`/units/${editId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Document uploaded');
      fetchDocuments(editId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!editId) return;
    try {
      await adminApi.delete(`/units/${editId}/documents/${docId}`);
      toast.success('Document deleted');
      fetchDocuments(editId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete document');
    }
  };

  const handleUpdateDocument = async (docId, updates) => {
    if (!editId) return;
    try {
      await adminApi.patch(`/units/${editId}/documents/${docId}`, updates);
      fetchDocuments(editId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update document');
    }
  };

  const handleScanDocument = async (type, file) => {
    if (!file) return;
    setScanningDoc(type);
    setApplyArabic(false);
    setScanFile(file);
    setScanLoading(true);
    setScanReviewOpen(true);
    setScanResult(null);
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('document_type', type);
      const { data } = await adminApi.post('/ocr/extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });
      setScanResult(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'OCR scan failed');
      setScanReviewOpen(false);
    } finally {
      setScanLoading(false);
    }
  };

  const handleScanConfirm = async () => {
    if (!scanFile || !scanningDoc) return;
    const expiryDate = scanResult?.fields?.expiry_date || null;
    await handleUploadDocument(scanningDoc, scanFile, expiryDate);
    if (scanResult?.fields) {
      const fields = scanResult.fields;
      if (scanningDoc === 'title_deed') {
        const fill = {};
        if (!form.apartment_number && (fields.apartment_number || fields.registration_no)) {
          fill.apartment_number = fields.apartment_number || fields.registration_no || '';
        }
        if (!form.property_type && fields.property_type) {
          fill.property_type = fields.property_type;
        }
        if (!form.parking_spots && fields.parking_spots && Number(fields.parking_spots) > 0) {
          fill.parking_spots = Number(fields.parking_spots);
        }
        if (!(form.parking_spot_numbers || []).length && fields.parking_spot) {
          fill.parking_spot_numbers = [String(fields.parking_spot)];
        }
        if (!form.size_sqft && fields.size_sqft && Number(fields.size_sqft) > 0) {
          fill.size_sqft = Number(fields.size_sqft);
        }
        if (!form.description && fields.registration_no) {
          fill.description = `Title Deed No: ${fields.registration_no}\n`;
        }
        const b = buildings.find(x => fields.building_name && x.name?.toLowerCase() === fields.building_name.trim().toLowerCase());
        if (b && !form.building_id) {
          fill.building_id = b.id;
          setSelectedBuildingName(b.name);
        }
        if (Object.keys(fill).length > 0) {
          setForm(f => ({ ...f, ...fill }));
          setShowForm(true);
          toast.success('Document uploaded. Unit form prefilled from title deed — verify and save.');
        } else {
          toast.success('Document uploaded with OCR data. Check permit/expiry fields.');
        }
        if (applyArabic) {
          const f = scanResult.fields;
          const applyTasks = [];
          if (matchedScanBuilding && f.building_name_ar && !matchedScanBuilding.name_ar) {
            applyTasks.push(
              adminApi.put(`/buildings/${matchedScanBuilding.id}`, { name_ar: f.building_name_ar })
                .catch(() => toast.error('Failed to apply Arabic name'))
            );
          }
          const c = communities.find(x => f.community && x.name?.toLowerCase() === f.community.trim().toLowerCase());
          if (c && f.community_ar && !c.arabic_name) {
            applyTasks.push(
              adminApi.put(`/communities/${c.id}`, { arabic_name: f.community_ar })
                .catch(() => toast.error('Failed to apply Arabic name'))
            );
          }
          const l = landlords.find(x => String(x.id) === String(form.landlord_id));
          if (l && f.owner_name_ar && !l.full_name_ar) {
            applyTasks.push(
              adminApi.put(`/landlords/${l.id}`, { full_name_ar: f.owner_name_ar })
                .catch(() => toast.error('Failed to apply Arabic name'))
            );
          }
          if (applyTasks.length > 0) {
            await Promise.all(applyTasks);
          }
        }
      } else {
        toast.success('Document uploaded with OCR data. Verify fields before saving.');
      }
    }
    setScanReviewOpen(false);
    setApplyArabic(false);
    setScanResult(null);
    setScanFile(null);
    setScanningDoc(null);
  };

  const handleScanClose = () => {
    setScanReviewOpen(false);
    setApplyArabic(false);
    setScanResult(null);
    setScanFile(null);
    setScanningDoc(null);
  };

  const columns = [
    {
      label: 'Building',
      render: (u) => (
        <div className="flex items-center gap-2">
          <Building2 size={14} style={{ opacity: 0.4, flexShrink: 0 }} />
          <span className="font-medium">{u.building_name || '—'}</span>
        </div>
      ),
    },
    { label: 'Apt #', render: (u) => u.apartment_number || '—' },
    {
      label: 'Landlord',
      render: (u) => (
        <div className="flex items-center gap-2">
          <User size={14} style={{ opacity: 0.4, flexShrink: 0 }} />
          <span>{u.landlord_name || '—'}</span>
        </div>
      ),
    },
    { label: 'Type', render: (u) => u.property_type || '—' },
    { label: 'Beds', align: 'center', render: (u) => u.bedrooms ?? '—' },
    { label: 'Baths', align: 'center', render: (u) => u.bathrooms ?? '—' },
    { label: 'Parking', align: 'center', render: (u) => u.parking_spots ?? '—' },
    { label: 'Guests', align: 'center', render: (u) => u.max_guests || '—' },
    {
      label: 'Listing',
      align: 'center',
      render: (u) =>
        u.listing_status ? (
          <Badge variant={statusBadgeVariant(u.listing_status)} size="sm">{u.listing_status}</Badge>
        ) : (
          <span className="text-muted">—</span>
        ),
    },
    {
      label: 'Actions',
      align: 'right',
      render: (u) => (
        <RowActions actions={[
          { label: 'View', icon: Eye, onClick: () => setViewTarget(u) },
          { label: 'Edit', icon: Pencil, onClick: () => openEdit(u) },
          { label: u.listing_status ? 'Edit Listing' : 'Create Listing', icon: ExternalLink, onClick: () => u.listing_id ? editListing(u) : createListing(u) },
          { label: 'Delete', icon: Trash2, onClick: () => setDeleteTarget(u), variant: 'danger' },
        ]} />
      ),
    },
  ];

  return (
    <>
      <AdminTablePage
        title="Units"
        actions={[
          { label: 'Bulk Import', icon: <Upload size={16} />, onClick: () => { setShowImportModal(true); setImportFile(null); setImportResult(null); } },
          { label: 'Add Unit', icon: <Plus size={16} />, onClick: openAdd },
        ]}
        loading={loading}
        items={units}
        rowKey="id"
        columns={columns}
        search={{ value: search, placeholder: 'Search units...', onChange: handleSearchChange }}
        filters={[
          {
            label: 'Building',
            value: buildingFilter,
            onChange: (v) => { setBuildingFilter(v); setPage(1); },
            options: buildings.map((b) => ({ value: b.id, label: b.name })),
          },
          {
            label: 'Type',
            value: typeFilter,
            onChange: (v) => { setTypeFilter(v); setPage(1); },
            options: [
              { value: 'Apartment', label: 'Apartment' },
              { value: 'Studio', label: 'Studio' },
              { value: 'Penthouse', label: 'Penthouse' },
            ],
          },
          {
            label: 'Listing',
            value: listingFilter,
            onChange: (v) => { setListingFilter(v); setPage(1); },
            options: [
              { value: 'yes', label: 'Has Listing' },
              { value: 'no', label: 'No Listing' },
            ],
          },
        ]}
        count={total}
        countLabel={(n) => (n === 1 ? 'unit' : 'units')}
        empty={{
          icon: <Search size={24} />,
          title: 'No units found',
          hint: 'Get started by adding your first unit.',
        }}
        pagination={{
          page,
          totalPages,
          total,
          perPage,
          onPerPageChange: (n) => { setPerPage(n); setPage(1); },
          onChange: setPage,
        }}
      />

      {showForm && (
        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editId ? 'Edit Unit' : 'Add Unit'} className="modal-lg">
          <div className="flex flex-col gap-4">
            <div className="form-row">
              <div className="form-group form-group-grow">
                <label className="admin-label">Building *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Search buildings..."
                    value={buildingSearch || (form.building_id ? (selectedBuildingName || buildings.find(b => String(b.id) === form.building_id)?.name || '') : '')}
                    onChange={e => { setBuildingSearch(e.target.value); if (form.building_id) setForm(f => ({ ...f, building_id: '' })); }}
                    onFocus={() => { setBuildingFocused(true); setBuildingSearch(''); }}
                    onBlur={() => setTimeout(() => setBuildingFocused(false), 200)}
                    className="admin-input"
                  />
                  {buildingFocused && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                      borderRadius: 8, marginTop: 4, maxHeight: 200, overflowY: 'auto',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}>
                      <div
                        onClick={() => { setForm(f => ({ ...f, building_id: '' })); setSelectedBuildingName(''); setBuildingSearch(''); }}
                        style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, color: 'var(--color-text-muted)' }}
                      >
                        Select building...
                      </div>
                      {filteredBuildings.map(b => (
                        <div
                          key={b.id}
                          onClick={() => { setForm(f => ({ ...f, building_id: String(b.id) })); setSelectedBuildingName(b.name); setBuildingSearch(''); }}
                          style={{
                            padding: '8px 12px', cursor: 'pointer', fontSize: 13,
                            background: String(b.id) === form.building_id ? 'var(--color-primary-light)' : 'transparent',
                            color: 'var(--color-text)',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-secondary)'}
                          onMouseLeave={e => e.currentTarget.style.background = String(b.id) === form.building_id ? 'var(--color-primary-light)' : 'transparent'}
                        >
                          {b.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group form-group-grow">
                <label className="admin-label">Landlord</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Search landlords..."
                    value={landlordSearch || (form.landlord_id ? (selectedLandlordName || landlords.find(l => String(l.id) === form.landlord_id)?.full_name || landlords.find(l => String(l.id) === form.landlord_id)?.name || '') : '')}
                    onChange={e => { setLandlordSearch(e.target.value); if (form.landlord_id) setForm(f => ({ ...f, landlord_id: '' })); }}
                    onFocus={() => { setLandlordFocused(true); setLandlordSearch(''); }}
                    onBlur={() => setTimeout(() => setLandlordFocused(false), 200)}
                    className="admin-input"
                  />
                  {landlordFocused && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                      borderRadius: 8, marginTop: 4, maxHeight: 200, overflowY: 'auto',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}>
                      <div
                        onClick={() => { setForm(f => ({ ...f, landlord_id: '' })); setSelectedLandlordName(''); setLandlordSearch(''); }}
                        style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, color: 'var(--color-text-muted)' }}
                      >
                        Select landlord...
                      </div>
                      {filteredLandlords.map(l => (
                        <div
                          key={l.id}
                          onClick={() => { setForm(f => ({ ...f, landlord_id: String(l.id) })); setSelectedLandlordName(l.full_name || l.name || l.email); setLandlordSearch(''); }}
                          style={{
                            padding: '8px 12px', cursor: 'pointer', fontSize: 13,
                            background: String(l.id) === form.landlord_id ? 'var(--color-primary-light)' : 'transparent',
                            color: 'var(--color-text)',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-secondary)'}
                          onMouseLeave={e => e.currentTarget.style.background = String(l.id) === form.landlord_id ? 'var(--color-primary-light)' : 'transparent'}
                        >
                          {l.full_name || l.name || l.email}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group form-group-grow">
                <label className="admin-label">Apartment Number *</label>
                <input name="apartment_number" value={form.apartment_number} onChange={handleChange} className="admin-input" />
              </div>
              <div className="form-group form-group-grow">
                <label className="admin-label">Apartment Type</label>
                <select name="property_type" value={form.property_type} onChange={handleChange} className="admin-input">
                  <option value="Apartment">Apartment</option>
                  <option value="Studio">Studio</option>
                  <option value="Penthouse">Penthouse</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group form-group-grow">
                <label className="admin-label">House Type</label>
                <select name="house_type" value={form.house_type} onChange={handleChange} className="admin-input">
                  <option value="Standard">Standard</option>
                  <option value="Corner">Corner</option>
                  <option value="Middle">Middle</option>
                  <option value="End Unit">End Unit</option>
                  <option value="Duplex">Duplex</option>
                </select>
              </div>
              <div className="form-group form-group-grow">
                <label className="admin-label">Internet Provider</label>
                <select name="internet_provider" value={form.internet_provider} onChange={handleChange} className="admin-input">
                  <option value="Etisalat">Etisalat</option>
                  <option value="Du">Du</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group form-group-grow">
                <label className="admin-label">Internet Account Number</label>
                <input name="internet_account_number" value={form.internet_account_number} onChange={handleChange} className="admin-input" />
              </div>
              <div className="form-group form-group-grow">
                <label className="admin-label">DEWA Premises Number</label>
                <input name="dewa_premises_number" value={form.dewa_premises_number} onChange={handleChange} className="admin-input" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group form-group-grow">
                <label className="admin-label">DEWA Account Number</label>
                <input name="dewa_account_number" value={form.dewa_account_number} onChange={handleChange} className="admin-input" />
              </div>
              <div className="form-group form-group-grow">
                <label className="admin-label">Utility Bills Paid By</label>
                <select name="utility_bills_paid_by" value={form.utility_bills_paid_by} onChange={handleChange} className="admin-input">
                  <option value="management">Management</option>
                  <option value="owner">Owner</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group form-group-grow">
                <label className="admin-label">WiFi Username</label>
                <input name="wifi_username" value={form.wifi_username} onChange={handleChange} className="admin-input" />
              </div>
              <div className="form-group form-group-grow">
                <label className="admin-label">WiFi Password</label>
                <input name="wifi_password" value={form.wifi_password} onChange={handleChange} className="admin-input" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group form-group-grow">
                <label className="admin-label">Bedrooms</label>
                <input name="bedrooms" type="number" min="0" value={form.bedrooms} onChange={handleChange} className="admin-input" />
              </div>
              <div className="form-group form-group-grow">
                <label className="admin-label">Bathrooms</label>
                <input name="bathrooms" type="number" min="0" value={form.bathrooms} onChange={handleChange} className="admin-input" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group form-group-grow">
                <label className="admin-label">Parking Spots</label>
                <input name="parking_spots" type="number" min="0" value={form.parking_spots} onChange={handleChange} className="admin-input" />
              </div>
              <div className="form-group form-group-grow">
                <label className="admin-label">Commission %</label>
                <input name="commission_percent" type="number" min="0" max="100" value={form.commission_percent} onChange={handleChange} className="admin-input" />
              </div>
            </div>
            {Number(form.parking_spots) > 0 && (
              <div className="form-group">
                <label className="admin-label">Parking Spot Numbers</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
                  {Array.from({ length: Math.min(Number(form.parking_spots) || 0, 10) }).map((_, i) => (
                    <div key={i}>
                      <label style={{ display: 'block', fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4 }}>Parking Spot #{i + 1}</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder={`Spot #${i + 1}`}
                        value={(form.parking_spot_numbers || [])[i] || ''}
                        onChange={(e) => updateParkingSpotNumber(i, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="form-row">
              <div className="form-group form-group-grow">
                <label className="admin-label">Guest Capacity</label>
                <input name="max_guests" type="number" min="0" value={form.max_guests} onChange={handleChange} className="admin-input" />
              </div>
              <div className="form-group form-group-grow">
                <label className="admin-label">Apartment Area sqft</label>
                <input name="size_sqft" type="number" min="0" value={form.size_sqft} onChange={handleChange} className="admin-input" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group form-group-grow">
                <label className="admin-label">Area sqm</label>
                <input name="size_sqm" type="number" min="0" value={form.size_sqm} onChange={handleChange} className="admin-input" />
              </div>
              <div className="form-group form-group-grow">
                <label className="admin-label">Floor</label>
                <input name="floor" value={form.floor} onChange={handleChange} className="admin-input" placeholder="e.g. 6" />
              </div>
            </div>
            <div className="form-group">
              <label className="admin-label">Description</label>
              <textarea name="description" rows={3} value={form.description} onChange={handleChange} className="admin-textarea" />
            </div>

            {/* Documents */}
            <div>
              <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, opacity: 0.7 }}>Documents</h4>
              <div className="flex flex-col gap-3">
                {[
                  { type: 'title_deed', label: 'Title Deed', hasMeta: false },
                  { type: 'permit', label: 'DTCM Apartment Permit', hasMeta: true },
                  { type: 'contract', label: 'Contract', hasMeta: true },
                ].map(({ type, label, hasMeta }) => {
                  const doc = documents.find(d => d.document_type === type);
                  const pendingDoc = pendingDocs.find(d => d.type === type);
                  return (
                    <div key={type} style={{ border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-surface)', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px' }}>
                        <FileText size={16} style={{ opacity: 0.4, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 500, fontSize: 13 }}>{label}</div>
                          {doc ? (
                            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {doc.document_url.split('/').pop()}
                            </div>
                          ) : pendingDoc ? (
                            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {pendingDoc.file.name} <span style={{ color: 'var(--color-accent)' }}>— pending</span>
                            </div>
                          ) : (
                            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>No document uploaded</div>
                          )}
                        </div>
                        {doc && (
                          <a
                            href={`/${doc.document_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: 12, cursor: 'pointer', color: 'var(--color-primary)', textDecoration: 'none', flexShrink: 0 }}
                          >
                            <Eye size={12} /> View
                          </a>
                        )}
                        {pendingDoc && (
                          <button
                            type="button"
                            onClick={() => setPendingDocs(prev => prev.filter(d => d.type !== type))}
                            style={{ background: 'none', border: '1px solid var(--color-error)', color: 'var(--color-error)', borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer', flexShrink: 0 }}
                            title="Remove pending document"
                          >
                            Remove
                          </button>
                        )}
                        {!pendingDoc && (
                          <>
                            <label style={{ cursor: 'pointer', flexShrink: 0 }}>
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.webp"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleUploadDocument(type, file);
                                  e.target.value = '';
                                }}
                              />
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: 12, cursor: 'pointer', color: 'var(--color-primary)' }}>
                                <Upload size={12} /> {doc ? 'Replace' : 'Upload'}
                              </span>
                            </label>
                            <label style={{ cursor: 'pointer', flexShrink: 0 }}>
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.webp"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleScanDocument(type, file);
                                  e.target.value = '';
                                }}
                              />
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 6, border: '1px solid var(--color-primary)', fontSize: 12, cursor: 'pointer', color: 'var(--color-primary)', background: 'rgba(var(--color-primary-rgb, 199,169,105), 0.08)' }}>
                                <ScanText size={12} /> Scan
                              </span>
                            </label>
                          </>
                        )}
                        {doc && !pendingDoc && (
                          <button
                            type="button"
                            onClick={() => handleDeleteDocument(doc.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)', padding: 4, flexShrink: 0 }}
                              title="Delete document"
                              aria-label="Delete document"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                      </div>
                      {doc && hasMeta && (
                        <div style={{ padding: '6px 12px', borderTop: '1px solid var(--color-border)', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                          {type === 'permit' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <label style={{ fontSize: 12, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>Permit #:</label>
                              <input
                                type="text"
                                value={doc.permit_number || ''}
                                onBlur={(e) => handleUpdateDocument(doc.id, { permit_number: e.target.value || null })}
                                placeholder="e.g. 12345"
                                style={{ fontSize: 12, padding: '3px 6px', borderRadius: 4, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', width: 100 }}
                              />
                            </div>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <label style={{ fontSize: 12, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>Expiry:</label>
                            <input
                              type="date"
                              value={doc.expiry_date ? doc.expiry_date.split('T')[0] : ''}
                              onChange={(e) => handleUpdateDocument(doc.id, { expiry_date: e.target.value || null })}
                              style={{ fontSize: 12, padding: '3px 6px', borderRadius: 4, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSave} loading={saving}>{editId ? 'Update' : 'Create'}</Button>
            </div>
          </div>
        </Modal>
      )}

      <Modal isOpen={!!viewTarget} onClose={() => setViewTarget(null)} title="View Unit" className="modal-lg">
        {viewTarget && (
          <>
            <div className="admin-detail-grid">
              <div><strong>Building:</strong></div><div>{viewTarget.building_name || '—'}</div>
              <div><strong>Landlord:</strong></div><div>{viewTarget.landlord_name || '—'}</div>
              <div><strong>Apartment #:</strong></div><div>{viewTarget.apartment_number || '—'}</div>
              <div><strong>Apartment Type:</strong></div><div>{viewTarget.property_type || '—'}</div>
              <div><strong>House Type:</strong></div><div>{viewTarget.house_type || '—'}</div>
              <div><strong>Internet Provider:</strong></div><div>{viewTarget.internet_provider || '—'}</div>
              <div><strong>Internet Account #:</strong></div><div>{viewTarget.internet_account_number || '—'}</div>
              <div><strong>DEWA Premises #:</strong></div><div>{viewTarget.dewa_premises_number || '—'}</div>
              <div><strong>DEWA Account #:</strong></div><div>{viewTarget.dewa_account_number || '—'}</div>
              <div><strong>Utility Bills Paid By:</strong></div><div>{viewTarget.utility_bills_paid_by || '—'}</div>
              <div><strong>Floor:</strong></div><div>{viewTarget.floor || '—'}</div>
              <div><strong>WiFi Username:</strong></div><div>{viewTarget.wifi_username || '—'}</div>
              <div><strong>WiFi Password:</strong></div><div>{viewTarget.wifi_password || '—'}</div>
              <div><strong>Bedrooms:</strong></div><div>{viewTarget.bedrooms ?? '—'}</div>
              <div><strong>Bathrooms:</strong></div><div>{viewTarget.bathrooms ?? '—'}</div>
              <div><strong>Parking Spots:</strong></div><div>{viewTarget.parking_spots ?? '—'}</div>
              <div><strong>Parking Spot Numbers:</strong></div><div>{viewTarget.parking_spot_numbers || '—'}</div>
              <div><strong>Commission:</strong></div><div>{viewTarget.commission_percent != null ? `${viewTarget.commission_percent}%` : '—'}</div>
              <div><strong>Guest Capacity:</strong></div><div>{viewTarget.max_guests || '—'}</div>
              <div><strong>Area:</strong></div><div>{fmtNum(viewTarget.size_sqft)} sqft{viewTarget.size_sqm ? ` / ${fmtNum(viewTarget.size_sqm)} sqm` : ''}</div>
              <div><strong>Listing Status:</strong></div>
              <div>
                {viewTarget.listing_status ? (
                  <Badge variant={statusBadgeVariant(viewTarget.listing_status)} size="sm">{viewTarget.listing_status}</Badge>
                ) : (
                  '—'
                )}
              </div>
              <div><strong>Description:</strong></div>
              <div style={{ gridColumn: '1 / -1', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {viewTarget.description || '—'}
              </div>
            </div>
            <ViewUnitDocs unitId={viewTarget.id} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20, borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
              <Button variant="ghost" onClick={() => setViewTarget(null)}>Close</Button>
              <Button variant="secondary" icon={<ExternalLink size={14} />} onClick={() => viewTarget.listing_id ? editListing(viewTarget) : createListing(viewTarget)}>
                {viewTarget.listing_status ? 'Edit Listing' : 'Create Listing'}
              </Button>
              <Button variant="primary" icon={<Pencil size={14} />} onClick={() => { const u = viewTarget; setViewTarget(null); openEdit(u); }}>Edit</Button>
            </div>
          </>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Unit"
        message={`Are you sure you want to delete Apartment ${deleteTarget?.apartment_number || ''}${deleteTarget?.building_name ? ` at ${deleteTarget.building_name}` : ''}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />

      {showImportModal && (
        <Modal isOpen={showImportModal} onClose={() => setShowImportModal(false)} title="Bulk Import Units" className="modal-md">
          <div style={{ marginBottom: 16 }}>
            <button
              type="button"
              onClick={downloadTemplate}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 8,
                border: '1.5px solid var(--color-border)', background: 'var(--color-surface)',
                color: 'var(--color-primary)', fontSize: 13, cursor: 'pointer',
              }}
            >
              <Download size={14} /> Download CSV Template
            </button>
            <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--color-text-muted)' }}>
              Fill in the template and upload it below. Units with duplicate apartment numbers in the same building will be skipped.
            </p>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 13 }}>Select CSV File</label>
            <input
              type="file"
              accept=".csv"
              onChange={e => setImportFile(e.target.files?.[0] || null)}
              style={{ fontSize: 13 }}
            />
          </div>

          {importResult && (
            <div style={{ padding: 12, borderRadius: 8, background: 'var(--color-surface-secondary)', marginBottom: 16, fontSize: 13 }}>
              <p style={{ margin: '0 0 4px', fontWeight: 600 }}>{importResult.message}</p>
              {importResult.errors?.length > 0 && (
                <ul style={{ margin: '8px 0 0', paddingInlineStart: 20, maxHeight: 150, overflow: 'auto' }}>
                  {importResult.errors.map((e, i) => (
                    <li key={i} style={{ color: 'var(--color-error)', marginBottom: 2 }}>{e.row} — {e.message}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="flex gap-3" style={{ justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setShowImportModal(false)}>Close</Button>
            <Button variant="primary" onClick={handleImport} loading={importing} disabled={importing || !importFile}>
              {importing ? 'Importing...' : 'Import'}
            </Button>
          </div>
        </Modal>
      )}

      {/* OCR Scan Review Modal */}
      <Modal isOpen={scanReviewOpen} onClose={handleScanClose} title="Scan Result — Review Fields" className="modal-lg">
        {scanLoading ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Scanning document… extracting text with OCR.</p>
          </div>
        ) : scanResult ? (
          <div>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 12 }}>
              Extracted from <strong>{scanningDoc === 'title_deed' ? 'Title Deed' : scanningDoc === 'contract' ? 'Contract' : 'DTCM Permit'}</strong>.
              Edit any field below before confirming.
            </p>
            {scanningDoc === 'title_deed' && scanResult?.fields?.building_name && (
              <>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 12 }}>
                  {matchedScanBuilding ? (
                    <>Building matched: <strong>{matchedScanBuilding.name}</strong> — will auto-link on save. — Arabic name will be applied if you check "Apply Arabic names".</>
                  ) : (
                    <>No matching building for "{scanResult.fields.building_name}" — you'll pick it manually.</>
                  )}
                </p>
                <label style={{ fontSize: 13, color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <input
                    type="checkbox"
                    checked={applyArabic}
                    onChange={(e) => setApplyArabic(e.target.checked)}
                  />
                  Apply Arabic names to matched records
                </label>
              </>
            )}
            {scanResult?.fields?._error && (
              <p style={{ fontSize: 12, color: '#b45309', background: 'rgba(180,83,9,0.08)', padding: '6px 10px', borderRadius: 6, marginBottom: 12 }}>
                {scanResult.fields._error}
              </p>
            )}
            <div className="flex flex-col gap-3" style={{ maxHeight: 400, overflow: 'auto' }}>
              {Object.entries(scanResult.fields || {}).filter(([k]) => !k.startsWith('_')).map(([key, value]) => (
                <div key={key}>
                  <label style={{ display: 'block', marginBottom: 2, fontWeight: 500, fontSize: 12, textTransform: 'capitalize' }}>
                    {key.replace(/_/g, ' ')}
                  </label>
                  <input
                    type={key.includes('date') ? 'date' : 'text'}
                    value={value || ''}
                    onChange={(e) => {
                      setScanResult(prev => ({
                        ...prev,
                        fields: { ...prev.fields, [key]: e.target.value },
                      }));
                    }}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
              ))}
            </div>
            {scanResult.rawText && (
              <details style={{ marginTop: 12 }}>
                <summary style={{ fontSize: 12, color: 'var(--color-text-muted)', cursor: 'pointer' }}>Show raw OCR text</summary>
                <pre style={{ fontSize: 11, background: 'var(--color-surface-secondary)', padding: 8, borderRadius: 6, maxHeight: 150, overflow: 'auto', whiteSpace: 'pre-wrap', marginTop: 6 }}>{scanResult.rawText}</pre>
              </details>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16, borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
              <Button variant="ghost" onClick={handleScanClose}>Cancel</Button>
              <Button variant="primary" icon={<ScanText size={14} />} onClick={handleScanConfirm}>Upload & Save</Button>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>No scan result.</p>
        )}
      </Modal>
    </>
  );
}