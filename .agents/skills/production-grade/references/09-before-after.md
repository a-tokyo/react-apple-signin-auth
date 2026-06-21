# 09 — Before / after: LLM default → production-grade output

Six diffs. Each shows the most common LLM failure mode and the production-grade correction. The agent uses these as calibration — if the generated code looks like the "before," rewrite.

## Contents

1 · check-then-act → atomic upsert · 2 · narrating comments + try-catch → clean · 3 · happy-path → edge-aware · 4 · premature abstraction → concrete-first · 5 · unstructured errors → typed domain errors · 6 · missing infra → scaffolded

---

## 1. Check-then-act → atomic upsert

```
// ❌ LLM default
const existing = await db.query('SELECT * FROM users WHERE email = $1', [email]);
if (existing.rows.length > 0) {
  return res.status(400).json({ error: 'User already exists' });
}
const result = await db.query('INSERT INTO users (email) VALUES ($1) RETURNING *', [email]);
res.status(201).json(result.rows[0]);

// ✅ production-grade
const { rows } = await db.query<{ id: string; email: string }>(
  `INSERT INTO users (email) VALUES ($1)
   ON CONFLICT (email) DO NOTHING
   RETURNING id, email`,
  [email],
);
if (rows.length === 0) {
  res.status(409).json({ error: { code: 'USER_EXISTS', message: 'User with this email already exists' } });
  return;
}
res.status(201).setHeader('Location', `/v1/users/${rows[0].id}`).json({ data: rows[0] });
```

**What changed:** Race condition eliminated. `SELECT *` → named columns. Typed query result. Structured error envelope. 409 vs generic 400. 201 + Location header.

---

## 2. Narrating comments + try-catch slop → clean code

```
// ❌ LLM default
// Create a new order for the user
async function createOrder(userId: string, items: any[]) {
  try {
    // Validate the items
    if (!items || items.length === 0) {
      throw new Error('Items are required');
    }
    // Calculate the total
    let total = 0;
    for (const item of items) {
      total += item.price * item.quantity;
    }
    // Save to database
    const order = await db.query(
      'INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING *',
      [userId, total]
    );
    // Return the order
    return order.rows[0];
  } catch (error) {
    console.log('Error creating order:', error);
    throw error;
  }
}

// ✅ production-grade
async function createOrder(userId: string, items: OrderItem[]): Promise<Order> {
  const totalCents = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

  const { rows } = await db.query<Order>(
    `INSERT INTO orders (user_id, total_cents) VALUES ($1, $2)
     RETURNING id, user_id, total_cents, created_at`,
    [userId, totalCents],
  );

  return rows[0];
}
```

**What changed:** Comments removed (code is self-evident). Typed input + return. Money as integer cents. Named columns vs `*`. No try-catch (caller handles). No `console.log`. No `any[]`. Guard clause belongs at the route handler, not here.

---

## 3. Happy-path-only → edge-case-aware

```
// ❌ LLM default
async function getUserPosts(userId: string) {
  const posts = await db.query('SELECT * FROM posts WHERE user_id = $1', [userId]);
  return posts.rows;
}

// ✅ production-grade
async function findUserPosts(
  userId: string,
  cursor?: { createdAt: string; id: string },
  limit: number = 20,
): Promise<{ data: Post[]; cursor: string | null; hasMore: boolean }> {
  const params: unknown[] = [userId];
  let cursorClause = '';

  if (cursor) {
    cursorClause = `AND (created_at, id) < ($2, $3)`;
    params.push(cursor.createdAt, cursor.id);
  }

  params.push(limit + 1);
  const { rows } = await db.query<Post>(
    `SELECT id, title, created_at FROM posts
     WHERE user_id = $1 ${cursorClause}
     ORDER BY created_at DESC, id DESC
     LIMIT $${params.length}`,
    params,
  );

  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;

  return {
    data,
    cursor: hasMore ? encodeCursor(data[data.length - 1]) : null,
    hasMore,
  };
}
```

