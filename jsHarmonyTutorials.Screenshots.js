/*
Copyright 2017 apHarmony

This file is part of jsHarmony.

jsHarmony is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

jsHarmony is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with this package.  If not, see <http://www.gnu.org/licenses/>.
*/

var puppeteer = require('jsharmony/lib/puppeteer');
var ejs = require('ejs');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var async = require('async');
var HelperFS = require('jsharmony/HelperFS');
var imagick = require('jsharmony/lib/gm').subClass({ imageMagick: true });

module.exports = exports = {};

/*******************
|    SCREENSHOTS   |
*******************/

exports.DEFAULT_SCREENSHOT_SIZE = [950, 400];

exports.generateScreenshots = function(callback){
  var _this = this;
  var jsh = _this.jsh;

  puppeteer.launch({ ignoreHTTPSErrors: true, ignoreDefaultArgs: [ '--hide-scrollbars' ] /*, headless: false*/ }).then(function(browser){
    HelperFS.funcRecursive(_this.tutfolder,function(filepath, file_cb){
      //For each File
      fs.readFile(filepath, 'utf8', function(err, txt){
        if(err) return file_cb(err);

        var screenshots = [];
  
        ejs.render(txt, { 
          req: null,
          getScreenshot: function(url, desc, params){ screenshots.push( { url: url, desc: desc, params: params } ); },
          instance: '',
          _: _
        });

        async.eachSeries(screenshots, function(screenshot, screenshot_cb){
          _this.generateScreenshot(browser, screenshot.url, screenshot.desc, screenshot.params, screenshot_cb);
        }, function(err){
          if(err){ jsh.Log.error(err); }
          return file_cb();
        });
      });
    },undefined,function(){
      browser.close();
      return callback();
    });
  }).catch(function(err){ jsh.Log.error(err); });
}

exports.generateScreenshot = function(browser, url, desc, params, callback){
  var _this = this;
  var jsh = _this.jsh;
  if(!url || (url[0] != '/')) url = '/' + url;
  var fname = this.getScreenshotFilename(url, desc, params);
  var fpath = _this.basepath + '/public/screenshots/'+fname;

  //Do not generate screenshot if image already exists
  if(fs.existsSync(fpath)) return callback();

  params = _.extend({ 
    x: 0, 
    y: 0, 
    width: _this.DEFAULT_SCREENSHOT_SIZE[0], 
    height: null,
    trim: true,
    resize: null, //{ width: xxx, height: yyy }
    cropToSelector: null, //Selector
    onload: function(){},
    waitBeforeScreenshot: 0
  }, params);
  if(!params.browserWidth) params.browserWidth = params.x + params.width;
  if(!params.browserHeight) params.browserHeight = _this.DEFAULT_SCREENSHOT_SIZE[1];

  var getCropRectangle = function(selector){
    if(!selector) return null;
    return new Promise(function(resolve){
      if(!jshInstance) return resolve();
      var $ = jshInstance.$;
      var jobjs = $(selector);
      if(!jobjs.length) return resolve();
      var startpos = null;
      var endpos = null;
      for(var i=0;i<jobjs.length;i++){
        var jobj = $(jobjs[i]);
        var offset = jobj.offset();

        var offStart = { left: offset.left - 1, top: offset.top - 1 };
        var offEnd = { left: offset.left + 1 + jobj.outerWidth(), top: offset.top + 1 + jobj.outerHeight() };

        if(!startpos) startpos = offStart;
        if(offStart.left < startpos.left) startpos.left = offStart.left;
        if(offStart.top < startpos.top) startpos.top = offStart.top;

        if(!endpos) endpos = offEnd;
        if(offEnd.left > endpos.left) endpos.left = offEnd.left;
        if(offEnd.top > endpos.top) endpos.top = offEnd.top;
      }
      return resolve({ 
        x: startpos.left, 
        y: startpos.top, 
        width: endpos.left - startpos.left, 
        height: endpos.top - startpos.top
      });
    });
  }

  browser.newPage().then(function (page) {
    var port = jsh.Servers['default'].servers[0].address().port;
    var fullurl = 'http://localhost:'+port+url;
    page.setViewport({ width: params.browserWidth, height: params.browserHeight }).then(function(){
      page.goto(fullurl).then(function(){
        page.evaluate(params.onload).then(function(){
          page.evaluate(getCropRectangle, params.cropToSelector).then(function(cropRectangle){
            var takeScreenshot = function(){
              setTimeout(function(){
                console.log(_this.basepath + '/public/screenshots/'+fname);
                var screenshotParams = { path: fpath, type: 'png' };
                if(cropRectangle) screenshotParams.clip = cropRectangle;
                else if(params.height){
                  screenshotParams.clip = { x: params.x, y: params.y, width: params.width, height: params.height };
                }
                else screenshotParams.fullPage = true;
                page.screenshot(screenshotParams).then(function(){
                  _this.processScreenshot(fpath, params, function(err){
                    if(err) jsh.Log.error(err);
                    page.close().then(function () {
                      return callback();
                    }).catch(function (err) { jsh.Log.error(err); });
                  });
                }).catch(function (err) { jsh.Log.error(err); });
              }, params.waitBeforeScreenshot);
            }
            if(params.beforeScreenshot){
              params.beforeScreenshot(jsh, page, takeScreenshot);
            }
            else takeScreenshot();
          }).catch(function (err) { jsh.Log.error(err); });
        }).catch(function (err) { jsh.Log.error(err); });
      }).catch(function (err) { jsh.Log.error(err); });
    }).catch(function (err) { jsh.Log.error(err); });
  }).catch(function (err) { jsh.Log.error(err); });
}

exports.processScreenshot = function(fpath, params, callback){
  var _this = this;
  var img = imagick(fpath);
  if(params.trim) img.trim();
  if(params.resize){
    img.resize(params.resize.width||null, params.resize.height||null);
  }
  //Compress PNG
  img.quality(1003);
  img.setFormat('png');
  img.noProfile().write(fpath, callback);
}

exports.getScreenshot = function(url, desc, params){
  var fname = this.getScreenshotFilename(url, desc, params);
  return '<img class="screenshot" src="/screenshots/' + fname + '" />';
}

exports.getScreenshotFilename = function(url, desc, params){
  if(!params) params = {};

  //Generate file name
  var fname = url;
  fname = url + '____' + desc;
  if(params.width) fname += '_' + params.width;
  if(params.height) fname += '_' + params.height;
  fname = fname.toString().replace(/[^a-zA-Z0-9]+/g, '_');
  fname = fname.replace(/\_+/g,'_');
  if(fname[0]=='_') fname = fname.substr(1);
  if(fname[fname.length-1]=='_') fname = fname.substr(0,fname.length-1);
  fname += '.png';
  return fname;
}