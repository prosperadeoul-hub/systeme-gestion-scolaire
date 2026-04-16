import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Eye, EyeOff, Loader, Database } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { NavIcons, AuthIcons, ActionIcons, OrganizationIcons } from '../../lib/icons';

export default function Login() {
  const { signIn, seedDemoData } = useAuth();
  const { showToast } = useToast();
  
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const demoAccounts = [
    { label: 'Admin', user: 'admin_demo', pass: 'Demo123!', icon: '👤', role: 'admin' },
    { label: 'Enseignant', user: 'prof_dupont', pass: 'Demo123!', icon: '👨‍🏫', role: 'teacher' },
    { label: 'Étudiant', user: 'alice_etu', pass: 'Demo123!', icon: '👨‍🎓', role: 'student' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(username, password);
    setLoading(false);
    
    if (error) {
      showToast('Identifiants MySQL incorrects. Vérifiez que le serveur Django tourne.', 'error');
    } else {
      showToast('Connexion réussie !', 'success');
    }
  };

  const handleSeedDemo = async () => {
    setSeeding(true);
    showToast('Initialisation de la base MySQL...', 'info');
    const { error } = await seedDemoData();
    setSeeding(false);
    if (error) {
      showToast('Erreur : vérifiez la connexion à MySQL.', 'error');
    } else {
      showToast('Base MySQL initialisée avec succès !', 'success');
    }
  };

  const handleDemoLogin = (demoUser: string, demoPass: string) => {
    setUsername(demoUser);
    setPassword(demoPass);
  };

  return (
    <div className="auth-container">
      {/* Sidebar Gauche - Branding */}
      <aside className="auth-sidebar auth-sidebar--visible">
        <div className="auth-sidebar__header">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="auth-sidebar__logo"
          >
            {NavIcons.school}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            <span className="auth-sidebar__title">EduManager</span>
          </motion.div>
        </div>

        <motion.div 
          className="auth-sidebar__content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="auth-sidebar__heading">
            Maîtrisez votre<br />écosystème<br />éducatif.
          </h2>
          <p className="auth-sidebar__description">
            Solution Master 1 IA : Pilotage par les données et interface haute fidélité.
          </p>
        </motion.div>

        <motion.div 
          className="auth-sidebar__stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="auth-stat">
            <div className="auth-stat__value">50</div>
            <div className="auth-stat__label">Étudiants Test</div>
          </div>
          <div className="auth-stat">
            <div className="auth-stat__value">1000+</div>
            <div className="auth-stat__label">Notes MySQL</div>
          </div>
          <div className="auth-stat">
            <div className="auth-stat__value">Django</div>
            <div className="auth-stat__label">Backend</div>
          </div>
        </motion.div>
      </aside>

      {/* Section Formulaire Droite */}
      <section className="auth-form-section">
        <motion.div 
          className="auth-form-wrapper"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="auth-form__header">
            <h1 className="auth-form__title">Authentification</h1>
            <p className="auth-form__subtitle">Base de données MySQL locale</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Champ Nom d'utilisateur */}
            <div className="auth-form__group">
              <label className="auth-form__label auth-form__label--required">
                Nom d'utilisateur
              </label>
              <div className="auth-form__input-wrapper">
                {AuthIcons.user}
                <input
                  type="text"
                  className="auth-form__input"
                  style={{ paddingLeft: '36px' }}
                  placeholder="ex: admin_demo"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <span className="auth-form__hint">Utilisateur Django</span>
            </div>

            {/* Champ Mot de passe */}
            <div className="auth-form__group">
              <label className="auth-form__label auth-form__label--required">
                Mot de passe
              </label>
              <div className="auth-form__input-wrapper">
                {AuthIcons.lock}
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="auth-form__input"
                  style={{ paddingLeft: '36px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="auth-form__toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Bouton Se connecter */}
            <button
              type="submit"
              disabled={loading}
              className="auth-form__submit"
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Section Comptes Démo */}
          <div className="auth-demo">
            <div className="auth-demo__divider">
              <div className="auth-demo__divider-line"></div>
              <span className="auth-demo__divider-text">Accès rapide (Démo)</span>
              <div className="auth-demo__divider-line"></div>
            </div>

            <div className="auth-demo__accounts">
              {demoAccounts.map((account) => (
                <motion.button
                  key={account.user}
                  type="button"
                  className="auth-demo__account"
                  onClick={() => handleDemoLogin(account.user, account.pass)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="auth-demo__account-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '20px' }}>{account.icon}</span>
                      <span className="auth-demo__account-label">{account.label}</span>
                    </div>
                    <span className={`auth-demo__account-badge auth-demo__account-badge--${account.role}`}>
                      {account.label}
                    </span>
                  </div>
                  <div className="auth-demo__account-credentials">
                    <div className="auth-demo__account-credentials-item">
                      <span className="auth-demo__account-credentials-label">User:</span>
                      <span>{account.user}</span>
                    </div>
                    <div className="auth-demo__account-credentials-item">
                      <span className="auth-demo__account-credentials-label">Pass:</span>
                      <span>{account.pass}</span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Bouton Initialiser */}
            <motion.button
              type="button"
              className="auth-seed-button"
              onClick={handleSeedDemo}
              disabled={seeding}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {seeding ? (
                <>
                  <Loader size={14} className="animate-spin" />
                  Initialisation...
                </>
              ) : (
                <>
                  {OrganizationIcons.refresh}
                  Initialiser la base MySQL
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}