/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

// Modal component to display patient details
const PatientDetailModal = ({ patient, onClose }) => {
  return (
    <div className="modal-overlay1" onClick={onClose}>
      <div className="modal-content1" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          X
        </button>
        <h2>Patient Details</h2>
        <p><strong>ID:</strong> {patient.id}</p>
        <p><strong>Name:</strong> {patient.name}</p>
        <p><strong>Phone:</strong> {patient.phone}</p>
        <p><strong>Gender:</strong> {patient.gender}</p>
        <p><strong>Age:</strong> {patient.age}</p>
        <p><strong>Address:</strong> {patient.address}</p>
        <p><strong>Diagnosis Result:</strong> {patient.diagnosis_result}</p>
        <p><strong>Diagnosis Probability:</strong> {patient.diagnosis_probability.toFixed(2)*100}%</p>
        <p><strong>Image:</strong>
          {patient.image ? (
            <img
              src={`http://127.0.0.1:8000/${patient.image}`}
              alt="skin"
              width="100"
              height="100"
            />
          ) : (
            <span>No Image Available</span>
          )}
        </p>
      </div>
    </div>
  );
};

const DoctorPatients = () => {
  const { doctorId } = useParams();
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(5); 

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await axios.get("http://127.0.0.1:8000/api/uploaded-images/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
  
        const filteredImages = res.data.images.filter(
          (img) => String(img.doctor) === String(doctorId)
        );
  
        setPatients(filteredImages);
      } catch (err) {
        console.error("Error fetching patients:", err);
      }
    };
  
    fetchPatients();
  }, [doctorId]);

  const handleViewImages = (patient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPatient(null);
  };
  const confirmDelete = (patientId) => {
    setSelectedPatientId(patientId);
    setShowModal(true);
  };
  const handleDeleteConfirmed = async () => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(
        `http://127.0.0.1:8000/api/patient/delete/${selectedPatientId}/`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      setPatients((prev) => prev.filter((p) => p.id !== selectedPatientId));
      toast.success("Patient deleted successfully!");
    } catch (error) {
      console.error("Error deleting patient:", error);
      toast.error(error.response?.data?.detail || "Failed to delete patient.");
    } finally {
      setShowModal(false);
      setSelectedPatientId(null);
    }
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery) ||
      patient.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Paginate the filtered patients based on current page
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calculate total pages
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  return (
    <section className="page">
      <div className="patients-container">
        <h2>Patients of Doctor #{doctorId}</h2>

        {/* Live Search Input */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by name, phone, or address"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient Name</th>
                <th>Phone</th>
                <th>Gender</th>
                <th>Age</th>
                <th>Address</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentPatients.length === 0 ? (
                <tr>
                  <td colSpan="7">No patients found.</td>
                </tr>
              ) : (
                currentPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td>{patient.id}</td>
                    <td>{patient.name}</td>
                    <td>{patient.phone}</td>
                    <td>{patient.gender}</td>
                    <td>{patient.age}</td>
                    <td>{patient.address}</td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() => handleViewImages(patient)}
                      >
                        View Details
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => confirmDelete(patient.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => paginate(index + 1)}
              className={currentPage === index + 1 ? "page-btn active" : "page-btn"}
            >
              {index + 1}
            </button>
          ))}
        </div>
        {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "2rem",
              borderRadius: "8px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              width: "90%",
              maxWidth: "400px",
              textAlign: "center",
            }}
          >
            <h3 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
              Confirm Deletion
            </h3>
            <p style={{ marginBottom: "1.5rem" }}>
              Are you sure you want to delete this patient?
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "1rem",
              }}
            >
              <button
                onClick={handleDeleteConfirmed}
                style={{
                  flex: 1,
                  padding: "0.5rem 1rem",
                  backgroundColor: "#d9534f",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1,
                  padding: "0.5rem 1rem",
                  backgroundColor: "#6c757d",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
        {/* Modal for displaying patient details */}
        {isModalOpen && selectedPatient && (
          <PatientDetailModal patient={selectedPatient} onClose={closeModal} />
        )}
      </div>
    </section>
  );
};

export default DoctorPatients;
