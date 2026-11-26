#!/bin/bash
# First-boot host preparation for the EC2 staging instance (D-136). Passed as EC2 user data; contains no secrets.
# Ubuntu 24.04 arm64. Idempotent: safe to run again through SSM.
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

# 1. Docker Engine and the Compose plugin from Docker's signed apt repository.
apt-get update -y
apt-get install -y ca-certificates curl gnupg amazon-ecr-credential-helper
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
. /etc/os-release
echo "deb [arch=arm64 signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" > /etc/apt/sources.list.d/docker.list
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
snap list aws-cli >/dev/null 2>&1 || snap install aws-cli --classic

# 2. ECR pulls use the instance role through the credential helper: no stored registry password.
mkdir -p /root/.docker
echo '{"credsStore":"ecr-login"}' > /root/.docker/config.json

# 3. The encrypted EBS data volume: the only non-root NVMe disk. Format only if it has no filesystem.
root_disk=$(lsblk -no PKNAME "$(findmnt -no SOURCE /)")
data_disk=$(lsblk -dno NAME,TYPE | awk -v root="$root_disk" '$2=="disk" && $1!=root {print $1}' | head -1)
if [ -z "$data_disk" ]; then echo "No data volume attached" >&2; exit 1; fi
device=/dev/$data_disk
blkid "$device" >/dev/null 2>&1 || mkfs.ext4 -L rocktama-data "$device"
uuid=$(blkid -s UUID -o value "$device")
mkdir -p /srv/rocktama
grep -q "$uuid" /etc/fstab || echo "UUID=$uuid /srv/rocktama ext4 defaults,nofail,noatime 0 2" >> /etc/fstab
mountpoint -q /srv/rocktama || mount /srv/rocktama
mkdir -p /srv/rocktama/postgres /srv/rocktama/caddy/data /srv/rocktama/caddy/config /srv/rocktama/backups
chmod 0700 /srv/rocktama/backups

# 4. Docker (and so PostgreSQL) never starts unless the data volume is mounted. Default log rotation for all containers.
mkdir -p /etc/docker
echo '{"log-driver":"json-file","log-opts":{"max-size":"10m","max-file":"3"}}' > /etc/docker/daemon.json
mkdir -p /etc/systemd/system/docker.service.d
printf '[Unit]\nRequiresMountsFor=/srv/rocktama\n' > /etc/systemd/system/docker.service.d/10-rocktama-data.conf
systemctl daemon-reload
systemctl enable --now docker

# 5. A 1 GiB swap file: insurance against short memory spikes on a 2 GiB instance (measured app peak ≈ 360 MiB).
if [ ! -f /swapfile ]; then fallocate -l 1G /swapfile && chmod 600 /swapfile && mkswap /swapfile; fi
grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
swapon --show | grep -q /swapfile || swapon /swapfile

# 6. Nightly logical backup on the data volume, one file per weekday (7 kept). EBS snapshots cover the volume.
cat > /etc/cron.d/rocktama-backup <<'CRON'
15 2 * * * root umask 077; docker exec rocktama-db-1 pg_dump -U rocktama_bootstrap -Fc rocktama > /srv/rocktama/backups/daily-$(date +\%u).dump.tmp && mv /srv/rocktama/backups/daily-$(date +\%u).dump.tmp /srv/rocktama/backups/daily-$(date +\%u).dump
CRON
chmod 0644 /etc/cron.d/rocktama-backup

# 7. /opt/rocktama holds release files and secrets.
install -d -m 0755 /opt/rocktama /opt/rocktama/releases
install -d -m 0700 /opt/rocktama/secrets
echo "rocktama host prepared: $(docker --version); data on $device ($uuid)"
