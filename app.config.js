exports = module.exports = function (jsh, config, dbconfig) {

  //Server Settings
  //config.server.http_port = 8080;
  //config.server.https_port = 8081;
  //config.server.https_cert = 'path/to/https-cert.pem';
  //config.server.https_key = 'path/to/https-key.pem';
  //config.server.https_ca = 'path/to/https-ca.crt';
  config.frontsalt = "n0O=%WTqW<vjfv{3RP&Hbg&Ws~~7.GWneURkISFYD9#MCwx}p+R!NJ15O*ai";

  config.system_settings.ignore_imagemagick = true;

  //jsHarmony Factory Configuration
  var configFactory = config.modules['jsHarmonyFactory'];

  configFactory.clientsalt = "o(]Y$]TQ|&^T0G?,Zy*quD9@w*.35_wbr,}UK(C]+N_@GeC!2)Ta1m8YQVgL";
  configFactory.clientcookiesalt = "l{EjPETw.4~ON6,^5DW|1VEod[FDK{MTorfSka-%%q[CS3UEMLQ_NGV9rlLK";
  configFactory.mainsalt = "cmWxvUWt^i5,0[G6V1[m%_cKMBEYZnS&4]0(g(935c?7i@b3RmZO-{cY&LYu";
  configFactory.maincookiesalt = "Wdbj3_{4mz6j~)u&p|B_rO{8rCqAr*_+tP.ss5H*rtLGux{.IX<9Tjm,&7QR";

  config.onServerReady.push(function (cb, servers) {
      var port = jsh.Config.server.http_port;
      if (jsh.Servers['default'] && jsh.Servers['default'].servers && jsh.Servers['default'].servers.length) port = jsh.Servers['default'].servers[0].address().port;
      console.log(`http://localhost:${port}/`)
      return cb();
  });
}
