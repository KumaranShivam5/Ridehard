import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, AlertCircle } from 'lucide-react';

interface ImageUploadZoneProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function ImageUploadZone({
  label,
  value,
  onChange,
  placeholder = "Drag & drop an image or click to select"
}: ImageUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Invalid format: File must be an image (PNG, JPG, WEBP etc.)');
      return;
    }
    
    // Check size limit to avoid Firestore / localStorage overhead (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('File is too large (Maximum size permissible: 2MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        onChange(dataUrl);
      }
    };
    reader.onerror = () => {
      setError('Could not read file structure.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isBase64 = value.startsWith('data:image/');

  return (
    <div className="flex flex-col gap-1.5 font-mono text-xs text-rock">
      <div className="flex justify-between items-center">
        <label className="font-bold text-rock/70 uppercase">{label}</label>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-oxide-light hover:text-black font-bold uppercase text-[10px] transition-colors flex items-center gap-1 cursor-pointer min-h-[44px]"
          >
            <X size={12} /> Clear Profile
          </button>
        )}
      </div>

      {/* Main Drag-and-Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 select-none ${
          isDragging 
            ? 'border-oxide bg-oxide/5 scale-[0.99]' 
            : value 
              ? 'border-cement/60 bg-[#F1EFEB]' 
              : 'border-cement bg-white hover:border-oxide'
        } flex flex-col items-center justify-center min-h-[140px]`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          id={`manual-image-uploader-${label.replace(/[^a-zA-Z0-9]/g, '')}`}
        />

        {value ? (
          <div className="w-full flex flex-col items-center gap-3">
            <div className="relative w-32 h-20 border-2 border-rock/20 bg-black/5 overflow-hidden">
              <img
                src={value}
                alt="Uploaded preview"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white font-black text-[9px] uppercase tracking-wider">Change Image</span>
              </div>
            </div>
            <div className="text-[10px] text-rock/60 max-w-[280px] truncate text-center">
              {isBase64 ? "✓ Base64 Storage Active" : `✓ URL: ${value}`}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <UploadCloud size={28} className={`text-rock/40 ${isDragging ? 'text-oxide animate-bounce' : 'group-hover:text-oxide'}`} />
            <p className="font-black text-rock/80 text-[11px] leading-tight uppercase tracking-tight">
              {placeholder}
            </p>
            <p className="text-[10px] text-rock/50">
              Or click to browse your computer
            </p>
          </div>
        )}
      </div>

      {/* Fallback Direct URL Input (for ultimate operational flexibility) */}
      <div className="relative mt-1">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-rock/40 text-[10px] uppercase font-black">
          Url Input:
        </div>
        <input
          type="text"
          placeholder="Or paste direct image URL (https://...)"
          value={isBase64 ? "" : value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white border-2 border-rock pl-16 pr-2.5 py-2.5 outline-none focus:border-oxide text-rock font-sans text-xs min-h-[44px]"
        />
      </div>

      {error && (
        <div className="text-[10px] font-black text-oxide-light flex items-center gap-1.5 mt-1 bg-oxide/5 p-2 border border-oxide/20">
          <AlertCircle size={12} className="shrink-0" />
          <span>{error.toUpperCase()}</span>
        </div>
      )}
    </div>
  );
}
