from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import AdminSerializer, DoctorSerializer, SkinCancerImageSerializer
from .models import Admin, Doctor, CustomToken, SkinCancerImage
from django.contrib.auth.hashers import check_password
from django.contrib.contenttypes.models import ContentType
from django.utils.crypto import get_random_string
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework import serializers
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import generics, permissions
from .models import SkinCancerImage, Doctor
from .serializers import SkinCancerImageSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .predict import predict_image
from PIL import Image
from rest_framework.permissions import IsAdminUser
from rest_framework import status


class AdminRegisterView(generics.CreateAPIView):
    queryset = Admin.objects.all()
    serializer_class = AdminSerializer
    permission_classes = []  # No permissions required for registration

    @swagger_auto_schema(
        operation_description="Register a new Admin",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['email', 'password', 'firstName', 'lastName', 'mobileNumber', 'gender'],
            properties={
                'email': openapi.Schema(type=openapi.TYPE_STRING, format='email'),
                'password': openapi.Schema(type=openapi.TYPE_STRING, format='password'),
                'firstName': openapi.Schema(type=openapi.TYPE_STRING),
                'lastName': openapi.Schema(type=openapi.TYPE_STRING),
                'mobileNumber': openapi.Schema(type=openapi.TYPE_STRING),
                'gender': openapi.Schema(type=openapi.TYPE_STRING),
            },
        ),
        responses={
            201: openapi.Response('Admin registered successfully', AdminSerializer),
            400: 'Invalid input',
        }
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)



class DoctorRegisterView(generics.CreateAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = []  # No permissions required for registration
    parser_classes = [MultiPartParser, FormParser]  # Add this to handle file uploads

    @swagger_auto_schema(
        operation_description="Register a new Doctor",
        manual_parameters=[
            openapi.Parameter(
                name='email',
                in_=openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                required=True,
                description='Email of the doctor'
            ),
            openapi.Parameter(
                name='password',
                in_=openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                format='password',
                required=True,
                description='Password of the doctor'
            ),
            openapi.Parameter(
                name='first_name',
                in_=openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                required=True,
                description='First name of the doctor'
            ),
            openapi.Parameter(
                name='last_name',
                in_=openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                required=True,
                description='Last name of the doctor'
            ),
            openapi.Parameter(
                name='phone',
                in_=openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                required=True,
                description='Phone number of the doctor'
            ),
            openapi.Parameter(
                name='date_of_birth',
                in_=openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                format='date',
                required=True,
                description='Date of birth of the doctor (YYYY-MM-DD)'
            ),
            openapi.Parameter(
                name='gender',
                in_=openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                required=True,
                description='Gender of the doctor (Male/Female)'
            ),
            openapi.Parameter(
                name='personal_photo',
                in_=openapi.IN_FORM,
                type=openapi.TYPE_FILE,
                required=False,
                description='Optional personal photo of the doctor'
            )
        ],
        responses={
            201: openapi.Response('Doctor registered successfully', DoctorSerializer),
            400: 'Invalid input',
        }
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

def generate_token_key():
    return get_random_string(length=40)



class DoctorDeleteView(generics.DestroyAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [IsAdminUser]  # Only admins can delete doctors

    @swagger_auto_schema(
        operation_description="Delete a doctor by ID",
        responses={
            204: openapi.Response(
                description="Doctor deleted successfully",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'message': openapi.Schema(type=openapi.TYPE_STRING, example='Doctor deleted successfully.')
                    }
                )
            ),
            404: openapi.Response(
                description="Doctor not found",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'detail': openapi.Schema(type=openapi.TYPE_STRING, example='Not found.')
                    }
                )
            ),
            403: openapi.Response(
                description="Forbidden (only admins can delete doctors)",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'detail': openapi.Schema(type=openapi.TYPE_STRING, example='You do not have permission to perform this action.')
                    }
                )
            )
        }
    )
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"message": "Doctor deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )



