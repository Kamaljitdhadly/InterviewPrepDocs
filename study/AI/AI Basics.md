# AI Basics

## Questions Covered

1. What is artificial intelligence, and how does it differ from machine learning and deep learning?
2. What is generative AI, and how does it differ from traditional ML?
3. What is a large language model (LLM)?
4. How does the transformer architecture work at a high level?
5. What are tokens, and why do they matter for LLMs?
6. What is a context window, and what happens when you exceed it?
7. What is the difference between training, fine-tuning, and inference?
8. What is the difference between pre-training, fine-tuning, and RAG?
9. What are embeddings, and how are they used?
10. What is the difference between discriminative and generative models?
11. What are supervised, unsupervised, and reinforcement learning?
12. What is Azure OpenAI vs OpenAI, and when do you use each?
13. What are open-source vs proprietary LLMs (Llama, Mistral, GPT)?
14. What trade-offs exist between model size, latency, and cost?
15. How does AI fit into a typical enterprise .NET application stack?

## What is artificial intelligence, and how does it differ from machine learning and deep learning?

**Artificial Intelligence (AI)** is the broad field of building systems that perform tasks requiring human-like reasoning — perception, language, planning, decision-making.

| Term | Scope | Example |
|------|-------|---------|
| **AI** | Any technique that mimics intelligent behavior | Chess engine, chatbot, fraud detector |
| **Machine Learning (ML)** | AI that learns patterns from data instead of hard-coded rules | Spam filter, churn prediction |
| **Deep Learning (DL)** | ML using multi-layer neural networks | Image recognition, speech-to-text, LLMs |
| **Generative AI (GenAI)** | DL models that create new content (text, code, images) | GPT-4, DALL·E, Stable Diffusion |

**Relationship:** ML ⊂ AI, DL ⊂ ML, GenAI ⊂ DL (mostly).

Traditional software: `if/else` rules written by developers. ML: model learns `f(features) → label` from examples. DL: `f` is a neural network with many layers. GenAI: output is **new content**, not just a classification.

```python
# Traditional rule-based
def is_spam(subject: str) -> bool:
    return "winner" in subject.lower() or "free money" in subject.lower()

# ML: model learns weights from labeled emails — no hand-written keywords
# prediction = model.predict(vectorize(email))
```

**Interview angle:** Most app developers today work at the **GenAI / LLM application layer** (APIs, RAG, agents) — not training models from scratch.

## What is generative AI, and how does it differ from traditional ML?

**Generative AI** models learn the **distribution of training data** and sample from it to produce novel outputs — text, code, images, audio.

| Aspect | Traditional ML (discriminative) | Generative AI |
|--------|--------------------------------|---------------|
| **Output** | Label, score, class | New content |
| **Task** | Classify, predict, rank | Create, complete, transform |
| **Examples** | Fraud score, house price | Chat reply, code snippet, image |
| **Architecture** | Logistic regression, XGBoost, CNN classifier | Transformers, diffusion models, GANs |

```text
Discriminative:  P(label | input)     → "Is this email spam?"
Generative:      P(output | prompt)     → "Write a summary of this email."
```

GenAI in enterprise apps usually means **LLM-powered features**: copilots, search, document Q&A, code assistants — not training foundation models.

## What is a large language model (LLM)?

An **LLM** is a deep neural network (typically a **transformer**) trained on massive text corpora to predict the next token. At scale, this produces emergent abilities: reasoning, coding, translation, summarization.

**Key properties:**

| Property | Description |
|----------|-------------|
| **Foundation model** | Pre-trained once; adapted via prompts, RAG, or fine-tuning |
| **Autoregressive** | Generates one token at a time, conditioned on prior tokens |
| **Multimodal variants** | GPT-4o, Gemini — text + vision + audio |
| **Instruction-tuned** | Post-trained on human feedback (RLHF) for helpful, safe responses |

```python
# Conceptual: LLM predicts next token given context
context = "The capital of France is"
# Model assigns probabilities: Paris (0.92), Lyon (0.02), ...
next_token = sample(probabilities)
```

