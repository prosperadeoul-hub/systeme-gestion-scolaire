from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed


class BearerTokenAuthentication(TokenAuthentication):
    """
    Custom authentication class that supports Bearer token format.
    Extends Django REST Framework's TokenAuthentication to handle
    Authorization: Bearer <token> header format.
    """
    keyword = 'Bearer'
