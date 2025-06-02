import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HomePage from "./pages/Home/Home";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import AboutPage from "./pages/About/About";
import SkinCancerPage from "./pages/SkinCancer/SkinCancer";
import Header from "./components/Header/Header";
import DoctorsPage from "./pages/Doctors/Doctors";
import Footer from "./components/Footer/Footer";
import ScrollToTop from "./components/Common/scrollatTop";
import NotFound from "./components/NotFound";
import MelanomaPage from "./pages/Melanoma/Melanoma";
import BasalCarcinomaPage from "./pages/BasalCarcinoma/BasalCarcinoma";
import MerkelCarcinomaPage from "./pages/MerkelCarcinoma/MerkelCarcinoma";
import SquamousCarcinomaPage from "./pages/SquamousCarcinoma/SquamousCarcinoma";
import PrivateRoute from "./components/Common/PrivateRoute"; // Import PrivateRoute
import DoctorPatients from "./pages/patientData/DoctorPatients";

const App = () => {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Header />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Private Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<PrivateRoute element={<AboutPage />} />} />
          <Route path="/skin-cancer" element={<PrivateRoute element={<SkinCancerPage />} />} />
          <Route path="/basal-cell-carcinoma" element={<PrivateRoute element={<BasalCarcinomaPage />} />} />
          <Route path="/squamous-cell-carcinoma" element={<PrivateRoute element={<SquamousCarcinomaPage />} />} />
          <Route path="/merkel-cell-carcinoma" element={<PrivateRoute element={<MerkelCarcinomaPage />} />} />
          <Route path="/melanoma" element={<PrivateRoute element={<MelanomaPage />} />} />
          <Route path="/doctors" element={<PrivateRoute element={<DoctorsPage />} />} />
          <Route path="*" element={<PrivateRoute element={<NotFound />} />} />
          <Route path="/doctors/:doctorId" element={<PrivateRoute element={<DoctorPatients />} />} />
        </Routes>
        <Footer />
        <ToastContainer position="top-center" />
      </Router>
    </>
  );
};

export default App;
