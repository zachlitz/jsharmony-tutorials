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
}

jsHarmonyTutorialsConfig.prototype = new jsHarmonyConfig.Base();

jsHarmonyTutorialsConfig.prototype.Init = function(cb, jsh){

  jsh.Config.system_settings.allow_insecure_http_encryption = true;
  jsh.Config.debug_params.db_requests = false;

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

  if(cb) return cb();
}

exports = module.exports = jsHarmonyTutorialsConfig;