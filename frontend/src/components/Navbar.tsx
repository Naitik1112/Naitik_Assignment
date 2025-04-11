import React , {useState,useEffect} from 'react';
import {  Link, useNavigate , useLocation } from 'react-router-dom';
import { Bone as Drone, MapPin, User, LogIn, LogOut, UserPlus } from 'lucide-react';
import { useAuth } from '../pages/AuthContext';
import axios from 'axios';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, loading } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Check authentication status on component mount and when location changes
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // This endpoint should verify the JWT cookie
        await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/getme`,
          { withCredentials: true ,
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        console.log(localStorage.getItem('token'))
        setIsLoggedIn(true);
      } catch (error) {
        setIsLoggedIn(false);
      }
    };

    checkAuthStatus();
  }, [location]);

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-gray-700' : '';
  };

  const handleLogout = async () => {
    const confirmed = window.confirm('Are you sure you want to log out?');
    if (!confirmed) return;

    try {
      await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/logout`,
        { withCredentials: true  ,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      console.log(localStorage.getItem('token'))
      setIsLoggedIn(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="animate-pulse bg-gray-700 h-8 w-32 rounded"></div>
            <div className="flex space-x-4">
              <div className="animate-pulse bg-gray-700 h-8 w-20 rounded"></div>
              <div className="animate-pulse bg-gray-700 h-8 w-20 rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Drone className="w-8 h-8 text-blue-500" />
            <span className="text-xl font-bold">DroneMission</span>
          </Link>
          
          <div className="flex space-x-4">
            {user ? (
              <>
                <Link
                  to="/missions"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 ${isActive('/missions')}`}
                >
                  <MapPin className="w-4 h-4" />
                  <span>Missions</span>
                </Link>
                
                <Link
                  to="/drones"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 ${isActive('/drones')}`}
                >
                  <Drone className="w-4 h-4" />
                  <span>Drones</span>
                </Link>
                
                <Link
                  to="/profile"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 ${isActive('/profile')}`}
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 ${isActive('/login')}`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>

                <Link
                  to="/signup"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 ${isActive('/signup')}`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;