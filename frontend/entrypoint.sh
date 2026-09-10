#!/bin/sh
set -e

BACKEND_HOST="${BACKEND_HOST:-backend}"

# nginx does not read env vars directly, so substitute into the config template.
sed "s/__BACKEND_HOST__/${BACKEND_HOST}/g" /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'