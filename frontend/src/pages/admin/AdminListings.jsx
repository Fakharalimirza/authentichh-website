import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Pencil, Trash2, Image, Plus, Download, Upload, Eye } from 'lucide-react';
import { adminApi } from '../../utils/api';
import Button from '../../components/public/Button';
import Badge from '../../components/public/Badge';
import DirhamSymbol from '../../components/public/DirhamSymbol';
import { useAdminToast } from '../../hooks/useAdminToast';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { getImageUrl } from '../../utils/imageUrl';
import RowActions from '../../components/admin/RowActions';
import AdminTablePage from '../../components/admin/AdminTablePage';

const statusBadgeVariant = (status) => {
  switch (status) {
    case 'published': return 'success';
    case 'draft': return 'warning';
    case 'unpublished': return 'error';
    default: return 'default';
  }
};

export default function AdminListings() {
  const toast = useAdminToast();
  const navigate = useNavigate();
  const toastRef = useRef(toast);
  toastRef.current = toast;

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(25);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [csvUploading, setCsvUploading] = useState(false);
  const csvInputRef = useRef(null);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page);
      params.set('limit', perPage);
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter) params.set('status', statusFilter);

      const res = await adminApi.get(`/properties?${params.toString()}`);
      const data = res.data;

      if (data.properties) {
        setProperties(data.properties);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || data.properties.length);
      } else if (Array.isArray(data)) {
        setProperties(data);
        setTotalPages(1);
        setTotal(data.length);
      } else {
        setProperties([]);
        setTotalPages(1);
        setTotal(0);
      }
    } catch (err) {
      toastRef.current.error('Failed to load properties');
      if (err.response?.status === 401) navigate('/admin/login');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, statusFilter, navigate]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusChange = (val) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleToggleFeatured = async (prop) => {
    try {
      await adminApi.put(`/properties/${prop.id}`, { is_featured: prop.is_featured ? 0 : 1 });
      toastRef.current.success(prop.is_featured ? 'Featured status removed' : 'Property marked as featured');
      fetchProperties();
    } catch (err) {
      toastRef.current.error('Failed to update featured status');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.delete(`/properties/${deleteTarget.id}`);
      toastRef.current.success('Property deleted successfully');
      setDeleteTarget(null);
      if (properties.length === 1 && page > 1) {
        setPage(p => p - 1);
      } else {
        fetchProperties();
      }
    } catch (err) {
      toastRef.current.error('Failed to delete property');
    }
  };

  const handleDownloadCsv = async () => {
    try {
      const res = await adminApi.get('/properties/export/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'properties.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toastRef.current.success('CSV downloaded');
    } catch {
      toastRef.current.error('Failed to download CSV');
    }
  };

  const handleCsvFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await adminApi.post('/properties/bulk-price-update', formData);
      toastRef.current.success(res.data.message || 'Prices updated');
      fetchProperties();
    } catch (err) {
      toastRef.current.error(err.response?.data?.message || 'Failed to update prices');
    } finally {
      setCsvUploading(false);
      if (csvInputRef.current) csvInputRef.current.value = '';
    }
  };

  const columns = [
    {
      label: 'Cover',
      render: (p) =>
        p.cover_image || (p.images && p.images.length > 0) ? (
          <img
            src={getImageUrl(p.cover_image || p.images.find(i => i.is_cover)?.image_url || p.images[0].image_url, 'thumb')}
            alt=""
            style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: 40, height: 40, borderRadius: 'var(--radius-sm)',
              background: 'var(--color-surface-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-text-muted)'
            }}
          >
            <Image size={16} />
          </div>
        ),
    },
    {
      label: 'Title',
      render: (p) => (
        <Link
          to={`/admin/listings/edit/${p.id}`}
          className="font-medium"
          style={{ color: 'var(--color-text)', textDecoration: 'none' }}
        >
          {p.title}
        </Link>
      ),
    },
    {
      label: 'Location',
      render: (p) => <span className="text-secondary">{p.location || p.building_name || '-'}</span>,
    },
    { label: 'Type', render: (p) => p.property_type || '-' },
    { label: 'Bedrooms', render: (p) => p.bedrooms ?? '-' },
    {
      label: 'Price/Night',
      render: (p) => (
        <>
          <DirhamSymbol size="1em" /> {parseFloat(p.price_per_night).toLocaleString()}
        </>
      ),
    },
    {
      label: 'Status',
      render: (p) => (
        <Badge variant={statusBadgeVariant(p.status)} size="sm">
          {p.status}
        </Badge>
      ),
    },
    {
      label: 'Featured',
      render: (p) => (
        <button
          type="button"
          className="btn-icon-only"
          onClick={() => handleToggleFeatured(p)}
          title={p.is_featured ? 'Remove featured' : 'Mark featured'}
        >
          <Star
            size={18}
            style={{
              fill: p.is_featured ? 'var(--color-accent)' : 'none',
              color: p.is_featured ? 'var(--color-accent)' : 'var(--color-text-muted)'
            }}
          />
        </button>
      ),
    },
    {
      label: 'Actions',
      render: (p) => (
        <RowActions actions={[
          { label: 'View', icon: Eye, onClick: () => window.open(`/apartments/${p.slug || p.id}`, '_blank') },
          { label: 'Edit', icon: Pencil, onClick: () => navigate(`/admin/listings/edit/${p.id}`) },
          { label: 'Delete', icon: Trash2, onClick: () => setDeleteTarget(p), variant: 'danger' },
        ]} />
      ),
    },
  ];

  const renderMobileCard = (p) => ({
    image: (p.cover_image || p.images?.find(i => i.is_cover)?.image_url || p.images?.[0]?.image_url) ? getImageUrl(p.cover_image || p.images?.find(i => i.is_cover)?.image_url || p.images?.[0]?.image_url, 'thumb') : null,
    title: p.title,
    subtitle: p.location ? `${p.location}${p.property_type ? ' · ' + p.property_type : ''}` : p.property_type,
    meta: [
      { label: 'Beds', value: p.bedrooms },
      { label: 'Price', value: `AED ${p.price_per_night}/night` },
    ],
    status: { label: p.status, variant: p.status === 'published' ? 'success' : 'warning' },
    actionsMenu: [
      { icon: Eye, label: 'View', onClick: () => window.open(`/apartments/${p.slug || p.id}`, '_blank') },
      { icon: Pencil, label: 'Edit', onClick: () => navigate(`/admin/listings/edit/${p.id}`) },
      { icon: Trash2, label: 'Delete', onClick: () => { setDeleteTarget(p); }, variant: 'danger' },
    ],
    onClick: () => navigate(`/admin/listings/edit/${p.id}`),
  });

  return (
    <>
      <AdminTablePage
        title="Listings"
        actions={[
          { label: 'Download CSV', icon: <Download size={16} />, onClick: handleDownloadCsv, variant: 'ghost' },
          { label: csvUploading ? 'Uploading...' : 'Bulk Update', icon: <Upload size={16} />, onClick: () => csvInputRef.current?.click(), disabled: csvUploading },
          { label: 'Add New Listing', icon: <Plus size={16} />, onClick: () => navigate('/admin/listings/new') },
        ]}
        loading={loading}
        items={properties}
        rowKey="id"
        columns={columns}
        search={{ value: search, placeholder: 'Search properties...', onChange: handleSearchChange }}
        filters={[
          {
            label: 'Status',
            value: statusFilter,
            onChange: handleStatusChange,
            options: [
              { value: 'draft', label: 'Draft' },
              { value: 'published', label: 'Published' },
              { value: 'unpublished', label: 'Unpublished' },
            ],
          },
        ]}
        count={total}
        countLabel={(n) => (n === 1 ? 'property' : 'properties')}
        empty={{
          icon: <Image size={28} />,
          title: 'No properties found',
          hint: 'Get started by adding your first property.',
          action: !search && !statusFilter ? (
            <Link to="/admin/listings/new">
              <Button variant="primary" size="md">Add First Property</Button>
            </Link>
          ) : null,
        }}
        pagination={{
          page,
          totalPages,
          total,
          perPage,
          onPerPageChange: (n) => { setPerPage(n); setPage(1); },
          onChange: setPage,
        }}
        mobileCard={renderMobileCard}
      />

      <input
        ref={csvInputRef}
        type="file"
        accept=".csv"
        onChange={handleCsvFileSelect}
        style={{ display: 'none' }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Property"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}
