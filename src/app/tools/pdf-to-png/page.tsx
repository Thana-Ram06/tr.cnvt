import { redirect } from 'next/navigation';

export default function PdfToPngPage() {
  redirect('/tools/pdf-to-image?format=png');
}
