# W.O.JP コーポレートサイト 新アーキテクチャ設計書

## 1. 新構成の全体図

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           インターネット                                  │
└─────────────────────────────────────────────────────────────────────────┘
                │                    │                    │
                ▼                    ▼                    ▼
┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
│    corp-frontend      │ │   admin-frontend      │ │    admin-backend      │
│  https://example.com  │ │https://admin.example  │ │ https://api.example   │
│                       │ │        .com           │ │        .com           │
│  - 静的/SSRサイト     │ │  - 管理画面UI         │ │  - Python FastAPI     │
│  - NEWS/Recruit表示   │ │  - CRUD操作           │ │  - REST API           │
│  - APIからデータ取得  │ │  - 認証必須           │ │  - 認証・認可         │
└───────────────────────┘ └───────────────────────┘ └───────────────────────┘
                │                    │                    │
                │                    │                    │
                └────────────────────┼────────────────────┘
                                     │
                                     ▼
                        ┌───────────────────────┐
                        │      admin-db         │
                        │   MySQL/PostgreSQL    │
                        │                       │
                        │  - users              │
                        │  - password_reset     │
                        │  - news               │
                        │  - jobs               │
                        │  - audit_logs         │
                        └───────────────────────┘

【データフロー】
Corp → API（公開データのみ） → DB
Admin → API（認証後、全データ） → DB
```

## 2. API一覧

### 2-1. Public API（Corpサイト用：認証なし）

| Method | Endpoint | 説明 | パラメータ |
|--------|----------|------|-----------|
| GET | `/api/public/news` | NEWS一覧取得 | `limit`, `page`, `category` |
| GET | `/api/public/news/{id_or_slug}` | NEWS詳細取得 | - |
| GET | `/api/public/jobs` | 募集職種一覧取得 | `limit`, `page`, `department` |
| GET | `/api/public/jobs/{id_or_slug}` | 募集職種詳細取得 | - |

**レスポンス例（NEWS一覧）:**
```json
{
  "data": [
    {
      "id": 1,
      "slug": "2024-new-office",
      "title": "新オフィス開設のお知らせ",
      "category": "お知らせ",
      "eyecatch_image_url": "https://...",
      "published_at": "2024-01-15T10:00:00Z",
      "excerpt": "この度、大阪に新オフィスを..."
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "total_pages": 3
  }
}
```

**キャッシュ戦略:**
- `Cache-Control: public, max-age=300` (5分)
- `ETag` によるキャッシュ検証
- CDN (CloudFront/Cloudflare) でエッジキャッシュ

### 2-2. Auth API（認証）

| Method | Endpoint | 説明 |
|--------|----------|------|
| POST | `/api/auth/login` | ログイン（email + password） |
| POST | `/api/auth/logout` | ログアウト |
| POST | `/api/auth/forgot-password` | パスワード再設定リンク送信 |
| POST | `/api/auth/reset-password` | パスワード再設定実行 |
| GET | `/api/auth/me` | 現在のユーザー情報取得 |

**ログインリクエスト:**
```json
{
  "email": "admin@example.com",
  "password": "securepassword123"
}
```

**ログインレスポンス:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "name": "管理者",
    "role": "admin"
  }
}
```
※ JWTはhttpOnly cookieで返却

### 2-3. Admin API（管理画面用：認証必須）

#### News CRUD

| Method | Endpoint | 説明 |
|--------|----------|------|
| GET | `/api/admin/news` | NEWS一覧（下書き含む） |
| POST | `/api/admin/news` | NEWS作成 |
| PUT | `/api/admin/news/{id}` | NEWS更新 |
| PATCH | `/api/admin/news/{id}/publish` | 公開/非公開切替 |
| DELETE | `/api/admin/news/{id}` | NEWS削除 |

#### Jobs CRUD

| Method | Endpoint | 説明 |
|--------|----------|------|
| GET | `/api/admin/jobs` | 募集職種一覧（非公開含む） |
| POST | `/api/admin/jobs` | 募集職種作成 |
| PUT | `/api/admin/jobs/{id}` | 募集職種更新 |
| PATCH | `/api/admin/jobs/{id}/publish` | 公開/非公開切替 |
| DELETE | `/api/admin/jobs/{id}` | 募集職種削除 |

**NEWS作成リクエスト:**
```json
{
  "title": "新サービス開始のお知らせ",
  "slug": "new-service-launch",
  "body": "## 概要\n新サービスを開始しました...",
  "category": "プレスリリース",
  "eyecatch_image_url": "https://...",
  "is_published": false
}
```

## 3. データモデル（テーブル定義）

### users
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(320) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  role ENUM('admin', 'editor') DEFAULT 'editor' NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  last_signed_in TIMESTAMP NULL
);
```

### password_reset_tokens
```sql
CREATE TABLE password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### news
```sql
CREATE TABLE news (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  body TEXT NOT NULL,
  eyecatch_image_url VARCHAR(500),
  category ENUM('お知らせ', '重要なお知らせ', 'プレスリリース', 'メディア掲載') NOT NULL,
  is_published BOOLEAN DEFAULT FALSE NOT NULL,
  published_at TIMESTAMP NULL,
  created_by INT,
  updated_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);
```

