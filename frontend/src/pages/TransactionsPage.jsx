import { useEffect, useState } from "react";
import Layout from "../components/Layout";

export default function TransactionsPage() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/get_transactions")
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = data.filter((t) =>
    (t.patient_name || "")
      .toLowerCase()
      .includes(search.toLowerCase()) ||
    (t.transaction_id || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Transactions
          </h1>
          <p className="text-sm text-gray-500">
            View all billing records and payments
          </p>
        </div>

        {/* Search */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <input
            placeholder="Search by Patient Name or Transaction ID..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-sm text-gray-500">Loading transactions...</div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-6">
            No transactions found
          </div>
        )}

        {/* Cards (better than table for your UI style) */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((t) => (
              <div
                key={t.transaction_id}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:border-gray-300 transition"
              >
                <div className="flex justify-between items-center">

                  {/* LEFT */}
                  <div>
                    <p className="font-medium text-gray-800">
                      {t.patient_name}
                    </p>

                    <p className="text-xs text-gray-400">
                      Transaction recorded
                    </p>

                    <p className="text-xs text-gray-400">
                      {t.transaction_date
                        ? new Date(t.transaction_date).toLocaleDateString()
                        : ""}
                    </p>
                  </div>

                  {/* RIGHT */}
                  <div className="text-right">
                    <p className="text-lg font-semibold text-green-600">
                      ₹ {t.total_amount}
                    </p>

                    {t.credits_used !== undefined && (
                      <p className="text-xs text-emerald-600">
                        Credits used: ₹ {t.credits_used}
                      </p>
                    )}

                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                      {t.status || "Completed"}
                    </span>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}