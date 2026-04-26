import { useState, useEffect } from "react";
import Layout from "../components/Layout";

export default function MedicineReturnPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [returnQuantity, setReturnQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  // 🔍 Search patients
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setPatients([]);
      return;
    }

    const t = setTimeout(() => searchPatients(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // 📦 Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/patient_medicine_history/${selectedPatient.patient_id}`
        );
        const data = await res.json();
        setTransactions(data.purchases || []);
      } catch {
        setTransactions([]);
      }
    };
    if (selectedPatient) fetchTransactions();
  }, [selectedPatient]);

  const searchPatients = async (term) => {
    setSearchLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/search_patient?name=${encodeURIComponent(term)}`
      );
      const data = await res.json();
      console.log("search_patient response:", data);
      setPatients(Array.isArray(data) ? data : []);
    } catch {
      setPatients([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const selectPatient = (p) => {
    setSelectedPatient(p);
    setSearchTerm(p.p_name);
    setPatients([]);
    setSelectedTransaction(null);
  };

  const handleReturn = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!selectedTransaction || !returnQuantity) {
      return setMessage("Please select transaction and quantity");
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/return_medicine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction_id: selectedTransaction.transaction_id,
          batch_id: selectedTransaction.batch_id,
          quantity: parseInt(returnQuantity),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(
          `Return successful! Credits added: ₹${data.credit_added}`
        );
        setReturnQuantity("");
        setSelectedTransaction(null);
      } else {
        setMessage(data.error || "Return failed");
      }
    } catch {
      setMessage("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-10 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Medicine Return
          </h1>
          <p className="text-sm text-gray-500">
            Process returns and assign credits
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT PANEL */}
          <div className="space-y-6">

            {/* Search Patient */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h2 className="font-medium text-gray-700 mb-3">
                Search Patient
              </h2>

              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />

              {searchLoading && (
                <p className="text-xs text-blue-500 mt-2">Searching...</p>
              )}

              <div className="mt-3 space-y-2">
                {patients.map((p) => (
                  <div
                    key={p.patient_id}
                    onClick={() => selectPatient(p)}
                    className="p-2 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <p className="font-medium">{p.p_name}</p>
                    <p className="text-xs text-gray-500">
                      {p.contact_no}
                    </p>
                    <p className="text-xs text-green-600">
                      Credits: ₹{p.total_credits}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Transactions */}
            {selectedPatient && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h2 className="font-medium text-gray-700 mb-3">
                  Purchase History
                </h2>

                {transactions.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    No purchases found
                  </p>
                ) : (
                  transactions.map((t) => (
                    <div
                      key={t.transaction_id + t.batch_id}
                      onClick={() => setSelectedTransaction(t)}
                      className={`p-3 border rounded-lg mb-2 cursor-pointer ${
                        selectedTransaction?.transaction_id === t.transaction_id
                          ? "border-blue-500 bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <p className="font-medium">{t.medicine_name}</p>
                      <p className="text-xs text-gray-500">
                        Qty: {t.quantity}
                      </p>
                      <p className="text-xs text-gray-500">
                        Date:{" "}
                        {new Date(t.transaction_date).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* RIGHT PANEL */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">

            <h2 className="font-medium text-gray-700 mb-4">
              Return Medicine
            </h2>

            {!selectedTransaction ? (
              <p className="text-sm text-gray-400">
                Select a transaction to return
              </p>
            ) : (
              <form onSubmit={handleReturn} className="space-y-4">

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">
                    {selectedTransaction.medicine_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Purchased: {selectedTransaction.quantity} units
                  </p>
                </div>

                <input
                  type="number"
                  value={returnQuantity}
                  onChange={(e) => setReturnQuantity(e.target.value)}
                  placeholder="Enter return quantity"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />

                {/* Policy */}
                <div className="text-xs text-gray-400">
                  Return Policy:
                  <br /> • Within 7 days → 75% credits
                  <br /> • Within 15 days → 25% credits
                  <br /> • After 15 days → No credits
                </div>

                <button
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg text-sm"
                >
                  {loading ? "Processing..." : "Process Return"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}