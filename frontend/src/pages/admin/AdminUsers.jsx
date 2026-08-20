import { useState, useEffect } from 'react';
import { Plus, Pencil, KeyRound, User, Edit3, Trash2, Eye } from 'lucide-react';
import { adminApi } from '../../utils/api';
import Badge from '../../components/public/Badge';
import UserFormModal from '../../components/admin/UserFormModal';
import ResetPasswordModal from '../../components/admin/ResetPasswordModal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import Button from '../../components/public/Button';
import Modal from '../../components/public/Modal';
import RowActions from '../../components/admin/RowActions';
import { useAdminToast } from '../../hooks/useAdminToast';
import AdminTablePage from '../../components/admin/AdminTablePage';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [resetPwOpen, setResetPwOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(25);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const toast = useAdminToast();
  const [viewTarget, setViewTarget] = useState(null);

  const fetchUsers = async () => {
    try {
      const params = { page, limit: perPage };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (activeFilter !== '') params.is_active = activeFilter;
      const { data } = await adminApi.get('/admin-users', { params });
      setUsers(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch {
      toast.error('Failed to load admin users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('adminUser');
    if (stored) {
      try { setCurrentUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
    fetchUsers();
  }, [page, perPage, search, roleFilter, activeFilter]);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setModalOpen(true);
  };

  const handleSave = async (payload, editing) => {
    try {
      if (editing) {
        await adminApi.put(`/admin-users/${editing.id}`, payload);
        toast.success('Admin user updated');
      } else {
        await adminApi.post('/admin-users', payload);
        toast.success('Admin user created');
      }
      setModalOpen(false);
      fetchUsers();
    } catch {
      toast.error('Failed to save admin user');
    }
  };

  const handleResetPassword = async (target, newPassword) => {
    try {
      await adminApi.put(`/admin-users/${target.id}/password`, { password: newPassword });
      toast.success('Password reset successfully');
      setResetPwOpen(false);
      setResetTarget(null);
    } catch {
      toast.error('Failed to reset password');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.delete(`/admin-users/${deleteTarget.id}`);
      toast.success('Admin user deleted');
      setDeleteTarget(null);
      fetchUsers();
    } catch {
      toast.error('Failed to delete admin user');
    }
  };

  const isSelf = (user) => currentUser && (user.email === currentUser.email || user.id === currentUser.id);

  return (
    <>
      <AdminTablePage
        title="Admin Users"
        actions={[{ label: 'Add Admin', icon: <Plus size={16} />, onClick: openAdd }]}
        loading={loading}
        items={users}
        rowKey="id"
        columns={[
          {
            label: 'Name',
            render: (u) => {
              const self = isSelf(u);
              return (
                <>
                  <span className="font-medium">{u.name}</span>
                  {self && <Badge variant="info" size="sm" className="ml-2">You</Badge>}
                </>
              );
            },
          },
          { label: 'Email', render: (u) => u.email },
          { label: 'Role', render: (u) => <Badge variant={u.role === 'admin' ? 'primary' : 'default'} size="sm">{u.role}</Badge> },
          { label: 'Active', render: (u) => <Badge variant={u.is_active ? 'success' : 'default'} size="sm">{u.is_active ? 'Active' : 'Inactive'}</Badge> },
          { label: 'Created', render: (u) => <span className="text-secondary">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</span> },
          {
            label: 'Actions',
            render: (u) => {
              const self = isSelf(u);
              return (
                <div className="flex gap-2" style={{ alignItems: 'center' }}>
                  <button type="button" className="btn-icon-only" title="Reset password"
                    onClick={() => { setResetTarget(u); setResetPwOpen(true); }}
                    disabled={self}
                    style={self ? { opacity: 0.35, cursor: 'not-allowed' } : {}}>
                    <KeyRound size={18} />
                  </button>
                  <RowActions actions={[
                    { label: 'View', icon: Eye, onClick: () => setViewTarget(u) },
                    { label: 'Edit', icon: Pencil, onClick: () => openEdit(u) },
                    ...(self ? [] : [{ label: 'Delete', icon: Trash2, onClick: () => setDeleteTarget(u), variant: 'danger' }]),
                  ]} />
                </div>
              );
            },
          },
        ]}
        search={{
          value: search,
          placeholder: 'Search admin users...',
          onChange: (v) => { setSearch(v); setPage(1); },
        }}
        filters={[
          {
            label: 'Roles',
            placeholder: 'All Roles',
            value: roleFilter,
            onChange: (v) => { setRoleFilter(v); setPage(1); },
            options: [
              { value: 'admin', label: 'Admin' },
              { value: 'editor', label: 'Editor' },
            ],
          },
          {
            label: 'Status',
            placeholder: 'All Status',
            value: activeFilter,
            onChange: (v) => { setActiveFilter(v); setPage(1); },
            options: [
              { value: '1', label: 'Active' },
              { value: '0', label: 'Inactive' },
            ],
          },
        ]}
        count={total}
        countLabel={(n) => (n === 1 ? 'user' : 'users')}
        empty={{
          icon: <User size={28} />,
          title: 'No admin users found',
          hint: 'Get started by adding your first admin user.',
        }}
        mobileCard={(u) => ({
          title: `${u.name || 'Unknown'}${currentUser?.id === u.id ? ' (You)' : ''}`,
          subtitle: u.email || '',
          meta: [{ label: 'Role', value: u.role }],
          status: { label: u.is_active ? 'Active' : 'Inactive', variant: u.is_active ? 'success' : 'default' },
          actionsMenu: [
            { icon: Eye, label: 'View', onClick: () => setViewTarget(u) },
            { icon: Edit3, label: 'Edit', onClick: () => openEdit(u) },
            { icon: KeyRound, label: 'Reset Password', onClick: () => { setResetTarget(u); setResetPwOpen(true); } },
            ...(currentUser?.id !== u.id ? [{ icon: Trash2, label: 'Delete', onClick: () => setDeleteTarget(u), variant: 'danger' }] : []),
          ],
        })}
        pagination={{
          page,
          totalPages,
          total,
          perPage,
          onPerPageChange: (n) => { setPerPage(n); setPage(1); },
          onChange: setPage,
        }}
      />

      <UserFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} editing={editing} onSave={handleSave} />
      <ResetPasswordModal isOpen={resetPwOpen} onClose={() => { setResetPwOpen(false); setResetTarget(null); }} target={resetTarget} onReset={handleResetPassword} />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Admin User"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />

      <Modal isOpen={!!viewTarget} onClose={() => setViewTarget(null)} title="View Admin User" className="modal-lg">
        {viewTarget && (
          <>
            <div className="admin-detail-grid">
              <div><strong>Name:</strong></div><div>{viewTarget.name}{currentUser?.id === viewTarget.id && <span style={{ marginLeft: 6, fontSize: 11, background: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: 4 }}>You</span>}</div>
              <div><strong>Email:</strong></div><div>{viewTarget.email}</div>
              <div><strong>Role:</strong></div><div style={{ textTransform: 'capitalize' }}>{viewTarget.role}</div>
              <div><strong>Active:</strong></div><div>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: viewTarget.is_active ? 'var(--color-success)' : 'var(--color-error)', marginRight: 6 }} />
                {viewTarget.is_active ? 'Yes' : 'No'}
              </div>
              <div><strong>Created:</strong></div><div>{viewTarget.created_at ? new Date(viewTarget.created_at).toLocaleDateString() : '—'}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20, borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
              <Button variant="ghost" onClick={() => setViewTarget(null)}>Close</Button>
              <Button variant="primary" icon={<Pencil size={14} />} onClick={() => { setViewTarget(null); openEdit(viewTarget); }}>Edit</Button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
