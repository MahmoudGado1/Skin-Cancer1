from rest_framework import serializers
from .models import Admin, Doctor, SkinCancerImage


class AdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admin
        fields = ['id', 'email', 'firstName', 'lastName', 'mobileNumber', 'gender', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # Set the role to 'admin' by default
        validated_data['role'] = 'admin'
        user = Admin.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            firstName=validated_data['firstName'],
            lastName=validated_data['lastName'],
            mobileNumber=validated_data['mobileNumber'],
            gender=validated_data['gender']
        )
        return user

class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = [
            'id', 'email', 'first_name', 'last_name', 'phone', 'date_of_birth', 
            'gender', 'password', 'personal_photo'  # Removed role
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'personal_photo': {'required': False}  # Make personal_photo optional
        }

    def create(self, validated_data):
        # Set the role to 'doctor' by default
        validated_data['role'] = 'doctor'  # Add role implicitly
        personal_photo = validated_data.pop('personal_photo', None)  # Handle optional personal_photo
        user = Doctor.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            phone=validated_data['phone'],
            date_of_birth=validated_data['date_of_birth'],
            gender=validated_data['gender'],
            personal_photo=personal_photo  # Include personal_photo
        )
        return user
    
class SkinCancerImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = SkinCancerImage
        fields = [
            'id', 'doctor', 'image', 'name', 'age', 'address', 'phone', 'gender',
            'uploaded_at', 'diagnosis_result', 'diagnosis_probability',
            'diagnosis_description', 'top_predictions'
        ]
        read_only_fields = ['doctor', 'uploaded_at', 'diagnosis_result',
                           'diagnosis_probability', 'diagnosis_description', 'top_predictions']
        
    def create(self, validated_data):
        # Automatically associate the image with the logged-in doctor
        doctor = self.context['request'].user
        validated_data['doctor'] = doctor
        return super().create(validated_data)