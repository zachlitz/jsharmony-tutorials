var gm = require('gm');
var imageMagick = gm.subClass({ imageMagick: true });
var im = imageMagick();
var should = require('should');
const fs = require("fs");
const path = require("path");
const ejs = require('ejs');
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
  it('should directory: public/screenshots exist and have files', async function() {
    checkDirectory(live_screenshots_path)
  });

  it('should directory: test/screenshots exist and have files', async function() {
    checkDirectory(test_screenshots_path)
  });

  // waits for don to be called (compares 5 images at the time)
  it('should existing and generated images be equal DONE', function(done) {
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
      ,function (er) {
        if(er){
          done(new Error('Comparison fails. Error:'+er));
        }else{
          try {
            failImages.length.should.lessThan(1);
            done();
          }catch (e) {
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
  it('should existing and generated images be equal ASYNC', async function() {
    this.timeout(600000);
    let isImagesEqual=false;
    let files = fs.readdirSync(live_screenshots_path);
    console.log('# of existing images to test '+files.length);
    console.log('# of generated images to test '+fs.readdirSync(test_screenshots_path).length);
    let imageName='';
    let failImages = [];
    for( let i=0; i<files.length; i++){
      isImagesEqual=false;
      imageName = files[i];
      if(!fs.existsSync(path.join(test_screenshots_path,imageName))){
        failImages[imageName]={name:imageName,reason:'New image not exist'};
        continue;
      }
      try {
        isImagesEqual = await compareScreenshots(imageName,0.01);
        if (!isImagesEqual){
          failImages[imageName]={name:imageName,reason: 'Images not the same.'};
          await compareScreenshots(imageName,{file: path.join(diff_screenshots_path,imageName)})
        }
      }catch (e) {
        failImages[imageName]={name:imageName, reason: 'Comparing Error: '+e.toString()};
      }
    }
    let html = await generateFailImagesResultPage(failImages);
    fs.writeFile(result_file, html, function(err, data){
      if (err) console.log(err);
      console.log("Successfully Written to File.");
    });
    return Object.keys(failImages).length.should
      .lessThan(
        1,
        "Where "+Object.keys(failImages).length+" generated images not equal. <a href='"+result_file+"' >here</a>"
      );
  });
});

function checkDirectory(dir_name) {
  fs.existsSync(dir_name).should.equal(true,'Directory: '+dir_name+' not exist');
  fs.lstatSync(dir_name).isDirectory().should.equal(true,'Path: '+dir_name+' not directory');
  fs.readdirSync(dir_name).length.should.greaterThan(0,'Directory: '+dir_name+' is empty');
}

async function generateFailImagesResultPage(failImages){
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



function gmCompareImagesWrapper(path1, path2, options) {
  return new Promise((resolve, reject)=> {
    im.compare(path1, path2, options, function (err, isEqual, equality, raw) {
      if (err) reject(err);
// console.log('The images are equal: %s', isEqual);
// console.log('Actual equality: %d', equality);
// console.log('Raw output was: %j', raw);
      return resolve(isEqual);
    });
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
      jsh={};
      cb();
    });
  });
}

async function compareScreenshots(imageName, options) {
  var r = await gmCompareImagesWrapper(live_screenshots_path+'/'+imageName,test_screenshots_path+'/'+imageName,options)
  return r;
}
