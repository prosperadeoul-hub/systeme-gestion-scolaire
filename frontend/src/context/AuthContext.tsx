import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Configuration de base d'Axios pour Django
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
});

interface User {
  id: string;
  username: string;
  email: string;
}

interface Profile {
  id: string;
  role: 'ADMIN' | 'ENSEIGNANT' | 'ETUDIANT';
  full_name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  seedDemoData: () => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  seedDemoData: async () => ({ error: null }),
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Vérifier si un token existe au chargement
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async (token: string) => {
    try {
      const response = await api.get('/me/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.user);
      setProfile(response.data.profile);
    } catch (err) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (username: string, password: string): Promise<{ error: string | null }> => {
    try {
      // Django REST Framework utilise souvent 'username' au lieu de 'email' pour le login par défaut
      const response = await api.post('/token/', { username, password });
      const { access, user: userData, profile: profileData } = response.data;
      
      localStorage.setItem('token', access);
      setUser(userData);
      setProfile(profileData);
      return { error: null };
    } catch (error: any) {
      return { error: error.response?.data?.detail || "Erreur de connexion" };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('token');
    setUser(null);
    setProfile(null);
  };

  const seedDemoData = async (): Promise<{ error: string | null }> => {
    try {
      // On délègue le seeding au backend Django pour plus de sécurité et de cohérence
      await api.post('/seed-data/');
      return { error: null };
    } catch (e) {
      return { error: "Erreur lors du seeding via Django" };
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, seedDemoData }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);