import { useState, useRef } from 'react';
import { Upload, Trash2, FileText, ExternalLink } from 'lucide-react';
import { adminApi } from '../../../utils/api';
import { useAdminToast } from '../../../hooks/useAdminToast';

const uploadAreaStyle = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  padding: 'var(--space-4)',
  border: '2px dashed var(--color-border)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-surface-secondary)',
  cursor: 'pointer', transition: 'border-color 0.2s ease',
  textAlign: 'center',
};

const docCardStyle = {
  display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
  padding: 'var(--space-3)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-surface)',
  marginBottom: 'var(--space-2)',
};

export default function DocumentsStep({ form, setForm, handleChange, isEdit }) {
  const toast = useAdminToast();
  const titleDeedRef = useRef(null);
  const permitRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const documents = form.documents || [];

  const handleFileSelect = async (e, docType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF, JPEG, PNG, and WebP files are allowed');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // If editing, upload immediately
    if (isEdit) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('type', docType);
        if (docType === 'permit' && form.permit_number) {
          formData.append('permit_number', form.permit_number);
        }
        const res = await adminApi.post(`/properties/${form.id || window.location.pathname.split('/').pop()}/documents`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setForm(f => ({
          ...f,
          documents: [...(f.documents || []), res.data],
        }));
        toast.success('Document uploaded successfully');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to upload document');
      } finally {
        setUploading(false);
      }
    } else {
      // For new properties, store the file temporarily
      setForm(f => ({
        ...f,
        documents: [...(f.documents || []), {
          id: `temp-${Date.now()}`,
          type: docType,
          file_name: file.name,
          file_url: URL.createObjectURL(file),
          _file: file, // Store for later upload
        }],
      }));
    }

    // Reset input
    e.target.value = '';
  };

  const handleDeleteDocument = async (docId) => {
    if (isEdit && !String(docId).startsWith('temp-')) {
      try {
        await adminApi.delete(`/properties/${form.id || window.location.pathname.split('/').pop()}/documents/${docId}`);
      } catch {
        toast.error('Failed to delete document');
        return;
      }
    }
    setForm(f => ({
      ...f,
      documents: (f.documents || []).filter(d => d.id !== docId),
    }));
    toast.success('Document removed');
  };

  const titleDeedDocs = documents.filter(d => d.type === 'title_deed');
  const permitDocs = documents.filter(d => d.type === 'permit');

  return (
    <div className="wizard-step">
      <h2>المستندات / Documents</h2>
      <p className="form-hint" style={{ marginBottom: 'var(--space-4)' }}>
        Upload property documents for verification. Accepted formats: PDF, JPEG, PNG, WebP (max 10MB each).
      </p>

      {/* Title Deed Section */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <label className="admin-label">Title Deed / صك الملكية</label>
        {titleDeedDocs.length > 0 && (
          <div style={{ marginBottom: 'var(--space-2)' }}>
            {titleDeedDocs.map(doc => (
              <div key={doc.id} style={docCardStyle}>
                <FileText size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {doc.file_name}
                  </p>
                </div>
                {doc.file_url && (
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                    style={{ color: 'var(--color-primary)', flexShrink: 0 }}>
                    <ExternalLink size={14} />
                  </a>
                )}
                <button type="button" onClick={() => handleDeleteDocument(doc.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)', flexShrink: 0, padding: 4 }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div
          style={uploadAreaStyle}
          onClick={() => titleDeedRef.current?.click()}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
        >
          <Upload size={24} style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }} />
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
            {uploading ? 'Uploading...' : 'Click to upload title deed'}
          </p>
        </div>
        <input ref={titleDeedRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={e => handleFileSelect(e, 'title_deed')} style={{ display: 'none' }} />
      </div>

      {/* Permit Section */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <label className="admin-label">Permit / التصريح</label>
        <div className="form-group" style={{ marginBottom: 'var(--space-2)' }}>
          <label className="admin-label" style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Permit Number / رقم التصريح</label>
          <input
            name="permit_number"
            value={form.permit_number || ''}
            onChange={handleChange}
            className="admin-input" style={{ maxWidth: 300 }}
            placeholder="e.g. PER-2024-001234"
          />
        </div>
        {permitDocs.length > 0 && (
          <div style={{ marginBottom: 'var(--space-2)' }}>
            {permitDocs.map(doc => (
              <div key={doc.id} style={docCardStyle}>
                <FileText size={18} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {doc.file_name}
                  </p>
                  {doc.permit_number && (
                    <p style={{ margin: 0, fontSize: 11, color: 'var(--color-text-muted)' }}>
                      Permit: {doc.permit_number}
                    </p>
                  )}
                </div>
                {doc.file_url && (
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                    style={{ color: 'var(--color-primary)', flexShrink: 0 }}>
                    <ExternalLink size={14} />
                  </a>
                )}
                <button type="button" onClick={() => handleDeleteDocument(doc.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)', flexShrink: 0, padding: 4 }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div
          style={uploadAreaStyle}
          onClick={() => permitRef.current?.click()}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
        >
          <Upload size={24} style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }} />
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
            {uploading ? 'Uploading...' : 'Click to upload permit document'}
          </p>
        </div>
        <input ref={permitRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={e => handleFileSelect(e, 'permit')} style={{ display: 'none' }} />
      </div>
    </div>
  );
}
