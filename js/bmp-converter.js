const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const quality = document.getElementById('quality');
const convertBtn = document.getElementById('convertBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const previewArea = document.getElementById('previewArea');
const previewImage = document.getElementById('previewImage');

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
    if (files.length > 0 && (files[0].type === 'image/bmp' || files[0].type === 'image/x-ms-bmp' || files[0].name.toLowerCase().endsWith('.bmp'))) {
        handleFileSelect(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
    }
});

function handleFileSelect(file) {
    if (file.type !== 'image/bmp' && file.type !== 'image/x-ms-bmp' && !file.name.toLowerCase().endsWith('.bmp')) {
        showError('Please select a valid BMP file.');
        return;
    }

    selectedFile = file;
    fileName.textContent = `File: ${file.name}`;
    fileSize.textContent = `Size: ${formatFileSize(file.size)}`;
    fileInfo.classList.add('active');
    convertBtn.disabled = false;
    error.classList.remove('active');

    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        previewArea.classList.add('active');
    };
    reader.readAsDataURL(file);
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

convertBtn.addEventListener('click', () => {
    if (!selectedFile) return;

    loading.classList.add('active');
    convertBtn.disabled = true;
    error.classList.remove('active');

    try {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = selectedFile.name.replace(/\.bmp$/i, '.jpg');
                link.click();
                URL.revokeObjectURL(url);

                loading.classList.remove('active');
                convertBtn.disabled = false;
            }, 'image/jpeg', parseFloat(quality.value));
        };

        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
        };
        reader.readAsDataURL(selectedFile);
    } catch (err) {
        showError('Conversion failed: ' + err.message);
        loading.classList.remove('active');
        convertBtn.disabled = false;
    }
});
