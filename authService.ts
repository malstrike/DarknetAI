
import { User, UserRole } from '../types';

const USERS_KEY = 'screenhost_users';
const CURRENT_USER_KEY = 'screenhost_current_user';

// Initialize default data if empty
const initializeStore = () => {
  const existing = localStorage.getItem(USERS_KEY);
  
  // We strictly enforce admin passwords. If the admins don't match the new schema, reset them or update them.
  // For simplicity in this environment, we will re-initialize defaults if admins lack passwords or don't exist.
  let shouldReset = !existing;
  
  if (existing) {
     const users = JSON.parse(existing) as User[];
     const admin = users.find(u => u.username === 'admin');
     if (admin && !admin.password) shouldReset = true; 
  }

  if (shouldReset) {
    const defaultUsers: User[] = [
      {
        id: 'u_admin',
        username: 'admin',
        password: '5551337', // Hardcoded Admin Password
        role: UserRole.ADMIN,
        isBanned: false,
        coins: 999999999,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'u_shadowmaster',
        username: 'shadowmaster',
        password: '5551337', // Hardcoded Admin Password
        role: UserRole.ADMIN,
        isBanned: false,
        coins: 999999999,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'u_user',
        username: 'user',
        password: 'password', // Default user password
        role: UserRole.USER,
        isBanned: false,
        coins: 100,
        createdAt: new Date().toISOString(),
      }
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  }
};

initializeStore();

export const getAllUsers = (): User[] => {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const registerUser = (username: string, password?: string): User => {
  const users = getAllUsers();
  const lowerName = username.toLowerCase();
  
  if (users.find(u => u.username.toLowerCase() === lowerName)) {
    throw new Error("Target identity already occupied.");
  }

  if (!password) {
      throw new Error("Security Key (Password) required for node registration.");
  }

  // Auto-detect admin by special username
  const isAdmin = lowerName === 'admin' || lowerName === 'shadowmaster';

  const newUser: User = {
    id: `u_${Date.now()}`,
    username,
    password, 
    role: isAdmin ? UserRole.ADMIN : UserRole.USER,
    isBanned: false,
    coins: isAdmin ? 999999999 : 100, // New users get 100 coins welcome bonus
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return newUser;
};

export const loginUser = (username: string, password?: string): User => {
  const users = getAllUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  
  if (!user) {
    throw new Error("Identity not found in database.");
  }

  // Check password if set on the user object
  if (user.password && user.password !== password) {
      throw new Error("INVALID SECURITY KEY. ACCESS DENIED.");
  }
  
  if (user.isBanned) {
    throw new Error("BLACK LISTED: Node isolated by Darknet Admin.");
  }

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return user;
};

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const toggleBanStatus = (userId: string): User[] => {
  const users = getAllUsers();
  const updatedUsers = users.map(user => {
    if (user.id === userId && user.role !== UserRole.ADMIN) {
      return { ...user, isBanned: !user.isBanned };
    }
    return user;
  });
  
  localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
  return updatedUsers;
};

export const spendCoins = (userId: string, amount: number): User => {
  const users = getAllUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) throw new Error("User not found");
  
  const currentUser = users[userIndex];
  
  if (currentUser.coins < amount) {
    throw new Error("INSUFFICIENT CRYPTO FUNDS");
  }

  const updatedUser = { ...currentUser, coins: currentUser.coins - amount };
  users[userIndex] = updatedUser;
  
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  // Update current session if it's the logged in user
  const sessionUser = getCurrentUser();
  if (sessionUser && sessionUser.id === userId) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
  }
  
  return updatedUser;
};