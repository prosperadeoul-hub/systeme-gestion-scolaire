import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, UserPlus, Pencil, Trash2, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../components/ui/Toast';
import Modal from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/Skeleton';
import type { Profile } from '../../lib/types';

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  ENSEIGNANT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  ETUDIANT: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin', ENSEIGNANT: 'Enseignant', ETUDIANT: 'Étudiant',
};

interface EditForm {
  full_name: string;
  role: 'ADMIN' | 'ENSEIGNANT' | 'ETUDIANT';
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
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setProfiles((data ?? []) as Profile[]);
    setLoading(false);
  };

  useEffect(() => { fetchProfiles(); }, []);

  const handleEdit = (profile: Profile) => {
    setEditingProfile(profile);
    setEditForm({ full_name: profile.full_name, role: profile.role });
  };

  const handleSaveEdit = async () => {
    if (!editingProfile) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update(editForm).eq('id', editingProfile.id);
    setSaving(false);
    if (error) { showToast('Erreur lors de la mise à jour.', 'error'); return; }
    showToast('Utilisateur mis à jour.', 'success');
    setEditingProfile(null);
    fetchProfiles();
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const { error } = await supabase.auth.admin.deleteUser(confirmDelete.id);
    if (error) {
      const { error: err2 } = await supabase.from('profiles').delete().eq('id', confirmDelete.id);
      if (err2) { showToast('Erreur lors de la suppression.', 'error'); setConfirmDelete(null); return; }
    }
    showToast('Utilisateur supprimé.', 'success');
    setConfirmDelete(null);
    fetchProfiles();
  };

  const filtered = profiles.filter(p => {
    const matchSearch = p.full_name.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || p.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou email..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <div className="flex gap-2">
          {['ALL', 'ADMIN', 'ENSEIGNANT', 'ETUDIANT'].map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${roleFilter === role ? 'bg-sky-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-sky-300'}`}
            >
              {role === 'ALL' ? 'Tous' : ROLE_LABELS[role]}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{filtered.length} utilisateur(s)</p>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-medium hover:bg-sky-700 transition-colors">
            <UserPlus size={13} />
            Inviter
          </button>
        </div>

        {loading ? (
          <div className="p-4"><TableSkeleton rows={6} /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">Aucun utilisateur trouvé.</div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {filtered.map((profile, i) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/30 group"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {profile.full_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{profile.full_name}</p>
                  <p className="text-xs text-gray-400 truncate">{profile.email}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${ROLE_COLORS[profile.role]}`}>
                  {ROLE_LABELS[profile.role]}
                </span>
                <p className="text-xs text-gray-400 shrink-0 hidden lg:block">
                  {new Date(profile.created_at).toLocaleDateString('fr-FR')}
                </p>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(profile)} className="p-1.5 rounded-lg text-gray-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => setConfirmDelete(profile)} className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={!!editingProfile} onClose={() => setEditingProfile(null)} title="Modifier l'utilisateur" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nom complet</label>
            <input type="text" value={editForm.full_name} onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Rôle</label>
            <select value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value as 'ADMIN' | 'ENSEIGNANT' | 'ETUDIANT' }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
              <option value="ADMIN">Administrateur</option>
              <option value="ENSEIGNANT">Enseignant</option>
              <option value="ETUDIANT">Étudiant</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setEditingProfile(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">Annuler</button>
            <button onClick={handleSaveEdit} disabled={saving} className="px-4 py-2 text-sm bg-sky-600 text-white rounded-xl hover:bg-sky-700 disabled:opacity-50 flex items-center gap-2 transition-colors">
              {saving && <Loader size={13} className="animate-spin" />}
              Sauvegarder
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Confirmer la suppression" size="sm">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Êtes-vous sûr de vouloir supprimer <strong className="text-gray-900 dark:text-white">{confirmDelete?.full_name}</strong> ? Cette action est irréversible.
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
