import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { Search, User } from "lucide-react";

export default function ViewPatientsPage() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [history, setHistory] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", contact: "", address: "" });
  const [message, setMessage] = useState({ text: "", type: "" });

  // Debounced search
  useEffect(() => {
    if (!search.trim()) { setPatients([]); return; }
    const t = setTimeout(() => searchPatients(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const searchPatients = async (term) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/search_patient?name=${encodeURIComponent(term)}`);
      const data = await res.json();
      setPatients(Array.isArray(data) ? data : []);
    } catch {
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const selectPatient = (patient) => {
    setSelectedPatient(patient);
    setMessage({ text: "", type: "" });
    setEditForm({
      name: patient.p_name || "",
      contact: patient.contact_no || "",
      address: patient.address || "",
    });
    fetch(`http://localhost:5000/patient_medicine_history/${patient.patient_id}`)
      .then((r) => r.json())
      .then(setHistory)
      .catch(() => setHistory(null));
  };

  const updatePatient = async () => {
    if (!selectedPatient) return;
    const res = await fetch(`http://localhost:5000/update_patient/${selectedPatient.patient_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage({ text: data.error || "Update failed.", type: "error" });
      return;
    }
    setMessage({ text: "Patient updated successfully.", type: "success" });
    searchPatients(search);
  };

  const alertClass = {
    success: "bg-emerald-50 border border-emerald-200 text-emerald-700",
    error: "bg-red-50 border border-red-200 text-red-700",
  };

  return (
    <Layout>
      <div className="space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Search Patients</h1>
          <p className="text-sm text-gray-500 mt-0.5">Find patients and view their records</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-9"
          />
          {loading && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-500">
              Searching…
            </span>
          )}
        </div>

        {/* No results */}
        {search && !loading && patients.length === 0 && (
          <p className="text-sm text-gray-400">No patients found for "{search}"</p>
        )}

        {/* Two-column layout when patient selected */}
        <div className={`grid gap-5 ${selectedPatient ? "md:grid-cols-2" : "grid-cols-1"}`}>

          {/* Patient List */}
          {patients.length > 0 && (
            <div className="space-y-2">
              {patients.map((p) => (
                <div
                  key={p.patient_id}
                  onClick={() => selectPatient(p)}
                  className={`flex items-center justify-between px-4 py-3.5 rounded-xl border cursor-pointer transition ${
                    selectedPatient?.patient_id === p.patient_id
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                      <User size={14} strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{p.p_name}</p>
                      <p className="text-xs text-gray-500">{p.contact_no}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(p.registration_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Patient Detail Panel */}
          {selectedPatient && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">Patient Profile</p>
                <button
                  onClick={() => { setSelectedPatient(null); setHistory(null); }}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Close
                </button>
              </div>

              {message.text && (
                <div className={`text-xs px-3 py-2 rounded-lg ${alertClass[message.type]}`}>
                  {message.text}
                </div>
              )}

              {/* Edit fields */}
              <div className="space-y-3">
                <div>
                  <label className="label-base">Full Name</label>
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="label-base">Contact</label>
                  <input
                    value={editForm.contact}
                    onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })}
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="label-base">Address</label>
                  <input
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="input-base"
                  />
                </div>
                <button onClick={updatePatient} className="btn-primary text-sm py-2">
                  Update Patient
                </button>
              </div>

              {/* Credits summary */}
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Credits</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Earned", value: history?.credit_summary?.earned ?? 0 },
                    { label: "Used", value: history?.credit_summary?.used ?? 0 },
                    { label: "Remaining", value: history?.credit_summary?.remaining ?? 0 },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5 text-center">
                      <p className="text-xs text-blue-600 font-medium">{label}</p>
                      <p className="text-sm font-bold text-blue-800 mt-0.5">₹{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Purchases */}
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Recent Purchases</p>
                {(history?.purchases || []).length === 0 ? (
                  <p className="text-xs text-gray-400">No purchases yet</p>
                ) : (
                  <div className="space-y-1.5">
                    {(history?.purchases || []).slice(0, 6).map((item, idx) => (
                      <div
                        key={`${item.transaction_id}-${idx}`}
                        className="flex justify-between text-xs bg-gray-50 rounded-lg px-3 py-2"
                      >
                        <span className="font-medium text-gray-700">{item.medicine_name}</span>
                        <span className="text-gray-500">Qty {item.quantity} · {new Date(item.transaction_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Returns */}
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Returns</p>
                {(history?.returns || []).length === 0 ? (
                  <p className="text-xs text-gray-400">No returns yet</p>
                ) : (
                  <div className="space-y-1.5">
                    {(history?.returns || []).slice(0, 6).map((r) => (
                      <div
                        key={r.return_id}
                        className="flex justify-between text-xs bg-gray-50 rounded-lg px-3 py-2"
                      >
                        <span className="font-medium text-gray-700">Qty {r.quantity}</span>
                        <span className="text-gray-500">
                          {new Date(r.return_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} · {r.return_status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}