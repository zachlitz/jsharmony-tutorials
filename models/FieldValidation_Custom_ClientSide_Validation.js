jsh.App[modelid] = new (function(){
  var _this = this;

  this.invoke_click = function(){

    //Data for validation
    var data = { 
      message: xmodel.get('message'), 
      delay: xmodel.get('delay') 
    };

    //Initialize custom client-side validator
    var validation = new XValidate(jshInstance);

    //Add validators for each property
    validation.AddControlValidator(
      '.message.xelem'+xmodel.class, //Control selector
      '_obj.message',                //Property in object being validated
      'Message',                     //Caption
      'U',                           //Actions where validator should run
      [                              //Array of validators
        XValidate._v_Required(),
        XValidate._v_MaxLength(50)
      ]
    );
    validation.AddControlValidator(
      '.delay.xelem'+xmodel.class,   //Control selector
      '_obj.delay',                  //Property in object being validated
      'Delay',                       //Caption
      'U',                           //Actions where validator should run
      [                              //Array of validators
        XValidate._v_IsNumeric(true),
        XValidate._v_MaxValue(10000)
      ]
    );

    //Execute validation on "data" object, and stop running function if it fails
    //"ValidateControls" will display an error message and switch focus to the error field on failure
    if(!validation.ValidateControls('U', data)) return;

    //Execute API call
    XForm.Post(
      xmodel.namespace + 'FieldValidation_API_Validation', 
      data, 
      function(rslt){ 
        XExt.Alert(JSON.stringify(rslt)); 
      }
    );
  }

})();
