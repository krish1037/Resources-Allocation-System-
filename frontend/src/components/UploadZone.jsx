import React from 'react';

export default function UploadZone({ onUpload }) {
  const handleFile = (e) => {
      const file = e.target.files[0];
      if(file && onUpload) onUpload(file);
  };
  
  return (
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-teal-500 hover:bg-slate-50 transition cursor-pointer relative">
          <input type="file" className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" onChange={handleFile} accept="image/jpeg, image/png" />
          <p className="text-slate-600 font-medium text-lg">Drag & drop photo here</p>
          <p className="text-slate-400 text-sm mt-2">or click to browse</p>
      </div>
  );
}
