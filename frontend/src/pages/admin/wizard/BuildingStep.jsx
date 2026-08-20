import { useState, useEffect, useRef } from 'react';

const dropdownStyle = {
  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
  borderRadius: 8, marginTop: 4, maxHeight: 200, overflowY: 'auto',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
};

export default function BuildingStep({ buildings, communities, landlords, form, handleChange, listing }) {
  const isBuildingType = ['Apartment', 'Penthouse', 'Studio'].includes(form.property_type);
  const isCommunityType = ['Townhouse', 'Villa'].includes(form.property_type);
  const isLinked = listing?.unit_id;

  const selectedBuilding = buildings.find(b => String(b.id) === String(form.building_id));
  const selectedCommunity = form.community_id || '';

  // Searchable building dropdown
  const [buildingSearch, setBuildingSearch] = useState('');
  const [buildingFocused, setBuildingFocused] = useState(false);
  const [selectedBuildingName, setSelectedBuildingName] = useState('');
  const buildingRef = useRef(null);

  // Searchable landlord dropdown
  const [landlordSearch, setLandlordSearch] = useState('');
  const [landlordFocused, setLandlordFocused] = useState(false);
  const [selectedLandlordName, setSelectedLandlordName] = useState('');
  const landlordRef = useRef(null);

  // Searchable community dropdown
  const [communitySearch, setCommunitySearch] = useState('');
  const [communityFocused, setCommunityFocused] = useState(false);
  const [selectedCommunityName, setSelectedCommunityName] = useState('');
  const communityRef = useRef(null);

  // Sync selected names when form values change externally (edit mode, unit pre-fill)
  useEffect(() => {
    if (form.building_id) {
      const b = buildings.find(x => String(x.id) === String(form.building_id));
      if (b) setSelectedBuildingName(b.name);
    }
  }, [form.building_id, buildings]);

  useEffect(() => {
    if (form.landlord_id) {
      const l = landlords.find(x => String(x.id) === String(form.landlord_id));
      if (l) setSelectedLandlordName(l.full_name || l.name || l.email);
    }
  }, [form.landlord_id, landlords]);

  useEffect(() => {
    if (form.community_id) {
      const c = communities.find(x => (x.code || x.name) === form.community_id);
      if (c) setSelectedCommunityName(c.name);
    }
  }, [form.community_id, communities]);

  // Click outside handler
  useEffect(() => {
    const fn = (e) => {
      if (buildingRef.current && !buildingRef.current.contains(e.target)) setBuildingFocused(false);
      if (landlordRef.current && !landlordRef.current.contains(e.target)) setLandlordFocused(false);
      if (communityRef.current && !communityRef.current.contains(e.target)) setCommunityFocused(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const filteredBuildings = buildings.filter(b =>
    !buildingSearch || b.name.toLowerCase().includes(buildingSearch.toLowerCase()) ||
    (b.city && b.city.toLowerCase().includes(buildingSearch.toLowerCase()))
  );

  const filteredLandlords = landlords.filter(l =>
    !landlordSearch || (l.full_name || '').toLowerCase().includes(landlordSearch.toLowerCase()) ||
    (l.email && l.email.toLowerCase().includes(landlordSearch.toLowerCase()))
  );

  const filteredCommunities = communities.filter(c =>
    !communitySearch || (c.name || '').toLowerCase().includes(communitySearch.toLowerCase()) ||
    (c.code && c.code.toLowerCase().includes(communitySearch.toLowerCase())) ||
    (c.sector && c.sector.toLowerCase().includes(communitySearch.toLowerCase()))
  );

  return (
    <div className="wizard-step">
      <h2>Building & Community / المبنى والمجتمع</h2>
      <p className="form-hint" style={{ marginBottom: 'var(--space-4)' }}>
        {isBuildingType
          ? 'Select the building this unit belongs to'
          : 'Select the community for this property'}
      </p>

      {/* Building Selection (Apartment / Penthouse / Studio) */}
      {isBuildingType && (
        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label className="admin-label">
            Building / المبنى <span className="required">*</span>
          </label>
          <div ref={buildingRef} style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search buildings..."
              value={buildingSearch || (form.building_id ? (selectedBuildingName || selectedBuilding?.name || '') : '')}
              onChange={e => { setBuildingSearch(e.target.value); if (form.building_id) { handleChange({ target: { name: 'building_id', value: '' } }); setSelectedBuildingName(''); } }}
              onFocus={() => { setBuildingFocused(true); setBuildingSearch(''); }}
              className={isLinked ? 'admin-input admin-input--readonly' : 'admin-input'}
              disabled={isLinked}
            />
            {buildingFocused && (
              <div style={dropdownStyle}>
                <div
                  onClick={() => { handleChange({ target: { name: 'building_id', value: '' } }); setSelectedBuildingName(''); setBuildingSearch(''); setBuildingFocused(false); }}
                  style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, color: 'var(--color-text-muted)' }}
                >
                  -- Select Building / اختر المبنى --
                </div>
                {filteredBuildings.length === 0 ? (
                  <div style={{ padding: '8px 12px', fontSize: 13, color: 'var(--color-text-muted)' }}>No buildings found</div>
                ) : (
                  filteredBuildings.map(b => (
                    <div
                      key={b.id}
                      onClick={() => {
                        handleChange({ target: { name: 'building_id', value: String(b.id) } });
                        setSelectedBuildingName(b.name);
                        setBuildingSearch('');
                        setBuildingFocused(false);
                      }}
                      style={{
                        padding: '8px 12px', cursor: 'pointer', fontSize: 13,
                        background: String(b.id) === form.building_id ? 'var(--color-primary-light)' : 'transparent',
                        color: 'var(--color-text)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-secondary)'}
                      onMouseLeave={e => e.currentTarget.style.background = String(b.id) === form.building_id ? 'var(--color-primary-light)' : 'transparent'}
                    >
                      {b.name}{b.city ? ` — ${b.city}` : ''}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Community Selection (Townhouse / Villa) */}
{isCommunityType && (
        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label className="admin-label">
            Community / المجتمع <span className="required">*</span>
          </label>
          <div ref={communityRef} style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search communities..."
              value={communitySearch || (form.community_id ? (selectedCommunityName || selectedCommunity || '') : '')}
              onChange={e => { setCommunitySearch(e.target.value); if (form.community_id) { handleChange({ target: { name: 'community_id', value: '' } }); setSelectedCommunityName(''); } }}
              onFocus={() => { setCommunityFocused(true); setCommunitySearch(''); }}
              className={isLinked ? 'admin-input admin-input--readonly' : 'admin-input'}
              disabled={isLinked}
            />
            {communityFocused && (
              <div style={dropdownStyle}>
                <div
                  onClick={() => { handleChange({ target: { name: 'community_id', value: '' } }); setSelectedCommunityName(''); setCommunitySearch(''); setCommunityFocused(false); }}
                  style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, color: 'var(--color-text-muted)' }}
                >
                  -- Select Community / اختر المجتمع --
                </div>
                {filteredCommunities.length === 0 ? (
                  <div style={{ padding: '8px 12px', fontSize: 13, color: 'var(--color-text-muted)' }}>No communities found</div>
                ) : (
                  filteredCommunities.map((c, i) => {
                    const name = c.name;
                    const val = c.code || c.name;
                    return (
                      <div
                        key={val || i}
                        onClick={() => {
                          handleChange({ target: { name: 'community_id', value: val } });
                          setSelectedCommunityName(name);
                          setCommunitySearch('');
                          setCommunityFocused(false);
                        }}
                        style={{
                          padding: '8px 12px', cursor: 'pointer', fontSize: 13,
                          background: val === form.community_id ? 'var(--color-primary-light)' : 'transparent',
                          color: 'var(--color-text)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-secondary)'}
                        onMouseLeave={e => e.currentTarget.style.background = val === form.community_id ? 'var(--color-primary-light)' : 'transparent'}
                      >
                        {name}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auto-populated read-only fields from Building */}
      {isBuildingType && selectedBuilding && (
        <div style={{
          padding: 'var(--space-3)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          background: 'var(--color-surface-secondary)',
          marginBottom: 'var(--space-4)',
        }}>
          <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 'var(--space-2)', color: 'var(--color-text)' }}>
            Auto-populated from selected building:
          </p>
          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
              <label className="admin-label">Building Name / اسم المبنى</label>
              <input value={selectedBuilding.name || ''} readOnly className="admin-input admin-input--readonly" />
            </div>
            <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
              <label className="admin-label">Building Name (AR) / اسم المبنى بالعربية</label>
              <input value={selectedBuilding.name_ar || ''} readOnly className="admin-input admin-input--readonly" dir="rtl" />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="admin-label">Address / العنوان</label>
            <input value={selectedBuilding.address || ''} readOnly className="admin-input admin-input--readonly" />
          </div>
        </div>
      )}

      {/* Auto-populated read-only fields from Community */}
      {isCommunityType && selectedCommunity && (
        <div style={{
          padding: 'var(--space-3)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          background: 'var(--color-surface-secondary)',
          marginBottom: 'var(--space-4)',
        }}>
          <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 'var(--space-2)', color: 'var(--color-text)' }}>
            Auto-populated from selected community:
          </p>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="admin-label">Community Name / اسم المجتمع</label>
            <input value={selectedCommunity} readOnly className="admin-input admin-input--readonly" />
          </div>
        </div>
      )}

      {/* Linked unit notice */}
      {isLinked && (
        <div style={{
          padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-primary-light)',
          background: 'var(--color-primary-light)', marginBottom: 'var(--space-4)',
        }}>
          <p style={{ fontSize: 12, color: 'var(--color-primary)', margin: 0 }}>
            • هذه الحقول تُدار من الوحدات - تم التعديل في <a href="/admin/units" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Admin → Units</a>
          </p>
        </div>
      )}

{/* Landlord Selection (optional, all types) */}
       <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
         <label className="admin-label">
           Landlord / المالك <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional)</span>
         </label>
         <div ref={landlordRef} style={{ position: 'relative' }}>
           <input
             type="text"
             placeholder="Search landlords..."
             value={landlordSearch || (form.landlord_id ? (selectedLandlordName || landlords.find(l => String(l.id) === form.landlord_id)?.full_name || '') : '')}
             onChange={e => { setLandlordSearch(e.target.value); if (form.landlord_id) { handleChange({ target: { name: 'landlord_id', value: '' } }); setSelectedLandlordName(''); } }}
             onFocus={() => { setLandlordFocused(true); setLandlordSearch(''); }}
             className={isLinked ? 'admin-input admin-input--readonly' : 'admin-input'}
             disabled={isLinked}
           />
           {landlordFocused && (
            <div style={dropdownStyle}>
              <div
                onClick={() => { handleChange({ target: { name: 'landlord_id', value: '' } }); setSelectedLandlordName(''); setLandlordSearch(''); setLandlordFocused(false); }}
                style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, color: 'var(--color-text-muted)' }}
              >
                -- Select Landlord / اختر المالك --
              </div>
              {filteredLandlords.length === 0 ? (
                <div style={{ padding: '8px 12px', fontSize: 13, color: 'var(--color-text-muted)' }}>No landlords found</div>
              ) : (
                filteredLandlords.map(l => (
                  <div
                    key={l.id}
                    onClick={() => {
                      handleChange({ target: { name: 'landlord_id', value: String(l.id) } });
                      setSelectedLandlordName(l.full_name || l.name || l.email);
                      setLandlordSearch('');
                      setLandlordFocused(false);
                    }}
                    style={{
                      padding: '8px 12px', cursor: 'pointer', fontSize: 13,
                      background: String(l.id) === form.landlord_id ? 'var(--color-primary-light)' : 'transparent',
                      color: 'var(--color-text)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.background = String(l.id) === form.landlord_id ? 'var(--color-primary-light)' : 'transparent'}
                  >
                    {l.full_name || l.name || l.email}{l.email ? ` (${l.email})` : ''}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Apartment Number (for building types) */}
      {isBuildingType && (
          <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
            <label className="admin-label">Apartment Number / رقم الشقة</label>
            <input
              name="apartment_number"
              value={form.apartment_number}
              onChange={handleChange}
              className={isLinked ? 'admin-input admin-input--readonly' : 'admin-input'}
              placeholder="e.g. 1204"
            />
          </div>
      )}
    </div>
  );
}
