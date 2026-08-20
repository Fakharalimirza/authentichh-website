const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

exports.getAll = async (req, res, next) => {
  try {
    const { search, is_active, page = 1, limit = 25 } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit) || 25));
    const offset = (pageNum - 1) * limitNum;

    let whereClause = '';
    const params = [];
    const conditions = [];
    if (search) {
      conditions.push('(l.full_name LIKE ? OR l.email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (is_active !== undefined && is_active !== '') {
      conditions.push('l.is_active = ?');
      params.push(parseInt(is_active));
    }
    if (conditions.length > 0) {
      whereClause = ' WHERE ' + conditions.join(' AND ');
    }

    const countQuery = `SELECT COUNT(*) as total FROM landlords l${whereClause}`;
    const [[{ total }]] = await pool.query(countQuery, params);

    let query = `SELECT l.id, l.full_name, l.full_name_ar, l.email, l.phone, l.nationality, l.is_active,
      l.identity_number, l.passport_number, l.date_of_birth,
      l.bank_name, l.bank_account_holder, l.bank_account_number,
      l.swift_code, l.iban, l.bank_branch, l.bank_account_currency, l.bank_address,
      l.created_at, l.updated_at,
      (SELECT COUNT(*) FROM units u WHERE u.landlord_id = l.id) as unit_count
      FROM landlords l${whereClause} ORDER BY l.created_at DESC LIMIT ? OFFSET ?`;
    const [landlords] = await pool.query(query, [...params, limitNum, offset]);

    const totalPages = Math.max(1, Math.ceil(total / limitNum));
    res.json({ data: landlords, pagination: { page: pageNum, limit: limitNum, total, totalPages } });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const [landlords] = await pool.query(
      `SELECT l.*, (SELECT COUNT(*) FROM units u WHERE u.landlord_id = l.id) as unit_count
       FROM landlords l WHERE l.id = ?`,
      [req.params.id]
    );
    if (landlords.length === 0) return res.status(404).json({ message: 'Landlord not found' });
    const { password_hash, ...landlord } = landlords[0];
    res.json(landlord);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const {
      full_name, full_name_ar, email, phone, identity_number, passport_number, nationality,
      identity_document_url, unit_agreement_url, password,
      is_active, send_welcome_email, date_of_birth,
      bank_name, bank_account_holder, bank_account_number,
      swift_code, iban, bank_branch, bank_account_currency, bank_address
    } = req.body;

    if (!full_name || !email) return res.status(400).json({ message: 'full_name and email are required' });

    const password_hash = password ? await bcrypt.hash(password, 10) : '';

    const [result] = await pool.query(
      `INSERT INTO landlords (full_name, full_name_ar, email, phone, identity_number, passport_number, nationality,
        identity_document_url, unit_agreement_url, password_hash, is_active, send_welcome_email,
        date_of_birth, bank_name, bank_account_holder, bank_account_number, swift_code, iban, bank_branch,
        bank_account_currency, bank_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [full_name, full_name_ar || '', email, phone || '', identity_number || '', passport_number || '', nationality || '',
       identity_document_url || '', unit_agreement_url || '', password_hash,
       is_active ?? 1, send_welcome_email ?? 0, date_of_birth || null,
       bank_name || '', bank_account_holder || '', bank_account_number || '',
       swift_code || '', iban || '', bank_branch || '',
       bank_account_currency || '', bank_address || '']
    );

    const [landlord] = await pool.query(
      'SELECT id, full_name, full_name_ar, email, phone, nationality, is_active, created_at FROM landlords WHERE id = ?',
      [result.insertId]
    );
    res.status(201).json(landlord[0]);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const {
      full_name, full_name_ar, email, phone, identity_number, passport_number, nationality,
      identity_document_url, unit_agreement_url, password,
      is_active, send_welcome_email, date_of_birth,
      bank_name, bank_account_holder, bank_account_number,
      swift_code, iban, bank_branch, bank_account_currency, bank_address
    } = req.body;

    let passwordClause = '';
    let params = [full_name ?? null, full_name_ar ?? null, email ?? null, phone ?? null, identity_number ?? null, passport_number ?? null, nationality ?? null,
      identity_document_url ?? null, unit_agreement_url ?? null,
      is_active ?? null, send_welcome_email ?? null, date_of_birth ?? null,
      bank_name ?? null, bank_account_holder ?? null, bank_account_number ?? null,
      swift_code ?? null, iban ?? null, bank_branch ?? null,
      bank_account_currency ?? null, bank_address ?? null, req.params.id];

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      passwordClause = ', password_hash = ?';
      params.splice(9, 0, hash);
    }

    await pool.query(
      `UPDATE landlords SET
        full_name = COALESCE(?, full_name),
        full_name_ar = COALESCE(?, full_name_ar),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        identity_number = COALESCE(?, identity_number),
        passport_number = COALESCE(?, passport_number),
        nationality = COALESCE(?, nationality),
        identity_document_url = COALESCE(?, identity_document_url),
        unit_agreement_url = COALESCE(?, unit_agreement_url)${passwordClause},
        is_active = COALESCE(?, is_active),
        send_welcome_email = COALESCE(?, send_welcome_email),
        date_of_birth = COALESCE(?, date_of_birth),
        bank_name = COALESCE(?, bank_name),
        bank_account_holder = COALESCE(?, bank_account_holder),
        bank_account_number = COALESCE(?, bank_account_number),
        swift_code = COALESCE(?, swift_code),
        iban = COALESCE(?, iban),
        bank_branch = COALESCE(?, bank_branch),
        bank_account_currency = COALESCE(?, bank_account_currency),
        bank_address = COALESCE(?, bank_address)
       WHERE id = ?`,
      params
    );

    const [landlord] = await pool.query(
      'SELECT id, full_name, full_name_ar, email, phone, nationality, is_active, created_at FROM landlords WHERE id = ?',
      [req.params.id]
    );
    res.json(landlord[0]);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const [units] = await pool.query('SELECT COUNT(*) as cnt FROM units WHERE landlord_id = ?', [req.params.id]);
    if (units[0].cnt > 0) {
      return res.status(400).json({ message: 'Cannot delete landlord with assigned units' });
    }
    await pool.query('DELETE FROM landlords WHERE id = ?', [req.params.id]);
    res.json({ message: 'Landlord deleted' });
  } catch (err) { next(err); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    if (!req.body.password) return res.status(400).json({ message: 'Password is required' });
    const hash = await bcrypt.hash(req.body.password, 10);
    await pool.query('UPDATE landlords SET password_hash=? WHERE id=?', [hash, req.params.id]);
    res.json({ message: 'Password updated' });
  } catch (err) { next(err); }
};

exports.bulkImport = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'CSV file is required' });
    }

    const rows = [];
    const errors = [];
    let rowNum = 0;

    await new Promise((resolve, reject) => {
      const stream = require('stream');
      const readable = new stream.Readable();
      readable.push(req.file.buffer);
      readable.push(null);
      
      readable
        .pipe(csv())
        .on('data', (row) => {
          rowNum++;
          const full_name = (row.full_name || '').trim();
          const email = (row.email || '').trim();
          if (!full_name || !email) {
            errors.push({ row: rowNum + 1, message: 'full_name and email are required' });
            return;
          }
          rows.push({
            full_name,
            email,
            phone: (row.phone || '').trim(),
            nationality: (row.nationality || '').trim(),
            identity_number: (row.identity_number || '').trim(),
            passport_number: (row.passport_number || '').trim(),
            bank_name: (row.bank_name || '').trim(),
            iban: (row.iban || '').trim(),
            bank_account_number: (row.bank_account_number || '').trim(),
            swift_code: (row.swift_code || '').trim(),
            bank_branch: (row.bank_branch || '').trim(),
            bank_account_holder: (row.bank_account_holder || '').trim(),
            bank_account_currency: (row.bank_account_currency || '').trim(),
            bank_address: (row.bank_address || '').trim(),
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Check for duplicate emails in DB
    if (rows.length > 0) {
      const emails = rows.map(r => r.email);
      const [existing] = await pool.query(
        'SELECT email FROM landlords WHERE email IN (?)',
        [emails]
      );
      const existingEmails = new Set(existing.map(e => e.email));
      
      const toInsert = [];
      const skipped = [];
      for (const row of rows) {
        if (existingEmails.has(row.email)) {
          skipped.push({ row: row.email, message: `Landlord with email "${row.email}" already exists` });
        } else {
          toInsert.push(row);
          existingEmails.add(row.email); // prevent dupes within the CSV itself
        }
      }

      // Batch insert
      let imported = 0;
      for (const row of toInsert) {
        try {
          const password_hash = ''; // No password set via CSV import
          await pool.query(
            `INSERT INTO landlords (full_name, full_name_ar, email, phone, identity_number, passport_number, nationality,
              identity_document_url, unit_agreement_url, password_hash, is_active, send_welcome_email,
              bank_name, bank_account_holder, bank_account_number, swift_code, iban, bank_branch,
              bank_account_currency, bank_address)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [row.full_name, row.full_name_ar || '', row.email, row.phone, row.identity_number, row.passport_number, row.nationality,
             '', '', password_hash, 1, 0,
             row.bank_name, row.bank_account_holder, row.bank_account_number,
             row.swift_code, row.iban, row.bank_branch,
             row.bank_account_currency, row.bank_address]
          );
          imported++;
        } catch (e) {
          errors.push({ row: row.email, message: e.message });
        }
      }

      return res.json({
        message: `Imported ${imported} landlords` + (skipped.length ? `, ${skipped.length} skipped` : '') + (errors.length ? `, ${errors.length} errors` : ''),
        imported,
        skipped: skipped.length,
        errors: [...skipped, ...errors],
      });
    }

    res.json({ message: 'No valid rows to import', imported: 0, skipped: 0, errors });
  } catch (err) { next(err); }
};

