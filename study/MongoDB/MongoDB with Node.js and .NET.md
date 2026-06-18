# MongoDB with Node.js and .NET

## Questions Covered

1. How do you connect to MongoDB using the Node.js native driver?
2. What are Mongoose schema, model, and middleware basics?
3. How do you use async/await with the MongoDB Node.js driver?
4. How do you run transactions with the Node.js MongoDB driver?
5. How do you connect to MongoDB using the C# MongoDB.Driver?
6. How do you write LINQ-style queries with the C# driver?
7. How should APIs handle MongoDB ObjectId values?
8. How do you implement error handling and retries for MongoDB?

## How do you connect to MongoDB using the Node.js native driver?

Low-level **`mongodb`** driver — like **ADO.NET**. One singleton `MongoClient`; pooled connections.

```typescript
import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI!; // mongodb+srv://user:pass@cluster/db?retryWrites=true

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1 },
  maxPoolSize: 50,
  minPoolSize: 5,
  connectTimeoutMS: 10_000,
  socketTimeoutMS: 45_000,
});

let clientPromise: Promise<MongoClient> | undefined;

export function getClient(): Promise<MongoClient> {
  if (!clientPromise) clientPromise = client.connect();
  return clientPromise;
}

export async function getDb() {
  const c = await getClient();
  return c.db('interviewPrep');
}

process.on('SIGTERM', async () => { await client.close(); });
```

## What are Mongoose schema, model, and middleware basics?

ODM layer — like **EF**. Schema, model, `pre`/`post` middleware.

```typescript
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  displayName: string;
  role: 'user' | 'admin';
  createdAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
    },
    displayName: { type: String, required: true, maxlength: 80 },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    passwordHash: { type: String, select: false },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });

userSchema.methods.comparePassword = async function (candidate: string) {
  const bcrypt = await import('bcrypt');
  return bcrypt.compare(candidate, this.passwordHash);
};

userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  const bcrypt = await import('bcrypt');
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});

userSchema.post('save', function (doc) {
  console.log(`User saved: ${doc._id}`);
});

export const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>('User', userSchema);
```

## How do you use async/await with the MongoDB Node.js driver?

Promises + `async/await` — **JavaScript Asynchronous Programming**. `Promise.all` = `Task.WhenAll`.

```typescript
import { ObjectId } from 'mongodb';
import { getDb } from './mongoClient';

interface Order {
  _id?: ObjectId;
  customerId: ObjectId;
  items: { sku: string; qty: number; price: number }[];
  status: 'pending' | 'paid' | 'shipped';
  total: number;
}

export async function createOrder(order: Omit<Order, '_id'>): Promise<ObjectId> {
  const db = await getDb();
  const result = await db.collection<Order>('orders').insertOne(order);
  return result.insertedId;
}

export async function getOrderById(id: string): Promise<Order | null> {
  const db = await getDb();
  return db.collection<Order>('orders').findOne({ _id: new ObjectId(id) });
}

export async function listOrdersByCustomer(customerId: string, page = 1, limit = 20) {
  const db = await getDb();
  const filter = { customerId: new ObjectId(customerId) };
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    db.collection<Order>('orders')
      .find(filter)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    db.collection<Order>('orders').countDocuments(filter),
  ]);

  return { items, total, page, limit };
}
```

Validate `ObjectId` before query — `BSONError` → `400`.

## How do you run transactions with the Node.js MongoDB driver?

Requires replica set. `{ session }` on every op inside `withTransaction`.

```typescript
import { ClientSession, MongoClient } from 'mongodb';

export async function transferCredits(
  client: MongoClient,
  fromUserId: string,
  toUserId: string,
  amount: number
): Promise<void> {
  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      const db = client.db('interviewPrep');
      const wallets = db.collection<{ userId: ObjectId; balance: number }>('wallets');

      const from = await wallets.findOne(
        { userId: new ObjectId(fromUserId) },
        { session }
      );
      if (!from || from.balance < amount) {
        throw new Error('Insufficient funds');
      }

      await wallets.updateOne(
        { userId: new ObjectId(fromUserId) },
        { $inc: { balance: -amount } },
        { session }
      );
      await wallets.updateOne(
        { userId: new ObjectId(toUserId) },
        { $inc: { balance: amount } },
        { session }
      );

      await db.collection('ledger').insertOne(
        { from: fromUserId, to: toUserId, amount, at: new Date() },
        { session }
      );
    });
  } finally {
    await session.endSession();
  }
}
```

