import axios from 'axios';

const CLOUDINARY_CLOUD_NAME = 'dppzfeczt';
const CLOUDINARY_UPLOAD_PRESET = 'dootopia_prizes'; // Your upload preset from the dashboard

export async function uploadImageToCloudinary(imageUri: string): Promise<string> {
  try {
    const formData = new FormData();
    
    // Extract file extension and create filename
    const uriParts = imageUri.split('.');
    const fileType = uriParts[uriParts.length - 1];
    
    formData.append('file', {
      uri: imageUri,
      type: `image/${fileType}`,
      name: `prize_${Date.now()}.${fileType}`,
    } as any);
    
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    if (response.data && response.data.secure_url) {
      return response.data.secure_url;
    }
    
    throw new Error('Failed to get image URL from Cloudinary');
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}