Popular families: **GPT** (OpenAI), **Claude** (Anthropic), **Gemini** (Google), **Llama/Mistral** (open weights).

## How does the transformer architecture work at a high level?

The **transformer** (Vaswani et al., 2017) replaced recurrence with **self-attention**, enabling parallel training on long sequences.

**Core components:**

1. **Tokenization** — text → token IDs
2. **Embeddings** — token IDs → dense vectors + positional encoding
3. **Multi-head self-attention** — each token attends to all others; learns relationships ("bank" near "river" vs "money")
4. **Feed-forward layers** — per-token non-linear transforms
5. **Stacked decoder (GPT) or encoder-decoder (T5)** — depth = model "size"

```text
Input:  "The cat sat on the mat"
         ↓ tokenize + embed
         ↓ [Self-Attention × N layers]
         ↓ predict next-token logits
Output: probability distribution over vocabulary
```

**Why it matters for interviews:**

- **Attention** = mechanism behind context understanding and long-range dependencies
- **Parameters** (7B, 70B, 405B) ≈ capacity; more params generally = better reasoning (with diminishing returns)
- **KV cache** at inference — stores key/value tensors to avoid recomputing attention for prior tokens (critical for latency)

## What are tokens, and why do they matter for LLMs?

**Tokens** are the atomic units LLMs process — not always whole words. Subword tokenization (BPE, SentencePiece) splits rare words into pieces.

| Text | Approximate tokens |
|------|-------------------|
| `"Hello"` | 1 |
| `"ChatGPT"` | 2 (`Chat` + `GPT`) |
| `"internationalization"` | 3–5 subwords |
| 1 page (~500 words) | ~650–750 tokens |

**Why tokens matter:**

- **Billing** — API pricing is per 1K/1M tokens (input + output)
- **Context limits** — models cap total tokens per request
- **Latency** — generation time scales with output tokens
- **Prompt design** — shorter prompts = lower cost and faster responses

```python
import tiktoken

enc = tiktoken.encoding_for_model("gpt-4o")
text = "Explain dependency injection in C#."
tokens = enc.encode(text)
print(len(tokens))  # e.g. 7
print(enc.decode(tokens))
```

Rule of thumb: **1 token ≈ 4 characters** in English (varies by language and model).

## What is a context window, and what happens when you exceed it?

The **context window** is the maximum number of tokens the model can consider in one request (input + output combined).

| Model (examples) | Context window |
|------------------|----------------|
| GPT-4o | 128K tokens |
| Claude 3.5 Sonnet | 200K tokens |
| Llama 3.1 8B | 128K tokens |

**When exceeded:**

- API returns an error (most providers), or
- Older tokens are **truncated** (silent data loss)

**Mitigation strategies:**

| Strategy | Use when |
|----------|----------|
| **Summarize** long documents before sending | Reports, transcripts |
| **RAG** — retrieve only relevant chunks | Large knowledge bases |
| **Sliding window / conversation memory** | Long chat sessions |
| **External memory** (DB, vector store) | Persistent agent state |

```csharp
// Always validate token count before sending large payloads
var tokenCount = tokenizer.CountTokens(systemPrompt + userMessage + history);
if (tokenCount > maxContext - reservedForResponse)
    history = TrimOldestMessages(history);
```

## What is the difference between training, fine-tuning, and inference?

| Phase | What happens | Who does it | Cost |
|-------|--------------|-------------|------|
| **Pre-training** | Learn language from massive corpus | Model vendor (OpenAI, Meta) | Millions of dollars |
| **Fine-tuning** | Adapt pre-trained weights to a domain/task | You (or vendor) | Hundreds–thousands |
| **Inference** | Run the trained model on new inputs | Your app at runtime | Per-token API cost |

**Inference** is what application developers do daily — send prompts, get completions.

```python
# Inference — calling a deployed model
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Summarize this PR diff."}]
)
```

**Fine-tuning** updates model weights on your labeled examples (support tone, JSON extraction, domain jargon). **RAG** does not change weights — it adds external context at prompt time (cheaper, easier to update).

## What is the difference between pre-training, fine-tuning, and RAG?

