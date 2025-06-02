/* eslint-disable react/prop-types */
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ element }) => {
  const isAuthenticated = localStorage.getItem("token"); // Check if user is logged in

  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

export default PrivateRoute;
