import React, { useState, useRef } from 'react';
import { Command, AlertCircle, CheckCircle2, Upload, Loader2 } from 'lucide-react';
import { useTranslation } from '../contexts/I18nContext';
import { ingestImage, ingestText, ingestForm } from '../services/api';
import Button from '../components/Button';

const NEED_TYPES = ['food', 'medical', 'shelter', 'water', 'education', 'other'];

export default function Ingest() {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('text');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Text tab state
  const [rawText, setRawText] = useState('');

  // Image tab state
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // Form tab state
  const [formData, setFormData] = useState({
    need_type: 'food',
    location_description: '',
    urgency_score: 3,
    affected_count: 1,
    description: '',
  });

  const tabs = [
    { id: 'text', label: 'Raw Text' },
    { id: 'file', label: 'File Upload' },
    { id: 'form', label: 'Manual Entry' },
  ];

  const resetResult = () => {
    setResult(null);
    setError(null);
  };

  const handleTextSubmit = async () => {
    if (!rawText.trim()) return;
    resetResult();
    setProcessing(true);
    try {
      const res = await ingestText(rawText.trim());
      setResult(res.data);
      setRawText('');
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleImageSubmit = async () => {
    if (!selectedFile) return;
    resetResult();
    setProcessing(true);
    try {
      const res = await ingestImage(selectedFile);
      setResult(res.data);
      setSelectedFile(null);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    resetResult();
    setProcessing(true);
    try {
      const res = await ingestForm({
        ...formData,
        urgency_score: parseInt(formData.urgency_score),
        affected_count: parseInt(formData.affected_count),
      });
      setResult(res.data);
      setFormData({ need_type: 'food', location_description: '', urgency_score: 3, affected_count: 1, description: '' });
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setSelectedFile(file);
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Command className="w-5 h-5 text-zinc-900 dark:text-white" />
        </div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight">
          {t('ingest.title')}
        </h1>
        <p className="text-sm text-zinc-500 mt-2">
          Paste raw text, logs, or upload documents to automatically extract structured allocation needs via AI.
        </p>
      </div>

      {/* Result Banner */}
      {result && (
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl animate-slide-up">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                {result.message || 'Data ingested successfully!'}
              </p>
              {result.need_id && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                  Need ID: {result.need_id}
                </p>
              )}
              {result.need && (
                <div className="mt-2 text-xs text-emerald-700 dark:text-emerald-300 space-y-1">
                  <p><strong>Type:</strong> {result.need.need_type} | <strong>Urgency:</strong> {result.need.urgency_score}/5</p>
                  <p><strong>Location:</strong> {result.need.location_description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl animate-slide-up">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">Ingestion failed</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">

        {/* Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 p-2 space-x-2 bg-zinc-50/50 dark:bg-zinc-900/30">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); resetResult(); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-700'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-1">

          {/* Raw Text Tab */}
          {activeTab === 'text' && (
            <textarea
              rows={8}
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              className="w-full bg-transparent border-0 p-4 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:ring-0 focus:outline-none resize-none font-mono"
              placeholder={'Paste unstructured stream data here...\n\n> Requesting 50 units thermal blankets at Sector 4. High urgency. Contact: RJ-992.'}
            />
          )}

          {/* File Upload Tab */}
          {activeTab === 'file' && (
            <div
              className={`m-4 p-12 border-2 border-dashed rounded-xl text-center transition-colors cursor-pointer ${
                dragOver
                  ? 'border-zinc-400 bg-zinc-50 dark:bg-zinc-800/50'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <Upload className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
              {selectedFile ? (
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">{selectedFile.name}</p>
                  <p className="text-xs text-zinc-400 mt-1">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">Drop an image or document here</p>
                  <p className="text-xs text-zinc-400 mt-1">Supports JPG, PNG, PDF — max 10MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={e => setSelectedFile(e.target.files?.[0] || null)}
              />
            </div>
          )}

          {/* Manual Form Tab */}
          {activeTab === 'form' && (
            <form onSubmit={handleFormSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Need Type</label>
                  <select
                    value={formData.need_type}
                    onChange={e => setFormData(p => ({ ...p, need_type: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                  >
                    {NEED_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Urgency (1-5)</label>
                  <input
                    type="number" min="1" max="5"
                    value={formData.urgency_score}
                    onChange={e => setFormData(p => ({ ...p, urgency_score: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Location Description</label>
                  <input
                    type="text" required
                    placeholder="e.g. Sector 4, North Block"
                    value={formData.location_description}
                    onChange={e => setFormData(p => ({ ...p, location_description: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">People Affected</label>
                  <input
                    type="number" min="1"
                    value={formData.affected_count}
                    onChange={e => setFormData(p => ({ ...p, affected_count: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Description</label>
                <textarea
                  rows={3} required
                  placeholder="Describe the need in detail..."
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 resize-none"
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-50 dark:bg-[#0A0A0A] border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
          <div className="flex items-center text-xs text-zinc-500">
            <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
            {activeTab === 'text' ? 'NLP Model Active' : activeTab === 'file' ? 'Document AI Ready' : 'Direct Entry Mode'}
          </div>
          <Button
            variant="primary"
            disabled={processing || (activeTab === 'text' && !rawText.trim()) || (activeTab === 'file' && !selectedFile)}
            onClick={
              activeTab === 'text' ? handleTextSubmit :
              activeTab === 'file' ? handleImageSubmit :
              undefined
            }
            type={activeTab === 'form' ? 'submit' : 'button'}
            {...(activeTab === 'form' ? { form: undefined, onClick: (e) => {
              // Trigger the form submit
              const form = e.target.closest('.bg-white, .dark\\:bg-\\[\\#111\\]')?.querySelector('form');
              if (form) form.requestSubmit();
            }} : {})}
          >
            {processing ? 'Processing...' : activeTab === 'form' ? 'Submit Need' : 'Extract Data'}
          </Button>
        </div>
      </div>
    </div>
  );
}
