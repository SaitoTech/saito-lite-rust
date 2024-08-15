 #!/bin/bash

printf "export const DYN_MOD = \"" > ../../../lib/dyn_mod.js
base64 -i ./dyn.module.js -o base.txt
#echo "content" > ./base.txt
printf "$(cat ./base.txt)" >> ../../../lib/dyn_mod.js
printf "\";" >> ../../../lib/dyn_mod.js
