import { useState } from 'react';
import { motion } from 'framer-motion';
import { School, User as UserIcon, Lock, Eye, EyeOff, Loader, Database } from 'lucide-react'; // Changé Mail par UserIcon
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';

export default function Login() {
  const { signIn, seedDemoData } = useAuth();
  const { showToast } = useToast();
  
  // Dans Django, on utilise souvent le 'username' pour le login
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Mise à jour des comptes démo avec les usernames du script Django
  const demoAccounts = [
    { label: 'Admin', user: 'admin_demo', pass: 'Demo123!', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800' },
    { label: 'Enseignant', user: 'prof_dupont', pass: 'Demo123!', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
    { label: 'Étudiant', user: 'alice_etu', pass: 'Demo123!', color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // On passe le username à la place de l'email
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Section Gauche : Identité visuelle (Senior Enterprise) */}
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
            className="text-4xl font-bold text-white mb-4 leading-tight"
          >
            Maîtrisez votre<br />écosystème<br />éducatif.
          </motion.h2>
          <p className="text-sky-200 text-lg">Solution Master 1 IA : Pilotage par les données et interface haute fidélité.</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { number: '50', label: 'Étudiants Test' },
            { number: '1000+', label: 'Notes MySQL' },
            { number: 'Django', label: 'Backend' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{stat.number}</p>
              <p className="text-sky-200 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section Droite : Formulaire */}
      <div className="flex-1 lg:max-w-md flex flex-col items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Authentification</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Base de données MySQL locale</p>

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nom d'utilisateur</label>
              <div className="relative">
                <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="ex: admin_demo"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none transition"
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
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none transition"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader size={15} className="animate-spin" /> : 'Se connecter'}
            </button>
          </form>

          {/* Aide au test (Pratique pour ton projet) */}
          <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Accès rapide (Démo)</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {demoAccounts.map(acc => (
                <button
                  key={acc.user}
                  onClick={() => handleDemoLogin(acc.user, acc.pass)}
                  className={`py-2 px-1 rounded-lg border text-[10px] font-medium transition-transform active:scale-95 ${acc.color}`}
                >
                  {acc.label}
                </button>
              ))}
            </div>
            
            <button
              onClick={handleSeedDemo}
              disabled={seeding}
              className="w-full py-2 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              {seeding ? <Loader size={12} className="animate-spin" /> : <Database size={12} />}
              Initialiser MySQL
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}