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

var curTutorial = null;

function genTutorialsLOV(lov,menu,parentid){
  for(var f in menu){
    var node = {};
    node[window.jshuimap.codeid] = lov.length+1;
    node[window.jshuimap.codeparentid] = parentid;
    node[window.jshuimap.codeval] = f;
    node[window.jshuimap.codetxt] = f;
    node[window.jshuimap.codeicon] = 'folder';
    //node[window.jshuimap.codeseq] = lov.length+1;
    lov.push(node);
    if(menu[f]=='PAGE'){
      var tutobj = tutorials[f];
      node[window.jshuimap.codetxt] = tutobj.Title;
      node[window.jshuimap.codeicon] = 'file';
    }
    else {
      genTutorialsLOV(lov,menu[f],node[window.jshuimap.codeid]);
    }
  }
}

function onLayout(){
  var wh = $(window).height();
  var ww = $(window).width();
  var menupadding = XExt.getPadding($('#tutorials_menu'));
  var menuborder = XExt.getBorder($('#tutorials_menu'));
  var menuh = wh - $("#xhead").height() - menupadding.top - menupadding.bottom - menuborder.top - menuborder.bottom;
  $('#tutorials_menu').css('height',menuh+'px');

  var bodypadding = XExt.getPadding($('#tutorials_body'));
  var bodyborder = XExt.getBorder($('#tutorials_body'));
  var bodyh = wh - $("#xhead").height() - bodypadding.top - bodypadding.bottom - bodyborder.top - bodyborder.bottom;
  $('#tutorials_body').css('height',bodyh+'px');
  var bodyw = ww - bodypadding.left - bodypadding.right - bodyborder.left - bodyborder.right - $('#tutorials_menu').outerWidth();
  $('#tutorials_body').css('width',bodyw+'px');

  var tutorialpadding = XExt.getPadding($('#tutorial_tabs_body'));
  var tutorialborder = XExt.getBorder($('#tutorial_tabs_body'));
  var tutorialh = bodyh - $('#tutorial_title').outerHeight() - $('#tutorial_tabs').outerHeight();
  tutorialh = tutorialh - tutorialpadding.top - tutorialpadding.bottom - tutorialborder.top - tutorialborder.bottom;
  $('#tutorial_tabs_body').css('height',tutorialh+'px');
}

function onTutorialSelected(nodeid, ctrl){
  var nodeidx = parseInt(nodeid)-1;
  var node = tutorialsLOV[nodeidx];
  var orignode = node;
  if(node[window.jshuimap['codeicon']]=='folder'){
    //Find first file in that folder
    for(;nodeidx<tutorialsLOV.length;nodeidx++){
      node = tutorialsLOV[nodeidx];
      if(node[window.jshuimap['codeicon']]=='file') break;
    }
    if(node[window.jshuimap['codeicon']]=='folder') return;
  }
  var nodectrl = $('#tutorials_menu').find('.tree_item.tree_item_' + nodeid);
  if(nodectrl.length) XExt.scrollObjIntoView($('#tutorials_menu'), nodectrl);
  if(curTutorial && (curTutorial.id==orignode[window.jshuimap['codeval']])) return;
  loadTutorial(node[window.jshuimap['codeval']]);
}

function loadTutorial(tutorial,options){
  if(!options) options = {};
  XPost.prototype.XExecute('../_tutorials/'+tutorial,{}, function (rslt) {
    var config = rslt.config;
    config.id = tutorial;
    var displayTitle = config.Title;
    //if(config.Menu) for(var i=config.Menu.length-1;i>=0;i--) displayTitle = config.Menu[i] + ' - ' + displayTitle;
    //Add History
    var url = '/tutorials/'+tutorial;
    
    document.title = 'Tutorial - '+displayTitle;
    if(!options.noHistory){
      XExt.AddHistory(url,config);
    }
    $('#tutorial_tabs_body').scrollTop(0);
    curTutorial = config;
    curTutorial.Source = rslt.source;
    //Render Title
    $('#tutorial_title').html(displayTitle);
    $('#tutorial_tabs').show();
    //Render Tabs (Source, Demo)

    $('#tutorial_tabs .left').show();
    $('#tutorial_tabs .overview').show();

    if(config.Code && config.Code.length) $('#tutorial_tabs a.code').show();
    else $('#tutorial_tabs a.code').hide();

    if(config.Demo) $('#tutorial_tabs a.demo').show();
    else $('#tutorial_tabs a.demo').hide();

    //Load Tutorial in Body
    $('#tutorial_overview').html(rslt.data);

    //Select tab
    $('#tutorial_tabs a').removeClass('selected');
    if($('#tutorial_tabs a.overview').is(':visible')) viewTutorialOverview();
    else if($('#tutorial_tabs a.code').is(':visible')) viewTutorialCodeListing();
    
    //Change selected menu item + scroll into view if not visible
    for(var i=0;i<tutorialsLOV.length;i++){
      var node = tutorialsLOV[i];
      if(node[window.jshuimap['codeval']] == tutorial){
        XExt.TreeSelectNode($('#tutorials_menu'),node[window.jshuimap['codeid']])
        break;
      }
    }
    onLayout();
  });
}

