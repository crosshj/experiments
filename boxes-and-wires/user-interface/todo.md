## NOTES:
- move towards greater object-orientation in code (message-passing-type OO)

## ROADMAP:
- ANIMATION
		Show what's happening in the system by indicating activity.
- ORGANIZATION / MECHANICS
		Enable greater complexity of models by grouping and allowing creation of more items.
- STATE
		Show changes to system by animating/manipulating state of system over time.  This could go at least two directions: create UI elements which affect state or integrate with Redux Dev Tools.
- CONNECTED
		Model should be attached to something specific: functions, network calls.  This is the life and breath of a visual model like this.
- SHARE
		Exporting an animated GIF would make this tool incredibly useful for one of its main goals: illustrating complex systems visually.  Also, sharing, saving, and manipulating configuration JSON directly woulld be of great use.

## TODO/TASKS:
- wires: CRUD
	- wire create on mobile is awkward / broken
	- update/delete needs wire selection
- boxes: CRUD
	- update/delete needs box/unit selection
- group: CRUD
	- needs box/units selection
- game loop
	- difference between event-driven and game loop?
		https://hero.handmade.network/forums/code-discussion/t/1113-event_driven_vs_game_loop
		https://stackoverflow.com/questions/2565677/why-is-a-main-game-loop-necessary-for-developing-a-game
- wires:  indicators (arrows) - svg marker kinda sucks, imho - may skip this
	https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/marker-end
- boxes: collision detection
- page: zoom/pan with memory
- auto-arrange scene
- snap to grid
- export animated GIF
- export/import source configuration
- sequence/history as part of configuration object
- HTML element (or canvas) overlayed on unit/box for better stylng?
	https://stackoverflow.com/questions/5882716/html5-canvas-vs-svg-vs-div
- history slider
- integrate state with redux dev tools
- nodes: animate node and helper in sync with wire animation
- animation: should pause when dragging boxes/wires
X wires: animation
	https://css-tricks.com/svg-line-animation-works/
X creation of scene from json
X highlighting/hovering links

## ISSUES:
- link click (selection) does not select node and helpers
- link terminal should change direction when close to node
		^^^ direction should be rendered on the fly, not part of state
- dragging wire should have z-index higher than units (fixed by transparent on drag feature?)
- link create/drag should work when started at node helper
X hovering node should also highlight node helper (and vice versa)
X only use transparent mode when node or group(unit) dragging
X new state pattern breaks dragging / hovering
	X hovering fails
	X dragging new link fails
	X many functions fail
	X functionality fails
	X updating units causes duplicate
X dragging unit (and its links?) should be on top (and transparent)
X second new link creation fails
X moving unit quickly (or over other items) or dragging new wire sometimes causes connected links to displace
		^^^ probably should only update moving part of link

## RESOURCES:
- path tool - https://codepen.io/thebabydino/full/EKLNvZ
- path info - https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
