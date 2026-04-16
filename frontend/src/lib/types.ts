export type Role = 'ADMIN' | 'ENSEIGNANT' | 'ETUDIANT';
export type Categorie = 'TECH' | 'SOFT' | 'LANG' | 'SCIE';

export interface Profile {
  id: string;
  role: Role;
  full_name: string;
  email: string;
  created_at: string;
}

export interface Promotion {
  id: string;
  nom: string;
  annee: number;
  created_at: string;
}

export interface Professeur {
  id: string;
  user_id: string;
  specialite: string;
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
  professeur_id: string | null;
  professeur?: Professeur;
}

export interface Examen {
  id: string;
  nom: string;
  matiere_id: string;
  date_examen: string;
  matiere?: Matiere;
}

export interface Note {
  id: string;
  etudiant_id: string;
  examen_id: string;
  valeur: number;
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
  | 'admin-overview'
  | 'admin-users'
  | 'admin-promotions'
  | 'admin-matieres';
