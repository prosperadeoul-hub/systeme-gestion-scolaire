from rest_framework import serializers
from .models import Etudiant, Note, Matiere, Examen, Professeur

class MatiereSerializer(serializers.ModelSerializer):
    professeur_name = serializers.ReadOnlyField(source='professeur.user.profile.full_name')
    
    class Meta:
        model = Matiere
        fields = ['id', 'nom', 'code', 'coefficient', 'categorie', 'professeur_name']

class ExamenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Examen
        fields = ['id', 'nom', 'date_examen', 'matiere']

class StudentGradeSerializer(serializers.Serializer):
    """Utilisé pour la liste de saisie des profs"""
    etudiant_id = serializers.IntegerField()
    nom = serializers.CharField(source='user.profile.full_name', read_only=True)
    matricule = serializers.CharField(read_only=True)
    note_id = serializers.IntegerField(allow_null=True, read_only=True)
    valeur = serializers.FloatField(required=False)
    commentaire = serializers.CharField(required=False, allow_blank=True)