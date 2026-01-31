import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Simple, private file conversion.</h1>
        <p className={styles.heroSubtext}>
          All conversions happen locally in your browser. No uploads, no tracking, complete privacy.
        </p>
        <button className={styles.ctaButton}>Choose file</button>
      </section>

      {/* Tools Grid */}
      <section className={styles.toolsSection}>
        <h2 className={styles.sectionTitle}>All Tools</h2>
        <div className={styles.toolsGrid}>
          {/* PDF Tools */}
          <Link href="/tools/pdf-to-image" className={styles.toolCard}>
            <h3>PDF to Image</h3>
            <p>Convert PDF pages to JPG or PNG</p>
          </Link>

          <Link href="/tools/pdf-to-png" className={styles.toolCard}>
            <h3>PDF to PNG</h3>
            <p>Convert PDF to high-quality PNG</p>
          </Link>

          <Link href="/tools/pdf-to-jpg" className={styles.toolCard}>
            <h3>PDF to JPG</h3>
            <p>Convert PDF pages to JPG images</p>
          </Link>

          <Link href="/tools/image-to-pdf" className={styles.toolCard}>
            <h3>Image to PDF</h3>
            <p>Convert images to PDF format</p>
          </Link>

          <Link href="/tools/txt-to-pdf" className={styles.toolCard}>
            <h3>TXT to PDF</h3>
            <p>Convert text files to PDF</p>
          </Link>

          <Link href="/tools/html-to-pdf" className={styles.toolCard}>
            <h3>HTML to PDF</h3>
            <p>Convert HTML content to PDF</p>
          </Link>

          {/* Image Tools */}
          <Link href="/tools/jpg-to-png" className={styles.toolCard}>
            <h3>JPG to PNG</h3>
            <p>Convert JPG images to PNG</p>
          </Link>

          <Link href="/tools/png-to-jpg" className={styles.toolCard}>
            <h3>PNG to JPG</h3>
            <p>Convert PNG images to JPG</p>
          </Link>

          <Link href="/tools/jpg-to-webp" className={styles.toolCard}>
            <h3>JPG to WEBP</h3>
            <p>Convert JPG to modern WEBP</p>
          </Link>

          <Link href="/tools/png-to-webp" className={styles.toolCard}>
            <h3>PNG to WEBP</h3>
            <p>Convert PNG to modern WEBP</p>
          </Link>

          <Link href="/tools/webp-converter" className={styles.toolCard}>
            <h3>WEBP Converter</h3>
            <p>Convert WEBP to JPG or PNG</p>
          </Link>

          <Link href="/tools/svg-to-png" className={styles.toolCard}>
            <h3>SVG to PNG</h3>
            <p>Convert vector SVG to PNG</p>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <h2 className={styles.featuresTitle}>Why tree.je</h2>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <h3 className={styles.featureCardTitle}>Secure & privacy-first</h3>
            <p>Your files are processed only on your device. Nothing is sent to our servers.</p>
          </div>
          <div className={styles.featureCard}>
            <h3 className={styles.featureCardTitle}>No login or account</h3>
            <p>Use all tools instantly. No sign-up, no email, no tracking.</p>
          </div>
          <div className={styles.featureCard}>
            <h3 className={styles.featureCardTitle}>No file uploads</h3>
            <p>Files never leave your browser. All conversion happens locally.</p>
          </div>
          <div className={styles.featureCard}>
            <h3 className={styles.featureCardTitle}>Runs in your browser</h3>
            <p>Everything runs client-side. Fast, private, and under your control.</p>
          </div>
          <div className={styles.featureCard}>
            <h3 className={styles.featureCardTitle}>Fast & lightweight</h3>
            <p>No heavy uploads or waits. Convert files quickly on any modern device.</p>
          </div>
          <div className={styles.featureCard}>
            <h3 className={styles.featureCardTitle}>Works everywhere</h3>
            <p>Use Chrome, Firefox, Safari, or Edge. No installs required.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© 2026 tree.je — All rights reserved</p>
      </footer>
    </main>
  );
}
