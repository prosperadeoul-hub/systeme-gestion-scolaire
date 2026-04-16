// src/lib/ICONS_USAGE_GUIDE.md
# Guide d'utilisation du système d'icônes moderne

## 📌 Vue d'ensemble

Système d'icônes centralisé et cohérent pour toute l'application EduManager.
Tous les icônes utilisent **lucide-react** et sont organisés par catégorie.

## 🎯 Localisation

Fichier: `src/lib/icons.tsx`

## 📦 Catégories d'icônes disponibles

### 1. Navigation (NavIcons)
```tsx
import { NavIcons } from '../../lib/icons';

NavIcons.dashboard    // 📊 Tableau de bord
NavIcons.program      // 📖 Programme
NavIcons.notes        // 📋 Notes/Examens
NavIcons.users        // 👥 Utilisateurs
NavIcons.promotions   // 🎓 Promotions
NavIcons.subjects     // 📚 Matières
NavIcons.admin        // 💼 Admin
NavIcons.settings     // ⚙️ Paramètres
NavIcons.logout       // 🚪 Déconnexion
NavIcons.school       // 🏫 École
NavIcons.home         // 🏠 Accueil
```

### 2. Actions CRUD (ActionIcons)
```tsx
import { ActionIcons } from '../../lib/icons';

ActionIcons.add       // ➕ Ajouter
ActionIcons.edit      // ✏️ Modifier
ActionIcons.delete    // 🗑️ Supprimer
ActionIcons.save      // 💾 Enregistrer
ActionIcons.cancel    // ✕ Annuler
ActionIcons.download  // ⬇️ Télécharger
ActionIcons.upload    // ⬆️ Charger
ActionIcons.search    // 🔍 Recherche
ActionIcons.filter    // 🔎 Filtrer
ActionIcons.copy      // 📋 Copier
```

### 3. Statuts (StatusIcons)
```tsx
import { StatusIcons } from '../../lib/icons';

StatusIcons.success   // ✅ Succès
StatusIcons.warning   // ⚠️ Avertissement
StatusIcons.error     // ❌ Erreur
StatusIcons.info      // ℹ️ Info
StatusIcons.pending   // ⏱️ En attente
StatusIcons.up        // 📈 Montée
StatusIcons.down      // 📉 Baisse
StatusIcons.alert     // 🚨 Alerte
```

### 4. Académique (AcademicIcons)
```tsx
import { AcademicIcons } from '../../lib/icons';

AcademicIcons.notes       // 📋 Notes
AcademicIcons.grades      // 🏆 Notes/Grades
AcademicIcons.exam        // ✏️ Examen
AcademicIcons.subject     // 📖 Matière
AcademicIcons.theory      // 💡 Théorie
AcademicIcons.practice    // 💻 Pratique
AcademicIcons.calculation // 🧮 Calcul
AcademicIcons.document    // 📄 Document
AcademicIcons.language    // 📚 Langue
AcademicIcons.science     // 🧠 Science
```

### 5. Finance (FinanceIcons)
```tsx
import { FinanceIcons } from '../../lib/icons';

FinanceIcons.money     // 💵 Argent
FinanceIcons.wallet    // 💳 Portefeuille
FinanceIcons.card      // 🏧 Carte
FinanceIcons.paid      // ✅ Payé
FinanceIcons.pending   // ⏱️ En attente
FinanceIcons.chart     // 📊 Graphique
FinanceIcons.pie       // 📈 Camembert
FinanceIcons.line      // 📉 Ligne
FinanceIcons.percent   // % Pourcentage
```

### 6. Authentification (AuthIcons)
```tsx
import { AuthIcons } from '../../lib/icons';

AuthIcons.user        // 👤 Utilisateur
AuthIcons.lock        // 🔒 Verrouillé
AuthIcons.unlock      // 🔓 Déverrouillé
AuthIcons.visibility  // 👁️ Visible
AuthIcons.hidden      // 👁️‍🗨️ Caché
AuthIcons.profile     // 👤 Profil
```

### 7. Navigation UI (NavigationIcons)
```tsx
import { NavigationIcons } from '../../lib/icons';

NavigationIcons.menu         // ☰ Menu
NavigationIcons.chevronDown  // ▼ Chevron bas
NavigationIcons.chevronRight // ▶ Chevron droit
NavigationIcons.chevronLeft  // ◀ Chevron gauche
NavigationIcons.arrowRight   // → Flèche droit
NavigationIcons.arrowDown    // ↓ Flèche bas
```

### 8. Organisation (OrganizationIcons)
```tsx
import { OrganizationIcons } from '../../lib/icons';

OrganizationIcons.folder    // 📁 Dossier
OrganizationIcons.archive   // 📦 Archive
OrganizationIcons.delete    // 🗑️ Supprimer
OrganizationIcons.refresh   // 🔄 Rafraîchir
OrganizationIcons.calendar  // 📅 Calendrier
OrganizationIcons.clock     // 🕐 Horloge
OrganizationIcons.target    // 🎯 Cible
OrganizationIcons.zap       // ⚡ Éclair
```

