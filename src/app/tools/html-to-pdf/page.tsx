import Link from 'next/link';

export default function HtmlToPdfPage() {
  return (
    <main style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column', padding: '1.5rem', fontFamily: 'var(--font-body)' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1.5rem', flex: 1 }}>
        <Link href="/" style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', display: 'inline-block' }}>Back to all tools</Link>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '0.5rem' }}>HTML to PDF</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>This tool is coming soon. Use Image to PDF or PDF to Image in the meantime.</p>
      </div>
      <footer style={{ marginTop: 'auto', padding: '1.5rem', textAlign: 'center', borderTop: '1px solid var(--color-border)' }}>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>© 2026 tree.je — All rights reserved</p>
      </footer>
    </main>
  );
}
