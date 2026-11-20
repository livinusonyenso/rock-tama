FROM postgres:18-alpine@sha256:b6972e1115a4ff8eba5d7f7d19184926d1e16d7d1136ae1e1a7ebf286da0f015
COPY bootstrap-roles.sql /bootstrap/roles.sql
COPY --chmod=0555 bootstrap.sh /bootstrap/bootstrap.sh
USER postgres
ENTRYPOINT ["/bootstrap/bootstrap.sh"]
