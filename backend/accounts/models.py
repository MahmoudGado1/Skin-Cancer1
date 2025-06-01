from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.conf import settings
from django.contrib.auth.models import AbstractBaseUser
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class Admin(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    firstName = models.CharField(max_length=100)
    lastName = models.CharField(max_length=100)
    mobileNumber = models.CharField(max_length=15)
    gender = models.CharField(max_length=10)
    is_staff = models.BooleanField(default=True)  # Admins are staff
    is_active = models.BooleanField(default=True)
    role = models.CharField(max_length=10, default='admin')  # Role is set to 'admin' by default

    # Add unique related_name for groups and user_permissions
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='admin_users',  # Unique related_name
        blank=True,
        help_text='The groups this admin belongs to. A user will get all permissions granted to each of their groups.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='admin_users',  # Unique related_name
        blank=True,
        help_text='Specific permissions for this admin.',
        verbose_name='user permissions',
    )

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['firstName', 'lastName', 'mobileNumber', 'gender']

    def __str__(self):
        return self.email

class Doctor(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10)
    is_staff = models.BooleanField(default=False)  # Doctors are not staff
    is_active = models.BooleanField(default=True)
    personal_photo = models.ImageField(upload_to='doctor_photos/', null=True, blank=True)  # Add this field

    # Add unique related_name for groups and user_permissions
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='doctor_users',  # Unique related_name
        blank=True,
        help_text='The groups this doctor belongs to. A user will get all permissions granted to each of their groups.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='doctor_users',  # Unique related_name
        blank=True,
        help_text='Specific permissions for this doctor.',
        verbose_name='user permissions',
    )

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'phone', 'date_of_birth', 'gender']

    def __str__(self):
        return self.email


class CustomToken(models.Model):
    key = models.CharField(max_length=40, primary_key=True)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    user = GenericForeignKey('content_type', 'object_id')
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.key
    
class SkinCancerImage(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='uploaded_images')
    image = models.ImageField(upload_to='skin_cancer_images/')
    name = models.CharField(max_length=100)
    age = models.PositiveIntegerField()
    address = models.CharField(max_length=255)
    phone = models.CharField(max_length=15)
    gender = models.CharField(max_length=10, choices=[('Male', 'Male'), ('Female', 'Female')])
    uploaded_at = models.DateTimeField(auto_now_add=True)
    diagnosis_result = models.CharField(max_length=100, blank=True, null=True)
    diagnosis_probability = models.FloatField(blank=True, null=True)
    diagnosis_description = models.TextField(blank=True, null=True)
    top_predictions = models.JSONField(blank=True, null=True)

    def __str__(self):
        return f"Image uploaded by {self.doctor.email} at {self.uploaded_at}"