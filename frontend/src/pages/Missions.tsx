import React, { useState, useEffect, useRef } from 'react';
import { Plus, Play, Edit, Trash2, MapPin, Search } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from "axios";
import type { Mission, Drone, SimulationResult, Waypoint } from '../types';
import Modal from '../components/Modal';
import { List as WaypointsIcon, Ruler as RulerIcon } from 'lucide-react';

mapboxgl.accessToken = 'pk.eyJ1IjoibmFpdGlrLXNoYWgiLCJhIjoiY200anBmM255MGZicDJqc2R3bndxaGp2cSJ9.i_g0WNG_11SJagZAIWzYNQ';

function Missions() {
  const [missions, setMissions] = useState<Mission[]>([]);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/mission/user/`, {
          method: "GET",
          credentials: "include", // 🟢 This is KEY!
        });
        const data = await res.json();

        if (data.status === "success") {
          const transformed = data.data.missions.map((mission: any) => ({
            id: mission._id,
            name: mission.name,
            title: mission.title,
            waypoints: mission.waypoints.map((wp: any, index: number) => ({
              id: wp._id,
              latitude: wp.latitude,
              longitude: wp.longitude,
              altitude: wp.altitude,
              order: index + 1,
            })),
            // Optional properties if available
            status: mission.status || "planned",
            estimatedDuration: mission.estimatedDuration || undefined,
            batteryUsage: mission.batteryUsage || undefined,
            createdAt: mission.createdAt || undefined,
            droneId: mission.droneId || undefined,
            total_distance : mission.total_distance ? Math.ceil(mission.total_distance) : undefined,
          }));

          setMissions(transformed);
        }
      } catch (err) {
        console.error("Error fetching missions:", err);
      }
    };

    fetchMissions();
  }, []);

  const [drones, setDrones] = useState<Drone[]>([]);

  useEffect(() => {
    const fetchDrones = async () => {
      try {

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/drone/user`, {
          method: "GET",
          credentials: "include", 
        });
        const res = await response.json();
        console.log(res)

        const rawDrones = res.data.drones;

        const formattedDrones = rawDrones.map((drone: any): Drone => ({
          id: drone._id,
          name: drone.name,
          image: `/img/${drone.photo}`, // update this if your image path differs
          batteryRuntime: drone.maxBattery, // or however you want to convert
          maxSpeed: drone.maxSpeed,
          maxAltitude: drone.maxAltitude,
          status: "available", // or map based on some backend field if available
        }));

        setDrones(formattedDrones);
      } catch (err) {
        console.error("Failed to fetch drones", err);
      }
    };

    fetchDrones();
  }, []);

  const handleEditMission = async (mission) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/mission/${mission.id}`, {
          withCredentials: true, // 🟢 This is KEY!
        }
      );
      
      const missionData = response.data.data.data;
      setSelectedMission(missionData);
      console.log("mission data")
      console.log(missionData)
      // Pre-fill the form with mission data
      setNewMission({
        name: missionData.name,
        title: missionData.title,
        numWaypoints: missionData.waypoints.length,
        waypoints: missionData.waypoints,
      });
  
      setIsEditMissionModalOpen(true);
    } catch (error) {
      console.error("Error fetching mission data:", error);
      alert("Failed to fetch mission data.");
    }
  };

  // Modal states
  const [isNewMissionModalOpen, setIsNewMissionModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isEditMissionModalOpen, setIsEditMissionModalOpen] = useState(false);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [selectedDrone, setSelectedDrone] = useState<string>('');
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');

  // New mission form state
  const [newMission, setNewMission] = useState({
    name: '',
    title: '',
    numWaypoints: 1,
    waypoints: [] as Waypoint[]
  });


  // Map refs
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const geocoder = useRef<any>(null);

  useEffect(() => {
    if (isMapModalOpen && mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-74.0060, 40.7128],
        zoom: 12
      });

      map.current.on('click', (e) => {
        const waypoints = [...newMission.waypoints];
        waypoints[currentWaypointIndex] = {
          id: `w${Date.now()}`,
          latitude: e.lngLat.lat,
          longitude: e.lngLat.lng,
          altitude: waypoints[currentWaypointIndex]?.altitude || 100,
          order: currentWaypointIndex + 1
        };
        setNewMission(prev => ({ ...prev, waypoints }));
        setIsMapModalOpen(false);
      });
    }
  }, [isMapModalOpen]);

  const handleSearch = async () => {
    if (!searchQuery) return;
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        map.current?.flyTo({
          center: [lng, lat],
          zoom: 14
        });
      }
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  const handleSimulate = (mission: Mission) => {
    setSelectedMission(mission);
    setIsSimulateModalOpen(true);
  };

  const runSimulation = async () => {
    if (!selectedDrone || !selectedMission) return;
    console.log(`${import.meta.env.VITE_BACKEND_URL}/api/v1/mission/${selectedMission.id}/${selectedDrone}`)
    console.log(`${selectedMission.id} , ${selectedDrone}`)
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/mission/${selectedMission.id}/${selectedDrone}`,
        { withCredentials: true }
      );
  
      const data = response.data;
      
      if (data.status === "success") {
        setSimulationResult({
          canComplete: data.canComplete,
          timeTaken: data.timeMinutes,
          batteryUsed: data.batteryUsed,
          totalDistance: data.totalDistanceMeters
        });
      } else {
        setSimulationResult({
          canComplete: false,
          reason: data.reason,
          timeTaken: 0,
          batteryUsed: 0,
          totalDistance: 0
        });
      }
    } catch (error) {
      console.error("Error running simulation:", error);
      alert("Failed to run simulation.");
    }
  };

  const calculateTotalDistance = (waypoints: Waypoint[]) => {
    let total = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const start = waypoints[i];
      const end = waypoints[i + 1];
      total += Math.sqrt(
        Math.pow(end.latitude - start.latitude, 2) +
        Math.pow(end.longitude - start.longitude, 2) +
        Math.pow(end.altitude - start.altitude, 2)
      );
    }
    return total;
  };

  const initializeWaypoints = (count: number) => {
    const waypoints = Array(count).fill(null).map((_, index) => ({
      id: `w${Date.now()}-${index}`,
      latitude: 0,
      longitude: 0,
      altitude: 100,
      order: index + 1
    }));
    setNewMission(prev => ({ ...prev, waypoints }));
  };

  const handleCreateMission = async () => {
    try {
      const payload = {
        name: newMission.name,
        title: newMission.title,
        waypoints: newMission.waypoints.map((wp) => ({
          latitude: wp.latitude,
          longitude: wp.longitude,
          altitude: wp.altitude,
        })),
      };
  
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/mission/user/`,
        payload,
        { withCredentials: true } // to send JWT cookie
      );
  
      console.log("Mission created:", response.data);
      alert("Mission created successfully!");
      
      // Reload the page after success
      window.location.reload();
      setIsNewMissionModalOpen(false); // Close the modal on success
    } catch (error) {
      console.error("Error creating mission:", error);
      
      // Show specific error message in the alert box
      if (error.response && error.response.data) {
        alert(`Error: ${error.response.data.message || 'Something went wrong!'}`);
      } else {
        alert('An unknown error occurred.');
      }
  
      // Form details are not removed; ensure the modal or form stays open for retry
    }
  };

  const handleUpdateMission = async (event) => {
    event.preventDefault();
  
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/mission/${selectedMission._id}`,
        newMission,
        { withCredentials: true }
      );
      alert("Mission updated successfully!");
      setIsEditMissionModalOpen(false); // Close the modal after submission
      window.location.reload(); // Reload the page to reflect the changes
    } catch (error) {
      console.error("Error updating mission:", error);
      alert("Failed to update mission.");
    }
  };

  const handleDeleteMission = async (missionId: string) => {
    // Show confirmation dialog
    const confirmed = window.confirm("Are you sure you want to delete this mission? This action cannot be undone.");
    
    if (!confirmed) return;
  
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/mission/${missionId}`,
        { withCredentials: true }
      );
      alert("Mission deleted successfully!");
      setMissions(prev => prev.filter(mission => mission.id !== missionId));
      
    } catch (error) {
      console.error("Error deleting mission:", error);
      alert("Failed to delete mission.");
    }
  };
  

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Drone Missions</h1>
        <button
          onClick={() => setIsNewMissionModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          <span>New Mission</span>
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {missions.map((mission) => (
          <div key={mission.id} className="bg-gray-800 rounded-lg p-6 space-y-4 transition-all hover:shadow-lg hover:shadow-blue-500/40">
          {/* Header with mission name and status */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" />
                {mission.name}
              </h3>
              <p className="text-gray-400 text-sm mt-1">{mission.title}</p>
            </div>
          </div>
        
          {/* Waypoints section */}
          <div className="space-y-3">
            <div className="flex items-center text-gray-300">
              <WaypointsIcon className="w-4 h-4 mr-2" /> {/* You can use a custom icon */}
              <span className="font-medium">{mission.waypoints.length} Waypoints</span>
              <span className="mx-2">•</span>
              <RulerIcon className="w-4 h-4 mr-2" /> {/* Another custom icon */}
              <span className="font-medium">Distance : {Math.round(mission.total_distance || 0)} meters</span>
            </div>
        
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {mission.waypoints.map((point, index) => (
                <div key={point.id} className="flex items-start text-sm bg-gray-700/50 p-2 rounded">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                    {index + 1}
                  </span>
                  <div>
                    <div className="flex flex-wrap gap-x-2">
                      <span className="text-gray-300">Lat: {point.latitude.toFixed(4)}</span>
                      <span className="text-gray-300">Lng: {point.longitude.toFixed(4)}</span>
                    </div>
                    <div className="text-gray-400">Alt: {point.altitude}m</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-700">
            <button
              onClick={() => handleSimulate(mission)}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-md transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>Simulate</span>
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleEditMission(mission)}
                className="flex-1 flex items-center justify-center gap-1 bg-gray-700 hover:bg-gray-600 py-2 px-3 rounded-md transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              
              <button 
                onClick={() => handleDeleteMission(mission.id)}
                className="flex-1 flex items-center justify-center gap-1 bg-red-600/20 hover:bg-red-600/30 text-red-500 py-2 px-3 rounded-md transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="sm:hidden">Delete</span>
              </button>
            </div>
          </div>
        </div>
        ))}
      </div>
      <Modal
        isOpen={isEditMissionModalOpen}
        onClose={() => setIsEditMissionModalOpen(false)}
        title="Edit Mission"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Mission Name</label>
            <input
              type="text"
              value={newMission.name}
              onChange={(e) => setNewMission(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4"
              placeholder="Enter mission name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Mission Title</label>
            <input
              type="text"
              value={newMission.title}
              onChange={(e) => setNewMission(prev => ({ ...prev, title: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4"
              placeholder="Enter mission title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Number of Waypoints</label>
            <input
              type="number"
              min="1"
              value={newMission.numWaypoints}
              onChange={(e) => {
                const count = Math.max(1, parseInt(e.target.value));
                setNewMission(prev => ({ ...prev, numWaypoints: count }));
                initializeWaypoints(count); // Adjust waypoints count
              }}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4"
            />
          </div>

          {newMission.waypoints.map((waypoint, index) => (
            <div key={waypoint.id} className="space-y-4 p-4 bg-gray-700 rounded-lg">
              <h4 className="font-medium">Waypoint {index + 1}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Latitude</label>
                  <input
                    type="number"
                    value={waypoint.latitude || ''}
                    onChange={(e) => {
                      const waypoints = [...newMission.waypoints];
                      waypoints[index].latitude = parseFloat(e.target.value);
                      setNewMission(prev => ({ ...prev, waypoints }));
                    }}
                    className="w-full bg-gray-600 border border-gray-500 rounded-lg py-2 px-4"
                    step="0.0001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Longitude</label>
                  <input
                    type="number"
                    value={waypoint.longitude || ''}
                    onChange={(e) => {
                      const waypoints = [...newMission.waypoints];
                      waypoints[index].longitude = parseFloat(e.target.value);
                      setNewMission(prev => ({ ...prev, waypoints }));
                    }}
                    className="w-full bg-gray-600 border border-gray-500 rounded-lg py-2 px-4"
                    step="0.0001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Altitude (m)</label>
                  <input
                    type="number"
                    value={waypoint.altitude}
                    onChange={(e) => {
                      const waypoints = [...newMission.waypoints];
                      waypoints[index].altitude = parseInt(e.target.value);
                      setNewMission(prev => ({ ...prev, waypoints }));
                    }}
                    className="w-full bg-gray-600 border border-gray-500 rounded-lg py-2 px-4"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setCurrentWaypointIndex(index);
                      setIsMapModalOpen(true);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-lg"
                  >
                    Select from Map
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="space-x-4">
            <button
              onClick={handleUpdateMission}
              className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg mt-6"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setIsEditMissionModalOpen(false)}
              className="w-full bg-gray-600 hover:bg-gray-700 py-2 rounded-lg mt-2"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      

      {/* New Mission Modal */}
      <Modal
        isOpen={isNewMissionModalOpen}
        onClose={() => setIsNewMissionModalOpen(false)}
        title="Create New Mission"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Mission Name</label>
            <input
              type="text"
              value={newMission.name}
              onChange={(e) => setNewMission(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4"
              placeholder="Enter mission name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Mission Title</label>
            <input
              type="text"
              value={newMission.title}
              onChange={(e) => setNewMission(prev => ({ ...prev, title: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4"
              placeholder="Enter mission title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Number of Waypoints</label>
            <input
              type="number"
              min="1"
              value={newMission.numWaypoints}
              onChange={(e) => {
                const count = Math.max(1, parseInt(e.target.value));
                setNewMission(prev => ({ ...prev, numWaypoints: count }));
                initializeWaypoints(count);
              }}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4"
            />
          </div>

          {newMission.waypoints.map((waypoint, index) => (
            <div key={waypoint.id} className="space-y-4 p-4 bg-gray-700 rounded-lg">
              <h4 className="font-medium">Waypoint {index + 1}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Latitude</label>
                  <input
                    type="number"
                    value={waypoint.latitude || ''}
                    onChange={(e) => {
                      const waypoints = [...newMission.waypoints];
                      waypoints[index].latitude = parseFloat(e.target.value);
                      setNewMission(prev => ({ ...prev, waypoints }));
                    }}
                    className="w-full bg-gray-600 border border-gray-500 rounded-lg py-2 px-4"
                    step="0.0001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Longitude</label>
                  <input
                    type="number"
                    value={waypoint.longitude || ''}
                    onChange={(e) => {
                      const waypoints = [...newMission.waypoints];
                      waypoints[index].longitude = parseFloat(e.target.value);
                      setNewMission(prev => ({ ...prev, waypoints }));
                    }}
                    className="w-full bg-gray-600 border border-gray-500 rounded-lg py-2 px-4"
                    step="0.0001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Altitude (m)</label>
                  <input
                    type="number"
                    value={waypoint.altitude}
                    onChange={(e) => {
                      const waypoints = [...newMission.waypoints];
                      waypoints[index].altitude = parseInt(e.target.value);
                      setNewMission(prev => ({ ...prev, waypoints }));
                    }}
                    className="w-full bg-gray-600 border border-gray-500 rounded-lg py-2 px-4"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setCurrentWaypointIndex(index);
                      setIsMapModalOpen(true);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-lg"
                  >
                    Select from Map
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={() => {
              // Handle mission creation
              handleCreateMission()
            }}  
            className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg mt-6"
          >
            Create Mission
          </button>
        </div>
      </Modal>

      {/* Map Selection Modal */}
      <Modal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        title="Select Location from Map"
      >
        <div className="space-y-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search location..."
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg py-2 px-4"
            />
            <button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
          <div ref={mapContainer} className="h-[400px] rounded-lg" />
        </div>
      </Modal>

      {/* Simulate Mission Modal */}
      <Modal
        isOpen={isSimulateModalOpen}
        onClose={() => {
          setIsSimulateModalOpen(false);
          setSimulationResult(null);
          setSelectedDrone('');
        }}
        title="Simulate Mission"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Drone</label>
            <select
              value={selectedDrone}
              onChange={(e) => setSelectedDrone(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4"
            >
              <option value="">Choose a drone</option>
              {drones.map(drone => (
                <option key={drone.id} value={drone.id}>{drone.name}</option>
              ))}
            </select>
          </div>

          {selectedDrone && !simulationResult && (
            <button
              onClick={runSimulation}
              className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg"
            >
              Run Simulation
            </button>
          )}

          {simulationResult && (
            <div className="space-y-4 bg-gray-700 p-4 rounded-lg">
              <div className="text-lg font-semibold">
                Mission {simulationResult.canComplete ? 'can' : 'cannot'} be completed
              </div>
              {simulationResult.canComplete ? (
                <>
                  <div>Estimated time: {simulationResult.timeTaken?.toFixed(1)} minutes</div>
                  <div>Battery usage: {simulationResult.batteryUsed?.toFixed(1)}%</div>
                  <div>Total distance: {(simulationResult.totalDistance || 0).toFixed(1)} meters</div>
                </>
              ) : (
                <div className="text-red-400">
                  {simulationResult.reason || "Mission cannot be completed with selected drone"}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default Missions;