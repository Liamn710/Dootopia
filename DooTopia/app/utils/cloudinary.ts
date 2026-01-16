import { Platform } from 'react-native';

const CLOUDINARY_CLOUD_NAME = 'dppzfeczt';
const CLOUDINARY_UPLOAD_PRESET = 'dootopia_prizes'; // Your upload preset from the dashboard

export async function uploadImageToCloudinary(imageUri: string): Promise<string> {
  try {
    const formData = new FormData();

    if (Platform.OS === 'web') {
      // For web: Convert URI to Blob
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Get file extension from blob type or default to jpg
      const mimeType = blob.type || 'image/jpeg';
      const ext = mimeType.split('/')[1] || 'jpg';
      const fileName = `prize_${Date.now()}.${ext}`;
      
      formData.append('file', blob, fileName);
    } else {
      // For native (iOS/Android): Use the uri object pattern
      let uri = imageUri;
      
      // Normalize the URI for different platforms
      if (Platform.OS === 'android' && !uri.startsWith('file://') && !uri.startsWith('content://')) {
        uri = `file://${uri}`;
      }
      if (Platform.OS === 'ios' && !uri.startsWith('file://') && uri.startsWith('/')) {
        uri = `file://${uri}`;
      }
      
      // Extract file extension
      const uriParts = imageUri.split('.');
      let fileType = uriParts.length > 1 ? uriParts[uriParts.length - 1].toLowerCase() : 'jpg';
      fileType = fileType.split('?')[0].split('#')[0];
      
      const validTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'];
      if (!validTypes.includes(fileType)) {
        fileType = 'jpg';
      }
      
      const mimeType = fileType === 'heic' || fileType === 'heif' ? 'image/jpeg' : `image/${fileType === 'jpg' ? 'jpeg' : fileType}`;
      const fileName = `prize_${Date.now()}.${fileType === 'heic' || fileType === 'heif' ? 'jpg' : fileType}`;

      formData.append('file', {
        uri: uri,
        type: mimeType,
        name: fileName,
      } as any);
    }
    
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    console.log('Uploading to Cloudinary...', { platform: Platform.OS });

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    const data = await uploadResponse.json();
    
    if (!uploadResponse.ok) {
      console.error('Cloudinary error:', uploadResponse.status, data);
      throw new Error(data.error?.message || `Upload failed with status ${uploadResponse.status}`);
    }
    
    if (data.secure_url) {
      console.log('Upload successful:', data.secure_url);
      return data.secure_url;
    }
    
    throw new Error('Failed to get image URL from Cloudinary');
  } catch (error: any) {
    console.error('Error uploading to Cloudinary:', error.message);
    throw error;
  }
}

/**
 * Extracts the public_id from a Cloudinary URL
 * Example: https://res.cloudinary.com/dppzfeczt/image/upload/v1234567890/prize_1234567890.jpg
 * Returns: prize_1234567890
 */
export function extractPublicIdFromUrl(imageUrl: string): string | null {
  try {
    // Match the pattern: /upload/v<version>/<public_id>.<extension>
    const matches = imageUrl.match(/\/upload\/(?:v\d+\/)?([^/.]+)/);
    return matches ? matches[1] : null;
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return null;
  }
}

/**
 * Deletes an image from Cloudinary using the public_id
 * Note: This requires a server-side implementation for security
 * For now, we'll just return success since Cloudinary doesn't allow
 * client-side deletion without exposing API secrets
 */
export async function deleteImageFromCloudinary(imageUrl: string): Promise<boolean> {
  try {
    const publicId = extractPublicIdFromUrl(imageUrl);
    if (!publicId) {
      console.warn('Could not extract public_id from URL:', imageUrl);
      return false;
    }

    console.log('Deleting image with public_id:', publicId);
    
    const API_URL = 'http://localhost:3000';
    const response = await fetch(`${API_URL}/cloudinary/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('Image deleted successfully from Cloudinary:', data);
      return true;
    } else {
      console.error('Failed to delete image:', data);
      return false;
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return false;
  }
}
