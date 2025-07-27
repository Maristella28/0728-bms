import { useState, useEffect } from 'react';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });

  const [verificationForm, setVerificationForm] = useState({
    verificationCode: '',
  });

  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [registeredUserId, setRegisteredUserId] = useState(null);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds timer
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleVerificationChange = (e) => {
    const { name, value } = e.target;
    setVerificationForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Registering...');
    setError('');
    setIsSuccess(false);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      setStatus('');
      setIsSuccess(false);
      return;
    }

    if (!form.termsAccepted) {
      setError("You must accept the terms and conditions.");
      setStatus('');
      setIsSuccess(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.requires_verification) {
        setRegisteredUserId(data.user_id);
        setRegisteredEmail(data.email);
        setStatus('Registration initiated! Please check your email for the verification code.');
        setError('');
        setShowVerificationForm(true);
        setTimeLeft(60);
        setIsTimerRunning(true);
        setIsSuccess(true);
      } else {
        setError(data.message || 'Registration failed.');
        setStatus('');
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Network or server error.');
      setStatus('');
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setStatus('Verifying code...');
    setError('');
    setIsSuccess(false);

    try {
      const res = await fetch('http://localhost:8000/api/verify-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          user_id: registeredUserId,
          verification_code: verificationForm.verificationCode,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setStatus('Registration completed successfully!');
        setError('');
        setIsSuccess(true);
        window.location.href = '/login';
      } else {
        if (data.code_expired) {
          setError('Verification code has expired. Please request a new one.');
          setIsTimerRunning(false);
        } else {
          setError(data.message || 'Verification failed.');
        }
        setStatus('');
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Network or server error.');
      setStatus('');
    }
  };

  const handleResendCode = async () => {
    setStatus('Sending new verification code...');
    setError('');
    setIsSuccess(false);

    try {
      const res = await fetch('http://localhost:8000/api/resend-verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          user_id: registeredUserId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('New verification code sent successfully! Please check your inbox.');
        setError('');
        setTimeLeft(60);
        setIsTimerRunning(true);
        setVerificationForm({ verificationCode: '' });
        setIsSuccess(true);
      } else {
        setError(data.message || 'Failed to resend verification code.');
        setStatus('');
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Network or server error.');
      setStatus('');
    }
  };

  const handleBackToRegistration = () => {
    setShowVerificationForm(false);
    setRegisteredUserId(null);
    setRegisteredEmail('');
    setTimeLeft(60);
    setIsTimerRunning(false);
    setVerificationForm({ verificationCode: '' });
    setStatus('');
    setError('');
    setIsSuccess(false);
  };

  if (showVerificationForm) {
    return (
      <div className="relative bg-gradient-to-br from-blue-100 via-white to-green-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <svg className="w-full h-full opacity-25" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#60A5FA', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#34D399', stopOpacity: 1 }} />
              </linearGradient>
              <filter id="blur">
                <feGaussianBlur stdDeviation="50" />
              </filter>
            </defs>
            <circle cx="200" cy="150" r="100" fill="url(#grad1)" filter="url(#blur)">
              <animate attributeName="cy" values="150;450;150" dur="20s" repeatCount="indefinite" />
            </circle>
            <circle cx="600" cy="300" r="120" fill="url(#grad1)" filter="url(#blur)">
              <animate attributeName="cy" values="300;100;300" dur="25s" repeatCount="indefinite" />
            </circle>
            <circle cx="400" cy="500" r="80" fill="url(#grad1)" filter="url(#blur)">
              <animate attributeName="cy" values="500;200;500" dur="18s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>

        <section className="min-h-screen flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md bg-white/60 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 space-y-6 ring-1 ring-gray-300 dark:ring-gray-600">
            <div className="flex flex-col items-center space-y-3">
              <img className="w-20 h-20 rounded-full shadow-lg" src="/assets/images/logo.jpg" alt="logo" />
              <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white text-center leading-tight tracking-wide">
                Verify Your Email
              </h1>
              <p className="text-base text-gray-600 dark:text-gray-300 text-center font-medium">
                Enter Verification Code
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-700 dark:text-gray-300">
                  We've sent a 3-digit verification code to <strong>{registeredEmail}</strong>
                </p>
              </div>

              {/* Timer Display */}
              <div className="text-center">
                <div className={`text-lg font-bold ${timeLeft <= 10 ? 'text-red-600' : 'text-blue-600'}`}>
                  {formatTime(timeLeft)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {timeLeft > 0 ? 'Time remaining' : 'Code expired'}
                </p>
              </div>

              <form onSubmit={handleVerificationSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    name="verificationCode"
                    value={verificationForm.verificationCode}
                    onChange={handleVerificationChange}
                    maxLength="3"
                    pattern="[0-9]{3}"
                    required
                    className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="000"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter the 3-digit code from your email</p>
                </div>

                <button
                  type="submit"
                  disabled={timeLeft === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2.5 rounded-lg shadow-md transition duration-150 ease-in-out"
                >
                  Verify & Complete Registration
                </button>
              </form>

              <div className="space-y-3">
                {timeLeft === 0 && (
                  <button
                    onClick={handleResendCode}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg shadow-md transition duration-150 ease-in-out"
                  >
                    Resend Verification Code
                  </button>
                )}

                <button
                  onClick={handleBackToRegistration}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2.5 rounded-lg shadow-md transition duration-150 ease-in-out"
                >
                  Back to Registration
                </button>
              </div>

              {status && <p className={`text-sm text-center ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>{status}</p>}
              {error && <p className="text-red-600 text-sm text-center">{error}</p>}
            </div>

            <div className="text-center pt-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?
                <a href="/login" className="font-semibold text-blue-600 hover:underline dark:text-blue-400"> Login here</a>
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-br from-blue-100 via-white to-green-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <svg className="w-full h-full opacity-25" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#60A5FA', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#34D399', stopOpacity: 1 }} />
            </linearGradient>
            <filter id="blur">
              <feGaussianBlur stdDeviation="50" />
            </filter>
          </defs>
          <circle cx="200" cy="150" r="100" fill="url(#grad1)" filter="url(#blur)">
            <animate attributeName="cy" values="150;450;150" dur="20s" repeatCount="indefinite" />
          </circle>
          <circle cx="600" cy="300" r="120" fill="url(#grad1)" filter="url(#blur)">
            <animate attributeName="cy" values="300;100;300" dur="25s" repeatCount="indefinite" />
          </circle>
          <circle cx="400" cy="500" r="80" fill="url(#grad1)" filter="url(#blur)">
            <animate attributeName="cy" values="500;200;500" dur="18s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>

      <section className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white/60 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 space-y-6 ring-1 ring-gray-300 dark:ring-gray-600">
          <div className="flex flex-col items-center space-y-3">
            <img className="w-20 h-20 rounded-full shadow-lg" src="/assets/images/logo.jpg" alt="logo" />
            <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white text-center leading-tight tracking-wide">
              Barangay e-Governance
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-300 text-center font-medium">
              Resident's Registration Portal
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                id="terms"
                type="checkbox"
                name="termsAccepted"
                checked={form.termsAccepted}
                onChange={handleChange}
                className="w-5 h-5 rounded border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="terms" className="text-sm font-light text-gray-600 dark:text-gray-300">
                I accept the
                <a href="#" className="font-medium text-blue-600 hover:underline dark:text-blue-400"> Terms and Conditions</a>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-green-500 hover:to-blue-500 text-white font-semibold py-2.5 rounded-lg shadow-md transition duration-150 ease-in-out"
            >
              Create an Account
            </button>

            {status && <p className={`text-sm text-center ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>{status}</p>}
            {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          </form>

          <div className="text-center pt-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?
              <a href="/login" className="font-semibold text-blue-600 hover:underline dark:text-blue-400"> Login here</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
