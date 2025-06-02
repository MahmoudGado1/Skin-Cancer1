import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./style.css";

const PatientHistory = () => {
  const [patients, setPatients] = useState([]);
  const { doctorId } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(3);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://127.0.0.1:8000/api/uploaded-images/",
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );

        const filteredImages = response.data.images.filter(
          (img) => String(img.doctor) === String(doctorId)
        );

        setPatients(filteredImages);
      } catch (error) {
        console.error("Error fetching patients:", error);
        toast.error("Failed to fetch patients");
      }
    };

    fetchPatients();

    const interval = setInterval(fetchPatients, 10000);
    return () => clearInterval(interval);
  }, [doctorId]);

  const filteredPatients = patients.filter((patient) => {
    const combined = `${patient.id} ${patient.name} ${patient.age} ${patient.gender} ${patient.address}`.toLowerCase();
    return combined.includes(searchTerm.toLowerCase());
  });

  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(
    indexOfFirstPatient,
    indexOfLastPatient
  );
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const confirmDelete = (patientId) => {
    setSelectedPatientId(patientId);
    setShowModal(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      const token = localStorage.getItem("token");
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

  return (
    <div className="doctor-patients-container">
      <h2 className="title">Patient History</h2>

      <input
        type="text"
        className="search-input"
        placeholder="Search patients..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
      />

      <table className="patients-table">
        <thead>
          <tr>
            <th className="table-header">Id</th>
            <th className="table-header">Patient</th>
            <th className="table-header">Details</th>
            <th className="table-header">Image</th>
            <th className="table-header">Diagnosis</th>
            <th className="table-header">Action</th>
          </tr>
        </thead>
        <tbody>
          {currentPatients.length > 0 ? (
            currentPatients.map((patient) => (
              <tr key={patient.id} className="patient-row">
                <td className="patient-info">{patient.id}</td>
                <td className="patient-info">
                  <strong>{patient.name}</strong>
                  <br />
                  Age: {patient.age}
                  <br />
                  Gender: {patient.gender}
                </td>
                <td className="patient-info">
                  Address: {patient.address}
                  <br />
                  Phone: {patient.phone} <br />
                  Uploaded At: {new Date(patient.uploaded_at).toLocaleString()}

                </td>
                <td className="patient-image">
                  <img
                    src={`http://127.0.0.1:8000${patient.image}`}
                    alt="Patient"
                    className="patient-img"
                  />
                </td>
                <td className="patient-info">
                  <strong>{patient.diagnosis_result}</strong>
                  <br />
                  Confidence: {(patient.diagnosis_probability * 100).toFixed(2)}
                  %
                </td>
<div className="bt">
<td>
                  <button
                    className="page-btn"
                    onClick={() =>
                      navigate("/skin-cancer", { state: { patient } })
                    }
                  >
                    Edit
                  </button>
                </td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => confirmDelete(patient.id)}
                  >
                    Delete
                  </button>
                </td>
</div>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="no-patients">
                No patient records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

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
    </div>
  );
};

export default PatientHistory;
