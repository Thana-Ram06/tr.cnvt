const { jsPDF } = window.jspdf;

const htmlInput = document.getElementById('htmlInput');
const pageSize = document.getElementById('pageSize');
const orientation = document.getElementById('orientation');
const quality = document.getElementById('quality');
const convertBtn = document.getElementById('convertBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const previewArea = document.getElementById('previewArea');
const previewFrame = document.getElementById('previewFrame');

convertBtn.addEventListener('click', async () => {
    const htmlContent = htmlInput.value.trim();
    
    if (!htmlContent) {
        showError('Please enter HTML content or a URL.');
        return;
    }

    loading.classList.add('active');
    convertBtn.disabled = true;
    error.classList.remove('active');

    try {
        let content = htmlContent;
        let isUrl = false;

        // Check if it's a URL
        if (htmlContent.startsWith('http://') || htmlContent.startsWith('https://')) {
            isUrl = true;
            // For security reasons, we'll create an iframe to load the URL
            // Note: CORS restrictions may apply
            previewFrame.src = htmlContent;
            previewArea.style.display = 'block';
            
            // Wait a bit for the page to load
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Try to capture the iframe content
            // Note: Cross-origin restrictions may prevent this
            try {
                const canvas = await html2canvas(previewFrame.contentDocument.body, {
                    scale: parseFloat(quality.value),
                    useCORS: true,
                    logging: false
                });
                await convertCanvasToPdf(canvas);
            } catch (err) {
                showError('Cannot capture cross-origin URL. Please paste HTML content directly or use a same-origin URL.');
                throw err;
            }
        } else {
            // Create a temporary container for HTML content
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.width = '210mm'; // A4 width
            tempDiv.innerHTML = content;
            document.body.appendChild(tempDiv);

            // Wait for images to load
            await waitForImages(tempDiv);

            const canvas = await html2canvas(tempDiv, {
                scale: parseFloat(quality.value),
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            document.body.removeChild(tempDiv);
            await convertCanvasToPdf(canvas);
        }
    } catch (err) {
        showError('Conversion failed: ' + err.message);
    } finally {
        loading.classList.remove('active');
        convertBtn.disabled = false;
    }
});

function waitForImages(container) {
    return new Promise((resolve) => {
        const images = container.querySelectorAll('img');
        if (images.length === 0) {
            resolve();
            return;
        }

        let loaded = 0;
        const total = images.length;

        images.forEach(img => {
            if (img.complete) {
                loaded++;
                if (loaded === total) resolve();
            } else {
                img.onload = () => {
                    loaded++;
                    if (loaded === total) resolve();
                };
                img.onerror = () => {
                    loaded++;
                    if (loaded === total) resolve();
                };
            }
        });
    });
}

async function convertCanvasToPdf(canvas) {
    const pageSizeMap = {
        'a4': [210, 297],
        'letter': [216, 279],
        'legal': [216, 356]
    };

    const dimensions = orientation.value === 'landscape' 
        ? [pageSizeMap[pageSize.value][1], pageSizeMap[pageSize.value][0]]
        : pageSizeMap[pageSize.value];

    const pdf = new jsPDF({
        orientation: orientation.value === 'landscape' ? 'landscape' : 'portrait',
        unit: 'mm',
        format: pageSize.value === 'a4' ? 'a4' : pageSize.value === 'letter' ? 'letter' : 'legal'
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = dimensions[0];
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= dimensions[1];

    while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= dimensions[1];
    }

    pdf.save('converted.pdf');
}

function showError(message) {
    error.textContent = message;
    error.classList.add('active');
}
