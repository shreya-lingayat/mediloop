
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen w-full bg-[#f4f7fb] flex">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-x-hidden">
        
        {/* Content Wrapper */}
        <div className="bg-white rounded-xl shadow-sm p-6 min-h-[calc(100vh-3rem)]">
          {children}
        </div>

      </main>
    </div>
  );
}
