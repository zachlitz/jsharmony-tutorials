exports = module.exports = function(jsh, config, dbconfig){

  //Server Settings
  config.server.http_port = 8090;
  config.frontsalt = "CaXH-~#wLf,iHk1c9x*Y[We}qxpc&Cm&-tZj#tV{H{(=A?(cnMs>6vV7NtM0";
  //jsHarmony Factory Configuration
  var configFactory = config.modules['jsHarmonyFactory'];
  
  configFactory.clientsalt = ">kWP*]pN}X-0wmldo7=9Pp(cvkhxk5!d9h=$O~D%WIjZbmEM666o.1Qysy82";
  configFactory.clientcookiesalt = "G>A}+o8{ah1c9rIKGP&yca^Ae*,7*Tbbc$n[33a>#i*s2oZ.Lq9zj3zM]Q&G";
  configFactory.mainsalt = "gR7?18.eMd3S3jVM6HI{.Xf$S,kN80nebM-5b{u4j$?Dwzngnk_d#p%cf<J{";
  configFactory.maincookiesalt = "ro_qes$M-K1K+NCIlwvjdFYw?(GU%c$D1[4}[I9Y0&xOZs}Zq,j8g>O~x(N#";
}
