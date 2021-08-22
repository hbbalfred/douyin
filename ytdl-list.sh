#!/bin/sh

if [[ -z $NO_PROXY ]]; then

export GLOBAL_AGENT_HTTP_PROXY=http://127.0.0.1:7890
npx ts-node -r 'global-agent/bootstrap' ./src/youtube/playlist.ts "$@"

else

npx ts-node ./src/youtube/ytdl.ts "$@"

fi
