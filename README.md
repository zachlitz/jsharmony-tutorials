# ===================
# jsharmony-tutorials
# ===================

jsHarmony Tutorials Collection

## Installation

npm install jsharmony-tutorials --save

## Usage

Run the following command in the jsHarmony CLI (jsharmony-cli):

```
jsharmony create tutorials
```

Or, alternatively, create an app.config.js / app.config.local.js and initialize the tutorials manually via:

```javascript
var jsHarmonyTutorials = require('jsharmony-tutorials');
var jsh = new jsHarmonyTutorials.Application();
jsh.Run();
```

## Release History

* 1.0.0 Initial release