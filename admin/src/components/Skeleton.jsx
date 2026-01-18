import React from 'react';

// Base Skeleton Component
export const Skeleton = ({ className = '', variant = 'default' }) => {
  const variantStyles = {
    default: 'bg-slate-200',
    card: 'bg-slate-100',
    text: 'bg-slate-200',
  };

  return (
    <div
      className={`animate-pulse rounded ${variantStyles[variant]} ${className}`}
      aria-hidden="true"
    />
  );
};

// Skeleton Card for stat cards
export const SkeletonStatCard = () => (
  <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-10 rounded-xl" />
    </div>
    <Skeleton className="h-8 w-32" />
    <Skeleton className="h-4 w-20" />
  </div>
);

// Skeleton Table Row
export const SkeletonTableRow = ({ columns = 5 }) => (
  <tr className="border-b border-slate-50">
    {Array.from({ length: columns }).map((_, idx) => (
      <td key={idx} className="px-6 py-4">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

// Skeleton Product Card
export const SkeletonProductCard = () => (
  <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
    <Skeleton className="h-48 w-full" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  </div>
);

// Skeleton Customer Card
export const SkeletonCustomerCard = () => (
  <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton className="w-14 h-14 rounded-2xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
      <div>
        <Skeleton className="h-3 w-16 mb-1" />
        <Skeleton className="h-5 w-12" />
      </div>
      <div>
        <Skeleton className="h-3 w-16 mb-1" />
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
  </div>
);

// Skeleton Chart
export const SkeletonChart = () => (
  <div className="bg-white border border-slate-100 rounded-2xl p-6">
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  </div>
);

// Skeleton Order Detail
export const SkeletonOrderDetail = () => (
  <div className="space-y-6">
    <Skeleton className="h-8 w-48" />
    <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-6 w-32" />
        </div>
      </div>
      <div className="border-t border-slate-100 pt-4 space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Skeleton Contact Card
export const SkeletonContactCard = () => (
  <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3">
    <div className="flex items-start justify-between">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-8 w-8 rounded-lg" />
    </div>
    <Skeleton className="h-20 w-full" />
    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  </div>
);

export default Skeleton;
