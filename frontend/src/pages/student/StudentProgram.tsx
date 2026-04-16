import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, User, Hash, GraduationCap, Layers } from 'lucide-react';
import api from '../../lib/api';
import { TableSkeleton } from '../../components/ui/Skeleton';
import type { Matiere, Categorie } from '../../lib/types';

const CATEGORIE_LABELS: Record<Categorie, string> = {
  TECH: 'Expertise Technique', 
  SOFT: 'Soft Skills & Management', 
  LANG: 'Langues & Culture', 
  SCIE: 'Sciences Fondamentales',
};

const CATEGORIE_COLORS: Record<Categorie, string> = {
  TECH: 'bg-sky-50 text-sky-600 border-sky-100 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800/50',
  SOFT: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50',
  LANG: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50',
  SCIE: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/50',
};

export default function StudentProgram() {
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [loading, setLoading] = useState(true);
  const [progDetails, setProgDetails] = useState({ nom: '', promotion: '' });

  useEffect(() => {
    async function fetchProgram() {
      try {
        setLoading(true);
        // On récupère tout le programme en un seul appel Django optimisé
        const { data } = await api.get('/student/curriculum/');
        setMatieres(data.matieres);
        setProgDetails({ 
          nom: data.programme_nom, 
          promotion: data.promotion_label 
        });
      } catch (err) {
        console.error("Erreur lors de la récupération du programme", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProgram();
  }, []);

  const grouped = matieres.reduce<Record<string, Matiere[]>>((acc, m) => {
    if (!acc[m.categorie]) acc[m.categorie] = [];
    acc[m.categorie].push(m);
    return acc;
  }, {});

  const totalCoeff = matieres.reduce((a, m) => a + m.coefficient, 0);

  return (
    <div className="space-y-8">
      {/* Header : Curriculum d'Excellence */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gray-900 rounded-3xl p-8 text-white shadow-2xl"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-sky-500/20 rounded-lg backdrop-blur-md">
                <GraduationCap size={18} className="text-sky-400" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-400">Parcours Académique</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-2">
            {loading ? 'Chargement du cursus...' : progDetails.promotion}
          </h2>
          <p className="text-gray-400 text-sm font-medium max-w-md mb-6">
            Spécialisation en Intelligence Artificielle et Traitement d'Image. 
            Développement de compétences avancées pour l'ingénierie.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
                <span className="text-2xl font-black text-white">{matieres.length}</span>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Unités d'Ens.</span>
            </div>
            <div className="h-8 w-[1px] bg-gray-800" />
            <div className="flex flex-col">
                <span className="text-2xl font-black text-white">{totalCoeff}</span>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Crédits ECTS</span>
            </div>
          </div>
        </div>
        {/* Décoration abstraite pour le look Senior */}
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-sky-600/20 blur-[100px] rounded-full" />
      </motion.div>

      {loading ? (
        <TableSkeleton rows={8} />
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).map(([cat, items], idx) => (
            <motion.div
              key={cat}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="flex items-center gap-4 mb-5 px-2">
                <div className={`w-1 h-6 rounded-full ${cat === 'TECH' ? 'bg-sky-500' : 'bg-gray-300'}`} />
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  {CATEGORIE_LABELS[cat as Categorie] ?? cat}
                </h3>
                <span className="text-[10px] font-bold bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md text-gray-400">
                    {items.length} MODULES
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map(matiere => (
                  <div 
                    key={matiere.id} 
                    className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:border-sky-500/50 hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-mono font-bold text-sky-500 bg-sky-50 dark:bg-sky-950 px-2 py-0.5 rounded">
                                {matiere.code}
                            </span>
                            <span className="text-[10px] font-bold text-gray-300 group-hover:text-gray-400 transition-colors">
                                coeff {matiere.coefficient}
                            </span>
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-sky-600 transition-colors">
                            {matiere.nom}
                        </h4>
                        
                        <div className="mt-4 flex items-center gap-3 border-t border-gray-50 dark:border-gray-800 pt-4">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 font-bold text-[10px]">
                                {matiere.professeur?.profile?.full_name?.charAt(0) || '?'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-bold text-gray-700 dark:text-gray-300 truncate">
                                    {matiere.professeur?.profile?.full_name || 'En attente d\'attribution'}
                                </p>
                                <p className="text-[9px] text-gray-400 font-medium truncate italic">
                                    {matiere.professeur?.specialite || 'Expert Intervenant'}
                                </p>
                            </div>
                        </div>
                      </div>
                      
                      <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 group-hover:bg-sky-600 group-hover:text-white flex items-center justify-center transition-all">
                        <Layers size={18} className="opacity-40 group-hover:opacity-100" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}