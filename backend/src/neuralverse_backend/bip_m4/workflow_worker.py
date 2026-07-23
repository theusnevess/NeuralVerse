"""Isolated workflow/system task worker entry point."""

from __future__ import annotations

import asyncio
import os

from temporalio.client import Client
from temporalio.worker import Worker

from neuralverse_backend.bip_m4.canonical_workflow import (
    ACPActivityProbeWorkflow,
    GenerateLessonLearningPackageWorkflow,
)

WORKFLOW_TASK_QUEUE = "neuralverse.workflow.generate-learning-package.v1"


async def run() -> None:
    client = await Client.connect(
        os.getenv("TEMPORAL_ADDRESS", "temporal:7233"),
        namespace=os.getenv("TEMPORAL_NAMESPACE", "neuralverse"),
    )
    async with Worker(
        client,
        task_queue=WORKFLOW_TASK_QUEUE,
        workflows=[GenerateLessonLearningPackageWorkflow, ACPActivityProbeWorkflow],
    ):
        await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(run())
