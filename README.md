# ProcessingP5

A marriage between [Processing IDE](https://processing.org/) and [p5.js](https://p5js.org/).

This is a ready-to-use editor to create p5.js sketches, without any other dependencies to download and install.  
You open it for the first time and start playing.

It is primarily meant for artists, designers, and people learning programming for the first time.  
Having said that, I don't fall into any of those categories, but I use it for my day-to-day sketching.

It looks like this: 

![Screenshot](https://raw.githubusercontent.com/filipesabella/ProcessingP5/master/screenshot.png)

_(showing Light and Dark modes)_

## Features

The editor is powered by the wonderful [Monaco Editor](https://microsoft.github.io/monaco-editor/), and the sketches run [p5.js](https://p5js.org/) by the legendary Daniel Shiffman.

Together with all the features from the Monaco Editor itself, it supports:
* Auto-complete for the p5 API
* Live reloading without refresh (as an option)
* Dark & Light mode
* Importing of other libraries and files
* Exporting the sketch to a stand-alone html file (other formats to come)

# Development

The code is currently a bit messy, as it was a fever project.

To run locally, run these once:

```
yarn --ignore-engines
yarn build
```

And then:

```
yarn server

# and on another session

yarn start
```

# Releasing it

Create a file called `token` in the root, it must have a github
access token with the full `repo` permission. Then:

```./ship.sh```

Note: creating the .dmg file only works when running on a mac.
