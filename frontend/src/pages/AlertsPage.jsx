import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { CheckCircle, AlertTriangle, Clock, Info } from "lucide-react";

export default function AlertsPage() {
  const [expiryAlerts, setExpiryAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpiryAlerts();
  }, []);

  const fetchExpiryAlerts = async () => {
    try {
      const res = await fetch("http://localhost:5000/expiry_alert");
      const data = await res.json();
      setExpiryAlerts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverity = (days) => {
    if (days <= 0) return { label: "Expired", tag: "bg-red-50 border-red-200 text-red-700", badge: "bg-red-100 text-red-700" };
    if (days <= 7) return { label: "Critical", tag: "bg-orange-50 border-orange-200 text-orange-700", badge: "bg-orange-100 text-orange-700" };
    return { label: "Warning", tag: "bg-amber-50 border-amber-200 text-amber-700", badge: "bg-amber-100 text-amber-700" };
  };

  return (
    <Layout>
      <div className="space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Expiry Alerts</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Batches expiring within the next 30 days
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12 text-sm text-gray-400">
            Loading alerts…
          </div>
        )}

        {/* All clear */}
        {!loading && expiryAlerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 bg-white border border-gray-200 rounded-xl">
            <CheckCircle size={36} strokeWidth={1.5} className="text-emerald-500 mb-3" />
            <p className="text-base font-semibold text-gray-800">All Clear</p>
            <p className="text-sm text-gray-500 mt-1">
              No medicines expiring in the next 30 days
            </p>
          </div>
        )}

        {/* Alerts */}
        {!loading && expiryAlerts.length > 0 && (
          <div className="space-y-4">
            {/* Summary banner */}
            <div className="flex items-center gap-2.5 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
              <Info size={15} strokeWidth={1.8} className="shrink-0" />
              <span>
                <strong>{expiryAlerts.length}</strong> batch{expiryAlerts.length > 1 ? "es" : ""} require attention
              </span>
            </div>

            {/* Alert table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Medicine</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Supplier</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Qty</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Expiry Date</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Days Left</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {expiryAlerts.map((alert) => {
                    const sev = getSeverity(alert.days_to_expiry);
                    return (
                      <tr
                        key={alert.batch_id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {alert.medicine_name}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{alert.supplier_name}</td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {alert.quantity_available}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {new Date(alert.expiry_date).toLocaleDateString("en-IN", {
                            day: "2-digit", month: "short", year: "numeric"
                          })}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${sev.badge}`}>
                            {alert.days_to_expiry <= 0 ? "EXPIRED" : `${alert.days_to_expiry}d`}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${sev.tag}`}>
                            {alert.days_to_expiry <= 0
                              ? <AlertTriangle size={11} />
                              : alert.days_to_expiry <= 7
                              ? <AlertTriangle size={11} />
                              : <Clock size={11} />}
                            {sev.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs text-gray-500 px-1">
              <span><strong className="text-red-600">Expired</strong> — Remove from stock immediately</span>
              <span><strong className="text-orange-600">Critical</strong> — Expiring within 7 days</span>
              <span><strong className="text-amber-600">Warning</strong> — Expiring within 30 days</span>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}