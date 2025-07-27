import React from 'react';

const StatCards = ({ beneficiaries = [], disbursements = [], loading }) => {
  const totalBeneficiaries = beneficiaries.length;
  const pending = beneficiaries.filter(b => b.status === 'Pending').length;
  const approved = beneficiaries.filter(b => b.status === 'Approved').length;
  const totalDisbursements = disbursements.length;
  const totalAssistance = disbursements.reduce((sum, d) => sum + Number(d.amount || 0), 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white/70 backdrop-blur rounded-lg shadow p-4">
        <div className="text-lg font-semibold">Total Beneficiaries</div>
        <div className="text-2xl font-bold">{loading ? '...' : totalBeneficiaries}</div>
      </div>
      <div className="bg-white/70 backdrop-blur rounded-lg shadow p-4">
        <div className="text-lg font-semibold">Pending Applications</div>
        <div className="text-2xl font-bold">{loading ? '...' : pending}</div>
      </div>
      <div className="bg-white/70 backdrop-blur rounded-lg shadow p-4">
        <div className="text-lg font-semibold">Approved Beneficiaries</div>
        <div className="text-2xl font-bold">{loading ? '...' : approved}</div>
      </div>
      <div className="bg-white/70 backdrop-blur rounded-lg shadow p-4">
        <div className="text-lg font-semibold">Total Disbursements</div>
        <div className="text-2xl font-bold">{loading ? '...' : totalDisbursements}</div>
      </div>
      <div className="bg-white/70 backdrop-blur rounded-lg shadow p-4 col-span-1 sm:col-span-2 lg:col-span-4">
        <div className="text-lg font-semibold">Total Assistance Amount</div>
        <div className="text-2xl font-bold">{loading ? '...' : `₱ ${totalAssistance.toLocaleString()}`}</div>
      </div>
    </div>
  );
};

export default StatCards; 