import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import {
  Users,
  Pill,
  AlertTriangle,
  Clock,
  UserPlus,
  Package,
  ShoppingCart,
  PlusCircle,
} from "lucide-react";

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
        <div className="text-center text-gray-400 py-10 text-sm">
          Loading dashboard…
        </div>
      </Layout>
    );
  }

  const statCards = [
    {
      title: "Total Patients",
      value: stats.total_patients,
      icon: Users,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
    },
    {
      title: "Total Medicines",
      value: stats.total_medicines,
      icon: Pill,
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100",
    },
    {
      title: "Low Stock",
      value: stats.low_stock_items,
      icon: AlertTriangle,
      iconColor: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-100",
    },
    {
      title: "Expiring Soon",
      value: stats.expiring_soon,
      icon: Clock,
      iconColor: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-100",
    },
  ];

  const quickActions = [
    { label: "Add Patient", icon: UserPlus, path: "/add-patient" },
    { label: "Add Medicine", icon: PlusCircle, path: "/add-medicine" },
    { label: "Sell Medicine", icon: ShoppingCart, path: "/sell" },
    { label: "Add Batch", icon: Package, path: "/add-batch" },
  ];

  return (
    <Layout>
      <div className="space-y-8">

        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              Welcome, {localStorage.getItem("username") || "Admin"}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Pharmacy operations overview
            </p>
          </div>
          <div className="text-xs font-medium text-gray-500 bg-white px-4 py-2 border border-gray-200 rounded-lg">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ title, value, icon: Icon, iconColor, bgColor, borderColor }) => (
            <div
              key={title}
              className={`bg-white border ${borderColor} rounded-xl p-5 flex items-center gap-4`}
            >
              <div className={`${bgColor} ${iconColor} p-3 rounded-lg`}>
                <Icon size={20} strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-0.5">
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-gray-800">
              Quick Actions
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Common operations at a glance
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map(({ label, icon: Icon, path }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className="flex flex-col items-center gap-2.5 py-5 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition group"
              >
                <div className="text-gray-500 group-hover:text-blue-600 transition">
                  <Icon size={22} strokeWidth={1.6} />
                </div>
                <span className="text-xs font-medium text-gray-600 group-hover:text-blue-700 transition">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
}