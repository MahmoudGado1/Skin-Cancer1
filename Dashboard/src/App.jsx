/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Sidebar from "./components/Sidebar";
import "./App.css";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import AddNewDoctor from "./components/AddNewDoctor";
import Doctors from "./components/Doctors";
import AddNewAdmin from "./components/AddNewAdmin";


import "react-toastify/dist/ReactToastify.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import DoctorPatients from "./components/DoctorsPatient";

// ✅ Protected Route Component
const ProtectedRoute = ({ element }) => {
  const token = localStorage.getItem("authToken");
  return token ? element : <Navigate to="/login" />;
};

const App = () => {
  return (
    <>
      <Router>
        <Sidebar />
        <Routes>
          <Route path="/" element={<ProtectedRoute element={<Dashboard />} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/doctor/addnew" element={<ProtectedRoute element={<AddNewDoctor />} />} />
          <Route path="/admin/addnew" element={<ProtectedRoute element={<AddNewAdmin />} />} />
          <Route path="/doctors" element={<ProtectedRoute element={<Doctors />} />} />

          {/* ✅ المسارات الجديدة */}
          <Route path="/:doctorId/patients" element={<ProtectedRoute element={<DoctorPatients />} />} />
        </Routes>
        <ToastContainer position="top-center" />
      </Router>
    </>
  );
};

export default App;
