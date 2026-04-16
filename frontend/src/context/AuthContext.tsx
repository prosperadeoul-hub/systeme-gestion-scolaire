import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/types';

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

const DEMO_ACCOUNTS = [
  { email: 'admin@ecole.demo', password: 'Demo123!', role: 'ADMIN' as const, full_name: 'Jean Administrateur' },
  { email: 'dupont@ecole.demo', password: 'Demo123!', role: 'ENSEIGNANT' as const, full_name: 'Prof. Marie Dupont', specialite: 'Intelligence Artificielle' },
  { email: 'martin@ecole.demo', password: 'Demo123!', role: 'ENSEIGNANT' as const, full_name: 'Prof. Pierre Martin', specialite: 'Réseaux & Sécurité' },
  { email: 'alice@ecole.demo', password: 'Demo123!', role: 'ETUDIANT' as const, full_name: 'Alice Bernard', matricule: 'ETU001' },
  { email: 'bob@ecole.demo', password: 'Demo123!', role: 'ETUDIANT' as const, full_name: 'Bob Leclerc', matricule: 'ETU002' },
  { email: 'clara@ecole.demo', password: 'Demo123!', role: 'ETUDIANT' as const, full_name: 'Clara Morin', matricule: 'ETU003' },
  { email: 'david@ecole.demo', password: 'Demo123!', role: 'ETUDIANT' as const, full_name: 'David Rousseau', matricule: 'ETU004' },
  { email: 'emma@ecole.demo', password: 'Demo123!', role: 'ETUDIANT' as const, full_name: 'Emma Fontaine', matricule: 'ETU005' },
  { email: 'farid@ecole.demo', password: 'Demo123!', role: 'ETUDIANT' as const, full_name: 'Farid Benali', matricule: 'ETU006' },
  { email: 'gabriel2@ecole.demo', password: 'Demo123!', role: 'ETUDIANT' as const, full_name: 'Gabriel Simon', matricule: 'ETU007' },
  { email: 'helena@ecole.demo', password: 'Demo123!', role: 'ETUDIANT' as const, full_name: 'Héléna Petit', matricule: 'ETU008' },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    setProfile(data);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        (async () => { await fetchProfile(session.user.id); })();
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const seedDemoData = async (): Promise<{ error: string | null }> => {
    try {
      const userIds: Record<string, string> = {};

      for (const account of DEMO_ACCOUNTS) {
        const { data: existingUser } = await supabase.auth.signInWithPassword({ email: account.email, password: account.password });
        if (existingUser.user) {
          userIds[account.email] = existingUser.user.id;
          await supabase.auth.signOut();
          continue;
        }
        const { data, error } = await supabase.auth.signUp({ email: account.email, password: account.password });
        if (error || !data.user) continue;
        userIds[account.email] = data.user.id;
        await supabase.from('profiles').upsert({ id: data.user.id, role: account.role, full_name: account.full_name, email: account.email });
        await supabase.auth.signOut();
      }

      const adminId = userIds['admin@ecole.demo'];
      if (adminId) await supabase.from('profiles').upsert({ id: adminId, role: 'ADMIN', full_name: 'Jean Administrateur', email: 'admin@ecole.demo' });

      const { data: promo1 } = await supabase.from('promotions').upsert([
        { nom: 'Master 1 IA', annee: 2026 },
        { nom: 'Licence 3 Info', annee: 2025 },
      ], { onConflict: 'nom,annee' }).select();
      const promotionList = promo1 ?? [];

      for (const acc of DEMO_ACCOUNTS.filter(a => a.role === 'ENSEIGNANT')) {
        const uid = userIds[acc.email];
        if (!uid) continue;
        await supabase.from('profiles').upsert({ id: uid, role: 'ENSEIGNANT', full_name: acc.full_name, email: acc.email });
        await supabase.from('professeurs').upsert({ user_id: uid, specialite: (acc as { specialite?: string }).specialite ?? '' }, { onConflict: 'user_id' });
      }

      const { data: profs } = await supabase.from('professeurs').select('*');
      const prof1 = profs?.[0];
      const prof2 = profs?.[1];

      const matiereData = [
        { nom: 'Machine Learning', code: 'ML101', coefficient: 4, categorie: 'TECH' as const, professeur_id: prof1?.id },
        { nom: 'Deep Learning', code: 'DL201', coefficient: 3, categorie: 'TECH' as const, professeur_id: prof1?.id },
        { nom: 'Réseaux Avancés', code: 'NET301', coefficient: 3, categorie: 'TECH' as const, professeur_id: prof2?.id },
        { nom: 'Cybersécurité', code: 'SEC401', coefficient: 3, categorie: 'TECH' as const, professeur_id: prof2?.id },
        { nom: 'Communication Pro', code: 'COM101', coefficient: 2, categorie: 'SOFT' as const, professeur_id: prof1?.id },
        { nom: 'Anglais Technique', code: 'ENG201', coefficient: 2, categorie: 'LANG' as const, professeur_id: prof2?.id },
        { nom: 'Statistiques', code: 'STAT101', coefficient: 3, categorie: 'SCIE' as const, professeur_id: prof1?.id },
      ];

      const { data: matieres } = await supabase.from('matieres').upsert(matiereData, { onConflict: 'code' }).select();

      const promo1Id = promotionList[0]?.id;
      const promo2Id = promotionList[1]?.id;

      if (matieres && promo1Id) {
        for (const m of matieres) {
          await supabase.from('matiere_promotions').upsert({ matiere_id: m.id, promotion_id: promo1Id });
          if (promo2Id && ['NET301', 'COM101', 'ENG201', 'STAT101'].includes(m.code)) {
            await supabase.from('matiere_promotions').upsert({ matiere_id: m.id, promotion_id: promo2Id });
          }
        }
      }

      const studentAccounts = DEMO_ACCOUNTS.filter(a => a.role === 'ETUDIANT');
      for (let i = 0; i < studentAccounts.length; i++) {
        const acc = studentAccounts[i];
        const uid = userIds[acc.email];
        if (!uid) continue;
        await supabase.from('profiles').upsert({ id: uid, role: 'ETUDIANT', full_name: acc.full_name, email: acc.email });
        const promoId = i < 5 ? promo1Id : promo2Id;
        await supabase.from('etudiants').upsert({
          user_id: uid,
          promotion_id: promoId,
          matricule: (acc as { matricule?: string }).matricule ?? '',
          frais_scolarite_total: 3500,
          frais_payes: Math.round(Math.random() * 3500 * 100) / 100,
        }, { onConflict: 'user_id' });
      }

      const { data: examensData } = await supabase.from('matieres').select('id, code').in('code', ['ML101', 'DL201', 'NET301', 'STAT101']);
      if (examensData) {
        const examToCreate = examensData.flatMap(m => [
          { nom: `Examen Mi-Semestre ${m.code}`, matiere_id: m.id, date_examen: '2025-11-15' },
          { nom: `Examen Final ${m.code}`, matiere_id: m.id, date_examen: '2026-01-20' },
        ]);
        const { data: createdExams } = await supabase.from('examens').upsert(examToCreate, { onConflict: 'nom,matiere_id' }).select();

        const { data: students } = await supabase.from('etudiants').select('id');
        if (students && createdExams) {
          for (const student of students) {
            for (const exam of createdExams) {
              const valeur = Math.round((Math.random() * 14 + 6) * 100) / 100;
              await supabase.from('notes').upsert({ etudiant_id: student.id, examen_id: exam.id, valeur }, { onConflict: 'etudiant_id,examen_id' });
            }
          }
        }
      }

      return { error: null };
    } catch (e) {
      return { error: String(e) };
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, seedDemoData }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
