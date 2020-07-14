
REALLY NEED THE FOLLOWING
=========================

As I come to rely on bartok editor more
for notes and code, I need the following.
This is very important because new features
can currupt previously saved data.

- backup and undo after update
- save to filesystem (so git can be source-of-truth)
- some consistency between server and UI storage


TODO
====

- rephrase all tasks in terms of money and/or time

- how much would I pay to use bartok (trick question)?
- how much would you have to pay me to use bartok (trick question)?

Service Worker
==============

chrome://serviceworker-internals/


https://developers.google.com/web/fundamentals/primers/service-workers/high-performance-loading
https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook
cache - https://hasura.io/blog/strategies-for-service-worker-caching-d66f3c828433/
https://blog.codecentric.de/en/2019/09/service-workers-tricks-traps/

events - https://w3c.github.io/ServiceWorker/#execution-context-events

lifecycle picture - https://www.digitalocean.com/community/tutorials/demystifying-the-service-worker-lifecycle
lifecycle picture - https://hasura.io/blog/strategies-for-service-worker-caching-d66f3c828433/

https://www.oreilly.com/library/view/building-progressive-web/9781491961643/ch04.html#note_sw_controlling_after_load

stream from service worker - https://developers.google.com/web/updates/2016/06/sw-readablestreams

websocket from service worker?


2020-07-01
==========
- bitcoin/blockchain in browser (and why?)
- indent using tabs
- code folding

- inline font: https://www.webucator.com/blog/2016/11/inline-web-font-avoid-fout/

- open a folder from local hard drive
  - https://www.html5rocks.com/en/tutorials/file/filesystem/#toc-dir-reading
  - https://www.html5rocks.com/en/tutorials/file/filesystem-sync/

- webtorrent
  - in a worker: https://github.com/webtorrent/webtorrent/issues/1248
  - see browser-server and aether-torrent from ^^^


- finish tree context menu
- web loading time
- web persistence layer
	- localforage in serviceworker
	- browserFS?
- share
- export zip
- import zip
- images/binary files
- open preview in new window / share
- web build system / service layer
- services graph / service selection
- codemirror elegance & bug where editor shows blank
- non editor tabs
- template creation flow & overall template design
	- allow preview to interact with other bartok web components
- settings
	- define a backend
	- define a workflow
- log in (auth with an identity provider)
- collaboration
  - https://github.com/lesmana/webrtc-without-signaling-server
  - https://github.com/cjb/serverless-webrtc
- write and edit bartok web in bartok web
- require an npm package (and use it)
- open a page that is just the file in editor or preview mode; options editor + preview (or other mashup)

---------------
I want to be able to do little experiments
 - and easily share them
 - and not have to deal with build system
 - and not spin up a server
 - and later grow them

---------------
Examples of little experiments:
	- broken clock right twice a day
	- collection of people as faulty mirros
	- architect stage of some project
	- emulate kubernetes, explore kubernetes pattern
	- services with central config service pattern
	- scrape a bunch of sites and do wizardry (data composition & representation)



AN ATTEMPT AT FOCUS
===================

What is an MVP for Bartok?
  - CRUD services: editor, preview, templates?
  - visualize services & connections: service map
  - monitor services: service map
  - deploy services: ???
  - manage services: scale, scale policy, etc: ???

What are the nice-to-have sink holes?
- complete parity with items shown in MARKETING.md
- going too far with any given item listed in MVP statement
- open-endedness of the platform
- cool things to make release videos look nicer (preview)?

Potential Sinkhole Hard Examples:
- meta
  - how do UI services work? how much of Bartok UI is built with them?
  - can I build bartok with bartok editor?
- editor
  - could spend too much time building an editor and putting all the cool things in it
  - perhaps editor should have it's own MVP/sink-hole evaluation
  - parity: does it do all the beloved editor things?
  - completeness: does it do everything right?
  - innovation: does it do cool things that other editors do not do?
- visuals
  - less concern here because visuals have appeal
  - would like to fully grasp how far is too far
  - there needs to be a basic set of items in service map
  - how they look is not as much important as how they connect
- monitor
  - similar case as with visuals
  - this depends on visuals being in place
  - need to be able to read logs
  - need to be able to view resource usage
- deploy
  - similar case as with visuals
  - is this a distinct item from manage (below)?
  - need to figure out how to do this
  - this depends on screens that have not been built
- manage
  - what does it mean to manage?
    - scale
    - scale policy
  - similar case as with visuals
  - need to figure out how to do this
  - this depends on screens that have not been built

What are currently the biggest "   "win"   " items?
  - [X] service map showing real services
  - [X] file templates (UI services)
  - [X] file preview (htm, svg, react)

  - files need id's for uniqueness
  - service save in chunks (because some files are huge)

  - [ ] service templates
  - logs streaming from server
  - metrics streaming from server
  - service map showing real stats
  - direct file system based service (to enable next two wins)

  - UI ran from within bartok ecosystem (soft exploration into first-class services)
  - server ran from within bartok ecosystem (more serious foray into first-class services)



SORTED
======

# FILE CHANGES
 - only keep changed tabs open, reuse previous/unchanged tabs
 - tabs stay open across reload
 - scroll/cursor position remembered
 - allow closing last tab

# PACKAGE.JSON / CONFIG
 - service should get its name from package.json
 - package.json should be ideal and not strict?
   - (comments, unquoted, single quotes, trailing commas, etc)
 - package.json should be service.json? .bartok.yml ?

