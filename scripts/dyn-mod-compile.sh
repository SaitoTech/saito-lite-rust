#!/bin/bash 

node ./build/webpack.config.dynmod.cjs --entrypoint=$1
base64 -i ./build/dyn/web/dyn.module.js > ./build/dyn/web/base.txt
printf "$(cat ./build/dyn/web/base.txt)" >> ./build/dyn_mod.js

