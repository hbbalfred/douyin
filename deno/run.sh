set -e

export HTTP_PROXY=http://127.0.0.1:1081
export HTTPS_PROXY=http://127.0.0.1:1081
export NO_PROXY=127.0.0.1,localhost

deno run \
  --allow-env    \
  --allow-net    \
  --allow-write  \
  --allow-read   \
  --allow-run    \
  youtube/index.ts https://www.youtube.com/watch?v=4JsyJwFzHIc
  