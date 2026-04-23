import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function AddMedicinePage() {
  const [formData, setFormData] = useState({
    medicine_name: "",
    category: "",
    unit_price: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/add_medicine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Medicine added successfully!");
        setFormData({
          medicine_name: "",
          category: "",
          unit_price: ""
        });
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        setMessage(data.error || "Failed to add medicine");
      }
    } catch (error) {
      setMessage("Server error. Please try again.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Add Medicine</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          {message && (
            <div className={`mb-4 p-4 rounded-lg ${
              message.includes("success") 
                ? "bg-green-100 text-green-700 border border-green-400" 
                : "bg-red-100 text-red-700 border border-red-400"
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="medicine_name" className="block text-sm font-medium text-gray-700 mb-2">
                Medicine Name
              </label>
              <input
                type="text"
                id="medicine_name"
                name="medicine_name"
                value={formData.medicine_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter medicine name"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select category</option>
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Syrup">Syrup</option>
                <option value="Injection">Injection</option>
                <option value="Ointment">Ointment</option>
                <option value="Drops">Drops</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="unit_price" className="block text-sm font-medium text-gray-700 mb-2">
                Unit Price (INR)
              </label>
              <input
                type="number"
                id="unit_price"
                name="unit_price"
                value={formData.unit_price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter unit price"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Adding..." : "Add Medicine"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>Enter the complete medicine name as it appears on the packaging</li>
            <li>Select the appropriate category for the medicine type</li>
            <li>Enter the selling price per unit (tablet, bottle, etc.)</li>
            <li>All fields are required</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
