import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';

const NotLoggedIn = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-md text-center bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Access Restricted</h1>
        <p className="mb-6">You must be logged in to access this page.</p>
        <Link
          to="/login"
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
        >
          <LogIn className="w-5 h-5 mr-2" />
          Login
        </Link>
      </div>
    </div>
  );
};

export default NotLoggedIn;