/**
 * @fileoverview OCR utilities — extract structured data from documents.
 * Uses OCR.space (free, no key required) for raw text, regex for fixed-format
 * docs (Emirates ID, passport, bills), and Gemini free tier for complex docs.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const sharp = require('sharp');
const { PDFDocument } = require('pdf-lib');

// ─── OCR.space raw text extraction ──────────────────────────────────────────

/**
 * Downscale + compress a raster image so OCR.space doesn't hit its 60s
 * processing limit (free tier also caps files at ~1MB). PDFs are attempted
 * via sharp (density 200) but many sharp builds lack poppler/PDF support —
 * on failure the original PDF is returned unchanged and OCR.space handles it
 * natively.
 * @param {string} filePath — absolute path to document/image
 * @returns {Promise<string>} path to a temp JPEG (caller should clean up),
 *                            or the original path if preprocessing isn't possible
 */
async function preprocessImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const isRaster = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
  const isPdf = ext === '.pdf';
  if (!isRaster && !isPdf) return filePath;

  try {
    const outPath = path.join(os.tmpdir(), `ocr-${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`);
    await sharp(filePath, isPdf ? { density: 200 } : undefined)
      .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80, chromaSubsampling: '4:2:0' })
      .toFile(outPath);
    return outPath;
  } catch {
    // Preprocessing failed (e.g. corrupt file, PDF without poppler) — send the original
    return filePath;
  }
}

/** True for transient errors worth retrying (429, 5xx, timeouts, network aborts, throttling). */
function isRetryableOcrError(err) {
  const msg = err?.message || '';
  return /HTTP\s+(?:429|5\d\d)|timeout|abort|fetch failed|ECONNRESET|ETIMEDOUT|overloaded/i.test(msg);
}

/**
 * Retry a transiently-failing async operation with a short backoff.
 * A failure is treated as transient when its message matches an HTTP 429/5xx,
 * a timeout/abort, a network reset, or an upstream "overloaded" throttle.
 * @param {Function} fn — async operation returning a Promise
 * @param {Object} [options]
 * @param {number} [options.attempts=3] — total attempts (first try + retries)
 * @param {number} [options.baseDelayMs=1000] — base delay before retry attempt N
 * @returns {Promise<*>} — resolves with fn()'s result
 */
async function callWithRetry(fn, { attempts = 3, baseDelayMs = 1000 } = {}) {
  let lastErr = null;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt === attempts - 1 || !isRetryableOcrError(err)) break;
      await new Promise((resolve) => setTimeout(resolve, baseDelayMs * (attempt + 1)));
    }
  }
  throw lastErr;
}

/** Message used whenever OCR/vision services are temporarily unavailable. */
const OCR_BUSY_MESSAGE = 'OCR services are temporarily busy — please try again in a moment.';

/**
 * Build a clean 503 error from an upstream OCR failure so the request never
 * crashes with a raw upstream error. The original error is kept in err.cause.
 * @param {Error} [originalErr] — the underlying OCR.space failure
 * @returns {Error} error with status 503
 */
function makeOcrUnavailableError(originalErr) {
  const err = new Error(OCR_BUSY_MESSAGE);
  err.status = 503;
  if (originalErr) err.cause = originalErr;
  return err;
}

/**
 * Single attempt at OCR.space with a hard client-side timeout.
 * @param {string} filePath — absolute path to document/image
 * @param {string} [apiKey] — optional OCR.space key
 * @param {string} engine — '1' (fast) or '2' (better for tables/forms)
 * @param {string} [language] — OCR.space language code ('eng' default, 'ara' for Arabic)
 * @returns {Promise<string>} parsed text
 */
async function sendToOcrSpace(filePath, apiKey, engine, language = 'eng') {
  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer], { type: 'application/octet-stream' });

  const formData = new FormData();
  formData.append('file', blob, path.basename(filePath));
  formData.append('isOverlayRequired', 'false');
  formData.append('language', language);
  formData.append('OCREngine', engine);

  const headers = {};
  if (apiKey) headers.apikey = apiKey;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 65000);

  try {
    const resp = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers,
      body: formData,
      signal: controller.signal,
    });

    if (!resp.ok) {
      throw new Error(`OCR.space HTTP ${resp.status}: ${await resp.text()}`);
    }

    const data = await resp.json();
    if (data.IsErroredOnProcessing) {
      throw new Error(`OCR.space error: ${data.ErrorMessage?.join(', ') || 'unknown'}`);
    }

    const results = data.ParsedResults;
    if (!results || results.length === 0) {
      throw new Error('OCR.space returned no parsed results');
    }

    return results.map(r => r.ParsedText).join('\n');
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Extract raw text via OCR.space free API.
 * Preprocesses images/PDFs, then tries Engine 2 (accurate) with an Engine 1
 * (fast) fallback. Transient failures (429 / 5xx / timeouts) are retried with
 * a short backoff before giving up.
 * @param {string} filePath — absolute path to document/image
 * @param {string} [apiKey] — optional OCR.space key (free tier works without one)
 * @param {string} [language] — OCR.space language code. Default 'eng'. Arabic
 *   ('ara') is only supported on Engine 1, so the Engine 2 attempt is skipped.
 * @returns {Promise<string>} parsed text
 */
