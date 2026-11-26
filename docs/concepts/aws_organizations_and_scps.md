# AWS Organizations and Service Control Policies

See also: [`ecs_credentials.md`](ecs_credentials.md), [`metrics_and_alarms.md`](metrics_and_alarms.md)

---

## Why this matters

You hit this during Project 2 preflight:

```
WARN  Rerank (us-west-2): AccessDeniedException — not authorized to perform: bedrock:Rerank
       with an explicit deny in a service control policy:
       arn:aws:organizations::573010759765:policy/o-b2t7evbwv3/service_control_policy/p-f1is11b5
```

Your IAM user had `AdministratorAccess`. It should have been able to call anything. But it
couldn't, because the block wasn't in your account at all — it was one layer above, in a
**Service Control Policy** applied by an AWS Organization.

Understanding this layer is essential. SCPs are the ceiling that IAM can never punch through.

---

## Layer 1: One AWS Account

When you sign up for AWS you get a single **account**. Think of it as a fully isolated
container for resources, billing, and identities.

```
AWS Account (415744340135)
├── Root user          — the email/password used to create the account; unrestricted
├── IAM users          — identities you create, e.g. admin-sribastav
├── IAM roles          — assumable identities for services and cross-account access
├── Resources          — EC2, S3, Lambda, Bedrock calls, etc.
└── Billing            — costs accrue here
```

**Root user** is the account's god-mode credential. It bypasses most IAM restrictions
and can do things no IAM policy can permit (close the account, change root email, enable
MFA on the root itself). You almost never use it day-to-day.

**IAM users** are identities inside the account with policies that grant permissions.
`AdministratorAccess` grants full access to all services — but only within the account's
own permission ceiling.

---

## Layer 2: AWS Organizations

**AWS Organizations** is a service that groups multiple accounts into a managed hierarchy.
One account becomes the **management account** (formerly called "master account") and owns
the organization. All other accounts are **member accounts**.

```
Management Account (573010759765 — prajguru54learning@gmail.com)
└── Organization (o-b2t7evbwv3)
    └── Root
        └── [Optional: Organizational Units (OUs)]
            └── Member Account (415744340135)  ← where you work
```

The management account does not host your workloads. Its job is governance:
- Create/invite/remove member accounts
- Attach Service Control Policies to accounts or groups of accounts
- Centralized billing (all member account costs roll up here)
- Shared services like AWS SSO, CloudTrail org trails, Security Hub

**You own both accounts.** The management account was created first, AWS Organizations
was enabled on it, and the working account was added as a member.

---

## Organizational Units (OUs)

An **OU** is a folder for accounts. You can nest OUs inside OUs.

```
Root
├── Production OU
│   ├── Account A
│   └── Account B
├── Development OU
│   └── Account C   ← 415744340135 might sit here
└── Sandbox OU
    └── Account D
```

Policies attached to an OU apply to every account inside it, including accounts in
nested OUs. Policies attached to Root apply to every account in the entire org.

Your SCP `p-f1is11b5` was attached to **Root**, so it applied to all accounts including
your working account.

---

## Service Control Policies (SCPs)

An SCP is a policy attached to an org node (Root, OU, or account) that sets the
**maximum available permissions** for every identity in those accounts.

The critical mental model:

```
                 SCP (ceiling)
                      │
         ┌────────────▼────────────┐
         │   Effective Permission  │  = SCP ∩ IAM Policy
         │                         │
         │   IAM Policy (request)  │
         └─────────────────────────┘

If SCP says Deny → result is Deny, regardless of IAM policy.
If SCP says nothing about an action → IAM policy decides.
If SCP allows + IAM allows → Permit.
```

**SCP does NOT grant permissions on its own.** It only restricts. You still need an
IAM policy to allow an action. The SCP just limits what IAM can permit.

### The two SCP patterns

**Pattern 1 — Deny list (what your SCP used for `RegionFloor`)**

```json
{
  "Effect": "Deny",
  "Action": ["bedrock:DeleteModel", "ec2:TerminateInstances"],
  "Resource": "*"
}
```
Explicitly denies named actions. Everything not listed is permitted (up to IAM).
Easy to reason about. Easy to audit.

**Pattern 2 — Allow list via NotAction (what your SCP used for `UsWest2Partitional`)**

```json
{
  "Effect": "Deny",
  "NotAction": [
    "bedrock:InvokeModel",
    "bedrock:InvokeModelWithResponseStream"
  ],
  "Resource": "*",
  "Condition": { "StringEquals": { "aws:RequestedRegion": "us-west-2" } }
}
```
Denies everything **except** the listed actions in a given region. This is a whitelist
dressed as a deny. Any action not in `NotAction` is implicitly denied. This is how
`bedrock:Rerank` got blocked — it was never added to the whitelist.

---

## Your SCP decoded

Policy `p-f1is11b5` had three statements:

| Statement | Region | Mechanism | Effect |
|---|---|---|---|
| `RegionFloor` | Any region outside `us-east-1`, `us-west-2`, `ap-southeast-2` | NotAction: core Bedrock inference only | Deny all non-Bedrock-inference in disallowed regions |
| `UsEast1Partitional` | `us-east-1` | NotAction: large service allowlist | Deny most AWS services except explicitly listed |
| `UsWest2Partitional` | `us-west-2` | NotAction: smaller allowlist | Same but fewer allowed services |

The Bedrock actions allowed in all three:

