// src/pages/TokenHandler.tsx
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function TokenHandler() {
  const { token } = useParams();
  const navigate = useNavigate();
  console.log(token)
  useEffect(() => {
    if (token) {
      // Store the token in localStorage
      localStorage.setItem('token', token);
      
      // Redirect to home page
      navigate('/');
    } else {
      // If no token, redirect to login
      navigate('/login');
    }
  }, [token, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p>Processing your authentication...</p>
      </div>
    </div>
  );
}

export default TokenHandler;