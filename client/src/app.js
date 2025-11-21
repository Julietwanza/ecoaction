import React, { useState, useEffect, useCallback } from 'react';
import { Leaf, BarChart3, PlusCircle, Home, Truck, Zap, Utensils, Loader2 } from 'lucide-react';
import axios from 'axios';

// --- Configuration and API Service (services/api.js logic) ---

// Fix: Replaced 'process.env.REACT_APP_API_BASE_URL' with a direct string fallback
// to prevent ReferenceError when running in a browser environment without a build process.
// Developers should update this URL to their actual Render backend URL.
const API_BASE_URL = 'https://your-render-backend-url.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mocked Activity Types and Emission Factors (Frontend Reference)
const activityTypes = {
  Travel: { modes: ['Car', 'Bus', 'Train', 'Flight'], factor: 0.14 }, // kg CO2e per km
  Energy: { modes: ['Electricity'], factor: 0.5 }, // kg CO2e per kWh
  Food: { modes: ['Beef', 'Poultry', 'Vegetarian'], factor: 5.0 }, // kg CO2e per serving
};

const activityService = {
  getActivities: async () => {
    // In a production app, add error handling and authentication headers
    const response = await api.get('/activities');
    return response.data;
  },
  addActivity: async (activityData) => {
    const response = await api.post('/activities', activityData);
    return response.data;
  },
};

// --- Reusable Components (components/...) ---

const Loading = () => (
  <div className="flex justify-center items-center py-10 text-emerald-500">
    <Loader2 className="w-8 h-8 animate-spin mr-3" />
    <span className="text-lg font-medium">Loading EcoAction data...</span>
  </div>
);

