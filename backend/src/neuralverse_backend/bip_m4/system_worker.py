"""BIP system-activity worker entry point."""

from __future__ import annotations

import asyncio
import os

from temporalio.client import Client
from temporalio.worker import Worker

from neuralverse_backend.bip_m4.canonical_workflow import SYSTEM_TASK_QUEUE
from neuralverse_backend.bip_m4.system_activities import (
    load_canonical_activity_dependencies_activity,
    persist_workflow_progress,
    publish_learning_package,
    qualify_generation_request,
)


async def run() -> None:
    client = await Client.connect(
        os.getenv("TEMPORAL_ADDRESS", "temporal:7233"),
        namespace=os.getenv("TEMPORAL_NAMESPACE", "neuralverse"),
    )
    async with Worker(
        client,
        task_queue=SYSTEM_TASK_QUEUE,
        activities=[
            qualify_generation_request,
            persist_workflow_progress,
            load_canonical_activity_dependencies_activity,
            publish_learning_package,
        ],
    ):
        await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(run())
