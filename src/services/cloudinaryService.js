// src/services/cloudinaryService.js

// --- ⬇️ Your Cloudinary details have been added below ⬇️ ---
const CLOUDINARY_CLOUD_NAME = "dohrntj3d"; 
const CLOUDINARY_UPLOAD_PRESET = "Aatmikjagratimusic";
// -----------------------------------------------------------


/**
 * Uploads a file to Cloudinary.
 * @param {File} file The file to upload (image or video).
 * @returns {Promise<string>} A promise that resolves with the secure URL of the uploaded file.
 */
export const uploadToCloudinary = async (file) => {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
        console.error("Cloudinary credentials are not set. Please add them to cloudinaryService.js");
        throw new Error("Cloudinary credentials missing.");
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    // Determine the resource type (image or video) based on the file type
    const resourceType = file.type.startsWith('video/') ? 'video' : 'image';
    const apiUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Cloudinary upload failed');
        }

        const data = await response.json();
        return data.secure_url; // This is the URL we'll store in Firestore
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
};