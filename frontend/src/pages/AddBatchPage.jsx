import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Search } from "lucide-react";

export default function AddBatchPage() {
  const [formData, setFormData] = useState({
    medicine_id: "",
    supplier_id: "",
    manufacturing_date: "",
    expiry_date: "",
    quantity_available: "",
    purchase_price: "",
  });

  const [medicineSearch, setMedicineSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedMedicineName, setSelectedMedicineName] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/get_suppliers")
      .then((r) => r.json())
      .then(setSuppliers)
      .catch(() => setMessage({ text: "Failed to load suppliers.", type: "error" }))
      .finally(() => setFetchLoading(false));
  }, []);

  useEffect(() => {
    if (!medicineSearch.trim()) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`http://localhost:5000/search_medicine?q=${encodeURIComponent(medicineSearch)}`);
        const d = await r.json();
        setSearchResults(d);
        setShowDropdown(true);
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [medicineSearch]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch("http://localhost:5000/add_batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ text: "Batch added successfully.", type: "success" });
        setFormData({
          medicine_id: "",
          supplier_id: "",
          manufacturing_date: "",
          expiry_date: "",
          quantity_available: "",
          purchase_price: "",
        });
        setMedicineSearch("");
        setSelectedMedicineName("");
        setTimeout(() => navigate("/dashboard"), 1800);
      } else {
        setMessage({ text: data.error || "Failed to add batch.", type: "error" });
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

  if (fetchLoading) {
    return (
      <Layout>
        <div className="text-center py-12 text-sm text-gray-400">
          Loading data…
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-lg">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-800">Add Batch</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Add a new stock batch for an existing medicine
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

          {/* Medicine Search */}
          <div>
            <label className="label-base">
              Medicine <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Type to search medicine…"
                value={selectedMedicineName || medicineSearch}
                onChange={(e) => {
                  setMedicineSearch(e.target.value);
                  setSelectedMedicineName("");
                  setFormData({ ...formData, medicine_id: "" });
                }}
                onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                className="input-base pl-9"
                required
              />
              {showDropdown && searchResults.length > 0 && (
                <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl overflow-hidden">
                  {searchResults.map((med) => (
                    <li
                      key={med.medicine_id}
                      className="px-4 py-2.5 text-sm hover:bg-blue-50 cursor-pointer text-gray-700 border-b border-gray-100 last:border-0"
                      onClick={() => {
                        setFormData({ ...formData, medicine_id: med.medicine_id });
                        setSelectedMedicineName(`${med.medicine_name} (${med.category})`);
                        setShowDropdown(false);
                        setMedicineSearch("");
                      }}
                    >
                      <span className="font-medium">{med.medicine_name}</span>
                      <span className="text-gray-400 ml-2 text-xs">{med.category}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Supplier */}
          <div>
            <label htmlFor="supplier_id" className="label-base">
              Supplier <span className="text-red-500">*</span>
            </label>
            <select
              id="supplier_id"
              name="supplier_id"
              value={formData.supplier_id}
              onChange={handleChange}
              required
              className="input-base"
            >
              <option value="">Select supplier</option>
              {suppliers.map((s) => (
                <option key={s.supplier_id} value={s.supplier_id}>
                  {s.supplier_name} — {s.contact_no}
                </option>
              ))}
            </select>
          </div>

          {/* Dates side-by-side */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="manufacturing_date" className="label-base">
                Mfg. Date <span className="text-red-500">*</span>
              </label>
              <input
                id="manufacturing_date"
                type="date"
                name="manufacturing_date"
                value={formData.manufacturing_date}
                onChange={handleChange}
                required
                max={new Date().toISOString().split("T")[0]}
                className="input-base"
              />
            </div>
            <div>
              <label htmlFor="expiry_date" className="label-base">
                Expiry Date <span className="text-red-500">*</span>
              </label>
              <input
                id="expiry_date"
                type="date"
                name="expiry_date"
                value={formData.expiry_date}
                onChange={handleChange}
                required
                min={new Date().toISOString().split("T")[0]}
                className="input-base"
              />
            </div>
          </div>

          {/* Qty + Price side-by-side */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity_available" className="label-base">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                id="quantity_available"
                type="number"
                name="quantity_available"
                value={formData.quantity_available}
                onChange={handleChange}
                required
                min="1"
                placeholder="e.g. 100"
                className="input-base"
              />
            </div>
            <div>
              <label htmlFor="purchase_price" className="label-base">
                Purchase Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                id="purchase_price"
                type="number"
                name="purchase_price"
                value={formData.purchase_price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                className="input-base"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? "Adding…" : "Add Batch"}
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
          <p className="font-semibold text-blue-800 mb-1">Instructions</p>
          <p>Manufacturing date cannot be in the future; expiry date cannot be in the past.</p>
          <p>Each batch is tracked individually for sales and expiry monitoring.</p>
        </div>
      </div>
    </Layout>
  );
}
