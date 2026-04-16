import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { BookOpen, Users, TrendingUp, ClipboardList } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import KPICard from '../../components/ui/KPICard';
import { KPICardSkeleton, ChartSkeleton } from '../../components/ui/Skeleton';
import type { Matiere } from '../../lib/types';

interface ExamStats {
  examNom: string;
  matiereNom: string;
  moyenne: number;
  totalEleves: number;
  audessus: number;
  distribution: { range: string; count: number }[];
}

interface MatiereWithStats extends Matiere {
  stats: ExamStats[];
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [matieres, setMatieres] = useState<MatiereWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatiere, setSelectedMatiere] = useState<MatiereWithStats | null>(null);

  useEffect(() => {
    if (!user) return;
    async function fetchData() {
      const { data: prof } = await supabase.from('professeurs').select('id').eq('user_id', user!.id).maybeSingle();
      if (!prof) { setLoading(false); return; }

      const { data: mats } = await supabase.from('matieres').select('*').eq('professeur_id', prof.id);
      if (!mats) { setLoading(false); return; }

      const result: MatiereWithStats[] = [];
      for (const mat of mats) {
        const { data: examens } = await supabase.from('examens').select('*').eq('matiere_id', mat.id);
        const stats: ExamStats[] = [];
        for (const exam of examens ?? []) {
          const { data: notes } = await supabase.from('notes').select('valeur').eq('examen_id', exam.id);
          const vals = (notes ?? []).map(n => n.valeur);
          if (vals.length === 0) continue;
          const moyenne = vals.reduce((a, b) => a + b, 0) / vals.length;
          const audessus = vals.filter(v => v >= 10).length;
          const distribution = [
            { range: '0-5', count: vals.filter(v => v < 5).length },
            { range: '5-10', count: vals.filter(v => v >= 5 && v < 10).length },
            { range: '10-14', count: vals.filter(v => v >= 10 && v < 14).length },
            { range: '14-20', count: vals.filter(v => v >= 14).length },
          ];
          stats.push({ examNom: exam.nom, matiereNom: mat.nom, moyenne: Math.round(moyenne * 100) / 100, totalEleves: vals.length, audessus, distribution });
        }
        result.push({ ...mat, stats } as MatiereWithStats);
      }
      setMatieres(result);
      setSelectedMatiere(result[0] ?? null);
      setLoading(false);
    }
    fetchData();
  }, [user]);

  const totalStudents = selectedMatiere?.stats[0]?.totalEleves ?? 0;
  const avgAll = selectedMatiere && selectedMatiere.stats.length > 0
    ? Math.round(selectedMatiere.stats.reduce((a, s) => a + s.moyenne, 0) / selectedMatiere.stats.length * 100) / 100
    : 0;
  const allDist = selectedMatiere?.stats[0]?.distribution ?? [];

  const barColors = ['#ef4444', '#f59e0b', '#0ea5e9', '#10b981'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <KPICardSkeleton key={i} />) : (
          <>
            <KPICard title="Matières Assignées" value={matieres.length} icon={<BookOpen size={16} />} color="sky" delay={0} />
            <KPICard title="Total Examens" value={matieres.reduce((a, m) => a + m.stats.length, 0)} icon={<ClipboardList size={16} />} color="amber" delay={0.1} />
            <KPICard title="Élèves Concernés" value={totalStudents} icon={<Users size={16} />} color="emerald" delay={0.2} subtitle="Dans la matière sélectionnée" />
            <KPICard title="Moyenne Générale" value={`${avgAll}/20`} icon={<TrendingUp size={16} />} color={avgAll >= 10 ? 'emerald' : 'rose'} delay={0.3} subtitle="Matière sélectionnée" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">Mes Matières</h3>
          <p className="text-xs text-gray-400 mb-4">Sélectionnez une matière pour analyser</p>
          {loading ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />)}</div>
          ) : matieres.length === 0 ? (
            <p className="text-center py-6 text-gray-400 text-sm">Aucune matière assignée.</p>
          ) : (
            <div className="space-y-2">
              {matieres.map((mat, i) => {
                const isSelected = selectedMatiere?.id === mat.id;
                const catBadge: Record<string, string> = {
                  TECH: 'text-sky-500 dark:text-sky-400', SOFT: 'text-amber-500', LANG: 'text-emerald-500', SCIE: 'text-rose-500',
                };
                return (
                  <motion.button
                    key={mat.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedMatiere(mat)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${isSelected ? 'bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'}`}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${catBadge[mat.categorie]}`}>
                      <BookOpen size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold truncate ${isSelected ? 'text-sky-700 dark:text-sky-300' : 'text-gray-800 dark:text-gray-200'}`}>{mat.nom}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{mat.code} · Coeff {mat.coefficient}</p>
                    </div>
                    <span className="text-[10px] text-gray-400">{mat.stats.length} exam.</span>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        <div className="xl:col-span-2 space-y-4">
          {loading ? (
            <>
              <ChartSkeleton />
              <ChartSkeleton />
            </>
          ) : selectedMatiere ? (
            <>
              <motion.div
                key={selectedMatiere.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Distribution des Notes</h3>
                <p className="text-xs text-gray-400 mb-4">{selectedMatiere.nom} — répartition par tranche</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={allDist} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #e5e7eb' }} />
                    <Bar dataKey="count" name="Élèves" radius={[6, 6, 0, 0]}>
                      {allDist.map((_, i) => <Cell key={i} fill={barColors[i % barColors.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div
                key={`${selectedMatiere.id}-exams`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Résultats par Examen</h3>
                <p className="text-xs text-gray-400 mb-4">Moyennes et taux de réussite</p>
                <div className="space-y-3">
                  {selectedMatiere.stats.length === 0 ? (
                    <p className="text-center py-4 text-gray-400 text-sm">Aucun examen enregistré.</p>
                  ) : selectedMatiere.stats.map(stat => {
                    const pct = stat.totalEleves > 0 ? Math.round((stat.audessus / stat.totalEleves) * 100) : 0;
                    return (
                      <div key={stat.examNom} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{stat.examNom}</p>
                          <p className="text-xs text-gray-400">{stat.totalEleves} élèves</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-base font-bold ${stat.moyenne >= 10 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{stat.moyenne}/20</p>
                          <p className="text-xs text-gray-400">{pct}% réussite</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              Sélectionnez une matière pour voir les statistiques
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
