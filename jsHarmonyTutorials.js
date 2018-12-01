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

var jsHarmony = require('jsharmony');
var jsHarmonyModule = require('jsharmony/jsHarmonyModule');
var jsHarmonyFactory = require('jsharmony-factory');
var HelperRender = require('jsharmony/HelperRender');
var HelperFS = require('jsharmony/HelperFS');
var Helper = require('jsharmony/Helper');
var JSHFind = require('jsharmony/JSHFind');
var jsHarmonyTutorialsConfig = require('./jsHarmonyTutorialsConfig.js');
var fs = require('fs');
var path = require('path');
var async = require('async');
var _ = require('lodash');
var express = require('jsharmony/lib/express');
var ejs = require('ejs');
var menu = require('jsharmony-factory/models/_menu.js');

function jsHarmonyTutorials(){
  var _this = this;
  _this.Config = new jsHarmonyTutorialsConfig();
  _this.typename = 'jsHarmonyTutorials';
  _this.basepath = path.dirname(module.filename);

  this.tutfolder = _this.basepath + '/tutorials';
  this.tutorials = {};
  this.tutlisting = [];
  this.tutids = {};
  this.tutmenu = {};
}

jsHarmonyTutorials.prototype = new jsHarmonyModule();

jsHarmonyTutorials.prototype.Application = function(){
  var _this = this;
  var jsh = new jsHarmony();
  var factory = new jsHarmonyFactory();
  jsh.AddModule(factory);
  jsh.AddModule(this);
  jsh.Sites[factory.mainSiteID] = _.extend(this.getFactoryConfig(),jsh.Sites[factory.mainSiteID]);
  jsh.Config.onDBDriverLoaded.push(function(cb){
    _this.InitFactoryDB(cb);
  });
  return jsh;
}

jsHarmonyTutorials.Application = function(){ return (new jsHarmonyTutorials()).Application(); }

jsHarmonyTutorials.prototype.InitTutorialsDB = function(cb){
  var _this = this;
  var db = _this.jsh.DB['default'];
  db.RunScripts(_this.jsh, ['jsHarmonyTutorials','init'], {}, function(err, rslt){
    if(rslt && rslt.length && rslt[0].length) console.log(JSON.stringify(rslt, null, 4));
    if(err){ console.log('Error initializing database'); console.log(err); }
    else console.log('Database ready');
    if(cb) cb();
  });
}

jsHarmonyTutorials.prototype.InitFactoryDB = function(cb){
  var _this = this;
  //Initialize Database
  var db = _this.jsh.DB['default'];
  db.Scalar('','JSHARMONY_FACTORY_INSTALLED',[],{},function(err,rslt){
    if(err || !rslt){
      console.log('Initializing database tables, please wait...');
      db.RunScripts(_this.jsh, ['*','init','init'], {}, function(err, rslt){
        console.log('Initializing database functions, please wait...');
        if(err){ console.log('Error initializing database'); console.log(err); return; }
        db.RunScripts(_this.jsh, ['*','restructure'], {}, function(err, rslt){
          console.log('Initializing database data, please wait...');
          if(err){ console.log('Error initializing database'); console.log(err); return; }
          db.RunScripts(_this.jsh, ['*','init_data'], {}, function(err, rslt){
            if(err){ console.log('Error initializing database'); console.log(err); return; }
            _this.InitTutorialsDB(cb);
          });
        });
      });
    }
    else _this.InitTutorialsDB(cb);
  });
}

jsHarmonyTutorials.prototype.Init = function(cb){ 
  var _this = this;
  _this.LoadTutorials(cb);
}

