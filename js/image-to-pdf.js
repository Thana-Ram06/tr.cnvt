const { jsPDF } = window.jspdf;

const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const fileInfo = document.getElementById('fileInfo');
const fileList = document.getElementById('fileList');
const pageSize = document.getElementById('pageSize');
const orientation = document.getElementById('orientation');
const imageQuality = document.getElementById('imageQuality');
const convertBtn = document.getElementById('convertBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const previewArea = document.getElementById('previewArea');
const previewImages = document.getElementById('previewImages');

let selectedFiles = [];

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
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) {
        handleFilesSelect(files);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFilesSelect(Array.from(e.target.files));
    }
});

function handleFilesSelect(files) {
    selectedFiles = files;
    fileList.innerHTML = '';
    previewImages.innerHTML = '';
    
    files.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.style.marginBottom = '10px';
        fileItem.innerHTML = `
            <div class="file-name">${index + 1}. ${file.name}</div>
            <div class="file-size">${formatFileSize(file.size)}</div>
        `;
        fileList.appendChild(fileItem);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '200px';
            img.style.margin = '5px';
            img.style.borderRadius = '4px';
            previewImages.appendChild(img);
        };
        reader.readAsDataURL(file);
    });

    fileInfo.classList.add('active');
    previewArea.classList.add('active');
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
    if (selectedFiles.length === 0) return;

    loading.classList.add('active');
    convertBtn.disabled = true;
    error.classList.remove('active');

    try {
        const pageSizeMap = {
            'a4': [210, 297],
            'letter': [216, 279],
            'legal': [216, 356]
        };

        let pdf;
        let isFirstPage = true;

        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            const imageData = await fileToDataURL(file);
            
            const img = new Image();
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = imageData;
            });

            let imgWidth, imgHeight, pdfWidth, pdfHeight;

            if (pageSize.value === 'fit') {
                // Fit to image dimensions
                const mmPerInch = 25.4;
                const dpi = 96; // Standard screen DPI
                imgWidth = (img.width / dpi) * mmPerInch;
                imgHeight = (img.height / dpi) * mmPerInch;
                pdfWidth = imgWidth;
                pdfHeight = imgHeight;
            } else {
                const dimensions = orientation.value === 'landscape'
                    ? [pageSizeMap[pageSize.value][1], pageSizeMap[pageSize.value][0]]
                    : pageSizeMap[pageSize.value];
                
                pdfWidth = dimensions[0];
                pdfHeight = dimensions[1];

                // Calculate image dimensions maintaining aspect ratio
                const imgAspect = img.width / img.height;
                const pdfAspect = pdfWidth / pdfHeight;

                if (imgAspect > pdfAspect) {
                    imgWidth = pdfWidth;
                    imgHeight = pdfWidth / imgAspect;
                } else {
                    imgHeight = pdfHeight;
                    imgWidth = pdfHeight * imgAspect;
                }
            }

            if (isFirstPage) {
                pdf = new jsPDF({
                    orientation: (pdfWidth > pdfHeight) ? 'landscape' : 'portrait',
                    unit: 'mm',
                    format: pageSize.value === 'fit' ? [pdfWidth, pdfHeight] : 
                           (pageSize.value === 'a4' ? 'a4' : 
                           (pageSize.value === 'letter' ? 'letter' : 'legal'))
                });
                isFirstPage = false;
            } else {
                pdf.addPage({
                    format: pageSize.value === 'fit' ? [pdfWidth, pdfHeight] : 
                           (pageSize.value === 'a4' ? 'a4' : 
                           (pageSize.value === 'letter' ? 'letter' : 'legal')),
                    orientation: (pdfWidth > pdfHeight) ? 'landscape' : 'portrait'
                });
            }

            const x = (pdfWidth - imgWidth) / 2;
            const y = (pdfHeight - imgHeight) / 2;

            pdf.addImage(imageData, 'JPEG', x, y, imgWidth, imgHeight, undefined, 'FAST');
        }

        pdf.save('converted_images.pdf');

    } catch (err) {
        showError('Conversion failed: ' + err.message);
    } finally {
        loading.classList.remove('active');
        convertBtn.disabled = false;
    }
});

function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
