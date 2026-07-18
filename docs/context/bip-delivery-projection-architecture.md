# Delivery Projection Architecture

SQLAlchemy persistence rows are mapped to explicit delivery models in `delivery/projections.py`. FastAPI never serializes persistence models directly, and the domain remains independent of HTTP.
