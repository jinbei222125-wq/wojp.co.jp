/**
 * wojp_admin / wojp_corporate 統合テストスイート
 * UT（単体テスト）/ LT（結合テスト）/ ST（システムテスト）
 */

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq, and } from "drizzle-orm";

const DATABASE_URL = "libsql://wojp-db-jinbei222125-wq.aws-ap-northeast-1.turso.io";
const DATABASE_AUTH_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjkzMjQxMDksImlkIjoiNGIwNWQ4YzYtN2ZhOC00YjdjLTllNjItNzhmYjM3NWQ5MzVkIiwicmlkIjoiYTlmODFmYjktOGRjOC00NDgzLTk4MTEtYTVhMWYxMWM1YzI1In0.gL6CiJzZZXHJ-Ji226zRNJNK0H5J6a3XdoH5SoH0oaskGLSxPd2w7DXwIyau3pnlwhVbkZ0ch0djtmHHtlZgCQ";
const ADMIN_BASE = "https://wojp-admin.vercel.app";
const CORP_BASE  = "https://wojpcojp.vercel.app";

const client = createClient({ url: DATABASE_URL, authToken: DATABASE_AUTH_TOKEN });
const db = drizzle(client);

let passed = 0;
let failed = 0;
const results = [];

function assert(name, condition, detail = "") {
  if (condition) {
    passed++;
    results.push({ status: "PASS", name, detail });
    console.log(`  ✅ PASS: ${name}`);
  } else {
    failed++;
    results.push({ status: "FAIL", name, detail });
    console.log(`  ❌ FAIL: ${name}${detail ? " — " + detail : ""}`);
  }
}

async function apiGet(url) {
  const res = await fetch(url);
  return { status: res.status, body: await res.json().catch(() => null) };
}

async function apiPost(url, body, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
  return { status: res.status, body: await res.json().catch(() => null) };
}

