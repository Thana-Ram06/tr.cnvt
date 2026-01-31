'use client';

import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import styles from './page.module.css';

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';

export default function ImageToPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<'idle' | 'converting' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list?.length) return;
    const arr = Array.from(list).filter((f) => f.type.startsWith('image/'));
    setFiles(arr);
    setStatus('idle');
    setErrorMsg('');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const arr = Array.from(e.dataTransfer.files || []).filter((f) => f.type.startsWith('image/'));
    setFiles(arr);
    setStatus('idle');
    setErrorMsg('');
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => e.preventDefault(), []);

  const loadImage = (file: File): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });

  const imageToDataUrl = (img: HTMLImageElement): string => {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not available');
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.92);
  };

  const handleConvert = useCallback(async () => {
    if (!files.length) return;
    setStatus('converting');
    setErrorMsg('');
    try {
      const doc = new jsPDF({ unit: 'px' });
      const pdfW = doc.internal.pageSize.getWidth();
      const pdfH = doc.internal.pageSize.getHeight();
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const img = await loadImage(file);
        URL.revokeObjectURL(img.src);
        const dataUrl = imageToDataUrl(img);
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const scale = Math.min(pdfW / w, pdfH / h, 1);
        const drawW = w * scale;
        const drawH = h * scale;
        const x = (pdfW - drawW) / 2;
        const y = (pdfH - drawH) / 2;
        if (i > 0) doc.addPage();
        doc.addImage(dataUrl, 'JPEG', x, y, drawW, drawH);
      }
      const baseName = files.length === 1
        ? files[0].name.replace(/\.[^.]+$/, '')
        : 'images';
      doc.save(`${baseName}.pdf`);
      setStatus('done');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Conversion failed');
      setStatus('error');
    }
  }, [files]);

  const triggerInput = () => inputRef.current?.click();

  return (
    <main className={styles.main}>
      <div className={styles.toolContainer}>
        <Link href="/" className={styles.backLink}>← Back to all tools</Link>
        <h1 className={styles.toolTitle}>Image to PDF</h1>
        <p className={styles.toolDescription}>
          Convert one or more images to a single PDF. All processing happens locally in your browser.
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
            accept={IMAGE_ACCEPT}
            multiple
            onChange={handleFileChange}
            className={styles.fileInput}
            aria-label="Select images"
          />
          <div className={styles.uploadVisual} aria-hidden />
          <p className={styles.uploadText}>
            {files.length ? `${files.length} file(s) selected` : 'Click to select images or drag and drop'}
          </p>
          <p className={styles.uploadHint}>JPG, PNG, WEBP, GIF</p>
        </div>
        {errorMsg && <p className={styles.errorText}>{errorMsg}</p>}
        <button
          className={styles.convertButton}
          disabled={!files.length || status === 'converting'}
          onClick={handleConvert}
        >
          {status === 'converting' ? 'Converting…' : 'Convert to PDF'}
        </button>
      </div>
      <footer className={styles.footer}>
        <p>© 2026 tree.je — All rights reserved</p>
      </footer>
    </main>
  );
}
