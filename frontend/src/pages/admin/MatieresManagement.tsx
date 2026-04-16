import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import Modal from '../../components/ui/Modal';
import type { Matiere, Professeur, Promotion } from '../../lib/types';

type CategorieType = 'TECH' | 'SOFT' | 'LANG' | 'SCIE';

const CAT_COLORS: Record<string, string> = {
  TECH: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  SOFT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  LANG: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  SCIE: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

const CAT_LABELS: Record<string, string> = {
  TECH: 'Technique', SOFT: 'Soft Skills', LANG: 'Langues', SCIE: 'Sciences',
};

interface MatiereForm {
  nom: string;
  code: string;
  coefficient: number;
  categorie: CategorieType;
  professeur_id: string;
  promotion_ids: string[];
}

export default function MatieresManagement() {
  const { showToast } = useToast();
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [professeurs, setProfesseurs] = useState<(Professeur & { full_name: string })[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMatiere, setEditMatiere] = useState<Matiere | null>(null);
  const [form, setForm] = useState<MatiereForm>({ nom: '', code: '', coefficient: 1, categorie: 'TECH', professeur_id: '', promotion_ids: [] });
  const [confirmDelete, setConfirmDelete] = useState<Matiere | null>(null);
  const [catFilter, setCatFilter] = useState('ALL');

  const fetchData = async () => {
    try {
      setLoading(true);
      // Récupération des données via Django
      const [matsRes, profsRes, promosRes] = await Promise.all([
        api.get('/admin/matieres/'),
        api.get('/admin/professeurs/'),
        api.get('/admin/promotions/'),
      ]);
      setMatieres(matsRes.data);
      setProfesseurs(profsRes.data);
      setPromotions(promosRes.data);
    } catch (err) {
      showToast('Erreur lors du chargement des données MySQL.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditMatiere(null);
    setForm({ nom: '', code: '', coefficient: 1, categorie: 'TECH', professeur_id: '', promotion_ids: [] });
    setShowModal(true);
  };

  const openEdit = (matiere: Matiere) => {
    setEditMatiere(matiere);
    // On suppose que l'API renvoie déjà les IDs des promotions liées dans l'objet matiere
    setForm({
      nom: matiere.nom,
      code: matiere.code,
      coefficient: matiere.coefficient,
      categorie: matiere.categorie,
      professeur_id: matiere.professeur_id || '',
      promotion_ids: matiere.promotion_ids || [],
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.nom || !form.code) return;

    try {
      if (editMatiere) {
        await api.put(`/admin/matieres/${editMatiere.id}/`, form);
        showToast('Matière mise à jour dans MySQL.', 'success');
      } else {
        await api.post('/admin/matieres/', form);
        showToast('Nouvelle matière créée.', 'success');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      showToast('Erreur lors de la sauvegarde.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/admin/matieres/${confirmDelete.id}/`);
      showToast('Matière supprimée définitivement.', 'success');
      setConfirmDelete(null);
      fetchData();
    } catch (err) {
      showToast('Erreur lors de la suppression.', 'error');
    }
  };

  const filtered = catFilter === 'ALL' ? matieres : matieres.filter(m => m.categorie === catFilter);

  return (
    <div className="space-y-4">
      {/* Header & Filtres */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'TECH', 'SOFT', 'LANG', 'SCIE'].map(cat => (
            <button 
              key={cat} 
              onClick={() => setCatFilter(cat)} 
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${catFilter === cat ? 'bg-sky-600 text-white shadow-lg shadow-sky-200 dark:shadow-none' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:border-sky-300'}`}
            >
              {cat === 'ALL' ? 'Toutes' : CAT_LABELS[cat]}
            </button>
          ))}
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-bold hover:bg-sky-700 transition-transform active:scale-95 shadow-md">
          <Plus size={16} />
          Nouvelle Matière
        </button>
      </div>

      {/* Table / List */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="grid grid-cols-12 gap-2 px-6 py-4 border-b border-gray-100 dark:border-gray-800 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/20">
          <div className="col-span-3">Désignation</div>
          <div className="col-span-1">Code</div>
          <div className="col-span-2">Catégorie</div>
          <div className="col-span-1 text-center">Coeff</div>
          <div className="col-span-3">Enseignant</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {loading ? (
          <div className="p-4 space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-gray-50 dark:bg-gray-800/40 rounded-xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <BookOpen size={40} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 text-sm font-medium">Aucune donnée disponible dans MySQL.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {filtered.map((matiere, i) => (
              <motion.div
                key={matiere.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="grid grid-cols-12 gap-2 px-6 py-4 items-center hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group"
              >
                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-sky-600 transition-colors">
                    <BookOpen size={14} />
                  </div>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{matiere.nom}</span>
                </div>
                <div className="col-span-1 font-mono text-[11px] text-gray-400 font-bold">{matiere.code}</div>
                <div className="col-span-2">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-tight ${CAT_COLORS[matiere.categorie]}`}>
                    {CAT_LABELS[matiere.categorie]}
                  </span>
                </div>
                <div className="col-span-1 text-center text-sm font-black text-sky-600">{matiere.coefficient}</div>
                <div className="col-span-3 text-sm text-gray-500 dark:text-gray-400 truncate">
                  {matiere.professeur_id || 'Non assigné'}
                </div>
                <div className="col-span-2 flex justify-end gap-1">
                  <button onClick={() => openEdit(matiere)} className="p-2 rounded-lg text-gray-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-all"><Pencil size={14} /></button>
                  <button onClick={() => setConfirmDelete(matiere)} className="p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all"><Trash2 size={14} /></button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Formulaire */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editMatiere ? 'Expert : Modification UE' : 'Expert : Création UE'} size="md">
        <div className="space-y-5 p-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Libellé de l'unité d'enseignement</label>
              <input type="text" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold focus:ring-2 focus:ring-sky-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Code SIGD</label>
              <input type="text" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono focus:ring-2 focus:ring-sky-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Coefficient</label>
              <input type="number" min="1" value={form.coefficient} onChange={e => setForm(f => ({ ...f, coefficient: parseInt(e.target.value) || 1 }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-bold focus:ring-2 focus:ring-sky-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Classification</label>
              <select value={form.categorie} onChange={e => setForm(f => ({ ...f, categorie: e.target.value as CategorieType }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold focus:ring-2 focus:ring-sky-500 outline-none transition-all">
                {Object.entries(CAT_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Enseignant Responsable</label>
              <select value={form.professeur_id} onChange={e => setForm(f => ({ ...f, professeur_id: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold focus:ring-2 focus:ring-sky-500 outline-none transition-all">
                <option value="">Sélectionner...</option>
                {professeurs.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Promotions de destination</label>
              <div className="flex flex-wrap gap-2">
                {promotions.map(promo => {
                  const isSelected = form.promotion_ids.includes(promo.id);
                  return (
                    <button
                      key={promo.id}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, promotion_ids: isSelected ? f.promotion_ids.filter(id => id !== promo.id) : [...f.promotion_ids, promo.id] }))}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${isSelected ? 'bg-sky-600 text-white border-sky-600 shadow-md' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-sky-400'}`}
                    >
                      {promo.nom}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button onClick={() => setShowModal(false)} className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">Fermer</button>
            <button onClick={handleSave} className="px-6 py-2 bg-sky-600 text-white rounded-xl text-sm font-bold hover:bg-sky-700 shadow-lg shadow-sky-100 dark:shadow-none transition-all active:scale-95">
              {editMatiere ? 'Enregistrer les modifications' : 'Confirmer la création'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Suppression */}
      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Destruction de donnée" size="sm">
        <div className="p-1">
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            Vous êtes sur le point de supprimer <span className="font-bold text-gray-900 dark:text-white">{confirmDelete?.nom}</span>. 
            Cette action est irréversible dans la base MySQL et affectera les bulletins.
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm font-bold text-gray-400">Annuler</button>
            <button onClick={handleDelete} className="px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 shadow-lg shadow-rose-100 dark:shadow-none">Supprimer</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}