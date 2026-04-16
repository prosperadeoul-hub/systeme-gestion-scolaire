import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, UserPlus, Pencil, Trash2, Loader, Mail, ShieldCheck } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import Modal from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/Skeleton';
import type { Profile, Role } from '../../lib/types';

const ROLE_COLORS: Record<Role, string> = {
  ADMIN: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/50',
  ENSEIGNANT: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50',
  ETUDIANT: 'bg-sky-50 text-sky-600 border-sky-100 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800/50',
};

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Administrateur', ENSEIGNANT: 'Enseignant', ETUDIANT: 'Étudiant',
};

interface EditForm {
  full_name: string;
  role: Role;
}

export default function UserManagement() {
  const { showToast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ full_name: '', role: 'ETUDIANT' });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Profile | null>(null);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users/');
      setProfiles(response.data);
    } catch (err) {
      showToast('Impossible de charger les comptes utilisateurs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfiles(); }, []);

  const handleEdit = (profile: Profile) => {
    setEditingProfile(profile);
    setEditForm({ full_name: profile.full_name, role: profile.role });
  };

  const handleSaveEdit = async () => {
    if (!editingProfile) return;
    try {
      setSaving(true);
      await api.put(`/admin/users/${editingProfile.id}/`, editForm);
      showToast('Profil mis à jour avec succès.', 'success');
      setEditingProfile(null);
      fetchProfiles();
    } catch (err) {
      showToast('Erreur lors de la modification.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/admin/users/${confirmDelete.id}/`);
      showToast('Utilisateur supprimé de la base MySQL.', 'success');
      setConfirmDelete(null);
      fetchProfiles();
    } catch (err) {
      showToast('Erreur lors de la suppression du compte.', 'error');
    }
  };

  const filtered = profiles.filter(p => {
    const matchSearch = p.full_name.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || p.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col xl:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un nom, un email ou un matricule..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none transition-all"
          />
        </div>
        <div className="flex p-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          {['ALL', 'ADMIN', 'ENSEIGNANT', 'ETUDIANT'].map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${roleFilter === role ? 'bg-sky-600 text-white shadow-lg shadow-sky-100 dark:shadow-none' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
            >
              {role === 'ALL' ? 'Tous' : ROLE_LABELS[role as Role]}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="px-8 py-5 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Répertoire Utilisateurs</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{filtered.length} Comptes actifs</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-xl text-xs font-bold hover:scale-[1.02] active:scale-95 transition-all">
            <UserPlus size={14} />
            Nouvel Utilisateur
          </button>
        </div>

        {loading ? (
          <div className="p-8"><TableSkeleton rows={8} /></div>
        ) : filtered.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <Search size={24} />
            </div>
            <p className="text-sm text-gray-400 font-medium">Aucun résultat ne correspond à votre recherche.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-50 dark:border-gray-800">
                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Utilisateur</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rôle & Permissions</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden lg:table-cell">Date d'inscription</th>
                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                    {filtered.map((profile, i) => (
                        <motion.tr
                            key={profile.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
                        >
                            <td className="px-8 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300 font-black text-xs shadow-inner">
                                        {profile.full_name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-1.5">{profile.full_name}</p>
                                        <div className="flex items-center gap-1.5 text-gray-400 group-hover:text-sky-500 transition-colors">
                                            <Mail size={11} />
                                            <p className="text-[11px] font-medium">{profile.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-lg font-black uppercase tracking-tighter border ${ROLE_COLORS[profile.role]}`}>
                                    <ShieldCheck size={10} />
                                    {ROLE_LABELS[profile.role]}
                                </span>
                            </td>
                            <td className="px-6 py-4 hidden lg:table-cell">
                                <p className="text-xs font-bold text-gray-400">
                                    {new Date(profile.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                            </td>
                            <td className="px-8 py-4 text-right">
                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                    <button onClick={() => handleEdit(profile)} className="p-2 rounded-xl text-gray-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/40 transition-colors">
                                        <Pencil size={15} />
                                    </button>
                                    <button onClick={() => setConfirmDelete(profile)} className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/40 transition-colors">
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </td>
                        </motion.tr>
                    ))}
                </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Edit */}
      <Modal isOpen={!!editingProfile} onClose={() => setEditingProfile(null)} title="Expert : Configuration Profil" size="sm">
        <div className="space-y-5 p-2">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 text-center sm:text-left">Identité Complète</label>
            <input type="text" value={editForm.full_name} onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-bold focus:ring-2 focus:ring-sky-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Privilèges Système</label>
            <select value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value as Role }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-bold focus:ring-2 focus:ring-sky-500 outline-none transition-all appearance-none">
              <option value="ADMIN">Administrateur Système</option>
              <option value="ENSEIGNANT">Enseignant / Professeur</option>
              <option value="ETUDIANT">Étudiant / Apprenant</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button onClick={() => setEditingProfile(null)} className="px-5 py-2 text-sm font-bold text-gray-400">Annuler</button>
            <button onClick={handleSaveEdit} disabled={saving} className="px-6 py-2 bg-sky-600 text-white rounded-xl text-sm font-bold hover:bg-sky-700 shadow-lg shadow-sky-100 dark:shadow-none transition-all active:scale-95 flex items-center gap-2">
              {saving ? <Loader size={14} className="animate-spin" /> : 'Appliquer les changements'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Delete */}
      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Révocation de compte" size="sm">
        <div className="p-1">
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            Vous êtes sur le point de révoquer l'accès de <span className="font-bold text-gray-900 dark:text-white">{confirmDelete?.full_name}</span>. 
            Toutes les données liées (notes, inscriptions) pourront être affectées par cette suppression.
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm font-bold text-gray-400">Annuler</button>
            <button onClick={handleDelete} className="px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 shadow-lg shadow-rose-100 dark:shadow-none transition-all active:scale-95">Supprimer définitivement</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}