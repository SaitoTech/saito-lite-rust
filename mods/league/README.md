# Saito League Module

Leaderboards and leagues for Saito Games

Players can create private and public league to compete against each other for ranking on leaderboard.

Some of th standards followed in this module are:

### Main module file
The main module file that will be included inside nodules.config.js is placed in the root directory. <br >
<b>File name:</b> moduleName.js <br >
<b>Class name:</b> ModuleName


### Lib files:
Lib files are divided into multiple categories: <br >
1. main <br >
2. components <br >
3. email-appspace <br >
4. overlays <br >

Lib file path structure: <br >
(module name)/(lib/sql/web)/(main/component/overlay)/(component name).js

For example:<br >
<b>league/lib/component/admin-box.js</b>

Similary class name will be just: <br >
<b>LeagueBox</b>

But when importing this component into another file: <br >
<b>const LeagueComponentAdminBox = require("./lib/components/admin-box");</b>

----


### Contributors :
- @umairkhannn
- @trevelyan