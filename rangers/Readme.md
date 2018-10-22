Analytics for Line Rangers


### TODO:

- use live data, feed UI with API calls but don't hammer server
- determine what is best spend / reward ratios
- determine rangers / gear from top pvp users
- ...


### Notes:

With this project, I attempted (am attempting) to create a different workflow than I am used to.  Here are some details of what I see is the norm and how I have deviated.

NORM (auto-reload):
- webpack and/or some dev server which builds js and serves content
- script on client and communicates with build to refresh page (websocket)
- client code is served with a page refresh and subsequent pulling from static(built) files on server

DEVIATION (minimal auto-reload):
- nodemon watches files in directory and notifies client
- script on client accepts code sent through nodemon notification to client (websocket)
- client only partially reloads based on wishes of developer
- files are not served, but are accessed from file system in browser
