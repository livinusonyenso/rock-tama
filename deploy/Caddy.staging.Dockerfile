# Edge image: pinned Caddy, the staging Caddyfile, and the deployment bundle for the same release.
# The bundle lets the EC2 host take the exact compose file and scripts that match a release tag,
# without Git or S3: docker run --rm --entrypoint tar <edge image> -C /deploy -cf - . | tar -xf -
FROM caddy:2.11.9-alpine@sha256:003a97808e781aa9f7e75cc2f43d34d461099031faf5e20faefb9f61126836f0
COPY Caddyfile.staging /etc/caddy/Caddyfile
COPY compose.staging.yml /deploy/compose.staging.yml
COPY --chmod=0555 ec2/ /deploy/ec2/
