import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function AddMedicinePage() {
  const [formData, setFormData] = useState({
    medicine_name: "",
    category: "",
    unit_price: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch("http://localhost:5000/add_medicine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ text: "Medicine added successfully.", type: "success" });
        setFormData({ medicine_name: "", category: "", unit_price: "" });
        setTimeout(() => navigate("/dashboard"), 1800);
      } else if (res.status === 409) {
        setMessage({ text: data.error || "Medicine already exists. Redirecting to Add Batch…", type: "info" });
        setTimeout(() => navigate("/add-batch"), 2000);
      } else {
        setMessage({ text: data.error || "Failed to add medicine.", type: "error" });
      }
    } catch {
      setMessage({ text: "Server error. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const alertClass = {
    success: "bg-emerald-50 border border-emerald-200 text-emerald-700",
    error: "bg-red-50 border border-red-200 text-red-700",
    info: "bg-blue-50 border border-blue-200 text-blue-700",
  };

  return (
    <Layout>
      <div className="max-w-lg">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-800">Add Medicine</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Register a new medicine to the inventory
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-xl p-6 space-y-5"
        >
          {/* Feedback */}
          {message.text && (
            <div className={`text-sm px-3.5 py-2.5 rounded-lg ${alertClass[message.type]}`}>
              {message.text}
            </div>
          )}

          {/* Medicine Name */}
          <div>
            <label htmlFor="medicine_name" className="label-base">
              Medicine Name <span className="text-red-500">*</span>
            </label>
            <input
              id="medicine_name"
              name="medicine_name"
              value={formData.medicine_name}
              onChange={handleChange}
              required
              placeholder="e.g. Paracetamol 500mg"
              className="input-base"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="label-base">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="input-base"
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

          {/* Unit Price */}
          <div>
            <label htmlFor="unit_price" className="label-base">
              Unit Price (₹) <span className="text-red-500">*</span>
            </label>
            <input
              id="unit_price"
              type="number"
              name="unit_price"
              value={formData.unit_price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              className="input-base"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? "Adding…" : "Add Medicine"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="btn-outline flex-1"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Hint */}
        <div className="mt-4 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 space-y-1">
          <p className="font-semibold text-blue-800 mb-1">Instructions</p>
          <p>Enter the medicine name exactly as it appears on the packaging.</p>
          <p>After adding a medicine, proceed to <strong>Add Batch</strong> to add stock.</p>
        </div>
      </div>
    </Layout>
  );
}
