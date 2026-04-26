// ```jsx id="k9x2df"
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  UserPlus,
  Search,
  Pill,
  Truck,
  Package,
  ShoppingCart,
  RotateCcw,
  FileText,
  AlertTriangle,
} from "lucide-react";

export default function Sidebar() {
  const linkClass =
    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition";

  const activeClass =
    "bg-emerald-500/20 text-emerald-100";

  const inactiveClass =
    "text-emerald-50/80 hover:bg-emerald-500/15 hover:text-white";

  return (
    <div className="w-64 min-h-screen bg-emerald-950 border-r border-emerald-900 p-5 flex flex-col shadow-xl">
      
      {/* Logo */}
      <div className="mb-8">
        <h2 className="text-white text-xl font-semibold">
          MediLoop
        </h2>
        <p className="text-emerald-200/80 text-xs mt-1">
          Pharmacy System
        </p>
      </div>

      <nav className="flex flex-col gap-6">

        {/* Dashboard */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : inactiveClass}`
          }
        >
          <LayoutDashboard size={16} />
          <span>Dashboard</span>
        </NavLink>

        {/* Patients */}
        <div>
          <p className="text-emerald-200/70 text-xs uppercase mb-2 tracking-wide">
            Patients
          </p>

          <div className="flex flex-col gap-1">
            <NavLink
              to="/add-patient"
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : inactiveClass}`
              }
            >
              <UserPlus size={16} />
              Add Patient
            </NavLink>

            <NavLink
              to="/patients"
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : inactiveClass}`
              }
            >
              <Search size={16} />
              Search Patients
            </NavLink>
          </div>
        </div>

        {/* Inventory */}
        <div>
          <p className="text-emerald-200/70 text-xs uppercase mb-2 tracking-wide">
            Inventory
          </p>

          <div className="flex flex-col gap-1">
            <NavLink
              to="/add-medicine"
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : inactiveClass}`
              }
            >
              <Pill size={16} />
              Add Medicine
            </NavLink>

            <NavLink
              to="/add-supplier"
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : inactiveClass}`
              }
            >
              <Truck size={16} />
              Suppliers
            </NavLink>

            <NavLink
              to="/add-batch"
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : inactiveClass}`
              }
            >
              <Package size={16} />
              Batches
            </NavLink>

            <NavLink
              to="/sell"
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : inactiveClass}`
              }
            >
              <ShoppingCart size={16} />
              Billing
            </NavLink>
          </div>
        </div>

        {/* Operations */}
        <div>
          <p className="text-emerald-200/70 text-xs uppercase mb-2 tracking-wide">
            Operations
          </p>

          <div className="flex flex-col gap-1">
            <NavLink
              to="/medicine-return"
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : inactiveClass}`
              }
            >
              <RotateCcw size={16} />
              Returns
            </NavLink>

            <NavLink
              to="/transactions"
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : inactiveClass}`
              }
            >
              <FileText size={16} />
              Transactions
            </NavLink>
          </div>
        </div>

        {/* Alerts */}
        <div>
          <p className="text-emerald-200/70 text-xs uppercase mb-2 tracking-wide">
            Alerts
          </p>

          <NavLink
            to="/alerts"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            <AlertTriangle size={16} />
            Expiry Alerts
          </NavLink>
        </div>
      </nav>
    </div>
  );
}

