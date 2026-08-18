import React, { useState, useRef, useEffect } from "react";

// 1. The Modal Component
export  function FileUploadModal({ isOpen, onClose, onUpload }: { isOpen: boolean; onClose: () => void; onUpload: (file: File) => void }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);


 
   
  /* useEffect( () => {
    
    const doSomething = async () => {
      if (!isOpen) {
        return null;
      }
      else{
        // Reset state when modal opens
        setSelectedFile(null);
        setPreviewUrl(null);
      }

      
    }
    doSomething();

  }, [isOpen]); */

   if (!isOpen) {
    return null; // Don't render the modal if it's not open
  }
  
  

  // Handle file selection change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?event.target.files[0]:null;
    if (file) {
      setSelectedFile(file);
      
      // Generate a preview if the file is an image
      if (file.type.startsWith("image/")) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null); // Clear preview for non-image files
      }
    }
  };

  // Trigger click on hidden native file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Submit the file to parent component
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedFile) {
      onUpload(selectedFile);
      handleModalClose();
    }
  };

  // Clean up state on close
  const handleModalClose = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    onClose();
  };
  

  return (
    <div className="modal-overlay" onClick={handleModalClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Upload File</h3>
        <button className="close-btn" onClick={handleModalClose}>&times;</button>
        
        <form onSubmit={handleSubmit}>
          {/* Hidden Native Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
            accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.csv"
          />

          {/* Custom Styled Click Area */}
          <div className="dropzone" onClick={triggerFileInput}>
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="image-preview" />
            ) : selectedFile ? (
              <p className="file-name">📄 {selectedFile.name}</p>
            ) : (
              <p>Click to browse files</p>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={handleModalClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={!selectedFile}>
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 2. Parent Usage Example
/* export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUploadSubmit = (file) => {
    console.log("File received in parent app:", file);
    // Process your backend FormData API call here
  };

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
        Open Upload Modal
      </button>

      <FileUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={handleUploadSubmit}
      />
    </div>
  );
} */
