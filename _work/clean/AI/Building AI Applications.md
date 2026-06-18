# Building AI Applications

## Questions Covered

1. How do you call OpenAI and Azure OpenAI APIs from application code?
2. How does streaming work, and when should you use it?
3. How do you integrate AI into ASP.NET Core applications?
4. What is Microsoft Semantic Kernel, and how do you use it?
5. How do you build a RAG API endpoint in .NET?
6. How do you integrate AI in Node.js / TypeScript applications?
7. How do you handle retries, rate limits, and timeouts?
8. How do you implement semantic caching?
9. How do you structure an AI feature in a clean architecture app?
10. How do you test LLM-powered features?
11. What is the OpenAI Assistants API vs custom agent loops?
12. How do you deploy AI features to production on Azure?

## How do you call OpenAI and Azure OpenAI APIs from application code?

**OpenAI (direct):**

```python
from openai import OpenAI

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Explain CQRS in one paragraph."}],
)
print(response.choices[0].message.content)
```

**Azure OpenAI (.NET):**

```csharp
using Azure.AI.OpenAI;
using Azure.Identity;
using OpenAI.Chat;

var client = new AzureOpenAIClient(
    new Uri(Environment.GetEnvironmentVariable("AZURE_OPENAI_ENDPOINT")!),
    new DefaultAzureCredential());

ChatClient chat = client.GetChatClient("gpt-4o");
ChatCompletion completion = await chat.CompleteChatAsync(
    new ChatMessage(ChatMessageRole.User, "Explain CQRS in one paragraph."));

Console.WriteLine(completion.Content[0].Text);
```

| Concern | OpenAI | Azure OpenAI |
|---------|--------|--------------|
| Endpoint | `api.openai.com` | `https://{resource}.openai.azure.com/` |
| Model param | Model name (`gpt-4o`) | **Deployment name** |
| Auth | API key | API key or Azure AD |

## How does streaming work, and when should you use it?

**Streaming** sends tokens as they're generated — lower **time-to-first-token (TTFT)**, better UX for chat.

```python
stream = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Write a haiku about Azure."}],
    stream=True,
)
for chunk in stream:
    delta = chunk.choices[0].delta.content
    if delta:
        print(delta, end="", flush=True)
```

```csharp
await foreach (var update in chat.CompleteChatStreamingAsync(messages))
{
    if (update.ContentUpdate.Count > 0)
        await Response.WriteAsync(update.ContentUpdate[0].Text);
}
```

**Use streaming when:** chat UI, long-form generation, user waits on response. **Skip when:** background jobs, structured JSON extraction (need full response to parse), batch processing.

## How do you integrate AI into ASP.NET Core applications?

```csharp
// Program.cs
builder.Services.AddSingleton<AzureOpenAIClient>(sp =>
    new AzureOpenAIClient(
        new Uri(builder.Configuration["AzureOpenAI:Endpoint"]!),
        new DefaultAzureCredential()));

builder.Services.AddScoped<IChatService, ChatService>();
builder.Services.AddScoped<IRagService, RagService>();

// ChatController.cs
[ApiController]
[Route("api/chat")]
public class ChatController(IChatService chat) : ControllerBase
{
    [HttpPost]
    public async Task Chat([FromBody] ChatRequest req, CancellationToken ct)
    {
        Response.Headers.ContentType = "text/event-stream";
        await foreach (var token in chat.StreamReplyAsync(req.Message, req.SessionId, ct))
            await Response.WriteAsync($"data: {JsonSerializer.Serialize(new { token })}\n\n", ct);
    }
}
```

**Architecture layers:**

| Layer | Responsibility |
|-------|----------------|
| **Controller** | HTTP, auth, streaming |
| **Application service** | Prompt assembly, RAG, agent loop |
| **Domain** | Business rules (no LLM calls) |
| **Infrastructure** | OpenAI client, vector search, logging |

Keep LLM calls in **application/infrastructure** — not in domain entities.

## What is Microsoft Semantic Kernel, and how do you use it?

**Semantic Kernel (SK)** is Microsoft's orchestration SDK for AI — prompts, plugins, planners, memory, connectors.