```typescript
const session = await mongoose.startSession();
session.startTransaction();
try {
  await Order.create([{ customerId, total }], { session });
  await Product.updateOne({ sku }, { $inc: { stock: -1 } }, { session });
  await session.commitTransaction();
} catch (err) {
  await session.abortTransaction();
  throw err;
} finally {
  session.endSession();
}
```

## How do you connect to MongoDB using the C# MongoDB.Driver?

`IMongoClient` singleton — ADO.NET-style pooling.

```csharp
// Program.cs
using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<IMongoClient>(_ =>
{
    var settings = MongoClientSettings.FromConnectionString(
        builder.Configuration.GetConnectionString("MongoDb"));
    settings.ServerApi = new ServerApi(ServerApiVersion.V1);
    settings.MaxConnectionPoolSize = 100;
    settings.ConnectTimeout = TimeSpan.FromSeconds(10);
    return new MongoClient(settings);
});

builder.Services.AddSingleton(sp =>
{
    var client = sp.GetRequiredService<IMongoClient>();
    return client.GetDatabase("interviewPrep");
});

builder.Services.AddSingleton<ICustomerRepository, CustomerRepository>();

var app = builder.Build();
```

```csharp
using MongoDB.Bson;
using MongoDB.Driver;

public interface ICustomerRepository
{
    Task<Customer?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<Customer> CreateAsync(Customer customer, CancellationToken ct = default);
}

public class CustomerRepository : ICustomerRepository
{
    private readonly IMongoCollection<Customer> _collection;

    public CustomerRepository(IMongoDatabase database) =>
        _collection = database.GetCollection<Customer>("customers");

    public async Task<Customer?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return null;

        return await _collection
            .Find(c => c.Id == objectId)
            .FirstOrDefaultAsync(ct);
    }

    public async Task<Customer> CreateAsync(Customer customer, CancellationToken ct = default)
    {
        await _collection.InsertOneAsync(customer, cancellationToken: ct);
        return customer;
    }
}
```

```csharp
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

public class Customer
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId Id { get; set; }

    [BsonElement("email")]
    public string Email { get; set; } = string.Empty;

    [BsonElement("displayName")]
    public string DisplayName { get; set; } = string.Empty;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
```

## How do you write LINQ-style queries with the C# driver?

`.AsQueryable()` for LINQ; `Builders<T>.Filter` for dynamic filters.

```csharp
using MongoDB.Driver;
using MongoDB.Driver.Linq;

public class OrderService
{
    private readonly IMongoCollection<Order> _orders;

    public OrderService(IMongoDatabase db) =>
        _orders = db.GetCollection<Order>("orders");

    public async Task<List<OrderSummary>> GetRecentPaidOrdersAsync(
        string customerId, int take = 10, CancellationToken ct = default)
    {
        if (!ObjectId.TryParse(customerId, out var cid))
            return new List<OrderSummary>();

        return await _orders.AsQueryable()
            .Where(o => o.CustomerId == cid && o.Status == OrderStatus.Paid)
            .OrderByDescending(o => o.CreatedAt)
            .Take(take)
            .Select(o => new OrderSummary
            {
                Id = o.Id.ToString(),
                Total = o.Total,
                CreatedAt = o.CreatedAt
            })
            .ToListAsync(ct);
    }
}
```

```csharp
public async Task<List<Order>> SearchOrdersAsync(OrderSearchQuery q, CancellationToken ct)
{
    var filter = Builders<Order>.Filter.Empty;

    if (!string.IsNullOrEmpty(q.CustomerId) && ObjectId.TryParse(q.CustomerId, out var cid))
        filter &= Builders<Order>.Filter.Eq(o => o.CustomerId, cid);

    if (q.Status.HasValue)
        filter &= Builders<Order>.Filter.Eq(o => o.Status, q.Status.Value);

    if (q.MinTotal.HasValue)
        filter &= Builders<Order>.Filter.Gte(o => o.Total, q.MinTotal.Value);

    if (q.FromDate.HasValue)
        filter &= Builders<Order>.Filter.Gte(o => o.CreatedAt, q.FromDate.Value);

    return await _orders.Find(filter)
        .SortByDescending(o => o.CreatedAt)
        .Limit(q.Limit ?? 50)
        .ToListAsync(ct);
}
```

## How should APIs handle MongoDB ObjectId values?

Store `ObjectId`; expose hex `string`. Validate + authorize (**API Security**).

