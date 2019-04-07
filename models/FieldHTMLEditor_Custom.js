jsh.App[modelid] = new (function(){
  var _this = this;

  //On form load
  this.onload = function(xmodel,callback){
    _this.render_c_desc_editor();
  }

  //On drop-down value change
  this.c_desc_editor_type_change = function(obj,newval,e){
    _this.render_c_desc_editor();
  }

  this.render_c_desc_editor = function(){
    //Get the value of the dropdown
    var c_desc_editor_type = xmodel.get('c_desc_editor_type');

    if(c_desc_editor_type=='HTML'){
      //If we should render an HTML editor
      //Add an "id" attribute to the c_desc textarea, because it does not have one by default
      $('.c_desc.xelem'+xmodel.class).attr('id',xmodel.class+'_c_desc');
      //Initialize the editor on the c_desc textarea
      XExt.CKEditor(xmodel.class+'_c_desc');
    }
    else {
      //Otherwise, remove the CKEditor if it is currently displayed
      //Get the CKEditor object
      var editor_id = xmodel.class+'_c_desc';
      var editor = (window.CKEDITOR?window.CKEDITOR.instances[editor_id]:undefined);
      if(editor){
        //Remove the editor
        editor.destroy();
      }
    }
  }

})();
