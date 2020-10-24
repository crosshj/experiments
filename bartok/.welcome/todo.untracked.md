


TOP PRIORITY:
when a service loads that has untracked files
  - show those untracked files in tab bar (and open one if focused)
  - this is in addition to files that normally would show in tab bar



MEDIUM PRIORITY:
when CONTROL-S is pressed and untracked file is focused
  - pop up a file name selecting dialog
when CONTROL-S is pressed and untracked file is NOT focused
  - save everything the normal way



MEDIUM PRIORITY:
either:
  - untracked files are not saved to provider
  - untracked files are imported as untracked when provider service is added or refreshed



LOWER PRIORITY:
when X is hit on a tab that is for "untracked" file
  - ask if user wants to save or discard then perform associated action



STRETCH GOAL:
images can be untracked too!  here's one idea
  - when pasting, check if an image exists in pasted content
  - if so, save it as an untracked image and show the preview when it immediately focuses

STRETCH GOAL:
- preview for untracked files
- force syntax highlighting/mode for untracked files