// ── Document endpoints ──────────────────────────────────────────

exports.getDocuments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [docs] = await pool.query(
      `SELECT id, document_type, document_url, permit_number, expiry_date, document_number, created_at
       FROM unit_documents WHERE landlord_id = ? ORDER BY created_at DESC`,
      [id]
    );
    res.json(docs);
  } catch (err) { next(err); }
};

exports.uploadDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type, expiry_date, document_number } = req.body;

    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    if (!type || !['emirates_id', 'passport'].includes(type)) {
      return res.status(400).json({ message: 'type must be emirates_id or passport' });
    }

    // Verify landlord exists
    const [landlord] = await pool.query('SELECT id FROM landlords WHERE id = ?', [id]);
    if (landlord.length === 0) return res.status(404).json({ message: 'Landlord not found' });

    // Delete existing doc of the same type for this landlord
    const [existing] = await pool.query(
      'SELECT id, document_url FROM unit_documents WHERE landlord_id = ? AND document_type = ?',
      [id, type]
    );
    for (const doc of existing) {
      if (doc.document_url) {
        const filePath = path.join(__dirname, '..', doc.document_url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
      await pool.query('DELETE FROM unit_documents WHERE id = ?', [doc.id]);
    }

    const fileUrl = `uploads/documents/${req.file.filename}`;
    const [result] = await pool.query(
      `INSERT INTO unit_documents (landlord_id, document_type, document_url, expiry_date, document_number)
       VALUES (?, ?, ?, ?, ?)`,
      [id, type, fileUrl, expiry_date || null, document_number || null]
    );

    res.status(201).json({
      message: 'Document uploaded',
      document: { id: result.insertId, document_type: type, document_url: fileUrl, expiry_date: expiry_date || null, document_number: document_number || null }
    });
  } catch (err) { next(err); }
};