## 💻 Exemples d'utilisation

### Exemple 1 : Dans un composant React
```tsx
import { ActionIcons, StatusIcons } from '../../lib/icons';

export default function MyComponent() {
  return (
    <div>
      <button className="btn btn--primary">
        {ActionIcons.save}
        Enregistrer
      </button>
      
      <span className="badge badge--success">
        {StatusIcons.success}
        Complété
      </span>
    </div>
  );
}
```

### Exemple 2 : Avec du texte
```tsx
import { AcademicIcons } from '../../lib/icons';

export function GradeDisplay() {
  return (
    <div className="card">
      <h2 className="card__title">
        {AcademicIcons.grades}
        Mes Notes
      </h2>
    </div>
  );
}
```

### Exemple 3 : Dans des listes
```tsx
import { ActionIcons } from '../../lib/icons';

const actions = [
  { icon: ActionIcons.edit, label: 'Modifier', action: handleEdit },
  { icon: ActionIcons.delete, label: 'Supprimer', action: handleDelete },
];

return (
  <div className="btn-group">
    {actions.map(action => (
      <button key={action.label} onClick={action.action}>
        {action.icon}
        {action.label}
      </button>
    ))}
  </div>
);
```

### Exemple 4 : KPI Cards
```tsx
import { FinanceIcons, AcademicIcons } from '../../lib/icons';
import KPICard from '../../components/ui/KPICard';

export function Dashboard() {
  return (
    <>
      <KPICard 
        title="Paiements" 
        value={1250}
        icon={FinanceIcons.money}
        color="sky"
      />
      <KPICard 
        title="Étudiants" 
        value={156}
        icon={AcademicIcons.science}
        color="emerald"
      />
    </>
  );
}
```

## 🎨 Classes CSS pour les icônes

### Sizes
```tsx
<span style={{ fontSize: '16px' }}>{ActionIcons.save}</span>
<span style={{ fontSize: '20px' }}>{NavIcons.dashboard}</span>
<span style={{ fontSize: '24px' }}>{AcademicIcons.grades}</span>
```

### Colors
```tsx
<span style={{ color: 'var(--primary)' }}>{ActionIcons.save}</span>
<span style={{ color: 'var(--accent)' }}>{StatusIcons.success}</span>
<span style={{ color: 'var(--error)' }}>{StatusIcons.error}</span>
```

### Animation
```tsx
// Utiliser avec Tailwind pour l'animation
<span className="animate-spin">{NavigationIcons.chevronDown}</span>
<span className="animate-pulse">{StatusIcons.pending}</span>
```

## 🚀 Pages mises à jour

### ✅ Déjà intégrées
- [ ] Sidebar.tsx - Navigation principale
- [ ] Login.tsx - Page d'authentification
- [ ] AdminOverview.tsx - Vue d'ensemble admin
- [ ] TeacherDashboard.tsx - Tableau de bord enseignant
- [ ] StudentDashboard.tsx - Tableau de bord étudiant

### À intégrer
- [ ] UserManagement.tsx
- [ ] PromotionManagement.tsx
- [ ] MatieresManagement.tsx
- [ ] NoteEntry.tsx
- [ ] StudentProgram.tsx
- [ ] KPICard.tsx
- [ ] Header.tsx
- [ ] Layout.tsx

## 📋 Template pour mettre à jour une page

```tsx
// 1. Remplacer les imports
// ❌ Avant
import { IconName, OtherIcon } from 'lucide-react';

// ✅ Après
import { NavIcons, ActionIcons, StatusIcons } from '../../lib/icons';

// 2. Remplacer les références
// ❌ Avant
<IconName size={16} />

// ✅ Après
{NavIcons.dashboard}

// 3. Utiliser dans le JSX
<button>
  {ActionIcons.save}
  Enregistrer
</button>
```

## 🎯 Bonnes pratiques

1. **Cohérence** : Toujours utiliser les icônes depuis le système centralisé
2. **Taille** : Les icônes sont prédéfinis à 16px ou 18px selon leur catégorie
3. **Couleur** : Utiliser les variables CSS pour les couleurs
4. **Animation** : Appliquer les animations via les classes Framer Motion
5. **Accessibilité** : Ajouter des aria-label pour les icônes sans texte

## 🔗 Intégration avec d'autres systèmes

### Avec Framer Motion
```tsx
import { motion } from 'framer-motion';
import { ActionIcons } from '../../lib/icons';

<motion.button
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.95 }}
>
  {ActionIcons.save}
</motion.button>
```

### Avec le système BEM CSS
```tsx
<button className="btn btn--primary">
  <span className="btn__icon">{ActionIcons.save}</span>
  <span className="btn__label">Enregistrer</span>
</button>
```

## 📞 Support

Pour ajouter de nouveaux icônes, éditez simplement `src/lib/icons.tsx` et ajoutez :
1. L'import de lucide-react
2. L'icône dans la catégorie appropriée
3. La documentation

---

**Version**: 1.0.0  
**Dernière mise à jour**: 16 avril 2026
