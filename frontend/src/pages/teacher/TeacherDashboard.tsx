import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { AcademicIcons, FinanceIcons } from '../../lib/icons';
import KPICard from '../../components/ui/KPICard';
import { KPICardSkeleton, ChartSkeleton } from '../../components/ui/Skeleton';

// Types alignés sur le Backend Django
interface ExamStats {
  examNom: string;
  moyenne: number;
  totalEleves: number;
  audessus: number;
  distribution: { range: string; count: number }[];
}

interface MatiereWithStats {
  id: string;
  nom: string;
  code: string;
  coefficient: number;
  categorie: 'TECH' | 'SOFT' | 'LANG' | 'SCIE';
  stats: ExamStats[];
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [matieres, setMatieres] = useState<MatiereWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatiere, setSelectedMatiere] = useState<MatiereWithStats | null>(null);

  useEffect(() => {
    if (!user) return;

    async function fetchDashboardData() {
      try {
        setLoading(true);
        // Appel unique au backend Django qui calcule tout
        const response = await api.get('/teacher/dashboard/');
        const data = response.data;
        
        setMatieres(data);
        if (data.length > 0) setSelectedMatiere(data[0]);
      } catch (err: any) {
        console.error("Erreur Dashboard:", err);
        setError("Impossible de charger les données depuis MySQL.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user]);

  // Calculs dérivés pour l'affichage
  const totalStudents = selectedMatiere?.stats[0]?.totalEleves ?? 0;
  const avgAll = selectedMatiere && selectedMatiere.stats.length > 0
    ? Math.round(selectedMatiere.stats.reduce((a, s) => a + s.moyenne, 0) / selectedMatiere.stats.length * 100) / 100
    : 0;
  const currentDist = selectedMatiere?.stats[0]?.distribution ?? [];

  const barColors = ['#ef4444', '#f59e0b', '#0ea5e9', '#10b981'];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 rounded-2xl p-6">
        <AlertCircle className="text-rose-500 mb-2" size={32} />
        <p className="text-rose-700 dark:text-rose-400 font-medium">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-sm text-rose-600 underline">Réessayer</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. KPI Section */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <KPICardSkeleton key={i} />) : (
          <>
            <KPICard title="Matières" value={matieres.length} icon={<BookOpen size={16} />} color="sky" delay={0} />
            <KPICard title="Total Examens" value={matieres.reduce((a, m) => a + m.stats.length, 0)} icon={<ClipboardList size={16} />} color="amber" delay={0.1} />
            <KPICard title="Élèves" value={totalStudents} icon={<Users size={16} />} color="emerald" delay={0.2} subtitle="Matière active" />
            <KPICard title="Moyenne" value={`${avgAll}/20`} icon={<TrendingUp size={16} />} color={avgAll >= 10 ? 'emerald' : 'rose'} delay={0.3} subtitle="Matière active" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* 2. Liste des Matières */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">Gestion des Cours</h3>
          <p className="text-[11px] text-gray-400 mb-4 font-medium uppercase tracking-wider">Sélectionnez une unité d'enseignement</p>
          
          {loading ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 bg-gray-50 dark:bg-gray-800/50 rounded-xl animate-pulse" />)}</div>
          ) : (
            <div className="space-y-2">
              {matieres.map((mat, i) => {
                const isSelected = selectedMatiere?.id === mat.id;
                const catColors: any = { TECH: 'text-sky-500', SOFT: 'text-amber-500', LANG: 'text-emerald-500', SCIE: 'text-rose-500' };
                return (
                  <motion.button
                    key={mat.id}
                    onClick={() => setSelectedMatiere(mat)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${isSelected ? 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800 shadow-sm' : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent'}`}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center ${catColors[mat.categorie]}`}>
                      <BookOpen size={14} />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className={`text-xs font-bold truncate ${isSelected ? 'text-sky-900 dark:text-sky-100' : 'text-gray-700 dark:text-gray-300'}`}>{mat.nom}</p>
                      <p className="text-[10px] text-gray-400 font-mono uppercase">{mat.code} • Coeff {mat.coefficient}</p>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">{mat.stats.length} ex.</span>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Graphiques et Détails */}
        <div className="xl:col-span-2 space-y-4">
          {loading ? (
            <><ChartSkeleton /><ChartSkeleton /></>
          ) : selectedMatiere ? (
            <>
              {/* Graphique de distribution */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Analyse des Performances</h3>
                    <p className="text-xs text-gray-400 font-medium italic">{selectedMatiere.nom}</p>
                  </div>
                  <div className="bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-[10px] font-bold px-2 py-1 rounded-md uppercase">
                    {selectedMatiere.categorie}
                  </div>
                </div>
                
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={currentDist}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                    <Bar dataKey="count" name="Nombre d'élèves" radius={[6, 6, 0, 0]} barSize={40}>
                      {currentDist.map((_, i) => <Cell key={i} fill={barColors[i % barColors.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Liste des examens détaillés */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Historique des Évaluations</h3>
                <div className="grid gap-3">
                  {selectedMatiere.stats.map((stat, idx) => {
                    const successRate = stat.totalEleves > 0 ? Math.round((stat.audessus / stat.totalEleves) * 100) : 0;
                    return (
                      <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 shadow-sm">
                          <ClipboardList size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{stat.examNom}</p>
                          <p className="text-[10px] text-gray-400 font-medium uppercase">{stat.totalEleves} Candidats • {successRate}% Admis</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-black ${stat.moyenne >= 10 ? 'text-emerald-600' : 'text-rose-600'}`}>{stat.moyenne.toFixed(2)}</p>
                          <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                            <div 
                              className={`h-full ${stat.moyenne >= 10 ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                              style={{ width: `${(stat.moyenne / 20) * 100}%` }} 
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl">
              <BookOpen size={48} className="opacity-10 mb-4" />
              <p className="text-sm font-medium">Aucun cours sélectionné</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}