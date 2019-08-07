jsh.App[modelid] = new (function(){
  var _this = this;

  this.LOV_search = function(popupmodelid, parentmodelid, fieldid, onComplete){
    //Filter out current customer ID
    var popupmodel = jsh.XModels[popupmodelid];
    var cust_id = xmodel.get('cust_id');
    if(cust_id){
      //Search by the C_IDs
      popupmodel.controller.SetSearch([new jsh.XSearch.SearchItem('cust_id', cust_id.toString(), 'or', '<>')], true);
    }
    onComplete();
  }
  
})();