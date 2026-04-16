/* CSS IMPLEMENTATION GUIDE - School Management System

This file contains HTML examples and documentation for using the enterprise-grade CSS system.
Refer to this guide when building React components in the application.

STRUCTURE:
- variables.css   : Design tokens (colors, spacing, typography, shadows)
- components.css  : Reusable component styles (BEM methodology)
- dashboard.css   : Layout-specific styles (dashboard, forms, tables)
- main.css        : Global styles and utilities

DESIGN SYSTEM OVERVIEW:
Color Palette:     Deep Blue (#002D5E), Amber (#FFB800), White, Black
Typography:       Inter font family with 6-level hierarchy
Spacing:          8px-based scale (4px, 8px, 12px, 16px, 24px, 32px, 48px)
Border Radius:    4px, 8px, 12px, 16px
Shadows:          Three levels (sm, md, lg) for depth
Transitions:      Fast (150ms), Base (250ms), Slow (350ms)

================================================================
COMPONENT EXAMPLES
================================================================

1. BUTTONS
---------
Usage: Apply .btn with modifier classes

<button class="btn btn--primary">
  Submit
</button>

<button class="btn btn--secondary">
  Cancel
</button>

<button class="btn btn--accent">
  Save
</button>

<button class="btn btn--danger">
  Delete
</button>

<button class="btn btn--primary btn--lg btn--full">
  Full Width Large Button
</button>

Button Group:
<div class="btn-group">
  <button class="btn btn--secondary">Previous</button>
  <button class="btn btn--primary">Next</button>
</div>

Vertical Group:
<div class="btn-group btn-group--vertical">
  <button class="btn btn--primary">Option 1</button>
  <button class="btn btn--primary">Option 2</button>
</div>

================================================================

2. FORM INPUTS
---------
Usage: Wrap inputs in .input-group with label and error states

<div class="input-group">
  <label class="input-group__label input-group__label--required">
    Student Name
  </label>
  <input 
    type="text" 
    class="input-group__input" 
    placeholder="Enter full name"
  />
  <span class="input-group__hint">Your full legal name</span>
</div>

With Error State:
<div class="input-group">
  <label class="input-group__label input-group__label--required">
    Email Address
  </label>
  <input 
    type="email" 
    class="input-group__input input-group__input--error" 
    value="invalid"
  />
  <span class="input-group__error">
    Please enter a valid email address
  </span>
</div>

Select Dropdown:
<div class="input-group">
  <label class="input-group__label">Class</label>
  <select class="input-group__input">
    <option>Class A</option>
    <option>Class B</option>
    <option>Class C</option>
  </select>
</div>

Textarea:
<div class="input-group">
  <label class="input-group__label">Comments</label>
  <textarea class="input-group__input" placeholder="Enter comments"></textarea>
</div>

================================================================

3. CARDS
---------
Usage: Container for related content with header, body, footer

Basic Card:
<div class="card">
  <div class="card__header">
    <h3 class="card__title">Card Title</h3>
  </div>
  <div class="card__body">
    Content goes here
  </div>
</div>

Card with Footer Actions:
<div class="card">
  <div class="card__header">
    <div>
      <h3 class="card__title">Student Information</h3>
      <p class="card__subtitle">Update student details</p>
    </div>
  </div>
  <div class="card__body">
    Form content...
  </div>
  <div class="card__footer">
    <button class="btn btn--secondary">Cancel</button>
    <button class="btn btn--primary">Save</button>
  </div>
</div>

Elevated Card:
<div class="card card--elevated">
  Content...
</div>

Compact Card:
<div class="card card--compact">
  Content...
</div>

================================================================

4. BADGES - STATUS INDICATORS
---------
Usage: Inline status badges for quick information

Success Badge (Paid/Valid):
<span class="badge badge--success">PAID</span>

Pending/Warning Badge:
<span class="badge badge--warning">PENDING</span>

Error/Failed Badge:
<span class="badge badge--error">FAILED</span>

Info Badge:
<span class="badge badge--info">INFO</span>

Primary Badge:
<span class="badge badge--primary">ACTIVE</span>

Accent Badge:
<span class="badge badge--accent">FEATURED</span>

Large Badge:
<span class="badge badge--lg badge--success">PAYMENT RECEIVED</span>

Pill Badge:
<span class="badge badge--pill badge--success">Active</span>

================================================================

5. DATA TABLES - GRADES/NOTES
---------
Usage: Fixed header, zebra striping, hover effects

<div class="table__container">
  <table class="table">
    <thead class="table__header">
      <tr>
        <th class="table__header-cell">Student Name</th>
        <th class="table__header-cell table__header-cell--center">Subject</th>
        <th class="table__header-cell table__header-cell--center">Grade</th>
        <th class="table__header-cell table__header-cell--right">Status</th>
      </tr>
    </thead>
    <tbody>
      <tr class="table__body-row">
        <td class="table__cell table__cell--strong">John Doe</td>
        <td class="table__cell table__cell--center">Mathematics</td>
        <td class="table__cell table__cell--center">18/20</td>
        <td class="table__cell table__cell--right">
          <span class="badge badge--success">VALID</span>
        </td>
      </tr>
      <tr class="table__body-row">
        <td class="table__cell table__cell--strong">Jane Smith</td>
        <td class="table__cell table__cell--center">Mathematics</td>
        <td class="table__cell table__cell--center">12/20</td>
        <td class="table__cell table__cell--right">
          <span class="badge badge--error">REVIEW</span>
        </td>
      </tr>
    </tbody>
  </table>
</div>

Compact Table:
<table class="table table--compact">
  <!-- Content -->
</table>

Condensed Table:
<table class="table table--condensed">
  <!-- Content -->
</table>

Grades Entry Table:
<div class="table__container">
  <table class="grades-table">
    <thead class="grades-table__header">
      <tr>
        <th class="grades-table__header-cell">Student Name</th>
        <th class="grades-table__header-cell grades-table__header-cell--center">Exam 1</th>
        <th class="grades-table__header-cell grades-table__header-cell--center">Exam 2</th>
        <th class="grades-table__header-cell grades-table__header-cell--center">Final</th>
        <th class="grades-table__header-cell grades-table__header-cell--right">Status</th>
      </tr>
    </thead>
    <tbody>
      <tr class="grades-table__body-row">
        <td class="grades-table__cell grades-table__cell--name">Ahmed Ali</td>
        <td class="grades-table__cell grades-table__cell--center grades-table__cell--editable">
          <input type="number" class="grades-table__input" value="15" min="0" max="20" />
        </td>
        <td class="grades-table__cell grades-table__cell--center grades-table__cell--editable">
          <input type="number" class="grades-table__input" value="16" min="0" max="20" />
        </td>
        <td class="grades-table__cell grades-table__cell--center">15.5</td>
        <td class="grades-table__cell grades-table__cell--right">
          <span class="badge badge--success badge--lg">VALID</span>
        </td>
      </tr>
    </tbody>
  </table>
</div>

================================================================

6. FORM LAYOUT
---------
Usage: Grid-based form layout with sections

<div class="card">
  <div class="form-section__header">
    <h2 class="form-section__title">Student Registration</h2>
    <p class="form-section__subtitle">Enter student information</p>
  </div>

  <div class="form-grid form-grid--three">
    <div class="form-group">
      <label class="form-group__label form-group__label--required">
        First Name
      </label>
      <input type="text" class="form-group__input" placeholder="First name" />
    </div>

    <div class="form-group">
      <label class="form-group__label form-group__label--required">
        Last Name
      </label>
      <input type="text" class="form-group__input" placeholder="Last name" />
    </div>

    <div class="form-group">
      <label class="form-group__label form-group__label--required">
        Class
      </label>
      <select class="form-group__input">
        <option>Select class</option>
        <option>Class A</option>
      </select>
    </div>

    <!-- Full width field -->
    <div class="form-grid__full">
      <div class="form-group">
        <label class="form-group__label">Address</label>
        <textarea class="form-group__input"></textarea>
      </div>
    </div>
  </div>

  <div class="form-actions">
    <button class="btn btn--secondary">Clear</button>
    <button class="btn btn--primary">Save</button>
  </div>
</div>

================================================================

7. INFO DISPLAY
---------
Usage: Display key-value information in grid

<div class="info-grid info-grid--three">
  <div class="info-item">
    <span class="info-item__label">Student ID</span>
    <span class="info-item__value">STU-2024-001</span>
  </div>

  <div class="info-item">
    <span class="info-item__label">Average Grade</span>
    <span class="info-item__value info-item__value--accent">16.5/20</span>
  </div>

  <div class="info-item">
    <span class="info-item__label">Status</span>
    <span class="info-item__value info-item__value--success">ACTIVE</span>
  </div>
</div>

================================================================

8. STATUS CARDS
---------
Usage: Display single metrics

<div class="stat-card">
  <div class="stat-card__icon">📊</div>
  <div class="stat-card__label">Total Students</div>
  <div class="stat-card__value">1,234</div>
  <div class="stat-card__change stat-card__change--positive">
    ↑ 12% from last month
  </div>
</div>

Stats Grid (4 columns):
<div class="stats-grid">
  <div class="stat-card">...</div>
  <div class="stat-card">...</div>
  <div class="stat-card">...</div>
  <div class="stat-card">...</div>
</div>

================================================================

9. ALERTS
---------
Usage: Display contextual messages

<div class="alert alert--success">
  <div class="alert__icon">✓</div>
  <div class="alert__content">
    <div class="alert__title">Success!</div>
    <div class="alert__message">Your changes have been saved successfully.</div>
  </div>
</div>

<div class="alert alert--error">
  <div class="alert__icon">✕</div>
  <div class="alert__content">
    <div class="alert__title">Error</div>
    <div class="alert__message">An error occurred while processing your request.</div>
  </div>
</div>

<div class="alert alert--warning">
  <div class="alert__icon">!</div>
  <div class="alert__content">
    <div class="alert__title">Warning</div>
    <div class="alert__message">Some students have incomplete records.</div>
  </div>
</div>

<div class="alert alert--info">
  <div class="alert__icon">ⓘ</div>
  <div class="alert__content">
    <div class="alert__title">Information</div>
    <div class="alert__message">System maintenance scheduled for tonight.</div>
  </div>
</div>

================================================================

10. MODAL DIALOG
---------
Usage: Overlay dialog for confirmations and forms

<div class="modal">
  <div class="modal__overlay"></div>
  <div class="modal__content">
    <div class="modal__header">
      <h2 class="modal__title">Confirm Action</h2>
      <button class="modal__close">×</button>
    </div>
    <div class="modal__body">
      <p>Are you sure you want to delete this student record? This action cannot be undone.</p>
    </div>
    <div class="modal__footer">
      <button class="btn btn--secondary">Cancel</button>
      <button class="btn btn--danger">Delete</button>
    </div>
  </div>
</div>

================================================================

11. DASHBOARD LAYOUT
---------
Usage: Main application layout with sidebar and content

<div class="dashboard">
  <aside class="dashboard__sidebar">
    <nav class="nav">
      <a href="#" class="nav__item nav__item--active">
        <span class="nav__icon">📊</span>
        <span class="nav__label">Dashboard</span>
      </a>
      <a href="#" class="nav__item">
        <span class="nav__icon">👥</span>
        <span class="nav__label">Students</span>
      </a>
      <a href="#" class="nav__item">
        <span class="nav__icon">📝</span>
        <span class="nav__label">Grades</span>
      </a>
      <a href="#" class="nav__item">
        <span class="nav__icon">💰</span>
        <span class="nav__label">Payments</span>
      </a>
    </nav>
  </aside>

  <main class="dashboard__main">
    <header class="dashboard__header">
      <h1>Dashboard</h1>
      <button class="btn btn--secondary">Settings</button>
    </header>

    <div class="dashboard__content">
      <!-- Page content -->
    </div>
  </main>
</div>

================================================================

BEM NAMING CONVENTION RULES
===========================

Block: Standalone, meaningful entity
Example: .card, .table, .button

Element: Part of a block, can't exist alone
Example: .card__title, .table__header, .btn__icon

Modifier: Flag or state change
Example: .card--elevated, .btn--primary, .input--error

Usage Pattern:
.block__element--modifier

Common Patterns in This System:
- .card__title (element)
- .card--elevated (modifier)
- .card__header (element)
- .btn--primary (modifier)
- .badge--success (modifier)
- .table__header-cell (nested element)

================================================================

RESPONSIVE BREAKPOINTS
======================

1024px (Tablets)     - Sidebar narrow, 2-column grids become single
768px  (Small Tablets) - Sidebar hidden, full-width content
480px  (Mobile)      - Compact buttons, single column, condensed spacing

Example Usage in Components:

@media (max-width: 1024px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard {
    grid-template-columns: 1fr;
  }
}

================================================================

ACCESSIBILITY FEATURES
======================

1. High Contrast Ratios:
   - Deep Blue on White: 9.2:1
   - Amber on White: 3.2:1
   - All text meets WCAG AA standards

2. Focus States:
   - All interactive elements have visible :focus-visible
   - 2px outline with Amber color

3. Semantic HTML:
   - Use proper heading hierarchy (h1, h2, h3)
   - Use <button> for buttons, <a> for links
   - Form inputs with associated <label>

4. ARIA Labels:
   - Use aria-label for icon-only buttons
   - Use aria-describedby for form hints
   - Use role="alert" for alerts

5. Keyboard Navigation:
   - Tab order follows visual hierarchy
   - No keyboard trap (always possible to tab out)

6. Reduced Motion Support:
   - @media (prefers-reduced-motion: reduce) included
   - Animations disabled for users with motion sensitivity

7. High Contrast Mode:
   - @media (prefers-contrast: more) included
   - Borders strengthened, shadows reduced

================================================================

UTILITY CLASSES
==============

Margin Top: .mt-xs, .mt-sm, .mt-md, .mt-lg, .mt-xl, .mt-2xl
Margin Bottom: .mb-xs, .mb-sm, .mb-md, .mb-lg, .mb-xl, .mb-2xl
Padding: .px-lg, .py-lg

Display: .d-none, .d-block, .d-inline, .d-flex, .d-grid
Text Alignment: .text-left, .text-center, .text-right
Text Colors: .text-primary, .text-accent, .text-success, .text-error, .text-muted

Flex: .flex, .flex--center, .flex--between, .flex--column, .flex--gap-md, .flex--gap-lg

================================================================

DESIGN TOKENS REFERENCE
=======================

Colors:
--primary: #002D5E (Deep Blue)
--accent: #FFB800 (Amber)
--black: #1A1A1A
--white: #FFFFFF
--success: #10B981
--error: #EF4444
--warning: #F59E0B
--info: #3B82F6

Spacing Scale (8px base):
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 12px
--spacing-lg: 16px
--spacing-xl: 24px
--spacing-2xl: 32px
--spacing-3xl: 48px

Typography:
--font-size-xs: 12px
--font-size-sm: 14px
--font-size-base: 16px
--font-size-lg: 18px
--font-size-xl: 20px
--font-size-2xl: 24px

Font Weights:
--font-weight-regular: 400
--font-weight-medium: 500
--font-weight-semibold: 600
--font-weight-bold: 700

Border Radius:
--radius-sm: 4px
--radius-md: 8px
--radius-lg: 12px
--radius-xl: 16px

Shadows:
--shadow-sm: 0 2px 4px rgba(0,0,0,0.05)
--shadow-md: 0 4px 8px rgba(0,0,0,0.08)
--shadow-lg: 0 8px 16px rgba(0,0,0,0.10)

Transitions:
--transition-fast: 150ms ease-in-out
--transition-base: 250ms ease-in-out
--transition-slow: 350ms ease-in-out

================================================================

HOW TO USE IN REACT COMPONENTS
==============================

Import the main stylesheet in your App.tsx:

import './styles/main.css';

Then use BEM classes in your JSX:

function StudentCard() {
  return (
    <div className="card">
      <div className="card__header">
        <h2 className="card__title">Student Information</h2>
      </div>
      <div className="card__body">
        <div className="info-grid">
          <div className="info-item">
            <span className="info-item__label">Student ID</span>
            <span className="info-item__value">STU-2024-001</span>
          </div>
        </div>
      </div>
    </div>
  );
}

For dynamic styling, use inline styles sparingly and prefer CSS variables:

<div style={{ color: 'var(--accent)' }}>
  Accent colored text
</div>

Or create component-specific classes in a separate CSS file following the same BEM pattern.

================================================================
END OF GUIDE
================================================================
*/
