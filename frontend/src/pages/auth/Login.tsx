import { useState } from 'react';
import { motion } from 'framer-motion';
import { School, Mail, Lock, Eye, EyeOff, Loader, Database } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';

export default function Login() {
  const { signIn, seedDemoData } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const demoAccounts = [
    { label: 'Administrateur', email: 'admin@ecole.demo', password: 'Demo123!', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800' },
    { label: 'Enseignant', email: 'dupont@ecole.demo', password: 'Demo123!', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
    { label: 'Étudiant', email: 'alice@ecole.demo', password: 'Demo123!', color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) showToast('Identifiants incorrects. Essayez de créer les données demo.', 'error');
  };

  const handleSeedDemo = async () => {
    setSeeding(true);
    showToast('Création des comptes demo en cours...', 'info');
    const { error } = await seedDemoData();
    setSeeding(false);
    if (error) {
      showToast('Erreur lors de la création des données demo.', 'error');
    } else {
      showToast('Comptes demo créés ! Vous pouvez maintenant vous connecter.', 'success');
    }
  };

  const handleDemoLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      <div className="hidden lg:flex flex-col flex-1 bg-gradient-to-br from-sky-600 to-sky-800 p-12 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <School size={20} className="text-white" />
          </div>
          <span className="text-white font-bold text-xl">EduManager</span>
        </div>

        <div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-white mb-4 leading-tight"
          >
            Pilotez votre<br />établissement<br />intelligemment.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sky-200 text-lg"
          >
            Gestion académique complète avec analytics avancés, suivi des performances et pilotage financier.
          </motion.p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { number: '500+', label: 'Étudiants' },
            { number: '98%', label: 'Satisfaction' },
            { number: '25+', label: 'Promotions' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{stat.number}</p>
              <p className="text-sky-200 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 lg:max-w-md flex flex-col items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div className="w-9 h-9 bg-sky-600 rounded-xl flex items-center justify-center">
              <School size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">EduManager</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Connexion</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Accédez à votre espace de gestion</p>

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Adresse email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <><Loader size={15} className="animate-spin" /> Connexion...</> : 'Se connecter'}
            </button>
          </form>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Comptes de démonstration
            </p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {demoAccounts.map(acc => (
                <button
                  key={acc.email}
                  onClick={() => handleDemoLogin(acc.email, acc.password)}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all hover:scale-[1.02] active:scale-[0.98] ${acc.color}`}
                >
                  {acc.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
              Cliquez sur un rôle pour pré-remplir les champs. Mot de passe: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">Demo123!</code>
            </p>
            <button
              onClick={handleSeedDemo}
              disabled={seeding}
              className="w-full py-2 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {seeding ? <Loader size={12} className="animate-spin" /> : <Database size={12} />}
              {seeding ? 'Création en cours...' : 'Initialiser les données de démonstration'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
