import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import type { Etudiant, Note, Matiere } from '../../../lib/types';

export interface StudentStats {
  etudiant: Etudiant | null;
  notes: Note[];
  matieres: Matiere[];
  moyenneGenerale: number;
  rang: number;
  totalEtudiants: number;
  tauxReussite: number;
  soldeRestant: number;
}

export function useStudentData() {
  const { user } = useAuth();
  const [data, setData] = useState<StudentStats>({
    etudiant: null, 
    notes: [], 
    matieres: [], 
    moyenneGenerale: 0,
    rang: 0, 
    totalEtudiants: 0, 
    tauxReussite: 0, 
    soldeRestant: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      try {
        setLoading(true);
        
        /**
         * En Master 1, on optimise :
         * Au lieu de 10 requêtes Supabase, on fait UN SEUL appel à Django.
         * Le backend calcule le rang et la moyenne via des agrégations SQL (MySQL).
         */
        const response = await api.get('/student/dashboard-stats/');
        const payload = response.data;

        setData({
          etudiant: payload.etudiant,
          notes: payload.notes,
          matieres: payload.matieres,
          moyenneGenerale: payload.moyenne_generale,
          rang: payload.rang,
          totalEtudiants: payload.total_etudiants,
          tauxReussite: payload.taux_reussite,
          soldeRestant: payload.solde_restant,
        });
      } catch (err) {
        console.error("Erreur lors de la récupération des stats:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  return { data, loading };
}