```csharp
public record OrderDto(string Id, string CustomerId, decimal Total, string Status);

public static class OrderMapper
{
    public static OrderDto ToDto(this Order o) => new(
        o.Id.ToString(),
        o.CustomerId.ToString(),
        o.Total,
        o.Status.ToString());
}

[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly IOrderRepository _repo;

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(OrderDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OrderDto>> Get(string id, CancellationToken ct)
    {
        if (!ObjectId.TryParse(id, out _))
            return BadRequest(new { error = "Invalid order id format" });

        var order = await _repo.GetByIdAsync(id, ct);
        if (order is null)
            return NotFound();

        var userId = User.FindFirst("sub")?.Value;
        if (order.CustomerId.ToString() != userId)
            return Forbid();

        return order.ToDto();
    }
}
```

```typescript
import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

const objectIdSchema = z.string().refine((id) => ObjectId.isValid(id), {
  message: 'Invalid ObjectId',
});

const router = Router();

router.get('/orders/:id', async (req, res, next) => {
  const parsed = objectIdSchema.safeParse(req.params.id);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const order = await getOrderById(parsed.data);
  if (!order) return res.status(404).json({ error: 'Not found' });

  res.json({
    id: order._id!.toHexString(),
    customerId: order.customerId.toHexString(),
    total: order.total,
    status: order.status,
  });
});

export default router;
```

## How do you implement error handling and retries for MongoDB?

Retry transient errors; map `11000` → `409`. Polly in .NET.

```typescript
import { MongoError, MongoServerError } from 'mongodb';

const TRANSIENT_LABELS = new Set([
  'TransientTransactionError',
  'UnknownTransactionCommitResult',
]);

export function isTransientMongoError(err: unknown): boolean {
  if (!(err instanceof MongoError)) return false;
  if (err.hasErrorLabel?.('RetryableWriteError')) return true;
  if (TRANSIENT_LABELS.has((err as MongoError).errorLabels?.[0] ?? '')) return true;
  return false;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 5,
  baseDelayMs = 100
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt >= maxAttempts || !isTransientMongoError(err)) throw err;
      const delay = baseDelayMs * 2 ** (attempt - 1) + Math.random() * 50;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

// Usage — wrap transactions
export async function safeTransferCredits(client: MongoClient, ...args: Parameters<typeof transferCredits>) {
  return withRetry(() => transferCredits(client, ...args));
}
```

```typescript
export async function createUser(email: string, name: string) {
  try {
    return await User.create({ email, displayName: name });
  } catch (err) {
    if (err instanceof MongoServerError && err.code === 11000) {
      throw new ConflictError('Email already exists');
    }
    throw err;
  }
}
```

```csharp
using MongoDB.Driver;
using Polly;
using Polly.Retry;

public class MongoRetryPolicy
{
    private readonly AsyncRetryPolicy _retry = Policy
        .Handle<MongoException>(IsTransient)
        .WaitAndRetryAsync(5, attempt =>
            TimeSpan.FromMilliseconds(100 * Math.Pow(2, attempt))
            + TimeSpan.FromMilliseconds(Random.Shared.Next(0, 50)));

    private static bool IsTransient(MongoException ex) =>
        ex is MongoConnectionException ||
        ex.HasErrorLabel("TransientTransactionError") ||
        ex.HasErrorLabel("RetryableWriteError");

    public Task<T> ExecuteAsync<T>(Func<CancellationToken, Task<T>> action, CancellationToken ct) =>
        _retry.ExecuteAsync(ct => action(ct), ct);
}
```

```csharp
public class OrderRepository
{
    private readonly IMongoCollection<Order> _orders;
    private readonly MongoRetryPolicy _retry;

    public async Task<Order> CreateAsync(Order order, CancellationToken ct)
    {
        try
        {
            return await _retry.ExecuteAsync(async token =>
            {
                await _orders.InsertOneAsync(order, cancellationToken: token);
                return order;
            }, ct);
        }
        catch (MongoWriteException ex) when (ex.WriteError?.Code == 11000)
        {
            throw new ConflictException("Duplicate order reference", ex);
        }
    }
}
```

```typescript
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof ConflictError) return res.status(409).json({ error: err.message });
  if (err instanceof MongoServerError && err.code === 11000)
    return res.status(409).json({ error: 'Duplicate key' });
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});
```

## Related Topics

- **JavaScript Asynchronous Programming** (`Javascript/`)
- **C# ADO.NET and Entity Framework** (`C#/`)
- **API Security** (`Security/`)
- **Microservices Distributed Transactions** (`Microservices/`)
- **TypeScript Advanced** (`TypeScript/`)
