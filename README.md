
# 🧠 126-Skin Cancer Detection & Healthcare Management System

A full-stack web application that enables doctors to upload skin lesion images, receive AI-powered diagnostic results, and manage patient records. Includes secure role-based authentication, Admin/Doctor dashboards, and a pre-trained ResNet model for classification.

---

## 🔍 Features

- **🔐 Secure Authentication**  
  - Token-based login for Admins and Doctors  
  - Custom user model with role-based access

- **🧪 AI-Powered Skin Image Analysis**  
  - Upload lesion images for automatic skin cancer detection  
  - Results include: diagnosis label, confidence score, explanation, and top 3 predictions

- **📊 User Dashboards**  
  - **Admin Dashboard:** Manage doctors and patient records  
  - **Doctor Dashboard:** Upload, view, and manage their own records

- **🧾 API Documentation**  
  - Fully interactive Swagger UI powered by `drf-yasg`

- **🖼 Media Handling**  
  - Secure upload and storage of patient images

- **🗃 Lightweight Database**  
  - SQLite by default (easily switchable to PostgreSQL)

---

## 🚀 Tech Stack

| Layer     | Technology                            |
|-----------|----------------------------------------|
| Backend   | Django, Django REST Framework (DRF)    |
| AI Model  | TensorFlow, Keras (ResNet CNN)         |
| Frontend  | React.js, css , axios, react-router, Bootsrap    |
| Database  | SQLite (default), PostgreSQL |

---

## 📦 Python Dependencies


---

## ⚙️ Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/MahmoudGado1/Skin-Cancer1.git
cd Skin-Cancer1
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install django djangorestframework drf-yasg django-cors-headers Pillow numpy tensorflow keras
python manage.py migrate
python manage.py runserver
```
### 3. website Setup

```bash
 npm install
 npm run dev
```
### 4. Dashboard Setup

```bash
cd Dashboard
npm install
npm run dev
```
### 5. Backend Configuration (`settings.py`)

```python
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_USER_MODEL = 'accounts.Admin'
CORS_ALLOW_ALL_ORIGINS = True
```

---

## 👤 User Roles

### 🔧 Admin
- Register and log in  
- Manage doctors and all patient records

### 🩺 Doctor
- Register and log in  
- Upload and view only their own patient records

---

## 🧠 AI Integration

- **Model**: Pre-trained ResNet CNN using Keras  
- **Trigger**: Prediction happens automatically on image upload  
- **Stored Results**:
  - Diagnosis label  
  - Confidence score  
  - Text explanation  
  - Top 3 class predictions

---

## 🔌 API Endpoints

| Method | Endpoint                 | Description                        |
|--------|--------------------------|------------------------------------|
| POST   | `/api/admin/register/`   | Register a new admin               |
| POST   | `/api/doctor/register/`  | Register a new doctor              |
| POST   | `/api/login/`            | Log in and receive auth token      |
| GET    | `/api/doctors/`          | List all doctors (Admin only)      |
| POST   | `/api/images/`           | Upload patient image for diagnosis |
| GET    | `/api/images/`           | List all image records             |
| PUT    | `/api/images/{id}/`      | Update a specific image record     |
| DELETE | `/api/images/{id}/`      | Delete a specific image record     |

🧪 Try out the endpoints using Swagger UI:  
**[http://localhost:8000/swagger/](http://localhost:8000/swagger/)**

---

## ✅ What’s Included

- Django backend with RESTful API
- Token-based authentication system
- Custom Admin and Doctor user roles
- AI-based prediction using uploaded images
- Secure image upload & storage
- Swagger API documentation
