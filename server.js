"use strict";
// Serveur des comptes du site de menus : comptes, groupes, sauvegarde des données.
// Dépendance unique : pg. Toutes les tables sont préfixées "menus_" pour cohabiter
// avec les autres tables d'une base existante.

const http = require("http");
const crypto = require("crypto");
const { Pool } = require("pg");

const PORT = Number(process.env.PORT) || 3000;
const DB_URL = process.env.DATABASE_URL;
const ORIGINS = (process.env.ALLOWED_ORIGINS || "https://gamb-it-apps.fr,https://www.gamb-it-apps.fr")
  .split(",").map((s) => s.trim()).filter(Boolean);
const SESSION_DAYS = 180;
const MAX_BODY = 1024 * 1024;       // 1 Mo par requête
const MAX_DATA = 600 * 1024;        // 600 Ko de données par compte ou groupe

if (!DB_URL) {
  console.error("La variable DATABASE_URL est manquante.");
  process.exit(1);
}

// SSL pour les URL externes (nom d'hôte avec un point), pas pour les URL internes Render.
function sslFor(url) {
  try {
    const h = new URL(url).hostname;
    if (process.env.DATABASE_SSL === "false") return false;
    return h.includes(".") && h !== "127.0.0.1" ? { rejectUnauthorized: false } : false;
  } catch (e) {
    return false;
  }
}
const pool = new Pool({ connectionString: DB_URL, ssl: sslFor(DB_URL), max: 5 });
const q = (text, params) => pool.query(text, params);

