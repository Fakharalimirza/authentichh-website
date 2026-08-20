import React, { useState, useEffect } from 'react';
import {
  Plus, Pencil, Edit3, Trash2, ToggleLeft, ToggleRight,
  Search,
} from 'lucide-react';
import { adminApi } from '../../utils/api';
import AdminTablePage from '../../components/admin/AdminTablePage';
import Button from '../../components/public/Button';
import Badge from '../../components/public/Badge';
import Modal from '../../components/public/Modal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import IconPicker from '../../components/admin/IconPicker';
import { useAdminToast } from '../../hooks/useAdminToast';
import { CATEGORIES, renderIcon } from '../../utils/amenityIcons';
import RowActions from '../../components/admin/RowActions';

const emptyForm = { name: '', icon: '', description: '', category: '', is_active: 1, sort_order: 0 };

export default function AdminAmenities() {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(25);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const toast = useAdminToast();

  const fetchAmenities = async () => {
    try {
      const params = { page, limit: perPage };
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (activeFilter !== '') params.is_active = activeFilter;
      const { data } = await adminApi.get('/amenities/admin', { params });
      setAmenities(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch {
      toast.error('Failed to load amenities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAmenities(); }, [page, perPage, search, categoryFilter, activeFilter]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (amenity) => {
    setEditing(amenity);
    setForm({
      name: amenity.name || '',
      icon: amenity.icon || '',
      description: amenity.description || '',
      category: amenity.category || '',
      is_active: amenity.is_active ?? 1,
      sort_order: amenity.sort_order ?? 0,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await adminApi.put(`/amenities/${editing.id}`, form);
        toast.success('Amenity updated');
      } else {
        await adminApi.post('/amenities', form);
        toast.success('Amenity created');
      }
      setModalOpen(false);
      fetchAmenities();
    } catch {
      toast.error('Failed to save amenity');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.delete(`/amenities/${deleteTarget.id}`);
      toast.success('Amenity deleted');
      setDeleteTarget(null);
      fetchAmenities();
    } catch {
      toast.error('Failed to delete amenity');
    }
  };

  const toggleActive = async (amenity) => {
    try {
      await adminApi.put(`/amenities/${amenity.id}`, { is_active: amenity.is_active ? 0 : 1 });
      toast.success(amenity.is_active ? 'Amenity deactivated' : 'Amenity activated');
      fetchAmenities();
    } catch {
      toast.error('Failed to toggle status');
    }
  };

  return (
    <>
      <AdminTablePage
        title="Amenities"
        actions={[{ label: 'Add Amenity', icon: <Plus size={16} />, onClick: openAdd }]}
        loading={loading}
        items={amenities}
        rowKey="id"
        columns={[
          { label: '', align: 'center', render: (a) => renderIcon(a.icon, 20) },
          { label: 'Name', render: (a) => <span className="font-medium">{a.name}</span> },
          { label: 'Category', render: (a) => <span className="text-secondary">{a.category || '—'}</span> },
          { label: 'Description', render: (a) => <span className="text-secondary">{a.description || '—'}</span> },
          { label: 'Active', render: (a) => (
            <Badge variant={a.is_active ? 'success' : 'default'} size="sm">
              {a.is_active ? 'Active' : 'Inactive'}
            </Badge>
          ) },
          { label: 'Actions', render: (a) => (
            <div className="flex gap-2" style={{ alignItems: 'center' }}>
              <button type="button" className="btn-icon-only" title="Toggle active" onClick={() => toggleActive(a)}>
                {a.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              </button>
              <RowActions actions={[
                { label: 'Edit', icon: Pencil, onClick: () => openEdit(a) },
                { label: 'Delete', icon: Trash2, onClick: () => setDeleteTarget(a), variant: 'danger' },
              ]} />
            </div>
          ) },
        ]}
        search={{ value: search, placeholder: 'Search amenities...', onChange: (v) => { setSearch(v); setPage(1); } }}
        filters={[
          { label: 'Category', placeholder: 'All Categories', value: categoryFilter, onChange: (v) => { setCategoryFilter(v); setPage(1); }, options: CATEGORIES.map(c => ({ value: c, label: c })) },
          { label: 'Status', placeholder: 'All Status', value: activeFilter, onChange: (v) => { setActiveFilter(v); setPage(1); }, options: [{ value: '1', label: 'Active' }, { value: '0', label: 'Inactive' }] },
        ]}
        count={total}
        countLabel={(n) => (n === 1 ? 'amenity' : 'amenities')}
        empty={{ icon: <Search size={24} />, title: 'No amenities found', hint: 'Get started by adding your first amenity.' }}
        mobileCard={(a) => ({
          title: a.name,
          subtitle: a.category || '',
          meta: [
            a.description && { label: '', value: a.description.length > 60 ? a.description.substring(0, 60) + '...' : a.description },
            { label: 'Sort', value: a.sort_order ?? 0 },
          ],
          status: { label: a.is_active ? 'Active' : 'Inactive', variant: a.is_active ? 'success' : 'default' },
          actionsMenu: [
            { icon: a.is_active ? ToggleRight : ToggleLeft, label: 'Toggle', onClick: () => toggleActive(a) },
            { icon: Edit3, label: 'Edit', onClick: () => openEdit(a) },
            { icon: Trash2, label: 'Delete', onClick: () => setDeleteTarget(a), variant: 'danger' },
          ],
        })}
        pagination={{ page, totalPages, total, perPage, onPerPageChange: (n) => { setPerPage(n); setPage(1); }, onChange: setPage }}
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Amenity' : 'Add Amenity'} className="modal-md">
        <form onSubmit={handleSave} className="flex flex-col" style={{ gap: 'var(--space-4)' }}>
          <div>
            <label className="input-label">Name <span className="input-required">*</span></label>
            <div className="input-field">
              <input
                className="input-element"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Amenity name"
                required
              />
            </div>
          </div>

          <div>
            <label className="input-label">Icon</label>
            <IconPicker value={form.icon} onChange={(icon) => setForm({ ...form, icon })} />
          </div>

          <div>
            <label className="input-label">Category</label>
            <div className="input-field">
              <select
                className="input-element"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">No category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="input-label">Description</label>
            <div className="input-field">
              <textarea
                className="input-element"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Amenity description"
                rows={3}
              />
            </div>
          </div>

          <div>
            <label className="input-label">Sort Order</label>
            <div className="input-field" style={{ maxWidth: 120 }}>
              <input
                className="input-element"
                type="number"
                min="0"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
            <input
              type="checkbox"
              id="is_active"
              checked={!!form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked ? 1 : 0 })}
              style={{ width: 18, height: 18, accentColor: 'var(--color-primary)' }}
            />
            <label htmlFor="is_active" className="text-sm" style={{ cursor: 'pointer' }}>Active</label>
          </div>

          <div className="flex gap-3 justify-end" style={{ marginTop: 'var(--space-2)' }}>
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={saving}>
              {editing ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Amenity"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}
