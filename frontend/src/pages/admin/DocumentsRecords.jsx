import React, { useState, useEffect } from 'react';
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon,
  XMarkIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  UserIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/solid";
import axios from '../../utils/axiosConfig';

const StatCard = ({ label, value, icon, iconBg }) => (
  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 flex justify-between items-center group">
    <div>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="text-3xl font-bold text-green-600 group-hover:text-emerald-600 transition">{value}</p>
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

const getDocumentTypeColor = (type) => {
  switch (type) {
    case 'Brgy Clearance':
      return 'bg-blue-100 text-blue-800';
    case 'Cedula':
      return 'bg-green-100 text-green-800';
    case 'Brgy Indigency':
      return 'bg-purple-100 text-purple-800';
    case 'Brgy Residency':
      return 'bg-orange-100 text-orange-800';
    case 'Brgy Business Permit':
      return 'bg-pink-100 text-pink-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getDocumentTypeIcon = (type) => {
  switch (type) {
    case 'Brgy Clearance':
      return <DocumentTextIcon className="w-3 h-3" />;
    case 'Cedula':
      return <DocumentIcon className="w-3 h-3" />;
    case 'Brgy Indigency':
      return <AcademicCapIcon className="w-3 h-3" />;
    case 'Brgy Residency':
      return <BuildingOfficeIcon className="w-3 h-3" />;
    case 'Brgy Business Permit':
      return <BuildingOfficeIcon className="w-3 h-3" />;
    default:
      return <DocumentTextIcon className="w-3 h-3" />;
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

const DocumentsRecords = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [generatingPdf, setGeneratingPdf] = useState(null);

  // Fetch document requests from backend
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await axios.get('/document-requests');
        // Map backend data to table format
        const mapped = res.data.map((item) => ({
          id: item.id,
          user: item.user,
          resident: item.resident,
          documentType: item.document_type,
          status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
          requestDate: item.created_at,
          approvedDate: item.status === 'approved' ? item.updated_at : null,
          purpose: item.fields?.purpose || '',
          remarks: item.fields?.remarks || '',
        }));
        setRecords(mapped);
        setFilteredRecords(mapped);
      } catch (err) {
        setRecords([]);
        setFilteredRecords([]);
      }
    };
    fetchRecords();
  }, []);

  // Filter records on search
  useEffect(() => {
    setFilteredRecords(
      records.filter((record) => {
        const name = record.user?.name || record.resident?.first_name + ' ' + record.resident?.last_name || '';
        const id = record.resident?.resident_id || record.user?.id ? `RES-${String(record.user?.id || record.resident?.id).padStart(3, '0')}` : '';
        return (
          name.toLowerCase().includes(search.toLowerCase()) ||
          id.toLowerCase().includes(search.toLowerCase()) ||
          record.documentType.toLowerCase().includes(search.toLowerCase())
        );
      })
    );
  }, [search, records]);

  const handleShowDetails = (record) => {
    if (selectedRecord?.id === record.id) {
      setSelectedRecord(null);
    } else {
      setSelectedRecord(record);
    }
  };

  const handleEdit = (record) => {
    setEditData({ ...record });
    setShowModal(true);
    setFeedback(null);
  };

  const handleSave = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      await axios.patch(`/document-requests/${editData.id}`, {
        status: editData.status.toLowerCase(),
        fields: {
          purpose: editData.purpose,
          remarks: editData.remarks,
        },
      });
      setFeedback({ type: 'success', message: 'Changes saved.' });
      setShowModal(false);
      setEditData({});
      // Refresh records
      const res = await axios.get('/document-requests');
      const mapped = res.data.map((item) => ({
        id: item.id,
        user: item.user,
          resident: item.resident,
        documentType: item.document_type,
        status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
        requestDate: item.created_at,
        approvedDate: item.status === 'approved' ? item.updated_at : null,
        purpose: item.fields?.purpose || '',
        remarks: item.fields?.remarks || '',
      }));
      setRecords(mapped);
      setFilteredRecords(mapped);
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to save changes.' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusCount = (status) => {
    return records.filter(record => record.status === status).length;
  };

  const handleGeneratePdf = async (record) => {
    setGeneratingPdf(record.id);
    setFeedback(null);
    try {
      const response = await axios.post(`/document-requests/${record.id}/generate-pdf`);
      setFeedback({ type: 'success', message: 'PDF certificate generated successfully!' });
      
      // Refresh records to get updated PDF path
      const res = await axios.get('/document-requests');
      const mapped = res.data.map((item) => ({
        id: item.id,
        user: item.user,
        resident: item.resident,
        documentType: item.document_type,
        status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
        requestDate: item.created_at,
        approvedDate: item.status === 'approved' ? item.updated_at : null,
        purpose: item.fields?.purpose || '',
        remarks: item.fields?.remarks || '',
        pdfPath: item.pdf_path,
      }));
      setRecords(mapped);
      setFilteredRecords(mapped);
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to generate PDF.' });
    } finally {
      setGeneratingPdf(null);
    }
  };

  const handleDownloadPdf = async (record) => {
    try {
      const response = await axios.get(`/document-requests/${record.id}/download-pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${record.documentType}-${record.user?.name || 'certificate'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to download PDF.' });
    }
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
              <DocumentTextIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
              Documents & Certificates Records
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Comprehensive management system for barangay document requests and certificate issuance with real-time tracking.
            </p>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              label="Total Requests"
              value={records.length}
              icon={<DocumentTextIcon className="w-6 h-6 text-green-600" />}
              iconBg="bg-green-100"
            />
            <StatCard
              label="Approved"
              value={getStatusCount('Approved')}
              icon={<CheckCircleIcon className="w-6 h-6 text-emerald-600" />}
              iconBg="bg-emerald-100"
            />
            <StatCard
              label="Pending"
              value={getStatusCount('Pending')}
              icon={<ClockIcon className="w-6 h-6 text-yellow-600" />}
              iconBg="bg-yellow-100"
            />
            <StatCard
              label="Processing"
              value={getStatusCount('Processing')}
              icon={<ClockIcon className="w-6 h-6 text-blue-600" />}
              iconBg="bg-blue-100"
            />
          </div>

          {/* Enhanced Search and Add Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="flex gap-3">
                <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105">
                  <DocumentTextIcon className="w-5 h-5" />
                  Show Document List
                </button>
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105">
                  <DocumentIcon className="w-5 h-5" />
                  Show Certificate List
                </button>
                <button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105">
                  <PlusIcon className="w-5 h-5" />
                  Request Document
                </button>
              </div>

              <div className="flex gap-3 items-center w-full max-w-md">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent rounded-xl text-sm shadow-sm transition-all duration-300"
                    placeholder="Search by name, ID, or document type..."
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
                <DocumentTextIcon className="w-5 h-5" />
                Document Records
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Resident ID</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Full Name</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">National ID</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Age</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Civil Status</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Gender</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Document Type</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <DocumentTextIcon className="w-12 h-12 text-gray-300" />
                          <p className="text-gray-500 font-medium">No document records found</p>
                          <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => (
                      <React.Fragment key={record.id}>
                        <tr className="hover:bg-green-50 transition-all duration-200 group">
                          <td className="px-6 py-4">
                            <span className="font-mono text-green-600 bg-green-50 px-2 py-1 rounded text-xs">
                              {record.resident?.resident_id || (record.user ? `RES-${String(record.user.id).padStart(3, '0')}` : 'N/A')}
                            </span>
                          </td>
                          <td
                            onClick={() => handleShowDetails(record)}
                            className="px-6 py-4 cursor-pointer group-hover:text-green-600 transition-colors duration-200"
                          >
                            <div className="font-semibold text-gray-900">
                              {record.user?.name || (record.resident ? `${record.resident.first_name} ${record.resident.last_name}` : 'N/A')}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <EyeIcon className="w-3 h-3" />
                              Click to view details
                            </div>
                          </td>
                          <td className="px-4 py-4 text-gray-700">
                            {record.resident?.nationality || 'N/A'}
                          </td>
                          <td className="px-4 py-4">
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                              {record.resident?.age || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-gray-700">
                            {record.resident?.civil_status || 'N/A'}
                          </td>
                          <td className="px-4 py-4 text-gray-700">
                            {record.resident?.sex || 'N/A'}
                          </td>
                          <td className="px-4 py-4">
                            {badge(record.documentType, getDocumentTypeColor(record.documentType), getDocumentTypeIcon(record.documentType))}
                          </td>
                          <td className="px-4 py-4">
                            {badge(record.status, getStatusColor(record.status), getStatusIcon(record.status))}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleShowDetails(record)}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all duration-300 transform hover:scale-105"
                              >
                                <EyeIcon className="w-3 h-3" />
                                View
                              </button>
                              <button
                                onClick={() => handleEdit(record)}
                                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all duration-300 transform hover:scale-105"
                              >
                                <PencilIcon className="w-3 h-3" />
                                Edit
                              </button>
                              {record.status === 'Approved' && (
                                <>
                                  {!record.pdfPath ? (
                                    <button
                                      onClick={() => handleGeneratePdf(record)}
                                      disabled={generatingPdf === record.id}
                                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                                    >
                                      <DocumentTextIcon className="w-3 h-3" />
                                      {generatingPdf === record.id ? 'Generating...' : 'Generate PDF'}
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleDownloadPdf(record)}
                                      className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all duration-300 transform hover:scale-105"
                                    >
                                      <DocumentArrowDownIcon className="w-3 h-3" />
                                      Download
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>

                        {selectedRecord?.id === record.id && (
                          <tr className="bg-gradient-to-r from-green-50 to-emerald-50">
                            <td colSpan="9" className="px-8 py-8">
                              <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-200">
                                <div className="flex flex-col lg:flex-row gap-8 items-start">
                                  {/* Document Information Card */}
                                  <div className="flex-1 space-y-6">
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                                      <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                                        <DocumentTextIcon className="w-5 h-5" /> Document Information
                                      </h4>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div><span className="font-medium text-gray-700">Document Type:</span> <span className="text-gray-900">{selectedRecord.documentType}</span></div>
                                        <div><span className="font-medium text-gray-700">Status:</span> <span className="text-gray-900">{selectedRecord.status}</span></div>
                                        <div><span className="font-medium text-gray-700">Request Date:</span> <span className="text-gray-900">{formatDate(selectedRecord.requestDate)}</span></div>
                                        <div><span className="font-medium text-gray-700">Approved Date:</span> <span className="text-gray-900">{formatDate(selectedRecord.approvedDate)}</span></div>
                                        <div><span className="font-medium text-gray-700">Purpose:</span> <span className="text-gray-900">{selectedRecord.purpose}</span></div>
                                        <div><span className="font-medium text-gray-700">Remarks:</span> <span className="text-gray-900">{selectedRecord.remarks}</span></div>
                                      </div>
                                    </div>

                                    {/* Resident Information Card */}
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                                      <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                                        <UserIcon className="w-5 h-5" /> Resident Information
                                      </h4>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div><span className="font-medium text-gray-700">Resident ID:</span> <span className="text-gray-900">{selectedRecord.resident?.resident_id || (selectedRecord.user?.id ? `RES-${String(selectedRecord.user.id).padStart(3, '0')}` : 'N/A')}</span></div>
                                        <div><span className="font-medium text-gray-700">Full Name:</span> <span className="text-gray-900">{selectedRecord.user?.name || (selectedRecord.resident ? `${selectedRecord.resident.first_name} ${selectedRecord.resident.middle_name ? selectedRecord.resident.middle_name + ' ' : ''}${selectedRecord.resident.last_name}${selectedRecord.resident.name_suffix ? ' ' + selectedRecord.resident.name_suffix : ''}` : 'N/A')}</span></div>
                                        <div><span className="font-medium text-gray-700">Nationality:</span> <span className="text-gray-900">{selectedRecord.resident?.nationality || 'N/A'}</span></div>
                                        <div><span className="font-medium text-gray-700">Age:</span> <span className="text-gray-900">{selectedRecord.resident?.age || 'N/A'}</span></div>
                                        <div><span className="font-medium text-gray-700">Civil Status:</span> <span className="text-gray-900">{selectedRecord.resident?.civil_status || 'N/A'}</span></div>
                                        <div><span className="font-medium text-gray-700">Gender:</span> <span className="text-gray-900">{selectedRecord.resident?.sex || 'N/A'}</span></div>
                                        <div><span className="font-medium text-gray-700">Contact Number:</span> <span className="text-gray-900">{selectedRecord.resident?.contact_number || 'N/A'}</span></div>
                                        <div><span className="font-medium text-gray-700">Email:</span> <span className="text-gray-900">{selectedRecord.resident?.email || 'N/A'}</span></div>
                                        <div><span className="font-medium text-gray-700">Address:</span> <span className="text-gray-900">{selectedRecord.resident?.full_address || 'N/A'}</span></div>
                                        <div><span className="font-medium text-gray-700">Birth Date:</span> <span className="text-gray-900">{selectedRecord.resident?.birth_date ? formatDate(selectedRecord.resident.birth_date) : 'N/A'}</span></div>
                                        <div><span className="font-medium text-gray-700">Birth Place:</span> <span className="text-gray-900">{selectedRecord.resident?.birth_place || 'N/A'}</span></div>
                                        <div><span className="font-medium text-gray-700">Religion:</span> <span className="text-gray-900">{selectedRecord.resident?.religion || 'N/A'}</span></div>
                                        <div><span className="font-medium text-gray-700">Years in Barangay:</span> <span className="text-gray-900">{selectedRecord.resident?.years_in_barangay || 'N/A'}</span></div>
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
                    Edit Document Record
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Document Type</label>
                    <select
                      value={editData.documentType || ''}
                      onChange={(e) => setEditData({...editData, documentType: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      disabled
                    >
                      <option value="">Select Document Type</option>
                      <option value="Brgy Clearance">Brgy Clearance</option>
                      <option value="Cedula">Cedula</option>
                      <option value="Brgy Indigency">Brgy Indigency</option>
                      <option value="Brgy Residency">Brgy Residency</option>
                      <option value="Brgy Business Permit">Brgy Business Permit</option>
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Purpose</label>
                    <input
                      type="text"
                      value={editData.purpose || ''}
                      onChange={(e) => setEditData({...editData, purpose: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter purpose"
                    />
                  </div>
                  <div>
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
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
                {feedback && (
                  <div className={`text-sm mt-2 ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{feedback.message}</div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default DocumentsRecords;