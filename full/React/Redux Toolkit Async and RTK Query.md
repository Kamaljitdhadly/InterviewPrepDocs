# Redux Toolkit Async and RTK Query

## Questions Covered

1. How do you handle async logic with createAsyncThunk?
2. What are extraReducers and how do they handle thunk lifecycle?
3. What is RTK Query and when should you use it over thunks?
4. How do you define an API slice with createApi?
5. How do caching and invalidation work in RTK Query?
6. How do you handle loading and error states with RTK Query hooks?
7. What are Redux middleware and common use cases (logger, listener)?

## How do you handle async logic with createAsyncThunk?

`createAsyncThunk` wraps async work (API calls, timers, etc.) into a thunk action creator. RTK auto-generates three action types per thunk:

- `pending` — dispatched before the promise runs
- `fulfilled` — dispatched with the resolved value as `payload`
- `rejected` — dispatched with error info (use `rejectWithValue` for custom error shapes)

The thunk receives `(arg, thunkAPI)` where `thunkAPI` provides `dispatch`, `getState`, `rejectWithValue`, `signal` (AbortSignal), and more.

**Typical flow:** component dispatches `fetchUser(id)` → slice's `extraReducers` handle pending/fulfilled/rejected → state updates → UI reacts.

```typescript
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface User {
  id: string;
  name: string;
}

export const fetchUser = createAsyncThunk<
  User,
  string,
  { rejectValue: string }
>(
  'users/fetchById',
  async (userId, { rejectWithValue, signal }) => {
    const res = await fetch(`/api/users/${userId}`, { signal });
    if (!res.ok) {
      return rejectWithValue(`HTTP ${res.status}`);
    }
    return (await res.json()) as User;
  }
);

interface UsersState {
  entity: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const usersSlice = createSlice({
  name: 'users',
  initialState: { entity: null, status: 'idle', error: null } as UsersState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.entity = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error.message ?? 'Unknown error';
      });
  },
});

export default usersSlice.reducer;
```

## What are extraReducers and how do they handle thunk lifecycle?

**`reducers`** in `createSlice` define actions owned by that slice — RTK generates matching action creators.

**`extraReducers`** handle *external* actions: thunks from `createAsyncThunk`, actions from other slices, or any action type string. You do not get action creators for these; you react to actions dispatched elsewhere.

Use the **builder callback** pattern (`builder.addCase(...)`) for TypeScript safety and readable thunk lifecycle handling.

**Thunk lifecycle in extraReducers:**

| Action | When | Typical state updates |
|--------|------|----------------------|
| `thunk.pending` | Async started | `status = 'loading'`, clear error |
| `thunk.fulfilled` | Promise resolved | store `payload`, `status = 'succeeded'` |
| `thunk.rejected` | Promise rejected | store error, `status = 'failed'` |

`addMatcher` and `addDefaultCase` handle groups of actions or fallbacks. Prefer `extraReducers` over putting async logic inside `reducers`.

```typescript
import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';

export const saveTodo = createAsyncThunk(
  'todos/save',
  async (todo: { id: string; text: string }) => {
    const res = await fetch(`/api/todos/${todo.id}`, {
      method: 'PUT',
      body: JSON.stringify(todo),
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  }
);

const todosSlice = createSlice({
  name: 'todos',
  initialState: { items: [] as { id: string; text: string }[], saving: false, error: null as string | null },
  reducers: {
    removed: (state, action: { payload: string }) => {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveTodo.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveTodo.fulfilled, (state, action) => {
        state.saving = false;
        const idx = state.items.findIndex((t) => t.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
      })
      .addCase(saveTodo.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message ?? 'Save failed';
      })
      .addMatcher(isAnyOf(saveTodo.pending, saveTodo.fulfilled), (state) => {
        // optional cross-cutting matcher example
      });
  },
});
```

## What is RTK Query and when should you use it over thunks?

**RTK Query** is a data-fetching and caching layer built on Redux Toolkit. You define an **API slice** with `createApi`; it auto-generates reducers, actions, middleware, and React hooks for each endpoint.

**What RTK Query handles for you:**

