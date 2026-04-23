import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import AddPatientPage from "./pages/AddPatientPage";
import ViewPatientsPage from "./pages/ViewPatientsPage";
import SellMedicinePage from "./pages/SellMedicinePage";
import TransactionsPage from "./pages/TransactionsPage";
import AlertsPage from "./pages/AlertsPage";
import AddMedicinePage from "./pages/AddMedicinePage";
import AddSupplierPage from "./pages/AddSupplierPage";
import AddBatchPage from "./pages/AddBatchPage";
import CreditManagementPage from "./pages/CreditManagementPage";
import MedicineReturnPage from "./pages/MedicineReturnPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-patient" element={<AddPatientPage />} />
        <Route path="/patients" element={<ViewPatientsPage />} />
        <Route path="/sell" element={<SellMedicinePage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/add-medicine" element={<AddMedicinePage />} />
        <Route path="/add-supplier" element={<AddSupplierPage />} />
        <Route path="/add-batch" element={<AddBatchPage />} />
        <Route path="/credits" element={<CreditManagementPage />} />
        <Route path="/medicine-return" element={<MedicineReturnPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;