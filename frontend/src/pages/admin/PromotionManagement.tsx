import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, GraduationCap, AlertCircle } from 'lucide-react';
import api from '../../lib/api'; // Ton instance Axios
import { useToast } from '../../components/ui/Toast';
import Modal from '../../components/ui/Modal';
import type { Promotion } from '../../lib/types';

// Interface enrichie pour l'affichage des compteurs
interface PromoWithCount extends Promotion {
  student_count: number;
  matiere_count: number;
}

export default function PromotionManagement() {
  const { showToast } = useToast();
  const [promotions, setPromotions] = useState<PromoWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editPromo, setEditPromo] = useState<Promotion | null>(null);
  const [form, setForm] = useState({ nom: '', annee: new Date().getFullYear() });
  const [confirmDelete, setConfirmDelete] = useState<Promotion | null>(null);

  const fetchPromos = async () => {
    try {
      setLoading(true);
      // Django renvoie directement les promotions avec les champs calculés (Annotate en Python)
      const response = await api.get('/admin/promotions/');
      setPromotions(response.data);
    } catch (err) {
      showToast('Erreur lors du chargement des promotions depuis MySQL.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPromos(); }, []);

  const openCreate = () => { 
    setEditPromo(null); 
    setForm({ nom: '', annee: new Date().getFullYear() }); 
    setShowModal(true); 
  };

  const openEdit = (promo: Promotion) => { 
    setEditPromo(promo); 
    setForm({ nom: promo.nom, annee: promo.annee }); 
    setShowModal(true); 
  };

  const handleSave = async () => {
    if (!form.nom) return;
    try {
      if (editPromo) {
        await api.put(`/admin/promotions/${editPromo.id}/`, form);
        showToast('Promotion mise à jour avec succès.', 'success');
      } else {
        await api.post('/admin/promotions/', form);
        showToast('Nouvelle promotion enregistrée.', 'success');
      }
      setShowModal(false);
      fetchPromos();
    } catch (err) {
      showToast('Erreur lors de la sauvegarde.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/admin/promotions/${confirmDelete.id}/`);
      showToast('Promotion supprimée de la base de données.', 'success');
      setConfirmDelete(null);
      fetchPromos();
    } catch (err) {
      showToast('Impossible de supprimer : la promotion est probablement liée à des étudiants.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Structure Académique</h2>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{promotions.length} Promotion(s) actives</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-bold hover:bg-sky-700 transition-all active:scale-95 shadow-lg shadow-sky-100 dark:shadow-none">
          <Plus size={16} />
          Nouvelle Promotion
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 bg-gray-50 dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-gray-800 animate-pulse" />
          ))}
        </div>
      ) : promotions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-800/20 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
           <GraduationCap size={48} className="text-gray-300 mb-4" />
           <p className="text-gray-500 font-medium">Aucune promotion configurée dans MySQL.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {promotions.map((promo, i) => (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 group hover:border-sky-400 dark:hover:border-sky-600 transition-all hover:shadow-xl shadow-sky-100/50"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400">
                  <GraduationCap size={22} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                  <button onClick={() => openEdit(promo)} className="p-2 rounded-xl text-gray-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/40 transition-colors">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => setConfirmDelete(promo)} className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/40 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{promo.nom}</h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 uppercase tracking-widest">
                  Année {promo.annee}
                </span>
              </div>

              <div className="flex gap-8 mt-6 pt-6 border-t border-gray-50 dark:border-gray-800/50">
                <div className="space-y-1">
                  <p className="text-2xl font-black text-gray-900 dark:text-white tabular-nums leading-none">
                    {promo.student_count}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Étudiants inscrits</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-black text-gray-900 dark:text-white tabular-nums leading-none">
                    {promo.matiere_count}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Matières assignées</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal Formulaire */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editPromo ? 'Expert : Mise à jour Promotion' : 'Expert : Nouvelle Promotion'} size="sm">
        <div className="space-y-5 p-2">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Intitulé de la promotion</label>
            <input type="text" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} placeholder="Ex: Master 1 Intelligence Artificielle" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold focus:ring-2 focus:ring-sky-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Année académique (Début)</label>
            <input type="number" value={form.annee} onChange={e => setForm(f => ({ ...f, annee: parseInt(e.target.value) }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-bold focus:ring-2 focus:ring-sky-500 outline-none transition-all" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button onClick={() => setShowModal(false)} className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">Fermer</button>
            <button onClick={handleSave} disabled={!form.nom} className="px-6 py-2 bg-sky-600 text-white rounded-xl text-sm font-bold hover:bg-sky-700 shadow-lg shadow-sky-100 dark:shadow-none transition-all active:scale-95 disabled:opacity-50">
              {editPromo ? 'Sauvegarder les modifications' : 'Confirmer l\'enregistrement'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Suppression */}
      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Contrôle d'intégrité" size="sm">
        <div className="p-1">
          <div className="flex items-center gap-3 text-rose-600 mb-4 bg-rose-50 dark:bg-rose-900/20 p-3 rounded-xl">
            <AlertCircle size={20} />
            <p className="text-xs font-bold uppercase tracking-wider">Avertissement critique</p>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            Vous allez supprimer la promotion <span className="font-bold text-gray-900 dark:text-white">{confirmDelete?.nom}</span>. 
            Notez que MySQL bloquera cette action si des étudiants y sont encore rattachés (Contrainte de clé étrangère).
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm font-bold text-gray-400">Annuler</button>
            <button onClick={handleDelete} className="px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 shadow-lg shadow-rose-100 dark:shadow-none transition-all active:scale-95">Confirmer la destruction</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}