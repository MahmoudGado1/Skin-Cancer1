import { useState } from "react";
import axios from "axios";  // Import Axios
import { toast } from "react-toastify";
import { PiCaretCircleUpDuotone } from "react-icons/pi";
import Logo from "../assets/logo/logo.png";

const AddNewAdmin = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");

  const handleAddNewAdmin = async (e) => {
    e.preventDefault();
  
    // Validation: Check if all fields are filled
    if (!firstName || !lastName || !email || !phone || !password || !gender) {
      toast.error("Please fill in all fields.");
      return;
    }
  
    const adminData = {
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName,
      mobileNumber: phone,
      gender: gender,
    };
  
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/register/admin/",
        adminData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.status === 201) {
        toast.success("Admin added successfully!", {
          position: "top-right",
          style: {
            color: "#0d6efd",
            marginTop: "70px",
          },
          icon: <PiCaretCircleUpDuotone />,
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progressStyle: {
            background: "linear-gradient(to right, #87CEEB, #0d6efd)",
            height: "4px",
          },
        });
  
        // Reset form fields
        setFirstName("");
        setLastName("");
        setEmail("");
        setPhone("");
        setPassword("");
        setGender("");
      }
    } catch (error) {
      console.error("Error adding admin:", error);
  
      if (error.response) {
        console.error("Response Data:", error.response.data);
        const { data } = error.response;
  
        // Handle specific backend validation errors
        if (data.email) {
          toast.error(data.email[0]); 
        } else if (data.password) {
          toast.error(data.password[0]); 
        } else if (data.mobileNumber) {
          toast.error(data.mobileNumber[0]); 
        } else {
          toast.error(data.message || "Failed to add admin.");
        }
      } else if (error.request) {
        // Handle network issues
        toast.error("Network error. Please check your connection.");
      } else {
        // Catch-all for unknown errors
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };
  

  return (
    <section className="page">
      <section className="container form-component add-admin-form">
        <img src={Logo} alt="logo" className="logo" />
        <h1 className="form-title">ADD NEW ADMIN</h1>
        <form onSubmit={handleAddNewAdmin}>
          <div>
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="number"
              placeholder="Mobile Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div style={{ justifyContent: "center", alignItems: "center" }}>
            <button type="submit">ADD NEW ADMIN</button>
          </div>
        </form>
      </section>
    </section>
  );
};

export default AddNewAdmin;