```csharp
var builder = Kernel.CreateBuilder();
builder.AddAzureOpenAIChatCompletion("gpt-4o", endpoint, apiKey);
builder.Plugins.AddFromType<OrderPlugin>();
var kernel = builder.Build();

var result = await kernel.InvokePromptAsync(
    "Summarize order {{$orderId}} status for the customer.",
    new KernelArguments { ["orderId"] = "ORD-12345" });
```

**Key concepts:**

| Concept | Description |
|---------|-------------|
| **Kernel** | DI container for AI services |
| **Plugins** | C# methods exposed as LLM tools |
| **Prompt templates** | Handlebars-style `{{$var}}` |
| **Memory** | Semantic memory store for RAG |
| **Filters** | Middleware (logging, PII redaction) |

SK supports **Auto Function Calling** — model picks and invokes plugins automatically.

## How do you build a RAG API endpoint in .NET?

```csharp
public class RagService(AzureOpenAIClient openAi, SearchClient search)
{
    public async Task<RagResponse> AskAsync(string question, string userId, CancellationToken ct)
    {
        // 1. Embed query
        var embedClient = openAi.GetEmbeddingClient("text-embedding-3-small");
        var queryVec = (await embedClient.GenerateEmbeddingAsync(question, cancellationToken: ct)).Value;

        // 2. Hybrid search with ACL filter
        var options = new SearchOptions
        {
            Filter = SearchFilter.Create($"user_id eq '{userId}' or access eq 'public'"),
            Size = 5,
        };
        options.VectorSearch.Queries.Add(new VectorizedQuery(queryVec.ToFloats())
        {
            KNearestNeighborsCount = 5,
            Fields = { "contentVector" },
        });

        var chunks = new List<string>();
        await foreach (var r in search.SearchAsync<SearchDocument>(question, options, ct))
            chunks.Add(r.Document["content"].ToString()!);

        // 3. Generate grounded answer
        var chat = openAi.GetChatClient("gpt-4o");
        var prompt = $"""
            Answer using ONLY this context. Cite sources. If unknown, say so.
            Context: {string.Join("\n---\n", chunks)}
            Question: {question}
            """;
        var answer = await chat.CompleteChatAsync([new UserChatMessage(prompt)], cancellationToken: ct);

        return new RagResponse(answer.Value.Content[0].Text, chunks);
    }
}
```

## How do you integrate AI in Node.js / TypeScript applications?

```typescript
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Express streaming endpoint
app.post("/api/chat", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  const stream = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: req.body.message }],
    stream: true,
  });
  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content ?? "";
    if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
  }
  res.end();
});
```

**Vercel AI SDK** simplifies React streaming:

```tsx
"use client";
import { useChat } from "ai/react";

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({ api: "/api/chat" });
  // renders streaming messages
}
```

## How do you handle retries, rate limits, and timeouts?

```csharp
// Polly retry for transient OpenAI errors (429, 503)
var pipeline = new ResiliencePipelineBuilder()
    .AddRetry(new RetryStrategyOptions
    {
        MaxRetryAttempts = 3,
        DelayGenerator = args =>
        {
            // Respect Retry-After header on 429
            var retryAfter = args.Outcome.Exception?.Data["Retry-After"] as TimeSpan?;
            return new ValueTask<TimeSpan?>(retryAfter ?? TimeSpan.FromSeconds(Math.Pow(2, args.AttemptNumber)));
        },
        ShouldHandle = new PredicateBuilder().Handle<HttpRequestException>()
            .Handle<ClientResultException>(ex => ex.Status == 429 || ex.Status >= 500),
    })
    .AddTimeout(TimeSpan.FromSeconds(60))
    .Build();

var response = await pipeline.ExecuteAsync(async ct =>
    await chat.CompleteChatAsync(messages, cancellationToken: ct));
```

| Error | Action |
|-------|--------|
| **429 Rate limit** | Exponential backoff; queue requests; request quota increase |
| **503 Overloaded** | Retry with jitter |
| **400 Context length** | Truncate input; summarize |
| **Timeout** | Reduce max_tokens; use faster model |

## How do you implement semantic caching?

**Semantic cache** returns cached responses for **similar** (not identical) queries — saves cost and latency.