### jobs
```sql
CREATE TABLE jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  employment_type VARCHAR(50),
  location VARCHAR(255) NOT NULL,
  salary_range VARCHAR(255),
  is_published BOOLEAN DEFAULT FALSE NOT NULL,
  published_at TIMESTAMP NULL,
  created_by INT,
  updated_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);
```

### audit_logs（監査ログ）
```sql
CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT NOT NULL,
  old_value JSON,
  new_value JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

## 4. 認証フロー

### 4-1. ログインフロー
```
1. ユーザーがemail/passwordを入力
2. POST /api/auth/login
3. サーバーでpassword_hashを検証（bcrypt）
4. 成功時：JWTを生成し、httpOnly cookieで返却
5. フロントエンドは以降のリクエストでcookieを自動送信
```

### 4-2. パスワード再設定フロー
```
1. ユーザーが「パスワードを忘れた」をクリック
2. POST /api/auth/forgot-password { email }
3. サーバーでワンタイムトークン生成（有効期限: 1時間）
4. トークンをハッシュ化してDBに保存
5. メールでリセットリンク送信: https://admin.example.com/reset-password?token=xxx
6. ユーザーがリンクをクリック
7. POST /api/auth/reset-password { token, new_password }
8. トークン検証 → パスワード更新 → トークン無効化
```

### 4-3. セッション方式
**採用: JWT（httpOnly cookie）**

理由:
- サーバーレス/スケールアウトに適している
- Redis等の外部ストアが不要
- httpOnly cookieでXSS対策

設定:
```python
cookie_options = {
    "httponly": True,
    "secure": True,  # HTTPS必須
    "samesite": "lax",
    "max_age": 86400 * 7,  # 7日
    "path": "/",
    "domain": ".example.com"  # サブドメイン間共有
}
```

### 4-4. CSRF/XSS対策
- **CSRF**: SameSite=Lax cookieで防御。状態変更APIはPOST/PUT/DELETE限定
- **XSS**: httpOnly cookieでトークン窃取防止。Content-Security-Policy設定

## 5. デプロイ統一案

### 5-1. 推奨構成（Manus Platform）

```
┌─────────────────────────────────────────────────────────────┐
│                    Manus Platform                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ corp-frontend   │  │ admin-frontend  │  │admin-backend│ │
│  │ (Vite/React)    │  │ (Vite/React)    │  │ (FastAPI)   │ │
│  │                 │  │                 │  │             │ │
│  │ Port: 3000      │  │ Port: 3001      │  │ Port: 8000  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│                              │                    │        │
│                              └────────────────────┘        │
│                                       │                    │
│                              ┌────────▼────────┐           │
│                              │   MySQL (TiDB)  │           │
│                              └─────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### 5-2. 環境変数管理