// ---------- Schéma ----------
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS menus_users (
     id SERIAL PRIMARY KEY,
     username TEXT NOT NULL,
     username_key TEXT NOT NULL UNIQUE,
     name TEXT NOT NULL,
     pass_hash TEXT NOT NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS menus_sessions (
     token_hash TEXT PRIMARY KEY,
     user_id INT NOT NULL REFERENCES menus_users(id) ON DELETE CASCADE,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     expires_at TIMESTAMPTZ NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS menus_groups (
     id SERIAL PRIMARY KEY,
     name TEXT NOT NULL,
     invite_code TEXT NOT NULL UNIQUE,
     data JSONB NOT NULL DEFAULT '{}'::jsonb,
     version INT NOT NULL DEFAULT 0,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS menus_members (
     user_id INT PRIMARY KEY REFERENCES menus_users(id) ON DELETE CASCADE,
     group_id INT NOT NULL REFERENCES menus_groups(id) ON DELETE CASCADE,
     joined_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS menus_user_data (
     user_id INT PRIMARY KEY REFERENCES menus_users(id) ON DELETE CASCADE,
     data JSONB NOT NULL DEFAULT '{}'::jsonb,
     version INT NOT NULL DEFAULT 0,
     updated_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
  `CREATE INDEX IF NOT EXISTS menus_members_group ON menus_members(group_id)`,
  `ALTER TABLE menus_members ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'adulte'`,
  // plusieurs groupes par personne : la clé devient (personne, groupe), et chaque compte a un groupe actif
  `CREATE UNIQUE INDEX IF NOT EXISTS menus_members_ug ON menus_members(user_id, group_id)`,
  `ALTER TABLE menus_members DROP CONSTRAINT IF EXISTS menus_members_pkey`,
  `ALTER TABLE menus_users ADD COLUMN IF NOT EXISTS active_group INT`,
  `ALTER TABLE menus_groups ADD COLUMN IF NOT EXISTS icon TEXT NOT NULL DEFAULT ''`,
  `CREATE INDEX IF NOT EXISTS menus_sessions_user ON menus_sessions(user_id)`,
];
async function migrate() {
  for (const s of SCHEMA) await q(s);
  await q(`CREATE TABLE IF NOT EXISTS menus_migrations (name TEXT PRIMARY KEY, report JSONB, done_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
  try { await refDelfouine(); } catch (e) { console.error("Reprise du semainier :", e.message); }
}

// Reprise ponctuelle (8 nov. 2026) : le semainier de delfouine devient celui du groupe « Famille Lizzul »
// pour la semaine en cours et la suivante, et les adultes de la famille y sont rattachés.
async function refDelfouine() {
  const NAME = "ref-delfouine-2026-11-08";
  if ((await q(`SELECT 1 FROM menus_migrations WHERE name = $1`, [NAME])).rows.length) return;
  const rep = {};
  const obj = (v) => { if (typeof v === "string") { try { return JSON.parse(v); } catch (e) { return null; } } return v; };
  const done = async () => { await q(`INSERT INTO menus_migrations (name, report) VALUES ($1, $2::jsonb) ON CONFLICT DO NOTHING`, [NAME, JSON.stringify(rep)]); console.log("Reprise du semainier :", JSON.stringify(rep)); };
  const d = (await q(`SELECT id, name, active_group FROM menus_users WHERE username_key = 'delfouine'`)).rows[0];
  if (!d) { rep.skip = "compte delfouine introuvable"; return done(); }
  const did = Number(d.id);
  const gs = (await q(
    `SELECT g.id, g.name, g.updated_at, EXISTS (SELECT 1 FROM menus_members m WHERE m.group_id = g.id AND m.user_id = $1) AS hers
     FROM menus_groups g WHERE lower(g.name) LIKE '%famille%' AND lower(g.name) LIKE '%lizzul%'
     ORDER BY hers DESC, g.updated_at DESC`, [did])).rows;
  if (!gs.length) { rep.skip = "groupe Famille Lizzul introuvable"; return done(); }
  const target = Number(gs[0].id);
  rep.target = target;
  // delfouine dans le groupe, en adulte
  await q(`INSERT INTO menus_members (user_id, group_id, role) VALUES ($1, $2, 'adulte') ON CONFLICT DO NOTHING`, [did, target]);
  await q(`UPDATE menus_members SET role = 'adulte' WHERE user_id = $1 AND group_id = $2`, [did, target]);
  // où a-t-elle fait son semainier ? dans son groupe actif, sinon dans ses données personnelles
  // groupe effectivement utilisé avant la reprise (groupe actif, sinon le premier rejoint)
  const eff = await groupOf(did);
  const active = eff ? Number(eff.id) : null;
  let src = null;
  if (active && active !== target) {
    const r = (await q(`SELECT data->'weeks' AS w FROM menus_groups WHERE id = $1`, [active])).rows[0];
    if (r && obj(r.w)) { src = obj(r.w); rep.from = "group:" + active; }
  }
  if (!src && !active) {
    const r = (await q(`SELECT data->'weeks' AS w FROM menus_user_data WHERE user_id = $1`, [did])).rows[0];
    if (r && obj(r.w)) { src = obj(r.w); rep.from = "perso"; }
  }
  if (src) {
    const g = (await q(`SELECT data FROM menus_groups WHERE id = $1`, [target])).rows[0];
    const data = obj(g.data) || {};
    data.weeks = data.weeks || {};
    rep.copied = [];
    ["0", "1"].forEach((w) => {
      if (src[w] && src[w].plan && Object.keys(src[w].plan).length) {
        data.weeks[w] = Object.assign({}, src[w], { edit: { by: d.name, at: Date.now() } });
        rep.copied.push(w);
      }
    });
    if (rep.copied.length) await q(`UPDATE menus_groups SET data = $1::jsonb, version = version + 1, updated_at = now() WHERE id = $2`, [JSON.stringify(data), target]);
  } else rep.from = active === target ? "déjà dans le groupe" : "aucun semainier trouvé";
  // le groupe devient le groupe actif de delfouine et des autres adultes de ses groupes
  const adults = (await q(
    `SELECT DISTINCT m.user_id FROM menus_members m WHERE m.role = 'adulte' AND m.group_id IN (SELECT group_id FROM menus_members WHERE user_id = $1)`, [did])).rows.map((r) => Number(r.user_id));
  const julien = (await q(`SELECT id FROM menus_users WHERE lower(name) LIKE 'julien%' OR username_key LIKE 'julien%'`)).rows.map((r) => Number(r.id));
  if (julien.length === 1 && !adults.includes(julien[0])) adults.push(julien[0]);
  rep.adults = adults.length;
  for (const uid of adults) {
    await q(`INSERT INTO menus_members (user_id, group_id, role) VALUES ($1, $2, 'adulte') ON CONFLICT DO NOTHING`, [uid, target]);
    await q(`UPDATE menus_users SET active_group = $1 WHERE id = $2`, [target, uid]);
  }
  return done();
}

// ---------- Outils ----------
class HttpError extends Error {
  constructor(status, message, extra) { super(message); this.status = status; this.extra = extra; }
}
const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");

function hashPassword(pw) {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(pw, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$16384$8$1$${salt.toString("hex")}$${key.toString("hex")}`;
}
const DUMMY_HASH = hashPassword(crypto.randomBytes(8).toString("hex"));
function checkPassword(pw, stored) {
  const parts = String(stored).split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, N, r, p, saltHex, keyHex] = parts;
  const expected = Buffer.from(keyHex, "hex");
  const got = crypto.scryptSync(pw, Buffer.from(saltHex, "hex"), expected.length, { N: +N, r: +r, p: +p });
  return crypto.timingSafeEqual(expected, got);
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function inviteCode() {
  const b = crypto.randomBytes(6);
  let s = "";
  for (let i = 0; i < 6; i++) s += CODE_ALPHABET[b[i] % CODE_ALPHABET.length];
  return s;
}

// Limiteur simple en mémoire, par adresse IP et par action.
const hits = new Map();
function limit(req, action, max, windowMs) {
  const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
  const key = action + "|" + ip;
  const now = Date.now();
  const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (list.length >= max) throw new HttpError(429, "Trop de tentatives. Réessayez dans quelques minutes.");
  list.push(now);
  hits.set(key, list);
}
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of hits) if (!v.some((t) => now - t < 3600e3)) hits.delete(k);
}, 600e3).unref();

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY) { reject(new HttpError(413, "Données trop volumineuses.")); req.destroy(); return; }
      chunks.push(c);
    });
    req.on("end", () => {
      if (!chunks.length) return resolve({});
      try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8"))); }
      catch (e) { reject(new HttpError(400, "Requête illisible.")); }
    });
    req.on("error", reject);
  });
}

