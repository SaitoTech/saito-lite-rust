 #!/bin/bash

printf "export const DYN_MOD_WEB_2 = \`\`;export const DYN_MOD_NODE_2 = \`\`;" > ../../../lib/dyn_mod_2.js
node ../../../webpack/webpack.config.debugmod.cjs
node ../../../webpack/webpack.config.debugmod.node.cjs
 printf "export const DYN_MOD_WEB_2 = \`" > ../../../lib/dyn_mod_2.js
 base64 -i ./web/dyn.module.js > ./web/base.txt
 printf "$(cat ./web/base.txt)" >> ../../../lib/dyn_mod_2.js
 printf "\`;" >> ../../../lib/dyn_mod_2.js

 printf "export const DYN_MOD_NODE_2 = \`" >> ../../../lib/dyn_mod_2.js
 base64 -i ./node/dyn.module.js > ./node/base.txt
 printf "$(cat ./node/base.txt)" >> ../../../lib/dyn_mod_2.js
 printf "\`;" >> ../../../lib/dyn_mod_2.js
