import { motion } from 'framer-motion';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { Award, TrendingUp, CheckCircle, Wallet, Target } from 'lucide-react';
import KPICard from '../../components/ui/KPICard';
import { KPICardSkeleton, ChartSkeleton } from '../../components/ui/Skeleton';
import { useStudentData } from './hooks/useStudentData';
import type { Note, Categorie } from '../../lib/types';

const CATEGORIE_LABELS: Record<Categorie, string> = {
  TECH: 'Technique', SOFT: 'Savoir-être', LANG: 'Langues', SCIE: 'Sciences',
};

const CATEGORIE_COLORS: Record<Categorie, string> = {
  TECH: 'bg-sky-50 text-sky-600 border-sky-100 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800/50',
  SOFT: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50',
  LANG: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50',
  SCIE: 'bg-violet-50 text-violet-600 border-violet-100 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800/50',
};

function buildRadarData(notes: Note[]) {
  const categories: Record<string, number[]> = {};
  for (const note of notes) {
    const cat = note.examen?.matiere?.categorie;
    if (!cat) continue;
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(note.valeur);
  }
  return Object.entries(categories).map(([cat, vals]) => ({
    subject: CATEGORIE_LABELS[cat as Categorie] ?? cat,
    value: Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10,
    fullMark: 20,
  }));
}

function buildAreaData(notes: Note[]) {
  const sorted = [...notes].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  return sorted.map((note, i) => ({
    name: note.examen?.nom?.slice(0, 15) ?? `Note ${i + 1}`,
    note: note.valeur,
  }));
}

export default function StudentDashboard() {
  const { data, loading } = useStudentData();
  const { moyenneGenerale, rang, totalEtudiants, tauxReussite, soldeRestant, notes, etudiant } = data;

  const radarData = buildRadarData(notes);
  const areaData = buildAreaData(notes);

  const gradeColor = moyenneGenerale >= 14 ? 'emerald' : moyenneGenerale >= 10 ? 'sky' : 'rose';

  return (
    <div className="space-y-6">
      {/* KPI Section */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <KPICardSkeleton key={i} />)
        ) : (
          <>
            <KPICard title="Moyenne" value={`${moyenneGenerale}/20`} icon={<Award size={16} />} color={gradeColor} delay={0} subtitle="Score global" />
            <KPICard title="Classement" value={`${rang}e / ${totalEtudiants}`} icon={<TrendingUp size={16} />} color="sky" delay={0.1} subtitle="Position actuelle" />
            <KPICard title="Succès" value={`${tauxReussite}%`} icon={<CheckCircle size={16} />} color="emerald" delay={0.2} subtitle="Moyennes validées" />
            <KPICard 
                title="Solde" 
                value={`${soldeRestant.toLocaleString('fr-FR')} FCFA`} 
                icon={<Wallet size={16} />} 
                color={soldeRestant > 0 ? 'rose' : 'emerald'} 
                delay={0.3} 
                subtitle={`Reste à payer`} 
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {loading ? (
          <><ChartSkeleton /><ChartSkeleton /></>
        ) : (
          <>
            {/* Radar Chart - Skills Balance */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-6">
                <Target size={16} className="text-sky-500" />
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Équilibre Académique</h3>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#f1f5f9" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                  <Radar name="Performance" dataKey="value" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.15} strokeWidth={3} dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' }} />
                  <Tooltip 
                    formatter={(v: any) => [`${v}/20`, 'Moyenne']} 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold' }} 
                  />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Area Chart - Progression */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp size={16} className="text-emerald-500" />
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Progression Continue</h3>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={areaData} margin={{ left: -25 }}>
                  <defs>
                    <linearGradient id="colorNote" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 'bold', fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 20]} tick={{ fontSize: 9, fontWeight: 'bold', fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    formatter={(v: any) => [`${v}/20`, 'Résultat']} 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold' }} 
                  />
                  <Area type="monotone" dataKey="note" stroke="#10b981" strokeWidth={3} fill="url(#colorNote)" activeDot={{ r: 6, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </>
        )}
      </div>

      {/* Grade Details Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm"
      >
        <div className="px-8 py-5 border-b border-gray-50 dark:border-gray-800">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Détails des Évaluations</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Historique des 10 dernières notes</p>
        </div>

        {loading ? (
          <div className="p-8 space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl animate-pulse" />)}</div>
        ) : notes.length === 0 ? (
          <div className="p-20 text-center text-gray-400 text-sm font-medium italic">Aucun relevé disponible.</div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {notes.slice(0, 10).map(note => {
              const examNom = note.examen?.nom ?? 'Examen Standard';
              const matiereNom = note.examen?.matiere?.nom ?? 'Matière';
              const cat = note.examen?.matiere?.categorie ?? 'TECH';
              const statusColor = note.valeur >= 14 ? 'text-emerald-600' : note.valeur >= 10 ? 'text-sky-600' : 'text-rose-600';
              
              return (
                <div key={note.id} className="flex items-center justify-between px-8 py-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] px-2 py-1 rounded-lg font-black uppercase tracking-tighter border ${CATEGORIE_COLORS[cat as Categorie]}`}>
                      {cat}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-1">{examNom}</p>
                      <p className="text-[11px] font-medium text-gray-400">{matiereNom}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="hidden sm:block w-32 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(note.valeur / 20) * 100}%` }}
                        className={`h-full rounded-full ${note.valeur >= 10 ? 'bg-sky-400' : 'bg-rose-400'}`} 
                      />
                    </div>
                    <span className={`text-sm font-black tabular-nums w-12 text-right ${statusColor}`}>
                        {note.valeur.toFixed(1)}/20
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}