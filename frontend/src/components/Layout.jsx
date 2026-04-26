
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen w-full bg-slate-100 flex">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
        
        {/* Content Wrapper */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-6 min-h-[calc(100vh-4rem)]">
          {children}
        </div>

      </main>
    </div>
  );
}