async function extractWithOcrSpace(filePath, apiKey, language = 'eng') {
  const prepared = await preprocessImage(filePath);
  const isTemp = prepared !== filePath;

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // Arabic is only supported on OCR Engine 1 — skip the Engine 2 attempt for it.
  const engines = language === 'eng' ? ['2', '1'] : ['1'];

  try {
    const attempts = 3;
    let lastErr = null;

    for (let attempt = 0; attempt < attempts; attempt++) {
      if (attempt > 0) await sleep(2000 * attempt); // 2s, 4s backoff

      try {
        return await sendToOcrSpace(prepared, apiKey, engines[0], language);
      } catch (primaryErr) {
        // Non-eng: single engine — decide retry/abort right here
        if (engines.length === 1) {
          lastErr = primaryErr;
          if (isRetryableOcrError(primaryErr)) continue;
          throw new Error(`OCR.space failed (${language}: ${primaryErr.message})`);
        }

        // eng: try Engine 1 once as the fallback
        try {
          return await sendToOcrSpace(prepared, apiKey, engines[1], language);
        } catch (fallbackErr) {
          lastErr = new Error(
            `OCR.space failed (Engine ${engines[0]}: ${primaryErr.message}; Engine ${engines[1]}: ${fallbackErr.message})`
          );
          // If either failure is transient, retry the whole cycle
          if (isRetryableOcrError(primaryErr) || isRetryableOcrError(fallbackErr)) {
            continue;
          }
          throw lastErr;
        }
      }
    }

    throw new Error(
      `OCR.space unavailable after ${attempts} attempts: ${lastErr?.message || 'unknown error'}`
    );
  } finally {
    if (isTemp) {
      fs.unlink(prepared, () => {});
    }
  }
}

/**
 * Doc types printed bilingually (Arabic + English) — these need both an English
 * and an Arabic OCR pass so neither script is dropped.
 */
const BILINGUAL_DOC_TYPES = ['title_deed', 'permit', 'contract'];

/**
 * Extract text from a bilingual document via two OCR.space passes — one English
 * (Engine 2 → 1, keeps labels + numbers clean for regex rescue) and one Arabic
 * (Engine 1, the only engine that reads Arabic) — merged into a single text
 * block for Gemini structuring. The Arabic pass is best-effort: if it fails,
 * the English pass alone still works (an empty Arabic pass degrades gracefully
 * rather than failing the whole scan).
 * @param {string} filePath — absolute path to document/image
 * @param {string} [apiKey] — optional OCR.space key
 * @returns {Promise<string>} merged parsed text
 */
async function extractBilingualWithOcrSpace(filePath, apiKey) {
  const [engResult, araResult] = await Promise.allSettled([
    extractWithOcrSpace(filePath, apiKey, 'eng'),
    extractWithOcrSpace(filePath, apiKey, 'ara'),
  ]);
  if (engResult.status === 'rejected') throw engResult.reason; // English is mandatory
  const engText = engResult.value;
  const araText = araResult.status === 'fulfilled' ? araResult.value : '';
  const parts = [];
  if (engText.trim()) parts.push(engText.trim());
  if (araText.trim()) parts.push(`--- ARABIC OCR PASS ---\n${araText.trim()}`);
  return parts.join('\n\n');
}

/** Pick the right OCR.space pass for a doc type (bilingual vs English-only). */
function ocrTextForDoc(documentType, filePath, apiKey) {
  return BILINGUAL_DOC_TYPES.includes(documentType)
    ? extractBilingualWithOcrSpace(filePath, apiKey)
    : extractWithOcrSpace(filePath, apiKey);
}

// ─── Regex extractors (free, instant, no API) ───────────────────────────────

/**
 * Replace newlines with spaces but only locally — used for matching
 * labels where OCR splits label and value across two lines.
 */
function joinLines(text) {
  return text.replace(/\r?\n/g, ' ');
}

/**
 * Extract Emirates ID fields from raw OCR text.
 * Emirates ID format: 784-YYYY-NNNNNNN-N (birth year + 7 digits + check digit)
 */