# TEMPLATES
 - templates for services? routeHandler, uiTemplate, plainNode, etc
 - eject templated app? (export)

# PREVIEW
 - [X] better release notes recording videos - page of code SUCKS!
 - [X] sidepane shows preview for React Component, HTML, markdown, etc
 - [X] use iframe: https://stackoverflow.com/questions/5050380/set-innerhtml-of-an-iframe
 - [X] links are clickable in editor (NOPE - in preview instead)
 - document renders/previews differently for certain doc types
   - [X] [.md] - show rendered html and allow to switch
   - [X] [.svg]
   - [X] [.jsx] - do react!
   - [X] [.ipynb] - jupyter notebook
     - https://github.com/jsvine/notebookjs
     - https://github.com/finnp/ipynb
   - [.tp.json] (made up) - sprite editor and mapped preview (texture packer)


UNSORTED
========

- https://docs.stackery.io/docs/quickstart/quickstart-nodejs/
- https://www.serverless.com/
- https://docs.aws.amazon.com/cdk/latest/guide/home.html
- https://d1.awsstatic.com/whitepapers/architecture/AWS-Serverless-Applications-Lens.pdf
-


- may be useful with all the stringifying - https://github.com/jsbin/jsbin/blob/master/public/js/vendor/stringify.js

- https://react-live.netlify.app/

- https://bl.ocks.org/
- http://www.biofabric.org/gallery/pages/SuperQuickBioFabric.html



- diff - http://cemerick.github.io/jsdifflib/demo.html

- https://stackoverflow.com/questions/51549390/how-to-disable-third-party-cookie-for-img-tags

- https://wall.alphacoders.com/search.php?search=fractal

- http://unikernel.org/projects/ - would be cool if services were compiled to unikernels

- import/require/ read files from within previe
  - eg. <img src="someServicePath/file.png" />
  - eg. import { foo } from 'someServicePath/file.mjs'

- import and export services
- backup and restore
- recycle bin / trash can
- backup sqllite file ?

- panes remember position
- pane splitting (as with a framework that allows open-ended pane manipulation)
- code diff

- page resize doesn't respect min width for explorer
- explorer can be hidden more beautifully, will auto-show and dismiss
- terminal/preview can be hidden or take up full screen

- link files - files which store links and show them in preview

- mini-map / preview within files


- https://12factor.net/ - obey???
- inspiration
  - https://github.com/hundredrabbits/Orca
  - https://jspaint.app/
  - https://www.windows93.net/
- not inspiration, but very similar use case
  - https://azure.microsoft.com/en-us/resources/videos/building-web-sites-with-visual-studio-online-monaco/
- mvc/architectural/BS stuff:
  - https://mvc.givan.se/ -
  - New Jersey vs MIT - https://news.ycombinator.com/item?id=12065570
  - https://en.wikipedia.org/wiki/Worse_is_better


- remember scroll and cursor positions per file

- command pallete / find in file dialogs
- error dialogs / message popups
- notifications


- keep up with VS CODE: icons, fold/match lines, folder arrows

- code folding & fold all, etc


- keyboard shortcuts:
 - ctrl-g: go to line
 - ctrl-p: command pallet
 - https://codemirror.net/demo/sublime.html
 - https://codemirror.net/doc/manual.html#option_extraKeys

- draggable tabs (to reorder)
- draggable files and folders (maybe)


- popup to indicate certain keyboard shortcuts are pressed


- https://picolabs.atlassian.net/wiki/spaces/docs/pages/1189992/Persistent+Compute+Objects

- https://www.html5rocks.com/en/tutorials/file/filesystem-sync/

- connect codemirror to a language server
  - http://www.blog.wylie.su/codemirror-lsp
  - code completion, etc

- stream contents of big files to codemirror (possible?)

- support:
  Rust, Julia, Swift, APL, ML, lisp, C#, OCaml, F#, other??
  https://codemirror.net/mode/index.html

- color picker in file edit mode

- make it easy to edit svg's in CSS
- ascii representation of service nodes
  - http://asciiflow.com/ - draw ascii nodes
  - https://github.com/ivanceras/svgbob - convert to svg


- https://www.dwitter.net/ - 2d graphics in 150 characters


// spritesheet tool? https://www.leshylabs.com/apps/sstool/

// https://svg-edit.github.io/svgedit/editor/svg-editor.html
// http://petercollingridge.appspot.com/svg-editor - optimizes SVGs

// SVG URL Encoder (for CSS) - https://yoksel.github.io/url-encoder/

// ascii text
// http://patorjk.com/software/taag/#p=testall&f=Graffiti&t=notes

// ascii from pic
// https://www.ascii-art-generator.org/

// VERY COOL TOOL: https://danmarshall.github.io/google-font-to-svg-path/
// WORKS GREAT WITH: https://svg-edit.github.io/svgedit/editor


memory usage and performance
============================

https://auth0.com/blog/four-types-of-leaks-in-your-javascript-code-and-how-to-get-rid-of-them/
https://github.com/paulirish/memory-stats.js/blob/master/memory-stats.js
https://web.dev/monitor-total-page-memory-usage/


thinking / re-thinking
======================



fugue: (the UI portion of the bartok ecosystem)


components:

- dom: init dom, change/update dom

- listeners: process event, call some update function that dom has passed

- triggers/actions: user interacting with dom causes system event to be fired

- state?



