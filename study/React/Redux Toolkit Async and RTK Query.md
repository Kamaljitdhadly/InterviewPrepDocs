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

`createAsyncThunk` wraps async work into a thunk action creator. Auto-generates **pending**, **fulfilled**, **rejected** action types.

Thunk receives `(arg, thunkAPI)` with `dispatch`, `getState`, `rejectWithValue`, `signal`, etc.

**Flow:** dispatch thunk → `extraReducers` handle lifecycle → UI reacts.

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

**`reducers`** — slice-owned actions (RTK generates creators). **`extraReducers`** — react to external actions (thunks, other slices). No action creators generated.

Use **builder callback** (`builder.addCase`) for type-safe thunk lifecycle:

| Action | When | Typical updates |
|--------|------|-----------------|
| `pending` | Async started | `loading`, clear error |
| `fulfilled` | Resolved | store payload, `succeeded` |
| `rejected` | Failed | store error, `failed` |

Also: `addMatcher`, `addDefaultCase` for groups/fallbacks.

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

**RTK Query** — data-fetching/caching layer on RTK. `createApi` auto-generates reducers, middleware, and React hooks per endpoint.

**Handles:** deduplication, caching, background refetch, invalidation, loading/error states, polling, prefetch.

| Use RTK Query | Use createAsyncThunk |
|---------------|---------------------|
| HTTP APIs, shared fetched data | Non-HTTP async (WebSocket, IndexedDB) |
| Need cache/refetch/invalidation | One-off imperative flows |
| CRUD maps to endpoints | Trivial fetch, no cache needed |

**Default:** RTK Query for server state; slices + thunks for client/UI state.

```typescript
// Thunk — manual status tracking, no shared cache
dispatch(fetchUser('42')); // you manage loading/error in slice

// RTK Query — cache + hooks out of the box
const { data, isLoading, error } = useGetUserQuery('42');
```

## How do you define an API slice with createApi?

Key options: **`reducerPath`**, **`baseQuery`** (`fetchBaseQuery`), **`tagTypes`**, **`endpoints`** (queries + mutations).

Register reducer + middleware in `configureStore`; export auto-generated hooks.

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

Cache keyed by **endpoint + serialized args**. Tracks `data`, `status`, timestamps, subscribers.

- First fetch stores result; same hook args read cache.
- `keepUnusedDataFor` (default 60s) after unmount.
- Refetch: mount, arg change, focus, reconnect, manual `refetch()`.

**Tags:** queries `provideTags`; mutations `invalidateTags` → stale queries refetch.

**Manual:** `invalidateTags`, `updateQueryData`, `upsertQueryData`.

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

**Query hooks:** `data`, `isLoading` (first fetch), `isFetching` (any in-flight), `isSuccess`/`isError`, `error`, `refetch`.

**Mutation hooks:** `[trigger, { isLoading, isSuccess, isError, error, reset }]`.

**UI:** skeleton on `isLoading`; subtle indicator on background `isFetching`; error + retry on `isError`; `skip: !id` to defer fetch.

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

**Middleware** sits between `dispatch` and reducer — can log, transform, or dispatch more actions. Chain: `action → mw1 → mw2 → … → reducer`.

RTK includes **redux-thunk** by default. Add custom via `middleware` option.

| Middleware | Use |
|------------|-----|
| **redux-logger** | Log prev/action/next in dev |
| **Listener middleware** | Declarative side effects on actions/state |
| **RTK Query middleware** | Required for cache/refetch |
| **Custom** | Analytics, crash reporting |

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
