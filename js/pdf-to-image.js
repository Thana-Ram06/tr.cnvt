// PDF.js worker configuration
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const formatSelect = document.getElementById('formatSelect');
const dpiSelect = document.getElementById('dpiSelect');
const pageSelect = document.getElementById('pageSelect');
const pageNumberContainer = document.getElementById('pageNumberContainer');
const pageNumber = document.getElementById('pageNumber');
const convertBtn = document.getElementById('convertBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const previewArea = document.getElementById('previewArea');
const previewImages = document.getElementById('previewImages');

let selectedFile = null;
let pdfDoc = null;
let totalPages = 0;

// Drag and drop handlers
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
    if (files.length > 0 && files[0].type === 'application/pdf') {
        handleFileSelect(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
    }
});

pageSelect.addEventListener('change', () => {
    pageNumberContainer.style.display = pageSelect.value === 'single' ? 'block' : 'none';
});

function handleFileSelect(file) {
    if (file.type !== 'application/pdf') {
        showError('Please select a valid PDF file.');
        return;
    }

    selectedFile = file;
    fileName.textContent = `File: ${file.name}`;
    fileSize.textContent = `Size: ${formatFileSize(file.size)}`;
    fileInfo.classList.add('active');
    convertBtn.disabled = false;
    error.classList.remove('active');
    previewArea.classList.remove('active');

    // Load PDF to get page count
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const typedArray = new Uint8Array(e.target.result);
            pdfDoc = await pdfjsLib.getDocument({ data: typedArray }).promise;
            totalPages = pdfDoc.numPages;
            pageNumber.max = totalPages;
            pageNumber.value = 1;
        } catch (err) {
            showError('Failed to load PDF: ' + err.message);
        }
    };
    reader.readAsArrayBuffer(file);
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
    if (!selectedFile || !pdfDoc) return;

    loading.classList.add('active');
    convertBtn.disabled = true;
    error.classList.remove('active');
    previewArea.classList.remove('active');
    previewImages.innerHTML = '';

    try {
        const format = formatSelect.value;
        const dpi = parseInt(dpiSelect.value);
        const scale = dpi / 72; // PDF default is 72 DPI
        const pageMode = pageSelect.value;

        const pagesToConvert = pageMode === 'all' 
            ? Array.from({ length: totalPages }, (_, i) => i + 1)
            : [parseInt(pageNumber.value)];

        for (const pageNum of pagesToConvert) {
            const page = await pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            // Convert canvas to image
            const imageData = canvas.toDataURL(`image/${format}`, format === 'jpg' ? 0.95 : 1.0);
            
            // Create preview
            const img = document.createElement('img');
            img.src = imageData;
            img.style.maxWidth = '300px';
            img.style.margin = '10px';
            previewImages.appendChild(img);

            // Download
            const link = document.createElement('a');
            link.download = `${selectedFile.name.replace('.pdf', '')}_page_${pageNum}.${format}`;
            link.href = imageData;
            link.click();
        }

        previewArea.classList.add('active');
    } catch (err) {
        showError('Conversion failed: ' + err.message);
    } finally {
        loading.classList.remove('active');
        convertBtn.disabled = false;
    }
});
