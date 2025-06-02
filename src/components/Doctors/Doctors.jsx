import { useEffect, useState } from "react";
import axios from "axios";
import "./Doctors.css";
import { FaEnvelope } from "react-icons/fa";
import { FaSquareWhatsapp } from "react-icons/fa6";
import { Link } from "react-router-dom";
import docImg from "../../assets/docHolder.jpg";
const BASE_URL = "http://127.0.0.1:8000"; // ✅ Backend base URL for images

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem("token"); // Retrieve token from localStorage
        const response = await axios.get("http://127.0.0.1:8000/api/get-all-doctors/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        setDoctors(response.data.doctors || []);
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError("Failed to fetch doctors. Please try again.");
      }
    };

    fetchDoctors();
  }, []);

  return (
    <div className="doctors container">
      <div className="header-line">
        <span className="line"></span>
        <span className="text">Our Doctors</span>
      </div>
      <h1>Meet Our Doctors</h1>

      {error && <p className="error-message">{error}</p>}

      <div className="cards">
        {doctors.length > 0 ? (
          doctors.map((doctor) => (
            <div key={doctor.id} className="card doctor-card">
            <img
              src={doctor.personal_photo ? `${BASE_URL}${doctor.personal_photo}` : docImg}
              alt="Doctor avatar"
              onError={(e) => (e.target.src = docImg)}
            />
              <div className="card-body">
                <h5 className="card-title">Dr. {doctor.first_name} {doctor.last_name}</h5>
                <p className="card-text">📧 {doctor.email}</p>
                <p className="card-text">📞 {doctor.phone}</p>
                <div className="social-media">
                  <Link className="link" to={`https://wa.me/${doctor.phone}`}>
                    <FaSquareWhatsapp />
                  </Link>
                  <a className="link" href={`mailto:${doctor.email}`} title="Send Email">
                    <FaEnvelope />
                  </a>
                </div>

              </div>
            </div>
          ))
        ) : (
          !error && <p>No doctors available.</p>
        )}
      </div>
    </div>
  );
};

export default Doctors;
