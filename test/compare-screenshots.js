var gm = require('gm');
var imageMagick = gm.subClass({ imageMagick: true });
var im = imageMagick();
const fs = require("fs");
const path = require("path");
const ejs = require('ejs');
const assert = require('assert');
var async = require('async');
var HelperFS = require('jsharmony/HelperFS');
const test_dir = path.dirname(__filename);
const data_dir = path.join(test_dir,'test-app','data');
const result_file = path.join(test_dir,'comparing-screenshots-test.html');
let live_screenshots_path = path.join(test_dir,'..','public','screenshots');
let test_screenshots_path = path.join(test_dir,'screenshots');
let diff_screenshots_path = path.join(test_dir,'diff_screenshots');
let global_test_state = 'passed';

afterEach(function() {
  if (this.currentTest.state === 'failed') {
    global_test_state = 'failed';
  }
});

before(function(done) {
  this.timeout(600000); // set test timeout long process to generate screenshots
  console.log('\n\rBefore Test global');
  HelperFS.createFolderIfNotExistsSync(data_dir);
  HelperFS.rmdirRecursiveSync(test_screenshots_path);
  HelperFS.createFolderIfNotExistsSync(test_screenshots_path);
  HelperFS.rmdirRecursiveSync(diff_screenshots_path);
  HelperFS.createFolderIfNotExistsSync(diff_screenshots_path);
  start_harmony(done);
});

after(function () {
  console.log('after Global tests. State: '+ global_test_state);
  if (global_test_state === 'passed') {
    HelperFS.rmdirRecursiveSync(data_dir);
    HelperFS.rmdirRecursiveSync(test_screenshots_path);
    HelperFS.rmdirRecursiveSync(diff_screenshots_path);
    HelperFS.rmdirRecursiveSync(path.join(test_dir,'test-app','models'));
  }
});




describe('Compare Screenshots', function() {
  it('should directory: public/screenshots exist and have files', function() {
    checkDirectory(live_screenshots_path);
  });

  it('should directory: test/screenshots exist and have files', function() {
    checkDirectory(test_screenshots_path);
  });

  // wait for done to be called (compares 5 images at the time)
  it.skip('should existing and generated images be equal DONE', function(done) {
    this.timeout(60000);
    let files = fs.readdirSync(live_screenshots_path);
    console.log('# of existing images to test '+files.length);
    console.log('# of generated images to test '+fs.readdirSync(test_screenshots_path).length);
    let failImages = [];
    async.eachLimit(
      files,
      5,
      function(imageName,callback){
        compareScreenshots(imageName,0.01).then(function (isEqual) {
          // console.log('isEqual: '+isEqual);
          if (!isEqual){
            failImages.push({name:imageName,reason: 'Images not the same.'});
          }
          callback(null,failImages);
        }).catch(function (err) {
          failImages.push({name:imageName,reason:'New image not exist'});
          callback(null,failImages);
        });
      }
      ,function (err) {
        if(err){
          done(new Error('Comparison fails. Error:'+er));
        }else{
          if(failImages.length == 0) return done();
          else{
            console.log('# of fail images(not generated and not the same): '+failImages.length);
            generateFailImagesResultPage(failImages).then(
              function (html) {
                fs.writeFile(result_file, html,{}, function(err, data){
                  if (err) console.log(err);
                  console.log("Result successfully written to File.");
                  done(new Error('Some fails. Please check : '+result_file));
                });
              }
            ).catch(function (er) {
              done(new Error('Some fails, but can\'t generate errors file. Error:'+er));
            });
          }
        }
      }
    )
  });

  // waits for return of promise (compares elem in sync way)
  it('should existing and generated images be equal ASYNC', function(done) {
    this.timeout(600000);
    let files = fs.readdirSync(live_screenshots_path);
    console.log('# of existing images to test '+files.length);
    console.log('# of generated images to test '+fs.readdirSync(test_screenshots_path).length);
    let failImages = [];
    async.eachLimit(files, 5, function(imageName, file_cb){
      if(!fs.existsSync(path.join(test_screenshots_path,imageName))){
        failImages[imageName]={name:imageName,reason:'New image not exist'};
        return file_cb();
      }
      compareScreenshots(imageName,0.01).then(function(isEqual){
        if (!isEqual){
          failImages[imageName]={name:imageName,reason: 'Images not the same.'};
          return compareScreenshots(imageName,{file: path.join(diff_screenshots_path,imageName)}).then(function(){ return file_cb(); });
        }
        else return file_cb();
      }).catch(function(e){
        failImages[imageName]={name:imageName, reason: 'Comparing Error: '+e.toString()};
        compareScreenshots(imageName,{file: path.join(diff_screenshots_path,imageName)}).then(function(){ return file_cb(); }).catch(function(e){ return file_cb(); });
      });
    }, function(err){
      console.log('# fail: '+Object.keys(failImages).length);

      generateFailImagesResultPage(failImages).then(function(html){
        fs.writeFile(result_file, html, function(err, data){
          if (err) console.log(err);
          console.log("Successfully Written to File.");
        });
        assert(Object.keys(failImages).length==0,"Where "+Object.keys(failImages).length+" generated images not equal. <a href='"+result_file+"' >here</a>");
        return done();
      }).catch(done);
    });
  });
});

