import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { logger } from '../utils/logger.js';

const router = Router();

// Persistent user storage
const DATA_DIR = path.resolve(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// ─── Types ─────────────────────────────
type Role = 'admin' | 'analyst' | 'viewer';

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: Role;
  avatar?: string;
  department?: string;
  phone?: string;
  enabled: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  // Password hash (never returned to client)
  _passwordHash?: string;
}

// ─── Role permissions matrix ───────────
const ROLE_PERMISSIONS: Record<Role, string[]> = {
  admin: [
    'dashboard.view',
    'threat-intel.view', 'threat-intel.sync',
    'darkweb.view', 'darkweb.search',
    'vulnerabilities.view', 'vulnerabilities.scan',
    'attack-surface.view',
    'news.view',
    'data-leaks.view', 'data-leaks.search',
    'ai-analyst.view', 'ai-analyst.query',
    'admin.view', 'admin.config', 'admin.users', 'admin.users.create', 'admin.users.edit', 'admin.users.delete',
    'reports.create', 'reports.export',
  ],
  analyst: [
    'dashboard.view',
    'threat-intel.view', 'threat-intel.sync',
    'darkweb.view', 'darkweb.search',
    'vulnerabilities.view', 'vulnerabilities.scan',
    'attack-surface.view',
    'news.view',
    'data-leaks.view', 'data-leaks.search',
    'ai-analyst.view', 'ai-analyst.query',
    'reports.create', 'reports.export',
  ],
  viewer: [
    'dashboard.view',
    'threat-intel.view',
    'darkweb.view',
    'vulnerabilities.view',
    'attack-surface.view',
    'news.view',
    'data-leaks.view',
    'ai-analyst.view',
  ],
};

// ─── Helpers ───────────────────────────
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_monitor7adi_salt').digest('hex');
}

