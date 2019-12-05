//(routetype, req, res, callback, require, jsh, modelid, params)
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var Helper = require('../Helper.js');
var model = jsh.getModelClone(req, modelid);

//Render HTML
var codes_path = path.join(jsh.Config.moduledir,'errors.txt');
var codes = fs.existsSync(codes_path) ? fs.readFileSync(codes_path) : '';

var html = '';
html += '<style type="text/css">\
h1.xform_title { display:none; } \
body.popup .xbody { padding:0; } \
pre { background-color:#fff; padding:0; margin:0; } \
</style>';
html += '<pre>'+Helper.escapeHTML(codes)+'</pre>';
model.ejs = html;

//Save model to local request cache
req.jshlocal.Models[modelid] = model;

return callback();
