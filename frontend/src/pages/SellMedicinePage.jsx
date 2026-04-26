
import { useState, useEffect } from "react";
import Layout from "../components/Layout";

export default function SellMedicinePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState("");
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [quantity, setQuantity] = useState("");
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [useCredits, setUseCredits] = useState(true);

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setPatients([]);
      return;
    }
    
    const timeoutId = setTimeout(() => {
      searchPatients(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    if (selectedMedicine) {
      fetchBatches(selectedMedicine);
    } else {
      setBatches([]);
      setSelectedBatch("");
    }
  }, [selectedMedicine]);

  const fetchMedicines = async () => {
    try {
      const response = await fetch("http://localhost:5000/get_medicines");
      const data = await response.json();
      setMedicines(data);
    } catch (error) {
      console.error("Error fetching medicines:", error);
    }
  };

  const searchPatients = async (term) => {
    if (term.trim() === "") {
      setPatients([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/search_patient?name=${encodeURIComponent(term)}`);
      const data = await response.json();
      console.log("search_patient response:", data);
      setPatients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error searching patients:", error);
      setPatients([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const fetchBatches = async (medicineId) => {
    try {
      const response = await fetch(`http://localhost:5000/get_batches/${medicineId}`);
      const data = await response.json();
      setBatches(data);
    } catch (error) {
      console.error("Error fetching batches:", error);
      setBatches([]);
    }
  };

  const selectPatient = (patient) => {
    setSelectedPatient(patient);
    setSearchTerm(patient.p_name);
    setPatients([]);
  };

  const addToCart = () => {
    if (!selectedPatient) {
      setMessage("Please select a patient first");
      return;
    }

    if (!selectedBatch || !quantity || quantity <= 0) {
      setMessage("Please select medicine, batch and enter valid quantity");
      return;
    }

    const batch = batches.find(b => b.batch_id === selectedBatch);
    if (!batch) {
      setMessage("Invalid batch selected");
      return;
    }

    if (quantity > batch.quantity_available) {
      setMessage(`Only ${batch.quantity_available} units available in this batch`);
      return;
    }

    const unitPrice = batch.purchase_price * 1.2; // Add 20% margin
    const subAmount = quantity * unitPrice;

    const existingItemIndex = cart.findIndex(item => item.batch_id === selectedBatch);
    
    if (existingItemIndex >= 0) {
      const updatedCart = [...cart];
      const newQuantity = updatedCart[existingItemIndex].quantity + parseInt(quantity);
      
      if (newQuantity > batch.quantity_available) {
        setMessage(`Cannot exceed available quantity of ${batch.quantity_available}`);
        return;
      }
      
      updatedCart[existingItemIndex].quantity = newQuantity;
      updatedCart[existingItemIndex].sub_amount = newQuantity * unitPrice;
      setCart(updatedCart);
    } else {
      setCart([...cart, {
        batch_id: selectedBatch,
        quantity: parseInt(quantity),
        sub_amount: subAmount,
        medicine_name: medicines.find(m => m.medicine_id === selectedMedicine)?.medicine_name,
        batch_info: batch
      }]);
    }

    setSelectedBatch("");
    setQuantity("");
    setMessage("");
  };

  const removeFromCart = (batchId) => {
    setCart(cart.filter(item => item.batch_id !== batchId));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + item.sub_amount, 0);
  };

  const confirmSale = async () => {
    if (!selectedPatient) {
      setMessage("Please select a patient");
      return;
    }

    if (cart.length === 0) {
      setMessage("Cart is empty");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/confirm_sale", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient_id: selectedPatient.patient_id,
          use_credits: useCredits,
          cart: cart.map(item => ({
            batch_id: item.batch_id,
            quantity: item.quantity,
            sub_amount: item.sub_amount
          }))
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(
          `Sale completed. Used credits: INR ${(data.credits_used || 0).toFixed(2)} | Remaining credits: INR ${(data.remaining_credits || 0).toFixed(2)} | Final bill: INR ${(data.final_amount || 0).toFixed(2)}`
        );
        setCart([]);
        setSelectedPatient(null);
        setSearchTerm("");
        setSelectedMedicine("");
        setBatches([]);
        
        // Refresh batches for current medicine
        if (selectedMedicine) {
          fetchBatches(selectedMedicine);
        }
      } else {
        setMessage(data.error || "Failed to complete sale");
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
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Sell Medicine</h1>

        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.includes("success") 
              ? "bg-green-100 text-green-700 border border-green-400" 
              : "bg-red-100 text-red-700 border border-red-400"
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Patient and Medicine Selection */}
          <div className="space-y-6">
            {/* Patient Selection */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-lg font-semibold mb-4">Select Patient</h2>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search patient by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                {searchLoading && (
                  <div className="absolute right-3 top-2.5">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
                  </div>
                )}
              </div>

              {selectedPatient && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="font-medium text-green-900">Selected: {selectedPatient.p_name}</p>
                  <p className="text-sm text-green-700">Available credits: INR {Number(selectedPatient.total_credits || 0).toFixed(2)}</p>
                </div>
              )}

              {patients.length > 0 && (
                <div className="mt-3 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                  {patients.map((patient) => (
                    <div
  key={patient.patient_id}
  onClick={() => selectPatient(patient)}
  className="p-2 hover:bg-gray-50 cursor-pointer border-b"
>
  <p className="font-medium">{patient.p_name}</p>
  <p className="text-sm text-gray-500">
    {patient.contact_no || "No phone"}
  </p>
</div>
                  ))}
                </div>
              )}
            </div>

            {/* Medicine Selection */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-lg font-semibold mb-4">Select Medicine</h2>
              
              <select
                value={selectedMedicine}
                onChange={(e) => setSelectedMedicine(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Select medicine</option>
                {medicines.map((medicine) => (
                  <option key={medicine.medicine_id} value={medicine.medicine_id}>
                    {medicine.medicine_name} - {medicine.category}
                  </option>
                ))}
              </select>

              {selectedMedicine && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Batch
                  </label>
                  <select
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">Select batch</option>
                    {batches.map((batch) => (
                      <option key={batch.batch_id} value={batch.batch_id}>
                        Stock {batch.quantity_available} units available
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedBatch && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter quantity"
                  />
                </div>
              )}

              <button
                onClick={addToCart}
                disabled={!selectedBatch || !quantity}
                className="mt-4 w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Add to Cart
              </button>
            </div>
          </div>

          {/* Right Column - Cart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-lg font-semibold mb-4">Shopping Cart</h2>
            
            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p>Cart is empty</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.medicine_name}</h4>
                        <p className="text-sm text-gray-500">Batch linked</p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity} × INR {(item.sub_amount / item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.batch_id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-right font-semibold text-green-600">
                      INR {item.sub_amount.toFixed(2)}
                    </p>
                  </div>
                ))}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-xl font-bold text-green-600">
                      INR {getTotalAmount().toFixed(2)}
                    </span>
                  </div>
                  <label className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                    <input type="checkbox" checked={useCredits} onChange={(e) => setUseCredits(e.target.checked)} />
                    Use patient credits
                  </label>
                </div>

                <button
                  onClick={confirmSale}
                  disabled={loading || cart.length === 0}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mt-4"
                >
                  {loading ? "Processing..." : "Confirm Sale"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}