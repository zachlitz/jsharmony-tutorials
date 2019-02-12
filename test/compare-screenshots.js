var gm = require('gm');
var imageMagick = gm.subClass({ imageMagick: true });
var should = require('should');
const fs = require("fs");
const path = require("path");
var test_dir = path.dirname(__filename);
var data_dir = path.join(test_dir+'/data');
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
  create_dir(data_dir);
  create_dir(regenerated_screenshots_path);
  delete_directory(diff_screenshots_path);
  create_dir(diff_screenshots_path);
  var cp = require('child_process');
  var n = cp.fork(test_dir + '/app.test.js');
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
  // n.addListener('error',function (err) {
  //   var m= 'Finished Image Generation';
  //   if (err) m+= ' with Error: '+ err.toString();
  //   console.log(m);
  //   done(new Error(m));
  // });

});

after(function () {
  console.log('after');
  if (global_test_state === 'passed') {
    delete_directory(data_dir);
    delete_directory(regenerated_screenshots_path);
    delete_directory(diff_screenshots_path);
    delete_directory(path.join(test_dir,'models'));
  }
});


describe('Compare Screenshots', function() {
  it('should directory: public/screenshots exist and have files', async function() {
    await checkDirectory(live_screenshots_path)
  });

  // it('should directory: test/screenshots exist and have files', async function() {
  //   await checkDirectory(regenerated_screenshots_path)
  // });

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

        // .should.equal(true,'File: '+imageName+' not exist');
      let message='Compared Image "'+imageName+'" not the same.';
      try {
        isImagesEqual = await compareScreenshots(imageName,0.01);
        if (!isImagesEqual){
          failImages[imageName]={name:imageName,reason: 'Images not the same.'};
          await compareScreenshots(imageName,{file: path.join(diff_screenshots_path,imageName)})
        }
      }catch (e) {
        failImages[imageName]={name:imageName, reason: 'Comparing Error: '+e.toString()};
        // message = 'Comparing Error: '+e.toString();
      }

    }
    // console.log(failImages);
    await generateFailImagesResultPage(failImages);

    Object.keys(failImages).length.should
      .lessThan(
        1,
        "Where "+Object.keys(failImages).length+" generated images not equal. <a href='"+path.join(test_dir,'..','public','comparing-screenshots-test.html')+"' >here</a>"
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
    let imagesHtml = '';
    for(const key in failImages){
      // console.log(image.name);
      console.log(failImages[key].reason);
      imagesHtml += handleFailImage(failImages[key]);
    }
    resolve(imagesHtml);
  })
}

async function handleFailImage(img){
  return new Promise((resolve, reject)=>{
    let h = img.name+'<img src="'+'C:/wk/fork-jsharmony-tutorials/public/'+img.name+'">';
    resolve(h);
  });
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

function delete_directory(dir_path) {
  if (fs.existsSync(dir_path)) {
    fs.readdirSync(dir_path).forEach(function(entry) {
      var entry_path = path.join(dir_path, entry);
      if (fs.lstatSync(entry_path).isDirectory()) {
        delete_directory(entry_path);
      } else {
        fs.unlinkSync(entry_path);
      }
    });
    fs.rmdirSync(dir_path);
  }
}

function create_dir(dir) {
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
}