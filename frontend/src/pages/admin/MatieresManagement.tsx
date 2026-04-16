import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import { supabase } from '../../lib/supabase';
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
  const [professeurs, setProfesseurs] = useState<(Professeur & { profile: { full_name: string } })[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMatiere, setEditMatiere] = useState<Matiere | null>(null);
  const [form, setForm] = useState<MatiereForm>({ nom: '', code: '', coefficient: 1, categorie: 'TECH', professeur_id: '', promotion_ids: [] });
  const [confirmDelete, setConfirmDelete] = useState<Matiere | null>(null);
  const [catFilter, setCatFilter] = useState('ALL');

  const fetchData = async () => {
    setLoading(true);
    const [{ data: mats }, { data: profs }, { data: promos }] = await Promise.all([
      supabase.from('matieres').select('*, professeur:professeurs(id, specialite, profile:profiles(full_name))').order('nom'),
      supabase.from('professeurs').select('*, profile:profiles(full_name)'),
      supabase.from('promotions').select('*'),
    ]);
    setMatieres((mats ?? []) as Matiere[]);
    setProfesseurs((profs ?? []) as (Professeur & { profile: { full_name: string } })[]);
    setPromotions((promos ?? []) as Promotion[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditMatiere(null);
    setForm({ nom: '', code: '', coefficient: 1, categorie: 'TECH', professeur_id: professeurs[0]?.id ?? '', promotion_ids: [] });
    setShowModal(true);
  };

  const openEdit = async (matiere: Matiere) => {
    const { data: mpRows } = await supabase.from('matiere_promotions').select('promotion_id').eq('matiere_id', matiere.id);
    const promotionIds = mpRows?.map(r => r.promotion_id) ?? [];
    setEditMatiere(matiere);
    setForm({ nom: matiere.nom, code: matiere.code, coefficient: matiere.coefficient, categorie: matiere.categorie, professeur_id: matiere.professeur_id ?? '', promotion_ids: promotionIds });
    setShowModal(true);
  };

  const handleSave = async () => {
    const { promotion_ids, ...matiereData } = form;
    if (!matiereData.nom || !matiereData.code) return;
    let matiereId = editMatiere?.id;

    if (editMatiere) {
      const { error } = await supabase.from('matieres').update(matiereData).eq('id', editMatiere.id);
      if (error) { showToast('Erreur lors de la mise à jour.', 'error'); return; }
    } else {
      const { data, error } = await supabase.from('matieres').insert(matiereData).select().maybeSingle();
      if (error || !data) { showToast('Erreur lors de la création.', 'error'); return; }
      matiereId = data.id;
    }

    if (matiereId) {
      await supabase.from('matiere_promotions').delete().eq('matiere_id', matiereId);
      for (const promoId of promotion_ids) {
        await supabase.from('matiere_promotions').insert({ matiere_id: matiereId, promotion_id: promoId });
      }
    }

    showToast(editMatiere ? 'Matière mise à jour.' : 'Matière créée.', 'success');
    setShowModal(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const { error } = await supabase.from('matieres').delete().eq('id', confirmDelete.id);
    if (error) showToast('Erreur lors de la suppression.', 'error');
    else showToast('Matière supprimée.', 'success');
    setConfirmDelete(null);
    fetchData();
  };

  const filtered = catFilter === 'ALL' ? matieres : matieres.filter(m => m.categorie === catFilter);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'TECH', 'SOFT', 'LANG', 'SCIE'].map(cat => (
            <button key={cat} onClick={() => setCatFilter(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${catFilter === cat ? 'bg-sky-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-sky-300'}`}>
              {cat === 'ALL' ? 'Toutes' : CAT_LABELS[cat]}
            </button>
          ))}
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-medium hover:bg-sky-700 transition-colors shrink-0">
          <Plus size={15} />
          Nouvelle Matière
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-6 py-3 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          <div className="col-span-3">Matière</div>
          <div className="col-span-1">Code</div>
          <div className="col-span-2">Catégorie</div>
          <div className="col-span-1">Coeff</div>
          <div className="col-span-3">Enseignant</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {loading ? (
          <div className="p-4 space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">Aucune matière trouvée.</div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {filtered.map((matiere, i) => {
              const profName = (matiere.professeur as { profile?: { full_name?: string } } | null)?.profile?.full_name ?? 'Non assigné';
              return (
                <motion.div
                  key={matiere.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="grid grid-cols-12 gap-2 px-6 py-3.5 items-center hover:bg-gray-50 dark:hover:bg-gray-800/30 group"
                >
                  <div className="col-span-3 flex items-center gap-2">
                    <BookOpen size={14} className="text-gray-400 shrink-0" />
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{matiere.nom}</span>
                  </div>
                  <div className="col-span-1 font-mono text-xs text-gray-400">{matiere.code}</div>
                  <div className="col-span-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CAT_COLORS[matiere.categorie]}`}>
                      {CAT_LABELS[matiere.categorie]}
                    </span>
                  </div>
                  <div className="col-span-1 text-sm font-bold text-sky-600 dark:text-sky-400">{matiere.coefficient}</div>
                  <div className="col-span-3 text-sm text-gray-600 dark:text-gray-400 truncate">{profName}</div>
                  <div className="col-span-2 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(matiere)} className="p-1.5 rounded-lg text-gray-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors"><Pencil size={13} /></button>
                    <button onClick={() => setConfirmDelete(matiere)} className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"><Trash2 size={13} /></button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editMatiere ? 'Modifier la Matière' : 'Nouvelle Matière'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nom de la matière</label>
              <input type="text" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} placeholder="Ex: Machine Learning" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Code</label>
              <input type="text" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="ML101" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Coefficient</label>
              <input type="number" min="1" max="10" value={form.coefficient} onChange={e => setForm(f => ({ ...f, coefficient: parseInt(e.target.value) || 1 }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Catégorie</label>
              <select value={form.categorie} onChange={e => setForm(f => ({ ...f, categorie: e.target.value as CategorieType }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                {Object.entries(CAT_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Enseignant</label>
              <select value={form.professeur_id} onChange={e => setForm(f => ({ ...f, professeur_id: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                <option value="">Non assigné</option>
                {professeurs.map(p => <option key={p.id} value={p.id}>{p.profile?.full_name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Promotions concernées</label>
              <div className="flex flex-wrap gap-2">
                {promotions.map(promo => {
                  const isSelected = form.promotion_ids.includes(promo.id);
                  return (
                    <button
                      key={promo.id}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, promotion_ids: isSelected ? f.promotion_ids.filter(id => id !== promo.id) : [...f.promotion_ids, promo.id] }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${isSelected ? 'bg-sky-600 text-white border-sky-600' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-sky-400'}`}
                    >
                      {promo.nom}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">Annuler</button>
            <button onClick={handleSave} disabled={!form.nom || !form.code} className="px-4 py-2 text-sm bg-sky-600 text-white rounded-xl hover:bg-sky-700 disabled:opacity-50 transition-colors">
              {editMatiere ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Supprimer la Matière" size="sm">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Supprimer <strong className="text-gray-900 dark:text-white">{confirmDelete?.nom}</strong> ? Toutes les notes associées seront également supprimées.
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
