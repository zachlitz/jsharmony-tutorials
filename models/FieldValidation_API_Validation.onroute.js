//(routetype, req, res, callback, require, jsh, modelid, params)

//Only process API backend requests: /_d/*
if(routetype != 'd') return callback();

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var async = require('async');
var Helper = require('../Helper.js');
var XValidate = jsh.XValidate;
var model = jsh.getModel(req, modelid);

var appsrv = jsh.AppSrv;
var dbtypes = appsrv.DB.types;

var verb = req.method.toLowerCase();
if (verb == 'post') {
  //Validate Parameters
  var Q = req.query;
  var P = req.body;

  //Validate the current user has the required access to the target Model
  if (!Helper.hasModelAction(req, model, 'U')) { Helper.GenError(req, res, -11, 'Invalid Model Access'); return; }

  //Validate querystring parameter names - should be empty
  if (!appsrv.ParamCheck('Q', Q, [])) { Helper.GenError(req, res, -4, 'Invalid Parameters'); return; }

  //Validate post body parameter names - should contain the required "message" parameter and optional "delay" parameter
  if (!appsrv.ParamCheck('P', P, ['&message','|delay'])) { return Helper.GenError(req, res, -4, 'Invalid Parameters'); }

  //Validate parameter data
  var validation = new XValidate();
  validation.AddValidator('_obj.message', 'Message', 'U', [XValidate._v_Required(), XValidate._v_MaxLength(50)]);
  validation.AddValidator('_obj.delay', 'Delay', 'U', [XValidate._v_IsNumeric(true), XValidate._v_MaxValue(10000)]);
  var validation_errors = validation.Validate('U', P);
  if (!_.isEmpty(validation_errors)) { return Helper.GenError(req, res, -2, _.flatMap(validation_errors).join('\n')); }

  var db = jsh.getDB('default');

  var customer = null;

  async.waterfall([

    //Select a random customer
    function(cb){
      appsrv.ExecRecordset(req._DBContext, "select c_name from c", [], {}, function(err, rslt){
        if(err) return cb(err);
        if(!rslt || !rslt.length || !rslt[0].length) return cb(err);
        var rnd = Math.floor(Math.random() * rslt[0].length);
        customer = rslt[0][rnd];
        return cb();
      });
    },

    //If a delay was requested, wait
    function(cb){
      if(!P.delay) return cb();
      else setTimeout(cb, parseInt(P.delay));
    }
  ], function(err){
    if(err) return Helper.GenError(req, res, -99999, err);

    //Return API result
    var message = (customer?customer.c_name:'System') + ' says ' + P.message;
    res.end(JSON.stringify({ '_success': 1, 'message': message }));
  });
}
else return callback();

