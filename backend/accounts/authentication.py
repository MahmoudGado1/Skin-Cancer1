from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models import CustomToken, Doctor, Admin

class CustomTokenAuthentication(TokenAuthentication):
    model = CustomToken

    def authenticate_credentials(self, key):
        try:
            token = self.model.objects.get(key=key)
        except self.model.DoesNotExist:
            raise AuthenticationFailed('Invalid token.')

        if not token.user.is_active:
            raise AuthenticationFailed('User inactive or deleted.')

        # Resolve the user based on the content_type
        if token.content_type.model == 'doctor':
            user = Doctor.objects.get(id=token.object_id)
        elif token.content_type.model == 'admin':
            user = Admin.objects.get(id=token.object_id)
        else:
            raise AuthenticationFailed('Invalid user type.')

        return (user, token)