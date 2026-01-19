'use client';

import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface LogoUploadProps {
  shopId: string;
  currentLogoUrl?: string | null;
}

export function LogoUpload({ shopId, currentLogoUrl }: LogoUploadProps) {
  const [logoUrl, setLogoUrl] = useState(currentLogoUrl);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      // Convert to base64 for demo purposes
      // In production, use a proper upload service like S3 with signed URLs
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        // Update shop with new logo URL
        const response = await fetch(`/api/shops/${shopId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logoUrl: base64 }),
        });

        if (response.ok) {
          setLogoUrl(base64);
          alert('Logo uploaded successfully!');
        } else {
          alert('Failed to upload logo:bad response from server');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload logo; unexpected error');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      const response = await fetch(`/api/shops/${shopId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoUrl: null }),
      });

      if (response.ok) {
        setLogoUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('Remove error:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Store Logo</h2>
      
      <div className="flex items-start gap-6">
        {/* Logo Preview */}
        <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
          ) : (
            <Upload className="w-12 h-12 text-gray-400" />
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-4">
            Upload your store logo. Recommended size: 200x200px. Maximum file size: 5MB.
          </p>
          
          <div className="flex gap-3">
            <label className="cursor-pointer">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
              <span className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                {uploading ? 'Uploading...' : logoUrl ? 'Change Logo' : 'Upload Logo'}
              </span>
            </label>

            {logoUrl && (
              <button
                onClick={handleRemove}
                className="flex items-center gap-2 px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-50"
              >
                <X className="w-4 h-4" />
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}