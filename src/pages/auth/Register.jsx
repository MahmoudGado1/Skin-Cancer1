import { useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";
import Logo from "../../assets/logo/logo.png";
import { toast } from "react-toastify";
import { CheckCircle2Icon, AlertCircle } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    personal_photo: null,
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone) {
        toast.error("Please fill in all fields.");
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = (e) => {
    e.preventDefault();
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone || 
        !formData.date_of_birth || !formData.gender || !formData.password) {
      toast.error("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) formDataToSend.append(key, formData[key]);
      });

      const response = await axios.post(
        "http://127.0.0.1:8000/api/register/doctor/",
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 201) {
        toast.success("Registration successful!", {
          style: { color: "#0d6efd"},
          icon: <CheckCircle2Icon />,
          autoClose: 5000,
          progressStyle: { background: "linear-gradient(to right, #87CEEB, #0d6efd)", height: "4px" },
          hideProgressBar: false,
          pauseOnHover: true,
          draggable: true,
        });
        navigate("/login");
      }
    } catch (error) {
      console.error("Error:", error);

      if (!error.response) {
        toast.error("Network error! Please check your connection.");
      } else if (error.response.status === 400) {
        const errorData = error.response.data;

        // Handling the "doctor with this email already exists." error
        if (errorData.email && errorData.email.includes("doctor with this email already exists.")) {
          toast.error("doctor with this email already exists.", {
            icon: <AlertCircle color="red" />,
          });
        } else {
          // General error handling for other validation messages
          const errorMessage = Object.values(errorData).flat().join(" ");
          toast.error(errorMessage || "Invalid input. Please check your details.");
        }
      } else if (error.response.status === 500) {
        toast.error("Server error! Please try again later.");
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
            {loading && (
        <div className="loading-overlay">
          <Spinner animation="border" variant="primary" />
          <p>Registering...</p>
        </div>
      )}
      <div className="left-section">
        <Link to={"/"}>
          <img src={Logo} alt="medical" />
        </Link>
        <div>
          <h1>Create Your Account</h1>
          <p>Sign up to get access to exclusive features and updates.</p>
        </div>
      </div>

      <div className="right-section">
        <Link className="a1" to={"/"}>
          <img src={Logo} alt="medical" />
        </Link>
        <div className="register-container">
          <h2>Sign Up</h2>
          <p>Please Register To Continue</p>
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <>
                <input
                  type="text"
                  name="first_name"
                  placeholder="First Name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <input
                  type="text"
                  name="last_name"
                  placeholder="Last Name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <input
                  type="number"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </>
            )}

            {step === 2 && (
              <>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <select name="gender" value={formData.gender} onChange={handleInputChange} disabled={loading}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </>
            )}

            <div className="link-container">
              <p>Already Registered?</p>
              <Link to={"/login"}>Login Now</Link>
            </div>
            <div className="button-container">
              {step > 1 && (
                <Button type="button" variant="outline-primary" className="me-3 w-100" onClick={handleBack} disabled={loading}>
                  Back
                </Button>
              )}
              {step < 2 ? (
                <Button type="button" variant="primary" className="w-100" onClick={handleNext} disabled={loading}>
                  Next
                </Button>
              ) : (
                <Button type="submit" className="w-100" variant="primary" disabled={loading}>
                  {loading ? "Registering..." : "Submit"}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
