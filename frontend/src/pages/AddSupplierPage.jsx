import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function AddSupplierPage() {
  const [formData, setFormData] = useState({
    supplier_name: "",
    contact_no: "",
    license_no: ""
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
      const response = await fetch("http://localhost:5000/add_supplier", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Supplier added successfully!");
        setFormData({
          supplier_name: "",
          contact_no: "",
          license_no: ""
        });
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        setMessage(data.error || "Failed to add supplier");
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
        <h1 className="text-3xl font-bold mb-6">Add Supplier</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
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
              <label htmlFor="supplier_name" className="block text-sm font-medium text-gray-700 mb-2">
                Supplier Name
              </label>
              <input
                type="text"
                id="supplier_name"
                name="supplier_name"
                value={formData.supplier_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Enter supplier name"
              />
            </div>

            <div>
              <label htmlFor="contact_no" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number
              </label>
              <input
                type="tel"
                id="contact_no"
                name="contact_no"
                value={formData.contact_no}
                onChange={handleChange}
                required
                pattern="[0-9]{10}"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Enter 10-digit contact number"
              />
            </div>

            <div>
              <label htmlFor="license_no" className="block text-sm font-medium text-gray-700 mb-2">
                License Number
              </label>
              <input
                type="text"
                id="license_no"
                name="license_no"
                value={formData.license_no}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Enter drug license number"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Adding..." : "Add Supplier"}
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

        <div className="mt-6 bg-green-50 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">Supplier Information:</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>Enter the complete legal name of the supplier</li>
            <li>Provide a valid 10-digit contact number</li>
            <li>Enter the official drug license number</li>
            <li>This information will be used for batch tracking</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
