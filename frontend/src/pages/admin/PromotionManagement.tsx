import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, GraduationCap } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../components/ui/Toast';
import Modal from '../../components/ui/Modal';
import type { Promotion } from '../../lib/types';

interface PromoWithCount extends Promotion {
  studentCount: number;
  matiereCount: number;
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
    setLoading(true);
    const { data } = await supabase.from('promotions').select('*').order('annee', { ascending: false });
    const result: PromoWithCount[] = [];
    for (const promo of data ?? []) {
      const [{ count: sc }, { count: mc }] = await Promise.all([
        supabase.from('etudiants').select('*', { count: 'exact', head: true }).eq('promotion_id', promo.id),
        supabase.from('matiere_promotions').select('*', { count: 'exact', head: true }).eq('promotion_id', promo.id),
      ]);
      result.push({ ...promo, studentCount: sc ?? 0, matiereCount: mc ?? 0 });
    }
    setPromotions(result);
    setLoading(false);
  };

  useEffect(() => { fetchPromos(); }, []);

  const openCreate = () => { setEditPromo(null); setForm({ nom: '', annee: new Date().getFullYear() }); setShowModal(true); };
  const openEdit = (promo: Promotion) => { setEditPromo(promo); setForm({ nom: promo.nom, annee: promo.annee }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.nom) return;
    if (editPromo) {
      const { error } = await supabase.from('promotions').update(form).eq('id', editPromo.id);
      if (error) { showToast('Erreur lors de la mise à jour.', 'error'); return; }
      showToast('Promotion mise à jour.', 'success');
    } else {
      const { error } = await supabase.from('promotions').insert(form);
      if (error) { showToast('Erreur lors de la création.', 'error'); return; }
      showToast('Promotion créée.', 'success');
    }
    setShowModal(false);
    fetchPromos();
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const { error } = await supabase.from('promotions').delete().eq('id', confirmDelete.id);
    if (error) { showToast('Erreur lors de la suppression.', 'error'); }
    else { showToast('Promotion supprimée.', 'success'); }
    setConfirmDelete(null);
    fetchPromos();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">{promotions.length} promotion(s) configurée(s)</p>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-medium hover:bg-sky-700 transition-colors">
          <Plus size={15} />
          Nouvelle Promotion
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-36 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {promotions.map((promo, i) => (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 group hover:border-sky-300 dark:hover:border-sky-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center">
                  <GraduationCap size={18} className="text-sky-600 dark:text-sky-400" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(promo)} className="p-1.5 rounded-lg text-gray-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => setConfirmDelete(promo)} className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{promo.nom}</h3>
              <p className="text-sm text-gray-400 mt-0.5">Promotion {promo.annee}</p>
              <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{promo.studentCount}</p>
                  <p className="text-xs text-gray-400">Étudiants</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{promo.matiereCount}</p>
                  <p className="text-xs text-gray-400">Matières</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editPromo ? 'Modifier la Promotion' : 'Nouvelle Promotion'} size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nom de la promotion</label>
            <input type="text" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} placeholder="Ex: Master 1 IA" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Année</label>
            <input type="number" value={form.annee} onChange={e => setForm(f => ({ ...f, annee: parseInt(e.target.value) }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">Annuler</button>
            <button onClick={handleSave} disabled={!form.nom} className="px-4 py-2 text-sm bg-sky-600 text-white rounded-xl hover:bg-sky-700 disabled:opacity-50 transition-colors">
              {editPromo ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Supprimer la Promotion" size="sm">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Supprimer <strong className="text-gray-900 dark:text-white">{confirmDelete?.nom}</strong> ? Les étudiants associés perdront leur affectation.
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">Annuler</button>
            <button onClick={handleDelete} className="px-4 py-2 text-sm bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors">Supprimer</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
