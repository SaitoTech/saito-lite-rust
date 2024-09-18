 #!/bin/bash

printf "export const DYN_MOD_WEB_1 = \`\`;export const DYN_MOD_NODE_1 = \`\`;" > ../../../lib/dyn_mod_1.js
node ../../../webpack/webpack.config.debugmod.cjs
#node ../../../webpack/webpack.config.debugmod.node.cjs
printf "export const DYN_MOD_WEB_1 = \`" > ../../../lib/dyn_mod_1.js
base64 -i ./web/dyn.module.js > ./web/base.txt
printf "$(cat ./web/base.txt)" >> ../../../lib/dyn_mod_1.js
 printf "\`;" >> ../../../lib/dyn_mod_1.js

# printf "export const DYN_MOD_NODE_1 = \`" >> ../../../lib/dyn_mod_1.js
# base64 -i ./node/dyn.module.js > ./node/base.txt
# printf "$(cat ./node/base.txt)" >> ../../../lib/dyn_mod_1.js
# printf "\`;" >> ../../../lib/dyn_mod_1.js


printf "export const DYN_MOD_WEB_2 = \`\`;export const DYN_MOD_NODE_2 = \`\`;" > ../../../lib/dyn_mod_2.js
node ../../../webpack/webpack.config.debugmod_2.cjs
# node ../../../webpack/webpack.config.debugmod.node_2.cjs
printf "export const DYN_MOD_WEB_2 = \`" > ../../../lib/dyn_mod_2.js
base64 -i ./web/dyn.module_2.js > ./web/base2.txt
printf "$(cat ./web/base2.txt)" >> ../../../lib/dyn_mod_2.js
 printf "\`;" >> ../../../lib/dyn_mod_2.js

# printf "export const DYN_MOD_NODE_2 = \`" >> ../../../lib/dyn_mod_2.js
# base64 -i ./node/dyn.module_2.js > ./node/base2.txt
# printf "$(cat ./node/base2.txt)" >> ../../../lib/dyn_mod_2.js
# printf "\`;" >> ../../../lib/dyn_mod_2.js
