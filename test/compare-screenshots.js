// var assert = require('assert');
var gm = require('gm');
    // gm.options({imageMagick: true});
var should = require('should');
const fs = require("fs");
// before(function() {
//     console.log('before generate screenshots');
//
// });
let dir_path = 'public/screenshots';


describe('Compare Screenshots', function() {
    it('should directory: public/screenshots exist and have files', function() {
        fs.existsSync(dir_path).should.equal(true);
        fs.lstatSync(dir_path).isDirectory().should.equal(true);
        fs.readdirSync(dir_path).length.should.greaterThan(0);
    });
});
let path1 = 'C:/Users/dkomsa/js/fork-js-tutorials/public'+'/jsHarmonyFactory_H_action_update_h_id_1_Help_Administration_Edit.png';
let path2 = 'C:/Users/dkomsa/js/fork-js-tutorials/public'+'/jsHarmonyFactory_HL_Help_Administration_Listing.png';


describe('Compare Screenshots2', function() {
    describe('directory present', function() {
        it('should return -1 when the value is not present', function() {

            var options = {
                highlightColor: 'yellow', // optional. Defaults to red
                file: 'C:/Users/dkomsa/js/fork-js-tutorials/public'+'/diff.png' // required
            };
            // gm.compare(path1, path2, options, function (err) {
            //     if (err) throw err;
            // });
            // console.log(gm.compare(path1,path2,(err, isEqual, equality, raw) => {
            //     console.log('teeeee');
            //     if (err) throw err;
            //     isEqual.should.equal(true);
            //     console.log('The images are equal: %s', isEqual);
            //     console.log('Actual equality: %d', equality);
            //     console.log('Raw output was: %j', raw);
            //     return isEqual;
            // }));
        });
    });
});

// describe('Array', function() {
//     describe('#indexOf()', function() {
//         it('should return -1 when the value is not present', function() {
//             [1,2,3].indexOf(5).should.equal(-1);
//             [1,2,3].indexOf(0).should.equal(-1);
//         });
//     });
// });