- Request deduplication and caching
- Background refetching and cache invalidation
- Loading / error / success states per query
- Optimistic updates and tag-based invalidation
- Polling, prefetching, infinite queries

**Use RTK Query when:**

- Data comes from HTTP (or similar request/response) APIs
- Multiple components need the same fetched data
- You want cache, refetch, and invalidation without manual state machines
- CRUD resources map cleanly to endpoints

**Use `createAsyncThunk` when:**

- Async logic is not HTTP-centric (WebSocket, IndexedDB, complex multi-step workflows)
- You need fine-grained imperative control in one-off flows
- Server state is trivial and caching is unnecessary

**Rule of thumb:** default to RTK Query for server state; use slices + thunks for client/UI state and non-HTTP side effects.

```typescript
// Thunk — manual status tracking, no shared cache
dispatch(fetchUser('42')); // you manage loading/error in slice

// RTK Query — cache + hooks out of the box
const { data, isLoading, error } = useGetUserQuery('42');
```

## How do you define an API slice with createApi?

`createApi` defines a set of endpoints. Key options:

- **`reducerPath`** — where API state lives in the store (e.g., `'api'`).
- **`baseQuery`** — usually `fetchBaseQuery({ baseUrl })` for HTTP.
- **`tagTypes`** — strings for cache invalidation groups.
- **`endpoints`** — builder callback defining queries (GET) and mutations (POST/PUT/DELETE).

Register the API reducer and middleware in `configureStore`. Export auto-generated hooks (`useGetXQuery`, `useUpdateXMutation`).

