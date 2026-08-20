import { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2, Key, Upload, Download, Eye, FileText, ScanText } from 'lucide-react';
import { adminApi } from '../../utils/api';
import Button from '../../components/public/Button';
import { useAdminToast } from '../../hooks/useAdminToast';
import Modal from '../../components/public/Modal';
import RowActions from '../../components/admin/RowActions';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import AdminTablePage from '../../components/admin/AdminTablePage';

const emptyForm = {
  full_name: '', email: '', phone: '', identity_number: '', passport_number: '', nationality: '',
  is_active: 1, send_welcome_email: 0, password: '', date_of_birth: '',
  bank_name: '', bank_account_holder: '', bank_account_number: '',
  swift_code: '', iban: '', bank_branch: '', bank_account_currency: '', bank_address: '',
};

export default function AdminLandlords() {
  const [landlords, setLandlords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(25);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [pendingDocs, setPendingDocs] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [scanningDoc, setScanningDoc] = useState(null); // which doc type is being scanned
  const [scanResult, setScanResult] = useState(null);   // OCR extracted fields
  const [scanFile, setScanFile] = useState(null);        // file being scanned
  const [scanLoading, setScanLoading] = useState(false);
  const [scanReviewOpen, setScanReviewOpen] = useState(false);
  const toast = useAdminToast();

  const fetchData = async () => {
    try {
      const params = { page, limit: perPage, search: search || undefined };
      if (activeFilter !== '') params.is_active = activeFilter;
      const { data } = await adminApi.get('/landlords', { params });
      setLandlords(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch {
      toast.error('Failed to load landlords');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, perPage, search, activeFilter]);

  const openAdd = () => { setEditId(null); setForm(emptyForm); setDocuments([]); setPendingDocs([]); setShowForm(true); };

  const openEdit = (l) => {
    setEditId(l.id);
    setForm({
      full_name: l.full_name || '', email: l.email || '', phone: l.phone || '',
      identity_number: l.identity_number || '', passport_number: l.passport_number || '', nationality: l.nationality || '',
      is_active: l.is_active ?? 1, send_welcome_email: l.send_welcome_email ?? 0, password: '',
      date_of_birth: l.date_of_birth ? l.date_of_birth.split('T')[0] : '',
      bank_name: l.bank_name || '', bank_account_holder: l.bank_account_holder || '',
      bank_account_number: l.bank_account_number || '', swift_code: l.swift_code || '',
      iban: l.iban || '', bank_branch: l.bank_branch || '',
      bank_account_currency: l.bank_account_currency || '', bank_address: l.bank_address || '',
    });
    setShowForm(true);
    setShowPasswordReset(false);
    fetchDocuments(l.id);
  };

  const fetchDocuments = async (landlordId) => {
    try {
      const { data } = await adminApi.get(`/landlords/${landlordId}/documents`);
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
      await adminApi.post(`/landlords/${editId}/documents`, formData, {
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
      await adminApi.delete(`/landlords/${editId}/documents/${docId}`);
      toast.success('Document deleted');
      fetchDocuments(editId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete document');
    }
  };

  const handleUpdateDocument = async (docId, updates) => {
    if (!editId) return;
    try {
      await adminApi.patch(`/landlords/${editId}/documents/${docId}`, updates);
      fetchDocuments(editId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update document');
    }
  };

  const handleScanDocument = async (type, file) => {
    if (!file) return;
    setScanningDoc(type);
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
    // Upload the document with expiry date from OCR
    const expiryDate = scanResult?.fields?.expiry_date || null;
    await handleUploadDocument(scanningDoc, scanFile, expiryDate);
    // Auto-fill form fields from scan result.
    // Emirates ID is the priority source: it overwrites shared fields even if a
    // passport scan was confirmed earlier. Passport never replaces existing data.
    if (scanResult?.fields) {
      const f = scanResult.fields;
      const isEid = scanningDoc === 'emirates_id';
      setForm(prev => ({
        ...prev,
        full_name: isEid ? (f.full_name || prev.full_name) : (prev.full_name || f.full_name),
        nationality: isEid ? (f.nationality || prev.nationality) : (prev.nationality || f.nationality),
        date_of_birth: isEid ? (f.date_of_birth || prev.date_of_birth) : (prev.date_of_birth || f.date_of_birth),
        identity_number: (isEid ? f.identity_number : null) || prev.identity_number,
        passport_number: (scanningDoc === 'passport' ? f.passport_number : null) || prev.passport_number,
      }));
      toast.success('Fields auto-filled from document. Review before saving.');
    }
    setScanReviewOpen(false);
    setScanResult(null);
    setScanFile(null);
    setScanningDoc(null);
  };

  const handleScanClose = () => {
    setScanReviewOpen(false);
    setScanResult(null);
    setScanFile(null);
    setScanningDoc(null);
  };

  const handleSave = async () => {
    if (!form.full_name || !form.email) { toast.error('Full name and email are required'); return; }
    setSaving(true);
    try {
      if (editId) {
        const data = { ...form };
        if (!data.password) delete data.password;
        await adminApi.put(`/landlords/${editId}`, data);
        toast.success('Landlord updated');
      } else {
        const { data } = await adminApi.post('/landlords', form);
        const newId = data?.id;
        if (newId && pendingDocs.length > 0) {
          for (const pd of pendingDocs) {
            try {
              const fd = new FormData();
              fd.append('document', pd.file);
              fd.append('type', pd.type);
              if (pd.expiryDate) fd.append('expiry_date', pd.expiryDate);
              await adminApi.post(`/landlords/${newId}/documents`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
              });
            } catch (err) {
              toast.error(err.response?.data?.message || `Failed to upload ${pd.type} document`);
            }
          }
          setPendingDocs([]);
          toast.success('Pending documents uploaded');
        }
        toast.success('Landlord added');
      }
      setShowForm(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save landlord');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.delete(`/landlords/${deleteTarget.id}`);
      toast.success('Landlord deleted');
      setDeleteTarget(null);
      if (landlords.length === 1 && page > 1) {
        setPage(p => p - 1);
      } else {
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete landlord');
    }
  };

  const handlePasswordReset = async () => {
    if (!newPassword || newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    try {
      await adminApi.put(`/landlords/${editId}/password`, { password: newPassword });
      toast.success('Password updated');
      setShowPasswordReset(false);
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? (checked ? 1 : 0) : value }));
  };

  const downloadTemplate = () => {
    const headers = ['full_name', 'email', 'phone', 'nationality', 'identity_number', 'passport_number', 'bank_name', 'iban', 'bank_account_number', 'swift_code', 'bank_branch', 'bank_account_holder'];
    const example = ['John Smith', 'john@example.com', '+971501234567', 'British', '12345678', 'N12345678', 'Emirates NBD', 'AE123456789012345678901', '1234567890', 'EBILAEAD', 'Main Branch', 'John Smith'];
    const csv = headers.join(',') + '\n' + example.join(',') + '\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'landlords-template.csv';
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
      const { data } = await adminApi.post('/landlords/bulk-import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImportResult(data);
      toast.success(data.message);
      if (data.imported > 0) fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const docLabels = { emirates_id: 'Emirates ID', passport: 'Passport', id_passport: 'ID / Passport', contract: 'Contract' };

function ViewLandlordDocs({ landlordId }) {
  const [docs, setDocs] = useState([]);
  useEffect(() => {
    if (!landlordId) return;
    adminApi.get(`/landlords/${landlordId}/documents`).then(({ data }) => setDocs(data)).catch(() => {});
  }, [landlordId]);

  if (docs.length === 0) return null;

  return (
    <>
      <h4 style={{ margin: '16px 0 8px', fontSize: 14, fontWeight: 600, opacity: 0.7 }}>Documents</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
        {docs.map(doc => (
          <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 6 }}>
            <FileText size={14} style={{ opacity: 0.4, flexShrink: 0 }} />
            <span style={{ fontWeight: 500 }}>{docLabels[doc.document_type] || doc.document_type}</span>
            <span style={{ color: 'var(--color-text-muted)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              {doc.document_url.split('/').pop()}
            </span>
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

  const columns = [
    { label: 'Name', render: (l) => <span className="font-medium">{l.full_name}</span> },
    { label: 'Email', render: (l) => l.email },
    { label: 'Phone', render: (l) => l.phone || '—' },
    { label: 'Nationality', render: (l) => l.nationality || '—' },
    {
      label: 'Active',
      align: 'center',
      render: (l) => (
        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: l.is_active ? 'var(--color-success)' : 'var(--color-error)' }} />
      ),
    },
    { label: 'Units', align: 'center', render: (l) => l.unit_count || 0 },
    {
      label: 'Actions',
      align: 'right',
      render: (l) => (
        <RowActions actions={[
          { label: 'View', icon: Eye, onClick: () => setViewTarget(l) },
          { label: 'Edit', icon: Pencil, onClick: () => openEdit(l) },
          { label: 'Delete', icon: Trash2, onClick: () => setDeleteTarget(l), variant: 'danger' },
        ]} />
      ),
    },
  ];

  return (
    <>
      <AdminTablePage
        title="Landlords"
        actions={[
          { label: 'Bulk Import', icon: <Upload size={16} />, onClick: () => { setShowImportModal(true); setImportFile(null); setImportResult(null); } },
          { label: 'Add Landlord', icon: <Plus size={16} />, onClick: openAdd },
        ]}
        loading={loading}
        items={landlords}
        rowKey="id"
        columns={columns}
        search={{ value: search, placeholder: 'Search landlords...', onChange: (v) => { setSearch(v); setPage(1); } }}
        filters={[
          {
            label: 'Status',
            value: activeFilter,
            onChange: (v) => { setActiveFilter(v); setPage(1); },
            options: [
              { value: '1', label: 'Active' },
              { value: '0', label: 'Inactive' },
            ],
          },
        ]}
        count={total}
        countLabel={(n) => (n === 1 ? 'landlord' : 'landlords')}
        empty={{
          icon: <Search size={24} />,
          title: 'No landlords found',
          hint: 'Get started by adding your first landlord.',
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
        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editId ? 'Edit Landlord' : 'Add Landlord'} className="modal-lg">
            <div className="flex flex-col gap-4">
              {/* Personal Info */}
              <div>
                <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, opacity: 0.7 }}>Personal Info</h4>
                <div className="form-row">
                  <div className="form-group form-group-grow">
                    <label className="admin-label">Full Name *</label>
                    <input name="full_name" value={form.full_name} onChange={handleChange} className="admin-input" />
                  </div>
                  <div className="form-group form-group-grow">
                    <label className="admin-label">Email *</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} className="admin-input" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group form-group-grow">
                    <label className="admin-label">Phone</label>
                    <input name="phone" value={form.phone} onChange={handleChange} className="admin-input" />
                  </div>
                  <div className="form-group form-group-grow">
                    <label className="admin-label">Identity Number</label>
                    <input name="identity_number" value={form.identity_number} onChange={handleChange} className="admin-input" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group form-group-grow">
                    <label className="admin-label">Nationality</label>
                    <input name="nationality" value={form.nationality} onChange={handleChange} className="admin-input" />
                  </div>
                  <div className="form-group form-group-grow">
                    <label className="admin-label">Date of Birth</label>
                    <input name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} className="admin-input" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group form-group-grow">
                    <label className="admin-label">Passport Number</label>
                    <input name="passport_number" value={form.passport_number} onChange={handleChange} className="admin-input" />
                  </div>
                  <div className="form-group form-group-grow" />
                </div>
                <div className="form-row">
                  <div className="form-group" style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 16 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                      <input type="checkbox" name="is_active" checked={form.is_active === 1} onChange={handleChange} /> Active
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                      <input type="checkbox" name="send_welcome_email" checked={form.send_welcome_email === 1} onChange={handleChange} /> Send Welcome Email
                    </label>
                  </div>
                </div>
                {!editId && (
                  <div className="form-group">
                    <label className="admin-label">Password</label>
                    <input name="password" type="password" value={form.password} onChange={handleChange} className="admin-input" placeholder="Leave blank for no login" />
                  </div>
                )}
              </div>

              {/* Bank Details */}
              <div>
                <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, opacity: 0.7 }}>Bank Details</h4>
                <div className="form-row">
                  <div className="form-group form-group-grow">
                    <label className="admin-label">Bank Name</label>
                    <input name="bank_name" value={form.bank_name} onChange={handleChange} className="admin-input" />
                  </div>
                  <div className="form-group form-group-grow">
                    <label className="admin-label">Account Holder</label>
                    <input name="bank_account_holder" value={form.bank_account_holder} onChange={handleChange} className="admin-input" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group form-group-grow">
                    <label className="admin-label">Account Number</label>
                    <input name="bank_account_number" value={form.bank_account_number} onChange={handleChange} className="admin-input" />
                  </div>
                  <div className="form-group form-group-grow">
                    <label className="admin-label">SWIFT Code</label>
                    <input name="swift_code" value={form.swift_code} onChange={handleChange} className="admin-input" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group form-group-grow">
                    <label className="admin-label">IBAN</label>
                    <input name="iban" value={form.iban} onChange={handleChange} className="admin-input" />
                  </div>
                  <div className="form-group form-group-grow">
                    <label className="admin-label">Bank Branch</label>
                    <input name="bank_branch" value={form.bank_branch} onChange={handleChange} className="admin-input" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group form-group-grow">
                    <label className="admin-label">Account Currency</label>
                    <input name="bank_account_currency" value={form.bank_account_currency} onChange={handleChange} className="admin-input" placeholder="e.g. AED" />
                  </div>
                  <div className="form-group form-group-grow" />
                </div>
                <div className="form-group">
                  <label className="admin-label">Bank Address</label>
                  <textarea name="bank_address" rows={3} value={form.bank_address} onChange={handleChange} className="admin-textarea" />
                </div>
              </div>

              {/* Documents */}
              <div>
                <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, opacity: 0.7 }}>Documents</h4>
                <div className="flex flex-col gap-3">
                  {[
                    { type: 'emirates_id', label: 'Emirates ID' },
                    { type: 'passport', label: 'Passport' },
                  ].map(({ type, label }) => {
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
                        {doc && (
                          <div style={{ padding: '6px 12px', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <label style={{ fontSize: 12, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>Expiry Date:</label>
                            <input
                              type="date"
                              value={doc.expiry_date ? doc.expiry_date.split('T')[0] : ''}
                              onChange={(e) => handleUpdateDocument(doc.id, { expiry_date: e.target.value || null })}
                              style={{ fontSize: 12, padding: '3px 6px', borderRadius: 4, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Password Reset (edit mode) */}
              {editId && (
                <div>
                  <button type="button" onClick={() => setShowPasswordReset(!showPasswordReset)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-primary)', padding: 0 }}>
                    <Key size={14} /> Reset Password
                  </button>
                  {showPasswordReset && (
                    <div className="form-row" style={{ marginTop: 8 }}>
                      <div className="form-group form-group-grow">
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password" className="admin-input" />
                      </div>
                      <Button variant="secondary" onClick={handlePasswordReset}>Update Password</Button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
                <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleSave} loading={saving}>{editId ? 'Update' : 'Create'}</Button>
              </div>
            </div>
        </Modal>
      )}

      {showImportModal && (
        <Modal isOpen={showImportModal} onClose={() => setShowImportModal(false)} title="Bulk Import Landlords" className="modal-md">
            
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
                Fill in the template and upload it below. Landlords with duplicate emails will be skipped.
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

      <Modal isOpen={!!viewTarget} onClose={() => setViewTarget(null)} title="View Landlord" className="modal-lg">
        {viewTarget && (
          <>
            <div className="admin-detail-grid">
              <div><strong>Full Name:</strong></div><div>{viewTarget.full_name}</div>
              <div><strong>Email:</strong></div><div>{viewTarget.email}</div>
              <div><strong>Phone:</strong></div><div>{viewTarget.phone || '—'}</div>
              <div><strong>Nationality:</strong></div><div>{viewTarget.nationality || '—'}</div>
              <div><strong>Date of Birth:</strong></div><div>{viewTarget.date_of_birth ? new Date(viewTarget.date_of_birth).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</div>
              <div><strong>Identity Number:</strong></div><div>{viewTarget.identity_number || '—'}</div>
              <div><strong>Passport Number:</strong></div><div>{viewTarget.passport_number || '—'}</div>
              <div><strong>Active:</strong></div><div>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: viewTarget.is_active ? 'var(--color-success)' : 'var(--color-error)', marginRight: 6 }} />
                {viewTarget.is_active ? 'Yes' : 'No'}
              </div>
              <div><strong>Units:</strong></div><div>{viewTarget.unit_count || 0}</div>
            </div>
            {(viewTarget.bank_name || viewTarget.iban) && (
              <>
                <h4 style={{ margin: '16px 0 8px', fontSize: 14, fontWeight: 600, opacity: 0.7 }}>Bank Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', fontSize: 13 }}>
                  <div><strong>Bank Name:</strong></div><div>{viewTarget.bank_name || '—'}</div>
                  <div><strong>IBAN:</strong></div><div>{viewTarget.iban || '—'}</div>
                </div>
              </>
            )}
            <ViewLandlordDocs landlordId={viewTarget.id} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20, borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
              <Button variant="ghost" onClick={() => setViewTarget(null)}>Close</Button>
              <Button variant="primary" icon={<Pencil size={14} />} onClick={() => { setViewTarget(null); openEdit(viewTarget); }}>Edit</Button>
            </div>
          </>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Landlord"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />

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
              Extracted from <strong>{scanningDoc === 'emirates_id' ? 'Emirates ID' : 'Passport'}</strong>.
              Edit any field below before confirming.
            </p>
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
              <Button variant="primary" icon={<ScanText size={14} />} onClick={handleScanConfirm}>Upload & Auto-fill</Button>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>No scan result.</p>
        )}
      </Modal>
    </>
  );
}
