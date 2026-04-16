import uuid
import random
from django.core.management.base import BaseCommand
from core.models import User, Promotion, Professeur, Etudiant, Matiere, Examen, Note
from django.utils import timezone
from decimal import Decimal

class Command(BaseCommand):
    help = "Initialise les comptes démo et les données de test"

    def handle(self, *args, **kwargs):
        self.stdout.write("Début du seeding...")

        # 1. Création des Utilisateurs & Profils
        DEMO_ACCOUNTS = [
            {'username': 'admin_demo', 'email': 'admin@ecole.demo', 'role': 'ADMIN', 'full_name': 'Jean Administrateur'},
            {'username': 'prof_dupont', 'email': 'dupont@ecole.demo', 'role': 'ENSEIGNANT', 'full_name': 'Marie Dupont', 'spec': 'IA'},
            {'username': 'prof_martin', 'email': 'martin@ecole.demo', 'role': 'ENSEIGNANT', 'full_name': 'Pierre Martin', 'spec': 'Réseaux'},
            {'username': 'alice_etu', 'email': 'alice@ecole.demo', 'role': 'ETUDIANT', 'full_name': 'Alice Bernard', 'mat': 'ETU001'},
            {'username': 'bob_etu', 'email': 'bob@ecole.demo', 'role': 'ETUDIANT', 'full_name': 'Bob Leclerc', 'mat': 'ETU002'},
        ]

        # Création des Promotions
        p1, _ = Promotion.objects.get_or_create(nom='Master 1 IA', annee=2026)
        p2, _ = Promotion.objects.get_or_create(nom='Licence 3 Info', annee=2025)

        for acc in DEMO_ACCOUNTS:
            user, created = User.objects.get_or_create(
                username=acc['username'],
                email=acc['email'],
                defaults={'first_name': acc['full_name'].split()[0], 'last_name': acc['full_name'].split()[-1]}
            )
            if created:
                user.set_password('Demo123!')
                user.role = acc['role']
                user.save()

            # Création des profils spécifiques
            if acc['role'] == 'ENSEIGNANT':
                Professeur.objects.get_or_create(user=user, defaults={'specialite': acc['spec']})
            elif acc['role'] == 'ETUDIANT':
                Etudiant.objects.get_or_create(
                    user=user, 
                    defaults={'promotion': p1, 'matricule': acc['mat'], 'frais_scolarite_total': 3500, 'frais_payes': 1500}
                )

        # 2. Création des Matières & Examens
        prof = Professeur.objects.first()
        m1, _ = Matiere.objects.get_or_create(nom='Machine Learning', code='ML101', coefficient=4, professeur=prof)
        m1.promotions.add(p1)

        ex1, _ = Examen.objects.get_or_create(nom='Final ML', matiere=m1, date_examen=timezone.now().date())

        # 3. Génération des Notes
        for etu in Etudiant.objects.all():
            Note.objects.get_or_create(
                etudiant=etu, 
                examen=ex1, 
                defaults={'valeur': Decimal(random.uniform(10, 18)).quantize(Decimal('0.00'))}
            )

        self.stdout.write(self.style.SUCCESS("Seeding terminé avec succès !"))
