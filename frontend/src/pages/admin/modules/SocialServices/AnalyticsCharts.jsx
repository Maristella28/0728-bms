import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const pieColors = ['#34d399', '#60a5fa', '#a78bfa', '#fbbf24', '#f472b6', '#facc15', '#f87171'];

const AnalyticsCharts = ({ beneficiaries = [], disbursements = [], loading }) => {
  // Pie: Beneficiaries by type
  const typeCounts = beneficiaries.reduce((acc, b) => {
    acc[b.beneficiary_type] = (acc[b.beneficiary_type] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

  // Bar: Disbursements by month
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const barData = months.map((m, idx) => {
    const monthStr = `2025-${String(idx + 1).padStart(2, '0')}`;
    return {
      month: m,
      amount: disbursements.filter(d => d.date && d.date.startsWith(monthStr)).reduce((sum, d) => sum + Number(d.amount || 0), 0),
    };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      <div className="bg-white/70 backdrop-blur rounded-lg shadow p-4 flex flex-col items-center">
        <div className="text-lg font-semibold mb-2">Beneficiaries by Type</div>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {pieData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={pieColors[idx % pieColors.length]} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white/70 backdrop-blur rounded-lg shadow p-4 flex flex-col items-center">
        <div className="text-lg font-semibold mb-2">Disbursements by Month (2025)</div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="amount" fill="#34d399" name="Disbursement Amount" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsCharts; 