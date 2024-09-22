printf "export const DYN_MOD_WEB = \`\`;export const DYN_MOD_NODE = \`\`;" > ../../../lib/dyn_mod.js
node ../../../webpack/webpack.config.debugmod.cjs
#node ../../../webpack/webpack.config.debugmod.node.cjs
 printf "export const DYN_MOD_WEB = \`" > ../../../lib/dyn_mod.js
 base64 -i ./web/dyn.module.js > ./web/base.txt
 printf "$(cat ./web/base.txt)" >> ../../../lib/dyn_mod.js
 printf "\`;" >> ../../../lib/dyn_mod.js

 # printf "export const DYN_MOD_NODE = \`" >> ../../../lib/dyn_mod.js
 # base64 -i ./node/dyn.module.js > ./node/base.txt
 # printf "$(cat ./node/base.txt)" >> ../../../lib/dyn_mod.js
 # printf "\`;" >> ../../../lib/dyn_mod.js