function viewTutorialOverview(){
  $('#tutorial_tabs a').removeClass('selected');
  $('#tutorial_tabs a.overview').addClass('selected');
  $('#tutorial_tabs_body').children().hide();
  $('#tutorial_overview').show();
  $('#tutorial_overview pre').each(function(i, block) {
    hljs.highlightBlock(block);
  });
  onLayout();
}

function viewTutorialCodeListing(){
  $('#tutorial_tabs a').removeClass('selected');
  $('#tutorial_tabs a.code').addClass('selected');
  $('#tutorial_tabs_body').children().hide();
  $('#tutorial_code_listing').show();
  //Use template to render
  var ejssource = $('#tutorial_code_listing_template').html();
	ejssource = ejssource.replace(/<#/g,'<%').replace(/#>/g,'%>')
	$('#tutorial_code_listing').html(ejs.render(ejssource,{data:curTutorial,xejs:XExt.xejs}));
  onLayout();
}

function viewTutorialCode(idx){
  $('#tutorial_tabs a').removeClass('selected');
  $('#tutorial_tabs a.code').addClass('selected');
  $('#tutorial_tabs_body').children().hide();
  $('#tutorial_code').show();
  //Use template to render
  var filename = '';
  var source = '';
  if(curTutorial.Code && (curTutorial.Code.length > idx)){
    filename = curTutorial.Code[idx];
    source = curTutorial.Source[filename]||'';
  }
  var ejssource = $('#tutorial_code_template').html();
	ejssource = ejssource.replace(/<#/g,'<%').replace(/#>/g,'%>')
	$('#tutorial_code').html(ejs.render(ejssource,{data:{filename:filename,source:source},xejs:XExt.xejs}));
  $('#tutorial_code_source').each(function(i, block) {
    hljs.highlightBlock(block);
  });
  onLayout();
}

function viewTutorialDemo(){
  if(curTutorial.Demo){
    var windowparams = curTutorial.DemoWindowParams||'height=700,width=1000';
    window.open(curTutorial.Demo,'_blank',windowparams);
  }
}

function searchTutorials(query,options){
  if(!options) options = {};
  $('#tutorial_title').text('Search Results - ' + query);
  $('#tutorial_tabs_body').children().hide();
  $('#tutorial_search_results').empty().show();
  $('#tutorial_tabs').children().hide();
  XPost.prototype.XExecute('../_search',{ query: query }, function (rslt) {
    document.title = 'Tutorial - Search Results - ' + query;

    var url = '/search/?'+$.param({query:query});
    if(!options.noHistory) XExt.AddHistory(url,{});
    var ejssource = $('#tutorial_search_results_template').html();
	  ejssource = ejssource.replace(/<#/g,'<%').replace(/#>/g,'%>')
	  $('#tutorial_search_results').html(ejs.render(ejssource,{data:rslt,xejs:XExt.xejs}));
  });
  onLayout();
}

$(document).ready(function(){
  tutorialsLOV = [];
  genTutorialsLOV(tutorialsLOV,tutorialsMenu);
  XExt.TreeRender($('#tutorials_menu'), tutorialsLOV, 0);
  XExt.TreeExpandAll($('#tutorials_menu'));
  onLayout();

  var path = window.location.pathname;
  if(XExt.beginsWith(path,'/tutorials/')){
    var tutorial = path.substr(11);
    loadTutorial(tutorial,{ noHistory: true });
  }
  else if(XExt.beginsWith(path,'/search/')){
    searchTutorials(_GET.query||'',{ noHistory: true });
  }

  $('#tutorials_search .query').focus(function() { 
    var _this = this; 
    $(_this).select(); 
    if($(_this).val()=='Search') $(_this).val('');
  });
  $('#tutorials_search .query').mouseup(function(e) { e.preventDefault(); return false; });
});

$(window).resize(onLayout);

window.onpopstate = function(event){
  var state = event.state;
  var url = window.location.pathname;
  _GET = XExt.parseGET();
  if(state && state.config && state.config.id) loadTutorial(state.config.id,{ noHistory: true });
  else if(url.indexOf('/search/')==0) searchTutorials(_GET.query||'',{ noHistory: true });
  else if(url.indexOf('/tutorials/')==0) loadTutorial(url.substr(11),{ noHistory: true });
}