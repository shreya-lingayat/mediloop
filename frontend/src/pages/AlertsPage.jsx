import { useEffect, useState } from "react";
import Layout from "../components/Layout";

export default function AlertsPage() {
  const [expiryAlerts, setExpiryAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpiryAlerts();
  }, []);

  const fetchExpiryAlerts = async () => {
    try {
      const response = await fetch("http://localhost:5000/expiry_alert");
      const data = await response.json();
      setExpiryAlerts(data);
    } catch (error) {
      console.error("Error fetching expiry alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertColor = (daysToExpiry) => {
    if (daysToExpiry <= 0) return "bg-red-100 border-red-600 text-red-900";
    if (daysToExpiry <= 7) return "bg-orange-100 border-orange-600 text-orange-900";
    return "bg-yellow-100 border-yellow-600 text-yellow-900";
  };

  const getAlertIcon = (daysToExpiry) => {
    if (daysToExpiry <= 0) return "expired";
    if (daysToExpiry <= 7) return "critical";
    return "warning";
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-red-600">Expiry Alerts</h1>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading expiry alerts...</p>
          </div>
        )}

        {!loading && expiryAlerts.length === 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-green-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-green-900 mb-2">All Clear!</h3>
            <p className="text-green-700">No medicines are expiring in the next 30 days</p>
          </div>
        )}

        {!loading && expiryAlerts.length > 0 && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-blue-900 font-medium">
                  Found {expiryAlerts.length} batch{expiryAlerts.length > 1 ? 'es' : ''} expiring within 30 days
                </p>
              </div>
            </div>

            {expiryAlerts.map((alert) => (
              <div
                key={alert.batch_id}
                className={`border-l-4 p-6 rounded-lg shadow-md ${getAlertColor(alert.days_to_expiry)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <div className={`p-2 rounded-full mr-3 ${
                        getAlertIcon(alert.days_to_expiry) === 'expired' ? 'bg-red-200' :
                        getAlertIcon(alert.days_to_expiry) === 'critical' ? 'bg-orange-200' :
                        'bg-yellow-200'
                      }`}>
                        <svg className={`h-5 w-5 ${
                          getAlertIcon(alert.days_to_expiry) === 'expired' ? 'text-red-600' :
                          getAlertIcon(alert.days_to_expiry) === 'critical' ? 'text-orange-600' :
                          'text-yellow-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{alert.medicine_name}</h3>
                        <p className="text-sm opacity-75">Batch ID: {alert.batch_id}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-sm font-medium opacity-75">Supplier</p>
                        <p className="font-semibold">{alert.supplier_name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium opacity-75">Available Quantity</p>
                        <p className="font-semibold">{alert.quantity_available} units</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium opacity-75">Days to Expiry</p>
                        <p className={`font-bold text-lg ${
                          alert.days_to_expiry <= 0 ? 'text-red-600' :
                          alert.days_to_expiry <= 7 ? 'text-orange-600' :
                          'text-yellow-600'
                        }`}>
                          {alert.days_to_expiry <= 0 ? 'EXPIRED' : `${alert.days_to_expiry} days`}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-current border-opacity-20">
                      <p className="text-sm opacity-75">
                        Manufacturing Date: {new Date(alert.manufacturing_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm opacity-75">
                        Purchase Price: INR {alert.purchase_price} per unit
                      </p>
                    </div>
                  </div>

                  <div className="ml-4">
                    {getAlertIcon(alert.days_to_expiry) === 'expired' && (
                      <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                        EXPIRED
                      </span>
                    )}
                    {getAlertIcon(alert.days_to_expiry) === 'critical' && (
                      <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                        CRITICAL
                      </span>
                    )}
                    {getAlertIcon(alert.days_to_expiry) === 'warning' && (
                      <span className="bg-yellow-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                        WARNING
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Alert Information:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
            <div>
              <span className="font-medium text-red-600">Expired:</span> Already expired - remove immediately
            </div>
            <div>
              <span className="font-medium text-orange-600">Critical (0-7 days):</span> Expiring within a week
            </div>
            <div>
              <span className="font-medium text-yellow-600">Warning (8-30 days):</span> Expiring within a month
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

//   useEffect(() => {
//     fetch("http://localhost:5000/expiry_alerts")
//       .then(res => res.json())
//       .then(setData);
//   }, []);

//   return (
//     <Layout>
//       <h1 className="text-3xl font-bold mb-4 text-red-600">
//         Expiry Alerts
//       </h1>

//       {data.map((b) => (
//         <div key={b.batch_id} className="bg-red-100 p-4 mb-2 rounded">
//           Batch {b.batch_id} is expiring soon
//         </div>
//       ))}
//     </Layout>
//   );
// }