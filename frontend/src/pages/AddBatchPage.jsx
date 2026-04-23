import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function AddBatchPage() {
  const [formData, setFormData] = useState({
    medicine_id: "",
    supplier_id: "",
    manufacturing_date: "",
    quantity_available: "",
    purchase_price: ""
  });
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchMedicinesAndSuppliers();
  }, []);

  const fetchMedicinesAndSuppliers = async () => {
    try {
      const [medicinesResponse, suppliersResponse] = await Promise.all([
        fetch("http://localhost:5000/get_medicines"),
        fetch("http://localhost:5000/get_suppliers")
      ]);

      const medicinesData = await medicinesResponse.json();
      const suppliersData = await suppliersResponse.json();

      setMedicines(medicinesData);
      setSuppliers(suppliersData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage("Failed to load medicines and suppliers");
    } finally {
      setFetchLoading(false);
    }
  };

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
      const response = await fetch("http://localhost:5000/add_batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Batch added successfully!");
        setFormData({
          medicine_id: "",
          supplier_id: "",
          manufacturing_date: "",
          quantity_available: "",
          purchase_price: ""
        });
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        setMessage(data.error || "Failed to add batch");
      }
    } catch (error) {
      setMessage("Server error. Please try again.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <Layout>
        <div className="text-center py-8">
          <div className="text-lg">Loading medicines and suppliers...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Add Medicine Batch</h1>

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
              <label htmlFor="medicine_id" className="block text-sm font-medium text-gray-700 mb-2">
                Medicine
              </label>
              <select
                id="medicine_id"
                name="medicine_id"
                value={formData.medicine_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select medicine</option>
                {medicines.map((medicine) => (
                  <option key={medicine.medicine_id} value={medicine.medicine_id}>
                    {medicine.medicine_name} - {medicine.category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="supplier_id" className="block text-sm font-medium text-gray-700 mb-2">
                Supplier
              </label>
              <select
                id="supplier_id"
                name="supplier_id"
                value={formData.supplier_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.supplier_id} value={supplier.supplier_id}>
                    {supplier.supplier_name} - {supplier.contact_no}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="manufacturing_date" className="block text-sm font-medium text-gray-700 mb-2">
                Manufacturing Date
              </label>
              <input
                type="date"
                id="manufacturing_date"
                name="manufacturing_date"
                value={formData.manufacturing_date}
                onChange={handleChange}
                required
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="quantity_available" className="block text-sm font-medium text-gray-700 mb-2">
                Quantity Available
              </label>
              <input
                type="number"
                id="quantity_available"
                name="quantity_available"
                value={formData.quantity_available}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter quantity"
              />
            </div>

            <div>
              <label htmlFor="purchase_price" className="block text-sm font-medium text-gray-700 mb-2">
                Purchase Price per Unit (INR)
              </label>
              <input
                type="number"
                id="purchase_price"
                name="purchase_price"
                value={formData.purchase_price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter purchase price per unit"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Adding..." : "Add Batch"}
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
          <h3 className="font-semibold text-blue-900 mb-2">Batch Information:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>Select the medicine and supplier from the dropdown lists</li>
            <li>Enter the manufacturing date (cannot be future dated)</li>
            <li>Enter the available quantity in this batch</li>
            <li>Enter the purchase price per unit for tracking</li>
            <li>Each batch will be tracked individually for expiry and sales</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
