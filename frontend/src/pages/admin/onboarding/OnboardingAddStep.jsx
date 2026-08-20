/**
 * @fileoverview Wizard Step 1 — "Scan Documents": the 5 upload slots with queue
 * status chips + progress bars, and extracted-field pills per done card.
 * Data entry now happens in the wizard steps that follow.
 */

import { Loader2, RefreshCw, X, CircleCheck, CircleAlert } from 'lucide-react';
import FieldReview from './OnboardingFieldReview';

/** Map an extraction `_type` (e.g. "title_deed_vision") to a badge label/class. */
function methodBadge(type = '') {
  if (type.includes('_vision')) return { label: 'Gemini Vision', cls: 'vision' };
  if (type.includes('_gemini')) return { label: 'OCR.space + Gemini', cls: 'gemini' };
  if (type.includes('_regex')) return { label: 'OCR.space + Regex', cls: 'regex' };
  if (type.includes('_basic')) return { label: 'Basic extraction', cls: 'basic' };
  return { label: 'OCR.space', cls: 'regex' };
}

export default function OnboardingAddStep({
  scanDocs,
  queueStatus,
  fileInput,
  scanProgress,
  removeItem,
  retryItem,
  sourceFields,
}) {
  return (
    <div className="ob-step">
      <div className="ob-scan-cards">
        {scanDocs.map(({ docType, label, icon: Icon, desc }) => {
          const q = queueStatus(docType);
          const isContract = docType === 'contract';
          return (
            <div key={docType} className="ob-scan-card">
              <Icon size={28} />
              <h3>{label}</h3>
              <p>{desc}</p>

              <label className="btn btn-primary ob-scan-upload-label">
                {q?.status === 'scanning' ? 'Scanning…' : q ? 'Scan again' : `Scan ${label}`}
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  className="ob-scan-upload-input"
                  onChange={fileInput(docType)}
                />
              </label>

              {q?.status === 'scanning' && (
                <div className="ob-scan-progress">
                  <div className="ob-scan-progress-track">
                    {isContract && scanProgress?.totalPages ? (
                      <div
                        className="ob-scan-progress-fill"
                        style={{ width: `${Math.round((scanProgress.page / scanProgress.totalPages) * 100)}%` }}
                      />
                    ) : (
                      <div className="ob-scan-progress-fill indeterminate" />
                    )}
                  </div>
                  <span className="ob-scan-progress-label">
                    {isContract && scanProgress?.totalPages
                      ? `Scanning page ${scanProgress.page} of ${scanProgress.totalPages}…`
                      : 'Scanning…'}
                  </span>
                </div>
              )}

              {q && (
                <div className="ob-queue-row">
                  <span className={`ob-queue-status ${q.status}`}>
                    {q.status === 'queued' && <><Loader2 size={12} className="ob-spin" /> Queued…</>}
                    {q.status === 'scanning' && <><Loader2 size={12} className="ob-spin" /> Scanning…</>}
                    {q.status === 'done' && <><CircleCheck size={12} /> Scanned</>}
                    {q.status === 'error' && <><CircleAlert size={12} /> Failed</>}
                  </span>
                  {q.status === 'done' ? (
                    <button type="button" className="ob-queue-remove" onClick={() => removeItem(q.id)} title="Remove">
                      <X size={12} />
                    </button>
                  ) : q.status === 'error' ? (
                    <button type="button" className="ob-retry-btn" onClick={() => retryItem(q)} title="Retry">
                      <RefreshCw size={12} /> Retry
                    </button>
                  ) : null}
                </div>
              )}

              {q?.status === 'error' && q.error && (
                <span className="ob-queue-error">{q.error}</span>
              )}

              {q?.status === 'done' && (() => {
                const type = sourceFields?.[docType]?._type;
                if (!type) return null;
                const badge = methodBadge(type);
                const note = sourceFields?.[docType]?._error || sourceFields?.[docType]?._vision_error;
                return (
                  <div className="ob-method-row">
                    <span className={`ob-method-badge ${badge.cls}`}>{badge.label}</span>
                    {note && (
                      <span className="ob-method-note" title={note}>
                        ⚠ {note}
                      </span>
                    )}
                  </div>
                );
              })()}

              {q?.status === 'done' && (
                <FieldReview fields={sourceFields?.[docType] || {}} title="Extracted" />
              )}
            </div>
          );
        })}
      </div>

      <p className="ob-step-hint">
        Scans run in the background while you move through the wizard — a document that finishes
        mid-step just adds more extractable values to the forms. Drag or click a value to fill it.
      </p>
    </div>
  );
}