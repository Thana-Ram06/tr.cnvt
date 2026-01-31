'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './page.module.css';

const PDF_WORKER_URL = 'https://unpkg.com/pdfjs-dist@4.7.76/build/pdf.worker.min.mjs';

function getInitialFormat(searchParams: ReturnType<typeof useSearchParams>): 'png' | 'jpg' {
  const f = searchParams?.get('format');
  return f === 'jpg' ? 'jpg' : 'png';
}

export default function PdfToImagePage() {
  const searchParams = useSearchParams();
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<'png' | 'jpg'>(() => getInitialFormat(searchParams));
  useEffect(() => {
    setFormat(getInitialFormat(searchParams));
  }, [searchParams]);
  const [dpi, setDpi] = useState(150);
  const [status, setStatus] = useState<'idle' | 'converting' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f?.type === 'application/pdf') {
      setFile(f);
      setStatus('idle');
      setErrorMsg('');
    } else if (f) {
      setFile(null);
      setErrorMsg('Please select a PDF file.');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f?.type === 'application/pdf') {
      setFile(f);
      setStatus('idle');
      setErrorMsg('');
    } else if (f) {
      setErrorMsg('Please drop a PDF file.');
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => e.preventDefault(), []);

  const handleConvert = useCallback(async () => {
    if (!file) return;
    setStatus('converting');
    setErrorMsg('');
    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;

      const data = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data }).promise;
      const numPages = pdf.numPages;
      const scale = dpi / 72;

      const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
      const quality = format === 'jpg' ? 0.92 : undefined;
      const baseName = file.name.replace(/\.pdf$/i, '');

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas not available');
        await page.render({ canvasContext: ctx, viewport }).promise;

        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve, mime, quality);
        });
        if (!blob) continue;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = numPages > 1 ? `${baseName}_page${i}.${format}` : `${baseName}.${format}`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 100);
      }
      setStatus('done');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Conversion failed');
      setStatus('error');
    }
  }, [file, format, dpi]);

  const triggerInput = () => inputRef.current?.click();

  return (
    <main className={styles.main}>
      <div className={styles.toolContainer}>
        <Link href="/" className={styles.backLink}>← Back to all tools</Link>

        <h1 className={styles.toolTitle}>PDF to Image</h1>
        <p className={styles.toolDescription}>
          Convert your PDF pages to high-quality JPG or PNG images. All processing happens locally in your browser.
        </p>

        <div
          className={styles.uploadArea}
          onClick={triggerInput}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && triggerInput()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className={styles.fileInput}
            aria-label="Select PDF file"
          />
          <div className={styles.uploadVisual} aria-hidden />
          <p className={styles.uploadText}>
            {file ? file.name : 'Click to select PDF or drag and drop'}
          </p>
          <p className={styles.uploadHint}>Supports multi-page PDFs</p>
        </div>

        {errorMsg && <p className={styles.errorText}>{errorMsg}</p>}

        <div className={styles.options}>
          <div className={styles.optionGroup}>
            <label htmlFor="format">Output Format</label>
            <select
              id="format"
              className={styles.select}
              value={format}
              onChange={(e) => setFormat(e.target.value as 'png' | 'jpg')}
            >
              <option value="png">PNG</option>
              <option value="jpg">JPG</option>
            </select>
          </div>
          <div className={styles.optionGroup}>
            <label htmlFor="quality">Quality (DPI)</label>
            <select
              id="quality"
              className={styles.select}
              value={dpi}
              onChange={(e) => setDpi(Number(e.target.value))}
            >
              <option value="150">150 DPI (Fast)</option>
              <option value="300">300 DPI (Recommended)</option>
              <option value="600">600 DPI (High Quality)</option>
            </select>
          </div>
        </div>

        <button
          className={styles.convertButton}
          disabled={!file || status === 'converting'}
          onClick={handleConvert}
        >
          {status === 'converting' ? 'Converting…' : 'Convert to Image'}
        </button>
      </div>

      <footer className={styles.footer}>
        <p>© 2026 tree.je — All rights reserved</p>
      </footer>
    </main>
  );
}
