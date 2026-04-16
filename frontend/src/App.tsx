import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/ui/Toast';
import Login from './pages/auth/Login';
import Layout from './components/layout/Layout';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProgram from './pages/student/StudentProgram';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import NoteEntry from './pages/teacher/NoteEntry';
import AdminOverview from './pages/admin/AdminOverview';
import UserManagement from './pages/admin/UserManagement';
import PromotionManagement from './pages/admin/PromotionManagement';
import MatieresManagement from './pages/admin/MatieresManagement';
import type { Page } from './lib/types';

const PAGE_META: Record<Page, { title: string; subtitle?: string }> = {
  'dashboard': { title: 'Tableau de Bord', subtitle: 'Vos performances et statistiques' },
  'programme': { title: 'Mon Programme', subtitle: 'Matières et enseignants de votre promotion' },
  'notes-saisie': { title: 'Saisie des Notes', subtitle: 'Enregistrez les notes de vos étudiants' },
  'admin-overview': { title: 'Vue Globale', subtitle: "Pilotage général de l'établissement" },
  'admin-users': { title: 'Gestion des Utilisateurs', subtitle: 'Comptes étudiants, enseignants et admins' },
  'admin-promotions': { title: 'Gestion des Promotions', subtitle: 'Groupes et filières de formation' },
  'admin-matieres': { title: 'Gestion des Matières', subtitle: 'Cours, coefficients et assignations' },
};

const DEFAULT_PAGE: Record<string, Page> = {
  ETUDIANT: 'dashboard',
  ENSEIGNANT: 'dashboard',
  ADMIN: 'admin-overview',
};

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-sky-600 animate-pulse" />
          <p className="text-sm text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Login />;
  }

  const defaultPage = DEFAULT_PAGE[profile.role] ?? 'dashboard';
  const activePage: Page = currentPage ?? defaultPage;

  const meta = PAGE_META[activePage] ?? PAGE_META['dashboard'];

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return profile.role === 'ETUDIANT' ? <StudentDashboard /> : <TeacherDashboard />;
      case 'programme':
        return <StudentProgram />;
      case 'notes-saisie':
        return <NoteEntry />;
      case 'admin-overview':
        return <AdminOverview />;
      case 'admin-users':
        return <UserManagement />;
      case 'admin-promotions':
        return <PromotionManagement />;
      case 'admin-matieres':
        return <MatieresManagement />;
      default:
        return <div className="text-gray-500 text-sm p-4">Page non trouvée.</div>;
    }
  };

  return (
    <Layout currentPage={activePage} onNavigate={setCurrentPage} title={meta.title} subtitle={meta.subtitle}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activePage}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