exports.deleteDocument = async (req, res, next) => {
  try {
    const { id, docId } = req.params;

    const [docs] = await pool.query(
      'SELECT id, document_url FROM unit_documents WHERE id = ? AND landlord_id = ?',
      [docId, id]
    );
    if (docs.length === 0) return res.status(404).json({ message: 'Document not found' });

    // Delete file from disk
    if (docs[0].document_url) {
      const filePath = path.join(__dirname, '..', docs[0].document_url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await pool.query('DELETE FROM unit_documents WHERE id = ?', [docId]);
    res.json({ message: 'Document deleted' });
  } catch (err) { next(err); }
};

exports.updateDocument = async (req, res, next) => {
  try {
    const { id, docId } = req.params;
    const { expiry_date, permit_number, document_number } = req.body;

    const [docs] = await pool.query(
      'SELECT id FROM unit_documents WHERE id = ? AND landlord_id = ?',
      [docId, id]
    );
    if (docs.length === 0) return res.status(404).json({ message: 'Document not found' });

    await pool.query(
      'UPDATE unit_documents SET expiry_date = COALESCE(?, expiry_date), permit_number = COALESCE(?, permit_number), document_number = COALESCE(?, document_number) WHERE id = ?',
      [expiry_date !== undefined ? expiry_date : null, permit_number !== undefined ? permit_number : null, document_number !== undefined ? document_number : null, docId]
    );

    res.json({ message: 'Document updated' });
  } catch (err) { next(err); }
};
