
$.ajax('/_d/jsHarmonyTutorials/FormExec_API', {
  type: 'POST',
  dataType: 'json',
  success: function(rslt){
    $('.API_result').text(JSON.stringify(rslt,null,4));
  }
});
/*
//Alternative syntax using jsHarmony libraries
XForm.prototype.XExecutePost(xmodel.namespace+'FormExec_API', { }, function (rslt) {
  $('.API_result').text(JSON.stringify(rslt,null,4));
});
*/