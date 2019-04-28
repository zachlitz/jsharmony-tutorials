(function(jsh){
  var XExt = jsh.XExt;
  var XForm = jsh.XForm;

  jsh.XPage.CustomShortcutKeys = function(e){
    var chr = String.fromCharCode(e.which);
    if ((chr == 'C') && (e.altKey)) {//ALT+C = OPEN CUSTOMER LAUNCHER
      XExt.popupForm('jsHarmonyTutorials/FieldUnbound_Launcher','update');
      return true;
    }
    return false;
  }

})(jshInstance);