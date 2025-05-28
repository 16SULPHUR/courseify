// lib/imageUpload.ts
import axios from 'axios';

const IMAGE_UPLOAD_ENDPOINT = "https://media.varietyheaven.in/upload.php"; 

interface UploadResponse {
  url?: string;
  error?: string;
}

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post<UploadResponse | string>(
      IMAGE_UPLOAD_ENDPOINT,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    if (typeof response.data === 'object' && response.data !== null && 'url' in response.data) {
      return (response.data as UploadResponse).url as string;
    } else if (typeof response.data === 'object' && response.data !== null && 'error' in response.data) {
      throw new Error((response.data as UploadResponse).error as string);
    } else {
      console.log(response.data)
      if (typeof response.data === 'string' && response.data.startsWith('http')) {
          console.warn("Image upload response was plain text URL, not JSON. This might be unexpected.");
          return response.data;
      }
      throw new Error("Image upload failed: Invalid response from server.");
    }
  } catch (error: any) {
    console.error("Image upload error:", error);
    if (axios.isAxiosError(error) && error.response) {
      // Log more details if available
      console.error("Upload API Response Data:", error.response.data);
      console.error("Upload API Response Status:", error.response.status);
      throw new Error(error.response.data?.error || error.response.data?.message || `Image upload failed with status ${error.response.status}`);
    }
    throw new Error(error.message || "Image upload failed due to a network or server error.");
  }
};