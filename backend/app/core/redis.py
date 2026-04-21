"""Redis connection and pub/sub utilities."""

import os
from typing import AsyncIterator

import redis.asyncio as redis
import redis as redis_sync


def get_redis_url() -> str:
    """Get Redis URL from environment."""
    return os.getenv("REDIS_URL", "redis://localhost:6379/0")


class RedisClient:
    """Async Redis client wrapper."""

    _client: redis.Redis | None = None

    @classmethod
    async def get_client(cls) -> redis.Redis:
        """Get or create Redis client singleton."""
        if cls._client is None:
            cls._client = redis.from_url(get_redis_url(), decode_responses=True)
        return cls._client

    @classmethod
    async def close(cls) -> None:
        """Close Redis connection."""
        if cls._client is not None:
            await cls._client.close()
            cls._client = None

    @classmethod
    async def publish(cls, channel: str, message: str) -> int:
        """Publish message to channel."""
        client = await cls.get_client()
        return await client.publish(channel, message)

    @classmethod
    async def subscribe(cls, channel: str) -> redis.client.PubSub:
        """Subscribe to channel."""
        client = await cls.get_client()
        pubsub = client.pubsub()
        await pubsub.subscribe(channel)
        return pubsub

    @classmethod
    async def unsubscribe(cls, pubsub: redis.client.PubSub) -> None:
        """Unsubscribe and close pubsub."""
        await pubsub.unsubscribe()
        await pubsub.close()


async def publish_output(execution_id: int, line: str) -> int:
    """Publish workflow output to Redis channel (async).

    Args:
        execution_id: Execution ID.
        line: Output line to publish.

    Returns:
        Number of subscribers received the message.
    """
    channel = f"execute:{execution_id}"
    return await RedisClient.publish(channel, line)


def publish_output_sync(execution_id: int, line: str) -> int:
    """Publish workflow output to Redis channel (sync version for Celery).

    Args:
        execution_id: Execution ID.
        line: Output line to publish.

    Returns:
        Number of subscribers received the message.
    """
    channel = f"execute:{execution_id}"
    client = redis_sync.from_url(get_redis_url(), decode_responses=True)
    result = client.publish(channel, line)
    client.close()
    return result


async def subscribe_output(execution_id: int) -> AsyncIterator[str]:
    """Subscribe to execution output channel.

    Args:
        execution_id: Execution ID.

    Yields:
        Output lines as they are received.
    """
    channel = f"execute:{execution_id}"
    pubsub = await RedisClient.subscribe(channel)
    try:
        async for message in pubsub.listen():
            if message["type"] == "message":
                yield message["data"]
    finally:
        await RedisClient.unsubscribe(pubsub)


async def cleanup_channel(execution_id: int) -> None:
    """Cleanup execution channel (optional - Redis auto-cleanups)."""
    # Redis automatically cleans up channels when last subscriber unsubscribes
    # This is kept for explicit cleanup if needed
    pass