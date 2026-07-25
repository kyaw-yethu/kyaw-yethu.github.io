Here's your everyday workflow. Run these in your WSL/Ubuntu terminal (not Windows PowerShell) — there, node/npm are already on your PATH, so you don't need any wrapper.

One-time / when you open the project:
cd ~/projects/kyaw-yethu.github.io
npm install          # only needed once, or after pulling dependency changes

The main one — live editing with hot reload:
npm run dev
Opens a dev server at http://localhost:4321 — edit any file and the browser refreshes automatically. This is what you want 95% of the time. Stop it with Ctrl+C.

The rest:
npm run build     # produce the production site into dist/
npm run preview   # serve the built dist/ to preview the real output (~localhost:4321)
npm run check     # type + content-collection check (should say 0 errors)
npm test          # run the unit tests (should be 6/6)

Where to edit content (no code needed):

┌──────────────────────────────────────────────┬───────────────────────────────────────────────────┐
│               Want to change…                │                     Edit this                     │
├──────────────────────────────────────────────┼───────────────────────────────────────────────────┤
│ News / Experience / Education / socials      │ src/data/*.yaml                                   │
├──────────────────────────────────────────────┼───────────────────────────────────────────────────┤
│ A publication or research project            │ src/content/{publications,research}/*.md          │
├──────────────────────────────────────────────┼───────────────────────────────────────────────────┤
│ A blog post / essay (+ its kind: blog|essay) │ src/content/writing/*.md                          │
├──────────────────────────────────────────────┼───────────────────────────────────────────────────┤
│ Teaching / talks                             │ src/content/sharing/*.md                          │
├──────────────────────────────────────────────┼───────────────────────────────────────────────────┤
│ Colors / fonts / layout                      │ src/styles/tokens.css, the src/components/*.astro │
└──────────────────────────────────────────────┴───────────────────────────────────────────────────┘

To publish (when ready): commit and git push to master — the GitHub Actions workflow builds and deploys automatically (~1 min). One-time first: repo Settings → Pages → Source: GitHub Actions.

⚠️ One heads-up: the latest work (research images, blog/essay tags, the Physics project) is on the research-page-images branch, not yet on master. So before editing, get onto the branch that has everything:
git checkout research-page-images      # to see/edit the latest
# — or have me merge it into master first, then just: git checkout master

Want me to go ahead and merge research-page-images → master now so you can just work off master? (I can also drop the two preview servers I have running.)