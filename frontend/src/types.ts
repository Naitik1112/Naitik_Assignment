export interface User {
  _id: string;
  name: string;
  email: string;
  photo?: string;
  role: string;
  createdAt: string;
}

export interface Mission {
  id: string;
  name: string;
  title: string;
  waypoints: Waypoint[];
  status: 'planned' | 'in-progress' | 'completed';
  estimatedDuration: number;
  batteryUsage: number;
  createdAt: string;
  droneId: string;
  total_distance : number;
  user: string;
}

export interface Waypoint {
  id: string;
  latitude: number;
  longitude: number;
  altitude: number;
  order: number;
}

export interface Drone {
  id: string;
  name: string;
  image: string;
  batteryRuntime: number;
  maxSpeed: number;
  maxAltitude: number;
  status: 'available' | 'in-mission' | 'maintenance';
}

export interface SimulationResult {
  canComplete: boolean;
  timeTaken: number;
  batteryUsed: number;
  totalDistance?: number;
  reason?: string;
}