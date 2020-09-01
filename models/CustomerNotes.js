jsh.App[modelid] = new (function(){

  this.ondestroy = function() {
      if (typeof model.onDestroy == 'function') {
          model.onDestroy();
      }
  }

  this.oninit = function() {
      ReactModelLoader.loadModel('customerNotes').then(data => {
          const model = new data({
              xExt: XExt,
              xForm: XForm,
              xModel: xmodel
          });
          if (typeof model.onInit === 'function') {
              model.onInit();
          }
      });
  }

  class ReactModelLoader {
    static async loadModel(name) {
        await this.loadScript(`/react-model-js/${name}.js`);
        const module = window[`${name}.model`];
        if (module == undefined) {
            throw new Error(`Module ${name} is not found`);
        }
        return module.default;
    }

    static async loadScript(src) {
        return new Promise(resolve => {
            var script = document.createElement('script');
            script.onload = () => resolve();
            script.src = src;
            document.head.appendChild(script);
        });
    }
  }
});