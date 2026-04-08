import React, { useState, useMemo } from 'react';
import useVolunteers from '../hooks/useVolunteers';
import VolunteerCard from '../components/VolunteerCard';
import { registerVolunteer } from '../services/api';

const SKILL_OPTIONS = [
  'medical','food_distribution','teaching',
  'transport','construction','counseling','general'
];

export default function Volunteers() {
  const { volunteers, loading, error } = useVolunteers();
  const [search, setSearch] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    skills: [], availability: true,
    lat: 26.9124, lng: 75.7873   // default to Jaipur centre
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const filtered = useMemo(() => {
    return volunteers
      .filter(v => availableOnly ? v.availability : true)
      .filter(v =>
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.email.toLowerCase().includes(search.toLowerCase())
      );
  }, [volunteers, search, availableOnly]);

  const availableCount = volunteers.filter(v => v.availability).length;

  function toggleSkill(skill) {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(skill)
        ? f.skills.filter(s => s !== skill)
        : [...f.skills, skill]
    }));
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (!form.name || !form.email || form.skills.length === 0) {
      setFormError('Name, email, and at least one skill are required.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await registerVolunteer(form);
      setShowForm(false);
      setForm({ name:'', email:'', phone:'', skills:[], availability:true, lat:26.9124, lng:75.7873 });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex-1 overflow-auto bg-slate-50 p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-slate-800">Volunteers</h1>
          <div className="flex gap-3 mt-1">
            <span className="text-xs text-slate-400">{volunteers.length} registered</span>
            <span className="text-xs text-green-600 font-medium">{availableCount} available</span>
          </div>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg
                     hover:bg-teal-700 active:scale-95 transition-all">
          {showForm ? 'Cancel' : '+ Register volunteer'}
        </button>
      </div>

      {/* Inline registration form */}
      {showForm && (
        <form onSubmit={handleRegister}
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <p className="text-sm font-medium text-slate-700 mb-3">Register new volunteer</p>
          </div>
          <input required placeholder="Full name" value={form.name}
            onChange={e => setForm(f => ({...f, name: e.target.value}))}
            className="col-span-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800
                       focus:outline-none focus:ring-2 focus:ring-teal-400" />
          <input required type="email" placeholder="Email" value={form.email}
            onChange={e => setForm(f => ({...f, email: e.target.value}))}
            className="col-span-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800
                       focus:outline-none focus:ring-2 focus:ring-teal-400" />
          <input placeholder="Phone (optional)" value={form.phone}
            onChange={e => setForm(f => ({...f, phone: e.target.value}))}
            className="col-span-2 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800
                       focus:outline-none focus:ring-2 focus:ring-teal-400" />
          <div className="col-span-2">
            <p className="text-xs text-slate-500 mb-2">Skills (select all that apply)</p>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map(skill => (
                <button type="button" key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    form.skills.includes(skill)
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400'
                  }`}>
                  {skill.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
          {formError && (
            <p className="col-span-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{formError}</p>
          )}
          <button type="submit" disabled={submitting}
            className="col-span-2 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-lg
                       hover:bg-teal-700 disabled:opacity-60 transition-all">
            {submitting ? 'Registering...' : 'Register volunteer'}
          </button>
        </form>
      )}

      {/* Search + filter bar */}
      <div className="flex gap-3 mb-5">
        <input
          type="search" placeholder="Search by name or email..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800
                     bg-white focus:outline-none focus:ring-2 focus:ring-teal-400" />
        <button
          onClick={() => setAvailableOnly(v => !v)}
          className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
            availableOnly
              ? 'bg-teal-600 text-white border-teal-600'
              : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400'
          }`}>
          Available only
        </button>
      </div>

      {/* States */}
      {loading && (
        <div className="text-center py-16 text-slate-400 text-sm">Loading volunteers...</div>
      )}
      {error && (
        <div className="text-center py-8 text-red-500 text-sm bg-red-50 rounded-xl">{error}</div>
      )}

      {/* Grid */}
      {!loading && !error && (
        filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            {search || availableOnly ? 'No volunteers match your filters.' : 'No volunteers registered yet.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(v => (
              <VolunteerCard key={v.id} volunteer={v} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
