'use strict';

doT.templateSettings = {
  evaluate: /\[\[([\s\S]+?)\]\]/g,
  interpolate: /\[\[=([\s\S]+?)\]\]/g,
  encode: /\[\[!([\s\S]+?)\]\]/g,
  use: /\[\[#([\s\S]+?)\]\]/g,
  define: /\[\[##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\]\]/g,
  conditional: /\[\[\?(\?)?\s*([\s\S]*?)\s*\]\]/g,
  iterate: /\[\[~\s*(?:\]\]|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\]\])/g,
  varname: 'it',
  strip: true,
  append: true,
  selfcontained: false
};

// jQuery plugin
$.fn.tmpl = function (tmplId, data) {
  var tmpl = doT.template($('#tmpl_' + tmplId).html());
  if (!$.isArray(data)) data = [data];

  return this.each(function () {
    var html = '';
    for (var itemIdx = 0; itemIdx < data.length; itemIdx++) {
      html += tmpl(data[itemIdx]);
    }
    $(this).html(html);
  });
};

$(function () {
  var tabs = [{
    text: 'О комплексе',
    id: '7'
  }, {
    text: 'О мероприятиях',
    id: '8'
  }, {
    text: 'O компании',
    id: '9'
  }, {
    text: 'Все',
    id: 'all'
  }],
      app = {
    page: 1,
    currentTab: 7,
    load: true,
    done: false,

    getData: function getData() {
      var _this = this;

      var params = {
        page: this.page,
        subjects__pk: this.currentTab
      };

      if (this.currentTab == 'all') {
        delete params['subjects__pk'];
      }

      $.ajax({
        url: 'https://cors-anywhere.herokuapp.com/http://expoforum-center.ru/ru/news/api/list/',
        data: params
      }).done(function (data) {
        $('#temp').tmpl('news', data.results);
        $('#news-container').append($('#temp div'));
        $('#temp').empty();

        $('#m-nav-tabs').tmpl('tabs', { tabs: tabs, current: _this.currentTab });

        _this.load = false;

        _this.setEventToTabs();
        _this.setEventScroll();

        _this.hidePreloaderTop();
        _this.hidePreloaderBottom();
      }).fail(function (e) {
        if (e.status == 404) {
          _this.done = true;
          _this.load = false;

          _this.hidePreloaderTop();
          _this.hidePreloaderBottom();
        }
      });
    },
    setEventToTabs: function setEventToTabs() {
      var _this2 = this;

      $('#m-nav-tabs li').on('click', function (event) {
        _this2.currentTab = $(event.target).data('id');
        _this2.done = false;

        $('#news-container').empty();
        _this2.page = 1;

        _this2.showPreloaderTop();
        _this2.getData();
      });
    },
    setEventScroll: function setEventScroll() {
      var _this3 = this;

      $(window).scroll(function () {
        if (_this3.load) return;
        if (_this3.done) return;

        if ($(document).height() - $(window).height() <= $(window).scrollTop() + 50) {
          _this3.load = true;
          _this3.page += 1;
          _this3.showPreloaderBottom();
          _this3.getData();
        }
      });
    },
    showPreloaderTop: function showPreloaderTop() {
      $('.preloader-wrap-top').show();
    },
    hidePreloaderTop: function hidePreloaderTop() {
      $('.preloader-wrap-top').hide();
    },
    showPreloaderBottom: function showPreloaderBottom() {
      $('.preloader-wrap-bottom').show();
    },
    hidePreloaderBottom: function hidePreloaderBottom() {
      $('.preloader-wrap-bottom').hide();
    }
  };

  app.getData();
});
