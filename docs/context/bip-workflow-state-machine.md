# Workflow State Machine

The canonical workflow progresses through qualification, curriculum,
parallel enrichment, didactic assembly, cross-agent validation, governance,
human review, compilation, readiness, and publication-command wait.

Workflow state carries bounded summaries and stable artifact references only.
ACP bytes are reconstructed by Backend activities and never returned as
workflow results. Human review and publication commands are accepted only in
their corresponding wait states; cancellation is terminal.