class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_description="Login as an Admin or Doctor",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['email', 'password'],
            properties={
                'email': openapi.Schema(type=openapi.TYPE_STRING, format='email'),
                'password': openapi.Schema(type=openapi.TYPE_STRING, format='password'),
            },
        ),
        responses={
            200: openapi.Response('Login successful', openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'token': openapi.Schema(type=openapi.TYPE_STRING),
                    'role': openapi.Schema(type=openapi.TYPE_STRING),
                    'id': openapi.Schema(type=openapi.TYPE_INTEGER),  # Added ID in schema
                }
            )),
            400: 'Invalid credentials',
        }
    )
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')
        
        # Check if the user is an Admin
        admin = Admin.objects.filter(email=email).first()
        if admin and check_password(password, admin.password):
            content_type = ContentType.objects.get_for_model(Admin)
            token, created = CustomToken.objects.get_or_create(
                content_type=content_type,
                object_id=admin.id,
                defaults={'key': generate_token_key()}
            )
            return Response({
                'token': token.key,
                'role': 'admin',
                'id': admin.id  # Include Admin ID
            })
        
        # Check if the user is a Doctor
        doctor = Doctor.objects.filter(email=email).first()
        if doctor and check_password(password, doctor.password):
            content_type = ContentType.objects.get_for_model(Doctor)
            token, created = CustomToken.objects.get_or_create(
                content_type=content_type,
                object_id=doctor.id,
                defaults={'key': generate_token_key()}
            )
            return Response({
                'token': token.key,
                'role': 'doctor',
                'id': doctor.id  # Include Doctor ID
            })
        
        return Response({'error': 'Invalid Credentials'}, status=400)

class GetAllDoctorsView(APIView):
    permission_classes = [permissions.IsAuthenticated]  # Require authentication

    @swagger_auto_schema(
        operation_description="Get a list of all Doctors",
        responses={
            200: openapi.Response('List of Doctors', DoctorSerializer(many=True)),
        }
    )
    def get(self, request, *args, **kwargs):
        doctors = Doctor.objects.all()
        doctor_serializer = DoctorSerializer(doctors, many=True)
        return Response({'doctors': doctor_serializer.data})