function generateId(): string {
  return crypto.randomUUID();
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getDefaultUsers(): User[] {
  return [
    {
      id: generateId(),
      username: 'admin',
      email: 'admin@monitor7adi.local',
      fullName: 'Administrateur',
      role: 'admin',
      department: 'SOC',
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _passwordHash: hashPassword('admin'),
    },
    {
      id: generateId(),
      username: 'analyst',
      email: 'analyst@monitor7adi.local',
      fullName: 'Analyste SOC',
      role: 'analyst',
      department: 'SOC',
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _passwordHash: hashPassword('analyst'),
    },
  ];
}

function loadUsers(): User[] {
  try {
    ensureDataDir();
    if (fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(raw);
    }
    // First run — create defaults
    const defaults = getDefaultUsers();
    fs.writeFileSync(USERS_FILE, JSON.stringify(defaults, null, 2));
    return defaults;
  } catch (err) {
    logger.error('Failed to load users', err);
    return getDefaultUsers();
  }
}

function saveUsers(users: User[]) {
  ensureDataDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

/** Strip password hash and sensitive fields before sending to client */
function sanitize(user: User): Omit<User, '_passwordHash'> {
  const { _passwordHash, ...clean } = user;
  return clean;
}

// ═════════════════════════════════════════
// ROUTES
// ═════════════════════════════════════════

/**
 * GET /api/users — list all users
 */
router.get('/', (_req: Request, res: Response) => {
  try {
    const users = loadUsers();
    res.json(users.map(sanitize));
  } catch (err) {
    logger.error('GET /users error', err);
    res.status(500).json({ error: 'Failed to load users' });
  }
});

/**
 * GET /api/users/roles — get available roles and their permissions
 */
router.get('/roles', (_req: Request, res: Response) => {
  const roles = Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => ({
    id: role,
    label: role === 'admin' ? 'Administrateur' : role === 'analyst' ? 'Analyste SOC' : 'Lecteur',
    description:
      role === 'admin'
        ? 'Accès complet : configuration, gestion des utilisateurs, toutes les fonctionnalités'
        : role === 'analyst'
          ? 'Accès aux outils d\'analyse : threat intel, scans, recherche, rapports'
          : 'Accès en lecture seule aux tableaux de bord et rapports',
    permissions,
    color: role === 'admin' ? 'red' : role === 'analyst' ? 'blue' : 'gray',
  }));
  res.json(roles);
});

/**
 * GET /api/users/:id — get single user
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const users = loadUsers();
    const user = users.find(u => u.id === req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(sanitize(user));
  } catch (err) {
    logger.error('GET /users/:id error', err);
    res.status(500).json({ error: 'Failed to load user' });
  }
});

/**
 * POST /api/users — create user
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const { username, email, fullName, role, department, phone, password, enabled } = req.body;

    if (!username || !email || !fullName || !role || !password) {
      res.status(400).json({ error: 'Champs requis: username, email, fullName, role, password' });
      return;
    }

    if (!['admin', 'analyst', 'viewer'].includes(role)) {
      res.status(400).json({ error: 'Rôle invalide. Valeurs: admin, analyst, viewer' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
      return;
    }

    const users = loadUsers();

    // Check duplicate username/email
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      res.status(409).json({ error: `Le nom d'utilisateur "${username}" existe déjà` });
      return;
    }
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      res.status(409).json({ error: `L'email "${email}" est déjà utilisé` });
      return;
    }

    const now = new Date().toISOString();
    const newUser: User = {
      id: generateId(),
      username,
      email,
      fullName,
      role,
      department: department || '',
      phone: phone || '',
      enabled: enabled !== false,
      createdAt: now,
      updatedAt: now,
      _passwordHash: hashPassword(password),
    };

    users.push(newUser);
    saveUsers(users);
    logger.info(`User created: ${username} (${role})`);
    res.status(201).json(sanitize(newUser));
  } catch (err) {
    logger.error('POST /users error', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

/**
 * PUT /api/users/:id — update user
 */
router.put('/:id', (req: Request, res: Response) => {
  try {
    const users = loadUsers();
    const idx = users.findIndex(u => u.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { username, email, fullName, role, department, phone, password, enabled } = req.body;
    const existing = users[idx];

    // Check duplicate username/email (exclude current user)
    if (username && username.toLowerCase() !== existing.username.toLowerCase()) {
      if (users.some(u => u.id !== existing.id && u.username.toLowerCase() === username.toLowerCase())) {
        res.status(409).json({ error: `Le nom d'utilisateur "${username}" existe déjà` });
        return;
      }
    }
    if (email && email.toLowerCase() !== existing.email.toLowerCase()) {
      if (users.some(u => u.id !== existing.id && u.email.toLowerCase() === email.toLowerCase())) {
        res.status(409).json({ error: `L'email "${email}" est déjà utilisé` });
        return;
      }
    }

    if (role && !['admin', 'analyst', 'viewer'].includes(role)) {
      res.status(400).json({ error: 'Rôle invalide' });
      return;
    }

    const updated: User = {
      ...existing,
      username: username || existing.username,
      email: email || existing.email,
      fullName: fullName || existing.fullName,
      role: role || existing.role,
      department: department !== undefined ? department : existing.department,
      phone: phone !== undefined ? phone : existing.phone,
      enabled: enabled !== undefined ? enabled : existing.enabled,
      updatedAt: new Date().toISOString(),
    };

    // Update password if provided
    if (password && password.length >= 6) {
      updated._passwordHash = hashPassword(password);
    }

    users[idx] = updated;
    saveUsers(users);
    logger.info(`User updated: ${updated.username}`);
    res.json(sanitize(updated));
  } catch (err) {
    logger.error('PUT /users/:id error', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

/**
 * DELETE /api/users/:id — delete user
 */
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const users = loadUsers();
    const idx = users.findIndex(u => u.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Prevent deleting last admin
    const target = users[idx];
    if (target.role === 'admin') {
      const adminCount = users.filter(u => u.role === 'admin' && u.id !== target.id).length;
      if (adminCount === 0) {
        res.status(400).json({ error: 'Impossible de supprimer le dernier administrateur' });
        return;
      }
    }

    const deleted = users.splice(idx, 1)[0];
    saveUsers(users);
    logger.info(`User deleted: ${deleted.username}`);
    res.json({ message: `Utilisateur "${deleted.username}" supprimé`, id: deleted.id });
  } catch (err) {
    logger.error('DELETE /users/:id error', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

/**
 * PATCH /api/users/:id/toggle — enable/disable user
 */
router.patch('/:id/toggle', (req: Request, res: Response) => {
  try {
    const users = loadUsers();
    const idx = users.findIndex(u => u.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Prevent disabling last enabled admin
    const target = users[idx];
    if (target.role === 'admin' && target.enabled) {
      const enabledAdmins = users.filter(u => u.role === 'admin' && u.enabled && u.id !== target.id).length;
      if (enabledAdmins === 0) {
        res.status(400).json({ error: 'Impossible de désactiver le dernier administrateur actif' });
        return;
      }
    }

    users[idx] = {
      ...users[idx],
      enabled: !users[idx].enabled,
      updatedAt: new Date().toISOString(),
    };

    saveUsers(users);
    logger.info(`User ${users[idx].enabled ? 'enabled' : 'disabled'}: ${users[idx].username}`);
    res.json(sanitize(users[idx]));
  } catch (err) {
    logger.error('PATCH /users/:id/toggle error', err);
    res.status(500).json({ error: 'Failed to toggle user' });
  }
});

/**
 * POST /api/users/:id/reset-password — reset password
 */
router.post('/:id/reset-password', (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
      return;
    }

    const users = loadUsers();
    const idx = users.findIndex(u => u.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    users[idx]._passwordHash = hashPassword(password);
    users[idx].updatedAt = new Date().toISOString();
    saveUsers(users);
    logger.info(`Password reset for: ${users[idx].username}`);
    res.json({ message: `Mot de passe réinitialisé pour "${users[idx].username}"` });
  } catch (err) {
    logger.error('POST /users/:id/reset-password error', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

export { router as usersRouter };
