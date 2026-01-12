import React from 'react';

const Loader = ({ label = 'Loading...' }) => (
  <div className="flex items-center justify-center gap-3 py-6 text-slate-500">
    <span className="inline-block h-5 w-5 rounded-full border-2 border-slate-200 border-t-slate-500 animate-spin" aria-hidden="true" />
    <span className="text-sm font-medium">{label}</span>
  </div>
);

export default Loader;