```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Post {
  id: string;
  title: string;
  body: string;
}

export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Post'],
  endpoints: (builder) => ({
    getPosts: builder.query<Post[], void>({
      query: () => '/posts',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Post' as const, id })), 'Post']
          : ['Post'],
    }),
    getPostById: builder.query<Post, string>({
      query: (id) => `/posts/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Post', id }],
    }),
    createPost: builder.mutation<Post, Partial<Post>>({
      query: (body) => ({ url: '/posts', method: 'POST', body }),
      invalidatesTags: ['Post'],
    }),
    updatePost: builder.mutation<Post, Post>({
      query: ({ id, ...patch }) => ({
        url: `/posts/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (_result, _err, { id }) => [{ type: 'Post', id }],
    }),
  }),
});

export const {
  useGetPostsQuery,
  useGetPostByIdQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
} = postsApi;

// app/store.ts
// reducer: { [postsApi.reducerPath]: postsApi.reducer }
// middleware: (gDM) => gDM().concat(postsApi.middleware)
```

## How do caching and invalidation work in RTK Query?

RTK Query maintains a **normalized cache** keyed by endpoint name + serialized query arguments. Each cache entry tracks `data`, `status`, timestamps, and subscribed components.

**Caching behavior:**

- First `useGetPostsQuery()` triggers a fetch; result is stored.
- Another component with the same hook reads from cache instantly (configurable `staleTime`).
- `keepUnusedDataFor` (default 60s) retains unused cache entries after all subscribers unmount.
- Refetch triggers: mount, arg change, `refetchOnFocus`, `refetchOnReconnect`, manual `refetch()`.

**Tag-based invalidation:**

- Queries **`provideTags`** — label cached data (e.g., `{ type: 'Post', id: '1' }`).
- Mutations **`invalidateTags`** — mark tags stale; active queries refetch automatically.

**Manual cache updates:** `api.util.invalidateTags`, `updateQueryData`, `upsertQueryData` for optimistic UI.

```typescript
import { postsApi } from './postsApi';

// Tag invalidation on mutation (in createApi definition)
createPost: builder.mutation<Post, Partial<Post>>({
  query: (body) => ({ url: '/posts', method: 'POST', body }),
  invalidatesTags: ['Post'],
}),

// Optimistic update in a mutation
updatePost: builder.mutation<Post, Post>({
  query: (post) => ({ url: `/posts/${post.id}`, method: 'PATCH', body: post }),
  async onQueryStarted(post, { dispatch, queryFulfilled }) {
    const patch = dispatch(
      postsApi.util.updateQueryData('getPostById', post.id, (draft) => {
        Object.assign(draft, post);
      })
    );
    try {
      await queryFulfilled;
    } catch {
      patch.undo();
    }
  },
}),

// Manual invalidation from a component or listener
dispatch(postsApi.util.invalidateTags([{ type: 'Post', id: '42' }]));
```

## How do you handle loading and error states with RTK Query hooks?

Query hooks return a rich result object. Mutations return a tuple `[trigger, result]`.

**Query hook fields (common):**

| Field | Meaning |
|-------|---------|
| `data` | Last successful result |
| `isLoading` | First fetch in progress (no cached data) |
| `isFetching` | Any request in flight (including background refetch) |
| `isSuccess` / `isError` | Terminal status flags |
| `error` | Serialized error object |
| `refetch` | Manually trigger refetch |

**Mutation hook fields:** `isLoading`, `isSuccess`, `isError`, `error`, `reset`, and the trigger function.

**UI patterns:** show skeleton on `isLoading`, subtle indicator on `isFetching && !isLoading`, error boundary or inline message on `isError`, disable submit while `isLoading` on mutations. Use `skip: !id` to avoid fetching until args exist.

```tsx
import { postsApi } from './postsApi';

function PostList() {
  const { data, isLoading, isFetching, isError, error, refetch } =
    postsApi.useGetPostsQuery();

  if (isLoading) return <p>Loading posts…</p>;
  if (isError) {
    return (
      <div>
        <p>Error: {'status' in error! ? error.status : 'Failed'}</p>
        <button onClick={refetch}>Retry</button>
      </div>
    );
  }

  return (
    <section>
      {isFetching && <span aria-live="polite">Refreshing…</span>}
      <ul>
        {data?.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </section>
  );
}

function CreatePostForm() {
  const [createPost, { isLoading, isError, error, isSuccess }] =
    postsApi.useCreatePostMutation();

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const title = (form.elements.namedItem('title') as HTMLInputElement).value;
        await createPost({ title, body: '' });
      }}
    >
      <input name="title" required />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving…' : 'Create'}
      </button>
      {isError && <p role="alert">{(error as { data?: string })?.data ?? 'Error'}</p>}
      {isSuccess && <p>Saved!</p>}
    </form>
  );
}

function PostDetail({ id }: { id: string }) {
  const { data: post } = postsApi.useGetPostByIdQuery(id, { skip: !id });
  if (!id) return null;
  return post ? <h1>{post.title}</h1> : null;
}
```

## What are Redux middleware and common use cases (logger, listener)?

**Middleware** sits between `dispatch(action)` and the reducer. It can log, transform, delay, or intercept actions, and dispatch additional actions. Middleware forms a chain: `action → mw1 → mw2 → … → reducer`.

RTK's `configureStore` includes **redux-thunk** by default (async dispatch). You add custom middleware via the `middleware` option.

### Common middleware

1. **redux-logger** — logs prev state, action, and next state in development.
2. **RTK Listener middleware** (`@reduxjs/toolkit/listenerMiddleware`) — declarative side effects: react to actions/state changes, run async logic, dispatch follow-ups (RTK's modern alternative to many saga/effect patterns).
3. **RTK Query middleware** — required for caching/refetch (auto-added with `api.middleware`).
4. **Custom middleware** — analytics, crash reporting, crash-consistency checks.

```typescript
import { configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import { postsApi } from './services/postsApi';
import { authSlice } from './features/auth/authSlice';

export const listenerMiddleware = createListenerMiddleware();

// Listener: react to login, prefetch data
listenerMiddleware.startListening({
  matcher: isAnyOf(authSlice.actions.loginSucceeded),
  effect: async (_action, listenerApi) => {
    listenerApi.dispatch(postsApi.util.prefetch('getPosts', undefined, { force: true }));
  },
});

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    [postsApi.reducerPath]: postsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(listenerMiddleware.middleware)
      .concat(postsApi.middleware)
      .concat(process.env.NODE_ENV === 'development' ? logger : []),
});

// Custom middleware example
const analyticsMiddleware = (storeAPI) => (next) => (action) => {
  if (action.type.startsWith('cart/')) {
    console.log('Analytics:', action.type, storeAPI.getState().cart);
  }
  return next(action);
};
```
