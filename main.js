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

$(function() {
  const tabs = [
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
  ],

  app = {
    page: 1,
    currentTab: 7,
    load: true,
    done: false,

    getData: function(){
      var params = {
        page: this.page,
        subjects__pk: this.currentTab
      }

      if (this.currentTab == 'all') {
        delete params['subjects__pk']
      }

      $.ajax({
        url: 'https://cors-anywhere.herokuapp.com/http://expoforum-center.ru/ru/news/api/list/',
        data: params,
      })
      .done((data) => {
        $('#temp').tmpl('news', data.results);
        $('#news-container').append($('#temp div'));
        $('#temp').empty();

        $('#m-nav-tabs').tmpl('tabs', {tabs: tabs, current: this.currentTab});

        this.load = false;

        this.setEventToTabs();
        this.setEventScroll();

        this.hidePreloaderTop();
        this.hidePreloaderBottom();
      })
      .fail((e) => {
        if (e.status == 404) {
          this.done = true;
          this.load = false;

          this.hidePreloaderTop();
          this.hidePreloaderBottom();
        }
      })
    },
    setEventToTabs: function(){
      $('#m-nav-tabs li').on('click', (event) => {
        this.currentTab = $(event.target).data('id');
        this.done = false;

        $('#news-container').empty();
        this.page = 1;

        this.showPreloaderTop();
        this.getData();
      })
    },
    setEventScroll: function(){
      $(window).scroll(() => {
        if (this.load) return;
        if (this.done) return;

        if ($(document).height() - $(window).height() <= $(window).scrollTop() + 50) {
          this.load = true;
          this.page += 1;
          this.showPreloaderBottom();
          this.getData();
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
  };

  app.getData();
});
