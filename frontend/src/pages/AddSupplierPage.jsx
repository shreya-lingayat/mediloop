import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function AddSupplierPage() {
  const [formData, setFormData] = useState({
    supplier_name: "",
    contact_no: "",
    license_no: "",
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
      const res = await fetch("http://localhost:5000/add_supplier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ text: "Supplier added successfully.", type: "success" });
        setFormData({ supplier_name: "", contact_no: "", license_no: "" });
        setTimeout(() => navigate("/dashboard"), 1800);
      } else {
        setMessage({ text: data.error || "Failed to add supplier.", type: "error" });
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
  };

  return (
    <Layout>
      <div className="max-w-lg">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-800">Add Supplier</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Register a new medicine supplier
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-xl p-6 space-y-5"
        >
          {message.text && (
            <div className={`text-sm px-3.5 py-2.5 rounded-lg ${alertClass[message.type]}`}>
              {message.text}
            </div>
          )}

          <div>
            <label htmlFor="supplier_name" className="label-base">
              Supplier Name <span className="text-red-500">*</span>
            </label>
            <input
              id="supplier_name"
              name="supplier_name"
              value={formData.supplier_name}
              onChange={handleChange}
              required
              placeholder="e.g. Cipla Ltd."
              className="input-base"
            />
          </div>

          <div>
            <label htmlFor="contact_no" className="label-base">
              Contact Number <span className="text-red-500">*</span>
            </label>
            <input
              id="contact_no"
              type="tel"
              name="contact_no"
              value={formData.contact_no}
              onChange={handleChange}
              required
              pattern="[0-9]{10}"
              placeholder="10-digit number"
              className="input-base"
            />
          </div>

          <div>
            <label htmlFor="license_no" className="label-base">
              Drug License Number <span className="text-red-500">*</span>
            </label>
            <input
              id="license_no"
              name="license_no"
              value={formData.license_no}
              onChange={handleChange}
              required
              placeholder="e.g. DL-MH-20-123456"
              className="input-base"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? "Adding…" : "Add Supplier"}
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

        <div className="mt-4 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 space-y-1">
          <p className="font-semibold text-blue-800 mb-1">Note</p>
          <p>The drug license number is mandatory for regulatory compliance.</p>
          <p>Supplier details are linked to all batch records for traceability.</p>
        </div>
      </div>
    </Layout>
  );
}
