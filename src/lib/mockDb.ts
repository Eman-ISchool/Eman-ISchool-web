import fs from 'fs';
import path from 'path';

export interface Grade { id: string; name: string; }
export interface Class { id: string; grade_id: string; name: string; }
export interface Subject { id: string; class_id: string; teacher_id: string; title: string; }
export interface Session { id: string; subject_id: string; teacher_id: string; title: string; meetLink: string; google_event_id: string; }

function getDbPath() {
    return process.env.MOCK_DB_PATH || path.join(process.cwd(), '.mock-db.json');
}

const defaultDb = {
    grades: [] as Grade[],
    classes: [] as Class[],
    subjects: [] as Subject[],
    sessions: [] as Session[]
};

export function getMockDb() {
    try {
        const dbPath = getDbPath();
        if (fs.existsSync(dbPath)) {
            const data = fs.readFileSync(dbPath, 'utf-8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Error reading mock db', e);
    }
    return { ...defaultDb };
}

export function saveMockDb(db: any) {
    try {
        fs.writeFileSync(getDbPath(), JSON.stringify(db, null, 2));
    } catch (e) {
        console.error('Error writing mock db', e);
    }
}

// Support older synchronous API from previous iteration
export const mockDb = new Proxy({}, {
    get(target, prop) {
        const db = getMockDb();
        const arr = db[prop as string];
        if (Array.isArray(arr)) {
            // Return a monkey-patched array where push() saves automatically
            const originalPush = arr.push.bind(arr);
            arr.push = function (...args: any[]) {
                originalPush(...args);
                saveMockDb(db);
                return arr.length;
            };
            return arr;
        }
        return db[prop as string];
    }
}) as any;
