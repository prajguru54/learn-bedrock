import json
import os
import time
from dataclasses import dataclass

import boto3

# IDs are set here as defaults for local dev; override via env vars in production.
_APP_ID = os.environ.get("APPCONFIG_APP_ID", "8nawrte")
_ENV_ID = os.environ.get("APPCONFIG_ENV_ID", "q25aees")
_PROFILE_ID = os.environ.get("APPCONFIG_PROFILE_ID", "0eb4osj")

_CACHE_TTL = 30.0  # seconds between polls


@dataclass
class TaskConfig:
    model: str
    fallbacks: list[str]
    max_tokens: int
    temperature: float


class _Cache:
    """Wraps the AppConfig data-plane poll loop with an in-process TTL cache.

    How the appconfigdata client works:
      1. start_configuration_session()  → initial token
      2. get_latest_configuration(token) → config body (empty if unchanged) + next token
      3. Always update the token even when the body is empty.
    """

    def __init__(self) -> None:
        self._client = boto3.client("appconfigdata")
        self._token: str | None = None
        self._profile: dict | None = None
        self._fetched_at: float = 0.0

    def _start_session(self) -> None:
        response = self._client.start_configuration_session(
            ApplicationIdentifier=_APP_ID,
            EnvironmentIdentifier=_ENV_ID,
            ConfigurationProfileIdentifier=_PROFILE_ID,
            RequiredMinimumPollIntervalInSeconds=15,
        )
        self._token = response["InitialConfigurationToken"]

    def _poll(self) -> None:
        if self._token is None:
            self._start_session()
        response = self._client.get_latest_configuration(
            ConfigurationToken=self._token,
        )
        self._token = response["NextPollConfigurationToken"]
        content = response["Configuration"].read()
        if content:  # empty body = config unchanged since last poll
            self._profile = json.loads(content)
        self._fetched_at = time.monotonic()

    def get_task_config(self, task: str) -> TaskConfig:
        if self._profile is None or (time.monotonic() - self._fetched_at) > _CACHE_TTL:
            self._poll()
        task_cfg = self._profile["tasks"][task]  # type: ignore[index]
        return TaskConfig(
            model=task_cfg["models"][0], # pick the first model in the list
            fallbacks=task_cfg.get("fallbacks", []),
            max_tokens=task_cfg["maxTokens"],
            temperature=task_cfg.get("temperature", 0.0),
        )


_cache = _Cache()


def get_task_config(task: str) -> TaskConfig:
    return _cache.get_task_config(task)
