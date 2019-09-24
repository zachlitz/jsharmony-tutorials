jsh.App[modelid] = new (function(){
  var _this = this;

  this.invoke_click = function(){

    //Define data object for validation
    var data = { 
      message: xmodel.get('message'), 
      delay: xmodel.get('delay') 
    };

    //Initialize custom client-side validator
    var validation = new XValidate(jshInstance);

    //Define validators
    validation.AddControlValidator('.message.xelem'+xmodel.class, '_obj.message', 'Message', 'U', [ XValidate._v_Required(), XValidate._v_MaxLength(50) ]);
    validation.AddControlValidator('.delay.xelem'+xmodel.class, '_obj.delay', 'Delay', 'U', [ XValidate._v_IsNumeric(true), XValidate._v_MaxValue(10000) ]);

    //Execute validation on "data" object, and stop running function if it fails
    //"ValidateControls" will automatically display an error message and switch focus to the error field on failure
    if(!validation.ValidateControls('U', data)) return;

    //++ Validation Passed

    //Execute API call
    XForm.Post(
      xmodel.namespace + 'FieldValidation_API', 
      {},
      data, 
      function(rslt){ 
        //Display the resulting JSON in a dialog box
        XExt.Alert(JSON.stringify(rslt)); 
      }
    );
  }

})();
