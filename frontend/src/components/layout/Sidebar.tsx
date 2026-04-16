import { motion } from 'framer-motion';
import { LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NavIcons } from '../../lib/icons';
import type { Page } from '../../lib/types';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  page: Page;
  roles: string[];
}

const navItems: NavItem[] = [
  { icon: NavIcons.dashboard, label: 'Tableau de bord', page: 'dashboard', roles: ['ETUDIANT', 'ENSEIGNANT'] },
  { icon: NavIcons.program, label: 'Mon Programme', page: 'programme', roles: ['ETUDIANT'] },
  { icon: NavIcons.notes, label: 'Saisie des notes', page: 'notes-saisie', roles: ['ENSEIGNANT'] },
  { icon: NavIcons.dashboard, label: 'Vue Globale', page: 'admin-overview', roles: ['ADMIN'] },
  { icon: NavIcons.users, label: 'Utilisateurs', page: 'admin-users', roles: ['ADMIN'] },
  { icon: NavIcons.promotions, label: 'Promotions', page: 'admin-promotions', roles: ['ADMIN'] },
  { icon: NavIcons.subjects, label: 'Matières', page: 'admin-matieres', roles: ['ADMIN'] },
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
    <aside className="auth-sidebar nav">
      <div className="nav__header">
        <div className="auth-sidebar__header">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="auth-sidebar__logo"
          >
            {NavIcons.school}
          </motion.div>
          <div className="auth-sidebar__title">EduManager</div>
        </div>
      </div>

      <nav className="nav__menu">
        {filteredItems.map(item => {
          const isActive = currentPage === item.page;
          return (
            <motion.button
              key={item.page}
              whileHover={{ x: 2 }}
              onClick={() => onNavigate(item.page)}
              className={`nav__item ${isActive ? 'nav__item--active' : ''}`}
            >
              <span className="nav__icon">{item.icon}</span>
              <span className="nav__label">{item.label}</span>
              {isActive && <ChevronRight size={14} />}
            </motion.button>
          );
        })}
      </nav>

      <div className="nav__footer">
        <div className="nav__profile">
          <div className="nav__profile-avatar">
            {profile?.full_name?.charAt(0) ?? '?'}
          </div>
          <div className="nav__profile-info">
            <p className="nav__profile-name">{profile?.full_name}</p>
            <span className={`nav__profile-role ${roleColors[profile?.role ?? 'ETUDIANT']}`}>
              {roleLabels[profile?.role ?? 'ETUDIANT']}
            </span>
          </div>
        </div>
        <motion.button
          onClick={signOut}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="nav__logout"
          aria-label="Déconnexion"
        >
          <LogOut size={16} />
          <span>Déconnexion</span>
        </motion.button>
      </div>
    </aside>
  );
}
