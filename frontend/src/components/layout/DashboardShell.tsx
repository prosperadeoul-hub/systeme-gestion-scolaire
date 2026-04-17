/**
 * DashboardShell.tsx - Layout Maître pour tous les dashboards
 * 
 * Composant réutilisable qui fournit la structure globale :
 * - Sidebar fixe (navigation)
 * - Header sticky (titre + profil)
 * - Main content area (scrollable)
 * 
 * Usage :
 * <DashboardShell sidebar={<Navigation />} header={<Header />}>
 *   // Contenu spécifique du dashboard
 * </DashboardShell>
 */

import type { ReactNode } from 'react';
import '../styles/dashboard.css';
import '../styles/layout.css';

interface DashboardShellProps {
  /** Contenu de la sidebar (navigation) */
  sidebar: ReactNode;
  /** Contenu du header (titre + actions) */
  header: ReactNode;
  /** Contenu principal (grilles, cartes, tableaux) */
  children: ReactNode;
  /** Classe CSS optionnelle pour le conteneur */
  className?: string;
}

export function DashboardShell({ sidebar, header, children, className }: DashboardShellProps) {
  return (
    <div className={`app-shell ${className || ''}`}>
      {/* ========== SIDEBAR - Navigation fixe ========== */}
      <aside className="dashboard__sidebar">
        {sidebar}
      </aside>

      {/* ========== MAIN LAYOUT ========== */}
      <div className="dashboard__main">
        {/* HEADER - Sticky en haut */}
        <header className="dashboard__header">
          {header}
        </header>

        {/* CONTENT - Zone principale scrollable */}
        <main className="dashboard__content">
          {children}
        </main>
      </div>
    </div>
  );
}

/* ================================================================ */
/* EXEMPLES DE STRUCTURE POUR LES DASHBOARDS */
/* ================================================================ */

/**
 * === EXEMPLE 1 : ADMIN DASHBOARD ===
 * 
 * Structure hiérarchique :
 * 1. Ligne de KPIs (4 colonnes)
 * 2. Zone graphiques (2 colonnes)
 * 3. Section "Répartition par Profil" (3 colonnes)
 */
