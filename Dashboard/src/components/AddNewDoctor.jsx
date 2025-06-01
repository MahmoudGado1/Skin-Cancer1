import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Logo from "../assets/logo/logo.png";
import { PiCaretCircleUpDuotone } from "react-icons/pi";

const API_URL = "http://127.0.0.1:8000/api/register/doctor/";
const DEFAULT_IMAGE = "/docHolder.jpg"; // Ensure this is in the `public` folder

const AddNewDoctor = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [docAvatar, setDocAvatar] = useState(null);
  const [docAvatarPreview, setDocAvatarPreview] = useState("");
  const [loading, setLoading] = useState(false); // Loading state

  const CSRF_TOKEN = localStorage.getItem("csrfToken") || "fallback-token"; // Use stored CSRF token

  // ✅ Handle Image Upload Preview
  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setDocAvatarPreview(reader.result);
        setDocAvatar(file);
      };
    }
  };

  // ✅ Submit Form & Make API Request
  const handleAddNewDoctor = async (e) => {
    e.preventDefault();
    setLoading(true);

    // ✅ Validate input fields
    if (!firstName || !lastName || !email || !phone || !dateOfBirth || !gender || !password) {
      toast.error("All fields are required!");
      setLoading(false);
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Invalid email format!");
      setLoading(false);
      return;
    }

    if (phone.length < 10) {
      toast.error("Phone number must be at least 10 digits!");
      setLoading(false);
      return;
    }

    // ✅ Prepare FormData for file upload
    const formData = new FormData();
    formData.append("email", email);
    formData.append("first_name", firstName);
    formData.append("last_name", lastName);
    formData.append("phone", phone);
    formData.append("date_of_birth", dateOfBirth);
    formData.append("gender", gender);
    formData.append("password", password);
    if (docAvatar) formData.append("personal_photo", docAvatar);

    try {
      const response = await axios.post(API_URL, formData, {
        headers: {
          "X-CSRFTOKEN": CSRF_TOKEN,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Doctor registered successfully!", {
        position: "top-center",
        style: { color: "#0d6efd" },
        progressStyle: {
          background: "linear-gradient(to right, #87CEEB, #0d6efd)",
          height: "4px",
        },
        icon: <PiCaretCircleUpDuotone />,
        autoClose: 5000,
      });

      console.log("Doctor Added:", response.data);

      // ✅ Reset form fields after successful submission
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setDateOfBirth("");
      setGender("");
      setPassword("");
      setDocAvatar(null);
      setDocAvatarPreview("");
    } catch (error) {
      console.error("Error Registering Doctor:", error);

      if (error.response) {
        // ✅ Handle server validation errors
        const { status, data } = error.response;
        if (status === 400 && data) {
          Object.keys(data).forEach((field) => {
            toast.error(`${field}: ${data[field][0]}`);
          });
        } else {
          toast.error("Failed to register doctor. Please try again.");
        }
      } else {
        // ✅ Handle network or unknown errors
        toast.error("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="page">
        <div className="loading">Loading...</div>
      </section>
    );
  }

  return (
    <section className="page">
      <section className="container add-doctor-form">
        <img src={Logo} alt="logo" className="logo" />
        <h1 className="form-title">REGISTER A NEW DOCTOR</h1>
        <form onSubmit={handleAddNewDoctor}>
          <div className="first-wrapper">
            <div>
              <img
                src={docAvatarPreview || DEFAULT_IMAGE}
                alt="Doctor Avatar"
              />
              <input type="file" accept="image/*" onChange={handleAvatar} />
            </div>
            <div>
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="tel"
                placeholder="Mobile Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <input
                type="date"
                placeholder="Date of Birth"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
              />
              <select value={gender} onChange={(e) => setGender(e.target.value)} required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? "Registering..." : "Register New Doctor"}
              </button>
            </div>
          </div>
        </form>
      </section>
    </section>
  );
};

export default AddNewDoctor;
