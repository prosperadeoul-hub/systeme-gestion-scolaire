import { motion } from 'framer-motion';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { Award, TrendingUp, CheckCircle, Wallet } from 'lucide-react';
import KPICard from '../../components/ui/KPICard';
import { KPICardSkeleton, ChartSkeleton } from '../../components/ui/Skeleton';
import { useStudentData } from './hooks/useStudentData';
import type { Note } from '../../lib/types';

const CATEGORIE_LABELS: Record<string, string> = {
  TECH: 'Technique', SOFT: 'Soft Skills', LANG: 'Langues', SCIE: 'Sciences',
};

function buildRadarData(notes: Note[]) {
  const categories: Record<string, number[]> = {};
  for (const note of notes) {
    const cat = (note.examen as { matiere?: { categorie?: string } })?.matiere?.categorie;
    if (!cat) continue;
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(note.valeur);
  }
  return Object.entries(categories).map(([cat, vals]) => ({
    subject: CATEGORIE_LABELS[cat] ?? cat,
    value: Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10,
    fullMark: 20,
  }));
}

function buildAreaData(notes: Note[]) {
  const sorted = [...notes].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  return sorted.map((note, i) => ({
    name: (note.examen as { nom?: string })?.nom?.slice(0, 15) ?? `Note ${i + 1}`,
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
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <KPICardSkeleton key={i} />)
        ) : (
          <>
            <KPICard title="Moyenne Générale" value={`${moyenneGenerale}/20`} icon={<Award size={16} />} color={gradeColor} delay={0} subtitle="Pondérée par coefficient" />
            <KPICard title="Rang dans la Promo" value={`${rang}e/${totalEtudiants}`} icon={<TrendingUp size={16} />} color="sky" delay={0.1} subtitle="Classement actuel" />
            <KPICard title="Taux de Réussite" value={`${tauxReussite}%`} icon={<CheckCircle size={16} />} color="emerald" delay={0.2} subtitle="Notes ≥ 10/20" />
            <KPICard title="Solde à Régler" value={`${soldeRestant.toLocaleString('fr-FR')} €`} icon={<Wallet size={16} />} color={soldeRestant > 0 ? 'rose' : 'emerald'} delay={0.3} subtitle={`Sur ${etudiant?.frais_scolarite_total?.toLocaleString('fr-FR')} € total`} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {loading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Équilibre des Compétences</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">Moyenne par catégorie de matière</p>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <Radar name="Notes" dataKey="value" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.25} strokeWidth={2} dot={{ r: 4, fill: '#0ea5e9' }} />
                  <Tooltip formatter={(v: number) => [`${v}/20`, 'Moyenne']} contentStyle={{ backgroundColor: 'var(--tooltip-bg, #fff)', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Évolution des Notes</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">Progression chronologique</p>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="colorNote" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <YAxis domain={[0, 20]} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <Tooltip formatter={(v: number) => [`${v}/20`, 'Note']} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="note" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#colorNote)" activeDot={{ r: 5 }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6"
      >
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Détail des Notes</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Résultats par examen</p>
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {notes.length === 0 ? (
              <p className="text-center py-8 text-gray-400 text-sm">Aucune note disponible pour le moment.</p>
            ) : (
              notes.slice(0, 10).map(note => {
                const examNom = (note.examen as { nom?: string })?.nom ?? 'Examen';
                const matiereNom = (note.examen as { matiere?: { nom?: string } })?.matiere?.nom ?? '';
                const cat = (note.examen as { matiere?: { categorie?: string } })?.matiere?.categorie ?? '';
                const catColors: Record<string, string> = {
                  TECH: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
                  SOFT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                  LANG: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                  SCIE: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
                };
                const gradeClass = note.valeur >= 14 ? 'text-emerald-600 dark:text-emerald-400' : note.valeur >= 10 ? 'text-sky-600 dark:text-sky-400' : 'text-rose-600 dark:text-rose-400';
                return (
                  <div key={note.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catColors[cat] ?? 'bg-gray-100 text-gray-600'}`}>
                        {cat}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{examNom}</p>
                        <p className="text-xs text-gray-400">{matiereNom}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${note.valeur >= 10 ? 'bg-sky-400' : 'bg-rose-400'}`} style={{ width: `${(note.valeur / 20) * 100}%` }} />
                      </div>
                      <span className={`text-sm font-bold w-12 text-right ${gradeClass}`}>{note.valeur}/20</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
