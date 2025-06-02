import { useState } from "react";
import { Button, Spinner } from "react-bootstrap"; // ✅ Import Spinner
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";
import Logo from "../../assets/logo/logo.png";
import { toast } from "react-toastify";
import { CheckCircle2Icon, AlertCircle } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Loading state

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Email and Password are required.", {
        position: "top-center",
        icon: <AlertCircle color="red" />,
      });
      return;
    }

    setLoading(true); // ✅ Show loading overlay

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login/", {
        email,
        password,
      });

      if (response.status === 200 && response.data.token) {
        const { token, role } = response.data;

        if (role !== "doctor") {
          toast.error("Only doctors can log in.", {
            position: "top-center",
            icon: <AlertCircle color="red" />,
          });
          setLoading(false);
          return;
        }

        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("userId", response.data.id);

        toast.success("Login successful!", {
          position: "top-right",
          style: { color: "#0d6efd", marginTop: "70px" },
          icon: <CheckCircle2Icon />,
          autoClose: 5000,
          progressStyle: { background: "linear-gradient(to right, #87CEEB, #0d6efd)", height: "4px" },
        });

        setTimeout(() => {
          navigate("/");
        }); // Small delay before redirecting
      } else {
        toast.error("Invalid credentials. Please try again.", {
          icon: <AlertCircle color="red" />,
        });
      }
    } catch (error) {
      const errorMsg =
        error.response?.status === 400
          ? "Invalid email or password."
          : error.response?.status === 500
          ? "Server error. Please try again later."
          : "An unexpected error occurred.";
      toast.error(errorMsg, { icon: <AlertCircle color="red" /> });
    } finally {
      setLoading(false); // ✅ Hide loading overlay
    }
  };

  return (
    <div className="page-container">
      {/* ✅ Full-page Loading Overlay */}
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
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="link-container">
              <p>Not Registered?</p>
              <Link to={"/register"}>Register Now</Link>
            </div>
            <div className="button-container">
              <Button type="submit" className="w-100" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
