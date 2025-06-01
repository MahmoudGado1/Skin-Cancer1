import { useState, useEffect } from "react";
import axios from "axios";

const Dashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [doctorsPerPage] = useState(5);
  const DEFAULT_IMAGE = "/docHolder.jpg"; // Make sure it's in the public folder

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem("authToken");

        const response = await axios.get("http://127.0.0.1:8000/api/get-all-doctors/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        setDoctors(response.data.doctors || []);
        setFilteredDoctors(response.data.doctors || []);
      } catch (err) {
        console.error("Error fetching doctors:", err);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    const query = searchId.trim().toLowerCase();
    const result = doctors.filter((doc) => {
      return (
        doc.id.toString().includes(query) ||
        `${doc.first_name} ${doc.last_name}`.toLowerCase().includes(query) ||
        doc.email.toLowerCase().includes(query) ||
        doc.phone.includes(query) ||
        (doc.gender && doc.gender.toLowerCase().includes(query))
      );
    });

    setFilteredDoctors(result);
    setCurrentPage(1);
  }, [searchId, doctors]);

  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstDoctor, indexOfLastDoctor);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);

  const handleViewPatients = (doctorId) => {
    setLoading(true);
    setTimeout(() => {
      window.location.href = `/${doctorId}/patients`;
    }, 500); // Optional delay to allow spinner to show
  };

  return (
    <section className="page">
      <div className="admin-container">
        <h2>Admin Dashboard</h2>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search by ID, name, email, phone, gender..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Photo</th>
                <th>Name Doctor</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Gender</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentDoctors.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    No doctors found.
                  </td>
                </tr>
              ) : (
                currentDoctors.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.id}</td>
                    <td>
                      <img
                        src={doc.personal_photo ? `http://127.0.0.1:8000${doc.personal_photo}` : DEFAULT_IMAGE}
                        alt="Doctor"
                        width="60"
                        height="60"
                        style={{ borderRadius: "50%", objectFit: "cover" }}
                      />
                    </td>
                    <td>{doc.first_name} {doc.last_name}</td>
                    <td>{doc.email}</td>
                    <td>{doc.phone}</td>
                    <td>{doc.gender}</td>
                    <td>
                      <button className="view-btn" onClick={() => handleViewPatients(doc.id)}>
                        View Patients
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => paginate(index + 1)}
              className={`page-btn ${currentPage === index + 1 ? "active" : ""}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <p>Loading patients...</p>
        </div>
      )}
    </section>
  );
};

export default Dashboard;
