from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.conf import settings
from django.conf.urls.static import static
# Swagger schema view
schema_view = get_schema_view(
    openapi.Info(
        title="Skin Cancer Detection API",
        default_version='v1',
        description="API documentation for the Skin Cancer Detection project",
        terms_of_service="https://www.example.com/terms/",
        contact=openapi.Contact(email="contact@example.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,  # Allow unauthenticated access to the Swagger UI
    permission_classes=[permissions.AllowAny],  # Explicitly allow any user to access the Swagger UI
)

urlpatterns = [
    # Swagger URLs
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

    # Admin URLs
    path('admin/', admin.site.urls),

    # REST Framework URLs
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),

    # App URLs
    path('api/', include('accounts.urls')),
]

# 🔥 Serve media files only in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)