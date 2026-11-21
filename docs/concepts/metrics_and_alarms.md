# Metrics, Alarms, and SNS — How They Fit Together

> This document uses the GenAI Model Gateway as the running example throughout.
> Every term is explained in relation to something you have already built.

---

## The problem these services solve

Your gateway handles requests all day. Something goes wrong — maybe the fallback model
starts getting used heavily, or a circuit breaker opens. Without observability, you find
out when a user complains. With these services wired up, you find out within 5 minutes,
automatically, before anyone complains.

The four terms fit together like a pipeline:

```
Your code
  │
  └─► CloudWatch (storage)
           │
           └─► Metric (a number over time)
                    │
                    ├─► Dimension (which slice of that number)
                    │
                    └─► Alarm (a rule that watches the number)
                                 │
                                 └─► SNS Topic (a broadcast channel)
                                              │
                                              └─► Subscription (who receives it)
```

---

## CloudWatch

CloudWatch is AWS's central monitoring service. Think of it as a time-series database
combined with a rules engine. You push numbers into it; it stores them indexed by time;
you query or graph them; you set rules that fire when a number crosses a threshold.

Everything else on this page lives inside CloudWatch, except SNS.

---

## Metrics

A metric is **a named number measured over time**. Each data point is a value + a timestamp.

In this gateway, `metrics.py` pushes these metrics on every request:

| Metric name | What it measures |
|---|---|
| `InputTokens` | Tokens in the prompt sent to the model |
| `OutputTokens` | Tokens in the model's reply |
| `RequestLatencyMs` | End-to-end time for one request |
| `RequestCount` | 1 per request (used to count total requests) |
| `FallbackInvoked` | 1 when the primary model failed and a fallback served |
| `DegradedResponse` | 1 when every model failed and a 503 was returned |

CloudWatch stores each data point and lets you query aggregations: Sum, Average, p99, etc.

---

## Dimensions

A dimension is **a label that lets you slice a metric**.

Without dimensions, `InputTokens` is a single counter for the whole gateway.
With dimensions, you can ask: "How many input tokens did the `summarize` task consume,
specifically via the `gateway-summarizer` inference profile?"

The gateway emits `InputTokens` with two dimensions:

```python
dimensions = [
    {"Name": "Task",  "Value": "summarize"},
    {"Name": "Model", "Value": "arn:aws:...application-inference-profile/pj4kpzyk2sjx"},
]
```

This creates a separate time series for every unique combination of Task + Model.
You can then compare them:

```
InputTokens {Task=summarize, Model=gateway-summarizer}  →  2,400 tokens today
InputTokens {Task=draft,     Model=gateway-drafter}     →    980 tokens today
InputTokens {Task=answer,    Model=gateway-faq-bot}     →  1,150 tokens today
```

**Key rule:** When querying a metric via CLI or dashboard, you must specify **all** the
dimensions it was stored with — a partial match returns nothing.

```bash
# This returns nothing — InputTokens was stored with Task AND Model
aws cloudwatch get-metric-statistics --metric-name InputTokens \
  --dimensions Name=Task,Value=summarize ...

# This works — both dimensions specified
aws cloudwatch get-metric-statistics --metric-name InputTokens \
  --dimensions Name=Task,Value=summarize Name=Model,Value="arn:..." ...
```

---

## SNS — Topics and Subscriptions

SNS (Simple Notification Service) is a **pub/sub broadcast channel**. It has nothing to
do with metrics directly — it is the delivery mechanism that gets notifications out of
AWS and into the real world (email, Slack, SMS, Lambda, etc.).

**Topic:** A named broadcast channel. `gateway-alerts` is the topic you created.
Think of it as a radio station — it transmits, but nothing happens until someone tunes in.

**Subscription:** An endpoint that listens to a topic. When you subscribed your email
address to `gateway-alerts`, you became a listener. Every message published to the topic
is delivered to every subscription.

```
gateway-alerts (SNS Topic)
    │
    ├─► your-email@example.com  (Email subscription — you confirmed this)
    ├─► (future) Slack webhook  (HTTP subscription)
    └─► (future) Lambda         (Lambda subscription — trigger auto-remediation)
```

You can add more subscribers at any time without changing the alarm — the alarm only
knows about the topic ARN, not who subscribes to it.

---

## Alarms

An alarm is **a rule that watches one metric and publishes to an SNS topic when a
threshold is crossed**.

The alarm you created for degraded responses:

```
Every 5 minutes, look at:
  Namespace:  GenAIGateway
  Metric:     DegradedResponse
  Dimension:  Task=summarize
  Statistic:  Sum (add up all data points in the 5-minute window)

If Sum > 0:
  → Change alarm state to ALARM
  → Publish a message to gateway-alerts SNS topic
  → Your email receives a notification

If no data arrived:
  → treat-missing-data = notBreaching → stay OK
  → (absence of DegradedResponse means nothing went wrong)
```

An alarm has three states:

| State | Meaning |
|---|---|
| `OK` | Metric is within threshold |
| `ALARM` | Threshold crossed — SNS message sent |
| `INSUFFICIENT_DATA` | Not enough data points yet to evaluate |

`--treat-missing-data notBreaching` keeps the alarm in `OK` (not `INSUFFICIENT_DATA`)
when no data arrives — which is the right behaviour for error-type metrics that only
appear when something goes wrong.

---

## How it all fits together — end to end

A degraded response occurs at 14:32:

```
1. Gateway returns 503
      │
      └─► metrics.emit(degraded=True)
               │
               └─► cloudwatch.put_metric_data(
                     Namespace="GenAIGateway",
                     MetricName="DegradedResponse",
                     Dimensions=[{Task: summarize}],
                     Value=1
                   )

2. At 14:35, CloudWatch evaluates gateway-degraded-responses alarm:
   Sum(DegradedResponse, last 5 min) = 1 → exceeds threshold 0
   Alarm state: OK → ALARM
        │
        └─► Publishes message to gateway-alerts SNS topic

3. SNS delivers to all subscriptions:
   → your-email@example.com receives "ALARM: gateway-degraded-responses"

4. You investigate, fix the issue, the next 5-minute window has Sum=0
   Alarm state: ALARM → OK
        │
        └─► Publishes "OK" message to gateway-alerts SNS topic
   → your-email@example.com receives "OK: gateway-degraded-responses"
```

---

## Why not just use logs?

You could grep the server logs for `"degraded": true`. The difference:

| Logs | Metrics + Alarms |
|---|---|
| You have to look | AWS notifies you |
| Free-text, needs parsing | Structured numbers, queryable |
| Not aggregatable without a script | Sum/p99/average built-in |
| No alerting without extra tooling | Alarms are native |
| Great for debugging a specific request | Great for detecting a pattern |

Both are used in production. Logs answer "what happened to request X?" —
metrics and alarms answer "is the system healthy right now?"
