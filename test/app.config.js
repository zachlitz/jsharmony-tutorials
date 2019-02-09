exports = module.exports = function(jsh, config, dbconfig){

  //Server Settings
  config.server.http_port = 8090;
  //config.server.https_port = 8081;
  //config.server.https_cert = 'path/to/https-cert.pem';
  //config.server.https_key = 'path/to/https-key.pem';
  //config.server.https_ca = 'path/to/https-ca.crt';
  config.frontsalt = "CaXH-~#wLf,iHk1c9x*Y[We}qxpc&Cm&-tZj#tV{H{(=A?(cnMs>6vV7NtM0";
    // console.log(path.dirname(require.main.filename));
    // config.appbasepath = path.dirname(__filename);
    // config.datadir = path.dirname(require.main.filename) + '/data/'; //Dynamic data folder (logs, temp files, user data)
    // config.datadir = path.join(path.dirname('C:/Users/dkomsa/js/fork-js-tutorials/test/app.test.js1') , 'data'); //Dynamic data folder (logs, temp files, user data)
  //jsHarmony Factory Configuration
  var configFactory = config.modules['jsHarmonyFactory'];
  
  configFactory.clientsalt = ">kWP*]pN}X-0wmldo7=9Pp(cvkhxk5!d9h=$O~D%WIjZbmEM666o.1Qysy82";
  configFactory.clientcookiesalt = "G>A}+o8{ah1c9rIKGP&yca^Ae*,7*Tbbc$n[33a>#i*s2oZ.Lq9zj3zM]Q&G";
  configFactory.mainsalt = "gR7?18.eMd3S3jVM6HI{.Xf$S,kN80nebM-5b{u4j$?Dwzngnk_d#p%cf<J{";
  configFactory.maincookiesalt = "ro_qes$M-K1K+NCIlwvjdFYw?(GU%c$D1[4}[I9Y0&xOZs}Zq,j8g>O~x(N#";
  
  config.onServerReady.push(function(cb, servers){
    var port = jsh.Config.server.http_port;
    if(jsh.Servers['default'] && jsh.Servers['default'].servers && jsh.Servers['default'].servers.length) port = jsh.Servers['default'].servers[0].address().port;
    jsh.def_screenshot_folder= '/test/screenshots/';
    jsh.Modules.jsHarmonyTutorials.generateScreenshots(function () {
        process.exit(0);
    });
    return cb();
  });
}
