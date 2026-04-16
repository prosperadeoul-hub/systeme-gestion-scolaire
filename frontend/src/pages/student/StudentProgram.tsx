import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, User, Hash } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { TableSkeleton } from '../../components/ui/Skeleton';
import type { Matiere } from '../../lib/types';

const CATEGORIE_LABELS: Record<string, string> = {
  TECH: 'Technique', SOFT: 'Soft Skills', LANG: 'Langues', SCIE: 'Sciences',
};

const catColors: Record<string, string> = {
  TECH: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  SOFT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  LANG: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  SCIE: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

export default function StudentProgram() {
  const { user } = useAuth();
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [loading, setLoading] = useState(true);
  const [promotionNom, setPromotionNom] = useState('');

  useEffect(() => {
    if (!user) return;
    async function fetchProgram() {
      const { data: etudiant } = await supabase
        .from('etudiants')
        .select('promotion_id, promotion:promotions(nom, annee)')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (!etudiant?.promotion_id) { setLoading(false); return; }

      const promo = etudiant.promotion as { nom?: string; annee?: number } | null;
      setPromotionNom(`${promo?.nom ?? ''} ${promo?.annee ?? ''}`);

      const { data: mpRows } = await supabase
        .from('matiere_promotions')
        .select('matiere_id')
        .eq('promotion_id', etudiant.promotion_id);

      const ids = mpRows?.map(r => r.matiere_id) ?? [];
      if (ids.length === 0) { setLoading(false); return; }

      const { data: mats } = await supabase
        .from('matieres')
        .select('*, professeur:professeurs(id, specialite, profile:profiles(full_name))')
        .in('id', ids);

      setMatieres((mats ?? []) as Matiere[]);
      setLoading(false);
    }
    fetchProgram();
  }, [user]);

  const grouped = matieres.reduce<Record<string, Matiere[]>>((acc, m) => {
    if (!acc[m.categorie]) acc[m.categorie] = [];
    acc[m.categorie].push(m);
    return acc;
  }, {});

  const totalCoeff = matieres.reduce((a, m) => a + m.coefficient, 0);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-sky-600 to-sky-700 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center gap-3 mb-2">
          <BookOpen size={20} />
          <span className="font-semibold text-sky-100 text-sm">Programme de formation</span>
        </div>
        <h2 className="text-2xl font-bold">{loading ? '...' : promotionNom}</h2>
        <div className="flex gap-4 mt-3 text-sm text-sky-200">
          <span>{matieres.length} matières</span>
          <span>·</span>
          <span>{totalCoeff} crédits total</span>
        </div>
      </motion.div>

      {loading ? (
        <TableSkeleton rows={6} />
      ) : (
        Object.entries(grouped).map(([cat, items], idx) => (
          <motion.div
            key={cat}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${catColors[cat]}`}>
                {CATEGORIE_LABELS[cat] ?? cat}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{items.length} matière{items.length > 1 ? 's' : ''}</span>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {items.map(matiere => {
                const profName = (matiere.professeur as { profile?: { full_name?: string } } | null)?.profile?.full_name ?? 'Non assigné';
                const specialite = (matiere.professeur as { specialite?: string } | null)?.specialite ?? '';
                return (
                  <div key={matiere.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                      <BookOpen size={16} className="text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{matiere.nom}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Hash size={11} className="text-gray-400" />
                        <span className="text-xs text-gray-400 font-mono">{matiere.code}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <User size={13} className="text-gray-400" />
                      <div className="text-right">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{profName}</p>
                        {specialite && <p className="text-[10px] text-gray-400">{specialite}</p>}
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-900/20 flex flex-col items-center justify-center shrink-0">
                      <span className="text-base font-bold text-sky-600 dark:text-sky-400 leading-none">{matiere.coefficient}</span>
                      <span className="text-[9px] text-sky-400 dark:text-sky-500">coeff</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}
