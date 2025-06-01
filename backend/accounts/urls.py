from django.urls import path
from .views import AdminRegisterView, DeletePatientView, DoctorDeleteView, DoctorRegisterView, GetAllDoctorsView, GetAllUploadedImagesView, LoginView, SkinCancerImageUploadView, UpdatePatientView

urlpatterns = [
    path('register/admin/', AdminRegisterView.as_view(), name='admin-register'),
    path('register/doctor/', DoctorRegisterView.as_view(), name='doctor-register'),
    path('login/', LoginView.as_view(), name='login'),
    path('get-all-doctors/', GetAllDoctorsView.as_view(), name='get-all-doctors'),
    path('upload-image/', SkinCancerImageUploadView.as_view(), name='upload-image'),
    path('uploaded-images/', GetAllUploadedImagesView.as_view(), name='get-all-uploaded-images'),
    path('doctors/<int:pk>/delete/', DoctorDeleteView.as_view(), name='delete-doctor'),
    path('patient/update/<int:id>/', UpdatePatientView.as_view(), name='update-patient'),
    path('patient/delete/<int:id>/', DeletePatientView.as_view(), name='delete-patient'),
]