function extractEmiratesId(text) {
  // Strict match: 784-YYYY-NNNNNNN-N (leading 784 group)
  const idMatch = text.match(/784[-.\s]?\d{4}[-.\s]?\d{7}[-.\s]?\d/g);
  let identity_number = idMatch ? idMatch[0].replace(/[-.\s]/g, '') : null;

  // Loose fallback: any 3-4-7-1 digit groups even if the leading "784" is
  // OCR-garbled — join the four groups into a 15-digit string.
  if (!identity_number) {
    const looseMatch = text.match(/\b(\d{3})[-.\s]?(\d{4})[-.\s]?(\d{7})[-.\s]?(\d)\b/);
    if (looseMatch) {
      identity_number = looseMatch.slice(1).join('');
    }
  }

  // Normalize the formatted version for display (15 digits: 784-YYYY-NNNNNNN-N)
  let formattedId = null;
  if (identity_number && identity_number.length === 15) {
    formattedId = `${identity_number.slice(0,3)}-${identity_number.slice(3,7)}-${identity_number.slice(7,14)}-${identity_number.slice(14)}`;
  }

  // Work on single-line version for label matching (prevents greedy captures)
  const flat = joinLines(text);

  // Extract name — use original text (name is on one line in OCR)
  const nameMatch = text.match(/(?:Name|الاسم)\s*[:\-]?\s*([A-Za-z][A-Za-z \.'-]+)/i);
  const full_name = nameMatch ? nameMatch[1].trim().split('\n')[0].trim() : null;

  // Nationality — use original text
  const natMatch = text.match(/(?:Nationality|الجنسية)\s*[:\-]?\s*([A-Za-z][A-Za-z ]+)/i);
  const nationality = natMatch ? natMatch[1].trim().split('\n')[0].trim() : null;

  // Date of birth — use flattened text (label and date may be on separate lines)
  const dobMatch = flat.match(/(?:Date\s*of\s*Birth|تاريخ\s*الميلاد|DOB)\s*[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i)
    || flat.match(/(\d{4}[-\/]\d{2}[-\/]\d{2})/);
  const date_of_birth = normalizeDate(dobMatch?.[1]);

  // Expiry date — use flattened text (label and date often on separate lines).
  // Arabic labels covered: الانتهاء and تاريخ الانتهاء (expiry date).
  const expMatch = flat.match(/(?:Expiry\s*Date|Expiry|الانتهاء|تاريخ\s*الانتهاء|Expires?|Date\s*of\s*Expir)\s*[\/\-]?\s*\S*\s*[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i)
    || flat.match(/(?:Expiry\s*Date|Expiry|الانتهاء|تاريخ\s*الانتهاء|Expires?)\s*[\/\-]?\s*\S*\s*[:\-]?\s*(\d{4}[-\/]\d{2}[-\/]\d{2})/i);
  const expiry_date = normalizeDate(expMatch?.[1]);

  return { full_name, identity_number: formattedId || identity_number, nationality, date_of_birth, expiry_date };
}

/**
 * Extract passport fields from raw OCR text.
 * Passport numbers: alphanumeric 6-9 chars. MRZ starts with P<.
 */
function extractPassport(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // Try MRZ parsing (two lines starting with P< and <<)
  const mrzLine1 = lines.find(l => /^P[<P]/.test(l));
  const mrzLine2 = lines.find(l => /^[A-Z0-9<]{30,44}$/.test(l) && l !== mrzLine1);

  if (mrzLine1 && mrzLine2) {
    return parseMRZ(mrzLine1, mrzLine2);
  }

  // Fallback: labeled fields (normalized for multi-line OCR)
  const flat = normalizeText(text);
  const passportMatch = flat.match(/(?:Passport\s*(?:No|Number|№))[:\s]*([A-Z0-9]{6,12})/i);
  const passport_number = passportMatch ? passportMatch[1].toUpperCase() : null;

  const nameMatch = flat.match(/(?:Name|Surname|الاسم)[:\s]*([^\n,]+)/i);
  const full_name = nameMatch ? nameMatch[1].trim() : null;

  const natMatch = flat.match(/(?:Nationality|الجنسية)[:\s]*([^\n,]+)/i);
  const nationality = natMatch ? natMatch[1].trim() : null;

  const dobMatch = flat.match(/(?:Date of Birth|تاريخ الميلاد|DOB)[:\s]*([\d]{1,2}[\/\-][\d]{1,2}[\/\-][\d]{4})/i);
  const date_of_birth = normalizeDate(dobMatch?.[1]);

  // Handle OCR typo "Expin" for "Expiry"
  const expMatch = flat.match(/(?:Date of Exp(?:iry|in)|الانتهاء|Expires?)[:\s]*([\d]{1,2}[\/\-][\d]{1,2}[\/\-][\d]{4})/i);
  const expiry_date = normalizeDate(expMatch?.[1]);

  return { passport_number, full_name, nationality, date_of_birth, expiry_date };
}

/**
 * Parse ICAO TD3 MRZ (2 lines of 44 chars).
 * Returns given name first, then surname (e.g. "Muhammad Bilal").
 */
function parseMRZ(line1, line2) {
  // Line 1: P<OPP<NAME<<GIVEN<NAME<<<
  // Line 2: NNNNNNNNNN0YYMMDD0NNNNNNNNNNN0XXL
  const passport_number = line2.slice(0, 9).replace(/</g, '').trim();
  const dobRaw = line2.slice(13, 19);
  const expRaw = line2.slice(21, 27);
  const nationality = line2.slice(10, 13).replace(/</g, '').trim();

  // Extract name from line 1: P<PAKBILAL<<MUHAMMAD<<<<<<<<<<<<<<<<<<<<<<<<
  const namePart = line1.replace(/^P<[A-Z]{3}/, '');
  const nameParts = namePart.split('<<').filter(Boolean);
  const surname = nameParts[0]?.replace(/</g, ' ').trim() || '';
  const given = nameParts[1]?.replace(/</g, ' ').trim() || '';
  // Given name first, then surname (user preference)
  const full_name = [given, surname].filter(Boolean).join(' ');

  return {
    passport_number,
    full_name: full_name || null,
    nationality: mapNationalityCode(nationality),
    date_of_birth: parseMRZDate(dobRaw),
    expiry_date: parseMRZDate(expRaw),
  };
}

/** Convert 3-letter ICAO nationality code to readable name. */
function mapNationalityCode(code) {
  const map = {
    ARE: 'Emirati', IND: 'Indian', PAK: 'Pakistani', GBR: 'British',
    USA: 'American', CAN: 'Canadian', AUS: 'Australian', DEU: 'German',
    FRA: 'French', EGY: 'Egyptian', JOR: 'Jordanian', LBN: 'Lebanese',
    SYR: 'Syrian', PHL: 'Filipino', BGD: 'Bangladeshi', NPL: 'Nepalese',
    LKA: 'Sri Lankan', CHN: 'Chinese', KOR: 'South Korean', JPN: 'Japanese',
    RUS: 'Russian', TUR: 'Turkish', SAU: 'Saudi', KWT: 'Kuwaiti',
    QAT: 'Qatari', BHR: 'Bahraini', OMN: 'Omani', IRQ: 'Iraqi',
    IRN: 'Iranian', SDN: 'Sudanese', MAR: 'Moroccan', TUN: 'Tunisian',
    DZA: 'Algerian', LBY: 'Libyan', NGA: 'Nigerian', GHA: 'Ghanaian',
    KEN: 'Kenyan', ZAF: 'South African', NLD: 'Dutch', BEL: 'Belgian',
    CHE: 'Swedish', SWE: 'Swiss', ITA: 'Italian', ESP: 'Spanish',
    PRT: 'Portuguese', POL: 'Polish', UKR: 'Ukrainian', MYS: 'Malaysian',
    IDN: 'Indonesian', THA: 'Thai', VNM: 'Vietnamese',
  };
  return map[code] || code;
}

/** Parse YYMMDD or YYYYMMDD to ISO date string. */
function parseMRZDate(raw) {
  if (!raw || raw.length !== 6) return null;
  const y = parseInt(raw.slice(0, 2));
  const year = y > 30 ? 1900 + y : 2000 + y;
  const month = raw.slice(2, 4);
  const day = raw.slice(4, 6);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `${year}-${month}-${day}`;
}

/**
 * Extract bill/invoice fields (DEWA, du, etisalat style).
 */
function extractBill(text) {
  // Account number
  const acctMatch = text.match(/(?:Account\s*(?:No|Number|№|#))[:\s]*([\d\-\/]+)/i)
    || text.match(/(?:ACCT)[:\s]*([\d\-\/]+)/i);
  const account_number = acctMatch ? acctMatch[1].trim() : null;

  // Invoice/ref number
  const invMatch = text.match(/(?:Invoice\s*(?:No|Number|№|#)|Ref(?:erence)?\s*(?:No|Number|#))[:\s]*([\w\-\/]+)/i);
  const invoice_number = invMatch ? invMatch[1].trim() : null;

  // Amount (AED)
  const amountMatch = text.match(/(?:AED|د\.إ)[:\s]*([\d,]+\.?\d*)/i)
    || text.match(/([\d,]+\.?\d*)\s*(?:AED|د\.إ)/i);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null;

  // Due date
  const dueMatch = text.match(/(?:Due\s*Date|الاستحقاق)[:\s]*([\d]{1,2}[\/\-][\d]{1,2}[\/\-][\d]{4})/i);
  const due_date = normalizeDate(dueMatch?.[1]);

  // Property address
  const addrMatch = text.match(/(?:Property\s*(?:Address|Details?|Name))[:\s]*([^\n]+)/i);
  const property_address = addrMatch ? addrMatch[1].trim() : null;

  return { account_number, invoice_number, amount, due_date, property_address };
}

/**
 * Basic permit extraction (Dubai Municipality / DTCM style).
 */
function extractPermit(text) {
  const permitMatch = text.match(/(?:Permit\s*(?:No|Number|#|ID))[:\s]*([\w\-\/]+)/i);
  const permit_number = permitMatch ? permitMatch[1].trim() : null;

  const nameMatch = text.match(/(?:Property|Premises|Hotel|Establishment)[:\s]*([^\n]+)/i);
  const property_name = nameMatch ? nameMatch[1].trim() : null;

  const expMatch = text.match(/(?:Expiry|Valid\s*Until|الانتهاء)[:\s]*([\d]{1,2}[\/\-][\d]{1,2}[\/\-][\d]{4})/i);
  const expiry_date = normalizeDate(expMatch?.[1]);

  // DTCM permits print the lease dates bilingually: "Date Expiry Lease" /
  // "Date Start Lease" / "تاريخ انتهاء الإيجار" / "تاريخ بدء الإيجار"
  const flat = joinLines(text);
  const leaseExpiryMatch = flat.match(
    /(?:Date\s*Expiry\s*Lease|Lease\s*Expiry|تاريخ\s*انتهاء\s*الإيجار)\s*[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i
  ) || flat.match(
    /(?:تاريخ\s*انتهاء\s*الإيجار|Lease\s*Expiry|Date\s*Expiry\s*Lease)\s*[:\-]?\s*(\d{4}[-\/]\d{2}[-\/]\d{2})/i
  );
  const lease_start_match = flat.match(
    /(?:Date\s*Start\s*Lease|Lease\s*Start|تاريخ\s*بدء\s*الإيجار)\s*[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i
  );

  const lease_expiry = normalizeDate(leaseExpiryMatch?.[1]);
  const lease_start = normalizeDate(lease_start_match?.[1]);

  // Sanity: a lease start can never be after its expiry — swap if mis-assigned
  const dates = { lease_start, lease_expiry };
  if (dates.lease_start && dates.lease_expiry && dates.lease_start > dates.lease_expiry) {
    dates.lease_expiry = lease_start;
    dates.lease_start = lease_expiry;
  }

  return { permit_number, property_name, expiry_date, ...dates };
}

// ─── Gemini structuring (free tier, 15 rpm / 1M tokens/day) ──────────────────

/** Contract field schema — shared by the full-contract prompt and the
 *  per-page prompt so page-by-page scans extract the same fields. */
const CONTRACT_FIELDS = `{
  "full_name": "client/owner full name in English",
  "full_name_ar": "client/owner name in Arabic if present, or null",
  "identity_number": "Emirates ID or passport number of the client (e.g. 784-1998-7921359-5)",
  "email": "email address",
  "phone": "phone number",
  "building_name": "building name e.g. AZIZI RIVIERA 41",
  "building_name_ar": "building name in Arabic if present",
  "unit_number": "unit/apartment number e.g. 615",
  "property_type": "unit type e.g. STUDIO, 1 BHK, 2 BHK",
  "agreement_duration": "e.g. 1 YEAR",
  "contract_start": "contract start date YYYY-MM-DD",
  "management_fee_percent": "management property fee % (e.g. 15)",
  "utility_bills_paid_by": "who pays monthly utility bills: 'management' if AUTHENTIC HOLIDAY HOMES is checked, 'owner' if OWNER is checked",
  "bank_name": "owner bank name",
  "bank_account_holder": "account holder name",
  "bank_account_number": "account number",
  "iban": "IBAN",
  "bank_account_currency": "account currency",
  "bank_address": "bank address / country",
  "dewa_account_number": "DEWA account number (page 8)",
  "plot_number": "plot number",
  "area": "area/community name e.g. AL MERKADH",
  "area_ar": "area/community in Arabic if present",
  "contract_end": "contract end date YYYY-MM-DD if present"
}`;

/** Shared extraction prompts — used by both the text path (OCR.space → Gemini)
 *  and the vision path (Gemini reads the image/PDF directly). */
const GEMINI_PROMPTS = {
  emirates_id: `You are extracting structured data from an Emirates ID (UAE national identity card).
Extract these fields as JSON (use null if not found):
{
  "full_name": "cardholder full name as printed on the card, in English",
  "full_name_ar": "cardholder full name in Arabic as printed on the card, or null",
  "identity_number": "the 14-15 digit ID number starting with 784 (e.g. 784-1984-1234567-1); keep digits only, no spaces/dashes",
  "nationality": "nationality as printed on the card",
  "date_of_birth": "date of birth in YYYY-MM-DD",
  "expiry_date": "card expiry date in YYYY-MM-DD"
}
Return ONLY valid JSON, no explanation.`,

  passport: `You are extracting structured data from a passport data page.
Extract these fields as JSON (use null if not found):
{
  "passport_number": "passport number (alphanumeric 6-12 chars), uppercase",
  "full_name": "holder full name, given name(s) first then surname",
  "full_name_ar": "holder full name in Arabic if printed, or null",
  "nationality": "nationality as printed",
  "date_of_birth": "date of birth in YYYY-MM-DD",
  "expiry_date": "passport expiry date in YYYY-MM-DD"
}
Return ONLY valid JSON, no explanation.`,

  contract: `You are extracting structured data from a multi-page Dubai rental / management contract.
This is a multi-page PDF contract. Read page 1 (agreement details, client info, management fee, bill payment) and the LAST pages (owner bank account info, unit DEWA/plot details). Ignore middle pages.
Extract these fields as JSON (use null if not found):
${CONTRACT_FIELDS}
Return ONLY valid JSON, no explanation.`,

  /** Per-page contract prompt — used when scanning a multi-page contract one
   *  page at a time. {PAGE} is replaced with the actual page number. */
  contract_page: `You are extracting structured data from page {PAGE} of a multi-page Dubai rental / management contract.
This is ONLY page {PAGE} of the contract. Extract the fields visible on THIS page as JSON (use null if a field is not present on this page):
${CONTRACT_FIELDS}
Return ONLY valid JSON, no explanation.`,

  permit: `You are extracting structured data from a Dubai Tourism (DTCM) permit.
Extract these fields as JSON (use null if not found):
{
  "permit_number": "permit number (also = unit unique code) e.g. ALM-AZI-MPMBQ",
  "operator_name": "operator name",
  "operator_license_number": "operator license number",
  "operator_license_expiry": "license expiry YYYY-MM-DD",
  "operator_location": "operator location",
  "operator_contact": "operator contact person",
  "unit_type": "unit type e.g. 1-Apartment",
  "bedrooms": "number of bedrooms",
  "building_name": "building name",
  "building_name_ar": "building name in Arabic if present",
  "unit_number": "unit number",
  "street_name": "street name",
  "street_number": "street number",
  "dewa_premises_number": "DEWA number",
  "lease_start": "lease start date YYYY-MM-DD",
  "lease_expiry": "lease expiry date YYYY-MM-DD",
  "plot_number": "plot number",
  "category": "unit category e.g. Standard",
  "area": "area/community name",
  "area_ar": "area/community in Arabic if present"
}
Return ONLY valid JSON, no explanation.`,

  title_deed: `You are extracting structured data from a Dubai property title deed.
Extract these fields as JSON (use null if not found):
{
  "owner_name": "full owner name in English/Latin script",
  "owner_name_ar": "owner's full name in Arabic ONLY — take it from the 'Owners numbers and their shares / أرقام وأسماء المالك وحصصهم' section of the deed; omit ID numbers and share numbers",
  "apartment_number": "Property No / Flat No — the number of the flat itself (NOT the parking spot); can be alphanumeric and may contain '.' or '-' (e.g. c.202, m-22, v 62)",
  "parking_spot": "parking spot identifier as a string (e.g. B1-67) or null if not present",
  "parking_spots": "total number of parking spaces (number) or null",
  "floor": "floor number as string or null",
  "building_name": "building/project name in English/Latin script, e.g. Azizi Riviera 41",
  "building_name_ar": "building/project name in Arabic, e.g. أزيني ريفييرا 41",
  "community": "community/area name in English/Latin script, e.g. Al Merkadh",
  "community_ar": "community/area name in Arabic, e.g. المرقاب",
  "plot_number": "plot number as string or null",
  "area_sqm": "area in square meters (number) — use the value beside the ARABIC 'Area (Sq Meter)' label (e.g. 30.81); do NOT use the English 'Area Sq Meter' value",
  "size_sqft": "area in square feet (number) or null",
  "property_type": "apartment/villa/land etc",
  "registration_no": "land registration number, e.g. 118551/2026",
  "municipality_no": "municipality number e.g. 347 - 5050 or null",
  "purchase_price": "purchase price in AED (number) or null",
  "issue_date": "issue date in YYYY-MM-DD or null",
  "mortgage_status": "mortgaged yes/no and bank name if present, or null"
}
Return ONLY valid JSON, no explanation.`,
};

/** Extra instruction appended in vision mode — the document is attached as a
 *  file, so Gemini must read it directly rather than from pasted text. */
const GEMINI_VISION_INSTRUCTION = `

The document (image or PDF) is attached to this message. Read ALL text from the document itself — including Arabic text — and extract the fields above from it.`;

/** Parse JSON out of a Gemini response (handles markdown code fences). */
function parseGeminiJson(raw) {
  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || raw.match(/(\{[\s\S]*\})/);
  if (!jsonMatch) throw new Error('Gemini returned no parseable JSON');

  try {
    return JSON.parse(jsonMatch[1].trim());
  } catch {
    throw new Error('Gemini returned invalid JSON');
  }
}

/**
 * Use Google Gemini to structure free-form documents (contracts, title deeds).
 * @param {string} text — raw OCR text
 * @param {string} docType — 'contract' | 'title_deed'
 * @param {string} apiKey — Gemini API key
 * @param {string} [promptOverride] — optional prompt to use instead of GEMINI_PROMPTS[docType]
 * @returns {Promise<Object>} structured fields
 */
async function structureWithGemini(text, docType, apiKey, promptOverride) {
  const prompt = promptOverride || GEMINI_PROMPTS[docType];
  if (!prompt) throw new Error(`No Gemini prompt for doc type: ${docType}`);

  // Wrap ONLY the fetch in a retry loop so a transient Gemini 429/5xx (or a
  // network timeout) is retried up to 3 times before the error propagates.
  const resp = await callWithRetry(() =>
    fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt + '\n\n--- DOCUMENT TEXT ---\n' + text.slice(0, 16000) }] }],
        }),
      }
    ).then(async (res) => {
      // Non-2xx responses (429/5xx) are transient — let callWithRetry retry them
      if (!res.ok) {
        throw new Error(`Gemini HTTP ${res.status}: ${await res.text()}`);
      }
      return res;
    })
  );

  if (!resp.ok) {
    throw new Error(`Gemini HTTP ${resp.status}: ${await resp.text()}`);
  }

  const data = await resp.json();
  return parseGeminiJson(data.candidates?.[0]?.content?.parts?.[0]?.text || '');
}

/**
 * Send a document (image or PDF) directly to Gemini for OCR + structuring in a
 * single call — no OCR.space involved. Reads Arabic text far more reliably
 * than the OCR.space → Gemini text pipeline.
 * @param {string} filePath — absolute path to document/image/PDF
 * @param {string} docType — 'contract' | 'title_deed'
 * @param {string} apiKey — Gemini API key
 * @param {string} [promptOverride] — optional prompt to use instead of GEMINI_PROMPTS[docType]
 * @returns {Promise<Object>} structured fields
 */
async function structureWithGeminiVision(filePath, docType, apiKey, promptOverride) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeMap = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
  };
  const mimeType = mimeMap[ext];
  if (!mimeType) throw new Error(`Unsupported file type for Gemini vision: ${ext}`);

  const prompt = promptOverride || GEMINI_PROMPTS[docType];
  if (!prompt) throw new Error(`No Gemini prompt for doc type: ${docType}`);

  // Downscale raster images to cut input tokens; PDFs pass through unchanged
  const prepared = await preprocessImage(filePath);
  const isTemp = prepared !== filePath;

  try {
    const fileBuffer = fs.readFileSync(prepared);

    // Wrap ONLY the fetch in a retry loop so a transient Gemini 429/5xx (or a
    // network timeout) is retried up to 3 times before the error propagates.
    const resp = await callWithRetry(() =>
      fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt + GEMINI_VISION_INSTRUCTION },
                { inlineData: { mimeType, data: fileBuffer.toString('base64') } },
              ],
            }],
          }),
        }
      ).then(async (res) => {
        // Non-2xx responses (429/5xx) are transient — let callWithRetry retry them
        if (!res.ok) {
          throw new Error(`Gemini HTTP ${res.status}: ${await res.text()}`);
        }
        return res;
      })
    );

    if (!resp.ok) {
      throw new Error(`Gemini HTTP ${resp.status}: ${await resp.text()}`);
    }

    const data = await resp.json();
    return parseGeminiJson(data.candidates?.[0]?.content?.parts?.[0]?.text || '');
  } finally {
    if (isTemp) {
      fs.unlink(prepared, () => {});
    }
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Normalize date strings (DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD) to ISO. */
function normalizeDate(raw) {
  if (!raw) return null;
  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    if (parseInt(m) > 12) return null; // swapped
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  // YYYY-MM-DD — already ISO
  const iso = raw.match(/^\d{4}-\d{2}-\d{2}$/);
  if (iso) return raw;
  return null;
}

// ─── Master orchestrator ────────────────────────────────────────────────────

/** Doc types that can leverage Gemini (contracts, title deeds, Emirates ID, passport, permit). */
function isGeminiDocType(documentType) {
  return ['contract', 'title_deed', 'emirates_id', 'passport', 'permit'].includes(documentType);
}

/** Regex fallback for Gemini-eligible docs. Emirates ID, passport & permit use
 *  their specialized extractors; contracts/title deeds fall back to generic labels. */
function extractByRegex(documentType, rawText) {
  switch (documentType) {
    case 'emirates_id':
      return extractEmiratesId(rawText);
    case 'passport':
      return extractPassport(rawText);
    case 'permit':
      return extractPermit(rawText);
    default:
      return extractLabeledFields(rawText);
  }
}

/**
 * Rescue a missing plot number straight from raw OCR text. The English label
 * ("Plot No / Plot Number / Plot:") survives even when the OCR.space+Gemini
 * pipeline fails to structure it.
 * @param {Object} fields — structured fields (mutated when plot_number missing)
 * @param {string} rawText — raw OCR text
 * @returns {Object} the same fields object
 */
function rescuePlotNumber(fields, rawText) {
  if (!fields || fields.plot_number || !rawText) return fields;
  const m = rawText.match(
    /(?:Plot\s*(?:No|Number|#|№)\s*[:]?\s*|قطعة\s*الأرض\s*[:]?\s*)([A-Za-z0-9.\-]{1,16})/i
  );
  if (m && m[1]) fields.plot_number = m[1];
  return fields;
}

/**
 * Process a document: OCR → regex/Gemini → structured fields.
 * The OCR method is configurable via settings.ocr_method:
 *   - 'auto' (default)           → Gemini vision → OCR.space+Gemini text → regex
 *   - 'gemini_vision'            → Gemini vision only (no OCR.space)
 *   - 'ocrspace_gemini'          → OCR.space → Gemini text → regex
 *   - 'ocrspace_regex'           → OCR.space + regex only (zero Gemini usage)
 * @param {string} filePath — absolute path to uploaded file
 * @param {string} documentType — emirates_id | passport | id_passport | contract | title_deed | permit
 * @param {Object} settings — { ocr_method, ocr_space_api_key, gemini_api_key } (may be null)
 * @returns {Promise<{rawText: string, fields: Object, documentType: string}>}
 */
async function processDocument(filePath, documentType, settings = {}) {
  const ocrMethod = settings.ocr_method || 'auto';
  const hasGeminiKey = !!settings.gemini_api_key;

  // ── Fixed-format docs (legacy id_passport, permit) — OCR.space + regex only ──
  if (!isGeminiDocType(documentType)) {
    const rawText = await extractWithOcrSpace(filePath, settings.ocr_space_api_key);
    let fields = {};
    switch (documentType) {
      case 'emirates_id': {
        fields = extractEmiratesId(rawText);
        fields._type = 'emirates_id';
        break;
      }
      case 'passport': {
        fields = extractPassport(rawText);
        fields._type = 'passport';
        break;
      }
      case 'id_passport': {
        // Detect which: if text contains 784-..., treat as Emirates ID; else passport
        if (/784[-.\s]?\d{4}[-.\s]?\d{7}/.test(rawText)) {
          fields = extractEmiratesId(rawText);
          fields._type = 'emirates_id';
        } else {
          fields = extractPassport(rawText);
          fields._type = 'passport';
        }
        break;
      }
      case 'permit': {
        fields = extractPermit(rawText);
        break;
      }
      default: {
        // Unknown doc type — raw text only
        break;
      }
    }
    return { rawText, fields, documentType };
  }

  // ── Gemini-eligible docs (contract / title_deed) — method selector ──

  // gemini_vision: strict vision, no OCR.space fallback
  if (ocrMethod === 'gemini_vision') {
    if (!hasGeminiKey) {
      throw new Error('Gemini vision is selected but no Gemini API key is configured in Settings');
    }
    const fields = await structureWithGeminiVision(filePath, documentType, settings.gemini_api_key);
    fields._type = `${documentType}_vision`;
    return { rawText: '', fields, documentType };
  }

  // ocrspace_regex: OCR.space text + regex, zero Gemini usage
  if (ocrMethod === 'ocrspace_regex') {
    let rawText;
    try {
      rawText = await ocrTextForDoc(documentType, filePath, settings.ocr_space_api_key);
    } catch (ocrErr) {
      // OCR.space throttled/unavailable — never crash with a raw upstream error
      throw makeOcrUnavailableError(ocrErr);
    }
    const fields = extractByRegex(documentType, rawText);
    fields._type = `${documentType}_regex`;
    return { rawText, fields, documentType };
  }

  // ocrspace_gemini: today's pipeline — OCR.space → Gemini text → regex
  if (ocrMethod === 'ocrspace_gemini') {
    let rawText;
    try {
      rawText = await ocrTextForDoc(documentType, filePath, settings.ocr_space_api_key);
    } catch (ocrErr) {
      // OCR.space throttled/unavailable — never crash with a raw upstream error
      throw makeOcrUnavailableError(ocrErr);
    }
    if (!hasGeminiKey) {
      const fields = extractByRegex(documentType, rawText);
      fields._type = `${documentType}_basic`;
      fields._error = 'No Gemini API key configured — using basic extraction';
      return { rawText, fields, documentType };
    }
    try {
      const fields = await structureWithGemini(rawText, documentType, settings.gemini_api_key);
      fields._type = `${documentType}_gemini`;
      rescuePlotNumber(fields, rawText);
      return { rawText, fields, documentType };
    } catch (err) {
      const fields = extractByRegex(documentType, rawText);
      fields._type = `${documentType}_basic`;
      fields._error = `Gemini failed, using basic extraction: ${err.message}`;
      return { rawText, fields, documentType };
    }
  }

  // auto (default): Gemini vision → OCR.space + Gemini text → regex
  let visionError = null;
  if (hasGeminiKey) {
    try {
      // Give vision 2-3 tries before falling through to OCR.space + Gemini text
      const fields = await callWithRetry(() =>
        structureWithGeminiVision(filePath, documentType, settings.gemini_api_key)
      );
      fields._type = `${documentType}_vision`;
      return { rawText: '', fields, documentType };
    } catch (visionErr) {
      // Vision unavailable — fall through to OCR.space + Gemini text
      visionError = visionErr.message;
    }
  }

  let rawText;
  try {
    rawText = await ocrTextForDoc(documentType, filePath, settings.ocr_space_api_key);
  } catch (ocrErr) {
    // OCR.space throttled/unavailable — never crash the request.
    if (!hasGeminiKey) {
      throw makeOcrUnavailableError(ocrErr);
    }
    // One last Gemini vision pass as the final fallback before giving up
    try {
      const fields = await structureWithGeminiVision(filePath, documentType, settings.gemini_api_key);
      fields._type = `${documentType}_vision`;
      return { rawText: '', fields, documentType };
    } catch (finalVisionErr) {
      throw makeOcrUnavailableError(ocrErr);
    }
  }

  if (hasGeminiKey) {
    try {
      const fields = await structureWithGemini(rawText, documentType, settings.gemini_api_key);
      fields._type = `${documentType}_gemini`;
      if (visionError) fields._vision_error = visionError;
      rescuePlotNumber(fields, rawText);
      return { rawText, fields, documentType };
    } catch (err) {
      const fields = extractByRegex(documentType, rawText);
      fields._type = `${documentType}_basic`;
      fields._error = `Gemini failed, using basic extraction: ${err.message}`;
      return { rawText, fields, documentType };
    }
  }

  const fields = extractByRegex(documentType, rawText);
  fields._type = `${documentType}_basic`;
  fields._error = 'No Gemini API key configured — using basic extraction';
  return { rawText, fields, documentType };
}

/**
 * Generic labeled field extraction for free-form docs when no Gemini available.
 */
function extractLabeledFields(text) {
  const fields = {};
  const patterns = [
    [/owner|landlord|tenant/i, 'full_name'],
    [/property|building|premises/i, 'property_name'],
    [/plot|parcel/i, 'plot_number'],
    [/area|size|sqm/i, 'area_sqm'],
    [/rent|amount|monthly/i, 'monthly_rent'],
    [/start|commencement/i, 'contract_start'],
    [/end|expir|terminat/i, 'contract_end'],
  ];
  for (const [re, key] of patterns) {
    const m = text.match(new RegExp(`(?:${re.source})[:\\s]*([^\\n]+)`, 'i'));
    if (m && m[1]) fields[key] = m[1].trim();
  }
  return fields;
}

// ─── Contract page-by-page scanning ─────────────────────────────────────────

/**
 * Split a multi-page PDF into one single-page PDF per page using pdf-lib.
 * Returns the temp page file paths (caller is responsible for cleanup).
 * @param {string} filePath — absolute path to the PDF
 * @returns {Promise<string[]>} array of temp single-page PDF paths
 */
async function splitPdfIntoPages(filePath) {
  const srcBytes = fs.readFileSync(filePath);
  const srcDoc = await PDFDocument.load(srcBytes, { ignoreEncryption: true });
  const pageCount = srcDoc.getPageCount();

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ocr-contract-'));
  const pagePaths = [];

  for (let i = 0; i < pageCount; i++) {
    const outDoc = await PDFDocument.create();
    const [copied] = await outDoc.copyPages(srcDoc, [i]);
    outDoc.addPage(copied);
    const outBytes = await outDoc.save();
    const outPath = path.join(dir, `page-${i + 1}.pdf`);
    fs.writeFileSync(outPath, outBytes);
    pagePaths.push(outPath);
  }

  return pagePaths;
}

/** Remove a temp directory created by splitPdfIntoPages. */
function cleanupSplitPages(pagePaths) {
  if (!pagePaths?.length) return;
  const dir = path.dirname(pagePaths[0]);
  fs.promises.rm(dir, { recursive: true, force: true }).catch(() => {});
}

/**
 * Scan ONE page of a contract using the per-page prompt. Mirrors the same
 * method chain as processDocument (vision → OCR.space+Gemini → regex) so the
 * configured ocr_method is honoured for every page.
 * @param {string} filePath — absolute path to the single-page PDF/image
 * @param {number} pageNum — 1-based page number (for the prompt)
 * @param {Object} settings — { ocr_method, ocr_space_api_key, gemini_api_key }
 * @returns {Promise<{rawText: string, fields: Object}>}
 */
async function scanContractPage(filePath, pageNum, settings = {}) {
  const ocrMethod = settings.ocr_method || 'auto';
  const hasGeminiKey = !!settings.gemini_api_key;
  const prompt = GEMINI_PROMPTS.contract_page.replace(/\{PAGE\}/g, String(pageNum));

  if (ocrMethod === 'gemini_vision') {
    if (!hasGeminiKey) {
      throw new Error('Gemini vision is selected but no Gemini API key is configured in Settings');
    }
    const fields = await structureWithGeminiVision(filePath, 'contract', settings.gemini_api_key, prompt);
    fields._type = `contract_page${pageNum}_vision`;
    return { rawText: '', fields };
  }

  if (ocrMethod === 'ocrspace_regex') {
    const rawText = await extractBilingualWithOcrSpace(filePath, settings.ocr_space_api_key);
    const fields = extractByRegex('contract', rawText);
    fields._type = `contract_page${pageNum}_regex`;
    return { rawText, fields };
  }

  if (ocrMethod === 'ocrspace_gemini') {
    const rawText = await extractBilingualWithOcrSpace(filePath, settings.ocr_space_api_key);
    if (!hasGeminiKey) {
      const fields = extractByRegex('contract', rawText);
      fields._type = `contract_page${pageNum}_basic`;
      fields._error = 'No Gemini API key configured — using basic extraction';
      return { rawText, fields };
    }
    try {
      const fields = await structureWithGemini(rawText, 'contract', settings.gemini_api_key, prompt);
      fields._type = `contract_page${pageNum}_gemini`;
      return { rawText, fields };
    } catch (err) {
      const fields = extractByRegex('contract', rawText);
      fields._type = `contract_page${pageNum}_basic`;
      fields._error = `Gemini failed, using basic extraction: ${err.message}`;
      return { rawText, fields };
    }
  }

  // auto (default): Gemini vision → OCR.space + Gemini text → regex
  if (hasGeminiKey) {
    try {
      const fields = await structureWithGeminiVision(filePath, 'contract', settings.gemini_api_key, prompt);
      fields._type = `contract_page${pageNum}_vision`;
      return { rawText: '', fields };
    } catch (visionErr) {
      // Vision unavailable — fall through to OCR.space + Gemini text
    }
  }

  const rawText = await extractBilingualWithOcrSpace(filePath, settings.ocr_space_api_key);

  if (hasGeminiKey) {
    try {
      const fields = await structureWithGemini(rawText, 'contract', settings.gemini_api_key, prompt);
      fields._type = `contract_page${pageNum}_gemini`;
      return { rawText, fields };
    } catch (err) {
      const fields = extractByRegex('contract', rawText);
      fields._type = `contract_page${pageNum}_basic`;
      fields._error = `Gemini failed, using basic extraction: ${err.message}`;
      return { rawText, fields };
    }
  }

  const fields = extractByRegex('contract', rawText);
  fields._type = `contract_page${pageNum}_basic`;
  fields._error = 'No Gemini API key configured — using basic extraction';
  return { rawText, fields };
}

module.exports = {
  callWithRetry,
  extractWithOcrSpace,
  extractEmiratesId,
  extractPassport,
  extractBill,
  extractPermit,
  structureWithGemini,
  structureWithGeminiVision,
  processDocument,
  splitPdfIntoPages,
  cleanupSplitPages,
  scanContractPage,
};
