import { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2, Upload, Download, Eye } from 'lucide-react';
import { adminApi } from '../../utils/api';
import AdminTablePage from '../../components/admin/AdminTablePage';
import Button from '../../components/public/Button';
import { useAdminToast } from '../../hooks/useAdminToast';
import Modal from '../../components/public/Modal';
import RowActions from '../../components/admin/RowActions';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

const emptyForm = {
  name: '', name_ar: '', management_email: '', makani: '', contact_number: '',
  floors: '', address: '', city: 'Dubai', security_contact: '',
  gas_company_name: '', gas_company_number: '', plus_code: '', plot_number: '',
};

export default function AdminBuildings() {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(25);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useAdminToast();

  const fetchData = async () => {
    try {
      const params = { page, limit: perPage, search: search || undefined };
      if (cityFilter) params.city = cityFilter;
      const { data } = await adminApi.get('/buildings', { params });
      setBuildings(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch {
      toast.error('Failed to load buildings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, perPage, search, cityFilter]);

  const openAdd = () => { setEditId(null); setForm(emptyForm); setShowForm(true); };

  const openEdit = (b) => {
    setEditId(b.id);
    setForm({
      name: b.name || '', name_ar: b.name_ar || '', management_email: b.management_email || '',
      makani: b.makani || '', contact_number: b.contact_number || '',
      floors: b.floors || '', address: b.address || '', city: b.city || 'Dubai',
      security_contact: b.security_contact || '', gas_company_name: b.gas_company_name || '',
      gas_company_number: b.gas_company_number || '', plus_code: b.plus_code || '',
      plot_number: b.plot_number || '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name) { toast.error('Building name is required'); return; }
    setSaving(true);
    try {
      if (editId) {
        await adminApi.put(`/buildings/${editId}`, form);
        toast.success('Building updated');
      } else {
        await adminApi.post('/buildings', form);
        toast.success('Building added');
      }
      setShowForm(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save building');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.delete(`/buildings/${deleteTarget.id}`);
      toast.success('Building deleted');
      setDeleteTarget(null);
      if (buildings.length === 1 && page > 1) {
        setPage(p => p - 1);
      } else {
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete building');
    }
  };

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const downloadTemplate = () => {
    const headers = ['name', 'name_ar', 'management_email', 'makani', 'contact_number', 'floors', 'address', 'city', 'security_contact', 'gas_company_name', 'gas_company_number', 'plus_code'];
    const example = ['Marina Heights Tower', 'برج مارينا', 'mgmt@example.com', '12345', '+97141234567', '40', 'Marina Walk', 'Dubai', '+971509999999', 'Emirates Gas', '800Gas', '6CC5+R6'];
    const csv = headers.join(',') + '\n' + example.join(',') + '\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'buildings-template.csv';
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
      const { data } = await adminApi.post('/buildings/bulk-import', formData, {
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

  return (
    <>
      <AdminTablePage
        title="Buildings"
        actions={[
          { label: 'Bulk Import', icon: <Upload size={16} />, onClick: () => { setShowImportModal(true); setImportFile(null); setImportResult(null); } },
          { label: 'Add Building', icon: <Plus size={16} />, onClick: openAdd },
        ]}
        loading={loading}
        items={buildings}
        rowKey="id"
        columns={[
          { label: 'Name', render: (b) => (
            <>
              <div className="font-medium">{b.name}</div>
              {b.name_ar && <div className="text-secondary" style={{ fontSize: 'var(--text-xs)' }}>{b.name_ar}</div>}
            </>
          ) },
          { label: 'City', render: (b) => b.city },
          { label: 'Contact', render: (b) => b.contact_number || '—' },
          { label: 'Floors', render: (b) => b.floors || '—' },
          { label: 'Units', align: 'center', render: (b) => b.unit_count || 0 },
          { label: 'Actions', align: 'right', render: (b) => (
            <RowActions actions={[
              { label: 'View', icon: Eye, onClick: () => setViewTarget(b) },
              { label: 'Edit', icon: Pencil, onClick: () => openEdit(b) },
              { label: 'Delete', icon: Trash2, onClick: () => setDeleteTarget(b), variant: 'danger' },
            ]} />
          ) },
        ]}
        search={{ value: search, placeholder: 'Search buildings...', onChange: (v) => { setSearch(v); setPage(1); } }}
        filters={[
          { label: 'City', placeholder: 'All Cities', value: cityFilter, onChange: (v) => { setCityFilter(v); setPage(1); }, options: [{ value: 'Dubai', label: 'Dubai' }, { value: 'Abu Dhabi', label: 'Abu Dhabi' }] },
        ]}
        count={total}
        countLabel={(n) => (n === 1 ? 'building' : 'buildings')}
        empty={{ icon: <Search size={24} />, title: 'No buildings found', hint: 'Get started by adding your first building.' }}
        pagination={{ page, totalPages, total, perPage, onPerPageChange: (n) => { setPerPage(n); setPage(1); }, onChange: setPage }}
      />

      {showForm && (
        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editId ? 'Edit Building' : 'Add Building'} className="modal-lg">
            <div className="flex flex-col gap-4">
              <div className="form-row">
                <div className="form-group form-group-grow">
                  <label className="admin-label">Building Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} className="admin-input" />
                </div>
                <div className="form-group form-group-grow">
                  <label className="admin-label">Building Name (Arabic)</label>
                  <input name="name_ar" value={form.name_ar} onChange={handleChange} dir="rtl" className="admin-input" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group form-group-grow">
                  <label className="admin-label">Management Email</label>
                  <input name="management_email" type="email" value={form.management_email} onChange={handleChange} className="admin-input" />
                </div>
                <div className="form-group form-group-grow">
                  <label className="admin-label">Makani</label>
                  <input name="makani" value={form.makani} onChange={handleChange} className="admin-input" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group form-group-grow">
                  <label className="admin-label">Contact Number</label>
                  <input name="contact_number" value={form.contact_number} onChange={handleChange} className="admin-input" />
                </div>
                <div className="form-group form-group-grow">
                  <label className="admin-label">Plot Number</label>
                  <input name="plot_number" value={form.plot_number} onChange={handleChange} className="admin-input" />
                </div>
              </div>
              <div className="form-group">
                <label className="admin-label">Address</label>
                <input name="address" value={form.address} onChange={handleChange} className="admin-input" />
              </div>
              <div className="form-row">
                <div className="form-group form-group-grow">
                  <label className="admin-label">City</label>
                  <input name="city" value={form.city} onChange={handleChange} className="admin-input" />
                </div>
                <div className="form-group form-group-grow">
                  <label className="admin-label">Plus Code</label>
                  <input name="plus_code" value={form.plus_code} onChange={handleChange} className="admin-input" />
                </div>
              </div>
              <div className="form-group">
                <label className="admin-label">Security Contact Number</label>
                <input name="security_contact" value={form.security_contact} onChange={handleChange} className="admin-input" />
              </div>
              <div className="form-row">
                <div className="form-group form-group-grow">
                  <label className="admin-label">Gas Company Name</label>
                  <input name="gas_company_name" value={form.gas_company_name} onChange={handleChange} className="admin-input" />
                </div>
                <div className="form-group form-group-grow">
                  <label className="admin-label">Gas Company Number</label>
                  <input name="gas_company_number" value={form.gas_company_number} onChange={handleChange} className="admin-input" />
                </div>
              </div>
              <div className="flex gap-3" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
                <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleSave} loading={saving}>{editId ? 'Update' : 'Create'}</Button>
              </div>
            </div>
          </Modal>
      )}

      {showImportModal && (
        <Modal isOpen={showImportModal} onClose={() => setShowImportModal(false)} title="Bulk Import Buildings" className="modal-md">
            
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
                Fill in the template and upload it below. Buildings with duplicate names will be skipped.
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

      <Modal isOpen={!!viewTarget} onClose={() => setViewTarget(null)} title="View Building" className="modal-lg">
        {viewTarget && (
          <>
            <div className="admin-detail-grid">
              <div><strong>Building Name:</strong></div><div>{viewTarget.name}</div>
              {viewTarget.name_ar && <><div><strong>Name (AR):</strong></div><div dir="rtl">{viewTarget.name_ar}</div></>}
              <div><strong>City:</strong></div><div>{viewTarget.city || '—'}</div>
              <div><strong>Floors:</strong></div><div>{viewTarget.floors || '—'}</div>
              <div><strong>Management Email:</strong></div><div>{viewTarget.management_email || '—'}</div>
              <div><strong>Contact Number:</strong></div><div>{viewTarget.contact_number || '—'}</div>
              <div><strong>Makani:</strong></div><div>{viewTarget.makani || '—'}</div>
              <div><strong>Address:</strong></div><div style={{ gridColumn: '1 / -1' }}>{viewTarget.address || '—'}</div>
              <div><strong>Security Contact:</strong></div><div>{viewTarget.security_contact || '—'}</div>
              <div><strong>Gas Company:</strong></div><div>{viewTarget.gas_company_name || '—'}{viewTarget.gas_company_number ? ` (${viewTarget.gas_company_number})` : ''}</div>
              <div><strong>Plus Code:</strong></div><div>{viewTarget.plus_code || '—'}</div>
              <div><strong>Units:</strong></div><div>{viewTarget.unit_count || 0}</div>
            </div>
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
        title="Delete Building"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}
