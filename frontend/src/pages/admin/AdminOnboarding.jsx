import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, ChevronLeft, IdCard, FileText, Landmark, BadgeCheck, FileSignature, UserCheck, Building2, Save } from 'lucide-react';
import { adminApi } from '../../utils/api';
import { useAdminToast } from '../../hooks/useAdminToast';
import AdminLayout from '../../components/admin/AdminLayout';
import OnboardingAddStep from './onboarding/OnboardingAddStep';
import OnboardingLandlordStep from './onboarding/OnboardingLandlordStep';
import OnboardingBuildingStep from './onboarding/OnboardingBuildingStep';
import OnboardingUnitStep from './onboarding/OnboardingUnitStep';
import OnboardingAgreementStep from './onboarding/OnboardingAgreementStep';
import OnboardingReviewStep from './onboarding/OnboardingReviewStep';
import {
  emptyLandlord, emptyBuilding, emptyCommunity, emptyUnit,
  LANDLORD_FIELDS, BUILDING_FIELDS, UNIT_FIELDS, CONTRACT_FIELDS, PERMIT_FIELDS,
  FIELD_SOURCES, resolveField, normalizeScanValue, collectCandidates,
} from './onboarding/onboardingUtils';

const SCAN_DOCS = [
  { docType: 'emirates_id', label: 'Emirates ID', icon: IdCard, desc: 'Priority source — overwrites shared fields. Captures the Arabic name too.' },
  { docType: 'passport', label: 'Passport', icon: FileText, desc: 'Fills only empty fields — never replaces Emirates ID data.' },
  { docType: 'title_deed', label: 'Title Deed', icon: Landmark, desc: 'Owner, building, unit, plot, area and Arabic names.' },
  { docType: 'contract', label: 'Property Management Agreement (اتفاقية إدارة عقار)', icon: FileSignature, desc: 'Multi-page PDF supported — scans the key pages (1, 7, 8) to save time and API quota. Extracts landlord contact, bank details, commission and dates.' },
  { docType: 'permit', label: 'DTCM Permit', icon: BadgeCheck, desc: 'Optional — permits can take days to issue. Add it now or later from the Units page.' },
];

const WIZARD_STEPS = [
  { id: 0, label: 'Scan', icon: IdCard },
  { id: 1, label: 'Landlord', icon: UserCheck },
  { id: 2, label: 'Building', icon: Building2 },
  { id: 3, label: 'Unit', icon: Landmark },
  { id: 4, label: 'Agreement & Permit', icon: FileSignature },
  { id: 5, label: 'Review & Save', icon: Save },
];

