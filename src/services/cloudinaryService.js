// src/services/cloudinaryService.js

// --- ⬇️ Your Cloudinary details ---
const CLOUDINARY_CLOUD_NAME = "dohrntj3d"; 
const CLOUDINARY_UPLOAD_PRESET = "Aatmikjagratimusic";
// -----------------------------------------------------------

/**
 * Uploads a file to Cloudinary with real progress tracking.
 * @param {File} file The file to upload.
 * @param {Function} onProgress (Optional) Callback function for progress (0-100).
 * @returns {Promise<string>} Resolves with the secure URL.
 */
export const uploadToCloudinary = (file, onProgress) => {
    return new Promise((resolve, reject) => {
        if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
            console.error("Cloudinary credentials missing.");
            reject(new Error("Cloudinary credentials missing."));
            return;
        }

        
        const LIMIT_MB = 100;
        if (file.size > LIMIT_MB * 1024 * 1024) {
            alert(`File is too large! The limit is ${LIMIT_MB}MB.\nYour file is ${(file.size / (1024*1024)).toFixed(2)}MB.\nPlease compress the video and try again.`);
            reject(new Error("File too large."));
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const resourceType = file.type.startsWith('video/') ? 'video' : 'image';
        const apiUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

        const xhr = new XMLHttpRequest();
        xhr.open('POST', apiUrl, true);

        // Track upload progress
        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable && onProgress) {
                const percentComplete = Math.round((event.loaded / event.total) * 100);
                onProgress(percentComplete);
            }
        };

        // Handle response
        xhr.onload = () => {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                resolve(data.secure_url);
            } else {
                console.error("Cloudinary Error:", xhr.responseText);
                reject(new Error('Cloudinary upload failed'));
            }
        };

        xhr.onerror = () => {
            reject(new Error('Network error during upload'));
        };

        xhr.send(formData);
    });
};