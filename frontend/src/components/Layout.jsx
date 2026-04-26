import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen w-full bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
