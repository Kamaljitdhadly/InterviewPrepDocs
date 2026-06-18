# Fine-tuning Evaluation and MLOps

## Questions Covered

1. When should you fine-tune vs use RAG vs prompt engineering?
2. What is supervised fine-tuning (SFT)?
3. What is LoRA and parameter-efficient fine-tuning (PEFT)?
4. What data do you need for fine-tuning?
5. What is RLHF and DPO?
6. How do you evaluate LLM output quality?
7. What metrics matter for RAG systems?
8. What is LLM-as-a-judge evaluation?
9. How do you A/B test prompts and models in production?
10. What is MLOps for LLM applications?
11. How do you monitor LLM apps in production?
12. How do you manage model and prompt versioning?

## When should you fine-tune vs use RAG vs prompt engineering?

```text
Decision tree:
  Can prompt + RAG solve it?  → YES → Start here (90% of apps)
  Need consistent output format/style at scale? → Fine-tune small model
  Need proprietary knowledge?   → RAG (not fine-tune alone)
  Need latest facts?            → RAG + tools (fine-tune won't help)
  Need domain language/tone?    → Fine-tune OR long system prompt
```

| Approach | Cost | Time to iterate | Knowledge freshness |
|----------|------|-----------------|---------------------|
| **Prompt engineering** | Lowest | Hours | RAG/tools for freshness |
| **RAG** | Medium | Days | Re-index on doc change |
| **Fine-tuning** | Higher | Weeks | Frozen unless re-trained |

Fine-tune when: high-volume specialized task (classification, extraction), prompt + RAG still fails eval, or you need smaller/cheaper model with GPT-4-like behavior on **narrow task**.

## What is supervised fine-tuning (SFT)?

**SFT** continues training a pre-trained model on labeled **input → ideal output** pairs to specialize behavior.

```json
{"messages": [
  {"role": "system", "content": "Extract invoice fields as JSON."},
  {"role": "user", "content": "Invoice #4521 from Contoso, $1,200 due April 1"},
  {"role": "assistant", "content": "{\"invoice_id\":\"4521\",\"vendor\":\"Contoso\",\"amount\":1200,\"due_date\":\"2025-04-01\"}"}
]}
```

**Azure OpenAI fine-tuning:** upload JSONL → create job → deploy fine-tuned model as new deployment.

```bash
az cognitiveservices account deployment create \
  --name my-openai --resource-group rg-ai \
  --deployment-name gpt-4o-mini-finetuned \
  --model-name gpt-4o-mini --model-version "2024-07-18" \
  --model-format OpenAI --sku-capacity 1
```

Minimum ~50–100 high-quality examples; 500–1000+ for production quality.

## What is LoRA and parameter-efficient fine-tuning (PEFT)?

Full fine-tuning updates **all** model weights — expensive. **LoRA (Low-Rank Adaptation)** trains small adapter matrices injected into attention layers — ~0.1–1% of parameters.

| Method | Trainable params | GPU memory | Use case |
|--------|------------------|------------|----------|
| **Full fine-tune** | 100% | Very high | Research, big budget |
| **LoRA / QLoRA** | ~0.1–1% | Moderate | Self-hosted Llama/Mistral |
| **Azure OpenAI FT** | Managed | N/A (API) | GPT-4o mini fine-tunes |

```python
# Hugging Face PEFT — conceptual
from peft import LoraConfig, get_peft_model

config = LoraConfig(r=16, lora_alpha=32, target_modules=["q_proj", "v_proj"])
model = get_peft_model(base_model, config)
# Train only LoRA adapters
```

**QLoRA:** quantize base model to 4-bit + LoRA — fine-tune 70B on single consumer GPU.

## What data do you need for fine-tuning?

| Requirement | Detail |
|-------------|--------|
| **Quality > quantity** | 100 expert-labeled examples beat 10K noisy ones |
| **Consistent format** | Same JSON schema, same tone in every example |
| **Diverse coverage** | Edge cases, negations, ambiguous inputs |
| **Train/val split** | 80/20; hold out test set never seen during training |
| **No PII/secrets** | Scrub before training |
| **Human review** | Every training label verified |

```jsonl
{"messages":[{"role":"user","content":"Classify: Server down in EU"},{"role":"assistant","content":"P1-Incident"}]}
{"messages":[{"role":"user","content":"Classify: Font looks weird"},{"role":"assistant","content":"P3-Cosmetic"}]}
```

**Data flywheel:** log production failures → human corrects → add to next fine-tune batch.

## What is RLHF and DPO?

| Method | Process | Used by |
|--------|---------|---------|
| **RLHF** | Human ranks outputs → train reward model → RL (PPO) optimizes policy | ChatGPT, early alignment |
| **DPO** | Direct preference optimization — no separate reward model | Modern open-source alignment |
| **SFT** | Imitate expert demonstrations | First alignment step |

Application developers rarely run RLHF — you consume **already-aligned** models via API. Know the terms for interviews explaining why GPT-4 follows instructions better than base models.

## How do you evaluate LLM output quality?

| Metric type | Examples |
|-------------|----------|
| **Automated** | Exact match, BLEU/ROUGE (limited), JSON schema valid |
| **Model-based** | GPT-4 judges relevance, faithfulness, coherence (1–5) |
| **Human** | Expert rubric scoring on sample |
| **Task-specific** | Code: unit tests pass; SQL: query runs |

