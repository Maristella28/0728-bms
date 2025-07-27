import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbares from "../../components/Navbares";
import Sidebares from "../../components/Sidebares";
import { FaFileAlt, FaBusinessTime, FaIdBadge, FaHome } from 'react-icons/fa';
import axios from '../../utils/axiosConfig';
import { useState, useEffect } from 'react';

const RequestDocuments = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [purpose, setPurpose] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [residentData, setResidentData] = useState(null);
  const [loadingResident, setLoadingResident] = useState(true);

  // Fetch resident data on component mount
  useEffect(() => {
    fetchResidentData();
  }, []);

  const fetchResidentData = async () => {
    try {
      setLoadingResident(true);
      const response = await axios.get('/residents/my-profile');
      setResidentData(response.data);
    } catch (err) {
      console.error('Error fetching resident data:', err);
      setFeedback({ type: 'error', message: 'Failed to load your profile data. Please complete your resident profile first.' });
    } finally {
      setLoadingResident(false);
    }
  };

  const documentOptions = [
    {
      label: "Barangay Clearance",
      icon: <FaFileAlt className="text-green-700 text-5xl mb-4 animate-pulse mx-auto" />,
      value: "Brgy Clearance",
    },
    {
      label: "Barangay Business Permit",
      icon: <FaBusinessTime className="text-green-700 text-5xl mb-4 animate-pulse mx-auto" />,
      value: "Brgy Business Permit",
    },
    {
      label: "Certificate of Indigency",
      icon: <FaIdBadge className="text-green-700 text-5xl mb-4 animate-pulse mx-auto" />,
      value: "Brgy Indigency",
    },
    {
      label: "Certificate of Residency",
      icon: <FaHome className="text-green-700 text-5xl mb-4 animate-pulse mx-auto" />,
      value: "Brgy Residency",
    },
  ];

  const getAutoFilledFormData = (documentType) => {
    if (!residentData) return {};

    const baseData = {
      purpose: '', // This will be manually filled
      remarks: '', // This will be manually filled
    };

    switch (documentType) {
      case 'Brgy Clearance':
        return {
          ...baseData,
          name: `${residentData.first_name} ${residentData.middle_name ? residentData.middle_name + ' ' : ''}${residentData.last_name}${residentData.name_suffix ? ' ' + residentData.name_suffix : ''}`,
          address: residentData.full_address,
          periodOfStay: `${residentData.years_in_barangay} years`,
          dateOfBirth: residentData.birth_date,
          gender: residentData.sex,
          civilStatus: residentData.civil_status,
          birthplace: residentData.birth_place,
          age: residentData.age,
        };
      
      case 'Brgy Business Permit':
        return {
          ...baseData,
          businessName: residentData.business_info || '',
          businessOwner: `${residentData.first_name} ${residentData.last_name}`,
          amount: '', // This might need manual input
        };
      
      case 'Brgy Indigency':
        return {
          ...baseData,
          fullName: `${residentData.first_name} ${residentData.middle_name ? residentData.middle_name + ' ' : ''}${residentData.last_name}${residentData.name_suffix ? ' ' + residentData.name_suffix : ''}`,
          houseNumber: '', // User needs to fill this manually
          street: '', // User needs to fill this manually
          purok: '', // User needs to fill this manually
          barangay: '', // User needs to fill this manually
        };
      
      case 'Brgy Residency':
        return {
          ...baseData,
          fullName: `${residentData.first_name} ${residentData.middle_name ? residentData.middle_name + ' ' : ''}${residentData.last_name}${residentData.name_suffix ? ' ' + residentData.name_suffix : ''}`,
          address: residentData.full_address,
        };
      
      default:
        return baseData;
    }
  };

  const documentForms = {
    'Brgy Clearance': [
      { name: 'name', label: 'Full Name', type: 'text', required: true, autoFill: true },
      { name: 'address', label: 'Address', type: 'text', required: true, autoFill: true },
      { name: 'periodOfStay', label: 'Period of Stay', type: 'text', required: true, autoFill: true },
      { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true, autoFill: true },
      { name: 'gender', label: 'Gender', type: 'select', required: true, autoFill: true, options: ['Male', 'Female', 'Prefer not to say'] },
      { name: 'civilStatus', label: 'Civil Status', type: 'select', required: true, autoFill: true, options: ['Single', 'Married', 'Widowed', 'Divorced'] },
      { name: 'birthplace', label: 'Birthplace', type: 'text', required: true, autoFill: true },
      { name: 'age', label: 'Age', type: 'number', required: true, autoFill: true },
      { name: 'purpose', label: 'Purpose of Clearance', type: 'textarea', required: true, autoFill: false },
    ],
    'Brgy Business Permit': [
      { name: 'businessName', label: 'Business Name', type: 'text', required: true, autoFill: true },
      { name: 'businessOwner', label: 'Business Owner', type: 'text', required: true, autoFill: true },
      { name: 'amount', label: 'Amount', type: 'number', required: true, autoFill: false },
      { name: 'purpose', label: 'Purpose', type: 'textarea', required: true, autoFill: false },
    ],
    'Brgy Indigency': [
      { name: 'fullName', label: 'Full Name', type: 'text', required: true, autoFill: true },
      { name: 'purpose', label: 'Purpose', type: 'textarea', required: true, autoFill: false },
      { name: 'houseNumber', label: 'House Number', type: 'text', required: true, autoFill: false },
      { name: 'street', label: 'Street', type: 'text', required: true, autoFill: false },
      { name: 'purok', label: 'Purok', type: 'text', required: true, autoFill: false },
      { name: 'barangay', label: 'Barangay', type: 'text', required: true, autoFill: false },
    ],
    'Brgy Residency': [
      { name: 'fullName', label: 'Full Name', type: 'text', required: true, autoFill: true },
      { name: 'address', label: 'Complete Address', type: 'text', required: true, autoFill: true },
      { name: 'purpose', label: 'Purpose', type: 'textarea', required: true, autoFill: false },
    ],
  };

  const openModal = (doc) => {
    if (!residentData) {
      setFeedback({ type: 'error', message: 'Please complete your resident profile first before requesting documents.' });
      return;
    }
    
    setSelectedDoc(doc);
    setShowModal(true);
    
    // Auto-fill form with resident data
    const autoFilledData = getAutoFilledFormData(doc.value);
    setFormValues(autoFilledData);
    setFeedback(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDoc(null);
    setPurpose('');
    setRemarks('');
    setFeedback(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      await axios.post('/document-requests', {
        document_type: selectedDoc.value,
        fields: formValues,
      });
      setFeedback({ type: 'success', message: 'Request submitted successfully! You can track your request status in the Documents section.' });
      setFormValues({});
      setTimeout(() => {
        closeModal();
        // Optionally redirect to status page
        // navigate('/residents/documents/status');
      }, 2000);
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Submission failed. Please make sure you have completed your resident profile.' });
    } finally {
      setLoading(false);
    }
  };

  if (loadingResident) {
    return (
      <>
        <Navbares />
        <div className="flex min-h-screen bg-green-50">
          <Sidebares />
          <main className="flex-1 ml-64 pt-36 px-6 pb-16 font-sans flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your profile data...</p>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbares />
      <div className="flex min-h-screen bg-green-50">
        <Sidebares />

        <main className="flex-1 ml-64 pt-36 px-6 pb-16 font-sans flex flex-col items-center">
          <div className="w-full max-w-6xl space-y-10">

            {/* Page Header */}
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-green-900 tracking-tight border-b-4 border-green-500 inline-block pb-2">
                📄 Request Barangay Documents
              </h1>
              <p className="text-gray-600 mt-2 text-sm max-w-md mx-auto">
                Choose the type of document you need. Your information will be automatically filled from your profile.
              </p>
            </div>

            {/* Document Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-center">
              {documentOptions.map((doc, index) => (
                <div
                  key={index}
                  onClick={() => openModal(doc)}
                  className="bg-white border border-green-200 rounded-2xl p-6 w-full max-w-[16rem] text-center shadow-md hover:shadow-green-300 hover:scale-105 transition-all duration-300 cursor-pointer group"
                >
                  {doc.icon}
                  <p className="font-semibold text-green-900 text-base group-hover:underline">
                    {doc.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Modal for document request */}
      {showModal && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
            <button onClick={closeModal} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl">&times;</button>
            <h2 className="text-2xl font-bold mb-4 text-green-800">Request {selectedDoc.label}</h2>
            
            {!residentData && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-600 text-sm">Please complete your resident profile first before requesting documents.</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {documentForms[selectedDoc.value]?.map(field => (
                <div key={field.name}>
                  <label className="block text-sm font-semibold mb-1">
                    {field.label}
                    {field.autoFill && <span className="text-green-600 text-xs ml-1">(Auto-filled)</span>}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      name={field.name}
                      value={formValues[field.name] || ''}
                      onChange={e => setFormValues(v => ({ ...v, [field.name]: e.target.value }))}
                      className={`w-full border border-gray-300 rounded-lg px-3 py-2 ${field.autoFill ? 'bg-gray-50' : ''}`}
                      required={field.required}
                      disabled={field.autoFill}
                    >
                      <option value="">Select {field.label}</option>
                      {field.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      name={field.name}
                      value={formValues[field.name] || ''}
                      onChange={e => setFormValues(v => ({ ...v, [field.name]: e.target.value }))}
                      className={`w-full border border-gray-300 rounded-lg px-3 py-2 ${field.autoFill ? 'bg-gray-50' : ''}`}
                      required={field.required}
                      rows={4}
                      disabled={field.autoFill}
                      placeholder={field.autoFill ? 'Auto-filled from your profile' : field.label}
                    />
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      value={formValues[field.name] || ''}
                      onChange={e => setFormValues(v => ({ ...v, [field.name]: e.target.value }))}
                      className={`w-full border border-gray-300 rounded-lg px-3 py-2 ${field.autoFill ? 'bg-gray-50' : ''}`}
                      required={field.required}
                      disabled={field.autoFill}
                      placeholder={field.autoFill ? 'Auto-filled from your profile' : field.label}
                    />
                  )}
                </div>
              ))}
              {feedback && (
                <div className={`text-sm ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{feedback.message}</div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700">Cancel</button>
                <button type="submit" disabled={loading || !residentData} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">{loading ? 'Submitting...' : 'Submit Request'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default RequestDocuments;
