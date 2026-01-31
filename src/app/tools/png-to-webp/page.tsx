'use client';

import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';
import styles from './page.module.css';

function convertToWebp(file: File): Promise<void> {
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
          a.download = file.name.replace(/\.[^.]+$/, '') + '.webp';
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 100);
          resolve();
        },
        'image/webp',
        0.9
      );
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export default function PngToWebpPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'converting' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f?.type === 'image/png') { setFile(f); setErrorMsg(''); } else if (f) setErrorMsg('Please select a PNG file.');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f?.type === 'image/png') { setFile(f); setErrorMsg(''); } else if (f) setErrorMsg('Please drop a PNG file.');
  }, []);

  const handleConvert = useCallback(async () => {
    if (!file) return;
    setStatus('converting');
    setErrorMsg('');
    try {
      await convertToWebp(file);
      setStatus('done');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Conversion failed');
      setStatus('error');
    }
  }, [file]);

  return (
    <main className={styles.main}>
      <div className={styles.toolContainer}>
        <Link href="/" className={styles.backLink}>Back to all tools</Link>
        <h1 className={styles.toolTitle}>PNG to WEBP</h1>
        <p className={styles.toolDescription}>Convert PNG to WEBP locally in your browser.</p>
        <div className={styles.uploadArea} onClick={() => inputRef.current?.click()} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} role="button" tabIndex={0}>
          <input ref={inputRef} type="file" accept="image/png" onChange={handleFileChange} className={styles.fileInput} aria-label="Select PNG" />
          <div className={styles.uploadVisual} aria-hidden />
          <p className={styles.uploadText}>{file ? file.name : 'Click to select PNG or drag and drop'}</p>
          <p className={styles.uploadHint}>PNG only</p>
        </div>
        {errorMsg && <p className={styles.errorText}>{errorMsg}</p>}
        <button className={styles.convertButton} disabled={!file || status === 'converting'} onClick={handleConvert}>
          {status === 'converting' ? 'Converting...' : 'Convert to WEBP'}
        </button>
      </div>
      <footer className={styles.footer}><p>© 2026 tree.je — All rights reserved</p></footer>
    </main>
  );
}
