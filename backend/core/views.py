from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.db.models import Avg, Count, Window, F
from django.db.models.functions import Rank
from .models import Etudiant, Note, Matiere, Examen, Professeur
from .serializers import MatiereSerializer, ExamenSerializer, StudentGradeSerializer

class StudentDashboardStats(APIView):
    def get(self, request):
        try:
            student = Etudiant.objects.get(user=request.user)
            # Calcul du rang via SQL Window Function (très performant)
            students_with_avg = Etudiant.objects.filter(promotion=student.promotion).annotate(
                moyenne=Avg('notes__valeur')
            ).annotate(
                rank=Window(expression=Rank(), order_by=F('moyenne').desc())
            )
            
            my_stats = next(s for s in students_with_avg if s.id == student.id)
            matieres = Matiere.objects.filter(promotions=student.promotion)

            return Response({
                "etudiant": {"id": student.id, "matricule": student.matricule},
                "moyenne_generale": round(my_stats.moyenne or 0, 2),
                "rang": my_stats.rank,
                "total_etudiants": students_with_avg.count(),
                "solde_restant": student.frais_scolarite_total - student.frais_payes,
                "matieres": MatiereSerializer(matieres, many=True).data
            })
        except Exception as e:
            return Response({"error": str(e)}, status=400)

class TeacherGradesView(APIView):
    """Gestion des notes par examen (Saisie en masse)"""
    
    def get(self, request, exam_id):
        # Récupère tous les étudiants de la promo liée à l'examen
        examen = Examen.objects.get(id=exam_id)
        students = Etudiant.objects.filter(promotion__matieres=examen.matiere)
        
        data = []
        for s in students:
            note = Note.objects.filter(etudiant=s, examen=examen).first()
            data.append({
                "etudiant_id": s.id,
                "nom": s.user.profile.full_name,
                "matricule": s.matricule,
                "note_id": note.id if note else None,
                "valeur": note.valeur if note else "",
                "commentaire": note.commentaire if note else ""
            })
        return Response(data)

    def post(self, request, exam_id):
        """Action de sauvegarde Bulk (Atomique)"""
        examen = Examen.objects.get(id=exam_id)
        grades_data = request.data.get('grades', [])

        with transaction.atomic(): # Si une note échoue, rien n'est sauvegardé
            for item in grades_data:
                Note.objects.update_or_create(
                    etudiant_id=item['etudiant_id'],
                    examen=examen,
                    defaults={
                        'valeur': item['valeur'],
                        'commentaire': item.get('commentaire', '')
                    }
                )
        return Response({"status": "success"})