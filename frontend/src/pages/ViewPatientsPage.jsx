import { useState, useEffect } from "react";
import Layout from "../components/Layout";

export default function ViewPatientsPage() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [history, setHistory] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", contact: "", address: "" });
  const [message, setMessage] = useState("");

  // 🔹 Search effect
  useEffect(() => {
    if (search.trim() === "") {
      setPatients([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchPatients(search);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search]);

  // 🔹 API call
  const searchPatients = async (searchTerm) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/search_patient?name=${encodeURIComponent(searchTerm)}`
      );
      const data = await res.json();
      console.log("search_patient response:", data);
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Select patient
  const selectPatient = (patient) => {
    setSelectedPatient(patient);
    setEditForm({
      name: patient.p_name || "",
      contact: patient.contact_no || "",
      address: patient.address || "",
    });
    fetch(`http://localhost:5000/patient_medicine_history/${patient.patient_id}`)
      .then((res) => res.json())
      .then((data) => setHistory(data))
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
      setMessage(data.error || "Unable to update patient");
      return;
    }
    setMessage("Patient updated successfully.");
    searchPatients(search);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Search Patients
          </h1>
          <p className="text-sm text-gray-500">
            Find patients and view their credit details
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <input
            type="text"
            placeholder="Search patient by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {loading && (
            <div className="mt-2 text-xs text-blue-500">
              Searching...
            </div>
          )}
        </div>

        {/* No results */}
        {search && !loading && patients.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-6">
            No patients found
          </div>
        )}

        {/* Patient List */}
        <div className="space-y-3">
          {patients.map((patient) => (
            <div
              key={patient.patient_id}
              onClick={() => selectPatient(patient)}
              className={`bg-white border rounded-xl p-4 cursor-pointer transition ${
                selectedPatient?.patient_id === patient.patient_id
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 hover:border-emerald-200"
              }`}
            >
              <div className="flex justify-between items-center">

                {/* Patient Info */}
                <div>
                  <p className="font-medium text-gray-800">
                    {patient.p_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {patient.contact_no}
                  </p>
                </div>

                {/* Date */}
                <div className="text-xs text-gray-400">
                  {new Date(patient.registration_date).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {message && (
          <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg">
            {message}
          </div>
        )}

        {selectedPatient && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-5">
            <h3 className="text-md font-semibold text-gray-800">Patient Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <input value={editForm.contact} onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <button onClick={updatePatient} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 text-sm">Update Patient</button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-emerald-50 rounded-lg p-3 text-sm">Credits Earned: ₹{history?.credit_summary?.earned ?? 0}</div>
              <div className="bg-emerald-50 rounded-lg p-3 text-sm">Credits Used: ₹{history?.credit_summary?.used ?? 0}</div>
              <div className="bg-emerald-50 rounded-lg p-3 text-sm">Credits Remaining: ₹{history?.credit_summary?.remaining ?? 0}</div>
            </div>

            <div>
              <p className="text-sm font-semibold mb-2">Purchases</p>
              <div className="space-y-2">
                {(history?.purchases || []).slice(0, 8).map((p, idx) => (
                  <div key={`${p.transaction_id}-${idx}`} className="text-xs bg-gray-50 rounded-lg p-2">
                    {p.medicine_name} | Qty {p.quantity} | {new Date(p.transaction_date).toLocaleDateString()}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold mb-2">Returns</p>
              <div className="space-y-2">
                {(history?.returns || []).slice(0, 8).map((r) => (
                  <div key={r.return_id} className="text-xs bg-gray-50 rounded-lg p-2">
                    Qty {r.quantity} | {new Date(r.return_date).toLocaleDateString()} | {r.return_status}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}//hide ids and display the credits in patients account