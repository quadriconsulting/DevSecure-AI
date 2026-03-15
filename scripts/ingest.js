// Author: Jeremy Quadri
// scripts/ingest.js
//
// Ingests rag_docs/*.md + optional PDFs into a Cloudflare Vectorize JSONL file.
// Usage:  node scripts/ingest.js
// Output: devsecure-vectors.jsonl
//
// IMPORTANT — Embedding dimensions:
//   This script uses text-embedding-3-small at 1536 dims.
//   The jq-rag Vectorize index was originally created at 768 dims (bge-base-en-v1.5).
//   Before running `wrangler vectorize insert`, the index must match 1536 dims.
//   To recreate it at 1536 dims:
//     npx wrangler vectorize delete jq-rag
//     npx wrangler vectorize create jq-rag --dimensions=1536 --metric=cosine
//   Also update chat.js to embed queries via OpenAI instead of CF AI.
//   See: QUERY_MODEL note at the bottom of this file.

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import XLSXModule from 'xlsx';
const XLSX = XLSXModule.default ?? XLSXModule;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// --- Config ---
const TENANT          = 'devsecure';
const CHUNK_SIZE      = 1000;   // target chars per chunk
const BATCH_SIZE      = 100;    // embeddings per OpenAI request
const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMS  = 1536;
const OUTPUT_FILE     = path.join(ROOT, 'devsecure-vectors.jsonl');

// PDFs to load (must be present in rag_docs/)
const PDF_FILES = [
  'devsecure_autonomous_sast_14.pdf',
  'DevSecure Platform v4.0 Technical Architecture Specification.pdf',
];

// XLSX pricing sheet (in rag_docs/)
const XLSX_FILE       = 'Pricing_Sheet.xlsx';
const XLSX_SHEET_NAME = 'Updated Pricing v1.2';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Split text into ~CHUNK_SIZE char chunks, cutting at sentence boundaries
 * to avoid splitting mid-sentence.
 */
function chunkText(text, size = CHUNK_SIZE) {
  const t = (text || '').trim();
  if (!t) return [];

  const chunks = [];
  let start = 0;

  while (start < t.length) {
    let end = Math.min(start + size, t.length);

    if (end < t.length) {
      // Walk back to the nearest sentence boundary within the second half
      const window = t.slice(start, end);
      const sentEnd = Math.max(
        window.lastIndexOf('. '),
        window.lastIndexOf('.\n'),
        window.lastIndexOf('! '),
        window.lastIndexOf('? '),
      );
      if (sentEnd > size * 0.4) end = start + sentEnd + 1;
    }

    const chunk = t.slice(start, end).trim();
    if (chunk) chunks.push(chunk);
    start = end;
  }

  return chunks;
}

/** Safe filename slug for chunk IDs (max 40 chars). */
function slugify(name) {
  return name.replace(/[^a-z0-9._-]/gi, '-').toLowerCase().slice(0, 40);
}

// ---------------------------------------------------------------------------
// Loaders
// ---------------------------------------------------------------------------

function loadMarkdownFiles() {
  const entries = [];
  const ragDir = path.join(ROOT, 'rag_docs');

  if (!fs.existsSync(ragDir)) {
    console.warn('[warn] rag_docs/ directory not found — skipping markdown files');
    return entries;
  }

  const files = fs.readdirSync(ragDir)
    .filter(f => f.endsWith('.md'))
    .sort();

  console.log(`[load] ${files.length} markdown files in rag_docs/`);
  for (const file of files) {
    const text = fs.readFileSync(path.join(ragDir, file), 'utf-8');
    entries.push({ source: file, text });
  }

  return entries;
}

async function loadPdfFiles() {
  const entries = [];

  let pdfjsLib;
  try {
    pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  } catch {
    console.warn('[warn] pdfjs-dist unavailable — skipping PDFs');
    return entries;
  }

  for (const pdfName of PDF_FILES) {
    const pdfPath = path.join(ROOT, 'rag_docs', pdfName);
    if (!fs.existsSync(pdfPath)) {
      console.warn(`[warn] PDF not found, skipping: ${pdfName}`);
      continue;
    }
    try {
      const data = new Uint8Array(fs.readFileSync(pdfPath));
      const doc = await pdfjsLib.getDocument({ data }).promise;
      let text = '';
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(s => s.str).join(' ') + '\n';
      }
      console.log(`[load] PDF "${pdfName}" — ${doc.numPages} pages, ${text.length} chars`);
      entries.push({ source: pdfName, text });
    } catch (e) {
      console.error(`[error] Failed to parse "${pdfName}":`, e.message);
    }
  }

  return entries;
}

