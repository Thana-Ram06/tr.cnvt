'use client';

import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';
import styles from './page.module.css';

function svgToPng(file: File, scale: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const svgString = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const w = Math.round(img.naturalWidth * scale);
        const h = Math.round(img.naturalHeight * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas not available')); return; }
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            if (!blob) { reject(new Error('Conversion failed')); return; }
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name.replace(/\.[^.]+$/, '') + '.png';
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 100);
            resolve();
          },
          'image/png'
        );
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => reject(new Error('Failed to load SVG'));
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      img.src = URL.createObjectURL(blob);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export default function SvgToPngPage() {
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState(2);
  const [status, setStatus] = useState<'idle' | 'converting' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f?.type === 'image/svg+xml') { setFile(f); setErrorMsg(''); } else if (f) setErrorMsg('Please select an SVG file.');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f?.type === 'image/svg+xml') { setFile(f); setErrorMsg(''); } else if (f) setErrorMsg('Please drop an SVG file.');
  }, []);

  const handleConvert = useCallback(async () => {
    if (!file) return;
    setStatus('converting');
    setErrorMsg('');
    try {
      await svgToPng(file, scale);
      setStatus('done');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Conversion failed');
      setStatus('error');
    }
  }, [file, scale]);

  return (
    <main className={styles.main}>
      <div className={styles.toolContainer}>
        <Link href="/" className={styles.backLink}>← Back to all tools</Link>
        <h1 className={styles.toolTitle}>SVG to PNG</h1>
        <p className={styles.toolDescription}>Convert vector SVG to PNG locally in your browser.</p>
        <div className={styles.uploadArea} onClick={() => inputRef.current?.click()} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}>
          <input ref={inputRef} type="file" accept="image/svg+xml" onChange={handleFileChange} className={styles.fileInput} aria-label="Select SVG" />
          <div className={styles.uploadVisual} aria-hidden />
          <p className={styles.uploadText}>{file ? file.name : 'Click to select SVG or drag and drop'}</p>
          <p className={styles.uploadHint}>SVG only</p>
        </div>
        {errorMsg && <p className={styles.errorText}>{errorMsg}</p>}
        <div className={styles.options}>
          <div className={styles.optionGroup}>
            <label htmlFor="scale">Output scale</label>
            <select id="scale" className={styles.select} value={scale} onChange={(e) => setScale(Number(e.target.value))}>
              <option value="1">1x</option>
              <option value="2">2x (default)</option>
              <option value="3">3x</option>
              <option value="4">4x</option>
            </select>
          </div>
        </div>
        <button className={styles.convertButton} disabled={!file || status === 'converting'} onClick={handleConvert}>
          {status === 'converting' ? 'Converting…' : 'Convert to PNG'}
        </button>
      </div>
      <footer className={styles.footer}><p>© 2026 tree.je — All rights reserved</p></footer>
    </main>
  );
}
