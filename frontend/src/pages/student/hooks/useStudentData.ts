import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
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
    etudiant: null, notes: [], matieres: [], moyenneGenerale: 0,
    rang: 0, totalEtudiants: 0, tauxReussite: 0, soldeRestant: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function fetchData() {
      setLoading(true);
      const { data: etudiant } = await supabase
        .from('etudiants')
        .select('*, promotion:promotions(*)')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (!etudiant) { setLoading(false); return; }

      const { data: notesRaw } = await supabase
        .from('notes')
        .select('*, examen:examens(*, matiere:matieres(*))')
        .eq('etudiant_id', etudiant.id);

      const { data: matieresRaw } = await supabase
        .from('matieres')
        .select('*, professeur:professeurs(*, profile:profiles(full_name))')
        .in('id', await getPromotionMatiereIds(etudiant.promotion_id));

      const notes = (notesRaw ?? []) as Note[];
      const matieres = (matieresRaw ?? []) as Matiere[];

      const avgNote = calcMoyenneNotes(notes, matieres);

      const { data: allStudents } = await supabase
        .from('etudiants')
        .select('id')
        .eq('promotion_id', etudiant.promotion_id);

      let rang = 1;
      if (allStudents && allStudents.length > 1) {
        for (const other of allStudents) {
          if (other.id === etudiant.id) continue;
          const { data: otherNotes } = await supabase
            .from('notes')
            .select('*, examen:examens(*, matiere:matieres(*))')
            .eq('etudiant_id', other.id);
          const otherAvg = calcMoyenneNotes((otherNotes ?? []) as Note[], matieres);
          if (otherAvg > avgNote) rang++;
        }
      }

      const totalPassing = notes.filter(n => n.valeur >= 10).length;
      const tauxReussite = notes.length > 0 ? (totalPassing / notes.length) * 100 : 0;
      const soldeRestant = etudiant.frais_scolarite_total - etudiant.frais_payes;

      setData({
        etudiant: etudiant as Etudiant,
        notes,
        matieres,
        moyenneGenerale: Math.round(avgNote * 100) / 100,
        rang,
        totalEtudiants: allStudents?.length ?? 0,
        tauxReussite: Math.round(tauxReussite),
        soldeRestant: Math.round(soldeRestant * 100) / 100,
      });
      setLoading(false);
    }
    fetchData();
  }, [user]);

  return { data, loading };
}

async function getPromotionMatiereIds(promotionId: string | null): Promise<string[]> {
  if (!promotionId) return [];
  const { data } = await supabase.from('matiere_promotions').select('matiere_id').eq('promotion_id', promotionId);
  return data?.map(d => d.matiere_id) ?? [];
}

function calcMoyenneNotes(notes: Note[], matieres: Matiere[]): number {
  if (notes.length === 0) return 0;
  const matiereMap = new Map(matieres.map(m => [m.id, m]));
  let totalWeighted = 0, totalCoeff = 0;

  const notesByMatiere = new Map<string, number[]>();
  for (const note of notes) {
    const matiereId = (note.examen as { matiere?: { id: string } })?.matiere?.id;
    if (!matiereId) continue;
    if (!notesByMatiere.has(matiereId)) notesByMatiere.set(matiereId, []);
    notesByMatiere.get(matiereId)!.push(note.valeur);
  }

  for (const [matiereId, vals] of notesByMatiere.entries()) {
    const matiere = matiereMap.get(matiereId);
    const coeff = matiere?.coefficient ?? 1;
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    totalWeighted += avg * coeff;
    totalCoeff += coeff;
  }

  return totalCoeff > 0 ? totalWeighted / totalCoeff : 0;
}
