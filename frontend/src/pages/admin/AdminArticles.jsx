import { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { adminApi } from '../../utils/api';
import AdminTablePage from '../../components/admin/AdminTablePage';
import Button from '../../components/public/Button';
import Input from '../../components/public/Input';
import { useAdminToast } from '../../hooks/useAdminToast';
import RowActions from '../../components/admin/RowActions';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

export default function AdminArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [publishedFilter, setPublishedFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ slug: '', title: '', subtitle: '', content: '', highlights: '', ideal_for: '', why_in_demand: '', image_url: '', keywords: '', published: 1 });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(25);
  const toast = useAdminToast();

  const fetchArticles = async () => {
    try {
      const params = { page, limit: perPage };
      if (search) params.search = search;
      if (publishedFilter !== '') params.published = publishedFilter;
      const { data } = await adminApi.get('/articles', { params });
      setArticles(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch {
      toast.error('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchArticles(); }, [page, perPage, search, publishedFilter]);

  const openAdd = () => {
    setEditId(null);
    setForm({ slug: '', title: '', subtitle: '', content: '', highlights: '', ideal_for: '', why_in_demand: '', image_url: '', keywords: '', published: 1 });
    setShowForm(true);
  };

  const openEdit = (a) => {
    setEditId(a.id);
    setForm({
      slug: a.slug, title: a.title, subtitle: a.subtitle || '',
      content: a.content || '', highlights: Array.isArray(a.highlights) ? a.highlights.join('\n') : (a.highlights || ''),
      ideal_for: a.ideal_for || '', why_in_demand: a.why_in_demand || '',
      image_url: a.image_url || '', keywords: a.keywords || '', published: a.published
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.slug || !form.title) { toast.error('Slug and title are required'); return; }
    const body = { ...form, highlights: form.highlights ? form.highlights.split('\n').filter(Boolean) : [] };
    try {
      if (editId) {
        await adminApi.put(`/articles/${editId}`, body);
        toast.success('Article updated');
      } else {
        await adminApi.post('/articles', body);
        toast.success('Article created');
      }
      setShowForm(false);
      fetchArticles();
    } catch {
      toast.error('Failed to save article');
    }
  };

  const togglePublish = async (a) => {
    try {
      await adminApi.put(`/articles/${a.id}`, { published: a.published ? 0 : 1 });
      fetchArticles();
    } catch {
      toast.error('Failed to toggle status');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.delete(`/articles/${deleteTarget.id}`);
      toast.success('Article deleted');
      setDeleteTarget(null);
      fetchArticles();
    } catch {
      toast.error('Failed to delete article');
    }
  };

  return (
    <>
      <AdminTablePage
        title="Area Articles"
        actions={[{ label: 'Add Article', icon: <Plus size={16} />, onClick: openAdd }]}
        loading={loading}
        items={articles}
        rowKey="id"
        columns={[
          { label: 'Title', render: (a) => <strong>{a.title}</strong> },
          { label: 'Slug', render: (a) => <span className="text-mono">{a.slug}</span> },
          { label: 'Status', render: (a) => (
            <button type="button" onClick={() => togglePublish(a)} className="admin-icon-btn" title={a.published ? 'Published' : 'Draft'}>
              {a.published ? <Eye size={14} /> : <EyeOff size={14} />}
              <span style={{ marginLeft: 4, fontSize: 'var(--text-xs)' }}>{a.published ? 'Live' : 'Draft'}</span>
            </button>
          ) },
          { label: 'Actions', render: (a) => (
            <RowActions actions={[
              { label: 'View', icon: Eye, onClick: () => window.open(`/area-articles/${a.slug}`, '_blank') },
              { label: 'Edit', icon: Pencil, onClick: () => openEdit(a) },
              { label: 'Delete', icon: Trash2, onClick: () => setDeleteTarget(a), variant: 'danger' },
            ]} />
          ) },
        ]}
        search={{ value: search, placeholder: 'Search articles...', onChange: (v) => { setSearch(v); setPage(1); } }}
        filters={[
          { label: 'Status', placeholder: 'All Status', value: publishedFilter, onChange: (v) => { setPublishedFilter(v); setPage(1); }, options: [{ value: '1', label: 'Published' }, { value: '0', label: 'Draft' }] },
        ]}
        count={total}
        countLabel={(n) => (n === 1 ? 'article' : 'articles')}
        empty={{ icon: <Search size={24} />, title: 'No articles found', hint: 'Get started by adding your first article.' }}
        pagination={{ page, totalPages, total, perPage, onPerPageChange: (n) => { setPerPage(n); setPage(1); }, onChange: setPage }}
      />

      {showForm && (
        <div className="admin-content-card" style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 150 }}>
                <label className="input-label">Slug</label>
                <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="e.g. jvc" />
              </div>
              <div style={{ flex: 2, minWidth: 250 }}>
                <label className="input-label">Title</label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Area name" />
              </div>
              <div style={{ flex: '0 0 100px' }}>
                <label className="input-label">Published</label>
                <select value={form.published} onChange={e => setForm(f => ({ ...f, published: Number(e.target.value) }))} className="filter-select">
                  <option value={1}>Yes</option>
                  <option value={0}>No</option>
                </select>
              </div>
            </div>
            <div>
              <label className="input-label">Subtitle</label>
              <Input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="Short tagline" />
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label className="input-label">Ideal For</label>
                <Input value={form.ideal_for} onChange={e => setForm(f => ({ ...f, ideal_for: e.target.value }))} placeholder="e.g. Families, Professionals" />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label className="input-label">Image URL</label>
                <Input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="/images/..." />
              </div>
            </div>
            <div>
              <label className="input-label">Highlights (one per line)</label>
              <textarea className="admin-textarea admin-textarea--lg" value={form.highlights} onChange={e => setForm(f => ({ ...f, highlights: e.target.value }))} rows={3}
              />
            </div>
            <div>
              <label className="input-label">Why In Demand</label>
              <textarea className="admin-textarea admin-textarea--lg" value={form.why_in_demand} onChange={e => setForm(f => ({ ...f, why_in_demand: e.target.value }))} rows={3}
              />
            </div>
            <div>
              <label className="input-label">Content (HTML)</label>
              <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={6}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'monospace', fontSize: 13, resize: 'vertical' }}
              />
            </div>
            <div>
              <label className="input-label">SEO Keywords</label>
              <Input value={form.keywords} onChange={e => setForm(f => ({ ...f, keywords: e.target.value }))} placeholder="Comma-separated keywords" />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="primary" onClick={handleSave}>{editId ? 'Update' : 'Create'}</Button>
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Article"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}
