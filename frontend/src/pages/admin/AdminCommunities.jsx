import { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { adminApi } from '../../utils/api';
import AdminTablePage from '../../components/admin/AdminTablePage';
import Button from '../../components/public/Button';
import Input from '../../components/public/Input';
import { useAdminToast } from '../../hooks/useAdminToast';
import Modal from '../../components/public/Modal';
import RowActions from '../../components/admin/RowActions';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

const EMPTY_FORM = {
  code: '',
  name: '',
  sector_number: 1,
  management_email: '',
  makani: '',
  contact_number: '',
  address: '',
  city: 'Dubai',
  security_contact: '',
  gas_company_name: '',
  gas_company_number: '',
  plus_code: '',
  latitude: '',
  longitude: '',
};

export default function AdminCommunities() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [section, setSection] = useState('basic'); // 'basic' | 'operations' | 'gas' | 'coords'
  const toast = useAdminToast();
  const [viewTarget, setViewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(25);
  const [cityFilter, setCityFilter] = useState('');

  const fetchCommunities = async () => {
    try {
      const params = { page, limit: perPage };
      if (search) params.search = search;
      if (cityFilter) params.city = cityFilter;
      const { data } = await adminApi.get('/communities', { params });
      setCommunities(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch {
      toast.error('Failed to load communities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCommunities(); }, [page, perPage, search, cityFilter]);

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setSection('basic');
    setShowForm(true);
  };

  const openEdit = (c) => {
    setEditId(c.id);
    setForm({
      code: c.code || '',
      name: c.name || '',
      sector_number: c.sector_number || 1,
      management_email: c.management_email || '',
      makani: c.makani || '',
      contact_number: c.contact_number || '',
      address: c.address || '',
      city: c.city || 'Dubai',
      security_contact: c.security_contact || '',
      gas_company_name: c.gas_company_name || '',
      gas_company_number: c.gas_company_number || '',
      plus_code: c.plus_code || '',
      latitude: c.latitude || '',
      longitude: c.longitude || '',
    });
    setSection('basic');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.name) { toast.error('Code and name are required'); return; }
    try {
      const payload = {
        ...form,
        sector_number: Number(form.sector_number),
        latitude: form.latitude !== '' ? Number(form.latitude) : null,
        longitude: form.longitude !== '' ? Number(form.longitude) : null,
      };
      if (editId) {
        await adminApi.put(`/communities/${editId}`, payload);
        toast.success('Community updated');
      } else {
        await adminApi.post('/communities', payload);
        toast.success('Community added');
      }
      setShowForm(false);
      fetchCommunities();
    } catch {
      toast.error('Failed to save community');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.delete(`/communities/${deleteTarget.id}`);
      toast.success('Community deleted');
      setDeleteTarget(null);
      fetchCommunities();
    } catch {
      toast.error('Failed to delete community');
    }
  };

  const updateField = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const formSections = [
    { key: 'basic', label: 'Basic Info' },
    { key: 'operations', label: 'Operations' },
    { key: 'gas', label: 'Gas & Security' },
    { key: 'coords', label: 'Coordinates' },
  ];

  return (
    <>
      <AdminTablePage
        title="Communities"
        actions={[{ label: 'Add Community', icon: <Plus size={16} />, onClick: openAdd }]}
        loading={loading}
        items={communities}
        rowKey="id"
        columns={[
          { label: 'Code', render: (c) => <span className="text-mono">{c.code}</span> },
          { label: 'Name', render: (c) => c.name },
          { label: 'City', render: (c) => <span style={{ fontSize: 'var(--text-sm)' }}>{c.city || 'Dubai'}</span> },
          { label: 'Sector', render: (c) => <span style={{ fontSize: 'var(--text-sm)' }}>{c.sector}</span> },
          { label: 'Management Email', render: (c) => <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>{c.management_email || '—'}</span> },
          { label: 'Actions', render: (c) => (
            <RowActions actions={[
              { label: 'View', icon: Eye, onClick: () => setViewTarget(c) },
              { label: 'Edit', icon: Pencil, onClick: () => openEdit(c) },
              { label: 'Delete', icon: Trash2, onClick: () => setDeleteTarget(c), variant: 'danger' },
            ]} />
          ) },
        ]}
        search={{ value: search, placeholder: 'Search by name, code, or city...', onChange: (v) => { setSearch(v); setPage(1); } }}
        filters={[
          { label: 'City', placeholder: 'All Cities', value: cityFilter, onChange: (v) => { setCityFilter(v); setPage(1); }, options: [{ value: 'Dubai', label: 'Dubai' }, { value: 'Abu Dhabi', label: 'Abu Dhabi' }] },
        ]}
        count={total}
        countLabel={(n) => (n === 1 ? 'community' : 'communities')}
        empty={{ icon: <Search size={24} />, title: 'No communities found', hint: 'Get started by adding your first community.' }}
        pagination={{ page, totalPages, total, perPage, onPerPageChange: (n) => { setPerPage(n); setPage(1); }, onChange: setPage }}
        beforeTable={showForm && (
          <div className="admin-content-card" style={{ marginBottom: 'var(--space-4)' }}>
          {/* Section Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid var(--color-border)', paddingBottom: 8 }}>
            {formSections.map(s => (
              <button
                key={s.key}
                type="button"
                onClick={() => setSection(s.key)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 'var(--text-sm)',
                  fontWeight: section === s.key ? 600 : 400,
                  background: section === s.key ? 'var(--color-primary)' : 'transparent',
                  color: section === s.key ? 'var(--color-white)' : 'var(--color-text)',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Basic Info */}
          {section === 'basic' && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: '0 0 100px' }}>
                <label className="input-label">Code</label>
                <Input value={form.code} onChange={e => updateField('code', e.target.value)} placeholder="e.g. 392" />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label className="input-label">Name</label>
                <Input value={form.name} onChange={e => updateField('name', e.target.value)} placeholder="Community name" />
              </div>
              <div style={{ flex: '0 0 120px' }}>
                <label className="input-label">Sector</label>
                <select value={form.sector_number} onChange={e => updateField('sector_number', e.target.value)} className="filter-select">
                  {[1,2,3,4,5,6,7,8,9].map(s => <option key={s} value={s}>Sector {s}</option>)}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label className="input-label">City</label>
                <Input value={form.city} onChange={e => updateField('city', e.target.value)} placeholder="Dubai" />
              </div>
              <div style={{ flex: 2, minWidth: 260 }}>
                <label className="input-label">Address</label>
                <Input value={form.address} onChange={e => updateField('address', e.target.value)} placeholder="Full address" />
              </div>
            </div>
          )}

          {/* Operations */}
          {section === 'operations' && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label className="input-label">Management Email</label>
                <Input type="email" value={form.management_email} onChange={e => updateField('management_email', e.target.value)} placeholder="management@example.com" />
              </div>
              <div style={{ flex: '0 0 160px' }}>
                <label className="input-label">Contact Number</label>
                <Input value={form.contact_number} onChange={e => updateField('contact_number', e.target.value)} placeholder="+971 50 123 4567" />
              </div>
              <div style={{ flex: '0 0 120px' }}>
                <label className="input-label">Makani</label>
                <Input value={form.makani} onChange={e => updateField('makani', e.target.value)} placeholder="Makani number" />
              </div>
              <div style={{ flex: '0 0 160px' }}>
                <label className="input-label">Security Contact</label>
                <Input value={form.security_contact} onChange={e => updateField('security_contact', e.target.value)} placeholder="Security phone" />
              </div>
              <div style={{ flex: '0 0 160px' }}>
                <label className="input-label">Plus Code</label>
                <Input value={form.plus_code} onChange={e => updateField('plus_code', e.target.value)} placeholder="Plus code" />
              </div>
            </div>
          )}

          {/* Gas & Security */}
          {section === 'gas' && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label className="input-label">Gas Company Name</label>
                <Input value={form.gas_company_name} onChange={e => updateField('gas_company_name', e.target.value)} placeholder="Gas company name" />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label className="input-label">Gas Company Number</label>
                <Input value={form.gas_company_number} onChange={e => updateField('gas_company_number', e.target.value)} placeholder="Gas company phone" />
              </div>
            </div>
          )}

          {/* Coordinates */}
          {section === 'coords' && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: '0 0 200px' }}>
                <label className="input-label">Latitude</label>
                <Input type="number" step="any" value={form.latitude} onChange={e => updateField('latitude', e.target.value)} placeholder="e.g. 25.1972" />
              </div>
              <div style={{ flex: '0 0 200px' }}>
                <label className="input-label">Longitude</label>
                <Input type="number" step="any" value={form.longitude} onChange={e => updateField('longitude', e.target.value)} placeholder="e.g. 55.2744" />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 8, marginTop: 16, borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
            <Button variant="primary" onClick={handleSave}>{editId ? 'Update' : 'Add'}</Button>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}
      />

      <Modal isOpen={!!viewTarget} onClose={() => setViewTarget(null)} title="View Community" className="modal-lg">
        {viewTarget && (
          <>
            <div className="admin-detail-grid">
              <div><strong>Code:</strong></div><div style={{ fontFamily: 'monospace' }}>{viewTarget.code}</div>
              <div><strong>Name:</strong></div><div>{viewTarget.name}</div>
              <div><strong>Sector:</strong></div><div>{viewTarget.sector}</div>
              <div><strong>City:</strong></div><div>{viewTarget.city || '—'}</div>
              <div><strong>Management Email:</strong></div><div>{viewTarget.management_email || '—'}</div>
              <div><strong>Contact Number:</strong></div><div>{viewTarget.contact_number || '—'}</div>
              <div><strong>Makani:</strong></div><div>{viewTarget.makani || '—'}</div>
              <div><strong>Address:</strong></div><div style={{ gridColumn: '1 / -1' }}>{viewTarget.address || '—'}</div>
              <div><strong>Security Contact:</strong></div><div>{viewTarget.security_contact || '—'}</div>
              <div><strong>Gas Company:</strong></div><div>{viewTarget.gas_company_name || '—'}{viewTarget.gas_company_number ? ` (${viewTarget.gas_company_number})` : ''}</div>
              <div><strong>Plus Code:</strong></div><div>{viewTarget.plus_code || '—'}</div>
              <div><strong>Latitude:</strong></div><div>{viewTarget.latitude || '—'}</div>
              <div><strong>Longitude:</strong></div><div>{viewTarget.longitude || '—'}</div>
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
        title="Delete Community"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}
