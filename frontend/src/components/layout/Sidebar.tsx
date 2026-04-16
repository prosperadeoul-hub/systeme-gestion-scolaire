import { motion } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, ClipboardList, Users, GraduationCap,
  BookMarked, LogOut, ChevronRight, School
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { Page } from '../../lib/types';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  page: Page;
  roles: string[];
}

const navItems: NavItem[] = [
  { icon: <LayoutDashboard size={18} />, label: 'Tableau de bord', page: 'dashboard', roles: ['ETUDIANT', 'ENSEIGNANT'] },
  { icon: <BookOpen size={18} />, label: 'Mon Programme', page: 'programme', roles: ['ETUDIANT'] },
  { icon: <ClipboardList size={18} />, label: 'Saisie des notes', page: 'notes-saisie', roles: ['ENSEIGNANT'] },
  { icon: <LayoutDashboard size={18} />, label: 'Vue Globale', page: 'admin-overview', roles: ['ADMIN'] },
  { icon: <Users size={18} />, label: 'Utilisateurs', page: 'admin-users', roles: ['ADMIN'] },
  { icon: <GraduationCap size={18} />, label: 'Promotions', page: 'admin-promotions', roles: ['ADMIN'] },
  { icon: <BookMarked size={18} />, label: 'Matières', page: 'admin-matieres', roles: ['ADMIN'] },
];

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { profile, signOut } = useAuth();

  const filteredItems = navItems.filter(item => profile && item.roles.includes(profile.role));

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-rose-500/20 text-rose-400',
    ENSEIGNANT: 'bg-amber-500/20 text-amber-400',
    ETUDIANT: 'bg-sky-500/20 text-sky-400',
  };

  const roleLabels: Record<string, string> = {
    ADMIN: 'Administrateur',
    ENSEIGNANT: 'Enseignant',
    ETUDIANT: 'Étudiant',
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col z-40">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center shadow-lg shadow-sky-600/30">
            <School size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-sm leading-tight">EduManager</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Gestion Académique</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredItems.map(item => {
          const isActive = currentPage === item.page;
          return (
            <motion.button
              key={item.page}
              whileHover={{ x: 2 }}
              onClick={() => onNavigate(item.page)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}>
                {item.icon}
              </span>
              <span className="flex-1 text-left">{item.label}</span>
              {isActive && <ChevronRight size={14} />}
            </motion.button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-xs font-bold">
            {profile?.full_name?.charAt(0) ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{profile?.full_name}</p>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${roleColors[profile?.role ?? 'ETUDIANT']}`}>
              {roleLabels[profile?.role ?? 'ETUDIANT']}
            </span>
          </div>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <LogOut size={15} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
