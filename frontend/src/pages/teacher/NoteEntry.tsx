import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import Modal from '../../components/ui/Modal';
import type { Matiere, Examen } from '../../lib/types';

interface StudentRow {
  etudiantId: string;
  nom: string;
  matricule: string;
  noteId: string | null;
  valeur: string;
  commentaire: string;
}

export default function NoteEntry() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [examens, setExamens] = useState<Examen[]>([]);
  const [selectedMatiere, setSelectedMatiere] = useState('');
  const [selectedExamen, setSelectedExamen] = useState('');
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showNewExamen, setShowNewExamen] = useState(false);
  const [newExamenNom, setNewExamenNom] = useState('');
  const [newExamenDate, setNewExamenDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!user) return;
    async function loadMatieres() {
      const { data: prof } = await supabase.from('professeurs').select('id').eq('user_id', user!.id).maybeSingle();
      if (!prof) return;
      const { data } = await supabase.from('matieres').select('*').eq('professeur_id', prof.id);
      setMatieres((data ?? []) as Matiere[]);
      if (data && data.length > 0) setSelectedMatiere(data[0].id);
    }
    loadMatieres();
  }, [user]);

  useEffect(() => {
    if (!selectedMatiere) return;
    async function loadExamens() {
      const { data } = await supabase.from('examens').select('*').eq('matiere_id', selectedMatiere).order('date_examen');
      setExamens((data ?? []) as Examen[]);
      setSelectedExamen(data?.[0]?.id ?? '');
    }
    loadExamens();
  }, [selectedMatiere]);

  useEffect(() => {
    if (!selectedExamen || !selectedMatiere) return;
    async function loadStudents() {
      setLoading(true);
      const { data: mpRows } = await supabase
        .from('matiere_promotions')
        .select('promotion_id')
        .eq('matiere_id', selectedMatiere);
      const promoIds = mpRows?.map(r => r.promotion_id) ?? [];
      if (promoIds.length === 0) { setLoading(false); return; }

      const { data: etudiants } = await supabase
        .from('etudiants')
        .select('id, matricule, profile:profiles(full_name)')
        .in('promotion_id', promoIds);

      const { data: notesExist } = await supabase.from('notes').select('*').eq('examen_id', selectedExamen);

      const rows: StudentRow[] = (etudiants ?? []).map(e => {
        const existingNote = notesExist?.find(n => n.etudiant_id === e.id);
        const prof = e.profile as { full_name?: string } | null;
        return {
          etudiantId: e.id,
          nom: prof?.full_name ?? 'Inconnu',
          matricule: e.matricule,
          noteId: existingNote?.id ?? null,
          valeur: existingNote ? String(existingNote.valeur) : '',
          commentaire: existingNote?.commentaire ?? '',
        };
      });
      setStudents(rows);
      setLoading(false);
    }
    loadStudents();
  }, [selectedExamen, selectedMatiere]);

  const updateStudentNote = (etudiantId: string, field: 'valeur' | 'commentaire', value: string) => {
    setStudents(prev => prev.map(s => s.etudiantId === etudiantId ? { ...s, [field]: value } : s));
  };

  const handleSave = async () => {
    setSaving(true);
    let saved = 0;
    for (const student of students) {
      if (student.valeur === '') continue;
      const valeur = parseFloat(student.valeur);
      if (isNaN(valeur) || valeur < 0 || valeur > 20) continue;
      if (student.noteId) {
        await supabase.from('notes').update({ valeur, commentaire: student.commentaire }).eq('id', student.noteId);
      } else {
        const { data } = await supabase.from('notes').insert({ etudiant_id: student.etudiantId, examen_id: selectedExamen, valeur, commentaire: student.commentaire }).select().maybeSingle();
        if (data) {
          setStudents(prev => prev.map(s => s.etudiantId === student.etudiantId ? { ...s, noteId: data.id } : s));
        }
      }
      saved++;
    }
    setSaving(false);
    showToast(`${saved} note(s) sauvegardée(s) avec succès.`, 'success');
  };

  const handleCreateExamen = async () => {
    if (!newExamenNom || !newExamenDate) return;
    const { data } = await supabase.from('examens').insert({ nom: newExamenNom, matiere_id: selectedMatiere, date_examen: newExamenDate }).select().maybeSingle();
    if (data) {
      setExamens(prev => [...prev, data as Examen]);
      setSelectedExamen(data.id);
      setShowNewExamen(false);
      setNewExamenNom('');
      showToast('Examen créé.', 'success');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Paramètres de saisie</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Matière</label>
            <select value={selectedMatiere} onChange={e => setSelectedMatiere(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
              {matieres.map(m => <option key={m.id} value={m.id}>{m.nom} ({m.code})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Examen</label>
            <div className="flex gap-2">
              <select value={selectedExamen} onChange={e => setSelectedExamen(e.target.value)} className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                {examens.length === 0 ? <option value="">Aucun examen</option> : examens.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
              </select>
              <button onClick={() => setShowNewExamen(true)} className="px-3 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors">
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Saisie des Notes</h3>
            <p className="text-xs text-gray-400 mt-0.5">{students.length} étudiant(s) · Notes de 0 à 20</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || students.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />)}
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            {!selectedExamen ? 'Créez ou sélectionnez un examen pour commencer.' : 'Aucun étudiant trouvé pour cette matière.'}
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
            <div className="grid grid-cols-12 gap-3 px-6 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <div className="col-span-1">N°</div>
              <div className="col-span-1">Mat.</div>
              <div className="col-span-3">Étudiant</div>
              <div className="col-span-2">Note /20</div>
              <div className="col-span-5">Commentaire</div>
            </div>
            {students.map((student, i) => {
              const noteVal = parseFloat(student.valeur);
              const isValid = student.valeur === '' || (!isNaN(noteVal) && noteVal >= 0 && noteVal <= 20);
              return (
                <motion.div
                  key={student.etudiantId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="grid grid-cols-12 gap-3 px-6 py-3 items-center hover:bg-gray-50 dark:hover:bg-gray-800/30"
                >
                  <div className="col-span-1 text-sm text-gray-400 font-mono">{i + 1}</div>
                  <div className="col-span-1 text-xs font-mono text-gray-400">{student.matricule}</div>
                  <div className="col-span-3">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{student.nom}</p>
                    {student.noteId && <span className="text-[10px] text-emerald-500">Enregistrée</span>}
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.5"
                      value={student.valeur}
                      onChange={e => updateStudentNote(student.etudiantId, 'valeur', e.target.value)}
                      placeholder="—"
                      className={`w-full px-3 py-1.5 rounded-lg border text-sm font-semibold text-center focus:outline-none focus:ring-2 focus:ring-sky-500 transition ${!isValid ? 'border-rose-400 bg-rose-50 dark:bg-rose-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'}`}
                    />
                  </div>
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={student.commentaire}
                      onChange={e => updateStudentNote(student.etudiantId, 'commentaire', e.target.value)}
                      placeholder="Commentaire (optionnel)"
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Modal isOpen={showNewExamen} onClose={() => setShowNewExamen(false)} title="Créer un Examen" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nom de l'examen</label>
            <input type="text" value={newExamenNom} onChange={e => setNewExamenNom(e.target.value)} placeholder="Ex: Examen Final ML101" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date de l'examen</label>
            <input type="date" value={newExamenDate} onChange={e => setNewExamenDate(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowNewExamen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">Annuler</button>
            <button onClick={handleCreateExamen} disabled={!newExamenNom} className="px-4 py-2 text-sm bg-sky-600 text-white rounded-xl hover:bg-sky-700 disabled:opacity-50 transition-colors">Créer</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
