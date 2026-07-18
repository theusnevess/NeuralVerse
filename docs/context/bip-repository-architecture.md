# Repository Architecture

The dependency direction is domain, application, persistence adapters, then
SQLAlchemy and PostgreSQL. Domain modules do not import persistence modules.
Repositories receive a caller-owned SQLAlchemy session and do not commit
individually. Aggregate changes and outbox records therefore share one commit.
