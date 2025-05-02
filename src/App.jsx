import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import MedicationsPage from "./pages/MedicationsPage";
import PrivateRoute from "./routes/PrivateRoute";
import ManageMedicationsPage from "./pages/ManageMedicationsPage";
import SalesPage from "./pages/SalesPage";
import SalesHistoryPage from "./pages/SalesHistoryPage";
import ManageClientsPage from "./pages/ManageClientsPage";
import ManageUsersPage from "./pages/ManageUsersPage";
import ManagePrescriptionsPage from "./pages/ManagePrescriptionsPage";
import Navbar from "./components/Navbar";
import PrescriptionListPage from "./pages/PrescriptionListPage";
function App() {
  return (
    <div className="min-h-screen bg-gray-100">
       <Navbar /> 
      <Routes>
        {/* Вхід */}
        <Route path="/login" element={<LoginPage />} />

        {/* Медикаменти - захищений маршрут */}
        <Route
  path="/medications"
  element={
    <PrivateRoute allowedRoles={["USER", "PHARMACIST", "ADMIN","DOCTOR"]}>
      <MedicationsPage />
    </PrivateRoute>
  }
/>

<Route
  path="/manage-medications"
  element={
    <PrivateRoute allowedRoles={["PHARMACIST", "ADMIN"]}>
      <ManageMedicationsPage />
    </PrivateRoute>
  }
/>

<Route
  path="/sales/history"
  element={
    <PrivateRoute allowedRoles={["PHARMACIST", "ADMIN"]}>
      <SalesHistoryPage />
    </PrivateRoute>
  }
/>

<Route
  path="/sales/new"
  element={
    <PrivateRoute allowedRoles={["PHARMACIST"]}>
      <SalesPage />
    </PrivateRoute>
  }
/>
<Route
  path="/clients/manage"
  element={
    <PrivateRoute allowedRoles={["PHARMACIST", "ADMIN"]}>
      <ManageClientsPage />
    </PrivateRoute>
  }
/>

<Route
  path="/users/manage"
  element={
    <PrivateRoute allowedRoles={["ADMIN"]}>
      <ManageUsersPage />
    </PrivateRoute>
  }
/>


<Route
  path="/prescriptions/all"
  element={
    <PrivateRoute allowedRoles={["PHARMACIST", "ADMIN"]}>
      <PrescriptionListPage />
    </PrivateRoute>
  }
/>

<Route
  path="/prescriptions"
  element={
    <PrivateRoute allowedRoles={["DOCTOR"]}>
      <ManagePrescriptionsPage />
    </PrivateRoute>
  }
/>
        {/* Дефолтний редірект якщо шлях не знайдено */}
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </div>
  );
}

export default App;
