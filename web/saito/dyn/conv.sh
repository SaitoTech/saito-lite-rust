#!/bin/bash 

node ./build/webpack.config.debugmod.cjs --entrypoint=$1
base64 -i ./web/saito/dyn/web/dyn.module.js > ./web/saito/dyn/web/base.txt
printf "$(cat ./web/saito/dyn/web/base.txt)" >> ./lib/dyn_mod.js

