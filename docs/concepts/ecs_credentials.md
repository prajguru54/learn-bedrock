# ECS Task Role and Credential Injection

Applies to: M7 — Container and Infrastructure  
See also: [`metrics_and_alarms.md`](metrics_and_alarms.md)

---

## The problem credentials solve

When `boto3.client("bedrock-runtime").converse(...)` runs inside a container, AWS must
verify that the caller is allowed to invoke that model. It does this by checking
**credentials** — an access key ID, secret key, and (for temporary credentials) a session
token. These credentials identify who is calling and let IAM evaluate the policy.

On your laptop, credentials come from `~/.aws/credentials`. On Fargate, there is no home
directory, no credentials file, and you must never bake static keys into an image — they
would be readable by anyone who pulls it, and they never expire.

---

## How ECS injects credentials automatically

When you attach a **task role** to a Fargate task definition, ECS does two things before
your container code starts:

**1. Sets an environment variable inside the container:**
```
AWS_CONTAINER_CREDENTIALS_RELATIVE_URI=/v2/credentials/abc123-unique-token
```

**2. Runs a credential server at a fixed link-local address:**
```
http://169.254.170.2   ← reachable only from inside the task
```

Your app code never reads either of these. boto3 does it automatically.

---

## The boto3 credential provider chain

Every time you call `boto3.client(...)`, botocore walks this list in order and stops at the
first source that returns credentials:

```
1. Explicit parameters        client("bedrock-runtime", aws_access_key_id="...")
2. Environment variables      AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY
3. AWS profile / config file  ~/.aws/credentials, ~/.aws/config
4. ECS container endpoint     ← Fargate lands here
5. EC2 instance metadata      (IMDS — for EC2, not Fargate)
```

On Fargate, sources 1–3 are absent. botocore finds `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`
and fetches credentials from the metadata server:

```
GET http://169.254.170.2/v2/credentials/abc123-unique-token

Response:
{
  "AccessKeyId":     "ASIA...",
  "SecretAccessKey": "...",
  "Token":           "FwoGZXIv...",   ← STS session token (required for temp creds)
  "Expiration":      "2026-11-19T14:00:00Z"
}
```

These are **STS temporary credentials** scoped to exactly the permissions in the task role.
They expire every hour. ECS rotates them automatically before expiry. Your code never
handles rotation — botocore re-fetches from the endpoint when the credentials are near
expiry.

---

## End-to-end flow for one Bedrock call

```
Container starts
  │
  ├─ ECS sets AWS_CONTAINER_CREDENTIALS_RELATIVE_URI in the environment
  │
  ├─ Python imports bedrock.py
  │     └─ boto3.client("bedrock-runtime")
  │           └─ botocore credential chain:
  │                 no env keys → no ~/.aws → env var found
  │                   └─ GET http://169.254.170.2/v2/credentials/...
  │                         └─ returns STS temp keys (scoped to task role)
  │
  └─ _client.converse(modelId="...inference-profile/pj4kpzyk2sjx", ...)
        └─ signed with the temp keys
              └─ Bedrock checks IAM: bedrock:InvokeModel on that ARN → allowed
                    └─ response returned
```

Nothing in the application code changes between local dev (uses `~/.aws`) and Fargate
(uses the metadata endpoint). boto3 handles both transparently.

