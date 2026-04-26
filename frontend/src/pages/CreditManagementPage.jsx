import { useState, useEffect } from "react";
import Layout from "../components/Layout";

export default function CreditManagementPage() {
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: "",
    amount: ""
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Fetch credits when component mounts
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    setLoading(true);
    try {
      // This would need to be implemented in backend - for now showing all credits
      const response = await fetch("http://localhost:5000/get_all_credits");
      const data = await response.json();
      setCredits(data);
    } catch (error) {
      console.error("Error fetching credits:", error);
      // Fallback - try to get credits for a sample patient
      try {
        const response = await fetch("http://localhost:5000/get_credit/sample_patient");
        const data = await response.json();
        setCredits(data);
      } catch (err) {
        console.error("Error fetching sample credits:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddCredit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/add_credit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Credit added successfully!");
        setFormData({ patient_id: "", amount: "" });
        setShowAddForm(false);
        fetchCredits(); // Refresh the list
      } else {
        setMessage(data.error || "Failed to add credit");
      }
    } catch (error) {
      setMessage("Server error. Please try again.");
      console.error("Error:", error);
    }
  };

  const getCreditStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry <= 0) return { status: "expired", color: "red", text: "Expired" };
    if (daysUntilExpiry <= 7) return { status: "expiring", color: "orange", text: `${daysUntilExpiry} days` };
    return { status: "active", color: "green", text: `${daysUntilExpiry} days` };
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Credit Management</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            {showAddForm ? "Cancel" : "Add Credit"}
          </button>
        </div>

        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.includes("success") 
              ? "bg-green-100 text-green-700 border border-green-400" 
              : "bg-red-100 text-red-700 border border-red-400"
          }`}>
            {message}
          </div>
        )}

        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Add New Credit</h2>
            <form onSubmit={handleAddCredit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="patient_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Patient ID
                  </label>
                  <input
                    type="text"
                    id="patient_id"
                    name="patient_id"
                    value={formData.patient_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter patient ID"
                  />
                </div>
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                    Credit Amount (INR)
                  </label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter credit amount"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Credit
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-xl font-semibold mb-4">Active Credits</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading credits...</p>
            </div>
          ) : credits.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p>No credits found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Issue Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expiry Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {credits.map((credit) => {
                    const statusInfo = getCreditStatus(credit.expiry_date);
                    return (
                      <tr key={credit.credit_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {credit.p_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          INR {credit.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(credit.issue_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(credit.expiry_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}>
                            {statusInfo.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 bg-emerald-50 rounded-xl p-4 border border-emerald-100 shadow-sm">
          <h3 className="font-semibold text-emerald-900 mb-2">Credit Information:</h3>
          <ul className="text-sm text-emerald-800 space-y-1">
            <li>All credits are valid for 30 days from the issue date</li>
            <li>Credits expire automatically after 30 days</li>
            <li>Patients can use credits for medicine purchases</li>
            <li>Status shows: Active (green), Expiring soon (orange), Expired (red)</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
