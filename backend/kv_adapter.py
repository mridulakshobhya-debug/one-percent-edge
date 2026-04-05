"""
Key-Value storage adapter for Vercel KV (Upstash Redis).
Provides in-memory fallback for local development and KV storage for production.
Supports both sync and async operations for FastAPI compatibility.
"""
from __future__ import annotations

import json
import os
from typing import Any, Dict, List, Optional


class KVStore:
    """
    Unified KV storage interface supporting both in-memory and Upstash Redis.
    Automatically selects based on environment configuration.
    Supports both sync and async patterns for maximum compatibility.
    """

    def __init__(self) -> None:
        self._use_redis = bool(os.getenv("UPSTASH_REDIS_REST_URL"))
        self._redis_client = None
        self._memory_store: Dict[str, Any] = {}

        if self._use_redis:
            try:
                from upstash_redis import Redis

                rest_url = os.getenv("UPSTASH_REDIS_REST_URL", "")
                rest_token = os.getenv("UPSTASH_REDIS_REST_TOKEN", "")
                self._redis_client = Redis(url=rest_url, token=rest_token)
            except Exception as e:
                print(f"Warning: Failed to initialize Upstash Redis: {e}. Falling back to in-memory storage.")
                self._use_redis = False

    # Synchronous methods (main operations)
    def get_sync(self, key: str) -> Any:
        """Get value from store (synchronous)."""
        if self._use_redis and self._redis_client:
            try:
                data = self._redis_client.get(key)
                if data:
                    return json.loads(data) if isinstance(data, str) else data
                return None
            except Exception:
                return None
        return self._memory_store.get(key)

    def set_sync(self, key: str, value: Any, ex: Optional[int] = None) -> bool:
        """Set value in store (synchronous)."""
        if self._use_redis and self._redis_client:
            try:
                serialized = json.dumps(value)
                if ex:
                    self._redis_client.setex(key, ex, serialized)
                else:
                    self._redis_client.set(key, serialized)
                return True
            except Exception:
                return False
        self._memory_store[key] = value
        return True

    def delete_sync(self, key: str) -> bool:
        """Delete value from store (synchronous)."""
        if self._use_redis and self._redis_client:
            try:
                self._redis_client.delete(key)
                return True
            except Exception:
                return False
        self._memory_store.pop(key, None)
        return True

    def keys_sync(self, pattern: str = "*") -> List[str]:
        """Get all keys matching pattern (synchronous)."""
        if self._use_redis and self._redis_client:
            try:
                return self._redis_client.keys(pattern)
            except Exception:
                return []
        if pattern == "*":
            return list(self._memory_store.keys())
        import re

        regex = pattern.replace("*", ".*")
        compiled = re.compile(f"^{regex}$")
        return [k for k in self._memory_store.keys() if compiled.match(k)]

    # Async methods (for FastAPI compatibility)
    async def get(self, key: str) -> Any:
        """Get value from store (async wrapper)."""
        return self.get_sync(key)

    async def set(self, key: str, value: Any, ex: Optional[int] = None) -> bool:
        """Set value in store (async wrapper)."""
        return self.set_sync(key, value, ex)

    async def delete(self, key: str) -> bool:
        """Delete value from store (async wrapper)."""
        return self.delete_sync(key)

    async def exists(self, key: str) -> bool:
        """Check if key exists (async)."""
        if self._use_redis and self._redis_client:
            try:
                return bool(self._redis_client.exists(key))
            except Exception:
                return False
        return key in self._memory_store

    async def keys(self, pattern: str = "*") -> List[str]:
        """Get all keys matching pattern (async wrapper)."""
        return self.keys_sync(pattern)

    async def incr(self, key: str, amount: int = 1) -> int:
        """Increment counter."""
        if self._use_redis and self._redis_client:
            try:
                return self._redis_client.incrby(key, amount)
            except Exception:
                pass
        current = self._memory_store.get(key, 0)
        new_value = int(current) + int(amount)
        self._memory_store[key] = new_value
        return new_value

    async def list_append(self, key: str, value: Any) -> int:
        """Append to list."""
        if self._use_redis and self._redis_client:
            try:
                serialized = json.dumps(value)
                return self._redis_client.rpush(key, serialized)
            except Exception:
                pass
        if key not in self._memory_store:
            self._memory_store[key] = []
        self._memory_store[key].append(value)
        return len(self._memory_store[key])

    async def list_get(self, key: str, start: int = 0, stop: int = -1) -> List[Any]:
        """Get list range."""
        if self._use_redis and self._redis_client:
            try:
                data = self._redis_client.lrange(key, start, stop)
                return [json.loads(item) for item in data] if data else []
            except Exception:
                return []
        if key not in self._memory_store:
            return []
        items = self._memory_store[key]
        if not isinstance(items, list):
            return []
        if stop == -1:
            return items[start:]
        return items[start : stop + 1]

    async def list_clear(self, key: str) -> bool:
        """Clear list."""
        if self._use_redis and self._redis_client:
            try:
                self._redis_client.delete(key)
                return True
            except Exception:
                return False
        self._memory_store[key] = []
        return True

    async def get_all_dicts(self, prefix: str) -> Dict[str, Any]:
        """Get all items with given key prefix as dictionary."""
        data = {}
        keys = await self.keys(f"{prefix}:*")
        for key in keys:
            value = await self.get(key)
            if value:
                data[key.replace(prefix + ":", "", 1)] = value
        return data

    async def set_dict_item(self, prefix: str, item_key: str, value: Any) -> bool:
        """Set a single dict item."""
        full_key = f"{prefix}:{item_key}"
        return await self.set(full_key, value)

    async def get_dict_item(self, prefix: str, item_key: str) -> Optional[Any]:
        """Get a single dict item."""
        full_key = f"{prefix}:{item_key}"
        return await self.get(full_key)


# Global KV store instance
kv = KVStore()
