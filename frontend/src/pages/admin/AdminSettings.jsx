import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Save } from 'lucide-react';
import { adminApi } from '../../utils/api';
import AdminLayout from '../../components/admin/AdminLayout';
import Button from '../../components/public/Button';
import Input from '../../components/public/Input';
import { useAdminToast } from '../../hooks/useAdminToast';

const SETTING_KEYS = {
  general: ['site_name', 'contact_email', 'contact_phone', 'address'],
  social: ['facebook_url', 'instagram_url'],
  rms: ['rms_login_url'],
  smtp: ['smtp_host', 'smtp_port', 'smtp_secure', 'smtp_user', 'smtp_password', 'smtp_from_email'],
  ocr: ['ocr_method', 'ocr_space_api_key', 'gemini_api_key'],
};

const SECTION_LABELS = {
  general: 'General',
  social: 'Social Media',
  rms: 'RMS',
  smtp: 'SMTP',
  ocr: 'OCR / Document Scanning',
};

const FIELD_LABELS = {
  site_name: 'Site Name',
  contact_email: 'Contact Email',
  contact_phone: 'Contact Phone',
  address: 'Address',
  facebook_url: 'Facebook URL',
  instagram_url: 'Instagram URL',
  rms_login_url: 'RMS Login URL',
  smtp_host: 'SMTP Host',
  smtp_port: 'SMTP Port',
  smtp_secure: 'Secure (SSL/TLS)',
  smtp_user: 'SMTP User',
  smtp_password: 'SMTP Password',
  smtp_from_email: 'From Email',
  ocr_space_api_key: 'OCR.space API Key (optional — free without key)',
  gemini_api_key: 'Google Gemini API Key (free tier, for contracts/title deeds / Emirates ID & passport)',
  ocr_method: 'OCR Method (contracts, title deeds, Emirates ID & passport)',
};

const OCR_METHODS = [
  { value: 'auto', label: 'Auto (recommended)', desc: 'Gemini reads the document directly; falls back to OCR.space + Gemini, then regex. Best quality & reliability.' },
  { value: 'gemini_vision', label: 'Gemini (vision)', desc: 'Send the image/PDF straight to Gemini — 1 call, best Arabic accuracy. No OCR.space. Requires a Gemini key.' },
  { value: 'ocrspace_gemini', label: 'OCR.space + Gemini', desc: 'Current pipeline: OCR.space extracts text, Gemini structures it. Requires a Gemini key for structuring.' },
  { value: 'ocrspace_regex', label: 'OCR.space only (regex)', desc: 'No Gemini at all — regex on OCR.space text. Fewer fields, uses zero Gemini quota.' },
];

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [smtpOpen, setSmtpOpen] = useState(false);
  const [ocrOpen, setOcrOpen] = useState(false);

  const toast = useAdminToast();

  const fetchSettings = async () => {
    try {
      const { data } = await adminApi.get('/settings');
      setSettings(data);
    } catch {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.put('/settings', { settings });
      toast.success('Settings saved successfully');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const renderField = (key) => {
    const isPassword = key === 'smtp_password';
    const value = settings[key] ?? '';

    if (key === 'ocr_method') {
      const selected = OCR_METHODS.find((m) => m.value === value) || OCR_METHODS[0];
      return (
        <div key={key}>
          <label className="input-label">{FIELD_LABELS[key]}</label>
          <select
            className="admin-input"
            value={value || 'auto'}
            onChange={(e) => handleChange(key, e.target.value)}
          >
            {OCR_METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: '6px 0 0' }}>
            {selected.desc}
          </p>
        </div>
      );
    }

    return (
      <div key={key}>
        <label className="input-label">{FIELD_LABELS[key]}</label>
        <Input
          type={isPassword ? 'password' : 'text'}
          value={value}
          onChange={(e) => handleChange(key, e.target.value)}
          placeholder={FIELD_LABELS[key]}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <AdminLayout title="Settings">
        <div className="flex items-center justify-center" style={{ padding: 'var(--space-16)' }}>
          <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%' }} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings">
      <div className="admin-content-card" style={{ maxWidth: 720 }}>
        <div className="flex flex-col gap-8">
          {/* General */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-sans)' }}>
              {SECTION_LABELS.general}
            </h3>
            <div className="flex flex-col gap-4">
              {SETTING_KEYS.general.map(renderField)}
            </div>
          </div>

          <hr className="divider" />

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-sans)' }}>
              {SECTION_LABELS.social}
            </h3>
            <div className="flex flex-col gap-4">
              {SETTING_KEYS.social.map(renderField)}
            </div>
          </div>

          <hr className="divider" />

          {/* RMS */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-sans)' }}>
              {SECTION_LABELS.rms}
            </h3>
            <div className="flex flex-col gap-4">
              {SETTING_KEYS.rms.map(renderField)}
            </div>
          </div>

          <hr className="divider" />

          {/* SMTP - Collapsible */}
          <div>
            <button
              type="button"
              onClick={() => setSmtpOpen(!smtpOpen)}
              className="flex items-center gap-2"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--color-text)',
              }}
            >
              {smtpOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              {SECTION_LABELS.smtp}
            </button>
            {smtpOpen && (
              <div className="flex flex-col gap-4 mt-4">
                {SETTING_KEYS.smtp.map(renderField)}
              </div>
            )}
          </div>

          <hr className="divider" />

          {/* OCR / Document Scanning - Collapsible */}
          <div>
            <button
              type="button"
              onClick={() => setOcrOpen(!ocrOpen)}
              className="flex items-center gap-2"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--color-text)',
              }}
            >
              {ocrOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              {SECTION_LABELS.ocr}
            </button>
            {ocrOpen && (
              <div className="flex flex-col gap-4 mt-4">
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: '0 0 8px' }}>
                  Choose the OCR method used for contracts, title deeds, Emirates ID &amp; passport. <strong>Auto</strong> uses Gemini vision first and
                  falls back automatically. OCR.space works without an API key (free tier: 25,000 requests/month).
                  Gemini is free (15 req/min, no card required). Get a Gemini key at{' '}
                  <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>
                    Google AI Studio
                  </a>.
                </p>
                {SETTING_KEYS.ocr.map(renderField)}
              </div>
            )}
          </div>

          <hr className="divider" />

          <div className="flex justify-end">
            <Button variant="primary" onClick={handleSave} loading={saving} icon={!saving ? <Save size={16} /> : undefined}>
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
