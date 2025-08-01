import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbares from "../../components/Navbares";
import Sidebares from "../../components/Sidebares";
import { FaFileAlt, FaBusinessTime, FaIdBadge, FaHome, FaPaperPlane, FaUser, FaCalendarAlt, FaIdCard, FaStar, FaMagic, FaCheckCircle, FaCertificate, FaExclamationTriangle, FaInfoCircle, FaTimes, FaSpinner, FaCamera, FaUpload, FaImage, FaTrash } from 'react-icons/fa';
import axios from '../../utils/axiosConfig';
import { useState, useEffect } from 'react';
import './RequestDocuments.css';

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
  const [autoRefresh, setAutoRefresh] = useState(false); // Disabled by default for this page
  const [lastDataCheck, setLastDataCheck] = useState(new Date());
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);

  // Fetch resident data on component mount
  useEffect(() => {
    fetchResidentData();
  }, []);

  // Auto-refresh resident data periodically (optional)
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchResidentData(false); // Silent refresh
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const fetchResidentData = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoadingResident(true);
      }
      const response = await axios.get('/residents/my-profile');
      setResidentData(response.data);
      setLastDataCheck(new Date());
    } catch (err) {
      console.error('Error fetching resident data:', err);
      if (showLoading) {
        setFeedback({ type: 'error', message: 'Failed to load your profile data. Please complete your resident profile first.' });
      }
    } finally {
      if (showLoading) {
        setLoadingResident(false);
      }
    }
  };

  // Manual refresh function
  const handleRefreshData = () => {
    fetchResidentData(true);
    setFeedback({
      type: 'loading',
      message: 'Refreshing your profile data...'
    });
    
    setTimeout(() => {
      setFeedback({
        type: 'success',
        message: '✅ Profile data refreshed successfully!',
        duration: 2000
      });
    }, 1000);
  };

  const documentOptions = [
    {
      label: "Barangay Clearance",
      icon: <FaFileAlt className="text-emerald-600 text-5xl mb-4 mx-auto transition-all duration-300 group-hover:scale-110 group-hover:text-emerald-500" />,
      value: "Brgy Clearance",
      description: "Official clearance for various purposes",
      gradient: "from-emerald-400 to-teal-500",
      bgPattern: "bg-gradient-to-br from-emerald-50 to-teal-50",
    },
    {
      label: "Barangay Business Permit",
      icon: <FaBusinessTime className="text-blue-600 text-5xl mb-4 mx-auto transition-all duration-300 group-hover:scale-110 group-hover:text-blue-500" />,
      value: "Brgy Business Permit",
      description: "Permit for business operations",
      gradient: "from-blue-400 to-indigo-500",
      bgPattern: "bg-gradient-to-br from-blue-50 to-indigo-50",
    },
    {
      label: "Certificate of Indigency",
      icon: <FaIdBadge className="text-purple-600 text-5xl mb-4 mx-auto transition-all duration-300 group-hover:scale-110 group-hover:text-purple-500" />,
      value: "Brgy Indigency",
      description: "Certificate for financial assistance",
      gradient: "from-purple-400 to-pink-500",
      bgPattern: "bg-gradient-to-br from-purple-50 to-pink-50",
    },
    {
      label: "Certificate of Residency",
      icon: <FaHome className="text-orange-600 text-5xl mb-4 mx-auto transition-all duration-300 group-hover:scale-110 group-hover:text-orange-500" />,
      value: "Brgy Residency",
      description: "Proof of residence certificate",
      gradient: "from-orange-400 to-red-500",
      bgPattern: "bg-gradient-to-br from-orange-50 to-red-50",
    },
    {
      label: "Barangay Certification",
      icon: <FaCertificate className="text-rose-600 text-5xl mb-4 mx-auto transition-all duration-300 group-hover:scale-110 group-hover:text-rose-500" />,
      value: "Brgy Certification",
      description: "Official certification for various needs",
      gradient: "from-rose-400 to-pink-500",
      bgPattern: "bg-gradient-to-br from-rose-50 to-pink-50",
    },
  ];

  // Helper function to format date for HTML date input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    // Convert ISO date to yyyy-MM-dd format
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

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
          address: residentData.current_address || residentData.full_address,
          periodOfStay: `${residentData.years_in_barangay} years`,
          dateOfBirth: formatDateForInput(residentData.birth_date),
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
          address: residentData.current_address || residentData.full_address,
        };
      
      case 'Brgy Certification':
        return {
          ...baseData,
          fullName: `${residentData.first_name} ${residentData.middle_name ? residentData.middle_name + ' ' : ''}${residentData.last_name}${residentData.name_suffix ? ' ' + residentData.name_suffix : ''}`,
          address: residentData.current_address || residentData.full_address,
          dateOfBirth: formatDateForInput(residentData.birth_date),
          civilStatus: residentData.civil_status,
          age: residentData.age,
          // Additional fields for specific certifications
          childName: '', // For solo parent certification
          childBirthDate: '', // For solo parent certification
          registrationOffice: '', // For delayed registration
          registrationDate: '', // For delayed registration
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
    'Brgy Certification': [
      { name: 'fullName', label: 'Full Name', type: 'text', required: true, autoFill: true },
      { name: 'address', label: 'Complete Address', type: 'text', required: true, autoFill: true },
      { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true, autoFill: true },
      { name: 'civilStatus', label: 'Civil Status', type: 'select', required: true, autoFill: true, options: ['Single', 'Married', 'Widowed', 'Divorced'] },
      { name: 'age', label: 'Age', type: 'number', required: true, autoFill: true },
      { name: 'purpose', label: 'Type of Certification', type: 'select', required: true, autoFill: false, options: [
        'Solo Parent Certification',
        'Delayed Registration of Birth Certificate',
        'Good Moral Character',
        'First Time Job Seeker',
        'Senior Citizen Certification',
        'PWD Certification',
        'Cohabitation Certificate',
        'No Income Certificate'
      ]},
      // Conditional fields for Solo Parent Certification
      { name: 'childName', label: 'Child\'s Full Name', type: 'text', required: false, autoFill: false, conditional: 'Solo Parent Certification' },
      { name: 'childBirthDate', label: 'Child\'s Birth Date', type: 'date', required: false, autoFill: false, conditional: 'Solo Parent Certification' },
      // Conditional fields for Delayed Registration
      { name: 'registrationOffice', label: 'Registration Office (Local Civil Registry)', type: 'text', required: false, autoFill: false, conditional: 'Delayed Registration of Birth Certificate' },
      { name: 'registrationDate', label: 'Registration Date', type: 'date', required: false, autoFill: false, conditional: 'Delayed Registration of Birth Certificate' },
      { name: 'remarks', label: 'Additional Information/Remarks', type: 'textarea', required: false, autoFill: false },
    ],
  };

  // Add purpose options for each document type
  const purposeOptions = {
    'Brgy Clearance': [
      'local employment',
      'loan',
      'identification',
      'ojt',
      'water/electric connection',
      'bank',
      'senior',
      'e-bike',
      'postal',
      'other specific',
    ],
    'Brgy Residency': [
      'verification and identification (School Requirement)',
      'verification and identification PWD',
      'other',
    ],
    'Brgy Indigency': [
      'verification and identification (philhealth Requirement)',
      'BOTICAB Requirement',
      'Medical/Financial Assistance',
      'Financial Assistance',
      'Animal Bite Vaccination',
      'Public Attorney\'s Office Assistance',
      'Burial/Financial Assistance',
      'other',
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
    
    // Auto-fill photo for Barangay Clearance from resident profile
    if (doc.value === 'Brgy Clearance' && residentData?.avatar) {
      setPhotoPreview(residentData.avatar.startsWith('http') ? residentData.avatar : `/storage/${residentData.avatar}`);
      setSelectedPhoto(null); // No file object for profile photo
      setFeedback({
        type: 'success',
        message: '📸 Profile photo automatically loaded for Barangay Clearance'
      });
    } else {
      setFeedback(null);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDoc(null);
    setPurpose('');
    setRemarks('');
    setFeedback(null);
    
    // Clean up photo states
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setShowCamera(false);
    
    // Stop camera stream if active
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  // Photo handling functions
  const handlePhotoSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setFeedback({
          type: 'error',
          message: 'Please select a valid image file (JPEG, PNG, etc.)'
        });
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setFeedback({
          type: 'error',
          message: 'Photo size must be less than 5MB'
        });
        return;
      }
      
      setSelectedPhoto(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      setFeedback({
        type: 'success',
        message: '📸 Photo selected successfully!'
      });
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user' // Front camera
        }
      });
      setCameraStream(stream);
      setShowCamera(true);
      setFeedback({
        type: 'success',
        message: '📷 Camera started! Position yourself and click capture.'
      });
    } catch (error) {
      console.error('Error accessing camera:', error);
      setFeedback({
        type: 'error',
        message: 'Unable to access camera. Please check permissions or use file upload instead.'
      });
    }
  };

  const capturePhoto = () => {
    if (!cameraStream) return;
    
    const video = document.getElementById('camera-video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
      setSelectedPhoto(file);
      setPhotoPreview(canvas.toDataURL());
      
      // Stop camera
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      setShowCamera(false);
      
      setFeedback({
        type: 'success',
        message: '📸 Photo captured successfully!'
      });
    }, 'image/jpeg', 0.8);
  };

  const removePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setFeedback({
      type: 'success',
      message: 'Photo removed'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: 'loading', message: 'Processing your request...' });
    
    try {
      let purposeValue = formValues.purpose;
      if ((purposeValue === 'other' || purposeValue === 'other specific') && formValues.otherPurpose) {
        purposeValue = formValues.otherPurpose;
      }
      const submitFields = { ...formValues, purpose: purposeValue };
      delete submitFields.otherPurpose;
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('document_type', selectedDoc.value);
      formData.append('fields', JSON.stringify(submitFields));
      
      // Add photo if selected (only for Barangay Clearance)
      if (selectedDoc.value === 'Brgy Clearance' && selectedPhoto) {
        formData.append('photo', selectedPhoto);
      }
      
      // Debug logging
      console.log('Document request data:', {
        document_type: selectedDoc.value,
        fields: submitFields,
        hasPhoto: selectedDoc.value === 'Brgy Clearance' && selectedPhoto ? true : false,
        photoName: selectedPhoto?.name,
        formDataEntries: Array.from(formData.entries()).map(([key, value]) => [
          key,
          value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value
        ])
      });
      
      await axios.post('/document-requests', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setFeedback({
        type: 'success',
        message: `🎉 ${selectedDoc.label} request submitted successfully!`,
        details: 'Your request has been received and is now being processed. You will receive notifications about status updates.',
        actions: [
          { label: 'Track Status', action: () => navigate('/residents/documents/status') },
          { label: 'Request Another', action: () => { closeModal(); setTimeout(() => setShowModal(false), 100); } },
          { label: 'Refresh Data', action: () => handleRefreshData() }
        ]
      });
      setFormValues({});
      
      // Refresh resident data to get latest info
      setTimeout(() => {
        fetchResidentData(false);
      }, 1000);
      
      // Auto close after 4 seconds instead of 2
      setTimeout(() => {
        closeModal();
      }, 4000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Submission failed. Please try again.';
      const errorCode = err.response?.status;
      const errorData = err.response?.data;
      
      let enhancedMessage = errorMessage;
      let errorType = 'error';
      let actions = [];
      
      if (errorCode === 422) {
        if (errorData?.error_code === 'NO_RESIDENT_PROFILE') {
          enhancedMessage = 'You need to complete your resident profile first before requesting documents.';
          errorType = 'validation';
          actions = [
            { label: 'Complete Profile', action: () => navigate('/profile') },
            { label: 'Try Again Later', action: () => setFeedback(null) }
          ];
        } else if (errorData?.error_code === 'INCOMPLETE_PROFILE') {
          enhancedMessage = 'Your resident profile is missing required information. Please update your profile.';
          errorType = 'validation';
          actions = [
            { label: 'Update Profile', action: () => navigate('/profile') },
            { label: 'Try Again Later', action: () => setFeedback(null) }
          ];
        } else {
          enhancedMessage = 'Please check all required fields and try again.';
          errorType = 'validation';
          actions = [
            { label: 'Try Again', action: () => setFeedback(null) },
            { label: 'Complete Profile', action: () => navigate('/profile') }
          ];
        }
      } else if (errorCode === 401) {
        enhancedMessage = 'Your session has expired. Please log in again.';
        errorType = 'auth';
        actions = [{ label: 'Login Again', action: () => navigate('/login') }];
      } else if (errorCode === 500) {
        enhancedMessage = 'Server error occurred. Please try again later or contact support.';
        errorType = 'server';
        actions = [
          { label: 'Try Again', action: () => setFeedback(null) },
          { label: 'Contact Support', action: () => window.open('mailto:support@barangay.gov.ph') }
        ];
      } else if (!navigator.onLine) {
        enhancedMessage = 'No internet connection. Please check your connection and try again.';
        errorType = 'network';
        actions = [{ label: 'Try Again', action: () => setFeedback(null) }];
      } else {
        actions = [
          { label: 'Try Again', action: () => setFeedback(null) },
          { label: 'Complete Profile', action: () => navigate('/profile') }
        ];
      }
      
      setFeedback({
        type: errorType,
        message: enhancedMessage,
        details: errorCode ? `Error Code: ${errorCode}` : 'Please ensure your profile is complete before requesting documents.',
        actions: actions
      });
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
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/30 to-blue-200/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-yellow-200/20 to-orange-200/20 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>
        
        <Sidebares />
        <main className="flex-1 ml-64 pt-36 px-6 pb-16 font-sans flex flex-col items-center relative z-10">
          <div className="w-full max-w-6xl mx-auto">
            {/* Enhanced Header with floating elements */}
            <div className="text-center space-y-6 mb-12 relative">
              {/* Floating decorative elements */}
              <div className="absolute -top-8 left-1/4 w-4 h-4 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full animate-bounce-slow opacity-60"></div>
              <div className="absolute -top-4 right-1/3 w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce-delayed opacity-60"></div>
              <div className="absolute top-2 left-1/3 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse opacity-60"></div>
              
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse-slow"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 transition-all duration-300">
                  <FaMagic className="w-8 h-8 text-white animate-pulse" />
                  <FaFileAlt className="w-10 h-10 text-white absolute" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight leading-tight">
                  Request Documents
                </h1>
                <div className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold text-gray-700">
                  <FaStar className="text-yellow-400 animate-pulse" />
                  <span className="bg-gradient-to-r from-gray-700 to-gray-600 bg-clip-text text-transparent">
                    Barangay Services
                  </span>
                  <FaStar className="text-yellow-400 animate-pulse" />
                </div>
                <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed font-medium">
                  Choose the document you need and we'll auto-fill your information from your profile.
                  <span className="text-emerald-600 font-semibold"> Fast, secure, and convenient!</span>
                </p>
              </div>
            </div>

            {/* Enhanced Document Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 justify-center mb-12">
              {documentOptions.map((doc, index) => (
                <div
                  key={index}
                  onClick={() => openModal(doc)}
                  className={`relative ${doc.bgPattern} border-2 border-white/50 rounded-3xl p-8 text-center shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 cursor-pointer group overflow-hidden backdrop-blur-sm`}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${doc.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-3xl`}></div>
                  
                  {/* Floating particles effect */}
                  <div className="absolute inset-0 overflow-hidden rounded-3xl">
                    <div className="absolute top-4 right-4 w-2 h-2 bg-white/40 rounded-full animate-float opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-white/30 rounded-full animate-float-delayed opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-1/2 left-4 w-1 h-1 bg-white/50 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="mb-6 relative">
                      {doc.icon}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full blur-xl"></div>
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-gray-900 transition-colors duration-300">
                      {doc.label}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                      {doc.description}
                    </p>
                    
                    {/* Hover indicator */}
                    <div className="mt-4 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <span className="text-sm font-semibold text-gray-700">Click to request</span>
                      <FaPaperPlane className="w-3 h-3 text-gray-600" />
                    </div>
                  </div>
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                </div>
              ))}
            </div>
            
            {/* Additional info section with refresh option */}
            <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FaCheckCircle className="text-emerald-500 text-xl" />
                <h3 className="text-lg font-bold text-gray-800">Quick & Easy Process</h3>
                <FaCheckCircle className="text-emerald-500 text-xl" />
              </div>
              <p className="text-gray-600 max-w-2xl mx-auto mb-4">
                All documents are processed efficiently with your pre-filled information.
                Track your request status and receive notifications when ready for pickup.
              </p>
              
              {/* Data freshness indicator and refresh option */}
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <FaInfoCircle className="text-blue-500" />
                  <span>Data last updated: {lastDataCheck.toLocaleTimeString()}</span>
                </div>
                <button
                  onClick={handleRefreshData}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-all duration-200 text-xs font-medium"
                >
                  <FaSpinner className="w-3 h-3" />
                  Refresh Profile
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Enhanced Modal for document request */}
      {showModal && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-2 sm:p-4 modal-fade-in">
          <div className="relative w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] flex flex-col animate-fadeIn">
            {/* Enhanced gradient border with animation */}
            <div className="absolute inset-0 rounded-3xl pointer-events-none z-0 animate-pulse-slow" style={{
              background: `linear-gradient(135deg, ${selectedDoc.gradient.replace('from-', '').replace('to-', '').replace('-400', '').replace('-500', '')})`,
              filter: 'blur(12px)',
              opacity: 0.25
            }} />
            
            {/* Modal Card with enhanced glassmorphism */}
            <div className="relative bg-white/80 backdrop-blur-3xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden z-10 flex flex-col max-h-full" style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2) inset',
            }}>
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-5 z-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L35 25L60 30L35 35L30 60L25 35L0 30L25 25L30 0Z' fill='%23${selectedDoc.gradient.includes('emerald') ? '10b981' : selectedDoc.gradient.includes('blue') ? '3b82f6' : selectedDoc.gradient.includes('purple') ? '8b5cf6' : 'f97316'}'/%3E%3C/svg%3E")`,
                animation: 'float 6s ease-in-out infinite',
              }} />
              
              {/* Enhanced Header with dynamic gradient */}
              <div className={`bg-gradient-to-r ${selectedDoc.gradient} rounded-t-3xl p-4 sm:p-6 flex items-center gap-2 sm:gap-4 relative z-10 flex-shrink-0 overflow-hidden`}>
                {/* Header background animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 -skew-x-12 transform -translate-x-full animate-shimmer"></div>
                
                <div className="bg-white/25 rounded-full p-2 sm:p-3 shadow-lg flex-shrink-0 backdrop-blur-sm border border-white/20">
                  <div className="relative">
                    {React.cloneElement(selectedDoc.icon, {
                      className: "w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-lg"
                    })}
                    <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-30"></div>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white mb-1 flex items-center gap-2 flex-wrap drop-shadow-lg">
                    <span className="truncate">Request {selectedDoc.label}</span>
                    <span className="px-3 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold border border-white/30 shadow-lg flex-shrink-0 backdrop-blur-sm">
                      {selectedDoc.label}
                    </span>
                  </h2>
                  <p className="text-white/90 text-xs sm:text-sm font-medium drop-shadow">
                    Fill out the form to request your document • Auto-filled from profile
                  </p>
                </div>
                
                <button
                  onClick={closeModal}
                  className="p-2 sm:p-2.5 rounded-full hover:bg-white/20 text-white text-xl sm:text-2xl transition-all duration-300 flex-shrink-0 backdrop-blur-sm border border-white/20 hover:border-white/40 hover:scale-110"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              
              {/* Scrollable Form Content */}
              <div className="flex-1 overflow-y-auto">
                <form id="document-request-form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8">
                {documentForms[selectedDoc.value]?.map(field => {
                  // Skip conditional fields if they don't match the selected purpose
                  if (field.conditional && formValues.purpose !== field.conditional) {
                    return null;
                  }

                  // Choose icon based on field
                  let Icon = FaUser;
                  if (field.name.toLowerCase().includes('date')) Icon = FaCalendarAlt;
                  if (field.name.toLowerCase().includes('address')) Icon = FaHome;
                  if (field.name.toLowerCase().includes('purpose')) Icon = FaIdCard;
                  if (field.name.toLowerCase().includes('business')) Icon = FaBusinessTime;
                  if (field.name.toLowerCase().includes('id')) Icon = FaIdBadge;
                  if (field.name.toLowerCase().includes('child')) Icon = FaUser;
                  if (field.name.toLowerCase().includes('registration')) Icon = FaFileAlt;

                  // Determine if field is required based on conditional logic
                  const isRequired = field.required || (field.conditional && formValues.purpose === field.conditional);

                  return (
                    <div key={field.name} className="space-y-2">
                      {/* Fixed label above field */}
                      <label className="block text-sm font-semibold text-gray-700">
                        {field.label}
                        {field.autoFill && <span className="text-emerald-600 text-xs ml-1 font-normal">(Auto-filled)</span>}
                        {isRequired && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {/* Purpose dropdown logic for non-certification documents */}
                      {field.name === 'purpose' && purposeOptions[selectedDoc.value] ? (
                        <>
                          <div className="relative">
                            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 text-base z-10" />
                            <select
                              name="purpose"
                              value={formValues.purpose || ''}
                              onChange={e => setFormValues(v => ({ ...v, purpose: e.target.value, otherPurpose: '' }))}
                              className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:border-emerald-300 bg-white text-base form-field-focus"
                              required
                            >
                              <option value="">Select purpose</option>
                              {purposeOptions[selectedDoc.value].map(opt => (
                                <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                              ))}
                            </select>
                          </div>
                          {(formValues.purpose === 'other' || formValues.purpose === 'other specific') && (
                            <input
                              type="text"
                              name="otherPurpose"
                              value={formValues.otherPurpose || ''}
                              onChange={e => setFormValues(v => ({ ...v, otherPurpose: e.target.value }))}
                              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 mt-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all duration-200 shadow-sm bg-white text-base form-field-focus"
                              placeholder="Please specify other purpose"
                              required
                            />
                          )}
                        </>
                      ) : field.type === 'select' ? (
                        <div className="relative">
                          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 text-base z-10" />
                          <select
                            name={field.name}
                            value={formValues[field.name] || ''}
                            onChange={e => setFormValues(v => ({ ...v, [field.name]: e.target.value }))}
                            className={`w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:border-emerald-300 text-base form-field-focus ${field.autoFill ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                            required={isRequired}
                            disabled={field.autoFill}
                          >
                            <option value="">Select {field.label}</option>
                            {field.options.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      ) : field.type === 'textarea' ? (
                        <div className="relative">
                          <Icon className="absolute left-3 top-4 text-emerald-500 text-base z-10" />
                          <textarea
                            name={field.name}
                            value={formValues[field.name] || ''}
                            onChange={e => setFormValues(v => ({ ...v, [field.name]: e.target.value }))}
                            className={`w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all duration-200 shadow-sm text-base form-field-focus ${field.autoFill ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                            required={isRequired}
                            rows={4}
                            disabled={field.autoFill}
                            placeholder={field.autoFill ? 'Auto-filled from your profile' : `Enter ${field.label.toLowerCase()}`}
                          />
                        </div>
                      ) : (
                        <div className="relative">
                          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 text-base z-10" />
                          <input
                            type={field.type}
                            name={field.name}
                            value={formValues[field.name] || ''}
                            onChange={e => setFormValues(v => ({ ...v, [field.name]: e.target.value }))}
                            className={`w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all duration-200 shadow-sm text-base form-field-focus ${field.autoFill ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                            required={isRequired}
                            disabled={field.autoFill}
                            placeholder={field.autoFill ? 'Auto-filled from your profile' : `Enter ${field.label.toLowerCase()}`}
                          />
                        </div>
                      )}
                </div>
                  );
                })}
                
                {/* Photo Upload Section - Only for Barangay Clearance */}
                {selectedDoc.value === 'Brgy Clearance' && (
                  <div className="space-y-4 border-t border-gray-200 pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FaImage className="text-emerald-500 text-lg" />
                      <h3 className="text-lg font-semibold text-gray-800">Your Photo</h3>
                      {residentData?.avatar ? (
                        <span className="text-sm text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">(Auto-filled from profile)</span>
                      ) : (
                        <span className="text-sm text-gray-500">(Upload required)</span>
                      )}
                    </div>
                    
                    {!photoPreview ? (
                      <div className="space-y-4">
                        {/* Camera Section */}
                        {showCamera && cameraStream ? (
                          <div className="bg-gray-100 rounded-xl p-4 text-center">
                            <video
                              id="camera-video"
                              autoPlay
                              playsInline
                              muted
                              className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                              ref={(video) => {
                                if (video && cameraStream) {
                                  video.srcObject = cameraStream;
                                }
                              }}
                            />
                            <div className="flex gap-3 justify-center mt-4">
                              <button
                                type="button"
                                onClick={capturePhoto}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                              >
                                <FaCamera className="w-4 h-4" />
                                Capture Photo
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (cameraStream) {
                                    cameraStream.getTracks().forEach(track => track.stop());
                                    setCameraStream(null);
                                  }
                                  setShowCamera(false);
                                }}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* File Upload */}
                            <div className="relative">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoSelect}
                                className="hidden"
                                id="photo-upload"
                              />
                              <label
                                htmlFor="photo-upload"
                                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-emerald-300 rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-200"
                              >
                                <FaUpload className="w-8 h-8 text-emerald-500 mb-2" />
                                <span className="text-sm font-medium text-gray-700">Upload Photo</span>
                                <span className="text-xs text-gray-500 mt-1">JPEG, PNG (Max 5MB)</span>
                              </label>
                            </div>
                            
                            {/* Camera Capture */}
                            <button
                              type="button"
                              onClick={startCamera}
                              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                            >
                              <FaCamera className="w-8 h-8 text-blue-500 mb-2" />
                              <span className="text-sm font-medium text-gray-700">Take Photo</span>
                              <span className="text-xs text-gray-500 mt-1">Use Camera</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-start gap-4">
                          <img
                            src={photoPreview}
                            alt="Selected photo"
                            className="w-24 h-24 object-cover rounded-lg shadow-md"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800 mb-1">
                              {selectedPhoto ? 'Photo Selected' : 'Profile Photo'}
                            </h4>
                            <p className="text-sm text-gray-600 mb-3">
                              {selectedPhoto ? (
                                <>
                                  {selectedPhoto.name}
                                  {selectedPhoto.size && ` (${(selectedPhoto.size / 1024 / 1024).toFixed(2)} MB)`}
                                </>
                              ) : (
                                'Using photo from your resident profile'
                              )}
                            </p>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={removePhoto}
                                className="flex items-center gap-2 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm transition-colors"
                              >
                                <FaTrash className="w-3 h-3" />
                                {selectedPhoto ? 'Remove Photo' : 'Remove Profile Photo'}
                              </button>
                              {!selectedPhoto && (
                                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1.5 rounded-lg">
                                  ✓ Auto-filled
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <FaInfoCircle className="text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium mb-1">Photo Information:</p>
                          <ul className="text-xs space-y-1 text-blue-700">
                            {residentData?.avatar ? (
                              <>
                                <li>• Your profile photo will be automatically used</li>
                                <li>• You can upload a different photo if needed</li>
                                <li>• Photo will be used for document verification</li>
                                <li>• Maximum file size: 5MB for new uploads</li>
                              </>
                            ) : (
                              <>
                                <li>• Use a clear, recent photo (passport-style preferred)</li>
                                <li>• Ensure good lighting and face is clearly visible</li>
                                <li>• Photo will be used for document verification</li>
                                <li>• Maximum file size: 5MB</li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {feedback && (
                  <div className={`rounded-xl p-4 border-2 transition-all duration-300 ${
                    feedback.type === 'success'
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800'
                      : feedback.type === 'loading'
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-800'
                      : feedback.type === 'validation'
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 text-yellow-800'
                      : feedback.type === 'auth'
                      ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-800'
                      : feedback.type === 'network'
                      ? 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 text-gray-800'
                      : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-800'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {feedback.type === 'success' && <FaCheckCircle className="w-5 h-5 text-green-600" />}
                        {feedback.type === 'loading' && <FaSpinner className="w-5 h-5 text-blue-600 animate-spin" />}
                        {feedback.type === 'validation' && <FaExclamationTriangle className="w-5 h-5 text-yellow-600" />}
                        {feedback.type === 'auth' && <FaInfoCircle className="w-5 h-5 text-purple-600" />}
                        {feedback.type === 'network' && <FaExclamationTriangle className="w-5 h-5 text-gray-600" />}
                        {(feedback.type === 'error' || feedback.type === 'server') && <FaTimes className="w-5 h-5 text-red-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-base mb-1">{feedback.message}</div>
                        {feedback.details && (
                          <div className="text-sm opacity-80 mb-2">{feedback.details}</div>
                        )}
                        {feedback.actions && feedback.actions.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {feedback.actions.map((action, index) => (
                              <button
                                key={index}
                                onClick={action.action}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                                  feedback.type === 'success'
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : feedback.type === 'auth'
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                                }`}
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Enhanced success animation */}
                {feedback?.type === 'success' && (
                  <div className="flex flex-col items-center mt-4 space-y-2">
                    <div className="relative">
                      <div className="animate-bounce">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                          <FaCheckCircle className="text-white text-2xl" />
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-ping opacity-30"></div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-700 font-semibold">Request Submitted!</div>
                      <div className="text-green-600 text-sm">Processing will begin shortly</div>
                    </div>
                  </div>
                )}
                </form>
              </div>
              
              {/* Fixed Footer with Action Buttons */}
              <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 p-4 sm:p-6 rounded-b-3xl flex-shrink-0 relative z-10">
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 transition-all duration-200 shadow font-medium text-sm sm:text-base order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="document-request-form"
                    disabled={loading || !residentData}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base order-1 sm:order-2"
                  >
                    <FaPaperPlane className="w-3 h-3 sm:w-4 sm:h-4" />
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RequestDocuments;
