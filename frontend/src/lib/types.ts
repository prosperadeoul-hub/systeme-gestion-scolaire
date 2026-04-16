export type Role = 'ADMIN' | 'ENSEIGNANT' | 'ETUDIANT';
export type Categorie = 'TECH' | 'SOFT' | 'LANG' | 'SCIE';

export interface Profile {
  id: string;
  role: Role;
  full_name: string;
  email: string;
  created_at: string;
  avatar_url?: string;
}

export interface Promotion {
  id: string;
  nom: string;
  annee: number;
  created_at: string;
  // Ajout des compteurs pour PromotionManagement.tsx
  student_count?: number;
  matiere_count?: number;
}

export interface Professeur {
  id: string;
  user_id: string;
  specialite: string;
  full_name?: string;
  profile?: Profile;
}

export interface Etudiant {
  id: string;
  user_id: string;
  promotion_id: string | null;
  matricule: string;
  frais_scolarite_total: number;
  frais_payes: number;
  profile?: Profile;
  promotion?: Promotion;
}

export interface Matiere {
  id: string;
  nom: string;
  code: string;
  coefficient: number;
  categorie: Categorie;
  promotion_ids: string[]; // Utilisé pour le multi-select côté client
  professeur_id: string | null;
  professeur?: Professeur;
  professeur_nom?: string; // Champ calculé par Django (annotate) pour MatieresManagement.tsx
}

export interface Examen {
  id: string;
  nom: string;
  matiere_id: string;
  date_examen: string;
  coefficient?: number; // Souvent différent du coeff de la matière
  matiere?: Matiere;
}

export interface Note {
  id: string;
  etudiant_id: string;
  examen_id: string;
  valeur: number; // Sur 20
  commentaire: string;
  created_at: string;
  examen?: Examen;
  etudiant?: Etudiant;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export type Page =
  | 'dashboard'
  | 'programme'
  | 'notes-saisie'
  | 'bulletins'     
  | 'admin-overview'
  | 'admin-users'
  | 'admin-promotions'
  | 'admin-matieres'
  | 'admin-scolarite';