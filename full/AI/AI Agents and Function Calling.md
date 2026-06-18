# AI Agents and Function Calling

## Questions Covered

1. What is an AI agent, and how does it differ from a simple LLM chat?
2. What is function (tool) calling, and how does it work?
3. What is the ReAct (Reason + Act) pattern?
4. How do you design tools for LLM agents?
5. What is agent memory, and what types exist?
6. What are multi-agent systems, and when use them?
7. What is LangChain vs Semantic Kernel vs AutoGen?
8. How do you handle agent errors and infinite loops?
9. What is human-in-the-loop for agents?
10. How do you secure agent tool access?
11. What is the planner-executor pattern?
12. How do you test AI agents?

## What is an AI agent, and how does it differ from a simple LLM chat?

An **AI agent** is an LLM-driven system that **plans, uses tools, and iterates** toward a goal — not just one-shot text generation.

| Simple chat | Agent |
|-------------|-------|
| Single prompt → response | Loop: think → act → observe → repeat |
| No external actions | Calls APIs, DB, search, code |
| Stateless (or history only) | Memory, state, goals |
| User drives every step | Autonomous within guardrails |

```text
User: "Book the cheapest flight to Seattle next Friday."

Chatbot: "I can't book flights." (no tools)

Agent:
  1. Think → need flight search tool
  2. Act  → search_flights(dest="SEA", date="2025-03-14")
  3. Observe → [{ airline: "Alaska", price: 189 }, ...]
  4. Think → pick cheapest, need booking tool + confirmation
  5. Act  → create_hold(flight_id="...")
  6. Ask user → "Confirm Alaska $189 at 3pm?"
```

## What is function (tool) calling, and how does it work?

**Function calling** (OpenAI **tools** API) lets the model return structured **tool call requests** instead of final text. Your app executes the function and sends results back.

```python
tools = [{
    "type": "function",
    "function": {
        "name": "get_order_status",
        "description": "Get status of a customer order by order ID",
        "parameters": {
            "type": "object",
            "properties": {
                "order_id": {"type": "string", "description": "Order ID like ORD-12345"}
            },
            "required": ["order_id"]
        }
    }
}]

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Where is order ORD-98765?"}],
    tools=tools,
)

# Model may return tool_calls instead of content
if response.choices[0].message.tool_calls:
    call = response.choices[0].message.tool_calls[0]
    result = get_order_status(**json.loads(call.function.arguments))
    # Send tool result back in next message
```

**Flow:**

```text
User message → LLM → tool_call(name, args)
  → Your code executes function
  → tool message with result → LLM → final answer
```

## What is the ReAct (Reason + Act) pattern?

**ReAct** interleaves **reasoning traces** with **actions** — improving tool selection and error recovery.

```text
Thought: User wants weather in Seattle. I need the weather tool.
Action: get_weather(city="Seattle")
Observation: {"temp_f": 52, "condition": "rain"}

Thought: I have the data. Summarize for the user.
Action: Finish
Answer: Seattle is 52°F and rainy today.
```

```python
# Implemented via agent loop (LangChain, SK, custom)
while not done and steps < max_steps:
    response = llm.invoke(messages, tools=tools)
    if response.tool_calls:
        for call in response.tool_calls:
            result = execute_tool(call.name, call.args)
            messages.append(tool_result_message(call.id, result))
    else:
        done = True
        final_answer = response.content
```

**Why it helps:** Explicit reasoning reduces wrong tool calls and makes debugging easier (log each Thought/Action/Observation).

## How do you design tools for LLM agents?

**Tool design principles:**

| Principle | Example |
|-----------|---------|
| **Clear name** | `search_products` not `doStuff` |
| **Rich description** | When to use, when NOT to use, param formats |
| **Small surface area** | One tool = one capability |
| **Typed parameters** | JSON Schema with enums, patterns |
| **Idempotent reads** | Separate read vs write tools |
| **Return structured JSON** | Not prose — model parses easier |

```csharp
[KernelFunction("get_customer_balance")]
[Description("Returns account balance for a verified customer. Requires customer_id from auth context.")]
public async Task<CustomerBalance> GetBalanceAsync(
    [Description("UUID of the customer")] string customerId)
{
    // Validate caller can access this customerId — never trust LLM args alone
    _auth.EnsureAccess(customerId);
    return await _repo.GetBalanceAsync(customerId);
}
```

**Anti-patterns:**

- One mega-tool with 20 optional params
- Tools that mutate state without confirmation
- Returning huge payloads (paginate, summarize)

## What is agent memory, and what types exist?

| Memory type | Scope | Implementation |
|-------------|-------|------------------|
| **Short-term** | Current conversation | Message history in context |
| **Working** | Current task | Scratchpad in prompt |
| **Long-term** | Cross-session | Vector DB, SQL, Redis |
| **Episodic** | Past interactions | Summarized session logs |
| **Semantic** | Facts about user | Profile store ("prefers metric units") |

```python
# Long-term memory pattern
def recall(user_id: str, query: str) -> str:
    memories = memory_index.search(
        filter={"user_id": user_id},
        vector=embed(query),
        top_k=3,
    )
    return "\n".join(m.text for m in memories)

system = f"Relevant memories about this user:\n{recall(user_id, user_message)}"
```

**Context management:** Summarize old turns; store summaries in long-term memory; keep recent N messages verbatim.

## What are multi-agent systems, and when use them?

**Multi-agent** architectures assign specialized roles to different LLM instances.

```text
Orchestrator Agent
  ├── Research Agent (web search, RAG)
  ├── Code Agent (write/run tests)
  └── Review Agent (critique output)
```

