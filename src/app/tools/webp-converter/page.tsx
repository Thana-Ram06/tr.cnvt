'use client';

import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';
import styles from './page.module.css';

function convertWebp(file: File, format: 'png' | 'jpg'): Promise<void> {
  const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
  const ext = format === 'jpg' ? 'jpg' : 'png';
  const quality = format === 'jpg' ? 0.92 : undefined;
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not available')); return; }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('Conversion failed')); return; }
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = file.name.replace(/\.[^.]+$/, '') + '.' + ext;
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 100);
          resolve();
        },
        mime,
        quality
      );
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export default function WebpConverterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<'png' | 'jpg'>('png');
  const [status, setStatus] = useState<'idle' | 'converting' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f?.type === 'image/webp') { setFile(f); setErrorMsg(''); } else if (f) setErrorMsg('Please select a WEBP file.');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f?.type === 'image/webp') { setFile(f); setErrorMsg(''); } else if (f) setErrorMsg('Please drop a WEBP file.');
  }, []);

  const handleConvert = useCallback(async () => {
    if (!file) return;
    setStatus('converting');
    setErrorMsg('');
    try {
      await convertWebp(file, format);
      setStatus('done');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Conversion failed');
      setStatus('error');
    }
  }, [file, format]);

  return (
    <main className={styles.main}>
      <div className={styles.toolContainer}>
        <Link href="/" className={styles.backLink}>Back to all tools</Link>
        <h1 className={styles.toolTitle}>WEBP Converter</h1>
        <p className={styles.toolDescription}>Convert WEBP to JPG or PNG locally in your browser.</p>
        <div className={styles.uploadArea} onClick={() => inputRef.current?.click()} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} role="button" tabIndex={0}>
          <input ref={inputRef} type="file" accept="image/webp" onChange={handleFileChange} className={styles.fileInput} aria-label="Select WEBP" />
          <div className={styles.uploadVisual} aria-hidden />
          <p className={styles.uploadText}>{file ? file.name : 'Click to select WEBP or drag and drop'}</p>
          <p className={styles.uploadHint}>WEBP only</p>
        </div>
        {errorMsg && <p className={styles.errorText}>{errorMsg}</p>}
        <div className={styles.options}>
          <div className={styles.optionGroup}>
            <label htmlFor="format">Output format</label>
            <select id="format" className={styles.select} value={format} onChange={(e) => setFormat(e.target.value as 'png' | 'jpg')}>
              <option value="png">PNG</option>
              <option value="jpg">JPG</option>
            </select>
          </div>
        </div>
        <button className={styles.convertButton} disabled={!file || status === 'converting'} onClick={handleConvert}>
          {status === 'converting' ? 'Converting...' : 'Convert to ' + (format === 'jpg' ? 'JPG' : 'PNG')}
        </button>
      </div>
      <footer className={styles.footer}><p>© 2026 tree.je — All rights reserved</p></footer>
    </main>
  );
}
