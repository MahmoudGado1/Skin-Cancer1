import { useState } from "react";
import axios from "axios";
import { Button, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import Logo from "../assets/logo/logo.png";
import { toast } from "react-toastify";
import { PiCaretCircleUpDuotone } from "react-icons/pi";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
  
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }
    
    setLoading(true); // Start loading
  
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/login/",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );
  
      if (response.status === 200) {
        const { token, role } = response.data; // Ensure backend sends role
  
        if (role !== "admin") {
          toast.error("Access denied. Admins only.");
          setLoading(false);
          return;
        }
  
        localStorage.setItem("authToken", token);
        localStorage.setItem("userRole", role);
  
        toast.success("Admin login successful!", {
          position: "top-center",
          style: { color: "#0d6efd" },
          progressStyle: {
            background: "linear-gradient(to right, #87CEEB, #0d6efd)",
            height: "4px",
          },
          icon: <PiCaretCircleUpDuotone />,
          autoClose: 5000,
        });
  
        navigate("/"); // Redirect admin to dashboard
      }
    } catch (error) {
      console.error("Login error:", error);
  
      if (error.response) {
        toast.error(error.response.data.error || "Invalid email or password.");
      } else if (error.request) {
        toast.error("Network error. Please try again.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false); // Stop loading after request completes
    }
  };

  return (
    <div className="page-container">
      {/* Fullscreen Loading Spinner */}
      {loading && (
        <div className="loading-overlay">
          <Spinner animation="border" variant="primary" />
          <p>Logging in...</p>
        </div>
      )}

      {/* Left Section */}
      <div className="left-section">
        <Link to={"/"}>
          <img src={Logo} alt="medical" />
        </Link>
        <div>
          <h1>Welcome Back!</h1>
          <p>Log in to access your account and explore more features.</p>
        </div>
      </div>

      {/* Right Section */}
      <div className="right-section">
        <Link className="a1" to={"/"}>
          <img src={Logo} alt="medical" />
        </Link>
        <div className="login-container">
          <h2>Sign In</h2>
          <p>Please Login To Continue</p>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <div className="button-container">
              <Button type="submit" className="w-100" disabled={loading}>
                Login
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
