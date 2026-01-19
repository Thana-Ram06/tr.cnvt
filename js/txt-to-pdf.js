const { jsPDF } = window.jspdf;

const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const fontSize = document.getElementById('fontSize');
const pageSize = document.getElementById('pageSize');
const orientation = document.getElementById('orientation');
const convertBtn = document.getElementById('convertBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');

let selectedFile = null;

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'text/plain') {
        handleFileSelect(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
    }
});

function handleFileSelect(file) {
    if (!file.name.toLowerCase().endsWith('.txt') && file.type !== 'text/plain') {
        showError('Please select a valid TXT file.');
        return;
    }

    selectedFile = file;
    fileName.textContent = `File: ${file.name}`;
    fileSize.textContent = `Size: ${formatFileSize(file.size)}`;
    fileInfo.classList.add('active');
    convertBtn.disabled = false;
    error.classList.remove('active');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function showError(message) {
    error.textContent = message;
    error.classList.add('active');
}

convertBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    loading.classList.add('active');
    convertBtn.disabled = true;
    error.classList.remove('active');

    try {
        const text = await selectedFile.text();
        
        const pageSizeMap = {
            'a4': [210, 297],
            'letter': [216, 279],
            'legal': [216, 356]
        };

        const orientationMap = {
            'portrait': pageSizeMap[pageSize.value],
            'landscape': [pageSizeMap[pageSize.value][1], pageSizeMap[pageSize.value][0]]
        };

        const dimensions = orientationMap[orientation.value];
        const pdf = new jsPDF({
            orientation: orientation.value === 'landscape' ? 'landscape' : 'portrait',
            unit: 'mm',
            format: pageSize.value === 'a4' ? 'a4' : pageSize.value === 'letter' ? 'letter' : 'legal'
        });

        pdf.setFontSize(parseInt(fontSize.value));
        
        const lines = text.split('\n');
        const pageHeight = dimensions[1];
        const margin = 20;
        const lineHeight = parseInt(fontSize.value) * 0.352778; // Convert pt to mm
        let y = margin;
        let page = 1;

        for (let i = 0; i < lines.length; i++) {
            if (y + lineHeight > pageHeight - margin) {
                pdf.addPage();
                y = margin;
                page++;
            }

            // Handle long lines by splitting them
            const maxWidth = dimensions[0] - (margin * 2);
            const splitLines = pdf.splitTextToSize(lines[i], maxWidth);
            
            for (let j = 0; j < splitLines.length; j++) {
                if (y + lineHeight > pageHeight - margin && j > 0) {
                    pdf.addPage();
                    y = margin;
                    page++;
                }
                pdf.text(splitLines[j], margin, y);
                y += lineHeight;
            }
        }

        const pdfBlob = pdf.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = selectedFile.name.replace('.txt', '.pdf');
        link.click();
        URL.revokeObjectURL(url);

    } catch (err) {
        showError('Conversion failed: ' + err.message);
    } finally {
        loading.classList.remove('active');
        convertBtn.disabled = false;
    }
});
