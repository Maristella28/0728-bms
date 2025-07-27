import React, { useState } from 'react';
import DisbursementForm from './DisbursementForm';
import axios from '../../../../utils/axiosConfig';

const DisbursementsTable = ({ disbursements, beneficiaries, fetchDisbursements, loading }) => {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);

  const filtered = disbursements.filter(d =>
    (d.method || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.remarks || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.amount || '').toString().includes(search)
  );

  const handleAdd = () => {
    setEditData(null);
    setShowModal(true);
  };
  const handleEdit = (d) => {
    setEditData(d);
    setShowModal(true);
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this disbursement?')) return;
    await axios.delete(`/disbursements/${id}`);
    fetchDisbursements();
  };

  return (
    <div className="bg-white/70 backdrop-blur rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg font-semibold">Disbursements</div>
        <button onClick={handleAdd} className="bg-emerald-600 text-white px-4 py-2 rounded shadow">Add Disbursement</button>
      </div>
      <input
        className="w-full mb-4 px-3 py-2 border rounded"
        placeholder="Search disbursements..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="px-4 py-2">Beneficiary</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Method</th>
              <th className="px-4 py-2">Remarks</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center py-8">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-8">No disbursements found.</td></tr>
            ) : filtered.map(d => (
              <tr key={d.id} className="hover:bg-emerald-50">
                <td className="px-4 py-2">{d.beneficiary_id ? (beneficiaries.find(b => b.id === d.beneficiary_id)?.name || 'N/A') : 'N/A'}</td>
                <td className="px-4 py-2">{d.date}</td>
                <td className="px-4 py-2">₱ {Number(d.amount).toLocaleString()}</td>
                <td className="px-4 py-2">{d.method}</td>
                <td className="px-4 py-2">{d.remarks}</td>
                <td className="px-4 py-2">
                  <button onClick={() => handleEdit(d)} className="text-blue-600 mr-2">Edit</button>
                  <button onClick={() => handleDelete(d.id)} className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <DisbursementForm
          initialData={editData}
          beneficiaries={beneficiaries}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchDisbursements(); }}
        />
      )}
    </div>
  );
};

export default DisbursementsTable; 