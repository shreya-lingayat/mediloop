import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  UserPlus,
  Users,
  Pill,
  Truck,
  Package,
  ShoppingCart,
  RotateCcw,
  FileText,
  Bell,
  LogOut,
  CreditCard,
} from "lucide-react";

export default function Sidebar() {
  const base =
    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150";

  const active = "bg-blue-600/15 text-blue-100";
  const inactive = "text-slate-400 hover:bg-slate-800 hover:text-slate-100";

  const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink
      to={to}
      className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
    >
      <Icon size={15} strokeWidth={1.8} />
      <span>{label}</span>
    </NavLink>
  );

  const Section = ({ title, children }) => (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 px-3 mb-1.5">
        {title}
      </p>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );

  return (
    <div className="w-60 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
            <Pill size={14} strokeWidth={2.5} className="text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-semibold leading-none">
              MediLoop
            </p>
            <p className="text-slate-500 text-[10px] mt-0.5">
              Pharmacy System
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-5 overflow-y-auto">
        {/* Overview */}
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />

        {/* Patients */}
        <Section title="Patients">
          <NavItem to="/add-patient" icon={UserPlus} label="Add Patient" />
          <NavItem to="/patients" icon={Users} label="Search Patients" />
        </Section>

        {/* Inventory */}
        <Section title="Inventory">
          <NavItem to="/add-medicine" icon={Pill} label="Add Medicine" />
          <NavItem to="/add-supplier" icon={Truck} label="Suppliers" />
          <NavItem to="/add-batch" icon={Package} label="Batches" />
          <NavItem to="/sell" icon={ShoppingCart} label="Billing" />
        </Section>

        {/* Operations */}
        <Section title="Operations">
          <NavItem to="/medicine-return" icon={RotateCcw} label="Returns" />
          <NavItem to="/transactions" icon={FileText} label="Transactions" />
          <NavItem to="/credits" icon={CreditCard} label="Credits" />
        </Section>

        {/* Alerts */}
        <Section title="Alerts">
          <NavItem to="/alerts" icon={Bell} label="Expiry Alerts" />
        </Section>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-800">
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors duration-150"
        >
          <LogOut size={15} strokeWidth={1.8} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
