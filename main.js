doT.templateSettings = {
  evaluate:    /\[\[([\s\S]+?)\]\]/g,
  interpolate: /\[\[=([\s\S]+?)\]\]/g,
  encode:      /\[\[!([\s\S]+?)\]\]/g,
  use:         /\[\[#([\s\S]+?)\]\]/g,
  define:      /\[\[##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\]\]/g,
  conditional: /\[\[\?(\?)?\s*([\s\S]*?)\s*\]\]/g,
  iterate:     /\[\[~\s*(?:\]\]|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\]\])/g,
  varname: 'it',
  strip: true,
  append: true,
  selfcontained: false
};

// jQuery plugin
$.fn.tmpl = function(tmplId, data) {
  var tmpl = doT.template($('#tmpl_' + tmplId).html());
  if (!$.isArray(data)) data = [data];

  return this.each(function() {
    var html = '';
    for (var itemIdx = 0; itemIdx < data.length; itemIdx++) {
      html += tmpl(data[itemIdx]);
    }
    $(this).html(html);
  });
};

Array.prototype.last = function() {
    return this[this.length-1];
}

jQuery.ajaxPrefilter(function(options) {
    if (options.crossDomain && jQuery.support.cors) {
        options.url = 'https://cors-anywhere.herokuapp.com/' + options.url;
    }
});

$(function() {

  var tabs = [
    {
      text: 'О комплексе',
      id: '7'
    },{
      text: 'О мероприятиях',
      id: '8'
    },{
      text: 'O компании',
      id: '9'
    },{
      text: 'Все',
      id: 'all'
    }
  ]

  var app = {
    page: 1,
    currentTab: 7,
    load: true,
    done: false,

    getData: function(){
      var _this = this;

      var tab = this.currentTab == 'all' ? '': 'subjects__pk=' + this.currentTab + '&';

      $.ajax({
        url: 'http://expoforum-center.ru/ru/news/api/list/?' + tab + 'page='+ _this.page,
        error: function(e){
          if (e.status == 404) {
            _this.done = true;
            _this.load = false;

            _this.hidePreloaderTop();
            _this.hidePreloaderBottom()
          }
        }
      })
      .done(function(data) {
        $('#temp').tmpl('news', data.results);
        $('#news-container').append($('#temp div'));
        $('#temp').empty()

        $('#m-nav-tabs').tmpl('tabs', {tabs: tabs, current: _this.currentTab});

        _this.load = false;

        _this.setEventToTabs();
        _this.setEventScroll();

        _this.hidePreloaderTop();
        _this.hidePreloaderBottom();
      })
    },
    setEventToTabs: function(){
      var _this = this;
      $('#m-nav-tabs li').on('click', function(){
        _this.currentTab = $(this).data('id');

        _this.done = false;

        $('#news-container').empty()
        _this.page = 1;

        _this.showPreloaderTop();
        _this.getData();
      })
    },
    setEventScroll: function(){
      var _this = this;

      $(window).scroll(function () {
        if (_this.load) return
        if (_this.done) return

        if ($(document).height() - $(window).height() <= $(window).scrollTop() + 50) {
          _this.load = true;
          _this.page += 1;
          _this.showPreloaderBottom();
          _this.getData();
        }
      });
    },
    showPreloaderTop: function(){
      $('.preloader-wrap-top').show();
    },
    hidePreloaderTop: function(){
      $('.preloader-wrap-top').hide();
    },
    showPreloaderBottom: function(){
      $('.preloader-wrap-bottom').show();
    },
    hidePreloaderBottom: function(){
      $('.preloader-wrap-bottom').hide();
    },
    init: function(){
      this.getData()
    }
  }

  app.init()
});
