// src/lib/icons.tsx
// Système d'icônes moderne centralisé pour EduManager

import {
  // Navigation
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Users,
  GraduationCap,
  BookMarked,
  Briefcase,
  Settings,
  LogOut,
  
  // Actions
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Download,
  Upload,
  Search,
  Filter,
  Copy,
  Eye,
  EyeOff,
  
  // Status & Feedback
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Info,
  Zap,
  
  // UI Elements
  Menu,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Bell,
  User,
  Lock,
  Unlock,
  Home,
  
  // Business & Finance
  DollarSign,
  Wallet,
  CreditCard,
  BarChart3,
  PieChart,
  LineChart,
  Award,
  Target,
  Percent,
  
  // Academic
  Pencil,
  FileText,
  Lightbulb,
  Brain,
  Code,
  Calculator,
  Book,
  School,
  
  // Organization
  Folder,
  Archive,
  Trash,
  RefreshCw,
  ArrowRight,
  ArrowDown,
  Calendar,
  Clock as ClockIcon,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';

/**
 * CATÉGORIES D'ICÔNES MODERNES
 * Organisé par contexte d'utilisation
 */

// Navigation Principale
export const NavIcons = {
  dashboard: <LayoutDashboard size={18} />,
  program: <BookOpen size={18} />,
  notes: <ClipboardList size={18} />,
  users: <Users size={18} />,
  promotions: <GraduationCap size={18} />,
  subjects: <BookMarked size={18} />,
  admin: <Briefcase size={18} />,
  settings: <Settings size={18} />,
  logout: <LogOut size={18} />,
  school: <School size={18} />,
  home: <Home size={18} />,
};

// Actions CRUD
export const ActionIcons = {
  add: <Plus size={16} />,
  edit: <Edit size={16} />,
  delete: <Trash2 size={16} />,
  save: <Save size={16} />,
  cancel: <X size={16} />,
  download: <Download size={16} />,
  upload: <Upload size={16} />,
  search: <Search size={16} />,
  filter: <Filter size={16} />,
  copy: <Copy size={16} />,
};

// Statuts et États
export const StatusIcons = {
  success: <CheckCircle size={16} />,
  warning: <AlertCircle size={16} />,
  error: <XCircle size={16} />,
  info: <Info size={16} />,
  pending: <Clock size={16} />,
  up: <TrendingUp size={16} />,
  down: <TrendingDown size={16} />,
  alert: <AlertTriangle size={16} />,
};

// Académique
export const AcademicIcons = {
  notes: <ClipboardList size={18} />,
  grades: <Award size={18} />,
  exam: <Pencil size={18} />,
  subject: <BookOpen size={18} />,
  theory: <Lightbulb size={18} />,
  practice: <Code size={18} />,
  calculation: <Calculator size={18} />,
  document: <FileText size={18} />,
  language: <BookMarked size={18} />,
  science: <Brain size={18} />,
};

// Finance et Paiements
export const FinanceIcons = {
  money: <DollarSign size={18} />,
  wallet: <Wallet size={18} />,
  card: <CreditCard size={18} />,
  paid: <CheckCircle size={18} />,
  pending: <Clock size={18} />,
  chart: <BarChart3 size={18} />,
  pie: <PieChart size={18} />,
  line: <LineChart size={18} />,
  percent: <Percent size={18} />,
};

// Authentification et Utilisateur
export const AuthIcons = {
  user: <User size={18} />,
  lock: <Lock size={18} />,
  unlock: <Unlock size={18} />,
  visibility: <Eye size={16} />,
  hidden: <EyeOff size={16} />,
  profile: <User size={18} />,
};

// Notification et Communication
export const NotificationIcons = {
  bell: <Bell size={18} />,
  help: <HelpCircle size={18} />,
  info: <Info size={18} />,
  alert: <AlertCircle size={18} />,
};

// Navigation UI
export const NavigationIcons = {
  menu: <Menu size={18} />,
  chevronDown: <ChevronDown size={16} />,
  chevronRight: <ChevronRight size={16} />,
  chevronLeft: <ChevronLeft size={16} />,
  arrowRight: <ArrowRight size={16} />,
  arrowDown: <ArrowDown size={16} />,
};

// Organisation et Gestion
export const OrganizationIcons = {
  folder: <Folder size={18} />,
  archive: <Archive size={18} />,
  delete: <Trash size={18} />,
  refresh: <RefreshCw size={18} />,
  calendar: <Calendar size={18} />,
  clock: <ClockIcon size={18} />,
  target: <Target size={18} />,
  zap: <Zap size={18} />,
};

/**
 * SETS D'ICÔNES PAR RÔLE
 */

export const RoleNavIcons = {
  ETUDIANT: [
    { icon: NavIcons.dashboard, label: 'Tableau de bord', page: 'dashboard' },
    { icon: NavIcons.program, label: 'Mon Programme', page: 'programme' },
  ],
  ENSEIGNANT: [
    { icon: NavIcons.dashboard, label: 'Tableau de bord', page: 'dashboard' },
    { icon: NavIcons.notes, label: 'Saisie des notes', page: 'notes-saisie' },
  ],
  ADMIN: [
    { icon: NavIcons.dashboard, label: 'Vue Globale', page: 'admin-overview' },
    { icon: NavIcons.users, label: 'Utilisateurs', page: 'admin-users' },
    { icon: NavIcons.promotions, label: 'Promotions', page: 'admin-promotions' },
    { icon: NavIcons.subjects, label: 'Matières', page: 'admin-matieres' },
  ],
};

/**
 * UTILITAIRES
 */

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

// Fonction pour créer des icônes avec configuration commune
export const createIcon = (
  Icon: typeof LayoutDashboard,
  { size = 18, color = 'currentColor', className = '' }: IconProps = {}
) => (
  <Icon size={size} color={color} className={className} />
);

// Wrapper pour les icônes animées
export const AnimatedIcon = ({
  icon: Icon,
  animate = 'pulse',
  duration = 2,
  size = 18,
}: {
  icon: typeof LayoutDashboard;
  animate?: 'pulse' | 'spin' | 'bounce';
  duration?: number;
  size?: number;
}) => {
  const animationClass = {
    pulse: 'animate-pulse',
    spin: 'animate-spin',
    bounce: 'animate-bounce',
  }[animate];

  return <Icon size={size} className={animationClass} style={{ animationDuration: `${duration}s` }} />;
};

export default {
  Nav: NavIcons,
  Action: ActionIcons,
  Status: StatusIcons,
  Academic: AcademicIcons,
  Finance: FinanceIcons,
  Auth: AuthIcons,
  Notification: NotificationIcons,
  Navigation: NavigationIcons,
  Organization: OrganizationIcons,
  RoleNav: RoleNavIcons,
};