class SkinCancerImageUploadView(generics.CreateAPIView):
    queryset = SkinCancerImage.objects.all()
    serializer_class = SkinCancerImageSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    @swagger_auto_schema(
        operation_description="Upload a skin cancer image with patient details (only for authenticated doctors)",
        manual_parameters=[
            openapi.Parameter(
                name='Authorization',
                in_=openapi.IN_HEADER,
                type=openapi.TYPE_STRING,
                required=True,
                description='Token <token>'
            ),
            openapi.Parameter(
                name='image',
                in_=openapi.IN_FORM,
                type=openapi.TYPE_FILE,
                required=True,
                description='Image file to upload'
            ),
            openapi.Parameter(
                name='name',
                in_=openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                required=True,
                description='Name of the patient'
            ),
            openapi.Parameter(
                name='age',
                in_=openapi.IN_FORM,
                type=openapi.TYPE_INTEGER,
                required=True,
                description='Age of the patient'
            ),
            openapi.Parameter(
                name='address',
                in_=openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                required=True,
                description='Address of the patient'
            ),
            openapi.Parameter(
                name='phone',
                in_=openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                required=True,
                description='Phone number of the patient'
            ),
            openapi.Parameter(
                name='gender',
                in_=openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                required=True,
                description='Gender of the patient (Male/Female)'
            ),
        ],
        responses={
            201: openapi.Response('Image uploaded successfully', SkinCancerImageSerializer),
            400: 'Invalid input',
            401: 'Unauthorized (invalid or missing token)',
            403: 'Forbidden (only doctors can upload images)',
        }
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

    def perform_create(self, serializer):
        # Ensure the user is a Doctor
        if not isinstance(self.request.user, Doctor):
            raise serializers.ValidationError("Only doctors can upload images.")

        # Save the uploaded image
        instance = serializer.save(doctor=self.request.user)

        # Open the uploaded image
        image = Image.open(instance.image)

        # Predict the diagnosis and get detailed results
        prediction_result = predict_image(image)

        # Save the diagnosis result and additional information
        instance.diagnosis_result = prediction_result['diagnosis_result']
        instance.diagnosis_probability = prediction_result['probability']
        instance.diagnosis_description = prediction_result['description']
        instance.top_predictions = prediction_result['top_predictions']
        instance.save()

        # Return the detailed prediction result in the response
        return prediction_result
    

class GetAllUploadedImagesView(generics.ListAPIView):
    queryset = SkinCancerImage.objects.all()
    serializer_class = SkinCancerImageSerializer
    permission_classes = [permissions.IsAuthenticated]  # Require authentication

    @swagger_auto_schema(
        operation_description="Get a list of all uploaded skin cancer images",
        manual_parameters=[
            openapi.Parameter(
                name='Authorization',
                in_=openapi.IN_HEADER,
                type=openapi.TYPE_STRING,
                required=True,
                description='Token <token>'
            )
        ],
        responses={
            200: openapi.Response(
                description="List of uploaded images",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'images': openapi.Schema(
                            type=openapi.TYPE_ARRAY,
                            items=openapi.Schema(
                                type=openapi.TYPE_OBJECT,
                                properties={
                                    'id': openapi.Schema(type=openapi.TYPE_INTEGER),
                                    'doctor': openapi.Schema(type=openapi.TYPE_INTEGER),
                                    'image': openapi.Schema(type=openapi.TYPE_STRING, format='uri'),
                                    'name': openapi.Schema(type=openapi.TYPE_STRING),
                                    'age': openapi.Schema(type=openapi.TYPE_INTEGER),
                                    'address': openapi.Schema(type=openapi.TYPE_STRING),
                                    'phone': openapi.Schema(type=openapi.TYPE_STRING),
                                    'gender': openapi.Schema(type=openapi.TYPE_STRING),
                                    'uploaded_at': openapi.Schema(type=openapi.TYPE_STRING, format='date-time'),
                                    'diagnosis_result': openapi.Schema(type=openapi.TYPE_STRING),
                                    'diagnosis_probability': openapi.Schema(type=openapi.TYPE_NUMBER),
                                    'diagnosis_description': openapi.Schema(type=openapi.TYPE_STRING),
                                    'top_predictions': openapi.Schema(
                                        type=openapi.TYPE_ARRAY,
                                        items=openapi.Schema(
                                            type=openapi.TYPE_OBJECT,
                                            properties={
                                                'class': openapi.Schema(type=openapi.TYPE_STRING),
                                                'probability': openapi.Schema(type=openapi.TYPE_NUMBER),
                                                'description': openapi.Schema(type=openapi.TYPE_STRING)
                                            }
                                        )
                                    )
                                }
                            )
                        )
                    }
                )
            ),
            401: openapi.Response(
                description="Unauthorized (invalid or missing token)",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'error': openapi.Schema(type=openapi.TYPE_STRING)
                    }
                )
            )
        }
    )
    def get(self, request, *args, **kwargs):
        # Get all SkinCancerImage instances
        images = SkinCancerImage.objects.all()
        # Serialize the data
        serializer = SkinCancerImageSerializer(images, many=True)
        # Return the serialized data in the response
        return Response({'images': serializer.data})
    
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import SkinCancerImage, Doctor
from .serializers import SkinCancerImageSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from PIL import Image
from .predict import predict_image
from django.core.exceptions import ValidationError
from django.utils import timezone  # Make sure this is imported

