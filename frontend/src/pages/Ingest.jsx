import React, { useState } from 'react';
import UploadZone from '../components/UploadZone';
import { ingestImage, ingestText, ingestForm } from '../services/api';

export default function Ingest() {
  const [activeTab, setActiveTab] = useState('photo');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (file) => {
      setLoading(true);
      try {
          const res = await ingestImage(file);
          setResult(res.data.need);
      } catch(e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  const handleTextSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
          const res = await ingestText(e.target.text.value);
          setResult(res.data.need);
      } catch(e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  const handleFormSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      const fd = new FormData(e.target);
      const data = Object.fromEntries(fd.entries());
      data.urgency_score = parseInt(data.urgency_score);
      data.affected_count = parseInt(data.affected_count);
      try {
          const res = await ingestForm(data);
          setResult(res.data.need);
      } catch(e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen flex flex-col">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Ingest Data</h1>
      
      <div className="bg-white rounded-lg shadow-sm w-full max-w-2xl mx-auto overflow-hidden border border-slate-200">
        <div className="flex border-b border-slate-200">
            <Tab btn="photo" label="Upload Photo" active={activeTab} set={setActiveTab} />
            <Tab btn="text" label="Enter Text" active={activeTab} set={setActiveTab} />
            <Tab btn="form" label="Fill Form" active={activeTab} set={setActiveTab} />
        </div>
        
        <div className="p-6">
            {loading ? <p className="text-slate-600 font-semibold animate-pulse text-center p-8">Processing unstructured data with AI...</p> : (
                <>
                    {activeTab === 'photo' && <UploadZone onUpload={handleUpload} />}
                    {activeTab === 'text' && (
                        <form onSubmit={handleTextSubmit} className="flex flex-col gap-4">
                            <textarea name="text" rows="6" className="border border-slate-300 rounded p-3 w-full" placeholder="Paste unstructured field report..." required></textarea>
                            <button className="bg-teal-600 text-white font-semibold py-2 px-4 rounded hover:bg-teal-700 transition shadow-sm">Extract Need</button>
                        </form>
                    )}
                    {activeTab === 'form' && (
                        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                            <input name="need_type" placeholder="Type (food, medical, etc)" className="border border-slate-300 px-3 py-2 rounded" required />
                            <input name="location_description" placeholder="Address/Location" className="border border-slate-300 px-3 py-2 rounded" required />
                            <input name="description" placeholder="Short description" className="border border-slate-300 px-3 py-2 rounded" required />
                            <div className="flex gap-4">
                                <input name="urgency_score" type="number" min="1" max="5" placeholder="Urgency (1-5)" className="border border-slate-300 px-3 py-2 rounded w-1/2" required />
                                <input name="affected_count" type="number" placeholder="People affected" className="border border-slate-300 px-3 py-2 rounded w-1/2" required />
                            </div>
                            <button className="bg-teal-600 text-white font-semibold py-2 px-4 rounded hover:bg-teal-700 transition shadow-sm">Submit Need</button>
                        </form>
                    )}
                </>
            )}
        </div>
      </div>
      
      {result && (
          <div className="mt-8 bg-green-50 border-l-4 border-green-500 p-6 rounded shadow-sm w-full max-w-2xl mx-auto">
              <h3 className="text-green-800 font-bold mb-2">Successfully Ingested Need!</h3>
              <pre className="text-sm bg-white p-4 rounded text-slate-800 shadow-inner overflow-x-auto">{JSON.stringify(result, null, 2)}</pre>
          </div>
      )}
    </div>
  );
}

function Tab({ btn, label, active, set }) {
    const isActive = active === btn;
    return (
        <button 
            type="button" 
            onClick={() => set(btn)}
            className={`flex-1 py-3 text-center font-medium transition ${isActive ? 'bg-slate-50 border-b-2 border-teal-600 text-teal-700' : 'text-slate-500 hover:text-slate-800 bg-white'}`}
        >
            {label}
        </button>
    );
}
