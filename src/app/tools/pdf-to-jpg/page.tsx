import { redirect } from 'next/navigation';

export default function PdfToJpgPage() {
  redirect('/tools/pdf-to-image?format=jpg');
}
