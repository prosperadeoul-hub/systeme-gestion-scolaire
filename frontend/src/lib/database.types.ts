export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; role: 'ADMIN' | 'ENSEIGNANT' | 'ETUDIANT'; full_name: string; email: string; created_at: string };
        Insert: { id: string; role: 'ADMIN' | 'ENSEIGNANT' | 'ETUDIANT'; full_name: string; email: string; created_at?: string };
        Update: { id?: string; role?: 'ADMIN' | 'ENSEIGNANT' | 'ETUDIANT'; full_name?: string; email?: string };
      };
      promotions: {
        Row: { id: string; nom: string; annee: number; created_at: string };
        Insert: { id?: string; nom: string; annee: number };
        Update: { nom?: string; annee?: number };
      };
      professeurs: {
        Row: { id: string; user_id: string; specialite: string; created_at: string };
        Insert: { id?: string; user_id: string; specialite: string };
        Update: { specialite?: string };
      };
      etudiants: {
        Row: { id: string; user_id: string; promotion_id: string | null; matricule: string; frais_scolarite_total: number; frais_payes: number; created_at: string };
        Insert: { id?: string; user_id: string; promotion_id?: string; matricule: string; frais_scolarite_total?: number; frais_payes?: number };
        Update: { promotion_id?: string; matricule?: string; frais_scolarite_total?: number; frais_payes?: number };
      };
      matieres: {
        Row: { id: string; nom: string; code: string; coefficient: number; categorie: 'TECH' | 'SOFT' | 'LANG' | 'SCIE'; professeur_id: string | null; created_at: string };
        Insert: { id?: string; nom: string; code: string; coefficient: number; categorie: 'TECH' | 'SOFT' | 'LANG' | 'SCIE'; professeur_id?: string };
        Update: { nom?: string; code?: string; coefficient?: number; categorie?: 'TECH' | 'SOFT' | 'LANG' | 'SCIE'; professeur_id?: string };
      };
      matiere_promotions: {
        Row: { matiere_id: string; promotion_id: string };
        Insert: { matiere_id: string; promotion_id: string };
        Update: Record<string, never>;
      };
      examens: {
        Row: { id: string; nom: string; matiere_id: string; date_examen: string; created_at: string };
        Insert: { id?: string; nom: string; matiere_id: string; date_examen: string };
        Update: { nom?: string; date_examen?: string };
      };
      notes: {
        Row: { id: string; etudiant_id: string; examen_id: string; valeur: number; commentaire: string; created_at: string };
        Insert: { id?: string; etudiant_id: string; examen_id: string; valeur: number; commentaire?: string };
        Update: { valeur?: number; commentaire?: string };
      };
    };
  };
}
