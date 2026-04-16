import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts';
import api from '../../lib/api';
import { FinanceIcons, AcademicIcons, StatusIcons } from '../../lib/icons';
import KPICard from '../../components/ui/KPICard';
import { KPICardSkeleton, ChartSkeleton } from '../../components/ui/Skeleton';

interface AdminStats {
  total_users: number;
  total_students: number;
  total_teachers: number;
  total_promotions: number;
  total_frais: number;
  total_paye: number;
  promotion_averages: { nom: string; moyenne: number }[];
}

export default function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        // Un seul appel vers Django qui centralise tous les calculs SQL
        const response = await api.get('/admin/stats/');
        setStats(response.data);
      } catch (err) {
        console.error("Erreur lors de la récupération des statistiques MySQL", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const financePieData = stats ? [
    { name: 'Payé', value: Math.round(stats.total_paye) },
    { name: 'Restant', value: Math.round(stats.total_frais - stats.total_paye) },
  ] : [];

  const PIE_COLORS = ['#0ea5e9', '#f59e0b']; // Sky et Amber pour le branding
  const BAR_COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

  const recouvrement = stats && stats.total_frais > 0 
    ? Math.round((stats.total_paye / stats.total_frais) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards Section */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <KPICardSkeleton key={i} />) : (
          <>
            <KPICard title="Utilisateurs" value={stats?.total_users ?? 0} icon={AcademicIcons.subject} color="sky" delay={0} />
            <KPICard title="Étudiants" value={stats?.total_students ?? 0} icon={AcademicIcons.science} color="emerald" delay={0.1} />
            <KPICard title="Enseignants" value={stats?.total_teachers ?? 0} icon={AcademicIcons.language} color="amber" delay={0.2} />
            <KPICard 
              title="Recouvrement" 
              value={`${recouvrement}%`} 
              icon={FinanceIcons.money} 
              color={recouvrement >= 80 ? 'emerald' : 'rose'} 
              delay={0.3} 
              subtitle={`${Math.round(stats?.total_paye ?? 0).toLocaleString('fr-FR')} FCFA`} 
            />
          </>
        )}
      </div>

      {/* Charts Section */}
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
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">Santé Financière</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Répartition des encaissements</p>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">{StatusIcons.up}</div>
              </div>

              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={financePieData} cx="50%" cy="50%" outerRadius={85} innerRadius={60} paddingAngle={8} dataKey="value">
                    {financePieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${Number(value).toLocaleString('fr-FR')} FCFA`, 'Montant']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">Performance Académique</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Moyennes par promotion</p>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={stats?.promotion_averages ?? []} margin={{ top: 0, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="nom" tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 20]} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }} 
                  formatter={(value: any) => [`${value}/20`, 'Moyenne']} 
                />
                  <Bar dataKey="moyenne" radius={[4, 4, 0, 0]} barSize={32}>
                    {(stats?.promotion_averages ?? []).map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </>
        )}
      </div>

      {/* User Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm"
      >
        <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider mb-6">Répartition par Profil</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: 'Administrateurs', count: (stats?.total_users ?? 0) - (stats?.total_students ?? 0) - (stats?.total_teachers ?? 0), color: 'bg-rose-500', light: 'bg-rose-50 dark:bg-rose-900/10 text-rose-600' },
            { label: 'Enseignants', count: stats?.total_teachers ?? 0, color: 'bg-amber-500', light: 'bg-amber-50 dark:bg-amber-900/10 text-amber-600' },
            { label: 'Étudiants', count: stats?.total_students ?? 0, color: 'bg-sky-500', light: 'bg-sky-50 dark:bg-sky-900/10 text-sky-600' },
          ].map(role => (
            <div key={role.label} className={`rounded-2xl p-5 border border-transparent hover:border-gray-100 dark:hover:border-gray-800 transition-all ${role.light}`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-2.5 h-2.5 rounded-full ${role.color} shadow-sm`} />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{role.label}</span>
              </div>
              <p className="text-3xl font-black tabular-nums">{role.count}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}