const KID_KEYS = ["fav", "panier"];
function childMerge(cur, inc, username) {
  const out = JSON.parse(JSON.stringify(cur || {}));
  KID_KEYS.forEach((k) => { if (inc[k] && typeof inc[k] === "object") out[k] = inc[k]; });
  const cp = (cur && cur.propositions) || {}, ip = (inc && inc.propositions) || {};
  const props = JSON.parse(JSON.stringify(cp));
  const mine = (p) => p && typeof p === "object" && p.by === username && p.status === "attente";
  // ses propositions en attente : ajout, modification, retrait
  Object.keys(ip).forEach((id) => { if (mine(ip[id]) && (!cp[id] || mine(cp[id]))) props[id] = ip[id]; });
  Object.keys(cp).forEach((id) => { if (mine(cp[id]) && !ip[id]) delete props[id]; });
  out.propositions = props;
  return out;
}
function checkData(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new HttpError(400, "Données invalides.");
  const s = JSON.stringify(data);
  if (s.length > MAX_DATA) throw new HttpError(413, "Données trop volumineuses.");
  return s;
}
const cleanName = (s, max) => String(s || "").replace(/\s+/g, " ").trim().slice(0, max);

// ---------- Sessions ----------
async function newSession(userId) {
  const token = crypto.randomBytes(32).toString("base64url");
  await q(
    `INSERT INTO menus_sessions (token_hash, user_id, expires_at)
     VALUES ($1, $2, now() + interval '${SESSION_DAYS} days')`,
    [sha256(token), userId]
  );
  return token;
}
async function auth(req) {
  const h = String(req.headers.authorization || "");
  const m = h.match(/^Bearer\s+([A-Za-z0-9_-]{20,})$/);
  if (!m) throw new HttpError(401, "Connexion requise.");
  const r = await q(
    `SELECT u.id, u.username, u.name FROM menus_sessions s JOIN menus_users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [sha256(m[1])]
  );
  if (!r.rows.length) throw new HttpError(401, "Session expirée. Reconnectez-vous.");
  return { id: Number(r.rows[0].id), username: r.rows[0].username, name: r.rows[0].name, tokenHash: sha256(m[1]) };
}

// ---------- État complet d'un compte ----------
// groupe actif du compte (ou, à défaut, le premier rejoint)
async function groupOf(userId) {
  const r = await q(
    `SELECT g.id, g.name, g.icon, g.invite_code, g.data, g.version, m.role FROM menus_members m
     JOIN menus_groups g ON g.id = m.group_id JOIN menus_users u ON u.id = m.user_id
     WHERE m.user_id = $1 ORDER BY (g.id = u.active_group) DESC, m.joined_at LIMIT 1`,
    [userId]
  );
  return r.rows[0] || null;
}
async function groupsList(userId) {
  const r = await q(
    `SELECT g.id, g.name, g.icon, m.role, g.updated_at,
       (SELECT count(*)::int FROM menus_members x WHERE x.group_id = g.id) AS n,
       (SELECT string_agg(u.name, ', ' ORDER BY x.joined_at) FROM menus_members x JOIN menus_users u ON u.id = x.user_id WHERE x.group_id = g.id) AS names
     FROM menus_members m JOIN menus_groups g ON g.id = m.group_id WHERE m.user_id = $1 ORDER BY m.joined_at`,
    [userId]
  );
  return r.rows.map((x) => ({ id: Number(x.id), name: x.name, icon: x.icon || "", role: x.role, n: x.n, names: x.names || "", updated: x.updated_at }));
}
async function memberGroup(userId, gid) {
  const r = await q(`SELECT g.id, g.name, m.role FROM menus_members m JOIN menus_groups g ON g.id = m.group_id WHERE m.user_id = $1 AND g.id = $2`, [userId, parseInt(gid, 10) || 0]);
  if (!r.rows.length) throw new HttpError(404, "Vous ne faites pas partie de ce groupe.");
  return r.rows[0];
}
async function stateOf(user) {
  const [pr, g, groups] = await Promise.all([
    q(`SELECT data, version FROM menus_user_data WHERE user_id = $1`, [user.id]),
    groupOf(user.id),
    groupsList(user.id),
  ]);
  let group = null, shared = null;
  if (g) {
    const mem = await q(
      `SELECT u.name, u.username, m.role FROM menus_members m JOIN menus_users u ON u.id = m.user_id
       WHERE m.group_id = $1 ORDER BY m.joined_at`,
      [g.id]
    );
    group = { id: Number(g.id), name: g.name, icon: g.icon || "", code: g.invite_code, members: mem.rows.map((x) => ({ name: x.name, username: x.username, role: x.role })) };
    shared = { data: g.data || {}, version: Number(g.version) };
  }
  const p = pr.rows[0];
  return {
    user: { username: user.username, name: user.name, role: g ? g.role : "adulte" },
    group,
    groups,
    perso: p ? { data: p.data || {}, version: Number(p.version) } : { data: {}, version: 0 },
    shared,
  };
}

// ---------- Routes ----------
const routes = {
  "GET /health": async () => ({ ok: true }),

  "POST /auth/register": async (req, body) => {
    limit(req, "register", 10, 3600e3);
    const username = String(body.username || "").trim();
    const name = cleanName(body.name, 40);
    const password = String(body.password || "");
    if (!/^[A-Za-z0-9._-]{3,30}$/.test(username))
      throw new HttpError(400, "L'identifiant doit faire 3 à 30 caractères : lettres, chiffres, point, tiret.");
    if (!name) throw new HttpError(400, "Indiquez votre prénom.");
    if (password.length < 8 || password.length > 200)
      throw new HttpError(400, "Le mot de passe doit faire au moins 8 caractères.");
    const token = crypto.randomBytes(32).toString("base64url");
    try {
      await q(
        `WITH u AS (
           INSERT INTO menus_users (username, username_key, name, pass_hash)
           VALUES ($1, $2, $3, $4) RETURNING id)
         INSERT INTO menus_sessions (token_hash, user_id, expires_at)
         SELECT $5, id, now() + interval '${SESSION_DAYS} days' FROM u`,
        [username, username.toLowerCase(), name, hashPassword(password), sha256(token)]
      );
    } catch (e) {
      if (e.code === "23505") throw new HttpError(409, "Cet identifiant est déjà pris.");
      throw e;
    }
    const user = await auth({ headers: { authorization: "Bearer " + token } });
    return { token, state: await stateOf(user) };
  },

  "POST /auth/login": async (req, body) => {
    limit(req, "login", 20, 900e3);
    const username = String(body.username || "").trim().toLowerCase();
    const password = String(body.password || "");
    const r = await q(`SELECT id, pass_hash FROM menus_users WHERE username_key = $1`, [username]);
    const row = r.rows[0];
    const ok = checkPassword(password, row ? row.pass_hash : DUMMY_HASH) && !!row;
    if (!ok) throw new HttpError(401, "Identifiant ou mot de passe incorrect.");
    const token = await newSession(Number(row.id));
    const user = await auth({ headers: { authorization: "Bearer " + token } });
    return { token, state: await stateOf(user) };
  },

  "POST /auth/logout": async (req) => {
    const user = await auth(req);
    await q(`DELETE FROM menus_sessions WHERE token_hash = $1`, [user.tokenHash]);
    return { ok: true };
  },

  "GET /state": async (req) => stateOf(await auth(req)),

  "PUT /perso": async (req, body) => {
    const user = await auth(req);
    const s = checkData(body.data);
    const r = await q(
      `INSERT INTO menus_user_data (user_id, data, version, updated_at) VALUES ($1, $2::jsonb, 1, now())
       ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data, version = menus_user_data.version + 1, updated_at = now()
       RETURNING version`,
      [user.id, s]
    );
    return { version: Number(r.rows[0].version) };
  },

  "PUT /shared": async (req, body) => {
    const user = await auth(req);
    let s = checkData(body.data);
    const g = await groupOf(user.id);
    if (!g) throw new HttpError(409, "Vous ne faites partie d'aucun groupe.", { nogroup: true });
    // Un enfant ne modifie que ses favoris, la liste de courses et ses propres propositions en attente
    if (body.gid != null && Number(body.gid) !== Number(g.id)) throw new HttpError(409, "Vous avez changé de groupe entre-temps.", { conflict: true, shared: { data: g.data || {}, version: Number(g.version) } });
    if (g.role === "enfant") s = checkData(childMerge(g.data || {}, body.data, user.username));
    const r = await q(
      `UPDATE menus_groups SET data = $1::jsonb, version = version + 1, updated_at = now()
       WHERE id = $2 AND version = $3 RETURNING version`,
      [s, g.id, parseInt(body.version, 10) || 0]
    );
    if (!r.rows.length) {
      const cur = await groupOf(user.id);
      throw new HttpError(409, "Les données du groupe ont changé.", { conflict: true, shared: { data: cur.data || {}, version: Number(cur.version) } });
    }
    return { version: Number(r.rows[0].version) };
  },

  "POST /groups": async (req, body) => {
    const user = await auth(req);
    const name = cleanName(body.name, 40) || "Mon groupe";
    const s = checkData(body.data || {});
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const ins = await q(
          `WITH g AS (
             INSERT INTO menus_groups (name, invite_code, data, version, icon) VALUES ($1, $2, $3::jsonb, 1, $5) RETURNING id)
           INSERT INTO menus_members (user_id, group_id) SELECT $4, id FROM g RETURNING group_id`,
          [name, inviteCode(), s, user.id, cleanName(body.icon, 8)]
        );
        await q(`UPDATE menus_users SET active_group = $1 WHERE id = $2`, [ins.rows[0].group_id, user.id]);
        return stateOf(user);
      } catch (e) {
        const which = String(e.constraint || "") + " " + String(e.message || "");
        if (e.code === "23505" && /invite_code/.test(which)) continue;
        if (e.code === "23505") break;
        throw e;
      }
    }
    throw new HttpError(500, "Impossible de créer le groupe, réessayez.");
  },

  "POST /groups/join": async (req, body) => {
    limit(req, "join", 20, 900e3);
    const user = await auth(req);
    const code = String(body.code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    const r = await q(`SELECT id FROM menus_groups WHERE invite_code = $1`, [code]);
    if (!r.rows.length) throw new HttpError(404, "Ce code ne correspond à aucun groupe.");
    try {
      await q(`INSERT INTO menus_members (user_id, group_id, role) VALUES ($1, $2, $3)`, [user.id, r.rows[0].id, body.role === "enfant" ? "enfant" : "adulte"]);
    } catch (e) {
      if (e.code === "23505") throw new HttpError(409, "Vous faites déjà partie de ce groupe.");
      throw e;
    }
    await q(`UPDATE menus_users SET active_group = $1 WHERE id = $2`, [r.rows[0].id, user.id]);
    return stateOf(user);
  },

  "POST /groups/role": async (req, body) => {
    const user = await auth(req);
    const g = await groupOf(user.id);
    if (!g) throw new HttpError(409, "Vous ne faites partie d'aucun groupe.");
    if (g.role !== "adulte") throw new HttpError(403, "Seul un adulte peut changer les profils.");
    const role = body.role === "enfant" ? "enfant" : "adulte";
    const t = await q(`SELECT m.user_id, m.role FROM menus_members m JOIN menus_users u ON u.id = m.user_id WHERE m.group_id = $1 AND u.username_key = $2`, [g.id, String(body.username || "").toLowerCase()]);
    if (!t.rows.length) throw new HttpError(404, "Ce membre n'est pas dans votre groupe.");
    if (role === "enfant" && t.rows[0].role === "adulte") {
      const n = await q(`SELECT count(*)::int AS n FROM menus_members WHERE group_id = $1 AND role = 'adulte'`, [g.id]);
      if (n.rows[0].n <= 1) throw new HttpError(409, "Il faut garder au moins un adulte dans le groupe.");
    }
    await q(`UPDATE menus_members SET role = $1 WHERE user_id = $2 AND group_id = $3`, [role, t.rows[0].user_id, g.id]);
    return stateOf(user);
  },

  "POST /groups/switch": async (req, body) => {
    const user = await auth(req);
    const g = await memberGroup(user.id, body.id);
    await q(`UPDATE menus_users SET active_group = $1 WHERE id = $2`, [g.id, user.id]);
    return stateOf(user);
  },

  "POST /groups/leave": async (req, body) => {
    const user = await auth(req);
    const g = body.id != null ? await memberGroup(user.id, body.id) : await groupOf(user.id);
    if (!g) return stateOf(user);
    await q(
      `WITH d AS (DELETE FROM menus_members WHERE user_id = $1 AND group_id = $2 RETURNING group_id)
       DELETE FROM menus_groups g WHERE g.id IN (SELECT group_id FROM d)
         AND NOT EXISTS (SELECT 1 FROM menus_members m WHERE m.group_id = g.id AND m.user_id <> $1)`,
      [user.id, g.id]
    );
    await q(`UPDATE menus_users SET active_group = NULL WHERE id = $1 AND active_group = $2`, [user.id, g.id]);
    return stateOf(user);
  },

  "POST /groups/rename": async (req, body) => {
    const user = await auth(req);
    const name = cleanName(body.name, 40);
    if (!name) throw new HttpError(400, "Indiquez un nom de groupe.");
    const g = body.id != null ? await memberGroup(user.id, body.id) : await groupOf(user.id);
    if (!g) throw new HttpError(409, "Vous ne faites partie d'aucun groupe.");
    if (g.role !== "adulte") throw new HttpError(403, "Seul un adulte peut renommer le groupe.");
    await q(`UPDATE menus_groups SET name = $1, icon = COALESCE(NULLIF($3, ''), icon) WHERE id = $2`, [name, g.id, cleanName(body.icon, 8)]);
    return stateOf(user);
  },

  "POST /account/password": async (req, body) => {
    limit(req, "password", 10, 900e3);
    const user = await auth(req);
    const next = String(body.next || "");
    if (next.length < 8 || next.length > 200) throw new HttpError(400, "Le nouveau mot de passe doit faire au moins 8 caractères.");
    const r = await q(`SELECT pass_hash FROM menus_users WHERE id = $1`, [user.id]);
    if (!checkPassword(String(body.current || ""), r.rows[0].pass_hash)) throw new HttpError(401, "Mot de passe actuel incorrect.");
    await q(`UPDATE menus_users SET pass_hash = $1 WHERE id = $2`, [hashPassword(next), user.id]);
    await q(`DELETE FROM menus_sessions WHERE user_id = $1 AND token_hash <> $2`, [user.id, user.tokenHash]);
    return { ok: true };
  },

  "POST /account/delete": async (req, body) => {
    limit(req, "password", 10, 900e3);
    const user = await auth(req);
    const r = await q(`SELECT pass_hash FROM menus_users WHERE id = $1`, [user.id]);
    if (!checkPassword(String(body.password || ""), r.rows[0].pass_hash)) throw new HttpError(401, "Mot de passe incorrect.");
    await q(
      `WITH g AS (
         DELETE FROM menus_groups g WHERE g.id IN (SELECT group_id FROM menus_members WHERE user_id = $1)
           AND NOT EXISTS (SELECT 1 FROM menus_members m WHERE m.group_id = g.id AND m.user_id <> $1) RETURNING id)
       DELETE FROM menus_users WHERE id = $1`,
      [user.id]
    );
    return { ok: true };
  },
};

// ---------- Serveur HTTP ----------
function cors(req, res) {
  const origin = req.headers.origin;
  if (origin && ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
    res.setHeader("Access-Control-Max-Age", "600");
  }
}
function send(res, status, obj) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(obj));
}

const server = http.createServer(async (req, res) => {
  cors(req, res);
  if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }
  const path = (req.url || "/").split("?")[0].replace(/\/+$/, "") || "/";
  const handler = routes[req.method + " " + path];
  if (!handler) return send(res, 404, { error: "Adresse inconnue." });
  try {
    const body = req.method === "GET" ? {} : await readBody(req);
    send(res, 200, await handler(req, body));
  } catch (e) {
    if (e instanceof HttpError) return send(res, e.status, Object.assign({ error: e.message }, e.extra || {}));
    console.error(e);
    send(res, 500, { error: "Erreur du serveur. Réessayez dans un instant." });
  }
});

migrate()
  .then(() => server.listen(PORT, () => console.log("menus-api prêt sur le port " + PORT)))
  .catch((e) => { console.error("Impossible de préparer la base :", e.message); process.exit(1); });

module.exports = { server };