| Pattern | Use case |
|---------|----------|
| **Supervisor** | One agent delegates to specialists |
| **Parallel workers** | Map-reduce over document batches |
| **Debate / critique** | Quality check before user sees output |
| **Handoff** | Support → billing escalation |

**When to use:** Complex workflows where one prompt can't cover all skills. **When to avoid:** Simple Q&A — adds latency, cost, coordination bugs.

Frameworks: **AutoGen**, **CrewAI**, **Semantic Kernel Planners**.

## What is LangChain vs Semantic Kernel vs AutoGen?

| Framework | Language | Strengths | Best for |
|-----------|----------|-----------|----------|
| **LangChain / LangGraph** | Python, JS | Huge ecosystem, graphs, RAG chains | Python ML teams, rapid prototyping |
| **Semantic Kernel** | C#, Python, Java | Microsoft stack, plugins, planners | .NET enterprise, Azure OpenAI |
| **AutoGen** | Python | Multi-agent conversations | Research, agent swarms |
| **Custom loop** | Any | Full control, minimal deps | Production with simple needs |

```csharp
// Semantic Kernel — plugin + auto function calling
var kernel = Kernel.CreateBuilder()
    .AddAzureOpenAIChatCompletion("gpt-4o", endpoint, apiKey)
    .Build();

kernel.ImportPluginFromType<OrderPlugin>();
var settings = new OpenAIPromptExecutionSettings { ToolCallBehavior = ToolCallBehavior.AutoInvokeKernelFunctions };
var result = await kernel.InvokePromptAsync("Cancel order 12345 if still pending.", settings);
```

**Interview answer:** Pick SK for **.NET/Azure** shops; LangChain for **Python/data** teams; custom for **tight control** with few tools.

## How do you handle agent errors and infinite loops?

| Problem | Mitigation |
|---------|------------|
| **Infinite tool loop** | `max_iterations` (e.g. 10); detect repeated identical calls |
| **Tool failure** | Return error JSON to model; let it retry or explain |
| **Timeout** | Per-tool and total request timeout |
| **Bad tool args** | Validate with JSON Schema before execution |
| **Runaway cost** | Token budget; circuit breaker |

```python
MAX_STEPS = 10
seen_calls = set()

for step in range(MAX_STEPS):
    response = llm_with_tools(messages)
    if not response.tool_calls:
        break
    for call in response.tool_calls:
        key = (call.name, call.arguments)
        if key in seen_calls:
            messages.append({"role": "system", "content": "You already tried that. Try a different approach."})
        seen_calls.add(key)
        try:
            result = execute(call, timeout=30)
        except Exception as e:
            result = {"error": str(e)}
        messages.append(tool_result(call.id, result))
else:
    raise AgentMaxStepsExceeded()
```

## What is human-in-the-loop for agents?

**Human-in-the-loop (HITL)** pauses the agent for approval on high-impact actions.

```text
Agent proposes: DELETE 847 records matching filter X
  → UI shows preview + diff
  → User clicks Approve / Reject
  → Agent continues or aborts
```

| Action type | HITL required? |
|-------------|----------------|
| Read/search | No |
| Send email | Often yes |
| Financial transaction | Always |
| Delete/modify production data | Always |

```csharp
public enum ApprovalStatus { Pending, Approved, Rejected }

// Store pending action; resume agent when user approves via SignalR/API
await _approvalQueue.EnqueueAsync(new PendingToolCall(toolName, args, userId));
```

## How do you secure agent tool access?

**Never trust the LLM** — treat tool arguments as untrusted input.

| Control | Implementation |
|---------|----------------|
| **Auth context** | Pass user identity from JWT — don't let LLM specify arbitrary user IDs |
| **Least privilege** | Expose only needed tools per role |
| **Allowlist** | Tool names validated server-side |
| **Rate limits** | Per user, per tool |
| **Audit log** | Every tool call: who, what, when, result |
| **No direct DB credentials** | Tools call your existing service layer |

```csharp
// BAD — LLM picks any customerId
public Task<Order[]> GetOrders(string customerId) => _db.Orders.Where(o => o.CustomerId == customerId).ToArrayAsync();

// GOOD — customerId from authenticated user
public Task<Order[]> GetMyOrders() => _db.Orders.Where(o => o.CustomerId == _currentUser.CustomerId).ToArrayAsync();
```

## What is the planner-executor pattern?

**Planner** decomposes a goal into steps; **executor** runs each step with tools.

```text
Goal: "Generate Q3 sales report PDF and email to finance@acme.com"

Planner output:
  1. query_sales_data(Q3)
  2. generate_chart(data)
  3. create_pdf(chart, summary)
  4. send_email(finance@acme.com, pdf)

Executor runs steps 1→4 sequentially, passing outputs forward.
```

Semantic Kernel **Handlebars planners** and **StepwisePlanner** implement this. Useful for multi-step workflows with dependencies.

## How do you test AI agents?

| Test type | What to verify |
|-----------|----------------|
| **Tool selection** | Given input, model calls correct tool |
| **Argument extraction** | Params parsed correctly from natural language |
| **Mock tools** | Deterministic tool responses; assert final output |
| **Regression golden set** | Fixed scenarios don't break on prompt/model change |
| **Adversarial** | Injection attempts don't trigger unauthorized tools |

```python
def test_order_status_tool_called(mocker):
    mock_tool = mocker.patch("tools.get_order_status", return_value={"status": "shipped"})
    agent.run("Track order ORD-123")
    mock_tool.assert_called_once_with(order_id="ORD-123")
```

Log **full agent traces** in staging for replay debugging.

## Related Topics

- **Prompt Engineering.md** — system prompts for agent behavior
- **Building AI Applications.md** — API integration, streaming
- **AI Security and Responsible AI.md** — tool security, injection
- **AI System Design and MLOps.md** — scaling agent workflows
