import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Plus, Search, MoreHorizontal, MapPin } from 'lucide-react';
import { selectAllVolunteers, selectAvailableVolunteers } from '../store/volunteerSlice';
import useVolunteers from '../hooks/useVolunteers';
import { useTranslation } from '../contexts/I18nContext';
import { registerVolunteer, updateVolunteerAvailability } from '../services/api';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';

export default function Volunteers() {
  const { t } = useTranslation();
  useVolunteers();

  const allVolunteers = useSelector(selectAllVolunteers);
  const availableVols = useSelector(selectAvailableVolunteers);

  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', skills: '', lat: '', lng: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const filtered = allVolunteers.filter(v =>
    v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.skills?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await registerVolunteer({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        lat: parseFloat(formData.lat) || 0,
        lng: parseFloat(formData.lng) || 0,
        availability: true,
      });
      setShowForm(false);
      setFormData({ name: '', email: '', phone: '', skills: '', lat: '', lng: '' });
    } catch (err) {
      alert('Registration failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAvailability = async (vol) => {
    try {
      await updateVolunteerAvailability(vol.id, !vol.availability);
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('nav.volunteers')}
        subtitle={`${availableVols.length} of ${allVolunteers.length} available`}
        action={
          <div className="flex space-x-2">
            <Button variant="primary" icon={Plus} onClick={() => setShowForm(!showForm)}>
              Add Personnel
            </Button>
          </div>
        }
      />

      {/* Registration Form */}
      {showForm && (
        <form
          onSubmit={handleRegister}
          className="mb-8 p-6 bg-white dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm animate-slide-up"
        >
          <h3 className="text-sm font-medium text-zinc-900 dark:text-white mb-4">Register New Volunteer</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'name', label: 'Full Name', placeholder: 'Jane Doe', required: true },
              { key: 'email', label: 'Email', placeholder: 'jane@org.com', type: 'email', required: true },
              { key: 'phone', label: 'Phone', placeholder: '+91 98765 43210' },
              { key: 'skills', label: 'Skills (comma-separated)', placeholder: 'first aid, logistics, driving' },
              { key: 'lat', label: 'Latitude', placeholder: '26.9124', type: 'number' },
              { key: 'lng', label: 'Longitude', placeholder: '75.7873', type: 'number' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                  {field.label}
                </label>
                <input
                  type={field.type || 'text'}
                  required={field.required}
                  placeholder={field.placeholder}
                  value={formData[field.key]}
                  onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition"
                  step={field.type === 'number' ? 'any' : undefined}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4 space-x-2">
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Registering...' : 'Register'}
            </Button>
          </div>
        </form>
      )}

      {/* Search */}
      <div className="mb-6 flex items-center px-3 py-2 bg-white dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
        <Search className="w-4 h-4 text-zinc-400 mr-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search by name, email, or skill..."
          className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none"
        />
      </div>

      {/* Volunteer List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="p-12 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
            <p className="text-sm text-zinc-400">
              {allVolunteers.length === 0 ? 'No volunteers registered yet.' : 'No results match your search.'}
            </p>
          </div>
        )}
        {filtered.map((vol) => (
          <div
            key={vol.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm"
          >
            {/* Info */}
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow-sm">
                {vol.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??'}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{vol.name}</h3>
                  <span className="text-[10px] text-zinc-400 font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    {vol.id?.slice(0, 8)}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">{vol.email}</p>
              </div>
            </div>

            {/* Meta */}
            <div className="flex items-center space-x-6 sm:space-x-8">
              {/* Skills */}
              <div className="hidden md:flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-1">Skills</span>
                <div className="flex gap-1.5 flex-wrap">
                  {(vol.skills || []).slice(0, 3).map(s => (
                    <span key={s} className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700/50">
                      {s}
                    </span>
                  ))}
                  {(vol.skills?.length || 0) > 3 && (
                    <span className="text-xs text-zinc-400">+{vol.skills.length - 3}</span>
                  )}
                </div>
              </div>

              {/* Location */}
              {(vol.lat || vol.lng) && (
                <div className="hidden lg:flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-1">Location</span>
                  <span className="text-xs text-zinc-500 flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {vol.lat?.toFixed(2)}, {vol.lng?.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Availability */}
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-1">Status</span>
                <button
                  onClick={() => toggleAvailability(vol)}
                  className="flex items-center group"
                  title="Click to toggle"
                >
                  <div className={`w-2 h-2 rounded-full mr-1.5 transition-colors ${vol.availability ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-600'}`} />
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                    {vol.availability ? 'On Call' : 'Offline'}
                  </span>
                </button>
              </div>

              <button className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
