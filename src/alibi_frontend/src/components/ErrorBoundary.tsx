import { useEffect, useState } from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

const ErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string>('An unexpected error occurred');

  useEffect(() => {
    // Parse the error and set an appropriate message
    if (isRouteErrorResponse(error)) {
      if (error.status === 404) {
        setErrorMessage('Page not found');
      } else if (error.status === 500) {
        setErrorMessage('Server error');
      } else {
        setErrorMessage(`${error.statusText || 'Unknown error'}`);
      }
    } else if (error instanceof Error) {
      setErrorMessage(error.message);
    }
    
    // Log the error for debugging
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#0F0F1A] to-[#1A1A2C] text-[#E0E0FF] p-4">
      <div className="flex flex-col items-center max-w-lg text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-6" />
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="mb-8 text-neutral-300">{errorMessage}</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 transition-colors rounded-md"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </button>
      </div>
    </div>
  );
};

export default ErrorBoundary; 