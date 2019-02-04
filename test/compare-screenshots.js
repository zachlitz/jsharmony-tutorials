var gm = require('gm');
var imageMagick = gm.subClass({ imageMagick: true });
var should = require('should');
const fs = require("fs");
// before(function() {
//     console.log('before generate screenshots');
//
// });
let live_screenshots_path = 'public/screenshots';
let regenerated_screenshots_path = 'test/screenshots';
let full_path_live = __dirname+'/../'+live_screenshots_path;
let full_path_regenerated = __dirname+'/../'+regenerated_screenshots_path;

describe('Compare Screenshots', function() {
    it('should directory: public/screenshots exist and have files', async function() {
        await checkDirectory(live_screenshots_path)
    });

    it('should directory: test/screenshots exist and have files', async function() {
        await checkDirectory(full_path_regenerated)
    });

    it('should existing and generated images be equal', async function() {
        let isImagesEqual=false;
        let files = fs.readdirSync(live_screenshots_path);
        let imageName='';
        for( let i=0; i<files.length; i++){
            isImagesEqual=false;
            imageName = files[i];
            let message='Compared Image "'+imageName+'" not the same.';
            try {
                isImagesEqual = await compareScreenshots(imageName,0);
            }catch (e) {
                message = 'Comparing Error: '+e.toString();
            }
            isImagesEqual.should.equal(true,message);
        }
    });
});

async function checkDirectory(dir_name) {
    fs.existsSync(dir_name).should.equal(true,'Directory: '+dir_name+' not exist');
    fs.lstatSync(dir_name).isDirectory().should.equal(true,'Path: '+dir_name+' not directory');
    fs.readdirSync(dir_name).length.should.greaterThan(0,'Directory: '+dir_name+' is empty');
}

async function compareScreenshots(imageName, options) {
    return await gmCompareImagesWrapper(full_path_live+'/'+imageName,full_path_regenerated+'/'+imageName,options)
}

function gmCompareImagesWrapper(path1, path2, options) {
    return new Promise((resolve, reject)=> {
        imageMagick().compare(path1, path2, 0, function (err, isEqual, equality, raw) {
            if (err) reject(err);
            // console.log('The images are equal: %s', isEqual);
            // console.log('Actual equality: %d', equality);
            // console.log('Raw output was: %j', raw);
            return resolve(isEqual);
        });
    })
}