jsHarmonyTutorials.prototype.getFactoryConfig = function(){
  var _this = this;
  return { 
    auth: false,
    menu: menu.bind(null, 'S'),
    public_apps: [
      { '*':  express.static(path.join(_this.basepath, 'public')) },
      { '*':  function(req, res, next){
        if(req.query['popup']) req._override_template = 'popup';
        return next();
      } },
    ],
    private_apps: [{
      '/': function(req, res, next){
        var defaultTutorial = '';
        for(var tutorial in _this.tutorials){
          if(!_this.tutorials[tutorial].Flags) continue;
          for(var i=0;i<_this.tutorials[tutorial].Flags.length;i++){
            if(_this.tutorials[tutorial].Flags[i]=='SiteDefault'){ defaultTutorial = tutorial; }
          }
          if(defaultTutorial) break;
        }
        if(!defaultTutorial) return next();
        Helper.Redirect302(res,'/tutorials/'+defaultTutorial);
      },
      //Return an individual tutorial
      '/_tutorials/*': function(req, res, next){
        if(!req.params || !req.params[0]) return Helper.GenError(req, res, -4, 'Invalid tutorial name');
        var tutorial = req.params[0];
        if(HelperFS.cleanPath(tutorial) != tutorial) return Helper.GenError(req, res, -4, 'Invalid tutorial name');
        if(tutorial.substr(tutorial.length-1)=='/') tutorial = tutorial.substr(0, tutorial.length - 1);
        //Check if tutorial exists
        var filepath = _this.tutfolder+'/'+tutorial;
        if(!(tutorial in _this.tutorials)) return Helper.GenError(req, res, -1, 'Tutorial not found');
        fs.stat(filepath,function(err, stats){
          if(err) return Helper.GenError(req, res, -1, 'Tutorial not found');
          fs.readFile(filepath, 'utf8', function(err, data){
            if(err) return Helper.GenError(req, res, -99999, err);
            var config = _this.tutorials[tutorial];
            var rslt = {
              id: config.ID,
              data: data,
              config: config,
              source: {},
            };
            rslt.data = ejs.render(rslt.data, { getScreenshot: function(url, desc, params){ return _this.getScreenshot(url, desc, params); } });

            if(!config.Demo) config.Demo = [];
            if(!_.isArray(config.Demo)) config.Demo = [config.Demo];
            for(var i=0;i<config.Demo.length;i++){
              if(_.isString(config.Demo[i])){
                config.Demo[i] = { url: config.Demo[i], title: config.Demo[i] };
              }
            }

            if(!config.Code) config.Code = [];
            async.eachSeries(config.Code,function(codefile,cb){
              var codepath = _this.basepath + codefile;
              fs.readFile(codepath, 'utf8', function(err,data){
                if(err) return cb(err);
                rslt.source[codefile] = data;
                cb();
              });
            },
            function(err){
              if(err) return Helper.GenError(req, res, -99999, err);
              res.header('Content-Type','text/html');
              res.end(JSON.stringify(rslt));
            });
          });
        });
      },
      //Load SPA - Individual Tutorial
      '/tutorials/*': function(req, res, next){
        var jshrouter = this;
        if(!req.params || !req.params[0]) return next();
        var tutorial = req.params[0];
        //Check if tutorial exists
        var filepath = _this.tutfolder+'/'+tutorial;
        if(!(tutorial in _this.tutorials)) return next();
        HelperRender.reqGet(req, res, jshrouter.jsh, 'tutorials_home', 'jsHarmony Tutorials',
          { basetemplate: 'tutorials', params: { req: req, menu: _this.tutmenu, tutids: _this.tutids, tutorials: _this.tutorials, popups: jshrouter.jsh.Popups } }, function(){});
      },
      //Load SPA - Search
      '/search/*': function(req, res, next){
        var jshrouter = this;
        HelperRender.reqGet(req, res, jshrouter.jsh, 'tutorials_home', 'jsHarmony Tutorials',
          { basetemplate: 'tutorials', params: { req: req, menu: _this.tutmenu, tutids: _this.tutids, tutorials: _this.tutorials, popups: jshrouter.jsh.Popups } }, function(){});
      },
      //Get search results
      '/_search/': function(req, res, next){
        var jshrouter = this;
        var query = req.query['query'];
        var search_rslts = [];
        var final_rslts = [];

        var common_words = [
          "the",
          "be",
          "to",
          "of",
          "and",
          "a",
          "in",
          "that",
          "have",
          "i",
          "it",
          "for",
          "on",
          "with",
          "as",
          "at",
          "this",
          "but",
          "by",
          "from",
          "we",
          "or",
          "an",
          "what",
          "so",
          "its"
        ];

        var qwords = query.split(/[ ,]+/);
        for(var i=0;i<qwords.length;i++){
          qwords[i] = qwords[i].trim();
          if(!qwords[i]){ qwords.splice(i,1); i--; }
          if(_.includes(common_words, qwords[i].toLowerCase())){ qwords.splice(i,1); i--; }
        }
        //Sort by length
        qwords.sort(function(a,b){
          if(a.length > b.length) return -1;
          else if(a.length < b.length) return 1;
          return 0;
        });
        var q = JSHFind.parse(qwords.join(' '),{multiWord:true});

        //Perform search
        async.waterfall([
          function(cb){
            async.eachSeries(['/tutorials'], function(folder, folder_cb){
              searchFiles(_this.basepath, search_rslts, folder, q, folder_cb);
            },function(err){ cb(err); });
          },
          function(cb){
            var final_pages = {};
            for(var i=0;i<search_rslts.length;i++){
              search_rslt = search_rslts[i];
              if(!(search_rslt.File in final_pages)){
                search_rslt.Count = 1;
                final_rslts.push(search_rslt);
                final_pages[search_rslt.File] = 1;
              }
              else {
                for(var j=0;j<final_rslts.length;j++){
                  if(final_rslts[j].File==search_rslt.File) final_rslts[j].Count++;
                }
              }
            }
            final_rslts.sort(function(a,b){ 
              if(a.Count < b.Count) return 1;  
              if(a.Count > b.Count) return -1;
              return 0;
            });
            for(var i=0;i<final_rslts.length;i++){
              var final_rslt = final_rslts[i];
              final_rslt.Preview = _.escape(final_rslt.Preview);
              for(var j=0;j<qwords.length;j++){
                final_rslt.Preview = final_rslt.Preview.replace(new RegExp(JSHFind.escape(qwords[j]),'ig'),
                  function(match, offset, str){
                    return '<b>'+match+'</b>';
                  }
                );
              }
            }

            cb(null);
          }
        ],function(err){
          if(err) return Helper.GenError(req, res, -99999, err);
          res.header('Content-Type','text/html');
          res.end(JSON.stringify(final_rslts));
        });
      },
    }]
  }
}