**corp-frontend (.env)**
```
VITE_API_BASE_URL=https://api.example.com
```

**admin-frontend (.env)**
```
VITE_API_BASE_URL=https://api.example.com
```

**admin-backend (.env)**
```
DATABASE_URL=mysql://user:pass@host:3306/dbname
JWT_SECRET=your-secret-key
CORS_ORIGINS=https://example.com,https://admin.example.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASSWORD=xxx
```

### 5-3. CORS設定
```python
# admin-backend/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://example.com",
        "https://admin.example.com"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["*"],
)
```

### 5-4. ドメイン設計
| サービス | ドメイン | 用途 |
|----------|----------|------|
| Corp | https://example.com | コーポレートサイト |
| Admin | https://admin.example.com | 管理画面 |
| API | https://api.example.com | バックエンドAPI |

## 6. 既存UIを変えずに接続先だけ切替える実装方針

### 6-1. Corp側（API呼び出しに変更）

**変更前（tRPC直接呼び出し）:**
```typescript
const { data: newsList } = trpc.news.list.useQuery();
```

**変更後（fetch API）:**
```typescript
const [newsList, setNewsList] = useState([]);

useEffect(() => {
  fetch(`${import.meta.env.VITE_API_BASE_URL}/api/public/news`)
    .then(res => res.json())
    .then(data => setNewsList(data.data));
}, []);
```

### 6-2. Admin側（API呼び出しに変更）

**変更前（tRPC）:**
```typescript
const createMutation = trpc.news.create.useMutation();
```

**変更後（fetch API + 認証）:**
```typescript
const createNews = async (data: NewsFormData) => {
  const res = await fetch(`${API_BASE_URL}/api/admin/news`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',  // Cookie送信
    body: JSON.stringify(data)
  });
  return res.json();
};
```

### 6-3. 認証状態管理

```typescript
// hooks/useAuth.ts
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setUser(data?.user || null);
        setLoading(false);
      });
  }, []);

  return { user, loading, isAuthenticated: !!user };
}
```

## 7. 主要なリスクと対策

| リスク | 対策 |
|--------|------|
| API認証バイパス | JWT検証を全Admin APIに適用。ミドルウェアで一括処理 |
| SQLインジェクション | ORMのパラメータバインディング使用。生SQLは禁止 |
| XSS攻撃 | httpOnly cookie、CSP設定、入力サニタイズ |
| CSRF攻撃 | SameSite cookie、状態変更はPOST/PUT/DELETE限定 |
| ブルートフォース攻撃 | ログイン試行回数制限（5回/15分）、CAPTCHA検討 |
| パスワード漏洩 | bcrypt/argon2でハッシュ化、平文保存禁止 |
| 機密データ露出 | 公開APIは公開データのみ返却。Admin APIは認証必須 |
| 画像アップロード攻撃 | 拡張子/Content-Type検証、署名付きURL使用 |
| DDoS攻撃 | CDN/WAF活用、Rate Limiting（100req/min） |
| セッションハイジャック | Secure cookie、短い有効期限、IP検証（オプション） |

## 8. ログ・監視の最小構成

### 8-1. アプリケーションログ
```python
import logging
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# 監査ログ
def log_audit(user_id, action, entity_type, entity_id, old_value=None, new_value=None):
    db.execute(
        "INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_value, new_value) VALUES (?, ?, ?, ?, ?, ?)",
        [user_id, action, entity_type, entity_id, json.dumps(old_value), json.dumps(new_value)]
    )
```

### 8-2. 監視項目
- APIレスポンスタイム（P95 < 500ms）
- エラーレート（< 1%）
- ログイン失敗回数
- DB接続プール使用率

---

**作成日:** 2024年1月
**バージョン:** 1.0