function checkDirectory(dir_name) {
  assert(fs.existsSync(dir_name),'Directory: '+dir_name+' not exist');
  assert(fs.lstatSync(dir_name).isDirectory(),'Path: '+dir_name+' not directory');
  assert(fs.readdirSync(dir_name).length > 0,'Directory: '+dir_name+' is empty');
}

function generateFailImagesResultPage(failImages){
  return new Promise((resolve,reject)=>{
    ejs.renderFile(
      path.join(test_dir,'/views/test_results.ejs'),
      {
        live_screenshots_path:live_screenshots_path,
        regenerated_screenshots_path: test_screenshots_path,
        diff_screenshots_path:diff_screenshots_path,
        failImages: failImages,
      },
      {async:false},
      function(err, str){
        if(err)reject(err);
        resolve(str);
      }
    );
  })
}



function gmCompareImagesWrapper(srcpath, cmppath, options) {
  return new Promise((resolve, reject)=> {
    //Resized version of cmppath, to be the same size as srcpath
    let cmppath_srcsize = cmppath+'.srcsize.png';
    //Compare function
    let fcmp = function(_cmppath){
      if(!_cmppath) _cmppath = cmppath;
      im.compare(srcpath, _cmppath, options, function (err, isEqual, equality, raw) {
        if (err) return reject(err);
        return resolve(isEqual);
      });
    }
    //Check for differences without generating a difference image
    if(!options.file) return fcmp();
    else{
      try{
        //Get sizes of srcpath and cmppath
        var img1 = imageMagick(srcpath);
        var img2 = imageMagick(cmppath);
        img1.size(function(err,size1){
          if(err) return reject(err);
          img2.size(function(err,size2){
            if(err) return reject(err);
            //If srcpath and cmppath are the same size, generate the difference image
            if((size1.width==size2.width) && (size1.height==size2.height)) return fcmp();
            //Crop cmppath to be the same as srcpath, and save to cmppath_srcsize
            img2.autoOrient();
            img2.crop(size1.width,size1.height,0,0);
            img2.extent(size1.width,size1.height);
            img2.repage(0, 0, 0, 0);
            img2.noProfile().write(cmppath_srcsize, function(err){
              if(err) console.log(err);
              if(err) return reject(err);
              img2 = imageMagick(cmppath_srcsize);
              //Make sure that cmppath_srcsize is the same size as srcsize
              img2.size(function(err,size2){
                if(err) return reject(err);
                //Generate the difference image
                if((size1.width==size2.width) && (size1.height==size2.height)) return fcmp(cmppath_srcsize);
                return reject(new Error('Sizes still not the same after resize'));
              });
            });
          });
        });
      }
      catch(ex){
        return reject(ex);
      }
    }
  })
}

function start_harmony(cb) {
  // var jsHarmonyTutorials = require('./../jsHarmonyTutorials.js');
  var jsHarmonyTutorials = require('./../index.js');
  var jsh = new jsHarmonyTutorials.Application();
  jsh.Config.appbasepath = path.join(__dirname,'test-app');
  jsh.Run();
  jsh.Config.onServerReady.push(function () {
    jsh.Modules.jsHarmonyTutorials.generateScreenshots({screenshot_folder:'/test/screenshots/'},function () {
      jsh.Servers['default'].Close();
      jsh.Servers = {};
      cb();
    });
  });
}

function compareScreenshots(imageName, options) {
  return gmCompareImagesWrapper(live_screenshots_path+'/'+imageName,test_screenshots_path+'/'+imageName,options)
}