```
bedrock:InvokeModel                    ← text generation
bedrock:InvokeModelWithResponseStream  ← streaming generation
bedrock:ApplyGuardrail                 ← Guardrails check
bedrock:CountTokens                    ← token counting
bedrock:GetFoundationModel             ← model metadata
bedrock:GetFoundationModelAvailability ← availability check
bedrock:GetInferenceProfile            ← inference profiles
bedrock:ListFoundationModels           ← model catalog
bedrock:ListInferenceProfiles          ← profile listing
```

`bedrock:Rerank` was simply never added when the policy was written. The fix was to add
it to the `NotAction` list in all three statements.

---

## How SCP evaluation works at call time

When your IAM user `admin-sribastav` calls `bedrock:Rerank` in `us-west-2`:

```
1. Request arrives at Bedrock in us-west-2

2. AWS evaluates SCPs attached to the account path:
   Root → (optional OUs) → Account 415744340135
   
   Statement UsWest2Partitional fires:
     Condition: aws:RequestedRegion == us-west-2 ✓
     NotAction: bedrock:Rerank is NOT in the list
     Effect: Deny
   → Request is DENIED here. Evaluation stops.

3. IAM policy is never consulted.
   AdministratorAccess is irrelevant.
```

Compare to `bedrock:InvokeModel` in `us-west-2`:

```
1. Same request, different action.

2. AWS evaluates SCPs:
   Statement UsWest2Partitional fires:
     Condition: aws:RequestedRegion == us-west-2 ✓
     NotAction: bedrock:InvokeModel IS in the list
     Effect: Deny does NOT apply to this action
   → No SCP denial.

3. AWS evaluates IAM:
   AdministratorAccess → Allow bedrock:InvokeModel
   → Request is PERMITTED.
```

---

## How to diagnose an SCP block

When you get `AccessDeniedException` with the phrase "explicit deny in a service control
policy", the error message gives you everything you need:

```
not authorized to perform: bedrock:Rerank
with an explicit deny in a service control policy:
arn:aws:organizations::573010759765:policy/o-b2t7evbwv3/service_control_policy/p-f1is11b5
                        ^                                                        ^
                        management account ID                                    policy ID
```

**Step 1 — Identify the management account**

```bash
aws organizations describe-organization \
  --query 'Organization.MasterAccountId' --output text
# → 573010759765
```

**Step 2 — Read the policy from the management account**

Sign into `573010759765`, then:

```bash
aws organizations describe-policy --policy-id p-f1is11b5 \
  --query 'Policy.Content' --output text | python3 -m json.tool
```

Look for a `Deny` statement that includes the blocked action, or a `NotAction` list
that excludes it.

**Step 3 — Find where it's attached**

```bash
aws organizations list-targets-for-policy --policy-id p-f1is11b5
```

If the target is `Root`, the policy affects all accounts. If it's an OU or account ID,
only that subtree is affected.

**Step 4 — Fix**

Option A — Add the action to the `NotAction` whitelist (surgical, recommended).
Option B — Detach the policy from the account (removes all restrictions in that policy).

---

## SCP vs IAM — a comparison

| | IAM Policy | SCP |
|---|---|---|
| Attached to | User, role, group, resource | Org node (Root, OU, account) |
| Effect | Grants or denies permissions | Only restricts; never grants |
| Scope | Inside one account | Across all accounts in the org |
| Can override | Nothing above it | IAM policies below it |
| Applies to root user? | No | Yes (with exceptions) |
| Who manages | Account admin | Management account admin only |

---

## Common gotchas

**AdministratorAccess is not omnipotent in an org.**
`AdministratorAccess` grants `*:*` on `*` within your account. SCPs sit above it.
If an SCP denies an action, `AdministratorAccess` cannot permit it.

**The root user is also subject to SCPs.**
Unlike IAM restrictions (which don't apply to root), SCPs do apply to the account root
user for most actions. Only a handful of root-user actions (like closing the account)
are exempt.

**NotAction is a whitelist, not an allowlist.**
Every action missing from a `NotAction` list is implicitly denied in that statement.
When a new AWS API action ships (like `bedrock:Rerank`), it must be explicitly added.
This is why a policy written six months ago can silently block a new feature.

**SCP changes take 1–2 minutes to propagate.**
After editing an SCP in the management account, there is a short propagation delay
before member accounts see the change.

**`describe-account` requires org membership to query.**
Running `aws organizations describe-account --account-id <id>` from a member account
returns `AccessDeniedException`. That call must be made from the management account.

---

## Other policies you saw in the console

| Policy | What it does |
|---|---|
| `FullAWSAccess` | AWS-managed SCP attached by default to all accounts. Allows everything. Without it, no actions would be permitted at all. |
| `BudgetsSpendLimitDenyBedrockUsage` | Blocks Bedrock invocation when a spend threshold is crossed — attached automatically by a Budgets alert Lambda. |
| `BudgetsSpendLimitDenyLambdaUsage` | Same pattern for Lambda. |
| `BudgetsSpendLimitDenyNewWorkloads` | Blocks creation of new chargeable resources when budget is exceeded. |
| `BudgetsSpendLimitDenySageMakerUsage` | Same pattern for SageMaker. |
| `AdvancedModeRegionRestrictionSecurityControlPolicy` | Region restriction: limits which regions are usable. |
| `ManagedAccountSecurityControlPolicy` | General security baseline for member accounts. |

The `BudgetsSpendLimit*` policies are cost guardrails: a Lambda attached to a CloudWatch
Budgets alert detects overspend and programmatically attaches an SCP to the account,
cutting off further usage of that service. They detach when the budget resets or is
manually cleared.