//Search through tutorials folder and generate menu
jsHarmonyTutorials.prototype.LoadTutorials = function(callback){
  var _this = this;
  //Read all files in the tutorials folder
  HelperFS.funcRecursive(_this.tutfolder,function(filepath, cb){
    //For each File
    fs.readFile(filepath, 'utf8', function(err, data){
      if(err) return cb(err);
      var head = "";
      var head_start = '<script type="text/x-tutorial-info">';
      var head_end = '</script>';
      var idx = data.indexOf(head_start);
      if(idx < 0) return cb();
      data = data.substr(idx+head_start.length);
      var idx = data.indexOf(head_end);
      if(idx < 0) return cb();
      data = data.substr(0,idx);
      try{
        var dataobj = JSON.parse(data);
      }
      catch(ex){ console.log('Error parsing JSON data in '+filepath+':\n'+data); return cb(); }
      if(!dataobj) return cb();
      var tutorialname = filepath.substr(_this.tutfolder.length+1);

      //Verify tutorial object
      if(!dataobj.ID){
        var id = dataobj.Title||'';
        if(dataobj.Menu) id = dataobj.Menu.join('_') + '_' + id;
        dataobj.ID = Helper.ReplaceAll(id,' ','_').toUpperCase();
      }
      var suffixid = 0;
      while((dataobj.ID + (suffixid?'_'+suffixid:'')) in _this.tutids){
        if(!suffixid) suffixid += 2;
        else suffixid++;
      }
      if(suffixid) dataobj.ID += '_' + suffixid;

      _this.tutids[dataobj.ID] = tutorialname;
      _this.tutlisting.push(tutorialname);
      _this.tutorials[tutorialname] = dataobj;
      return cb();
    });
  },undefined,function(){
    //Once all files have been read
    _this.tutlisting.sort();
    //Generate menu
    for(var i=0;i<_this.tutlisting.length;i++){
      var tutfile = _this.tutlisting[i];
      var tutobj = _this.tutorials[tutfile];
      var tutmenuobj = _this.tutmenu;
      for(var j=0;j<tutobj.Menu.length;j++){
        var curmenu = tutobj.Menu[j];
        if(!(curmenu in tutmenuobj)) tutmenuobj[curmenu] = {};
        tutmenuobj = tutmenuobj[curmenu];
      }
      tutmenuobj[tutfile] = 'PAGE';
    }

    //On Complete
    if(callback) callback();
  });
}

//Search Tutorials
function searchFiles(basedir, search_rslt, fpath, q, searchFiles_cb) {
  fs.readdir(basedir + fpath + '/', function (err, files) {
    if (err) return searchFiles_cb(err);
    async.eachSeries(files, function (file, file_cb) {
      var filepath = basedir + fpath + '/' + file;
      fs.stat(filepath, function (err, stats) {
        if (err) return searchFiles_cb(err);
        if (stats.isDirectory()) return searchFiles(basedir, search_rslt, fpath + '/' + file, q, file_cb);
        else {
          //Open File
          fs.readFile(filepath, 'utf8', function (err, data) {
            if (err) return file_cb(err);
            var head_start = '<script type="text/x-tutorial-info">';
            var head_end = '</script>'; 
            if(data.indexOf(head_start)>=0){
              data = data.substr(data.indexOf(head_start));
              data = data.substr(data.indexOf(head_end));
            }
            data = Helper.StripTags(data);
            //FIND
            var srslt = JSHFind.search(data, q, fpath + '/' + file);
            if (srslt.length > 0) {
              for (var i = 0; i < srslt.length; i++) search_rslt.push(srslt[i]);
            }
            return file_cb(null);
          });
        }
      });
    }, function (err) {
      if (err) return searchFiles_cb(err);
      return searchFiles_cb(null);
    });
  });
}

jsHarmonyTutorials.prototype = _.extend(jsHarmonyTutorials.prototype, require('./jsHarmonyTutorials.Screenshots.js'));

module.exports = exports = jsHarmonyTutorials;