# projet_gestion/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')), # Vérifie que 'core' est bien le nom de ton app
]