export function AdminDashboardLayout() {
  return (
    <DashboardShell
      sidebar={<AdminSidebar />}
      header={<AdminHeader />}
    >
      {/* ===== SECTION 1 : KPI STATS ===== */}
      <div className="grid-stats">
        <div className="card">
          <div className="card-header">
            <span>Users</span>
          </div>
          <div className="card-body">
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>156</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span>Students</span>
          </div>
          <div className="card-body">
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>89</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span>Teachers</span>
          </div>
          <div className="card-body">
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>34</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span>Recovery</span>
          </div>
          <div className="card-body">
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>85%</p>
          </div>
        </div>
      </div>

      {/* ===== SECTION 2 : GRAPHIQUES ===== */}
      <div className="grid-charts">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Financial Health</div>
          </div>
          <div className="card-body">
            {/* Pie Chart ici */}
            <p>📊 Chart placeholder</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Academic Performance</div>
          </div>
          <div className="card-body">
            {/* Bar Chart ici */}
            <p>📈 Chart placeholder</p>
          </div>
        </div>
      </div>

      {/* ===== SECTION 3 : RÉPARTITION PAR PROFIL ===== */}
      <div className="grid-3col">
        <div className="card">
          <div className="card-header">
            <span>Admins</span>
          </div>
          <div className="card-body">
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>2</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span>Teachers</span>
          </div>
          <div className="card-body">
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>12</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span>Students</span>
          </div>
          <div className="card-body">
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>89</p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

/**
 * === EXEMPLE 2 : STUDENT DASHBOARD ===
 * 
 * Structure hiérarchique :
 * 1. Ligne de KPIs (4 colonnes)
 * 2. Graphiques (2 colonnes)
 * 3. Tableau complet (1 colonne)
 */
export function StudentDashboardLayout() {
  return (
    <DashboardShell
      sidebar={<StudentSidebar />}
      header={<StudentHeader />}
    >
      {/* ===== SECTION 1 : KPI STATS ===== */}
      <div className="grid-stats">
        <div className="card">
          <p className="card-subtitle">Average</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>16.5/20</p>
        </div>

        <div className="card">
          <p className="card-subtitle">Ranking</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>3rd / 45</p>
        </div>

        <div className="card">
          <p className="card-subtitle">Success Rate</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>92%</p>
        </div>

        <div className="card">
          <p className="card-subtitle">Balance</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>0 FCFA</p>
        </div>
      </div>

      {/* ===== SECTION 2 : GRAPHIQUES + SIDEBAR ===== */}
      <div className="grid-sidebar">
        <div>
          <div className="grid-charts">
            <div className="card">
              <div className="card-header">
                <div className="card-title">Academic Balance</div>
              </div>
              <div className="card-body">
                {/* Radar Chart */}
                <p>🎯 Radar Chart</p>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Progress</div>
              </div>
              <div className="card-body">
                {/* Area Chart */}
                <p>📈 Area Chart</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Quick Actions</div>
          </div>
          <div className="card-body">
            {/* Actions menu */}
            <p>Actions ici</p>
          </div>
        </div>
      </div>

      {/* ===== SECTION 3 : TABLEAU COMPLET ===== */}
      <div className="grid-full">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Grades</div>
          </div>
          <div className="card-body">
            {/* Table */}
            <p>Tableau ici</p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

/**
 * === EXEMPLE 3 : TEACHER DASHBOARD ===
 * 
 * Structure hiérarchique :
 * 1. Ligne de KPIs (4 colonnes)
 * 2. Zone principale (3 colonnes) + Sidebar (liste matières)
 * 3. Graphique complet (1 colonne)
 */
export function TeacherDashboardLayout() {
  return (
    <DashboardShell
      sidebar={<TeacherSidebar />}
      header={<TeacherHeader />}
    >
      {/* ===== SECTION 1 : KPI STATS ===== */}
      <div className="grid-stats">
        <div className="card">
          <p className="card-subtitle">Subjects</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>5</p>
        </div>

        <div className="card">
          <p className="card-subtitle">Exams</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>18</p>
        </div>

        <div className="card">
          <p className="card-subtitle">Students</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>250</p>
        </div>

        <div className="card">
          <p className="card-subtitle">Average Grade</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>13.7/20</p>
        </div>
      </div>

      {/* ===== SECTION 2 : LISTE + CONTENU ===== */}
      <div className="grid-sidebar">
        <div className="grid-3col">
          {/* Contenu principal */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Subject 1</div>
            </div>
            <div className="card-body">
              {/* Détails matière */}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Subject 2</div>
            </div>
            <div className="card-body">
              {/* Détails matière */}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Subject 3</div>
            </div>
            <div className="card-body">
              {/* Détails matière */}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Resources</div>
          </div>
          <div className="card-body">
            {/* Liste ressources */}
          </div>
        </div>
      </div>

      {/* ===== SECTION 3 : GRAPHIQUE COMPLET ===== */}
      <div className="grid-full">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Performance Distribution</div>
          </div>
          <div className="card-body">
            {/* Bar Chart */}
            <p>📊 Distribution Chart</p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

/* ================================================================ */
/* COMPOSANTS HELPERS (Exemples) */
/* ================================================================ */

function AdminSidebar() {
  return <nav>Admin Navigation</nav>;
}

function AdminHeader() {
  return (
    <>
      <h1>Admin Dashboard</h1>
      <div>Profile</div>
    </>
  );
}

function StudentSidebar() {
  return <nav>Student Navigation</nav>;
}

function StudentHeader() {
  return (
    <>
      <h1>My Dashboard</h1>
      <div>Profile</div>
    </>
  );
}

function TeacherSidebar() {
  return <nav>Teacher Navigation</nav>;
}

function TeacherHeader() {
  return (
    <>
      <h1>Teaching Dashboard</h1>
      <div>Profile</div>
    </>
  );
}
