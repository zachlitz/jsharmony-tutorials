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

var jsHarmonyConfig = require('jsharmony/jsHarmonyConfig');
var HelperFS = require('jsharmony/HelperFS');
var path = require('path');

function jsHarmonyTutorialsConfig(){
  //jsHarmony Tutorials module path
  this.moduledir = path.dirname(module.filename);
  //Enable DEV functions for unauthenticated user
  this.enable_dev = false;
}

jsHarmonyTutorialsConfig.prototype = new jsHarmonyConfig.Base();

jsHarmonyTutorialsConfig.prototype.Init = function(cb, jsh){

  jsh.Config.system_settings.allow_insecure_http_encryption = true;

  var factory = jsh.GetModule('jsHarmonyFactory');
  factory.Config.debug_params.disable_job_processor = true;
  
  //Create database if not defined
  if(!jsh.DBConfig['default']){
    var sqliteDBDriver = require('jsharmony-db-sqlite');
    HelperFS.createFolderIfNotExists(jsh.Config.datadir + 'db', function () { });
    jsh.DBConfig['default'] = { 
      _driver: new sqliteDBDriver(),
      database: jsh.Config.datadir + 'db/tutorials.db', 
      //database: ':memory:', 
    };
  }

  if(!jsh.XValidate._v_MinWordCount){
    jsh.XValidate._v_MinWordCount = function(minWords){
      return function(_caption, _val, _obj){
        if((typeof _val == "undefined")||(_val==="")||(_val===null)) return '';
        var numWords = _val.toString().trim().split(/\s+/).length;
        if(numWords < minWords) return _caption+' must have at least '+minWords+' words.';
        return '';
      }
    }
    jsh.XValidate._v_MinWordCount.runat = ['server','client'];
  }

  jsh.CustomFormatters.creditcard = function (val) {
    if ((typeof val == 'undefined') || (val === null)) return val;
    var ccval = val.toString().replace(/[^0-9]+/g, '');
    if (ccval.toString().length < 13) return val;
    return ccval.substr(0, 4).trim() + ' ' + ccval.substr(4, 4) + ' ' + ccval.substr(8, 4) + ' ' + ccval.substr(12);
  }

  jsh.CustomFormatters.creditcard_decode = function (val) {
    if (val === null) return val;
    if (typeof val === 'undefined') return val;
    var rslt = (val.toString()||'').replace(/[^0-9]+/g, '');
    return rslt;
  }

  if(cb) return cb();
}

exports = module.exports = jsHarmonyTutorialsConfig;