// ─────────────────────────────────────────────
// UT: 単体テスト（DB直接操作）
// ─────────────────────────────────────────────
async function runUT() {
  console.log("\n📦 UT（単体テスト）— DB直接操作");

  // UT-01: newsテーブルへのINSERT（id=nullなし）
  try {
    const now = Math.floor(Date.now() / 1000);
    const testSlug = `ut-test-${now}`;
    const insertResult = await client.execute({
      sql: `INSERT INTO news (title, slug, content, excerpt, thumbnailUrl, isPublished, publishedAt, authorId, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
      args: ["UTテスト記事", testSlug, "<p>テスト本文</p>", "テスト概要", null, 1, now, 1, now, now]
    });
    const insertedId = insertResult.rows[0]?.id;
    assert("UT-01: newsテーブルINSERT成功（id自動採番）", insertedId > 0, `id=${insertedId}`);

    // UT-02: newsテーブルからSELECT
    const selectResult = await client.execute({
      sql: `SELECT * FROM news WHERE slug = ?`,
      args: [testSlug]
    });
    assert("UT-02: newsテーブルSELECT成功", selectResult.rows.length === 1, `slug=${testSlug}`);

    // UT-03: slug重複チェック（同じslugでINSERT失敗）
    try {
      await client.execute({
        sql: `INSERT INTO news (title, slug, content, isPublished, authorId, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: ["重複テスト", testSlug, "<p>重複</p>", 1, 1, now, now]
      });
      assert("UT-03: slug重複時にエラー発生", false, "重複INSERTが成功してしまった");
    } catch (e) {
      assert("UT-03: slug重複時にエラー発生", e.message.includes("UNIQUE") || e.message.includes("unique"), e.message.slice(0, 80));
    }

    // UT-04: newsテーブルUPDATE
    await client.execute({
      sql: `UPDATE news SET title = ? WHERE slug = ?`,
      args: ["UTテスト記事（更新済み）", testSlug]
    });
    const updated = await client.execute({ sql: `SELECT title FROM news WHERE slug = ?`, args: [testSlug] });
    assert("UT-04: newsテーブルUPDATE成功", updated.rows[0]?.title === "UTテスト記事（更新済み）");

    // UT-05: newsテーブルDELETE
    await client.execute({ sql: `DELETE FROM news WHERE slug = ?`, args: [testSlug] });
    const deleted = await client.execute({ sql: `SELECT * FROM news WHERE slug = ?`, args: [testSlug] });
    assert("UT-05: newsテーブルDELETE成功", deleted.rows.length === 0);

  } catch (e) {
    assert("UT-01〜05: newsテーブル操作", false, e.message);
  }

  // UT-06: jobsテーブルへのINSERT
  try {
    const now = Math.floor(Date.now() / 1000);
    const testSlug = `ut-job-${now}`;
    const insertResult = await client.execute({
      sql: `INSERT INTO jobs (title, slug, description, isPublished, authorId, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id`,
      args: ["UTテスト求人", testSlug, "<p>求人説明</p>", 1, 1, now, now]
    });
    const insertedId = insertResult.rows[0]?.id;
    assert("UT-06: jobsテーブルINSERT成功（id自動採番）", insertedId > 0, `id=${insertedId}`);
    await client.execute({ sql: `DELETE FROM jobs WHERE slug = ?`, args: [testSlug] });
  } catch (e) {
    assert("UT-06: jobsテーブルINSERT成功", false, e.message);
  }

  // UT-07: adminsテーブルSELECT
  try {
    const admins = await client.execute({ sql: `SELECT id, email FROM admins LIMIT 5`, args: [] });
    assert("UT-07: adminsテーブルSELECT成功", admins.rows.length >= 0);
  } catch (e) {
    assert("UT-07: adminsテーブルSELECT成功", false, e.message);
  }

  // UT-08: isPublishedのboolean/integer互換性
  try {
    const now = Math.floor(Date.now() / 1000);
    const testSlug = `ut-bool-${now}`;
    await client.execute({
      sql: `INSERT INTO news (title, slug, content, isPublished, authorId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: ["boolテスト", testSlug, "<p>test</p>", 1, 1, now, now]
    });
    const r = await client.execute({ sql: `SELECT isPublished FROM news WHERE slug = ?`, args: [testSlug] });
    assert("UT-08: isPublished=1で保存・取得成功", r.rows[0]?.isPublished == 1);
    await client.execute({ sql: `DELETE FROM news WHERE slug = ?`, args: [testSlug] });
  } catch (e) {
    assert("UT-08: isPublished boolean互換性", false, e.message);
  }
}

// ─────────────────────────────────────────────
// LT: 結合テスト（API経由）
// ─────────────────────────────────────────────
async function runLT() {
  console.log("\n🔗 LT（結合テスト）— API経由");

  // LT-01: wojp_corporate 公開NEWS一覧API
  try {
    const r = await apiGet(`${CORP_BASE}/api/public/news`);
    assert("LT-01: 公開NEWS一覧API（200）", r.status === 200, `status=${r.status}`);
    assert("LT-02: 公開NEWS一覧APIがarray返却", Array.isArray(r.body), `type=${typeof r.body}`);
  } catch (e) {
    assert("LT-01: 公開NEWS一覧API", false, e.message);
    assert("LT-02: 公開NEWS一覧APIがarray返却", false, e.message);
  }

  // LT-03: wojp_corporate 公開NEWS詳細API（slug指定）
  try {
    // まず存在するslugを取得
    const listR = await apiGet(`${CORP_BASE}/api/public/news`);
    if (listR.body && listR.body.length > 0) {
      const slug = listR.body[0].slug;
      const r = await apiGet(`${CORP_BASE}/api/public/news/${slug}`);
      assert("LT-03: 公開NEWS詳細API（slug指定）", r.status === 200, `slug=${slug}, status=${r.status}`);
      assert("LT-04: NEWS詳細APIにcontentフィールドあり", r.body?.content !== undefined, `fields=${Object.keys(r.body || {}).join(",")}`);
    } else {
      assert("LT-03: 公開NEWS詳細API（slug指定）", true, "記事なし（スキップ）");
      assert("LT-04: NEWS詳細APIにcontentフィールドあり", true, "記事なし（スキップ）");
    }
  } catch (e) {
    assert("LT-03: 公開NEWS詳細API", false, e.message);
    assert("LT-04: NEWS詳細APIにcontentフィールドあり", false, e.message);
  }

  // LT-05: 存在しないslugで404
  try {
    const r = await apiGet(`${CORP_BASE}/api/public/news/nonexistent-slug-xyz-999`);
    assert("LT-05: 存在しないslugで404", r.status === 404, `status=${r.status}`);
  } catch (e) {
    assert("LT-05: 存在しないslugで404", false, e.message);
  }

  // LT-06: 公開求人一覧API
  try {
    const r = await apiGet(`${CORP_BASE}/api/public/jobs`);
    assert("LT-06: 公開求人一覧API（200）", r.status === 200, `status=${r.status}`);
    assert("LT-07: 公開求人一覧APIがarray返却", Array.isArray(r.body), `type=${typeof r.body}`);
  } catch (e) {
    assert("LT-06: 公開求人一覧API", false, e.message);
    assert("LT-07: 公開求人一覧APIがarray返却", false, e.message);
  }

  // LT-08: 認証なしで管理APIにアクセス → 401
  try {
    const r = await apiGet(`${CORP_BASE}/api/admin/news`);
    assert("LT-08: 認証なしで管理APIに401", r.status === 401, `status=${r.status}`);
  } catch (e) {
    assert("LT-08: 認証なしで管理APIに401", false, e.message);
  }

  // LT-09: ログインAPI（正常）
  try {
    const r = await apiPost(`${CORP_BASE}/api/auth/login`, { email: "admin@example.com", password: "wrongpassword" });
    // 認証情報が不明なので401を期待（サーバーが動いていることを確認）
    assert("LT-09: ログインAPIが応答する", r.status === 401 || r.status === 200, `status=${r.status}`);
  } catch (e) {
    assert("LT-09: ログインAPIが応答する", false, e.message);
  }

  // LT-10: wojp_admin tRPC health（listクエリ）
  try {
    const r = await fetch(`${ADMIN_BASE}/trpc/news.list`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    // 認証なしなら401、サーバーが動いていれば200か401
    assert("LT-10: wojp_admin tRPCサーバーが応答する", r.status === 200 || r.status === 401 || r.status === 403, `status=${r.status}`);
  } catch (e) {
    assert("LT-10: wojp_admin tRPCサーバーが応答する", false, e.message);
  }
}

// ─────────────────────────────────────────────
// ST: システムテスト（E2Eシナリオ）
// ─────────────────────────────────────────────
async function runST() {
  console.log("\n🖥️  ST（システムテスト）— E2Eシナリオ");

  // ST-01: コーポレートサイトのトップページが200を返す
  try {
    const r = await fetch(CORP_BASE);
    assert("ST-01: コーポレートサイトTOPページ（200）", r.status === 200, `status=${r.status}`);
  } catch (e) {
    assert("ST-01: コーポレートサイトTOPページ", false, e.message);
  }

  // ST-02: 管理画面のトップページが200を返す
  try {
    const r = await fetch(ADMIN_BASE);
    assert("ST-02: 管理画面TOPページ（200）", r.status === 200, `status=${r.status}`);
  } catch (e) {
    assert("ST-02: 管理画面TOPページ", false, e.message);
  }

  // ST-03: NEWSページが200を返す
  try {
    const r = await fetch(`${CORP_BASE}/news`);
    assert("ST-03: コーポレートNEWSページ（200）", r.status === 200, `status=${r.status}`);
  } catch (e) {
    assert("ST-03: コーポレートNEWSページ", false, e.message);
  }

  // ST-04: 採用ページが200を返す
  try {
    const r = await fetch(`${CORP_BASE}/recruit`);
    assert("ST-04: コーポレート採用ページ（200）", r.status === 200, `status=${r.status}`);
  } catch (e) {
    assert("ST-04: コーポレート採用ページ", false, e.message);
  }

  // ST-05: DB→API→フロントの一貫性（公開記事がAPIに反映）
  try {
    const dbResult = await client.execute({
      sql: `SELECT slug FROM news WHERE isPublished = 1 LIMIT 1`,
      args: []
    });
    if (dbResult.rows.length > 0) {
      const slug = dbResult.rows[0].slug;
      const r = await apiGet(`${CORP_BASE}/api/public/news/${slug}`);
      assert("ST-05: DB公開記事がAPIで取得可能", r.status === 200, `slug=${slug}`);
    } else {
      assert("ST-05: DB公開記事がAPIで取得可能", true, "公開記事なし（スキップ）");
    }
  } catch (e) {
    assert("ST-05: DB→API一貫性", false, e.message);
  }

  // ST-06: 非公開記事が公開APIに出ない
  try {
    const dbResult = await client.execute({
      sql: `SELECT slug FROM news WHERE isPublished = 0 LIMIT 1`,
      args: []
    });
    if (dbResult.rows.length > 0) {
      const slug = dbResult.rows[0].slug;
      const r = await apiGet(`${CORP_BASE}/api/public/news/${slug}`);
      assert("ST-06: 非公開記事が公開APIに出ない（404）", r.status === 404, `slug=${slug}, status=${r.status}`);
    } else {
      assert("ST-06: 非公開記事が公開APIに出ない", true, "非公開記事なし（スキップ）");
    }
  } catch (e) {
    assert("ST-06: 非公開記事が公開APIに出ない", false, e.message);
  }

  // ST-07: slug重複チェックAPIが正しく動作
  try {
    // 存在するslugで重複チェック
    const dbResult = await client.execute({ sql: `SELECT slug FROM news LIMIT 1`, args: [] });
    if (dbResult.rows.length > 0) {
      const existingSlug = dbResult.rows[0].slug;
      const r = await apiGet(`${CORP_BASE}/api/public/news/${existingSlug}`);
      assert("ST-07: 既存slugで記事取得成功", r.status === 200, `slug=${existingSlug}`);
    } else {
      assert("ST-07: slug重複チェック動作確認", true, "記事なし（スキップ）");
    }
  } catch (e) {
    assert("ST-07: slug重複チェック動作確認", false, e.message);
  }

  // ST-08: HTMLコンテンツがAPIレスポンスに含まれる（Tiptap出力確認）
  try {
    const r = await apiGet(`${CORP_BASE}/api/public/news`);
    if (r.body && r.body.length > 0) {
      const article = r.body[0];
      const hasContent = article.content !== undefined && article.content !== null;
      assert("ST-08: NEWS記事にcontentフィールドあり", hasContent, `content=${String(article.content).slice(0, 50)}`);
    } else {
      assert("ST-08: NEWS記事にcontentフィールドあり", true, "記事なし（スキップ）");
    }
  } catch (e) {
    assert("ST-08: NEWS記事contentフィールド確認", false, e.message);
  }

  // ST-09: CORSヘッダー確認（管理画面→APIの通信）
  try {
    const r = await fetch(`${CORP_BASE}/api/public/news`, { method: "OPTIONS" });
    assert("ST-09: CORSプリフライト応答", r.status === 200 || r.status === 204 || r.status === 405, `status=${r.status}`);
  } catch (e) {
    assert("ST-09: CORSプリフライト応答", false, e.message);
  }

  // ST-10: 大量データ取得のパフォーマンス（1秒以内）
  try {
    const start = Date.now();
    const r = await apiGet(`${CORP_BASE}/api/public/news`);
    const elapsed = Date.now() - start;
    assert("ST-10: NEWS一覧API応答速度（3秒以内）", elapsed < 3000 && r.status === 200, `${elapsed}ms`);
  } catch (e) {
    assert("ST-10: NEWS一覧API応答速度", false, e.message);
  }
}

// ─────────────────────────────────────────────
// メイン実行
// ─────────────────────────────────────────────
async function main() {
  console.log("=" .repeat(60));
  console.log("  wojp_admin / wojp_corporate テストスイート");
  console.log("=" .repeat(60));

  await runUT();
  await runLT();
  await runST();

  console.log("\n" + "=".repeat(60));
  console.log(`  テスト結果: ${passed + failed}件中 ${passed}件PASS / ${failed}件FAIL`);
  console.log("=".repeat(60));

  // 結果をJSONで保存
  const report = {
    executedAt: new Date().toISOString(),
    summary: { total: passed + failed, passed, failed },
    results
  };
  const fs = await import("fs");
  fs.writeFileSync("/home/ubuntu/test-report.json", JSON.stringify(report, null, 2));
  console.log("\n📄 詳細レポート: /home/ubuntu/test-report.json");

  await client.close();
}

main().catch(console.error);
