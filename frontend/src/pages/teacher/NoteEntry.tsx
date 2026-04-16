import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, Loader, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import Modal from '../../components/ui/Modal';
import type { Matiere, Examen } from '../../lib/types';

interface StudentRow {
  etudiant_id: string;
  nom: string;
  matricule: string;
  note_id: string | null;
  valeur: string;
  commentaire: string;
}

export default function NoteEntry() {
  const { showToast } = useToast();
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [examens, setExamens] = useState<Examen[]>([]);
  const [selectedMatiere, setSelectedMatiere] = useState('');
  const [selectedExamen, setSelectedExamen] = useState('');
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showNewExamen, setShowNewExamen] = useState(false);
  
  const [newExamen, setNewExamen] = useState({ nom: '', date: new Date().toISOString().split('T')[0] });

  // 1. Charger les matières gérées par le professeur (Auth gérée par le token API)
  useEffect(() => {
    async function loadInitialData() {
      try {
        const { data } = await api.get('/teacher/subjects/');
        setMatieres(data);
        if (data.length > 0) setSelectedMatiere(data[0].id);
      } catch (err) {
        showToast('Erreur lors du chargement des matières', 'error');
      }
    }
    loadInitialData();
  }, []);

  // 2. Charger les examens d'une matière
  useEffect(() => {
    if (!selectedMatiere) return;
    async function loadExamens() {
      const { data } = await api.get(`/teacher/subjects/${selectedMatiere}/exams/`);
      setExamens(data);
      setSelectedExamen(data[0]?.id ?? '');
    }
    loadExamens();
  }, [selectedMatiere]);

  // 3. Charger la liste des étudiants et leurs notes actuelles pour cet examen
  useEffect(() => {
    if (!selectedExamen) {
      setStudents([]);
      return;
    }
    async function loadGrades() {
      setLoading(true);
      try {
        const { data } = await api.get(`/teacher/exams/${selectedExamen}/grades/`);
        setStudents(data);
      } catch (err) {
        showToast('Erreur lors du chargement des notes', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadGrades();
  }, [selectedExamen]);

  const updateRow = (id: string, field: keyof StudentRow, value: string) => {
    setStudents(prev => prev.map(s => s.etudiant_id === id ? { ...s, [field]: value } : s));
  };

  // 4. Sauvegarde groupée (Bulk)
  const handleSave = async () => {
    setSaving(true);
    try {
      // On envoie tout le tableau, Django s'occupe du Update/Create
      await api.post(`/teacher/exams/${selectedExamen}/bulk-save/`, {
        grades: students.filter(s => s.valeur !== '').map(s => ({
          etudiant_id: s.etudiant_id,
          valeur: parseFloat(s.valeur),
          commentaire: s.commentaire
        }))
      });
      showToast('Notes synchronisées avec succès', 'success');
      // Rafraîchir pour obtenir les nouveaux note_id
      const { data } = await api.get(`/teacher/exams/${selectedExamen}/grades/`);
      setStudents(data);
    } catch (err) {
      showToast('Erreur lors de la sauvegarde groupée', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateExamen = async () => {
    if (!newExamen.nom) return;
    try {
      const { data } = await api.post(`/teacher/subjects/${selectedMatiere}/exams/`, newExamen);
      setExamens(prev => [...prev, data]);
      setSelectedExamen(data.id);
      setShowNewExamen(false);
      setNewExamen({ ...newExamen, nom: '' });
      showToast('Examen créé avec succès', 'success');
    } catch (err) {
      showToast('Erreur lors de la création', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-2 block">Discipline</label>
            <select 
              value={selectedMatiere} 
              onChange={e => setSelectedMatiere(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-sky-500"
            >
              {matieres.map(m => <option key={m.id} value={m.id}>{m.nom} ({m.code})</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-2 block">Évaluation</label>
            <div className="flex gap-2">
              <select 
                value={selectedExamen} 
                onChange={e => setSelectedExamen(e.target.value)}
                className="flex-1 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-sky-500"
              >
                {examens.length === 0 ? <option value="">Aucun examen enregistré</option> : examens.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
              </select>
              <button 
                onClick={() => setShowNewExamen(true)}
                className="p-3 bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 rounded-2xl hover:scale-105 transition-transform"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Registre de notation</h3>
            <p className="text-[11px] text-gray-400 font-medium">Standard Master 1 · Système 0-20</p>
          </div>
          
          <button
            onClick={handleSave}
            disabled={saving || students.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-sky-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-sky-700 disabled:opacity-50 transition-all shadow-lg shadow-sky-500/10"
          >
            {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Synchronisation...' : 'Valider la saisie'}
          </button>
        </div>

        {loading ? (
          <div className="p-12 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-gray-800">
                  <th className="px-8 py-4">Étudiant</th>
                  <th className="px-4 py-4 w-32 text-center">Note / 20</th>
                  <th className="px-4 py-4">Observations / Commentaires</th>
                  <th className="px-8 py-4 w-20 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {students.map((s) => {
                  const val = parseFloat(s.valeur);
                  const isInvalid = s.valeur !== '' && (isNaN(val) || val < 0 || val > 20);
                  
                  return (
                    <tr key={s.etudiant_id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <td className="px-8 py-4">
                        <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{s.nom}</p>
                        <p className="text-[10px] font-mono text-gray-400 mt-1 uppercase">{s.matricule}</p>
                      </td>
                      <td className="px-4 py-4">
                        <input
                          type="number"
                          value={s.valeur}
                          onChange={e => updateRow(s.etudiant_id, 'valeur', e.target.value)}
                          placeholder="—"
                          className={`w-full bg-transparent text-center text-sm font-black py-2 rounded-xl border-2 transition-all focus:ring-0 ${
                            isInvalid 
                            ? 'border-rose-500 text-rose-500 bg-rose-50' 
                            : 'border-transparent group-hover:border-gray-200 dark:group-hover:border-gray-700 focus:border-sky-500'
                          }`}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <input
                          type="text"
                          value={s.commentaire}
                          onChange={e => updateRow(s.etudiant_id, 'commentaire', e.target.value)}
                          placeholder="Ajouter une mention..."
                          className="w-full bg-transparent text-xs font-medium border-none focus:ring-0 text-gray-500 dark:text-gray-400"
                        />
                      </td>
                      <td className="px-8 py-4 text-right">
                        {s.note_id ? (
                          <CheckCircle2 size={16} className="text-emerald-500 inline-block" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700 inline-block" />
                        )}
                        {isInvalid && <AlertCircle size={16} className="text-rose-500 inline-block ml-2" />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={showNewExamen} onClose={() => setShowNewExamen(false)} title="Nouvelle Évaluation" size="sm">
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black uppercase text-gray-400 mb-2 block">Libellé de l'épreuve</label>
              <input 
                type="text" 
                value={newExamen.nom} 
                onChange={e => setNewExamen({...newExamen, nom: e.target.value})}
                placeholder="Ex: Devoir Surveillé 1" 
                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-sky-500" 
              />
            </div>
            <div>
              <label className="text-xs font-black uppercase text-gray-400 mb-2 block">Date de tenue</label>
              <input 
                type="date" 
                value={newExamen.date} 
                onChange={e => setNewExamen({...newExamen, date: e.target.value})}
                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-sky-500" 
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowNewExamen(false)} className="flex-1 px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors">Annuler</button>
            <button onClick={handleCreateExamen} disabled={!newExamen.nom} className="flex-1 px-4 py-3 bg-sky-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-sky-700 shadow-lg shadow-sky-500/20 disabled:opacity-50">Créer l'examen</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}