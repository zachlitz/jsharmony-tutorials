// var assert = require('assert');
var gm = require('gm');
// var imageMagick = gm.subClass({ imageMagick: true });
let path1 = 'C:/Users/dkomsa/js/fork-js-tutorials/public'+'/jsHarmonyFactory_H_action_update_h_id_1_Help_Administration_Edit.png';
let path2 = 'C:/Users/dkomsa/js/fork-js-tutorials/public'+'/jsHarmonyFactory_HL_Help_Administration_Listing.png';
// var options = {
//     highlightColor: 'yellow', // optional. Defaults to red
//     file: 'C:/Users/dkomsa/js/fork-js-tutorials/public'+'/diff.png' // required
// };
// gm.compare(path1, path2, options, function (err) {
//     if (err) throw err;
// });

gm.compare(path1, path2, function (err, isEqual, equality, raw) {
    // if (err) throw err;
    console.log('The images are equal: %s', isEqual);
    console.log('Actual equality: %d', equality)
    console.log('Raw output was: %j', raw);
});