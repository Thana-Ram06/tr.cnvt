const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const formatSelect = document.getElementById('formatSelect');
const quality = document.getElementById('quality');
const qualityContainer = document.getElementById('qualityContainer');
const backgroundColor = document.getElementById('backgroundColor');
const backgroundColorContainer = document.getElementById('backgroundColorContainer');
const convertBtn = document.getElementById('convertBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const previewArea = document.getElementById('previewArea');
const previewImage = document.getElementById('previewImage');

let selectedFile = null;

formatSelect.addEventListener('change', () => {
    if (formatSelect.value === 'jpg') {
        qualityContainer.style.display = 'block';
        backgroundColorContainer.style.display = 'block';
    } else {
        qualityContainer.style.display = 'none';
        backgroundColorContainer.style.display = 'none';
    }
});

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
    if (files.length > 0 && (files[0].type === 'image/tiff' || files[0].type === 'image/tif' || files[0].name.toLowerCase().match(/\.(tiff|tif)$/i))) {
        handleFileSelect(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
    }
});

function handleFileSelect(file) {
    const isTiff = file.type === 'image/tiff' || 
                   file.type === 'image/tif' || 
                   file.name.toLowerCase().match(/\.(tiff|tif)$/i);
    
    if (!isTiff) {
        showError('Please select a valid TIFF file.');
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

            const format = formatSelect.value;

            if (format === 'jpg') {
                // Fill background color first (for transparent TIFF)
                ctx.fillStyle = backgroundColor.value;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            // Draw the image
            ctx.drawImage(img, 0, 0);

            const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
            const qualityValue = format === 'jpg' ? parseFloat(quality.value) : undefined;

            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = selectedFile.name.replace(/\.(tiff|tif)$/i, `.${format}`);
                link.click();
                URL.revokeObjectURL(url);

                loading.classList.remove('active');
                convertBtn.disabled = false;
            }, mimeType, qualityValue);
        };

        img.onerror = () => {
            showError('Failed to load TIFF image. Browser may not support TIFF format directly. Try using a different browser or convert the file first.');
            loading.classList.remove('active');
            convertBtn.disabled = false;
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