class UpdatePatientView(generics.UpdateAPIView):
    queryset = SkinCancerImage.objects.all()
    serializer_class = SkinCancerImageSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    lookup_field = 'id'  # Use 'id' to lookup the patient

    @swagger_auto_schema(
        operation_description="Update patient details by ID (only for authenticated doctors)",
        manual_parameters=[
            openapi.Parameter(
                name='Authorization',
                in_=openapi.IN_HEADER,
                type=openapi.TYPE_STRING,
                required=True,
                description='Token <token>'
            ),
            openapi.Parameter(
                name='id',
                in_=openapi.IN_PATH,
                type=openapi.TYPE_INTEGER,
                required=True,
                description='ID of the patient to update'
            ),
            openapi.Parameter(
                name='image',
                in_=openapi.IN_FORM,
                type=openapi.TYPE_FILE,
                required=False,
                description='Optional new image file for the patient'
            ),
            openapi.Parameter(
                name='name',
                in_=openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                required=False,
                description='Name of the patient'
            ),
            openapi.Parameter(
                name='age',
                in_=openapi.IN_FORM,
                type=openapi.TYPE_INTEGER,
                required=False,
                description='Age of the patient'
            ),
            openapi.Parameter(
                name='address',
                in_=openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                required=False,
                description='Address of the patient'
            ),
            openapi.Parameter(
                name='phone',
                in_=openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                required=False,
                description='Phone number of the patient'
            ),
            openapi.Parameter(
                name='gender',
                in_=openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                required=False,
                description='Gender of the patient (Male/Female)',
                enum=['Male', 'Female']
            ),
        ],
        responses={
            200: openapi.Response('Patient updated successfully', SkinCancerImageSerializer),
            400: 'Invalid input',
            401: 'Unauthorized (invalid or missing token)',
            403: 'Forbidden (only doctors can update patient details)',
            404: 'Patient not found',
        }
    )
    def update(self, request, *args, **kwargs):
      # Ensure the user is a Doctor
      if not isinstance(self.request.user, Doctor):
          return Response(
              {"error": "Only doctors can update patient details."},
              status=status.HTTP_403_FORBIDDEN
          )

      # Get the patient instance
      try:
          patient = self.get_object()
      except SkinCancerImage.DoesNotExist:
          return Response(
              {"error": "Patient not found."},
              status=status.HTTP_404_NOT_FOUND
          )

      # Ensure the doctor updating the patient is the one who uploaded it
      if patient.doctor != self.request.user:
          return Response(
              {"error": "You can only update patients you uploaded."},
              status=status.HTTP_403_FORBIDDEN
          )

      # Update the patient details
      serializer = self.get_serializer(patient, data=request.data, partial=True)
      if serializer.is_valid():
          try:
              instance = serializer.save()

              # Update uploaded_at timestamp
              instance.uploaded_at = timezone.now()

              # If a new image is provided, re-run the prediction
              if 'image' in request.data and request.data['image']:
                  try:
                      image = Image.open(instance.image)
                      prediction_result = predict_image(image)
                      instance.diagnosis_result = prediction_result['diagnosis_result']
                      instance.diagnosis_probability = prediction_result['probability']
                      instance.diagnosis_description = prediction_result['description']
                      instance.top_predictions = prediction_result['top_predictions']
                  except Exception as e:
                      return Response(
                          {"error": f"Error processing image: {str(e)}"},
                          status=status.HTTP_400_BAD_REQUEST
                      )

              instance.save()
              return Response(serializer.data, status=status.HTTP_200_OK)
          except ValidationError as e:
              return Response(
                  {"error": str(e)},
                  status=status.HTTP_400_BAD_REQUEST
              )
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DeletePatientView(generics.DestroyAPIView):
    queryset = SkinCancerImage.objects.all()
    serializer_class = SkinCancerImageSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    @swagger_auto_schema(
        operation_description="Delete a patient by ID (Admins can delete any patient; Doctors can only delete patients they uploaded)",
        manual_parameters=[
            openapi.Parameter(
                name='Authorization',
                in_=openapi.IN_HEADER,
                type=openapi.TYPE_STRING,
                required=True,
                description='Token <token>'
            ),
            openapi.Parameter(
                name='id',
                in_=openapi.IN_PATH,
                type=openapi.TYPE_INTEGER,
                required=True,
                description='ID of the patient to delete'
            ),
        ],
        responses={
            204: openapi.Response(
                description="Patient deleted successfully",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'message': openapi.Schema(type=openapi.TYPE_STRING, example='Patient deleted successfully.')
                    }
                )
            ),
            401: openapi.Response(
                description="Unauthorized (invalid or missing token)",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'error': openapi.Schema(type=openapi.TYPE_STRING, example='Authentication credentials were not provided.')
                    }
                )
            ),
            403: openapi.Response(
                description="Forbidden (user is neither an admin nor a doctor, or doctor lacks permission)",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'error': openapi.Schema(type=openapi.TYPE_STRING, example='You do not have permission to delete patients.')
                    }
                )
            ),
            404: openapi.Response(
                description="Patient not found",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'error': openapi.Schema(type=openapi.TYPE_STRING, example='Patient not found.')
                    }
                )
            ),
        }
    )
    def destroy(self, request, *args, **kwargs):
        # Check if the user is an Admin or Doctor
        if not isinstance(self.request.user, (Admin, Doctor)):
            return Response(
                {"error": "You do not have permission to delete patients."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get the patient instance
        try:
            patient = self.get_object()
        except SkinCancerImage.DoesNotExist:
            return Response(
                {"error": "Patient not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # For Doctors, ensure they can only delete patients they uploaded
        if isinstance(self.request.user, Doctor) and patient.doctor != self.request.user:
            return Response(
                {"error": "You can only delete patients you uploaded."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Perform the deletion (Admins can delete any patient)
        self.perform_destroy(patient)
        return Response(
            {"message": "Patient deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )