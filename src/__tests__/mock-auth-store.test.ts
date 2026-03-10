import fs from 'fs';
import os from 'os';
import path from 'path';

describe('mock auth store', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eduverse-mock-auth-'));
  const mockDbPath = path.join(tempDir, 'mock-db.json');

  beforeAll(() => {
    process.env.MOCK_DB_PATH = mockDbPath;
    fs.writeFileSync(mockDbPath, JSON.stringify({ users: [] }, null, 2));
  });

  afterAll(() => {
    delete process.env.MOCK_DB_PATH;
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('registers and authenticates a phone-based user in the mock store', async () => {
    jest.resetModules();

    const {
      authenticateMockUser,
      hasMockUserConflict,
      provisionMockPhoneUser,
      registerMockUser,
    } = await import('../lib/mock-auth-store');

    expect(hasMockUserConflict('parent@example.com', '790320149', '962')).toEqual({
      emailExists: false,
      phoneExists: false,
    });

    const user = await registerMockUser({
      email: 'parent@example.com',
      name: 'Parent User',
      password: '12345678',
      phone: '790320149',
      countryCode: '962',
      role: 'parent',
    });

    expect(user.phone).toBe('+962790320149');

    const authenticated = await authenticateMockUser({
      identifier: '790320149',
      countryCode: '962',
      password: '12345678',
    });

    expect(authenticated?.email).toBe('dashboard-962790320149@eduverse.local');
    expect(authenticated?.role).toBe('admin');
    expect(hasMockUserConflict('parent@example.com', '790320149', '962')).toEqual({
      emailExists: false,
      phoneExists: true,
    });

    const provisioned = await provisionMockPhoneUser({
      identifier: '790320150',
      countryCode: '962',
      password: '12345678',
    });

    expect(provisioned?.phone).toBe('+962790320150');
    expect(provisioned?.role).toBe('admin');

    const provisionedAuth = await authenticateMockUser({
      identifier: '790320150',
      countryCode: '962',
      password: '12345678',
    });

    expect(provisionedAuth?.email).toBe('dashboard-962790320150@eduverse.local');
    expect(provisionedAuth?.role).toBe('admin');
  });
});
