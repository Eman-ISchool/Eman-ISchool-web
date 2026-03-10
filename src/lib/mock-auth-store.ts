import crypto from 'crypto';
import bcrypt from 'bcryptjs';

import { buildStoredPhone, getPhoneCandidates, isEmailIdentifier } from './auth-credentials';
import { getMockDb, saveMockDb } from './mockDb';

export interface MockAuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string | null;
  password_hash?: string | null;
  is_active?: boolean;
  image?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface RegisterMockUserInput {
  email: string;
  name: string;
  password: string;
  phone?: string | null;
  countryCode?: string | null;
  role?: string;
}

interface AuthenticateMockUserInput {
  identifier: string;
  password: string;
  countryCode?: string | null;
}

interface ProvisionMockPhoneUserInput {
  identifier: string;
  password: string;
  countryCode?: string | null;
  name?: string;
  role?: string;
}

function isLegacyProvisionedParentUser(user: MockAuthUser): boolean {
  const normalizedEmail = (user.email || '').trim().toLowerCase();
  const normalizedName = (user.name || '').trim().toLowerCase();

  return (
    user.role === 'parent' &&
    Boolean(user.phone) &&
    (
      normalizedEmail === 'parent@example.com' ||
      /^parent-\d+@eduverse\.local$/.test(normalizedEmail) ||
      normalizedName === 'parent user' ||
      normalizedName === 'local parent'
    )
  );
}

async function upgradeLegacyProvisionedParentUser(
  user: MockAuthUser,
  password?: string,
): Promise<MockAuthUser> {
  const users = readUsers();
  const userIndex = users.findIndex((candidate) => candidate.id === user.id);

  if (userIndex === -1) {
    return user;
  }

  const digits = (user.phone || '').replace(/\D/g, '');
  const normalizedNow = new Date().toISOString();
  const updatedUser: MockAuthUser = {
    ...user,
    email: digits ? `dashboard-${digits}@eduverse.local` : user.email,
    name: 'FutureLab Dashboard User',
    role: 'admin',
    updated_at: normalizedNow,
  };

  if (password) {
    updatedUser.password_hash = await bcrypt.hash(password, 10);
  }

  users[userIndex] = updatedUser;
  writeUsers(users);

  return updatedUser;
}

function readUsers(): MockAuthUser[] {
  const db = getMockDb();
  return Array.isArray(db.users) ? db.users : [];
}

function writeUsers(users: MockAuthUser[]) {
  const db = getMockDb();
  db.users = users;
  saveMockDb(db);
}

export function findMockUser(identifier: string, countryCode?: string | null): MockAuthUser | null {
  const users = readUsers();

  if (isEmailIdentifier(identifier)) {
    return (
      users.find(
        (user) => user.email && user.email.toLowerCase() === identifier.trim().toLowerCase(),
      ) || null
    );
  }

  const candidates = new Set(getPhoneCandidates(identifier, countryCode));
  return (
    users.find((user) => Boolean(user.phone && candidates.has(user.phone.replace(/\s+/g, '')))) ||
    null
  );
}

export async function authenticateMockUser({
  identifier,
  password,
  countryCode,
}: AuthenticateMockUserInput): Promise<MockAuthUser | null> {
  const user = findMockUser(identifier, countryCode);
  if (!user?.password_hash) {
    return null;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return null;
  }

  if (isLegacyProvisionedParentUser(user)) {
    return upgradeLegacyProvisionedParentUser(user);
  }

  return user;
}

export async function provisionMockPhoneUser({
  identifier,
  password,
  countryCode,
  name = 'FutureLab Dashboard User',
  role = 'admin',
}: ProvisionMockPhoneUserInput): Promise<MockAuthUser | null> {
  if (isEmailIdentifier(identifier)) {
    return null;
  }

  const existingUser = findMockUser(identifier, countryCode);
  if (existingUser) {
    if (isLegacyProvisionedParentUser(existingUser)) {
      return upgradeLegacyProvisionedParentUser(existingUser, password);
    }

    return null;
  }

  const storedPhone = buildStoredPhone(identifier, countryCode);
  if (!storedPhone) {
    return null;
  }

  const digits = storedPhone.replace(/\D/g, '');
  return registerMockUser({
    email: `dashboard-${digits}@eduverse.local`,
    name,
    password,
    phone: identifier,
    countryCode,
    role,
  });
}

export function hasMockUserConflict(email: string, phone?: string | null, countryCode?: string | null) {
  const normalizedEmail = email.trim().toLowerCase();
  const storedPhone = buildStoredPhone(phone, countryCode);
  const users = readUsers();

  const emailExists = users.some((user) => user.email?.toLowerCase() === normalizedEmail);
  const phoneExists = storedPhone
    ? users.some((user) => user.phone === storedPhone)
    : false;

  return { emailExists, phoneExists };
}

export async function registerMockUser({
  email,
  name,
  password,
  phone,
  countryCode,
  role = 'parent',
}: RegisterMockUserInput): Promise<MockAuthUser> {
  const normalizedEmail = email.trim().toLowerCase();
  const storedPhone = buildStoredPhone(phone, countryCode);
  const users = readUsers();
  const now = new Date().toISOString();

  const user: MockAuthUser = {
    id: crypto.randomUUID(),
    email: normalizedEmail,
    name: name.trim(),
    role,
    phone: storedPhone,
    password_hash: await bcrypt.hash(password, 10),
    is_active: true,
    image: null,
    created_at: now,
    updated_at: now,
  };

  users.push(user);
  writeUsers(users);

  return user;
}
