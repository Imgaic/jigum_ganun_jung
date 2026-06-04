import "server-only";

import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import type { RankingEntry, UserProfile } from "./types";

type DatabaseInstance = Database.Database;

interface UserRow {
  id: number;
  username: string;
  password_hash: string;
  nickname: string;
  points: number;
  report_count: number;
  trust_score: number;
  created_at: string;
  last_login_at: string | null;
}

interface RankingRow {
  id: number;
  nickname: string;
  points: number;
  report_count: number;
  trust_score: number;
  score: number;
}

interface TestUserSeed {
  username: string;
  nickname: string;
  points: number;
  reportCount: number;
  trustScore: number;
}

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "jigum_ganun_jung.sqlite");
const TEST_PASSWORD = "cau1234!";

const testUsers: TestUserSeed[] = [
  { username: "test01", nickname: "중앙도서관러", points: 620, reportCount: 41, trustScore: 96 },
  { username: "test02", nickname: "310관지킴이", points: 560, reportCount: 38, trustScore: 91 },
  { username: "test03", nickname: "공강탐험가", points: 510, reportCount: 33, trustScore: 88 },
  { username: "test04", nickname: "학식레이더", points: 470, reportCount: 31, trustScore: 84 },
  { username: "test05", nickname: "서라벌스팟터", points: 430, reportCount: 27, trustScore: 82 },
  { username: "test06", nickname: "라운지요정", points: 390, reportCount: 24, trustScore: 79 },
  { username: "test07", nickname: "혼잡도분석가", points: 350, reportCount: 22, trustScore: 75 },
  { username: "test08", nickname: "카페인충전소", points: 300, reportCount: 18, trustScore: 72 },
  { username: "test09", nickname: "휴식공간찾기", points: 260, reportCount: 15, trustScore: 70 },
  { username: "test10", nickname: "새내기제보단", points: 210, reportCount: 12, trustScore: 66 },
];

const globalForDb = globalThis as typeof globalThis & {
  jigumGanunJungDb?: DatabaseInstance;
};

export function getDb() {
  if (globalForDb.jigumGanunJungDb) {
    return globalForDb.jigumGanunJungDb;
  }

  fs.mkdirSync(DB_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  seedTestUsers(db);

  globalForDb.jigumGanunJungDb = db;
  return db;
}

function migrate(db: DatabaseInstance) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      nickname TEXT NOT NULL,
      points INTEGER NOT NULL DEFAULT 0,
      report_count INTEGER NOT NULL DEFAULT 0,
      trust_score INTEGER NOT NULL DEFAULT 70,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_login_at TEXT
    );

    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      place_id INTEGER NOT NULL,
      crowd_level INTEGER NOT NULL CHECK (crowd_level BETWEEN 1 AND 5),
      duration_minutes INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
  `);
}

function seedTestUsers(db: DatabaseInstance) {
  const existing = db.prepare("SELECT id FROM users WHERE username = ?").get("test01");
  if (existing) return;

  const passwordHash = bcrypt.hashSync(TEST_PASSWORD, 10);
  const insert = db.prepare(`
    INSERT INTO users (username, password_hash, nickname, points, report_count, trust_score)
    VALUES (@username, @passwordHash, @nickname, @points, @reportCount, @trustScore)
  `);

  const seed = db.transaction(() => {
    testUsers.forEach((user) => insert.run({ ...user, passwordHash }));
  });

  seed();
}

export function findUserByUsername(username: string) {
  return getDb()
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username) as UserRow | undefined;
}

export function findUserById(userId: number) {
  return getDb()
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(userId) as UserRow | undefined;
}

export function createUser(username: string, passwordHash: string, nickname: string) {
  const result = getDb()
    .prepare(`
      INSERT INTO users (username, password_hash, nickname, points, report_count, trust_score)
      VALUES (?, ?, ?, 0, 0, 70)
    `)
    .run(username, passwordHash, nickname);

  return Number(result.lastInsertRowid);
}

export function touchLastLogin(userId: number) {
  getDb().prepare("UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?").run(userId);
}

export function recordReport(userId: number, placeId: number, crowdLevel: number, durationMinutes: number, pointsAwarded: number) {
  const db = getDb();
  const insertReport = db.prepare(`
    INSERT INTO reports (user_id, place_id, crowd_level, duration_minutes)
    VALUES (?, ?, ?, ?)
  `);
  const updateUser = db.prepare(`
    UPDATE users
    SET points = points + ?,
        report_count = report_count + 1,
        trust_score = MIN(100, trust_score + 1)
    WHERE id = ?
  `);

  const save = db.transaction(() => {
    insertReport.run(userId, placeId, crowdLevel, durationMinutes);
    updateUser.run(pointsAwarded, userId);
  });

  save();
}

export function getRankedRows() {
  return getDb()
    .prepare(`
      SELECT
        id,
        nickname,
        points,
        report_count,
        trust_score,
        points + report_count * 5 + trust_score * 2 AS score
      FROM users
      ORDER BY score DESC, report_count DESC, points DESC, nickname ASC
    `)
    .all() as RankingRow[];
}

export function getUserProfile(userId: number): UserProfile | null {
  const rows = getRankedRows();
  const index = rows.findIndex((row) => row.id === userId);
  const user = findUserById(userId);

  if (!user || index < 0) return null;

  const ranked = rows[index];
  return {
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    points: user.points,
    reportCount: user.report_count,
    trustScore: user.trust_score,
    rank: index + 1,
    score: ranked.score,
  };
}

export function getTopRankings(currentUserId?: number): RankingEntry[] {
  return getRankedRows().slice(0, 10).map((row, index) => ({
    rank: index + 1,
    nickname: row.nickname,
    points: row.points,
    reportCount: row.report_count,
    trustScore: row.trust_score,
    score: row.score,
    isCurrentUser: row.id === currentUserId,
  }));
}

export function getTestPassword() {
  return TEST_PASSWORD;
}
