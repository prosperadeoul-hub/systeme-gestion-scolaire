import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts';
import { Users, GraduationCap, BookOpen, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import KPICard from '../../components/ui/KPICard';
import { KPICardSkeleton, ChartSkeleton } from '../../components/ui/Skeleton';

interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalPromotions: number;
  totalFrais: number;
  totalPaye: number;
  promotionAverages: { nom: string; moyenne: number }[];
}

export default function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [{ count: totalUsers }, { count: totalStudents }, { count: totalTeachers }, { count: totalPromos }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('etudiants').select('*', { count: 'exact', head: true }),
        supabase.from('professeurs').select('*', { count: 'exact', head: true }),
        supabase.from('promotions').select('*', { count: 'exact', head: true }),
      ]);

      const { data: fraisData } = await supabase.from('etudiants').select('frais_scolarite_total, frais_payes');
      const totalFrais = fraisData?.reduce((a, e) => a + (e.frais_scolarite_total ?? 0), 0) ?? 0;
      const totalPaye = fraisData?.reduce((a, e) => a + (e.frais_payes ?? 0), 0) ?? 0;

      const { data: promotions } = await supabase.from('promotions').select('id, nom');
      const promotionAverages: { nom: string; moyenne: number }[] = [];

      for (const promo of promotions ?? []) {
        const { data: etudiants } = await supabase.from('etudiants').select('id').eq('promotion_id', promo.id);
        if (!etudiants || etudiants.length === 0) continue;
        const ids = etudiants.map(e => e.id);
        const { data: notes } = await supabase.from('notes').select('valeur').in('etudiant_id', ids);
        const vals = (notes ?? []).map(n => n.valeur);
        const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
        promotionAverages.push({ nom: promo.nom.slice(0, 15), moyenne: Math.round(avg * 100) / 100 });
      }

      setStats({
        totalUsers: totalUsers ?? 0,
        totalStudents: totalStudents ?? 0,
        totalTeachers: totalTeachers ?? 0,
        totalPromotions: totalPromos ?? 0,
        totalFrais,
        totalPaye,
        promotionAverages,
      });
      setLoading(false);
    }
    fetchStats();
  }, []);

  const financePieData = stats ? [
    { name: 'Payé', value: Math.round(stats.totalPaye) },
    { name: 'Restant', value: Math.round(stats.totalFrais - stats.totalPaye) },
  ] : [];

  const PIE_COLORS = ['#10b981', '#f59e0b'];
  const BAR_COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

  const recouvrement = stats && stats.totalFrais > 0 ? Math.round((stats.totalPaye / stats.totalFrais) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <KPICardSkeleton key={i} />) : (
          <>
            <KPICard title="Total Utilisateurs" value={stats?.totalUsers ?? 0} icon={<Users size={16} />} color="sky" delay={0} />
            <KPICard title="Étudiants" value={stats?.totalStudents ?? 0} icon={<GraduationCap size={16} />} color="emerald" delay={0.1} />
            <KPICard title="Enseignants" value={stats?.totalTeachers ?? 0} icon={<BookOpen size={16} />} color="amber" delay={0.2} />
            <KPICard title="Taux Recouvrement" value={`${recouvrement}%`} icon={<DollarSign size={16} />} color={recouvrement >= 80 ? 'emerald' : 'rose'} delay={0.3} subtitle={`${Math.round(stats?.totalPaye ?? 0).toLocaleString('fr-FR')} € / ${Math.round(stats?.totalFrais ?? 0).toLocaleString('fr-FR')} €`} />
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
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Recouvrement des Frais de Scolarité</h3>
              <p className="text-xs text-gray-400 mb-4">Répartition payé vs restant dû</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={financePieData} cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={4} dataKey="value">
                    {financePieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} strokeWidth={0} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v.toLocaleString('fr-FR')} €`]} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Comparaison par Promotion</h3>
              <p className="text-xs text-gray-400 mb-4">Moyenne générale des notes</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats?.promotionAverages ?? []} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="nom" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis domain={[0, 20]} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} formatter={(v: number) => [`${v}/20`, 'Moyenne']} />
                  <Bar dataKey="moyenne" name="Moyenne" radius={[6, 6, 0, 0]}>
                    {(stats?.promotionAverages ?? []).map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                  </Bar>
                </BarChart>
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
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Répartition des Utilisateurs par Rôle</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Administrateurs', count: (stats?.totalUsers ?? 0) - (stats?.totalStudents ?? 0) - (stats?.totalTeachers ?? 0), color: 'bg-rose-500', light: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400' },
            { label: 'Enseignants', count: stats?.totalTeachers ?? 0, color: 'bg-amber-500', light: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' },
            { label: 'Étudiants', count: stats?.totalStudents ?? 0, color: 'bg-sky-500', light: 'bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400' },
          ].map(role => (
            <div key={role.label} className={`rounded-xl p-4 ${role.light}`}>
              <div className={`w-2 h-2 rounded-full ${role.color} mb-3`} />
              <p className="text-2xl font-bold">{role.count}</p>
              <p className="text-sm mt-0.5 opacity-80">{role.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
