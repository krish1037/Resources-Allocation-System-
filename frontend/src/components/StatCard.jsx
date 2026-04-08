import React from 'react';

export default function StatCard({ title, value }) {
    return (
        <div className="bg-white p-4 shadow-sm rounded-lg border-l-4 border-teal-600 border border-slate-100">
            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">{title}</h3>
            <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
        </div>
    );
}
