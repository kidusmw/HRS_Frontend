import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyEmailThunk } from '@/features/auth/authSlice';
import type { AppDispatch, RootState } from '@/app/store';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, isVerified } = useSelector((state: RootState) => state.auth);
  
  const [hasAttempted, setHasAttempted] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'already_verified' | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  
  const url = searchParams.get('url');
  const success = searchParams.get('success');
  const errorParam = searchParams.get('error');

  useEffect(() => {
    // Handle direct redirects from backend (browser requests)
    if (success) {
      setVerificationStatus('success');
      if (success === 'verified') {
        setStatusMessage('Your email has been successfully verified. You can now log in to your account.');
      } else if (success === 'already_verified') {
        setVerificationStatus('already_verified');
        setStatusMessage('Your email was already verified. You can log in to your account.');
      }
      return;
    }

    if (errorParam) {
      setVerificationStatus('error');
      switch (errorParam) {
        case 'invalid_link':
          setStatusMessage('The verification link is invalid or has expired. Please request a new verification email.');
          break;
        case 'user_not_found':
          setStatusMessage('User account not found. Please register again.');
          break;
        case 'invalid_hash':
          setStatusMessage('Invalid verification link. Please request a new verification email.');
          break;
        default:
          setStatusMessage('Email verification failed. Please try again.');
      }
      return;
    }

    // Handle API verification (programmatic calls)
    if (url && !hasAttempted) {
      setHasAttempted(true);
      setVerificationStatus('loading');
      dispatch(verifyEmailThunk(url));
    }
  }, [url, success, errorParam, dispatch, hasAttempted]);

  // Update status based on Redux state for API calls
  useEffect(() => {
    if (hasAttempted && !success && !errorParam) {
      if (loading) {
        setVerificationStatus('loading');
      } else if (error) {
        setVerificationStatus('error');
        setStatusMessage(error);
      } else if (isVerified) {
        setVerificationStatus('success');
        setStatusMessage('Your email has been successfully verified. You can now log in to your account.');
      }
    }
  }, [loading, error, isVerified, hasAttempted, success, errorParam]);

  const handleRetry = () => {
    if (url) {
      dispatch(verifyEmailThunk(url));
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  // Show loading state
  if (verificationStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="flex flex-col items-center text-center">
            <Loader2 className="h-16 w-16 text-blue-500 animate-spin mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Email</h1>
            <p className="text-gray-600">
              Please wait while we verify your email address...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (verificationStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="flex flex-col items-center text-center">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
            <p className="text-gray-600 mb-6">
              {statusMessage}
            </p>
            <div className="flex gap-3 w-full">
              {url && (
                <Button variant="outline" onClick={handleRetry} className="flex-1">
                  Try Again
                </Button>
              )}
              <Button onClick={() => navigate('/login')} className="flex-1">
                Go to Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show success state
  if (verificationStatus === 'success' || verificationStatus === 'already_verified') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="flex flex-col items-center text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {verificationStatus === 'already_verified' ? 'Email Already Verified!' : 'Email Verified!'}
            </h1>
            <p className="text-gray-600 mb-6">
              {statusMessage}
            </p>
            <Button onClick={handleGoToLogin} className="w-full">
              Continue to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show invalid link state (no URL parameter and no success/error from redirect)
  if (!url && !success && !errorParam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="flex flex-col items-center text-center">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Verification Link</h1>
            <p className="text-gray-600 mb-6">
              The verification link is missing or invalid. Please check your email and try again.
            </p>
            <Button onClick={() => navigate('/register')} className="w-full">
              Back to Registration
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default VerifyEmailPage;
