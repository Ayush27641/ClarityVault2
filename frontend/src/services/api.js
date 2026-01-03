
import { auth } from '../lib/utils';

// Get base URL for API calls
const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/+$/, ''); // Remove trailing slashes
  }
  return 'http://localhost:3000';
};

const BASE_URL = getBaseUrl();

// API endpoints configuration
const ENDPOINTS = {
  // Auth endpoints (root level - no /api prefix)
  AUTH: BASE_URL,
  // All other endpoints (with /api prefix)  
  API: `${BASE_URL}/api`
};

// For most API calls (files, processing, etc.)
const API_BASE_URL = ENDPOINTS.API;

// Export auth base URL for login/register components
export const AUTH_BASE_URL = ENDPOINTS.AUTH;

// Utility function to get authorization headers
const getAuthHeaders = () => {
  const token = auth.getToken();
  return {
    'Authorization': `Bearer ${token}`,
  };
};

// File Upload API Services
export const fileUploadAPI = {
  // Analyze Harmful Terms - POST /analyze_harmful_terms
  analyzeHarmfulTerms: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/file-processing/analyze_harmful_terms`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing harmful terms:', error);
      throw error;
    }
  },
  // Save a File - POST /api/files/save
  saveFile: async (username, file) => {
    try {
      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        throw new Error('File size exceeds 10MB limit');
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain'
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error('File type not allowed. Supported types: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT');
      }

      const formData = new FormData();
      formData.append('username', username);
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/files/save`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  },

  // Delete a File - DELETE /api/files/delete/{id}
  deleteFile: async (fileId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/files/delete/${fileId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('File not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },

  // Find File by ID - GET /api/files/find/{id}
  findFileById: async (fileId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/files/find/${fileId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('File not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error finding file by ID:', error);
      throw error;
    }
  },

  // Download a File - GET /api/files/download/{id}
  downloadFile: async (fileId, fileName = 'download') => {
    try {
      const response = await fetch(`${API_BASE_URL}/files/download/${fileId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('File not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the blob data
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'File downloaded successfully' };
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  },

  // Find Files by Username - GET /api/files/findByUsername/{username}
  findFilesByUsername: async (username) => {
    try {
      const response = await fetch(`${API_BASE_URL}/files/findByUsername/${username}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error finding files by username:', error);
      throw error;
    }
  },

  // Identify Document Type - POST {API_BASE_URL}/file-processing/find_Document_type
  identifyDocumentType: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/file-processing/find_Document_type`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error identifying document type:', error);
      throw error;
    }
  },
};

// API utilities
export const apiUtils = {
  // Format file size for display
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Get file extension from filename
  getFileExtension: (filename) => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  },

  // Get file type icon based on extension
  getFileTypeIcon: (filename) => {
    const extension = apiUtils.getFileExtension(filename).toLowerCase();
    const icons = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      xls: '📊',
      xlsx: '📊',
      ppt: '📽️',
      pptx: '📽️',
      txt: '📋',
    };
    return icons[extension] || '📄';
  },

  // Validate file before upload
  validateFile: (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
    
    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 10MB limit' };
    }

    const extension = apiUtils.getFileExtension(file.name).toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      return { valid: false, error: 'File type not allowed. Supported types: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT' };
    }

    return { valid: true };
  },
};

// User data API (if needed for user management)
export const userDataAPI = {
  // Get current user profile
  getCurrentUser: async () => {
    try {
      const username = auth.getUsername();
      if (!username) {
        throw new Error('No username found in auth');
      }
      
      const response = await fetch(`${AUTH_BASE_URL}/data/${username}`, {
        method: 'GET',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  },

  // Get user profile by username - NEW ENDPOINT
  getUserProfile: async (username) => {
    try {
  const response = await fetch(`${AUTH_BASE_URL}/data/${username}`, {
        method: 'GET',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  },
};

// File utilities for UI components
export const fileUtils = {
  // Create file preview data
  createFilePreview: (file) => {
    return {
      name: file.name,
      size: apiUtils.formatFileSize(file.size),
      type: file.type,
      icon: apiUtils.getFileTypeIcon(file.name),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    };
  },

  // Handle file selection
  handleFileSelect: (event, callback) => {
    const files = Array.from(event.target.files);
    const validFiles = [];
    const errors = [];

    files.forEach(file => {
      const validation = apiUtils.validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    callback(validFiles, errors);
  },

  // Handle API errors consistently
  handleError: (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || error.response.statusText || `HTTP ${status} error`;
      
      switch (status) {
        case 401:
          return { message: 'Authentication failed. Please login again.', status };
        case 403:
          return { message: 'Access denied. You don\'t have permission.', status };
        case 404:
          return { message: 'Resource not found.', status };
        case 500:
          return { message: 'Server error. Please try again later.', status };
        default:
          return { message, status };
      }
    } else if (error.request) {
      // Network error
      return { message: 'Network error. Please check your connection.', status: 0 };
    } else {
      // Other error
      return { message: error.message || 'An unexpected error occurred.', status: -1 };
    }
  },
};