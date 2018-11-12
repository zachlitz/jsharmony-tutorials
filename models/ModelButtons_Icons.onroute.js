//(routetype, req, res, callback, require, jsh, modelid, params)
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var Helper = require('../Helper.js');
var model = jsh.getModelClone(req, modelid);

//Get list of icons from jsHarmony/public/images
var icons = [];
var images_path = path.join(jsh.Config.moduledir,'public/images');
var images = fs.readdirSync(images_path);
_.each(images, function(image){
  if(image.substr(0,5)=='icon_'){
    icon_ext = path.extname(image);
    var icon_name = image.substr(5,image.length-5-icon_ext.length);
    icons.push(icon_name);
  }
});

//Render HTML
//Note: More complex HTML should be rendered using a ModelButtons_Icons.ejs template
var html = '';
html += '<style type="text/css">\
.icon { display:inline-block; text-align:center; width:80px;padding:20px 0; vertical-align:bottom; }\
.icon img { padding-bottom: 12px; }\
</style>';
html += '<div class="icon_listing">';
_.each(icons, function(icon){
  html += '<div class="icon">';
  html += '<img src="/images/icon_'+icon+'.png" /><br/>'+icon;
  html += '</div>';
});
html += '</div>';
model.ejs = html;

//Save model to local request cache
req.jshlocal.Models[modelid] = model;

return callback();