```python
def eval_extraction(model_output: str, expected: dict) -> bool:
    parsed = json.loads(model_output)
    return parsed == expected

# Aggregate on golden set
accuracy = sum(eval(case) for case in golden_set) / len(golden_set)
assert accuracy >= 0.95, "Regression — block deploy"
```

Run eval in **CI/CD gate** before promoting prompt/model version.

## What metrics matter for RAG systems?

**RAGAS framework metrics:**

| Metric | Question answered |
|--------|-------------------|
| **Faithfulness** | Is answer derived from context? |
| **Answer relevancy** | Does answer address the question? |
| **Context precision** | Are retrieved chunks relevant? |
| **Context recall** | Did retrieval find all needed info? |

```python
# Pseudocode — RAGAS-style eval
for case in eval_set:
    chunks = retrieve(case.question)
    answer = generate(case.question, chunks)
    scores = {
        "faithfulness": judge_faithfulness(answer, chunks),
        "relevancy": judge_relevancy(answer, case.question),
    }
    assert scores["faithfulness"] > 0.85
```

Track **P50/P95 latency** and **cost per query** alongside quality metrics.

## What is LLM-as-a-judge evaluation?

Use a **strong model** (GPT-4o) to score outputs from the **system under test** — scalable alternative to human eval.

```python
judge_prompt = f"""
Score 1-5 how well the ANSWER addresses the QUESTION using only the CONTEXT.
Return JSON: {{"score": int, "reason": str}}

Question: {question}
Context: {context}
Answer: {answer}
"""
score = json.loads(gpt4o.chat(judge_prompt))["score"]
```

**Caveats:** judge has biases; calibrate against human scores; don't use same model for judge and subject without blind evaluation.

## How do you A/B test prompts and models in production?

```csharp
public async Task<string> GetAnswerAsync(string question, string userId)
{
    var variant = _experiments.Assign(userId, "prompt-v3-vs-v4"); // sticky per user
    var promptTemplate = variant == "A" ? _prompts.V3 : _prompts.V4;
    var answer = await _llm.CompleteAsync(promptTemplate.Render(question));

    _telemetry.TrackEvent("llm_response", new Dictionary<string, string>
    {
        ["experiment"] = "prompt-v3-vs-v4",
        ["variant"] = variant,
        ["latency_ms"] = stopwatch.ElapsedMilliseconds.ToString(),
    });
    return answer;
}
```

Compare: **task success rate**, **user thumbs up/down**, **escalation to human**, **latency**, **token cost**. Run 1–2 weeks before full rollout.

## What is MLOps for LLM applications?

Traditional MLOps + LLM-specific practices:

| Component | LLM app equivalent |
|-----------|-------------------|
| **Model registry** | Deployment versions (gpt-4o-2024-08-06) |
| **Feature store** | Prompt templates, RAG index version |
| **Training pipeline** | Fine-tune job + eval gate |
| **Serving** | Azure OpenAI deployment, vLLM on AKS |
| **Monitoring** | Token usage, latency, quality drift |
| **Rollback** | Revert prompt version / model deployment |

```text
CI/CD for LLM apps:
  Code change OR prompt change OR index change
    → Run golden eval suite
    → Deploy to staging
    → Smoke + adversarial tests
    → Canary 5% production
    → Full rollout or rollback
```

## How do you monitor LLM apps in production?

**Key dashboards:**

| Metric | Alert threshold example |
|--------|------------------------|
| **Error rate** | > 1% 5xx |
| **P95 latency** | > 8s |
| **Token usage / cost** | Daily budget 80% |
| **Content filter blocks** | Spike > 3× baseline |
| **Cache hit rate** | Drop below 30% |
| **Faithfulness score** (sampled) | Below 0.8 on daily eval |
| **User negative feedback** | > 10% thumbs down |

```csharp
// Application Insights custom metric
_telemetry.GetMetric("LLM.TokensUsed", "model", "feature")
    .TrackValue(totalTokens, modelName, "support-copilot");
```

Sample 1–5% of traffic for **offline quality eval** with LLM-as-judge.

## How do you manage model and prompt versioning?

```text
prompts/
  support/
    v1.yaml   (deprecated)
    v2.yaml   (production)
    v3.yaml   (canary)
models/
  gpt-4o-mini  deployment: prod-extract-v2
  gpt-4o       deployment: prod-chat-v1
indexes/
  kb-hr-v2024-03  (active)
  kb-hr-v2024-06  (staging)
```

| Artifact | Version strategy |
|----------|------------------|
| **Prompts** | Git tags; config in Blob/App Configuration |
| **Models** | Azure deployment names with version suffix |
| **RAG index** | Blue/green index swap after eval |
| **Embeddings** | Never mix models in same index |

Every response log includes `{ prompt_version, model_deployment, index_version }` for reproducibility and debugging.

## Related Topics

- **AI Basics.md** — training vs inference, when to fine-tune
- **RAG and Embeddings.md** — RAG eval metrics
- **Building AI Applications.md** — CI/CD, deployment patterns
- **AI System Design and MLOps.md** — architecture at scale