| Approach | Changes model weights? | Updates knowledge? | Best for |
|----------|------------------------|-------------------|----------|
| **Pre-training** | Yes (full) | Baked into weights | Foundation model vendors |
| **Fine-tuning (SFT/LoRA)** | Yes (partial) | Style, format, domain patterns | Consistent tone, specialized tasks |
| **RAG** | No | Via retrieved documents | Private/proprietary data, freshness |
| **Prompt engineering** | No | Via instructions in prompt | Quick iteration, general tasks |

**Decision guide:**

```text
Need private company docs in answers?     → RAG
Need model to always output JSON schema?  → Fine-tune OR structured output + prompt
Need latest news without retraining?      → RAG + web search tool
Need cheaper/smaller model with same task? → Fine-tune a small model
```

Most enterprise .NET apps: **prompt + RAG + function calling** — fine-tune only when RAG and prompts are insufficient.

## What are embeddings, and how are they used?

**Embeddings** are dense vector representations of text (or images) where **semantic similarity ≈ geometric proximity** in vector space.

```python
# Same idea across providers
response = client.embeddings.create(
    model="text-embedding-3-small",
    input="Azure Functions scale automatically."
)
vector = response.data[0].embedding  # e.g. 1536 floats
```

**Uses:**

| Use case | How embeddings help |
|----------|---------------------|
| **RAG retrieval** | Find document chunks similar to user query |
| **Semantic search** | Better than keyword match for natural language |
| **Clustering / dedup** | Group similar tickets, reviews |
| **Recommendations** | "Users who liked X also liked Y" |

```python
import numpy as np

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# query_vec and doc_vec from same embedding model
score = cosine_similarity(query_vec, doc_vec)  # 0.0–1.0
```

See **RAG and Embeddings.md** for chunking, vector DBs, and hybrid search.

## What is the difference between discriminative and generative models?

| | Discriminative | Generative |
|---|----------------|------------|
| **Learns** | Decision boundary between classes | Data distribution P(x) or P(x\|y) |
| **Output** | Label, probability, ranking | New samples (text, image) |
| **Examples** | BERT classifier, ResNet, XGBoost | GPT, Stable Diffusion, VAE |
| **Loss** | Cross-entropy on labels | Next-token prediction, reconstruction |

LLMs are **generative** — they model P(token | prior tokens). You can use them discriminatively via prompting ("Classify this ticket as Billing or Technical — reply with one word only").

## What are supervised, unsupervised, and reinforcement learning?

| Type | Data | Goal | AI example |
|------|------|------|------------|
| **Supervised** | Labeled input→output pairs | Learn mapping | Fine-tuning on Q&A pairs |
| **Unsupervised** | Unlabeled data | Find structure | Clustering embeddings |
| **Reinforcement Learning (RL)** | Reward signal from environment | Maximize cumulative reward | RLHF for chatbot alignment |
| **RLHF** | Human rankings of model outputs | Make model helpful/harmless | ChatGPT post-training |

**RLHF (Reinforcement Learning from Human Feedback):** humans rank model responses → train a reward model → fine-tune LLM with PPO/DPO. This is why instruction-tuned models follow prompts better than raw pre-trained models.

## What is Azure OpenAI vs OpenAI, and when do you use each?

| Aspect | OpenAI API | Azure OpenAI Service |
|--------|------------|----------------------|
| **Hosting** | OpenAI cloud | Your Azure region |
| **Compliance** | OpenAI policies | Azure enterprise (SOC2, HIPAA BAA, private endpoints) |
| **Auth** | API key | Azure AD + managed identity |
| **Models** | Latest GPT, embeddings | Same models (region-dependent availability) |
| **Networking** | Public internet | VNet integration, private link |
| **Billing** | OpenAI account | Azure subscription / PTU options |

```csharp
// Azure OpenAI — endpoint is YOUR resource, not api.openai.com
var client = new AzureOpenAIClient(
    new Uri("https://myresource.openai.azure.com/"),
    new DefaultAzureCredential());

var chat = client.GetChatClient("gpt-4o-deployment-name");
var response = await chat.CompleteChatAsync("Explain CQRS.");
```

