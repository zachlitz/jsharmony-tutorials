var gm = require('gm');
var imageMagick = gm.subClass({ imageMagick: true });
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
let regenerated_screenshots_path = path.join(test_dir,'screenshots');
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
  HelperFS.rmdirRecursiveSync(regenerated_screenshots_path);
  HelperFS.createFolderIfNotExistsSync(regenerated_screenshots_path);
  HelperFS.rmdirRecursiveSync(diff_screenshots_path);
  HelperFS.createFolderIfNotExistsSync(diff_screenshots_path);
  var cp = require('child_process');
  var n = cp.fork(test_dir + '/test-app/app.test.js');
  n.addListener('exit',function (err) {
    var m= 'Finished Image Generation';
    if (err){
      m+= ' with Error: '+ err.toString();
      done(new Error(m));
    }else{
      console.log(m);
      done();
    }
  });
});

after(function () {
  console.log('after');
  if (global_test_state === 'passed') {
    HelperFS.rmdirRecursiveSync(data_dir);
    HelperFS.rmdirRecursiveSync(regenerated_screenshots_path);
    HelperFS.rmdirRecursiveSync(diff_screenshots_path);
    HelperFS.rmdirRecursiveSync(path.join(test_dir,'test-app','models'));
  }
});


describe('Compare Screenshots', function() {
  it('should directory: public/screenshots exist and have files', async function() {
    await checkDirectory(live_screenshots_path)
  });

  it('should existing and generated images be equal', async function() {
    this.timeout(600000);
    let isImagesEqual=false;
    let files = fs.readdirSync(live_screenshots_path);
    console.log('# of existing images to test '+files.length);
    console.log('# of generated images to test '+fs.readdirSync(regenerated_screenshots_path).length);
    let imageName='';
    let failImages = [];
    for( let i=0; i<files.length; i++){
      isImagesEqual=false;
      imageName = files[i];
      if(!fs.existsSync(path.join(regenerated_screenshots_path,imageName))){
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
    Object.keys(failImages).length.should
      .lessThan(
        1,
        "Where "+Object.keys(failImages).length+" generated images not equal. <a href='"+result_file+"' >here</a>"
    );
  });
});

async function checkDirectory(dir_name) {
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
        regenerated_screenshots_path: regenerated_screenshots_path,
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

async function compareScreenshots(imageName, options) {
  return await gmCompareImagesWrapper(live_screenshots_path+'/'+imageName,regenerated_screenshots_path+'/'+imageName,options)
}

function gmCompareImagesWrapper(path1, path2, options) {
  return new Promise((resolve, reject)=> {
    imageMagick().compare(path1, path2, options, function (err, isEqual, equality, raw) {
      if (err) reject(err);
// console.log('The images are equal: %s', isEqual);
// console.log('Actual equality: %d', equality);
// console.log('Raw output was: %j', raw);
      return resolve(isEqual);
    });
  })
}