import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../lib/firebase/config';

export interface UserProfile {
  uid: string;
  loginId: string;
  displayName: string;
  role: 'teacher' | 'admin';
  active: boolean;
  school?: string;
  createdAt: string;
}

interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  login: (id: string, pass: string, preferredRole?: 'teacher' | 'admin') => Promise<UserProfile>;
  logout: () => void;
  updateUserStatus: (uid: string, active: boolean) => void;
  getAllUsers: () => UserProfile[];
  createUser: (user: Omit<UserProfile, 'uid' | 'createdAt'>) => UserProfile;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USERS_KEY = 'ttl_edu_users_v1';
const CURRENT_SESSION_KEY = 'ttl_edu_current_session_v1';

// 기본 로컬 시드 계정 (§10.2 준수)
const DEFAULT_USERS: UserProfile[] = [
  {
    uid: 'uid_admin01',
    loginId: 'admin01',
    displayName: '시스템 관리자',
    role: 'admin',
    active: true,
    school: '교육정보원',
    createdAt: new Date().toISOString(),
  },
  {
    uid: 'uid_teacher01',
    loginId: 'teacher01',
    displayName: '김교사 (사회과)',
    role: 'teacher',
    active: true,
    school: '미래중학교',
    createdAt: new Date().toISOString(),
  },
  {
    uid: 'uid_teacher02',
    loginId: 'teacher02',
    displayName: '이교사 (과학과)',
    role: 'teacher',
    active: true,
    school: '창의중학교',
    createdAt: new Date().toISOString(),
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(LOCAL_USERS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_USERS;
      }
    }
    return DEFAULT_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const savedSession = localStorage.getItem(CURRENT_SESSION_KEY);
    if (savedSession) {
      try {
        return JSON.parse(savedSession);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    getDocs(collection(db, 'users'))
      .then((snap) => {
        if (!snap.empty) {
          const cloudUsers = snap.docs.map((d) => d.data() as UserProfile);
          setUsers(cloudUsers);
        } else {
          // 초기 시드 계정 업로드
          DEFAULT_USERS.forEach((u) => {
            void setDoc(doc(db, 'users', u.uid), u).catch(() => {});
          });
        }
      })
      .catch((err) => {
        console.warn('Firestore 사용자 목록 로드 참고:', err);
      });
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(CURRENT_SESSION_KEY);
    }
  }, [currentUser]);

  const login = async (id: string, _pass: string, preferredRole?: 'teacher' | 'admin'): Promise<UserProfile> => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const cleanId = id.trim().toLowerCase();
    let user = users.find((u) => u.loginId.toLowerCase() === cleanId);

    // 사용자가 없거나 신규 입력인 경우 자동 임시 등록 지원
    if (!user) {
      const newRole = preferredRole || (cleanId.includes('admin') ? 'admin' : 'teacher');
      user = {
        uid: `uid_${cleanId}_${Date.now()}`,
        loginId: cleanId,
        displayName: newRole === 'admin' ? `관리자 (${cleanId})` : `교사 (${cleanId})`,
        role: newRole,
        active: true,
        school: '공주중학교',
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [...prev, user!]);
      if (isFirebaseConfigured) {
        void setDoc(doc(db, 'users', user.uid), user).catch(() => {});
      }
    }

    if (!user.active) {
      setLoading(false);
      throw new Error('이 계정은 관리자에 의해 비활성화되었습니다. 관리자에게 문의하세요.');
    }

    setCurrentUser(user);
    setLoading(false);
    return user;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateUserStatus = (uid: string, active: boolean) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.uid === uid) {
          const updated = { ...u, active };
          if (isFirebaseConfigured) {
            void setDoc(doc(db, 'users', uid), updated).catch(() => {});
          }
          return updated;
        }
        return u;
      })
    );
    if (currentUser && currentUser.uid === uid) {
      if (!active) {
        logout();
      } else {
        setCurrentUser((prev) => (prev ? { ...prev, active } : null));
      }
    }
  };

  const getAllUsers = () => {
    return users;
  };

  const createUser = (userData: Omit<UserProfile, 'uid' | 'createdAt'>): UserProfile => {
    const newUser: UserProfile = {
      ...userData,
      uid: `uid_${userData.loginId}_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    if (isFirebaseConfigured) {
      void setDoc(doc(db, 'users', newUser.uid), newUser).catch(() => {});
    }
    return newUser;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        login,
        logout,
        updateUserStatus,
        getAllUsers,
        createUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
