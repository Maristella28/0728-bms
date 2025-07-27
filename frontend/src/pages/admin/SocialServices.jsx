import React, { useState, useEffect } from 'react';
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import {
  HeartIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon,
  XMarkIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
  UserGroupIcon,
  UserIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/solid";

const StatCard = ({ label, value, icon, iconBg, valueColor = "text-green-600" }) => (
  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 flex justify-between items-center group">
    <div>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className={`text-3xl font-bold ${valueColor} group-hover:text-emerald-600 transition`}>{value}</p>
    </div>
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBg}`}>
      {icon}
    </div>
  </div>
);

const badge = (text, color, icon = null) => (
  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${color}`}>
    {icon && icon}
    {text}
  </span>
);

const getBeneficiaryTypeColor = (type) => {
  switch (type) {
    case 'Student':
      return 'bg-blue-100 text-blue-800';
    case 'Senior Citizen':
      return 'bg-purple-100 text-purple-800';
    case 'PWD':
      return 'bg-amber-100 text-amber-800';
    case 'Indigent':
      return 'bg-rose-100 text-rose-800';
    case 'Solo Parent':
      return 'bg-teal-100 text-teal-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getBeneficiaryTypeIcon = (type) => {
  switch (type) {
    case 'Student':
      return <AcademicCapIcon className="w-3 h-3" />;
    case 'Senior Citizen':
      return <UserIcon className="w-3 h-3" />;
    case 'PWD':
      return <UserIcon className="w-3 h-3" />;
    case 'Indigent':
      return <UserIcon className="w-3 h-3" />;
    case 'Solo Parent':
      return <UserIcon className="w-3 h-3" />;
    default:
      return <UserIcon className="w-3 h-3" />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Approved':
      return 'bg-green-100 text-green-800';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'Rejected':
      return 'bg-red-100 text-red-800';
    case 'Processing':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'Approved':
      return <CheckCircleIcon className="w-3 h-3" />;
    case 'Pending':
      return <ClockIcon className="w-3 h-3" />;
    case 'Rejected':
      return <ExclamationTriangleIcon className="w-3 h-3" />;
    case 'Processing':
      return <ClockIcon className="w-3 h-3" />;
    default:
      return <ClockIcon className="w-3 h-3" />;
  }
};

const beneficiaries = [
  {
    id: 1,
    name: 'Maria Santos',
    beneficiaryType: 'Senior Citizen',
    status: 'Approved',
    applicationDate: '2024-01-15',
    approvedDate: '2024-01-20',
    contactNumber: '+63 912 345 6789',
    email: 'maria.santos@email.com',
    address: '123 Barangay Street, City',
    assistanceType: 'Monthly Pension',
    amount: 5000,
    remarks: 'All requirements submitted and verified',
  },
  {
    id: 2,
    name: 'Juan Dela Cruz',
    beneficiaryType: 'Student',
    status: 'Pending',
    applicationDate: '2024-01-18',
    approvedDate: null,
    contactNumber: '+63 923 456 7890',
    email: 'juan.delacruz@email.com',
    address: '456 Neighborhood Ave, City',
    assistanceType: 'Educational Assistance',
    amount: 3000,
    remarks: 'Under review',
  },
  {
    id: 3,
    name: 'Ana Reyes',
    beneficiaryType: 'PWD',
    status: 'Processing',
    applicationDate: '2024-01-20',
    approvedDate: null,
    contactNumber: '+63 934 567 8901',
    email: 'ana.reyes@email.com',
    address: '789 Community Road, City',
    assistanceType: 'Medical Assistance',
    amount: 8000,
    remarks: 'Documents being verified',
  },
  {
    id: 4,
    name: 'Pedro Martinez',
    beneficiaryType: 'Indigent',
    status: 'Approved',
    applicationDate: '2024-01-10',
    approvedDate: '2024-01-12',
    contactNumber: '+63 945 678 9012',
    email: 'pedro.martinez@email.com',
    address: '321 Community Road, City',
    assistanceType: 'Food Assistance',
    amount: 2000,
    remarks: 'Assistance provided',
  },
  {
    id: 5,
    name: 'Luz Garcia',
    beneficiaryType: 'Solo Parent',
    status: 'Rejected',
    applicationDate: '2024-01-05',
    approvedDate: null,
    contactNumber: '+63 956 789 0123',
    email: 'luz.garcia@email.com',
    address: '654 Business District, City',
    assistanceType: 'Livelihood Assistance',
    amount: 10000,
    remarks: 'Incomplete requirements',
  },
];

const SocialServices = () => {
  const [filteredBeneficiaries, setFilteredBeneficiaries] = useState(beneficiaries);
  const [search, setSearch] = useState("");
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    setFilteredBeneficiaries(
      beneficiaries.filter((beneficiary) =>
        beneficiary.name.toLowerCase().includes(search.toLowerCase()) ||
        beneficiary.beneficiaryType.toLowerCase().includes(search.toLowerCase()) ||
        beneficiary.assistanceType.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search]);

  const handleShowDetails = (beneficiary) => {
    if (selectedBeneficiary?.id === beneficiary.id) {
      setSelectedBeneficiary(null);
    } else {
      setSelectedBeneficiary(beneficiary);
    }
  };

  const handleEdit = (beneficiary) => {
    setEditData(beneficiary);
    setShowModal(true);
  };

  const handleSave = () => {
    // Handle save logic here
    setShowModal(false);
    setEditData({});
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getBeneficiaryCount = (type) => {
    return beneficiaries.filter(beneficiary => beneficiary.beneficiaryType === type).length;
  };

  const getStatusCount = (status) => {
    return beneficiaries.filter(beneficiary => beneficiary.status === status).length;
  };

  return (
    <>
      <Navbar />
      <Sidebar />
      <main className="bg-gradient-to-br from-green-50 to-white min-h-screen ml-64 pt-36 px-6 pb-16 font-sans">
        <div className="w-full max-w-7xl mx-auto space-y-8">
          {/* Enhanced Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-xl mb-4">
              <HeartIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
              Social Services & Assistance
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Comprehensive social services management system for barangay beneficiaries and assistance programs with real-time tracking.
            </p>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
            <StatCard
              label="Total Beneficiaries"
              value="1,245"
              icon={<UserGroupIcon className="w-6 h-6 text-green-600" />}
              iconBg="bg-green-100"
              valueColor="text-green-600"
            />
            <StatCard
              label="Student Beneficiaries"
              value="58"
              icon={<AcademicCapIcon className="w-6 h-6 text-blue-600" />}
              iconBg="bg-blue-100"
              valueColor="text-blue-600"
            />
            <StatCard
              label="Senior Citizens"
              value="16"
              icon={<UserIcon className="w-6 h-6 text-purple-600" />}
              iconBg="bg-purple-100"
              valueColor="text-purple-600"
            />
            <StatCard
              label="PWD Beneficiaries"
              value="12"
              icon={<UserIcon className="w-6 h-6 text-amber-600" />}
              iconBg="bg-amber-100"
              valueColor="text-amber-600"
            />
            <StatCard
              label="Indigent Beneficiaries"
              value="8"
              icon={<UserIcon className="w-6 h-6 text-rose-600" />}
              iconBg="bg-rose-100"
              valueColor="text-rose-600"
            />
            <StatCard
              label="Solo Parents"
              value="3"
              icon={<UserIcon className="w-6 h-6 text-teal-600" />}
              iconBg="bg-teal-100"
              valueColor="text-teal-600"
            />
          </div>

          {/* Enhanced Search and Add Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
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
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
                </div>
                <button className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg transition-all duration-300">
                  <FunnelIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <HeartIcon className="w-5 h-5" />
                List of Social Services / Assistance
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Beneficiary Name</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Type</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Assistance Type</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Amount</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredBeneficiaries.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <HeartIcon className="w-12 h-12 text-gray-300" />
                          <p className="text-gray-500 font-medium">No beneficiaries found</p>
                          <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredBeneficiaries.map((beneficiary) => (
                      <React.Fragment key={beneficiary.id}>
                        <tr className="hover:bg-green-50 transition-all duration-200 group">
                          <td
                            onClick={() => handleShowDetails(beneficiary)}
                            className="px-6 py-4 cursor-pointer group-hover:text-green-600 transition-colors duration-200"
                          >
                            <div className="font-semibold text-gray-900">
                              {beneficiary.name}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <EyeIcon className="w-3 h-3" />
                              Click to view details
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {badge(beneficiary.beneficiaryType, getBeneficiaryTypeColor(beneficiary.beneficiaryType), getBeneficiaryTypeIcon(beneficiary.beneficiaryType))}
                          </td>
                          <td className="px-4 py-4 text-gray-700">{beneficiary.assistanceType}</td>
                          <td className="px-4 py-4">
                            {badge(beneficiary.status, getStatusColor(beneficiary.status), getStatusIcon(beneficiary.status))}
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-semibold text-green-600">
                              ₱ {beneficiary.amount.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleShowDetails(beneficiary)}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all duration-300 transform hover:scale-105"
                              >
                                <EyeIcon className="w-3 h-3" />
                                View
                              </button>
                              <button
                                onClick={() => handleEdit(beneficiary)}
                                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all duration-300 transform hover:scale-105"
                              >
                                <PencilIcon className="w-3 h-3" />
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>

                        {selectedBeneficiary?.id === beneficiary.id && (
                          <tr className="bg-gradient-to-r from-green-50 to-emerald-50">
                            <td colSpan="6" className="px-8 py-8">
                              <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-200">
                                <div className="flex flex-col lg:flex-row gap-8 items-start">
                                  {/* Assistance Information Card */}
                                  <div className="flex-1 space-y-6">
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                                      <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                                        <HeartIcon className="w-5 h-5" /> Assistance Information
                                      </h4>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div><span className="font-medium text-gray-700">Assistance Type:</span> <span className="text-gray-900">{selectedBeneficiary.assistanceType}</span></div>
                                        <div><span className="font-medium text-gray-700">Status:</span> <span className="text-gray-900">{selectedBeneficiary.status}</span></div>
                                        <div><span className="font-medium text-gray-700">Application Date:</span> <span className="text-gray-900">{formatDate(selectedBeneficiary.applicationDate)}</span></div>
                                        <div><span className="font-medium text-gray-700">Approved Date:</span> <span className="text-gray-900">{formatDate(selectedBeneficiary.approvedDate)}</span></div>
                                        <div><span className="font-medium text-gray-700">Amount:</span> <span className="font-semibold text-green-600">₱ {selectedBeneficiary.amount.toLocaleString()}</span></div>
                                        <div><span className="font-medium text-gray-700">Remarks:</span> <span className="text-gray-900">{selectedBeneficiary.remarks}</span></div>
                                      </div>
                                    </div>

                                    {/* Beneficiary Information Card */}
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                                      <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                                        <UserIcon className="w-5 h-5" /> Beneficiary Information
                                      </h4>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div><span className="font-medium text-gray-700">Full Name:</span> <span className="text-gray-900">{selectedBeneficiary.name}</span></div>
                                        <div><span className="font-medium text-gray-700">Beneficiary Type:</span> <span className="text-gray-900">{selectedBeneficiary.beneficiaryType}</span></div>
                                        <div><span className="font-medium text-gray-700">Contact Number:</span> <span className="text-gray-900">{selectedBeneficiary.contactNumber}</span></div>
                                        <div><span className="font-medium text-gray-700">Email:</span> <span className="text-gray-900">{selectedBeneficiary.email}</span></div>
                                        <div><span className="font-medium text-gray-700">Address:</span> <span className="text-gray-900">{selectedBeneficiary.address}</span></div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Enhanced Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 rounded-3xl shadow-2xl border border-green-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-3xl p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <PencilIcon className="w-6 h-6" />
                    Edit Beneficiary Record
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-white hover:text-red-200 transition-colors duration-200"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Beneficiary Type</label>
                    <select
                      value={editData.beneficiaryType || ''}
                      onChange={(e) => setEditData({...editData, beneficiaryType: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="">Select Type</option>
                      <option value="Student">Student</option>
                      <option value="Senior Citizen">Senior Citizen</option>
                      <option value="PWD">PWD</option>
                      <option value="Indigent">Indigent</option>
                      <option value="Solo Parent">Solo Parent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select
                      value={editData.status || ''}
                      onChange={(e) => setEditData({...editData, status: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="">Select Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Assistance Type</label>
                    <input
                      type="text"
                      value={editData.assistanceType || ''}
                      onChange={(e) => setEditData({...editData, assistanceType: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter assistance type"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Amount</label>
                    <input
                      type="number"
                      value={editData.amount || ''}
                      onChange={(e) => setEditData({...editData, amount: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter amount"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Remarks</label>
                    <input
                      type="text"
                      value={editData.remarks || ''}
                      onChange={(e) => setEditData({...editData, remarks: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter remarks"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default SocialServices;