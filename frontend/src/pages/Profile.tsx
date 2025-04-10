import React, { useState, useEffect } from 'react';
import { Settings, Mail, MapPin } from 'lucide-react';
import axios from 'axios';
import Modal from '../components/Modal';
import type { User } from '../types';

function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [totalMissions, setTotalMissions] = useState(0);
  const [totalDrones, setTotalDrones] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: ''
  });

  // Fetch user data and stats
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Fetch user details
        const userResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/getme`,
          { withCredentials: true }
        );
        
        // Extract user data from nested response
        const userData = userResponse.data.data.data;
        setUser(userData);

        // Set edit form with initial values
        if (userData) {
          setEditForm({
            name: userData.name,
            email: userData.email
          });
        }

        // Fetch missions count
        const missionsResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/mission/user`,
          { withCredentials: true }
        );
        setTotalMissions(missionsResponse.data.data.missions.length);

        // Fetch drones count
        const dronesResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/drone/user`,
          { withCredentials: true }
        );
        setTotalDrones(dronesResponse.data.data.drones.length);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  // Format date to "Month Year"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/updateMe`,
        editForm,
        { withCredentials: true }
      );

      // Update user data from nested response
      // setUser(response.data.data.data.user);
      alert("Profile Updated successfully!");
      window.location.reload();

    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8 text-center">
          Loading profile...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8 text-center">
          Failed to load profile data
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            <img
              src={user.photo ? `/img/${user.photo}` : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&facepad=2&w=256&h=256&q=80'}
              alt={user.name}
              className="w-24 h-24 rounded-full border-4 border-blue-500"
            />
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <div className="flex items-center space-x-2 text-gray-400 mt-2">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400 mt-1">
                <MapPin className="w-4 h-4" />
                <span>{user.role === 'user' ? 'Drone Pilot' : user.role}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md"
          >
            <Settings className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6 mt-8">
          <div className="bg-gray-700 p-6 rounded-lg">
            <h3 className="text-lg font-semibold">Total Missions</h3>
            <p className="text-3xl font-bold text-blue-500 mt-2">{totalMissions}</p>
          </div>
          <div className="bg-gray-700 p-6 rounded-lg">
            <h3 className="text-lg font-semibold">Drones</h3>
            <p className="text-3xl font-bold text-green-500 mt-2">{totalDrones}</p>
          </div>
          <div className="bg-gray-700 p-6 rounded-lg">
            <h3 className="text-lg font-semibold">Member Since</h3>
            <p className="text-3xl font-bold text-purple-500 mt-2">{formatDate(user.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({...editForm, email: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4"
            />
          </div>
          <button
            onClick={handleUpdateProfile}
            className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg mt-4"
          >
            Save Changes
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default Profile;