```python
def get_cached_answer(question: str, threshold=0.95) -> str | None:
    q_vec = embed(question)
    hit = cache_index.search(q_vec, top_k=1)
    if hit and hit.score >= threshold:
        return hit.cached_response
    return None

def ask(question: str) -> str:
    if cached := get_cached_answer(question):
        return cached
    answer = llm.chat(question)
    cache_index.store(embed(question), answer)
    return answer
```

**Options:** Redis with vector search, GPTCache, Azure Redis Enterprise. Invalidate cache when underlying docs change (RAG) or on TTL.

## How do you structure an AI feature in a clean architecture app?

```text
Presentation (API, Blazor, React)
    ↓
Application (IAssistantService, IRagQueryHandler)
    ↓
Domain (no AI dependencies)
    ↓
Infrastructure (OpenAiChatClient, AzureSearchRetriever, PromptRepository)
```

```csharp
public interface IAssistantService
{
    IAsyncEnumerable<string> StreamAnswerAsync(AssistantRequest request, CancellationToken ct);
}

public record AssistantRequest(string Message, string UserId, string SessionId);
```

**Benefits:** swap OpenAI for Azure OpenAI; mock `IAssistantService` in unit tests; centralize prompt templates and telemetry.

## How do you test LLM-powered features?

| Level | Approach |
|-------|----------|
| **Unit** | Mock LLM client; test prompt assembly, parsing, tool routing |
| **Contract** | Golden inputs → assert output contains expected strings / valid JSON |
| **Integration** | Real API in staging; eval dataset with thresholds |
| **E2E** | Playwright + stubbed or staging backend |

```csharp
[Fact]
public async Task RagService_Returns_Unknown_When_No_Chunks()
{
    _search.Setup(s => s.SearchAsync(It.IsAny<string>(), It.IsAny<SearchOptions>(), default))
        .Returns(AsyncEmpty<SearchResult<SearchDocument>>());

    var result = await _sut.AskAsync("Obscure question", "user1", default);
    Assert.Contains("don't have", result.Answer, StringComparison.OrdinalIgnoreCase);
}
```

Use **deterministic settings** (`temperature=0`) in eval runs.

## What is the OpenAI Assistants API vs custom agent loops?

| | Assistants API | Custom loop (SK, LangChain) |
|---|----------------|----------------------------|
| **State** | Managed threads | You manage messages |
| **Tools** | Built-in: code interpreter, file search | Full custom tools |
| **Hosting** | OpenAI-managed | Your infrastructure |
| **Flexibility** | Limited to API features | Full control |
| **Best for** | Quick prototypes, file Q&A | Enterprise .NET apps, custom RAG |

Most **enterprise .NET** apps use **Azure OpenAI + Semantic Kernel + custom RAG** rather than Assistants API — for VNet, managed identity, and custom business tools.

## How do you deploy AI features to production on Azure?

```text
[Azure Front Door / APIM]
        ↓
[Azure App Service / AKS — ASP.NET Core API]
        ↓
[Azure OpenAI — private endpoint]
[Azure AI Search — hybrid index]
[Azure Blob — documents]
[Azure Key Vault — secrets]
[Application Insights — traces, token usage]
```

| Concern | Azure service |
|---------|---------------|
| **Secrets** | Key Vault + managed identity |
| **Network isolation** | Private Link for OpenAI + Search |
| **Scaling** | App Service autoscale; AOAI PTU for predictable load |
| **CI/CD** | GitHub Actions; deploy prompts as config artifacts |
| **Monitoring** | App Insights custom metrics: tokens, latency, cache hit rate |

```yaml
# GitHub Actions — deploy with prompt version
- name: Deploy API
  run: az webapp deploy --resource-group rg-ai --name app-copilot --src-path ./publish
- name: Run RAG eval gate
  run: dotnet test tests/RagEval.Tests.csproj --filter Category=Smoke
```

## Related Topics

- **AI Basics.md** — Azure OpenAI vs OpenAI, tokens
- **RAG and Embeddings.md** — retrieval pipeline details
- **AI Agents and Function Calling.md** — tool design, agent loops
- **AI System Design and MLOps.md** — observability, cost at scale