**What changed:** `get` → `find` (may return empty). Cursor pagination vs unbounded. Tie-breaker on `id`. `limit + 1` for `hasMore`. Named columns. Typed return. Response envelope.

---

## 4. Premature abstraction → concrete-first

```
// ❌ LLM default
interface INotificationService {
  send(userId: string, message: string): Promise<void>;
}

class EmailNotificationService implements INotificationService {
  async send(userId: string, message: string): Promise<void> {
    // TODO: implement email sending
  }
}

class NotificationFactory {
  static create(type: string): INotificationService {
    switch (type) {
      case 'email': return new EmailNotificationService();
      default: throw new Error(`Unknown notification type: ${type}`);
    }
  }
}

// ✅ production-grade
async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  await emailProvider.send({ to, subject, body });
}
```

**What changed:** Interface + class + factory for one implementation → one function. Abstraction earns its cost at the second consumer. No TODO placeholder. Named parameters instead of generic `message`.

---

## 5. Unstructured error handling → typed domain errors

```
// ❌ LLM default
if (!user) {
  throw new Error('User not found');
}
if (user.balance < amount) {
  throw new Error('Insufficient balance');
}

// In the catch block, somewhere else:
catch (error) {
  if (error.message === 'User not found') {
    res.status(404).json({ error: error.message });
  } else if (error.message === 'Insufficient balance') {
    res.status(400).json({ error: error.message });
  } else {
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// ✅ production-grade
type PaymentErrorCode = 'USER_NOT_FOUND' | 'INSUFFICIENT_BALANCE';

class PaymentError extends Error {
  constructor(public readonly code: PaymentErrorCode, message: string, public readonly statusCode: number) {
    super(message);
  }
}

// In the service:
if (!user) throw new PaymentError('USER_NOT_FOUND', `User ${userId} not found`, 404);
if (user.balanceCents < amountCents) throw new PaymentError('INSUFFICIENT_BALANCE', `Balance ${user.balanceCents} < ${amountCents}`, 422);

// In the error handler (once, globally):
if (err instanceof PaymentError) {
  res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
  return;
}
res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An internal error occurred' } });
```

**What changed:** String matching → discriminated union with `code`. Per-endpoint catch → global error handler. `'Something went wrong'` → structured envelope with no internal leakage. Money as cents. Actionable error messages naming the entity and values.

---

## 6. Missing project infrastructure → scaffolded from commit one

```
// ❌ LLM default — jumps straight to feature code
// No env validation, no pre-commit hooks, no lint config, raw env access everywhere
// Secrets file committed, no .gitignore, no strict mode

// ✅ production-grade — infrastructure ships with the first commit
//
// 1. Config module — validates env at boot, fails fast, typed everywhere downstream.
//    Raw env access (process.env, os.environ, os.Getenv) never scattered through code.
//    Use the ecosystem's validation library (M2).
//
// 2. Pre-commit hooks — format → lint → type-check on every commit from day one.
//    Use the ecosystem's standard tooling (M2).
//
// 3. Secrets hygiene — .env.example (or config.example.yaml, etc.) checked in with
//    placeholder values. Real secrets file in .gitignore. Never committed.
//
// 4. Strict mode — the language's strictest type-checking enabled from the start.
//    Relaxing is opt-in with a documented reason, not the default.
//
// 5. .gitignore — secrets, dependencies, build output, OS files excluded.
```

**What changed:** Config validated at startup and typed everywhere downstream — raw env access never scattered through application code. Pre-commit hooks enforce quality on every commit from day one. Example config checked in (never real secrets). Language strict mode enabled. Config fails fast at boot with a clear error, not at runtime on the first request that touches an undefined var. Specific libraries and tooling come from M2 (check the ecosystem) or a peer language skill.

---

*The agent uses these as calibration. If the generated code matches a "before" shape, apply the corresponding "after" transformation.*
