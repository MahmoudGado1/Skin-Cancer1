import { useEffect, useState } from "react";
import axios from "axios";
import { Button, Modal, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

const API_URL = "http://127.0.0.1:8000/api/get-all-doctors/";
const DELETE_URL = "http://127.0.0.1:8000/api/doctors/";
const BASE_URL = "http://127.0.0.1:8000";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const AUTH_TOKEN = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchDoctors = async () => {
      if (!AUTH_TOKEN) {
        setError("Authentication required. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(API_URL, {
          headers: { Authorization: `Token ${AUTH_TOKEN}` },
        });

        setDoctors(response.data.doctors);
      } catch (err) {
        setError("Failed to fetch doctors.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [AUTH_TOKEN]);

  const handleDeleteClick = (doctor) => {
    setDoctorToDelete(doctor);
    setShowModal(true);
  };

  const confirmDeleteDoctor = async () => {
    if (!doctorToDelete) return;

    try {
      await axios.delete(`${DELETE_URL}${doctorToDelete.id}/delete/`, {
        headers: { Authorization: `Token ${AUTH_TOKEN}` },
      });

      setDoctors((prevDoctors) =>
        prevDoctors.filter((doctor) => doctor.id !== doctorToDelete.id)
      );
      toast.success("Doctor deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete doctor.");
      console.error(err);
    } finally {
      setShowModal(false);
      setDoctorToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <Spinner animation="border" variant="primary" />
        <p>Loading doctors...</p>
      </div>
    );
  }

  if (error) return <h2 className="error">{error}</h2>;

  return (
    <section className="page doctors">
      <h1>DOCTORS</h1>
      <div className="banner">
        {doctors.map((doctor) => (
          <div key={doctor.id} className="card1">
            <img
              src={doctor.personal_photo ? `${BASE_URL}${doctor.personal_photo}` : "/docHolder.jpg"}
              alt="Doctor avatar"
              onError={(e) => (e.target.src = "/docHolder.jpg")}
            />
            <h4>{`${doctor.first_name} ${doctor.last_name}`}</h4>
            <div className="details">
              <p>Email: <span>{doctor.email}</span></p>
              <p>Phone: <span>{doctor.phone}</span></p>
              <p>DOB: <span>{doctor.date_of_birth}</span></p>
              <p>Gender: <span>{doctor.gender}</span></p>
            </div>
            <Button variant="danger" onClick={() => handleDeleteClick(doctor)}>
              Delete
            </Button>
          </div>
        ))}
      </div>

      {/* Custom Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {doctorToDelete && (
            <p>Are you sure you want to delete <strong>{doctorToDelete.first_name} {doctorToDelete.last_name}</strong>?</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteDoctor}>
            Yes, Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
};

export default Doctors;
