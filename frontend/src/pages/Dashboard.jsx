import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total_patients: 0,
    total_medicines: 0,
    low_stock_items: 0,
    expiring_soon: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch("http://localhost:5000/dashboard_stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center text-gray-500 py-10">
          Loading dashboard...
        </div>
      </Layout>
    );
  }

  const Card = ({ title, value, icon, color }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase">{title}</p>
          <p className="text-2xl font-semibold text-gray-800 mt-1">
            {value}
          </p>
        </div>

        <div className={`text-2xl ${color}`}>{icon}</div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-10 space-y-8">

        {/* Title */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Overview of pharmacy system
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

          <Card
            title="Total Patients"
            value={stats.total_patients}
            icon="👤"
            color="text-emerald-600"
          />

          <Card
            title="Total Medicines"
            value={stats.total_medicines}
            icon="💊"
            color="text-green-500"
          />

          <Card
            title="Low Stock"
            value={stats.low_stock_items}
            icon="⚠️"
            color="text-yellow-500"
          />

          <Card
            title="Expiring Soon"
            value={stats.expiring_soon}
            icon="⏳"
            color="text-red-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">

          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Quick Actions
            </h2>
            <p className="text-sm text-gray-500">
              Perform common operations
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            <button
              onClick={() => navigate("/add-patient")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-sm"
            >
              Add Patient
            </button>

            <button
              onClick={() => navigate("/add-medicine")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-sm"
            >
              Add Medicine
            </button>

            <button
              onClick={() => navigate("/sell")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-sm transition"
            >
              Sell Medicine
            </button>

            <button
              onClick={() => navigate("/add-batch")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-sm transition"
            >
              Add Batch
            </button>

          </div>
        </div>

        {/* System Status */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">

          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            System Status
          </h2>

          <div className="space-y-3 text-sm">

            <div className="flex justify-between">
              <span className="text-gray-500">Server</span>
              <span className="text-green-600 font-medium">Online</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Database</span>
              <span className="text-green-600 font-medium">Connected</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Last Sync</span>
              <span className="text-gray-800">Just now</span>
            </div>

          </div>
        </div>

      </div>
    </Layout>
  );
}