/*
Copyright 2017 apHarmony

This file is part of jsHarmony.

jsHarmony is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

jsHarmony is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with this package.  If not, see <http://www.gnu.org/licenses/>.
*/

var jsHarmonyTutorials = function(jsh){
  this.jsh = jsh;
  this.tutorials = {};
  this.tutorialIDs = {};
  this.tutorialsMenu = {};
  this.tutorialsLOV = [];
}

jsHarmonyTutorials.prototype.Init = function(config){
  var _this = this;
  var jsh = _this.jsh;
  var $ = jsh.$;
  var _ = jsh._;
  var moment = jsh.moment;
  var XForm = jsh.XForm;
  var XExt = jsh.XExt;

  for(var key in config) if(key in _this) _this[key] = config[key];
  var tutorials = this.tutorials;
  var tutorialIDs = this.tutorialIDs;
  var tutorialsMenu = this.tutorialsMenu;
  var tutorialsLOV = this.tutorialsLOV;

  var curTutorial = null;

  function getAnchorID(txt){
    var rslt = (txt||'').toLowerCase().replace(/[\W_]+/g,' ').trim();
    rslt = rslt.replace(/ /g,'_');
    while(rslt.indexOf('__')>=0) rslt = rslt.replace(/\_\_/g,'_');
    return rslt;
  }

  function genTutorialsLOV(lov,menu,parentid){
    for(var f in menu){
      var node = {};
      node[jsh.uimap.codeid] = lov.length+1;
      node[jsh.uimap.codeparentid] = parentid;
      node[jsh.uimap.codeval] = f;
      node[jsh.uimap.codetxt] = f;
      node[jsh.uimap.codeicon] = 'folder';
      //node[jsh.uimap.codeseq] = lov.length+1;
      lov.push(node);
      if(menu[f]=='PAGE'){
        var tutobj = tutorials[f];
        node[jsh.uimap.codetxt] = tutobj.Title;
        node[jsh.uimap.codeicon] = 'file';
      }
      else {
        genTutorialsLOV(lov,menu[f],node[jsh.uimap.codeid]);
      }
    }
  }

  function onLayout(){
    var wh = $(window).height();
    var ww = $(window).width();
    var menupadding = XExt.getPadding(jsh.$root('.tutorials_menu'));
    var menuborder = XExt.getBorder(jsh.$root('.tutorials_menu'));
    var menuh = wh - jsh.$root(".xhead").height() - menupadding.top - menupadding.bottom - menuborder.top - menuborder.bottom;
    jsh.$root('.tutorials_menu').css('height',menuh+'px');

    var bodypadding = XExt.getPadding(jsh.$root('.tutorials_body'));
    var bodyborder = XExt.getBorder(jsh.$root('.tutorials_body'));
    var bodyh = wh - jsh.$root(".xhead").height() - bodypadding.top - bodypadding.bottom - bodyborder.top - bodyborder.bottom;
    jsh.$root('.tutorials_body').css('height',bodyh+'px');
    var bodyw = ww - bodypadding.left - bodypadding.right - bodyborder.left - bodyborder.right - jsh.$root('.tutorials_menu').outerWidth();
    jsh.$root('.tutorials_body').css('width',bodyw+'px');

    var tutorialpadding = XExt.getPadding(jsh.$root('.tutorial_tabs_body'));
    var tutorialborder = XExt.getBorder(jsh.$root('.tutorial_tabs_body'));
    var tutorialh = bodyh - jsh.$root('.tutorial_title').outerHeight() - jsh.$root('.tutorial_tabs').outerHeight();
    tutorialh = tutorialh - tutorialpadding.top - tutorialpadding.bottom - tutorialborder.top - tutorialborder.bottom;
    jsh.$root('.tutorial_tabs_body').css('height',tutorialh+'px');
  }

  _this.onTutorialSelected = function(nodeid, ctrl){
    var nodeidx = parseInt(nodeid)-1;
    var node = tutorialsLOV[nodeidx];
    var orignode = node;
    if(node[jsh.uimap['codeicon']]=='folder'){
      //Find first file in that folder
      for(;nodeidx<tutorialsLOV.length;nodeidx++){
        node = tutorialsLOV[nodeidx];
        if(node[jsh.uimap['codeicon']]=='file') break;
      }
      if(node[jsh.uimap['codeicon']]=='folder') return;
    }
    var nodectrl = jsh.$root('.tutorials_menu').find('.tree_item.tree_item_' + nodeid);
    if(nodectrl.length) XExt.scrollObjIntoView(jsh.$root('.tutorials_menu'), nodectrl);
    if(curTutorial && (curTutorial.id==orignode[jsh.uimap['codeval']])) return;
    _this.loadTutorial(node[jsh.uimap['codeval']]);
  }

  _this.loadTutorial = function(tutorial,options,cb){
    if(!options) options = {};
    XForm.prototype.XExecute('../_tutorials/'+tutorial,{}, function (rslt) {
      var config = rslt.config;
      if(typeof options.scrollTop != 'undefined') config.scrollTop = options.scrollTop;
      config.id = tutorial;
      var displayTitle = config.Title;
      //if(config.Menu) for(var i=config.Menu.length-1;i>=0;i--) displayTitle = config.Menu[i] + ' - ' + displayTitle;
      //Add History
      var url = '/tutorials/'+tutorial;
      var anchor = window.location.hash;
      if(anchor) url += anchor;
      
      document.title = 'Tutorial - '+displayTitle;
      if(!options.noHistory){
        XExt.AddHistory(url,config);
      }
      else {
        XExt.ReplaceHistory(url, config);
      }
      jsh.$root('.tutorial_tabs_body').scrollTop(0);
      curTutorial = config;
      curTutorial.Source = rslt.source;
      //Render Title
      jsh.$root('.tutorial_title').html(displayTitle);
      jsh.$root('.tutorial_tabs').show();
      //Render Tabs (Source, Demo)

      jsh.$root('.tutorial_tabs .left').show();
      jsh.$root('.tutorial_tabs .overview').show();

      if(config.Code && config.Code.length) jsh.$root('.tutorial_tabs a.code').show();
      else jsh.$root('.tutorial_tabs a.code').hide();

      if(config.Demo && config.Demo.length) jsh.$root('.tutorial_tabs a.demo').show();
      else jsh.$root('.tutorial_tabs a.demo').hide();

      //Add PRE tags to tutorials
      var body = rslt.data;
      body = body.replace(/<pre([^>]*)>([^]*?)<\/pre([^>]*)>/gi, function(match, pre_start, html, pre_end){
        html = XExt.ReplaceAll(html, "<", "&lt;");
        html = XExt.ReplaceAll(html, ">", "&gt;");
        return '<pre'+pre_start+'>'+html+'</pre'+pre_end+'>';
      });

      //Load Tutorial in Body
      jsh.$root('.tutorial_overview').html(body);

      //Create outline
      var outline_html = '';
      jsh.$root('.tutorial_overview').find('h1,h2,h3').each(function(){
        var jobj = $(this);
        if(jobj.closest('.tutorials_intro').length) return;
        var header_id = getAnchorID(jobj.text());
        jobj.before('<a class="tutorial_outline_anchor" name="'+header_id+'"></a>');
        var level = jobj.data('level');
        outline_html += '<li class="level'+level+'"><a href="#'+header_id+'">'+XExt.escapeHTML(jobj.text())+'</a></li>';
      });
      if(outline_html) jsh.$root('.tutorial_overview').prepend('<ul class="tutorial_outline">'+outline_html+'</ul>');
      jsh.$root('.tutorial_overview').prepend(jsh.$root('.tutorial_overview .tutorials_intro'));

      //Select tab
      jsh.$root('.tutorial_tabs a').removeClass('selected');
      if(jsh.$root('.tutorial_tabs a.overview').is(':visible')) _this.viewTutorialOverview();
      else if(jsh.$root('.tutorial_tabs a.code').is(':visible')) _this.viewTutorialCodeListing();
      
      //Change selected menu item + scroll into view if not visible
      for(var i=0;i<tutorialsLOV.length;i++){
        var node = tutorialsLOV[i];
        if(node[jsh.uimap['codeval']] == tutorial){
          XExt.TreeSelectNode(jsh.$root('.tutorials_menu'),node[jsh.uimap['codeval']])
          break;
        }
      }

      onLayout();
      if(typeof config.scrollTop !== 'undefined') jsh.$root('.tutorial_tabs_body').scrollTop(config.scrollTop);
      else if(anchor){
        var anchorpos = $('a[name='+anchor.substr(1)+']');
        if(anchorpos.length){
          jsh.$root('.tutorial_tabs_body').scrollTop(anchorpos.offset().top-jsh.$root('.tutorial_tabs_body').offset().top);
        }
      }

      if(cb) cb();
    });
  }

  _this.viewTutorialOverview = function(){
    jsh.$root('.tutorial_tabs a').removeClass('selected');
    jsh.$root('.tutorial_tabs a.overview').addClass('selected');
    jsh.$root('.tutorial_tabs_body').children().hide();
    jsh.$root('.tutorial_overview').show();
    jsh.$root('.tutorial_overview pre').each(function(){
      var jobj = $(this);
      var html = jobj.html();

      //Replace bracketes
      //html = XExt.ReplaceAll(html, "<", "&lt;");
      //html = XExt.ReplaceAll(html, ">", "&gt;");

      //Bring back styles
      if(jobj.not('.no_styles,.raw').length){
        html = XExt.ReplaceAll(html, "[i]", "<i>");
        html = XExt.ReplaceAll(html, "[/i]", "</i>");
        html = XExt.ReplaceAll(html, "[b]", "<b>");
        html = XExt.ReplaceAll(html, "[/b]", "</b>");
      }
      jobj.html(html);
    });
    jsh.$root('.tutorial_overview pre').not('.shell,.raw').each(function(i, block) {
      hljs.highlightBlock(block);
    });
    jsh.$root('.tutorial_overview span.curdt').text(moment.utc().format());
    jsh.$root('.tutorial_overview a').each(function(){
      var url = $(this).prop('href');
      if(url.substr(0,3)=='id:'){
        var turl = tutorialIDs[url.substr(3)];
        if(turl) $(this).on('click', function(e){ _this.loadTutorial(turl); e.preventDefault(); });
      }
    });

    onLayout();
  }

  _this.viewTutorialCodeListing = function(){
    jsh.$root('.tutorial_tabs a').removeClass('selected');
    jsh.$root('.tutorial_tabs a.code').addClass('selected');
    jsh.$root('.tutorial_tabs_body').children().hide();
    jsh.$root('.tutorial_code_listing').show();
    //Use template to render
    var ejssource = jsh.$root('.tutorial_code_listing_template').html();
    ejssource = ejssource.replace(/<#/g,'<%').replace(/#>/g,'%>')
    jsh.$root('.tutorial_code_listing').html(ejs.render(ejssource,{data:curTutorial,xejs:XExt.xejs,jsh:jsh}));
    onLayout();
  }

  _this.viewTutorialCode = function(idx){
    jsh.$root('.tutorial_tabs a').removeClass('selected');
    jsh.$root('.tutorial_tabs a.code').addClass('selected');
    jsh.$root('.tutorial_tabs_body').children().hide();
    jsh.$root('.tutorial_code').show();
    //Use template to render
    var filename = '';
    var source = '';
    if(curTutorial.Code && (curTutorial.Code.length > idx)){
      filename = curTutorial.Code[idx];
      source = curTutorial.Source[filename]||'';
    }
    var ejssource = jsh.$root('.tutorial_code_template').html();
    ejssource = ejssource.replace(/<#/g,'<%').replace(/#>/g,'%>')
    jsh.$root('.tutorial_code').html(ejs.render(ejssource,{data:{filename:filename,source:source},xejs:XExt.xejs,jsh:jsh}));
    jsh.$root('.tutorial_code_source').each(function(i, block) {
      hljs.highlightBlock(block);
    });
    onLayout();
  }

  _this.viewTutorialDemo = function(idx){
    var windowparams = curTutorial.Demo[idx].windowparams||'height=700,width=1000';
    window.open(curTutorial.Demo[idx].url,'_blank',windowparams);
  }

  _this.viewTutorialDemoListing = function(){
    if(!curTutorial.Demo.length) return;
    if(curTutorial.Demo.length==1){ _this.viewTutorialDemo(0); return; }

    jsh.$root('.tutorial_tabs a').removeClass('selected');
    jsh.$root('.tutorial_tabs a.demo').addClass('selected');
    jsh.$root('.tutorial_tabs_body').children().hide();
    jsh.$root('.tutorial_demo_listing').show();
    //Use template to render
    var ejssource = jsh.$root('.tutorial_demo_listing_template').html();
    ejssource = ejssource.replace(/<#/g,'<%').replace(/#>/g,'%>')
    jsh.$root('.tutorial_demo_listing').html(ejs.render(ejssource,{data:curTutorial,xejs:XExt.xejs,jsh:jsh}));
    onLayout();
  }

  _this.searchTutorials = function(query,options){
    if(!options) options = {};
    jsh.$root('.tutorial_title').text('Search Results - ' + query);
    jsh.$root('.tutorial_tabs_body').children().hide();
    jsh.$root('.tutorial_search_results').empty().show();
    jsh.$root('.tutorial_tabs').children().hide();
    XForm.prototype.XExecute('../_search',{ query: query }, function (rslt) {
      document.title = 'Tutorial - Search Results - ' + query;

      var url = '/search/?'+$.param({query:query});
      if(!options.noHistory) XExt.AddHistory(url,{});
      var ejssource = jsh.$root('.tutorial_search_results_template').html();
      ejssource = ejssource.replace(/<#/g,'<%').replace(/#>/g,'%>')
      jsh.$root('.tutorial_search_results').html(ejs.render(ejssource,{data:rslt,xejs:XExt.xejs,tutorials:tutorials,jsh:jsh}));
    });
    onLayout();
  }

  _this.saveScroll = function(){
    var scrollTop = jsh.$root('.tutorial_tabs_body').scrollTop();
    var curstate = history.state;
    if(!curstate) return;
    XExt.ReplaceHistory(window.location.href, _.extend(curstate,{ scrollTop: scrollTop }));
  }

  $(document).ready(function(){
    tutorialsLOV = [];
    genTutorialsLOV(tutorialsLOV,tutorialsMenu);
    XExt.TreeRender(jsh.$root('.tutorials_menu'), tutorialsLOV, 0);
    XExt.TreeExpandAll(jsh.$root('.tutorials_menu'));
    onLayout();

    var path = window.location.pathname;
    if(XExt.beginsWith(path,'/tutorials/')){
      var tutorial = path.substr(11);
      var scrollTop = undefined;
      if(history.state && (typeof history.state.scrollTop != 'undefined')) scrollTop = history.state.scrollTop;
      _this.loadTutorial(tutorial,{ noHistory: true, scrollTop: scrollTop }, function(){
        //On Complete
      });
    }
    else if(XExt.beginsWith(path,'/search/')){
      _this.searchTutorials(jsh._GET.query||'',{ noHistory: true });
    }

    jsh.$root('.tutorials_search .query').focus(function() { 
      var _this = this; 
      $(_this).select(); 
      if($(_this).val()=='Search') $(_this).val('');
    });
    jsh.$root('.tutorials_search .query').mouseup(function(e) { e.preventDefault(); return false; });
    jsh.$root('.tutorial_tabs_body').scroll(function(){ _this.saveScroll(); });
    $(window).resize(function(){ _this.saveScroll(); });
  });

  $(window).resize(onLayout);

  window.onpopstate = function(event){
    var state = event.state;
    var url = window.location.pathname;
    jsh._GET = XExt.parseGET();
    var scrollTop = undefined;
    if(state && ('scrollTop' in state)) scrollTop = state.scrollTop;
    if(state && state.config && state.config.id) _this.loadTutorial(state.config.id,{ noHistory: true, scrollTop: scrollTop });
    else if(url.indexOf('/search/')==0) _this.searchTutorials(jsh._GET.query||'',{ noHistory: true, scrollTop: scrollTop });
    else if(curTutorial && (url.indexOf('/tutorials/')==0) &&(curTutorial.id==url.substr(11))){ }
    else if(url.indexOf('/tutorials/')==0) _this.loadTutorial(url.substr(11),{ noHistory: true, scrollTop: scrollTop });
  }
}