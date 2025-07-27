import React, { useState, useEffect } from 'react';
import StatCards from './StatCards';
import AnalyticsCharts from './AnalyticsCharts';
import BeneficiariesTable from './BeneficiariesTable';
import DisbursementsTable from './DisbursementsTable';
import { HeartIcon, UserGroupIcon, PlusIcon, FunnelIcon, MagnifyingGlassIcon, AcademicCapIcon, UserIcon } from '@heroicons/react/24/solid';
import axios from '../../../../utils/axiosConfig';

const beneficiaryTypes = [
  { label: 'Student', icon: <AcademicCapIcon className="w-6 h-6 text-blue-600" />, color: 'bg-blue-100', valueColor: 'text-blue-600' },
  { label: 'Senior Citizen', icon: <UserIcon className="w-6 h-6 text-purple-600" />, color: 'bg-purple-100', valueColor: 'text-purple-600' },
  { label: 'PWD', icon: <UserIcon className="w-6 h-6 text-amber-600" />, color: 'bg-amber-100', valueColor: 'text-amber-600' },
  { label: 'Indigent', icon: <UserIcon className="w-6 h-6 text-rose-600" />, color: 'bg-rose-100', valueColor: 'text-rose-600' },
  { label: 'Solo Parent', icon: <UserIcon className="w-6 h-6 text-teal-600" />, color: 'bg-teal-100', valueColor: 'text-teal-600' },
];

const SocialServices = () => {
  const [tab, setTab] = useState('beneficiaries');
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [disbursements, setDisbursements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Fetch data
  const fetchBeneficiaries = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/beneficiaries');
      setBeneficiaries(res.data);
    } catch (err) {
      setError('Failed to fetch beneficiaries');
    } finally {
      setLoading(false);
    }
  };
  const fetchDisbursements = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/disbursements');
      setDisbursements(res.data);
    } catch (err) {
      setError('Failed to fetch disbursements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeneficiaries();
    fetchDisbursements();
  }, []);

  // Filtered beneficiaries for search
  const filteredBeneficiaries = beneficiaries.filter(b =>
    (b.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.beneficiary_type || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.assistance_type || '').toLowerCase().includes(search.toLowerCase())
  );

  // Stat cards for each type
  const typeCounts = beneficiaryTypes.map(type => ({
    ...type,
    count: beneficiaries.filter(b => b.beneficiary_type === type.label).length
  }));

  return (
    <main className="bg-gradient-to-br from-green-50 to-white min-h-screen pt-20 px-2 sm:px-4 md:px-8 pb-10 font-sans lg:ml-64">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        {/* Animated Header */}
        <div className="text-center space-y-4 w-full flex flex-col items-center justify-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-xl mb-4 animate-pulse">
            <HeartIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
            Social Services & Assistance
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Comprehensive social services management system for barangay beneficiaries and assistance programs with real-time tracking.
          </p>
        </div>

        {/* Stat Cards for Each Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          {typeCounts.map(type => (
            <div key={type.label} className={`rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 flex justify-between items-center group ${type.color}`}>
              <div>
                <p className="text-sm font-medium text-gray-600">{type.label}</p>
                <p className={`text-3xl font-bold ${type.valueColor} group-hover:text-emerald-600 transition`}>{loading ? '...' : type.count}</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white">
                {type.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Stat Cards & Analytics */}
        <StatCards beneficiaries={beneficiaries} disbursements={disbursements} loading={loading} />
        <AnalyticsCharts beneficiaries={beneficiaries} disbursements={disbursements} loading={loading} />

        {/* Tabs */}
        <div className="flex space-x-4 mt-6 mb-4 justify-center">
          <button
            className={`px-6 py-3 rounded-xl font-semibold shadow transition-all duration-200 ${tab === 'beneficiaries' ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white scale-105' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => setTab('beneficiaries')}
          >
            Beneficiaries
          </button>
          <button
            className={`px-6 py-3 rounded-xl font-semibold shadow transition-all duration-200 ${tab === 'disbursements' ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white scale-105' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => setTab('disbursements')}
          >
            Disbursements
          </button>
        </div>
        {error && <div className="text-red-600 mb-4 text-center">{error}</div>}

        {/* Search/Action Bar (Beneficiaries only) */}
        {tab === 'beneficiaries' && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8 flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex gap-3">
              <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105">
                <PlusIcon className="w-5 h-5" />
                Add Beneficiary
              </button>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105">
                <UserGroupIcon className="w-5 h-5" />
                Residents Application
              </button>
              <button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105">
                <HeartIcon className="w-5 h-5" />
                Generate Report
              </button>
            </div>
            <div className="flex gap-3 items-center w-full max-w-md">
              <div className="relative flex-grow">
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent rounded-xl text-sm shadow-sm transition-all duration-300"
                  placeholder="Search by name, type, or assistance..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
              </div>
              <button className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg transition-all duration-300">
                <FunnelIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Table Section */}
        <div className="bg-white/70 backdrop-blur rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center gap-2">
            <UserGroupIcon className="w-6 h-6 text-white" />
            <h3 className="text-white font-semibold text-lg">
              {tab === 'beneficiaries' ? 'List of Beneficiaries' : 'List of Disbursements'}
            </h3>
          </div>
          <div className="p-4">
            {tab === 'beneficiaries' ? (
              <BeneficiariesTable
                beneficiaries={filteredBeneficiaries}
                fetchBeneficiaries={fetchBeneficiaries}
                loading={loading}
              />
            ) : (
              <DisbursementsTable
                disbursements={disbursements}
                beneficiaries={beneficiaries}
                fetchDisbursements={fetchDisbursements}
                loading={loading}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default SocialServices; 