export default function AdminOnboarding() {
  const navigate = useNavigate();
  const toast = useAdminToast();
  const [wizardStep, setWizardStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [landlord, setLandlord] = useState(emptyLandlord);
  const [deed, setDeed] = useState(emptyBuilding);
  const [contract, setContract] = useState({});
  const [permit, setPermit] = useState({});
  const [unit, setUnit] = useState(emptyUnit);
  const [scannedFiles, setScannedFiles] = useState({}); // docType -> { file, expiryDate }

  // Raw per-document extracted fields (the merge engine's source pool).
  const [sourceFields, setSourceFields] = useState({
    emirates_id: {}, passport: {}, title_deed: {}, contract: {}, permit: {},
  });
  // target field -> source docType (for "filled from X" UI tags)
  const [fieldSources, setFieldSources] = useState({});
  // target fields the admin edited manually — never overwritten by a scan
  const [manualOverrides, setManualOverrides] = useState({});

  // Additional owners (index 0 in `owners` array maps to the primary `landlord` state).
  const [owners, setOwners] = useState([]);
  const [primaryOwnerIndex, setPrimaryOwnerIndex] = useState(0);

  // Resolution preview ("what will happen on save")
  const [resolution, setResolution] = useState(null);
  const [resolutionLoading, setResolutionLoading] = useState(false);

  // Refs mirror the latest state so the scan worker (memoized with []) never
  // reads stale closures while two documents scan concurrently.
  const sourceFieldsRef = useRef(sourceFields);
  const fieldSourcesRef = useRef(fieldSources);
  const manualOverridesRef = useRef(manualOverrides);
  const landlordRef = useRef(landlord);
  const deedRef = useRef(deed);
  const unitRef = useRef(unit);
  const contractRef = useRef(contract);
  const permitRef = useRef(permit);
  const buildingMatchRef = useRef(null);
  const ownerCounter = useRef(0);

  useEffect(() => { sourceFieldsRef.current = sourceFields; }, [sourceFields]);
  useEffect(() => { fieldSourcesRef.current = fieldSources; }, [fieldSources]);
  useEffect(() => { manualOverridesRef.current = manualOverrides; }, [manualOverrides]);
  useEffect(() => { landlordRef.current = landlord; }, [landlord]);
  useEffect(() => { deedRef.current = deed; }, [deed]);
  useEffect(() => { unitRef.current = unit; }, [unit]);
  useEffect(() => { contractRef.current = contract; }, [contract]);
  useEffect(() => { permitRef.current = permit; }, [permit]);

  // Scan queue: { id, docType, label, file, status: queued|scanning|done|error, error, attempt }
  const [scanQueue, setScanQueue] = useState([]);
  const [scanningDoc, setScanningDoc] = useState(null); // docType currently being scanned (for per-slot UI)
  const [scanProgress, setScanProgress] = useState(null); // { page, totalPages } for contract page-by-page

  // Building match: null = not matched/new building, { id, name } = existing
  const [buildingMatch, setBuildingMatch] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);

  /**
   * Apply an OCR result to the source pool and recompute every target form.
   * The merge engine is source-aware: each target field is filled from its
   * priority list (first non-empty wins). Fields the admin already typed are
   * never touched.
   */
  const applyScanResult = useCallback((docType, rawFields = {}) => {
    // DTCM permit — guard against a mis-assigned lease date pair: a lease start
    // can never be later than its expiry, so swap the two if that happened.
    if (docType === 'permit') {
      const start = rawFields.lease_start;
      const end = rawFields.lease_expiry;
      if (start && end && start > end) {
        rawFields = { ...rawFields, lease_start: end, lease_expiry: start };
      }
    }
    const sources = { ...sourceFieldsRef.current, [docType]: rawFields };
    sourceFieldsRef.current = sources;
    setSourceFields(sources);
    if (docType === 'contract') { contractRef.current = rawFields; setContract(rawFields); }
    if (docType === 'permit') { permitRef.current = rawFields; setPermit(rawFields); }

    const overrides = manualOverridesRef.current;
    const next = {
      landlord: { ...landlordRef.current },
      deed: { ...deedRef.current },
      unit: { ...unitRef.current },
      contract: { ...contractRef.current },
      permit: { ...permitRef.current },
    };
    const srcMap = {};

    for (const target of Object.keys(FIELD_SOURCES)) {
      if (overrides[target]) continue;
      const res = resolveField(target, sources);
      if (res.value === null) continue;
      const norm = normalizeScanValue(target, res.value);
      if (norm === '' || norm === null || norm === undefined) continue;

      if (LANDLORD_FIELDS.includes(target)) next.landlord[target] = norm;
      else if (BUILDING_FIELDS.includes(target)) next.deed[target] = norm;
      else if (UNIT_FIELDS.includes(target)) next.unit[target] = norm;
      else if (CONTRACT_FIELDS.includes(target)) next.contract[target] = norm;
      else if (PERMIT_FIELDS.includes(target)) next.permit[target] = norm;
      srcMap[target] = res.source;
    }

    landlordRef.current = next.landlord;
    deedRef.current = next.deed;
    unitRef.current = next.unit;
    contractRef.current = next.contract;
    permitRef.current = next.permit;
    setLandlord(next.landlord);
    setDeed(next.deed);
    setUnit(next.unit);
    setContract(next.contract);
    setPermit(next.permit);
    setFieldSources(srcMap);
  }, []);

  /** All extracted candidates for a target field (feeds drag-drop chips). */
  const getCandidates = useCallback((target) => collectCandidates(target, sourceFieldsRef.current), []);

  const runSingleScan = async (docType, label, file) => {
    setScanningDoc(docType);
    const fd = new FormData();
    fd.append('document', file);
    fd.append('document_type', docType);
    const { data } = await adminApi.post('/ocr/extract', fd, {
      timeout: 120000,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setScannedFiles(prev => ({ ...prev, [docType]: { file, expiryDate: data.fields?.expiry_date || null } }));
    applyScanResult(docType, data.fields || {});
  };

  const runContractScan = async (file) => {
    setScanningDoc('contract');
    setScanProgress({ page: 0, totalPages: 0 });
    const fd = new FormData();
    fd.append('document', file);
    fd.append('document_type', 'contract');
    const { data } = await adminApi.post('/ocr/extract', fd, {
      timeout: 120000,
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const totalPages = data.totalPages || 1;
    const sessionId = data.sessionId;
    const allFields = { ...(data.fields || {}) };
    const mergePageFields = (pageFields = {}) => {
      for (const [k, v] of Object.entries(pageFields)) {
        // Skip internal extraction metadata so the first page's `_type`/`_error`
        // (which describe the overall method) are retained on the merged result.
        if (k.startsWith('_')) continue;
        if (v !== '' && v !== null && v !== undefined) allFields[k] = v;
      }
    };
    setScanProgress({ page: data.page || 1, totalPages });

    // Page 1 is always scanned by the first call (backend returns its fields).
    // Longer contracts: scan pages 7 + 8 (bank/DEWA/plot live on the last pages).
    // Shorter contracts: scan the last 2 pages instead so the bank page is never missed.
    const extraPages = [];
    if (totalPages >= 8) {
      extraPages.push(7, 8);
    } else {
      for (let p = Math.max(2, totalPages - 1); p <= totalPages; p++) extraPages.push(p);
    }

    for (const p of extraPages) {
      setScanProgress({ page: p, totalPages });
      const { data: pageData } = await adminApi.post(
        '/ocr/extract',
        { document_type: 'contract', session_id: sessionId, page: p },
        { timeout: 120000 }
      );
      mergePageFields(pageData.fields);
      setScanProgress({ page: p, totalPages });
    }

    setScannedFiles(prev => ({ ...prev, contract: { file, expiryDate: allFields.expiry_date || null } }));
    applyScanResult('contract', allFields);
  };

  const processQueueItem = useCallback(async (item) => {
    setScanQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'scanning' } : q));
    try {
      if (item.docType === 'contract') {
        await runContractScan(item.file);
      } else {
        await runSingleScan(item.docType, item.label, item.file);
      }
      setScanQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'done' } : q));
      toast.success(`${item.label} scanned — drag values into the forms`);
    } catch (err) {
      const message = err.response?.data?.message || `Failed to scan ${item.label}`;
      // Auto-retry once on transient failures
      if (item.attempt < 1) {
        setScanQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'queued', error: '', attempt: q.attempt + 1 } : q));
        toast.error(`${message} — retrying…`);
      } else {
        setScanQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'error', error: message } : q));
        toast.error(message);
      }
    } finally {
      setScanningDoc(null);
      setScanProgress(null);
    }
  }, []);

  // Worker: concurrency 2 — process up to two queued items at once
  useEffect(() => {
    const queued = scanQueue.filter(q => q.status === 'queued');
    if (queued.length === 0) return;
    const running = scanQueue.filter(q => q.status === 'scanning').length;
    const slots = Math.max(0, 2 - running);
    for (const item of queued.slice(0, slots)) {
      processQueueItem(item);
    }
  }, [scanQueue, processQueueItem]);

  const enqueue = (docType, file) => {
    const label = SCAN_DOCS.find(d => d.docType === docType)?.label || docType;
    setScanQueue(prev => [...prev, { id: `${docType}-${Date.now()}`, docType, label, file, status: 'queued', error: '', attempt: 0 }]);
  };

  const retryItem = (item) => {
    setScanQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'queued', error: '', attempt: q.attempt + 1 } : q));
  };

  const removeItem = (id) => {
    setScanQueue(prev => prev.filter(q => q.id !== id));
  };

  const fileInput = (docType) => (e) => {
    const f = e.target.files?.[0];
    if (f) enqueue(docType, f);
    e.target.value = '';
  };

  const queueStatus = (docType) => scanQueue.filter(q => q.docType === docType).at(-1);

  // ── Building match (debounced) ────────────────────────────────────────────

  const checkBuildingMatch = useCallback(async (name) => {
    if (!name || !name.trim()) { setBuildingMatch(null); return; }
    setMatchLoading(true);
    try {
      const { data } = await adminApi.get('/buildings', { params: { search: name.trim(), limit: 10 } });
      const exact = (data.data || []).find(
        b => b.name && b.name.toLowerCase() === name.trim().toLowerCase()
      );
      setBuildingMatch(exact ? { id: exact.id, name: exact.name } : null);
    } catch {
      setBuildingMatch(null);
    } finally {
      setMatchLoading(false);
    }
  }, []);

  const buildingMatchTimer = useRef(null);
  useEffect(() => {
    if (buildingMatchTimer.current) clearTimeout(buildingMatchTimer.current);
    buildingMatchTimer.current = setTimeout(() => { checkBuildingMatch(deed.name); }, 400);
    return () => { if (buildingMatchTimer.current) clearTimeout(buildingMatchTimer.current); };
  }, [deed.name, checkBuildingMatch]);

  useEffect(() => { buildingMatchRef.current = buildingMatch; }, [buildingMatch]);

  // ── Resolution preview (debounced, resolve-only) ──────────────────────────

  const runPreview = useCallback(async () => {
    const l = landlordRef.current;
    const d = deedRef.current;
    const u = unitRef.current;
    const bm = buildingMatchRef.current;
    const hasData = Boolean(l.full_name || l.identity_number || d.name || u.apartment_number);
    if (!hasData) { setResolution(null); return; }
    setResolutionLoading(true);
    try {
      const body = {
        landlord: { full_name: l.full_name, identity_number: l.identity_number, phone: l.phone, email: l.email },
        building: bm ? { building_id: bm.id } : { name: d.name, community: d.community },
        community: { name: d.community || '' },
        unit: { apartment_number: u.apartment_number },
      };
      const { data } = await adminApi.post('/onboarding/preview', body);
      setResolution(data);
    } catch {
      setResolution(null);
    } finally {
      setResolutionLoading(false);
    }
  }, []);

  const previewTimer = useRef(null);
  useEffect(() => {
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => { runPreview(); }, 600);
    return () => { if (previewTimer.current) clearTimeout(previewTimer.current); };
  }, [landlord.identity_number, landlord.full_name, landlord.phone, landlord.email, deed.name, unit.apartment_number, buildingMatch, runPreview]);

  // ── Form change handlers (manual edits become overrides) ─────────────────

  const markOverride = (name) => {
    const next = { ...manualOverridesRef.current, [name]: true };
    manualOverridesRef.current = next;
    setManualOverrides(next);
  };

  const handleLandlordChange = (e) => {
    const { name, value } = e.target;
    markOverride(name);
    const next = { ...landlordRef.current, [name]: value };
    landlordRef.current = next;
    setLandlord(next);
  };

  const handleDeedChange = (e) => {
    const { name, value } = e.target;
    markOverride(name);
    const next = { ...deedRef.current, [name]: value };
    deedRef.current = next;
    setDeed(next);
  };

  const handleUnitChange = (e) => {
    const { name, value } = e.target;
    markOverride(name);
    const next = { ...unitRef.current, [name]: value };
    unitRef.current = next;
    setUnit(next);
  };

  const handleContractChange = (e) => {
    const { name, value } = e.target;
    markOverride(name);
    const next = { ...contractRef.current, [name]: value };
    contractRef.current = next;
    setContract(next);
    // Keep the contract in the source pool so the merge engine sees edited values
    const sources = { ...sourceFieldsRef.current, contract: next };
    sourceFieldsRef.current = sources;
    setSourceFields(sources);
  };

  const handlePermitChange = (e) => {
    const { name, value } = e.target;
    const nextPermit = { ...permitRef.current, [name]: value };
    permitRef.current = nextPermit;
    setPermit(nextPermit);
    // Keep the permit in the source pool so the merge engine sees edited values
    const sources = { ...sourceFieldsRef.current, permit: nextPermit };
    sourceFieldsRef.current = sources;
    setSourceFields(sources);
  };

  // DEWA premises number lives on both the permit and the unit — keep them in sync
  const handlePermitDewaChange = (e) => {
    const { value } = e.target;
    const nextPermit = { ...permitRef.current, dewa_premises_number: value };
    permitRef.current = nextPermit;
    setPermit(nextPermit);
    const nextUnit = { ...unitRef.current, dewa_premises_number: value };
    unitRef.current = nextUnit;
    setUnit(nextUnit);
    const sources = { ...sourceFieldsRef.current, permit: nextPermit };
    sourceFieldsRef.current = sources;
    setSourceFields(sources);
  };

  /**
   * Fill a field from a candidate chip (drag-drop or click). Records a manual
   * override so later scans never overwrite it, and tags the source.
   */
  const onSetValue = useCallback((name, value, source) => {
    markOverride(name);
    const srcMap = { ...fieldSourcesRef.current, [name]: source };
    fieldSourcesRef.current = srcMap;
    setFieldSources(srcMap);

    if (LANDLORD_FIELDS.includes(name)) {
      const next = { ...landlordRef.current, [name]: value };
      landlordRef.current = next;
      setLandlord(next);
    } else if (BUILDING_FIELDS.includes(name)) {
      const next = { ...deedRef.current, [name]: value };
      deedRef.current = next;
      setDeed(next);
    } else if (UNIT_FIELDS.includes(name)) {
      const next = { ...unitRef.current, [name]: value };
      unitRef.current = next;
      setUnit(next);
    } else if (CONTRACT_FIELDS.includes(name)) {
      const next = { ...contractRef.current, [name]: value };
      contractRef.current = next;
      setContract(next);
      const sources = { ...sourceFieldsRef.current, contract: next };
      sourceFieldsRef.current = sources;
      setSourceFields(sources);
    } else if (PERMIT_FIELDS.includes(name)) {
      const next = { ...permitRef.current, [name]: value };
      permitRef.current = next;
      setPermit(next);
      const sources = { ...sourceFieldsRef.current, permit: next };
      sourceFieldsRef.current = sources;
      setSourceFields(sources);
    }
  }, []);

  // ── Additional owners ─────────────────────────────────────────────────────

  const addOwner = () => {
    ownerCounter.current += 1;
    const key = `owner-${Date.now()}-${ownerCounter.current}`;
    setOwners(prev => [...prev, { key, landlord: { ...emptyLandlord }, idDocType: null, idFile: null, idExpiry: null, scanning: false }]);
  };

  const removeOwner = (key) => {
    setOwners(prev => prev.filter(o => o.key !== key));
  };

  const handleOwnerChange = (key, e) => {
    const { name, value } = e.target;
    setOwners(prev => prev.map(o => o.key === key ? { ...o, landlord: { ...o.landlord, [name]: value } } : o));
  };

  const scanOwnerId = async (key, docType, file) => {
    setOwners(prev => prev.map(o => o.key === key ? { ...o, scanning: true } : o));
    try {
      const fd = new FormData();
      fd.append('document', file);
      fd.append('document_type', docType);
      const { data } = await adminApi.post('/ocr/extract', fd, {
        timeout: 120000,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const fields = data.fields || {};
      const map = docType === 'emirates_id'
        ? { full_name: 'full_name', full_name_ar: 'full_name_ar', identity_number: 'identity_number', nationality: 'nationality', date_of_birth: 'date_of_birth' }
        : { full_name: 'full_name', full_name_ar: 'full_name_ar', passport_number: 'passport_number', nationality: 'nationality', date_of_birth: 'date_of_birth' };
      setOwners(prev => prev.map(o => {
        if (o.key !== key) return o;
        const next = { ...o.landlord };
        for (const [target, rawKey] of Object.entries(map)) {
          const v = fields[rawKey];
          if (v && !next[target]) next[target] = v;
        }
        return { ...o, landlord: next, idDocType: docType, idFile: file, idExpiry: fields.expiry_date || null, scanning: false };
      }));
      toast.success(`${docType === 'emirates_id' ? 'Emirates ID' : 'Passport'} scanned for the additional owner`);
    } catch (err) {
      setOwners(prev => prev.map(o => o.key === key ? { ...o, scanning: false } : o));
      toast.error(err.response?.data?.message || `Failed to scan ${docType === 'emirates_id' ? 'Emirates ID' : 'Passport'}`);
    }
  };

  // ── Step validation + navigation ──────────────────────────────────────────

  const canLeaveStep = (s) => {
    if (s === 1) return Boolean(landlord.full_name?.trim());
    if (s === 2) return Boolean(deed.name?.trim());
    if (s === 3) return Boolean(unit.apartment_number?.trim());
    return true;
  };

  const goNext = () => {
    if (!canLeaveStep(wizardStep)) {
      if (wizardStep === 1) toast.error('Landlord full name is required');
      if (wizardStep === 2) toast.error('Building name is required — scan Title Deed / Agreement, or type it');
      if (wizardStep === 3) toast.error('Apartment number is required');
      return;
    }
    setWizardStep((s) => Math.min(5, s + 1));
  };

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!landlord.full_name.trim()) { toast.error('Landlord name is required'); return; }
    if (!deed.name.trim()) { toast.error('Building name is required — scan Title Deed or Agreement, or type it'); return; }
    setSaving(true);
    try {
      const allOwners = [landlord, ...owners.map(o => o.landlord)];
      const payload = {
        landlord: { ...landlord, bank_branch: landlord.bank_branch || '' },
        // Reuse an existing building when matched; otherwise create a new one with plus_code
        building: buildingMatch
          ? { building_id: buildingMatch.id }
          : { ...deed, plus_code: deed.plus_code || '' },
        community: { name: deed.community || contract.area || permit.area || '', arabic_name: deed.community_ar || contract.area_ar || permit.area_ar || '' },
        unit: {
          apartment_number: unit.apartment_number,
          building_id: 0, // resolved by backend find-or-create
          property_type: unit.property_type,
          house_type: unit.house_type || 'Standard',
          bedrooms: Number(unit.bedrooms || permit.bedrooms || 0),
          bathrooms: Number(unit.bathrooms || 0),
          dewa_premises_number: unit.dewa_premises_number || permit.dewa_premises_number || '',
          dewa_account_number: unit.dewa_account_number || contract.dewa_account_number || '',
          utility_bills_paid_by: unit.utility_bills_paid_by || 'management',
          commission_percent: Number(unit.commission_percent || contract.management_fee_percent || 15),
          parking_spot_numbers: unit.parking_spot_numbers || '',
          parking_spots: Number(unit.parking_spots || 0),
          floor: unit.floor || contract.floor || deed.floor || '',
          size_sqm: Number(unit.size_sqm || deed.size_sqm || 0) || null,
          size_sqft: Number(unit.size_sqft || deed.size_sqft || 0) || null,
          internet_provider: unit.internet_provider || 'Etisalat',
          internet_account_number: unit.internet_account_number || '',
          wifi_username: unit.wifi_username || '',
          wifi_password: unit.wifi_password || '',
          max_guests: Number(unit.max_guests || 0),
          description: unit.description || '',
          landlord_id: 0,
        },
        owners: allOwners.map(o => ({ ...o })),
        primaryOwnerIndex,
      };
      const { data } = await adminApi.post('/onboarding', payload);
      const ownerResults = data?.owners || [];
      const unitId = data?.unit?.id;

      // Attach the scanned documents to the newly linked records so the
      // files + numbers + dates/expiry are persisted (not just the extracted data).
      const upload = async (endpoint, docType, file, extra = {}) => {
        if (!file) return;
        const fd = new FormData();
        fd.append('document', file);
        fd.append('type', docType);
        for (const [k, v] of Object.entries(extra)) {
          if (v) fd.append(k, v);
        }
        try {
          await adminApi.post(endpoint, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } catch (err) {
          toast.error(err.response?.data?.message || `Failed to upload ${docType} document`);
        }
      };

      const sf = scannedFiles;
      const src = sourceFields;

      // Owner 1 (the primary profile fed by the global scan slots) — identity docs
      const owner1Id = ownerResults[0]?.id;
      if (owner1Id) {
        if (sf.emirates_id) await upload(`/landlords/${owner1Id}/documents`, 'emirates_id', sf.emirates_id.file, {
          expiry_date: sf.emirates_id.expiryDate,
          document_number: src.emirates_id?.identity_number || null,
        });
        if (sf.passport) await upload(`/landlords/${owner1Id}/documents`, 'passport', sf.passport.file, {
          expiry_date: sf.passport.expiryDate,
          document_number: src.passport?.passport_number || null,
        });
      }

      // Additional owners — their own scanned ID docs
      owners.forEach((owner, i) => {
        const meta = ownerResults[i + 1];
        if (!meta?.id || !owner.idFile || !owner.idDocType) return;
        const docType = owner.idDocType; // 'emirates_id' | 'passport'
        upload(`/landlords/${meta.id}/documents`, docType, owner.idFile, {
          expiry_date: owner.idExpiry,
          document_number: owner.idDocType === 'emirates_id' ? owner.landlord.identity_number : owner.landlord.passport_number,
        });
      });

      if (unitId) {
        if (sf.title_deed) await upload(`/units/${unitId}/documents`, 'title_deed', sf.title_deed.file, {
          document_number: src.title_deed?.registration_no || null,
        });
        if (sf.contract) await upload(`/units/${unitId}/documents`, 'contract', sf.contract.file, {
          contract_start: contract.contract_start || null,
          contract_end: contract.contract_end || null,
        });
        if (sf.permit) await upload(`/units/${unitId}/documents`, 'permit', sf.permit.file, {
          permit_number: permit.permit_number || null,
          document_number: permit.permit_number || null,
          expiry_date: sf.permit.expiryDate || permit.lease_expiry || null,
        });
      }

      const mode = data?.unit?.mode;
      toast.success(mode === 'renewal'
        ? `Renewed — unit #${unitId} updated with the new Agreement & Permit`
        : `Linked! Landlord ${data?.landlord?.id}, Building ${data?.building?.id}, Unit ${unitId}, Listing ${data?.listing?.id}`);
      navigate('/admin/units');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to link property');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Smart Scan Onboarding">
      {/* Wizard stepper */}
      <div className="ob-wizard">
        {WIZARD_STEPS.map(({ id, label, icon: Icon }, i) => (
          <div key={id} className={`ob-wizard-step${wizardStep === id ? ' active' : ''}${wizardStep > id ? ' done' : ''}`}>
            <span className="ob-wizard-dot">{wizardStep > id ? <Check size={12} /> : <Icon size={12} />}</span>
            <span className="ob-wizard-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="ob-content">
        {wizardStep === 0 && (
          <OnboardingAddStep
            scanDocs={SCAN_DOCS}
            queueStatus={queueStatus}
            fileInput={fileInput}
            scanProgress={scanProgress}
            removeItem={removeItem}
            retryItem={retryItem}
            sourceFields={sourceFields}
          />
        )}

        {wizardStep === 1 && (
          <OnboardingLandlordStep
            landlord={landlord}
            handleLandlordChange={handleLandlordChange}
            onSetValue={onSetValue}
            getCandidates={getCandidates}
            fieldSources={fieldSources}
            owners={owners}
            handleOwnerChange={handleOwnerChange}
            scanOwnerId={scanOwnerId}
            addOwner={addOwner}
            removeOwner={removeOwner}
            sourceFields={sourceFields}
          />
        )}

        {wizardStep === 2 && (
          <OnboardingBuildingStep
            deed={deed}
            handleDeedChange={handleDeedChange}
            onSetValue={onSetValue}
            getCandidates={getCandidates}
            fieldSources={fieldSources}
            buildingMatch={buildingMatch}
            matchLoading={matchLoading}
          />
        )}

        {wizardStep === 3 && (
          <OnboardingUnitStep
            unit={unit}
            handleUnitChange={handleUnitChange}
            onSetValue={onSetValue}
            getCandidates={getCandidates}
            fieldSources={fieldSources}
          />
        )}

        {wizardStep === 4 && (
          <OnboardingAgreementStep
            contract={contract}
            handleContractChange={handleContractChange}
            permit={permit}
            handlePermitChange={handlePermitChange}
            handlePermitDewaChange={handlePermitDewaChange}
            unit={unit}
            handleUnitChange={handleUnitChange}
            onSetValue={onSetValue}
            getCandidates={getCandidates}
            fieldSources={fieldSources}
          />
        )}

        {wizardStep === 5 && (
          <OnboardingReviewStep
            landlord={landlord}
            owners={owners}
            primaryOwnerIndex={primaryOwnerIndex}
            setPrimaryOwnerIndex={setPrimaryOwnerIndex}
            resolution={resolution}
            resolutionLoading={resolutionLoading}
            getCandidates={getCandidates}
            fieldSources={fieldSources}
            contract={contract}
            permit={permit}
            sourceFields={sourceFields}
          />
        )}

        {/* Nav */}
        <div className="ob-nav">
          {wizardStep > 0 && (
            <button type="button" className="btn btn-secondary" onClick={() => setWizardStep((s) => Math.max(0, s - 1))}>
              <ChevronLeft size={16} /> Back
            </button>
          )}
          {wizardStep < 5 && (
            <button type="button" className="btn btn-primary" onClick={goNext}>
              Next — {WIZARD_STEPS[wizardStep + 1].label} <ChevronRight size={16} />
            </button>
          )}
          {wizardStep === 5 && (
            <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Linking…' : 'Link Property'} <Save size={16} />
            </button>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}