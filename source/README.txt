AVALANCHE RUN: ROLL & GROW - SOURCE (Bleep Bloop Studios)
Snapshot: 19 Nov 2026 (same build as the live game and the Android zip)

This is the full source for the current game. It replaces the older code in
C:\Snowball Mobile Game (last commit 11 Nov), which is missing everything since.

HOW IT WORKS
game.v91.js and index.v42.html are the original base. build.py applies every
change since then (the other .js/.css files are the added features) and writes
game.js and index.html.

TO BUILD (needs Python 3 and Node.js):
    python build.py

That makes game.js and index.html in this folder. They are the two files that
go in the Android project's  www  folder. Then run  npm run sync  there.
