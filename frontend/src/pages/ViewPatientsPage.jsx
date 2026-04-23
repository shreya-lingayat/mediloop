import { useState, useEffect } from "react";
import Layout from "../components/Layout";

export default function ViewPatientsPage() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

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
      setPatients(data);
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
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
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

        {/* 🔹 Credit Section */}
        {selectedPatient && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">

            <h3 className="text-md font-semibold text-gray-800 mb-4">
              Credit Details
            </h3>

            {selectedPatient.credits && selectedPatient.credits.length > 0 ? (
              <div className="space-y-3">
                {selectedPatient.credits.map((credit) => {
                  const isActive =
                    new Date(credit.expiry_date) > new Date();

                  return (
                    <div
                      key={credit.credit_id}
                      className="border border-gray-200 rounded-lg p-3 flex justify-between items-center"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          ₹ {credit.amount}
                        </p>
                        <p className="text-xs text-gray-500">
                          Issued:{" "}
                          {new Date(credit.issue_date).toLocaleDateString()}
                        </p>
                      </div>

                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {isActive ? "Active" : "Expired"}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No credits available for this patient
              </p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}//hide ids and display the credits in patients account