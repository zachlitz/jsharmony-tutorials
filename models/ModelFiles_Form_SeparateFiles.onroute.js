//Parameters: (routetype, req, res, callback, require, jsh, modelid, params)
(function(){
  //Clone the base model
  var model = jsh.getModelClone(req, modelid);

  //Update the model
  model.title = 'Title Override';

  //Save model to current request
  req.jshlocal.Models[modelid] = model;

  //Continue processing
  return callback();
})();