**Use Azure OpenAI when:** enterprise Azure shop, data residency requirements, VNet isolation, unified Azure billing, managed identity. **Use OpenAI directly when:** prototyping, latest model day-one access, non-Azure stack.

## What are open-source vs proprietary LLMs (Llama, Mistral, GPT)?

| Category | Examples | Pros | Cons |
|----------|----------|------|------|
| **Proprietary API** | GPT-4o, Claude, Gemini | Best quality, zero ops | Cost, vendor lock-in, data policies |
| **Open weights** | Llama 3, Mistral, Phi | Self-host, customize, no per-token fee | GPU infra, ops burden, smaller models |
| **Hosted open models** | Together AI, Groq, Azure AI Model Catalog | Balance of control and convenience | Variable quality |

```text
Startup MVP / copilot feature     → GPT-4o or Claude via API
Regulated industry, on-prem       → Llama on Azure Kubernetes + vLLM
Cost-sensitive high volume        → Fine-tuned smaller model (Phi-3, Mistral 7B)
```

**Interview tip:** "Open source" for LLMs usually means **open weights** (you can download and run), not necessarily open training data.

## What trade-offs exist between model size, latency, and cost?

| Factor | Smaller model (7B–8B) | Larger model (70B+) / GPT-4 class |
|--------|----------------------|-------------------------------------|
| **Quality** | Good for narrow tasks | Better reasoning, fewer errors |
| **Latency** | Fast (especially with GPU) | Slower; may need routing |
| **Cost** | Cheap self-host or low API tier | Higher per-token; PTU for volume |
| **Memory** | Runs on single GPU | Multi-GPU or API only |

**Production patterns:**

- **Model routing** — cheap model for simple queries, escalate to GPT-4 for hard ones
- **Caching** — semantic cache for repeated questions
- **Batch API** — non-real-time workloads at 50% discount
- **Prompt compression** — shorter context = lower cost

```python
# Simple routing example
def pick_model(user_message: str) -> str:
    if len(user_message) < 200 and not requires_reasoning(user_message):
        return "gpt-4o-mini"  # fast, cheap
    return "gpt-4o"           # complex reasoning
```

## How does AI fit into a typical enterprise .NET application stack?

```text
[ Angular / React SPA ]
        ↓ HTTPS
[ ASP.NET Core Web API ]
        ↓
┌───────────────────────────────────────┐
│  AI Orchestration Layer               │
│  Semantic Kernel / custom services    │
│  • Prompt templates                   │
│  • RAG pipeline (retrieve → prompt) │
│  • Function calling → existing APIs   │
└───────────────────────────────────────┘
        ↓                    ↓
[ Azure OpenAI ]    [ Vector DB / Azure AI Search ]
        ↓                    ↓
[ Azure SQL / Cosmos ]  [ Blob Storage — documents ]
```

**Typical integration points:**

| Layer | Technology |
|-------|------------|
| **SDK** | `Azure.AI.OpenAI`, Microsoft Semantic Kernel |
| **Auth** | `DefaultAzureCredential`, managed identity |
| **Document ingestion** | Azure Functions, Blob trigger, chunk + embed pipeline |
| **Search** | Azure AI Search (vector + keyword hybrid) |
| **Observability** | Application Insights, OpenTelemetry, LangSmith |
| **Security** | Content filters, PII redaction, private endpoints |

```csharp
// Minimal Semantic Kernel registration (ASP.NET Core)
builder.Services.AddKernel()
    .AddAzureOpenAIChatCompletion(
        deploymentName: "gpt-4o",
        endpoint: builder.Configuration["AzureOpenAI:Endpoint"]!,
        apiKey: builder.Configuration["AzureOpenAI:Key"]!);
```

**Interview angle:** You are not replacing the backend — you are adding an **AI orchestration layer** that calls existing domain services via tools/functions while grounding answers in company data via RAG.

## Related Topics

- **Prompt Engineering.md** — crafting effective prompts and parameters
- **RAG and Embeddings.md** — retrieval-augmented generation in depth
- **Building AI Applications.md** — .NET, Node.js, and API integration patterns
