import React, { useState, useEffect } from 'react';
import { Plus, Battery, Gauge, ArrowUp, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import type { Drone } from '../types';
import Modal from '../components/Modal';

function Drones() {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDrone, setSelectedDrone] = useState<Drone | null>(null);
  const [newDrone, setNewDrone] = useState({
    name: '',
    description: '',
    maxBattery: 0,
    maxSpeed: 0,
    maxAltitude: 0
  });

  // Fetch all drones
  useEffect(() => {
    const fetchDrones = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/drone/user`,
          { withCredentials: true ,
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        const formattedDrones = response.data.data.drones.map((drone: any) => ({
          id: drone._id,
          name: drone.name,
          model: drone.description || 'No description',
          status: drone.status || 'available',
          batteryLevel: Math.ceil(drone.maxBattery / 1000), // Random for demo, replace with actual data if available
          maxAltitude: drone.maxAltitude,
          maxSpeed: drone.maxSpeed,
          maxBattery: drone.maxBattery,
          image: drone.photo ? `/img/${drone.photo}` : 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80'
        }));

        setDrones(formattedDrones);
      } catch (error) {
        console.error('Error fetching drones:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrones();
  }, []);

  // Handle add drone
  const handleAddDrone = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/drone/user`,
        newDrone,
        { withCredentials: true ,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      alert("Drone added successfully!");
      window.location.reload();

    } catch (error) {
      console.error('Error adding drone:', error);
    }
  };

  // Handle edit drone
  const handleEditDrone = async () => {
    if (!selectedDrone) return;

    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/drone/${selectedDrone.id}`,
        {
          name: selectedDrone.name,
          description: selectedDrone.model,
          maxBattery: selectedDrone.maxBattery,
          maxSpeed: selectedDrone.maxSpeed,
          maxAltitude: selectedDrone.maxAltitude
        },
        { withCredentials: true ,
          headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }}
      );

      setDrones(drones.map(d => d.id === selectedDrone.id ? selectedDrone : d));
      setIsEditModalOpen(false);
      alert("Drone Details updated successfully!");
      window.location.reload();
    } catch (error) {
      console.error('Error updating drone:', error);
    }
  };

  // Handle delete drone
  const handleDeleteDrone = async (droneId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this drone?');
    if (!confirmed) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/drone/${droneId}`,
        { withCredentials: true ,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setDrones(drones.filter(d => d.id !== droneId));
    } catch (error) {
      console.error('Error deleting drone:', error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Drone Fleet</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Add Drone</span>
        </button>
      </div>

      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {drones.map((drone) => (
          <div key={drone.id} className="bg-gray-800 rounded-lg overflow-hidden transition-all hover:shadow-lg hover:shadow-blue-500/40">
            {/* <img
              src={drone.image}
              alt={drone.name}
              className="w-full h-48 object-cover"
            /> */}
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{drone.name}</h3>
                  <p className="text-gray-400 text-sm">{drone.model}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  drone.status === 'available' ? 'bg-green-500/20 text-green-400' :
                  drone.status === 'in-mission' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {drone.status.charAt(0).toUpperCase() + drone.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex flex-col items-center p-2 bg-gray-700 rounded-lg">
                  <Battery className="w-4 h-4 text-blue-400 mb-1" />
                  <span className="text-gray-400">Max Distance</span>
                  <span className="font-medium">{drone.batteryLevel}km</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-gray-700 rounded-lg">
                  <ArrowUp className="w-4 h-4 text-green-400 mb-1" />
                  <span className="text-gray-400">Max Alt</span>
                  <span className="font-medium">{drone.maxAltitude}m</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-gray-700 rounded-lg">
                  <Gauge className="w-4 h-4 text-purple-400 mb-1" />
                  <span className="text-gray-400">Speed</span>
                  <span className="font-medium">{drone.maxSpeed}km/h</span>
                </div>
              </div>

              <div className="flex space-x-2 pt-4 border-t border-gray-700">
                <button
                  onClick={() => {
                    setSelectedDrone(drone);
                    setIsEditModalOpen(true);
                  }}
                  className="flex-1 flex items-center justify-center space-x-1 bg-blue-600 hover:bg-blue-700 p-2 rounded-md"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteDrone(drone.id)}
                  className="flex items-center justify-center bg-red-600/20 hover:bg-red-600/30 text-red-500 p-2 rounded-md w-10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Drone Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Drone"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Drone Name</label>
            <input
              type="text"
              value={newDrone.name}
              onChange={(e) => setNewDrone({...newDrone, name: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4"
              placeholder="Enter drone name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <input
              type="text"
              value={newDrone.description}
              onChange={(e) => setNewDrone({...newDrone, description: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4"
              placeholder="Enter description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Max Distance at Full Charge (meters)</label>
            <input
              type="number"
              value={newDrone.maxBattery}
              onChange={(e) => setNewDrone({...newDrone, maxBattery: parseInt(e.target.value) || 0})}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Max Speed (km/h)</label>
            <input
              type="number"
              value={newDrone.maxSpeed}
              onChange={(e) => setNewDrone({...newDrone, maxSpeed: parseInt(e.target.value) || 0})}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Max Altitude (m)</label>
            <input
              type="number"
              value={newDrone.maxAltitude}
              onChange={(e) => setNewDrone({...newDrone, maxAltitude: parseInt(e.target.value) || 0})}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4"
            />
          </div>
          <button
            onClick={handleAddDrone}
            className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg mt-4"
          >
            Add Drone
          </button>
        </div>
      </Modal>

      {/* Edit Drone Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Drone"
      >
        {selectedDrone && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Drone Name</label>
              <input
                type="text"
                value={selectedDrone.name}
                onChange={(e) => setSelectedDrone({...selectedDrone, name: e.target.value})}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <input
                type="text"
                value={selectedDrone.model}
                onChange={(e) => setSelectedDrone({...selectedDrone, model: e.target.value})}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Distance at Full Charge (meters)</label>
              <input
                type="number"
                value={selectedDrone.maxBattery}
                onChange={(e) => setSelectedDrone({...selectedDrone, maxBattery: parseInt(e.target.value) || 0})}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Speed (km/h)</label>
              <input
                type="number"
                value={selectedDrone.maxSpeed}
                onChange={(e) => setSelectedDrone({...selectedDrone, maxSpeed: parseInt(e.target.value) || 0})}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Altitude (m)</label>
              <input
                type="number"
                value={selectedDrone.maxAltitude}
                onChange={(e) => setSelectedDrone({...selectedDrone, maxAltitude: parseInt(e.target.value) || 0})}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4"
              />
            </div>
            <button
              onClick={handleEditDrone}
              className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg mt-4"
            >
              Save Changes
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Drones;