const Header = ({ onNavigate, currentPage }) => {
  const navItems = [
    { name: 'Dashboard', icon: Home, page: 'dashboard' },
    { name: 'Log Activity', icon: PlusCircle, page: 'log' },
  ];

  return (
    <header className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2 text-emerald-600">
          <Leaf className="w-8 h-8" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">EcoAction Tracker</h1>
        </div>
        <nav className="flex space-x-4">
          {navItems.map((item) => (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className={`p-2 rounded-lg transition duration-200 flex items-center space-x-1 ${
                currentPage === item.page
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-emerald-600'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-medium">{item.name}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

const ActivityCard = ({ activity }) => {
  const { type, details, carbonFootprint, date } = activity;
  
  // Icon mapping
  const Icon = {
    Travel: Truck,
    Energy: Zap,
    Food: Utensils,
  }[type] || Leaf;

  const formattedDate = new Date(date).toLocaleDateString();

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300 border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-full bg-emerald-100 text-emerald-600`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-800">{type} - {details.mode}</p>
            <p className="text-sm text-gray-500">{formattedDate}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-red-600">{carbonFootprint.toFixed(2)}</p>
          <p className="text-sm text-gray-500">kg CO₂e</p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-600">
          Details: {details.distance} {details.unit} logged.
        </p>
      </div>
    </div>
  );
};

// --- Pages (pages/...) ---

const DashboardPage = ({ activities, loading, error, onNavigate }) => {
  const [summary, setSummary] = useState({ total: 0, breakdown: {} });
  const [recommendation, setRecommendation] = useState('');

  useEffect(() => {
    if (activities.length === 0) {
      setSummary({ total: 0, breakdown: {} });
      setRecommendation("Start logging your activities to see your carbon footprint!");
      return;
    }

    const total = activities.reduce((sum, act) => sum + act.carbonFootprint, 0);
    const breakdown = activities.reduce((acc, act) => {
      acc[act.type] = (acc[act.type] || 0) + act.carbonFootprint;
      return acc;
    }, {});
    setSummary({ total, breakdown });

    // Simple recommendation logic
    const topContributor = Object.entries(breakdown).sort(([, a], [, b]) => b - a)[0];
    if (topContributor && topContributor[0] === 'Travel') {
      setRecommendation('Travel is your biggest footprint area. Consider biking, walking, or public transport for short trips!');
    } else if (topContributor && topContributor[0] === 'Food') {
      setRecommendation('Your diet has a high footprint. Try one meatless meal per week.');
    } else {
      setRecommendation('Keep tracking! You are making a difference.');
    }
  }, [activities]);

  const categories = Object.keys(summary.breakdown);
  const maxFootprint = Math.max(...Object.values(summary.breakdown), 1); // Avoid division by zero

  if (loading) return <Loading />;
  if (error) return <p className="text-red-500 p-8 text-center">Error fetching data: {error.message}. Please check API connection.</p>;

  return (
    <div className="space-y-8 p-4 sm:p-8">
      {/* 1. Summary Card */}
      <div className="bg-emerald-600 text-white p-6 sm:p-8 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <BarChart3 className="w-8 h-8" />
             <h2 className="text-xl sm:text-3xl font-light">Your Total Carbon Footprint</h2>
          </div>
          <p className="text-4xl sm:text-5xl font-extrabold">
            {summary.total.toFixed(2)}
            <span className="text-lg font-medium ml-1">kg CO₂e</span>
          </p>
        </div>
      </div>

      {/* 2. Breakdown and Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center"><BarChart3 className="w-5 h-5 mr-2 text-emerald-500" /> Carbon Breakdown by Category</h3>
          <div className="space-y-4">
            {categories.length > 0 ? (
              categories.map((cat) => (
                <div key={cat} className="flex flex-col">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-700">{cat}</span>
                    <span className="text-sm font-semibold text-gray-600">{summary.breakdown[cat].toFixed(2)} kg</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-emerald-500 h-3 rounded-full transition-all duration-700"
                      style={{ width: `${(summary.breakdown[cat] / maxFootprint) * 100}%` }}
                      role="progressbar"
                      aria-valuenow={summary.breakdown[cat]}
                      aria-valuemin="0"
                      aria-valuemax={maxFootprint}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No data logged yet. Add your first activity!</p>
            )}
          </div>
        </div>

        {/* 3. Recommendation Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center"><Leaf className="w-5 h-5 mr-2 text-emerald-500" /> Action Tip</h3>
            <p className="text-gray-600 mb-6">{recommendation}</p>
          </div>
          <button 
            onClick={() => onNavigate('log')}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 rounded-lg transition duration-200 shadow-md"
          >
            Log New Activity
          </button>
        </div>
      </div>

      {/* 4. Recent Activities */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6">Recent Activities</h3>
        <div className="space-y-4">
          {activities.slice(0, 5).map((activity) => (
            <ActivityCard key={activity._id} activity={activity} />
          ))}
          {activities.length === 0 && <p className="text-center text-gray-500">No activities to display.</p>}
        </div>
      </div>
    </div>
  );
};

const ActivityLogPage = ({ onLogSuccess }) => {
  const [activity, setActivity] = useState({
    type: 'Travel',
    details: { mode: 'Car', distance: '', unit: 'km' },
    date: new Date().toISOString().split('T')[0],
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    const { modes } = activityTypes[newType];
    setActivity({
      ...activity,
      type: newType,
      details: { ...activity.details, mode: modes[0], distance: '', unit: newType === 'Energy' ? 'kWh' : newType === 'Food' ? 'serving' : 'km' },
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'distance') {
      setActivity({
        ...activity,
        details: { ...activity.details, [name]: Number(value) },
      });
    } else if (name === 'mode') {
      setActivity({
        ...activity,
        details: { ...activity.details, [name]: value },
      });
    } else {
      setActivity({ ...activity, [name]: value });
    }
  };

  // Simplified frontend calculation for illustrative purposes
  const estimateFootprint = (act) => {
    const { type, details } = act;
    const baseFactor = activityTypes[type]?.factor || 0.1;

    if (type === 'Travel') {
        const modeFactor = details.mode === 'Car' ? 1.0 : details.mode === 'Flight' ? 2.5 : 0.5;
        return details.distance * baseFactor * modeFactor;
    }
    if (type === 'Energy') {
        return details.distance * baseFactor;
    }
    if (type === 'Food') {
        const modeFactor = details.mode === 'Beef' ? 3.0 : details.mode === 'Poultry' ? 1.0 : 0.1;
        return details.distance * baseFactor * modeFactor;
    }
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    if (!activity.details.distance || activity.details.distance <= 0) {
        setMessage({ type: 'error', text: 'Please enter a valid positive distance/amount.' });
        setLoading(false);
        return;
    }
    
    try {
      // Simulate carbon calculation on the backend by sending the estimated value
      const estimatedFootprint = estimateFootprint(activity);
      
      const activityPayload = {
        ...activity,
        carbonFootprint: parseFloat(estimatedFootprint.toFixed(2)),
        // The backend will assign userId and _id
      };
      
      await activityService.addActivity(activityPayload);
      
      setMessage({ type: 'success', text: `Activity logged successfully! Estimated Footprint: ${estimatedFootprint.toFixed(2)} kg CO₂e` });
      
      // Reset form after a brief delay
      setTimeout(() => {
        setActivity({
            type: 'Travel',
            details: { mode: 'Car', distance: '', unit: 'km' },
            date: new Date().toISOString().split('T')[0],
        });
        onLogSuccess(); // Notify parent to refresh dashboard data
      }, 1500);

    } catch (err) {
      console.error('Logging Error:', err);
      setMessage({ type: 'error', text: 'Failed to log activity. Check server connection or input data.' });
    } finally {
      setLoading(false);
    }
  };

  const currentActivityModes = activityTypes[activity.type]?.modes || [];
  const unit = activity.details.unit;

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
        <PlusCircle className="w-6 h-6 mr-2 text-emerald-500" /> Log New Carbon Activity
      </h2>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 space-y-6">
        
        {/* Activity Type */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Activity Category</label>
          <select
            id="type"
            name="type"
            value={activity.type}
            onChange={handleTypeChange}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-3 border"
            required
          >
            {Object.keys(activityTypes).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Mode of Activity */}
        <div>
          <label htmlFor="mode" className="block text-sm font-medium text-gray-700 mb-1">Mode / Detail</label>
          <select
            id="mode"
            name="mode"
            value={activity.details.mode}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-3 border"
            required
          >
            {currentActivityModes.map(mode => (
              <option key={mode} value={mode}>{mode}</option>
            ))}
          </select>
        </div>

        {/* Distance / Amount */}
        <div>
          <label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-1">
            {activity.type === 'Energy' ? 'Amount Used' : activity.type === 'Food' ? 'Number of Servings' : 'Distance Travelled'}
          </label>
          <div className="mt-1 flex rounded-lg shadow-sm">
            <input
              type="number"
              step="any"
              id="distance"
              name="distance"
              value={activity.details.distance}
              onChange={handleChange}
              placeholder={`Enter value in ${unit}`}
              className="flex-1 block w-full rounded-l-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 p-3 border"
              required
              min="0.1"
            />
            <span className="inline-flex items-center px-4 rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm font-medium">
              {unit}
            </span>
          </div>
        </div>

        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={activity.date}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-3 border"
            required
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
        
        {message.text && (
          <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition duration-200 shadow-md disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Leaf className="w-5 h-5 mr-2" />
          )}
          {loading ? 'Submitting...' : 'Calculate & Log Activity'}
        </button>
      </form>
    </div>
  );
};

// --- Main App Component (App.jsx) ---

const initialActivities = [
  { _id: 'a1', type: 'Travel', details: { mode: 'Car', distance: 100, unit: 'km' }, carbonFootprint: 14.0, date: '2025-10-20T10:00:00Z', userId: 'user123' },
  { _id: 'a2', type: 'Energy', details: { mode: 'Electricity', distance: 50, unit: 'kWh' }, carbonFootprint: 25.0, date: '2025-10-21T11:00:00Z', userId: 'user123' },
  { _id: 'a3', type: 'Food', details: { mode: 'Beef', distance: 1, unit: 'serving' }, carbonFootprint: 15.0, date: '2025-10-22T12:00:00Z', userId: 'user123' },
  { _id: 'a4', type: 'Travel', details: { mode: 'Bus', distance: 50, unit: 'km' }, carbonFootprint: 3.5, date: '2025-10-23T13:00:00Z', userId: 'user123' },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [activities, setActivities] = useState(initialActivities); // Using mock data initially
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Function to fetch activities from the backend
  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // **In a real app, uncomment the line below to use the live API:**
      // const data = await activityService.getActivities();
      // setActivities(data);
      
      // For demonstration, we simulate data fetching and use initialActivities
      console.log("Simulating fetching activities from the server...");
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      setActivities(prev => [...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));

    } catch (err) {
      console.error('Fetch Activities Error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleLogSuccess = () => {
    // Navigate back to dashboard and refresh data
    setCurrentPage('dashboard');
    fetchActivities(); 
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'log':
        return <ActivityLogPage onLogSuccess={handleLogSuccess} />;
      case 'dashboard':
      default:
        return (
          <DashboardPage
            activities={activities}
            loading={loading}
            error={error}
            onNavigate={setCurrentPage}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header onNavigate={setCurrentPage} currentPage={currentPage} />
      <main className="container mx-auto pb-16">
        {renderPage()}
      </main>
      <footer className="bg-white border-t border-gray-100 mt-10 py-4 text-center text-sm text-gray-500">
        &copy; 2024 EcoAction Tracker | SDG 13: Climate Action Project
      </footer>
    </div>
  );
}
