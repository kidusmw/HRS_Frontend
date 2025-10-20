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
  const url = searchParams.get('url');

  useEffect(() => {
    if (url && !hasAttempted) {
      setHasAttempted(true);
      dispatch(verifyEmailThunk(url));
    }
  }, [url, dispatch, hasAttempted]);

  const handleRetry = () => {
    if (url) {
      dispatch(verifyEmailThunk(url));
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  if (!url) {
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

  if (loading) {
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="flex flex-col items-center text-center">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
            <p className="text-gray-600 mb-6">
              {error}
            </p>
            <div className="flex gap-3 w-full">
              <Button variant="outline" onClick={handleRetry} className="flex-1">
                Try Again
              </Button>
              <Button onClick={() => navigate('/login')} className="flex-1">
                Go to Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="flex flex-col items-center text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
            <p className="text-gray-600 mb-6">
              Your email has been successfully verified. You can now log in to your account.
            </p>
            <Button onClick={handleGoToLogin} className="w-full">
              Continue to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default VerifyEmailPage;
