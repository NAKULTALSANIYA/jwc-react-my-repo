
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ label, value, change, isPositive, icon }) => {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-500 text-sm font-medium">{label}</p>
                    <h3 className="text-2xl font-bold mt-1">{value}</h3>

                    <div className={`flex items-center gap-1 mt-2 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        <span className="text-sm font-semibold">{change}</span>
                        <span className="text-slate-400 text-xs font-normal ml-1 flex items-center">vs last month</span>
                    </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                    {icon}
                </div>
            </div>
        </div>
    );
};

export default StatCard;
