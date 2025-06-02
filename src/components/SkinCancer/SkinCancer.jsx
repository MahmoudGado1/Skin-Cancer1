/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import axios from "axios";
import "./SkinCancer.css";
import { CheckCircle2Icon, UploadCloudIcon, XIcon } from "lucide-react";
import { Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";

const SkinCancer = () => {
  const location = useLocation();
  const patientData = location.state?.patient;

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    address: "",
    phone: "",
    gender: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (patientData) {
      setFormData({
        name: patientData.name || "",
        age: patientData.age || "",
        address: patientData.address || "",
        phone: patientData.phone || "",
        gender: patientData.gender || "",
      });
    }
  }, [patientData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedImage(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) setSelectedImage(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    document.getElementById("fileInput").value = "";
  };

  const handleClick = () => {
    document.getElementById("fileInput").click();
  };

  const isFormValid = () => {
    const { name, age, address, phone, gender } = formData;
    return (
      name.trim() &&
      address.trim() &&
      phone.trim() &&
      gender.trim() &&
      String(age).trim() &&
      (selectedImage || patientData)
    );
  };
  
  const handleSend = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setLoading(true);
    setDiagnosis(null);

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });
    if (selectedImage) {
      formDataToSend.append("image", selectedImage);
    }

    const url = patientData
      ? `http://127.0.0.1:8000/api/patient/update/${patientData.id}/`
      : "http://127.0.0.1:8000/api/upload-image/";
    const method = patientData ? "put" : "post";

    try {
      const response = await axios({
        method,
        url,
        data: formDataToSend,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Token ${token}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        toast.success(
          patientData ? "Patient updated successfully!" : "Diagnosis received!",
          {
            position: "top-right",
            style: { color: "#0d6efd", marginTop: "70px" },
            icon: <CheckCircle2Icon />,
            autoClose: 5000,
            progressStyle: {
              background: "linear-gradient(to right, #87CEEB, #0d6efd)",
              height: "4px",
            },
          }
        );

        if (response.data && response.data.diagnosis_result) {
          setDiagnosis(response.data);
        }
        
        setFormData({
          name: "",
          age: "",
          address: "",
          phone: "",
          gender: "",
        });
        setSelectedImage(null);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to send data!", {
        position: "top-center",
        icon: <XIcon />,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container skin-cancer">
      {loading && (
        <div className="loading-overlay">
          <Spinner animation="border" variant="primary" />
          <p>Processing image...</p>
        </div>
      )}

      <div className="header-line line-depart">
        <span className="line" />
        <span className="text">Skin Cancer Detection</span>
      </div>

      <h1>Upload an image or take a photo to check for skin cancer.</h1>

      <form className="drag-drop-container" onSubmit={handleSend}>
        <div className="data-patient">
          <div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Patient Name"
            />
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              placeholder="Age"
            />
          </div>
          <div>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Address"
            />
            <input
              type="number"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Phone"
            />
          </div>
          <div>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>

        <div
          className={`drop-area ${dragActive ? "active" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={!selectedImage ? handleClick : null}
        >
          {!selectedImage ? (
            <div className="upload-image">
              <UploadCloudIcon className="icon" />
              <span>Drag & Drop or click to upload image</span>
            </div>
          ) : (
            <div className="selected-image-container">
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="Selected"
                className="selected-image"
              />
              <Button variant="ghost" size="icon" onClick={handleRemoveImage}>
                <XIcon className="w-4 h-4" />
              </Button>
            </div>
          )}
          <input
            type="file"
            id="fileInput"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>

        <div className="button-container">
          <button
            className="send-btn"
            type="submit"
            disabled={loading || !isFormValid()}
          >
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                Sending...
              </>
            ) : patientData ? (
              "Update Patient"
            ) : (
              "Send"
            )}
          </button>
        </div>
      </form>

      {diagnosis && (
        <div className="diagnosis-result">
          <h3>Diagnosis: {diagnosis.diagnosis_result}</h3>
          <p>Probability: {(diagnosis.diagnosis_probability * 100).toFixed(2)}%</p>
          <p>{diagnosis.diagnosis_description}</p>

          <h4>Top Predictions:</h4>
          <ul className="top-predictions">
            {diagnosis.top_predictions.map((prediction, index) => (
              <li key={index} className="prediction-item">
                <strong>{prediction.label}</strong>{" "}
                {Math.round(prediction.probability * 100)}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SkinCancer;
