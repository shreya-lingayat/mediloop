import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { ArrowUpDown, Search } from "lucide-react";

export default function TransactionsPage() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All"); // All | Sold | Returned

  useEffect(() => {
    fetch("http://localhost:5000/get_transactions")
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = data.filter((t) => {
    const matchesSearch =
      (t.patient_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.id || "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || t.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <Layout>
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Transactions</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              All billing records — sales and returns
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <ArrowUpDown size={13} />
            Latest first
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              placeholder="Search by patient name or transaction ID…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {["All", "Sold", "Returned"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition ${
                  filter === tab
                    ? "bg-white text-gray-800 shadow-sm border border-gray-200"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12 text-sm text-gray-400">
            Loading transactions…
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-gray-400">
            No transactions found
          </div>
        )}

        {/* Table */}
        {!loading && filtered.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    ID
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Patient
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Type
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Amount (₹)
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Credit (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, idx) => (
                  <tr
                    key={`${t.id}-${idx}`}
                    className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors"
                  >
                    {/* ID */}
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">
                      {t.id}
                    </td>

                    {/* Patient */}
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {t.patient_name}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-gray-500">
                      {t.record_date
                        ? new Date(t.record_date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>

                    {/* Type badge */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          t.type === "Sold"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>

                    {/* Amount — show only for Sold */}
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">
                      {t.type === "Sold" ? `₹ ${t.amount.toFixed(2)}` : "—"}
                    </td>

                    {/* Credit — show only for Returned */}
                    <td className="px-4 py-3 text-right">
                      {t.type === "Returned" && t.credit_amount !== null ? (
                        <span className="font-semibold text-blue-600">
                          ₹ {t.credit_amount.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer count */}
            <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-200 text-xs text-gray-400">
              {filtered.length} record{filtered.length !== 1 ? "s" : ""}
              {filter !== "All" ? ` · ${filter}` : ""}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}