function loadXlsxFile() {
  const filePath = path.join(ROOT, 'rag_docs', XLSX_FILE);
  if (!fs.existsSync(filePath)) {
    console.warn(`[warn] XLSX not found, skipping: ${XLSX_FILE}`);
    return [];
  }

  const workbook  = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames.includes(XLSX_SHEET_NAME)
    ? XLSX_SHEET_NAME
    : workbook.SheetNames[0];

  const sheet = workbook.Sheets[sheetName];
  const rows  = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  // Serialise each row as "key: value | key: value" so it reads naturally as plain text
  const lines = rows
    .map(row =>
      Object.entries(row)
        .filter(([, v]) => String(v).trim() !== '')
        .map(([k, v]) => `${k}: ${v}`)
        .join(' | ')
    )
    .filter(line => line.length > 0);

  const text = lines.join('\n');
  console.log(`[load] XLSX "${XLSX_FILE}" sheet "${sheetName}" — ${rows.length} rows, ${text.length} chars`);
  return [{ source: XLSX_FILE, text }];
}

// ---------------------------------------------------------------------------
// Embeddings
// ---------------------------------------------------------------------------

async function embedBatch(openai, texts) {
  const resp = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
    dimensions: EMBEDDING_DIMS,
  });
  // OpenAI returns results in the same order as input
  return resp.data.sort((a, b) => a.index - b.index).map(d => d.embedding);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('[error] OPENAI_API_KEY not set. Add it to your .env file:');
    console.error('        OPENAI_API_KEY=sk-...');
    process.exit(1);
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  console.log(`[config] Model: ${EMBEDDING_MODEL} | Dims: ${EMBEDDING_DIMS} | Tenant: ${TENANT}`);
  console.log(`[config] Chunk size: ${CHUNK_SIZE} chars | Batch size: ${BATCH_SIZE}`);

  // 1) Load source files
  const mdEntries   = loadMarkdownFiles();
  const pdfEntries  = await loadPdfFiles();
  const xlsxEntries = loadXlsxFile();
  const allEntries  = [...mdEntries, ...pdfEntries, ...xlsxEntries];

  if (allEntries.length === 0) {
    console.error('[error] No source files loaded. Nothing to do.');
    process.exit(1);
  }
  console.log(`[load] Total source files: ${allEntries.length}`);

  // 2) Chunk all text
  const chunks = [];
  for (const { source, text } of allEntries) {
    const slug = slugify(source);
    const parts = chunkText(text);
    for (let i = 0; i < parts.length; i++) {
      // ID must be <= 64 bytes per Cloudflare Vectorize limit
      const id = `${TENANT}-${slug}-${i}`.slice(0, 64);
      chunks.push({ id, source, text: parts[i] });
    }
  }
  console.log(`[chunk] Total chunks: ${chunks.length}`);

  // 3) Embed in batches and stream to JSONL
  const out = fs.createWriteStream(OUTPUT_FILE, { encoding: 'utf-8' });
  let total = 0;

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(chunks.length / BATCH_SIZE);

    process.stdout.write(
      `[embed] Batch ${batchNum}/${totalBatches} (chunks ${i + 1}–${Math.min(i + BATCH_SIZE, chunks.length)})...`
    );

    const embeddings = await embedBatch(openai, batch.map(c => c.text));
    process.stdout.write(' done\n');

    for (let j = 0; j < batch.length; j++) {
      const record = {
        id: batch[j].id,
        values: embeddings[j],
        metadata: {
          tenant_id: TENANT,       // strict multi-tenant isolation — matches Vectorize filter in chat.js
          type: 'professional',    // used by chat.js professional-filter query
          source: batch[j].source,
          text: batch[j].text,     // chat.js reads meta?.text for RAG context
        },
      };
      out.write(JSON.stringify(record) + '\n');
      total++;
    }

    // Brief pause to respect OpenAI rate limits between batches
    if (i + BATCH_SIZE < chunks.length) {
      await new Promise(r => setTimeout(r, 250));
    }
  }

  await new Promise((resolve, reject) => {
    out.on('finish', resolve);
    out.on('error', reject);
    out.end();
  });

  console.log(`\n[done] Wrote ${total} vectors -> ${OUTPUT_FILE}`);
  console.log('\nNext steps:');
  console.log('  1. Ensure jq-rag index is 1536-dim (see IMPORTANT note at top of this file)');
  console.log('  2. npx wrangler vectorize insert jq-rag --file devsecure-vectors.jsonl');
}

main().catch(err => {
  console.error('[fatal]', err.message || err);
  process.exit(1);
});
