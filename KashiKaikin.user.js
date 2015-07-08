// ==UserScript==
// @name            KashiKaikin
// @namespace       http://d.hatena.ne.jp/furyu-tei
// @author          furyu
// @version         0.1.0.1
// @include         http://*
// @include         https://*
// @description     歌詞検索サイトの歌詞テキストをコピー可能にする
// ==/UserScript==

/*
The MIT License (MIT)

Copyright (c) 2015 furyu <furyutei@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

(function(w, d) {

var GLOBAL_OPTIONS = {
    NAME_SCRIPT : 'KashiKaikin'
,   DEBUG : false
,   CSS_KASHI : {
        'border' :'double 3px orange'
    ,   'padding' : '4px 6px'
    ,   'text-align' : 'left'
    ,   'line-height' : '1.4'
    ,   'font-size' : '14px'
    ,   'font-family' : '"Hiragino Kaku Gothic ProN", Meiryo, sans-serif, monospace'
    }
,   CSS_ENABLE_SELECTION : {
        '-webkit-touch-callout' : 'default'
    ,   '-webkit-user-select' : 'text'
    ,   '-moz-user-select' : 'text'
    ,   '-ms-user-select' : 'text'
    ,   'user-select' : 'text'
    }
};

if ((w !== w.parent) || d.getElementById(('__user_script__' + GLOBAL_OPTIONS.NAME_SCRIPT))) {return;}

var site_infomations = [
    { // ■ 歌詞検索サービス　歌ネット
        reg_url : '^https?://(?:www\\.)?uta-net\\.com/song/[^/]+/'
    ,   sample_url : 'http://www.uta-net.com/song/185828/'
    ,   options : {
            jquery : false
        }
    ,   main : function(w, d, global_options, options) {
            var $ = $j;
            $.get(
                $('span#ipad_kashi img:first').attr('src'),
                function(xml) {
                    var chunks = [], elm = $('<pre/>');
                    $(xml).find('text').each(function() {
                        chunks.push($(this).text());
                    });
                    elm.text(chunks.join('\n')).css(global_options.CSS_KASHI);
                    $('p#flash_area').before(elm);
                },
                'xml'
            );
            var enable_selection = function() {
                $(d.body).unbind('contextmenu');
            };
            setInterval(enable_selection, 1000); // 一回だけだとタイミングによっては無効化されてしまう
        }
    }

,   { // ■ うたまっぷ 歌詞を無料で検索表示
        reg_url : '^https?://(?:(?:kids|www)\\.)?utamap\\.com/(?:pc/)?(?:show|view)kasi(?:_pc)?\\.php\\?surl=.+'
    ,   sample_url : 'http://www.utamap.com/showkasi.php?surl=k-150520-218'
    ,   options : {
            jquery : true
        }
    ,   main : function(w, d, global_options, options) {
            var $ = w.$, url = w.location.href;
            $.get(
                url.match(/^https?:\/\/kids\./) ? 'js_smt_pc.php' : 'js_smt.php',
                {
                    unum : url.match(/[?&]surl=([^?&]+)/)[1]
                },
                function(script) {
                    var chunks = [], elm = $('<pre/>');
                    script.replace(
                        /\.fillText\(.*?'((?:\\'|[^'])*)'.*?\)/g,
                        function(m, chunk) {
                            chunks.push(chunk.replace(/\\'/g, "'"));
                            return m;
                        }
                    );
                    elm.text(chunks.join('\n')).css(global_options.CSS_KASHI);
                    $('canvas#canvas2,object#showkasi').before(elm);
                },
                'html'
            );
        }
    }

,   { // ■ 歌詞検索サービス 歌詞ＧＥＴ
        reg_url : '^https?://www\\.kget\\.jp/lyric/[^/]+/'
    ,   sample_url : 'http://www.kget.jp/lyric/217912/'
    ,   options : {
            jquery : false
        }
    ,   main : function(w, d, global_options, options) {
        }
    }

,   { // ■ 歌詞ナビ 無料歌詞検索サービス
        reg_url : '^https?://kashinavi\\.com/song_view\\.html\?.+'
    ,   sample_url : 'http://kashinavi.com/song_view.html?86577'
    ,   options : {
            jquery : true
        }
    ,   main : function(w, d, global_options, options) {
            var $ = w.$;
            $.post(
                'http://kashinavi.com/cgi-bin/kashi.cgi',
                {
                    kdifoe88: 'smx;paa',
                    file_no: $('link[rel="canonical"]:first').attr('href').match(/\/song_view\.html\?(\d+)/)[1]
                },
                function(result) {
                    var elm = $('<pre/>');
                    elm.text(result.replace(/^kashi=.*?\n+/,'')).css(global_options.CSS_KASHI);
                    $('object#aaa').before(elm);
                },
                'html'
            );
        }
    }

,   { // ■ 歌詞検索J-Lyric.net
        reg_url : '^https?://j-lyric\\.net/artist/[^/]+/[^.]+.html'
    ,   sample_url : 'http://j-lyric.net/artist/a05a05d/l035fb5.html'
    ,   options : {
            jquery : true
        }
    ,   main : function(w, d, global_options, options) {
        }
    }

,   { // ■ JOYSOUND.com
        reg_url : '^https?://www\\.joysound\\.com/web/search/song/.+'
    ,   sample_url : 'https://www.joysound.com/web/search/song/420767#lyrics'
    ,   options : {
            jquery : true
        }
    ,   main : function(w, d, global_options, options) {
            $(d.body).css(global_options.CSS_ENABLE_SELECTION);
            
            var enable_selection = function() {
                //$(d.body).attr('onselectstart', 'return true').attr('oncontextmenu', 'return true');
                d.oncontextmenu = d.body.oncontextmenu = d.body.onselectstart = function() {
                    return true;
                };
            };
            
            /*
            //enable_selection();
            //
            //new MutationObserver(function(records) {
            //    // 属性変化を監視して必要な時だけ enable_selection() をコールする試み→失敗
            //    enable_selection();
            //}).observe(d.body, {
            //    attributes : true
            //,   characterData : false
            //,   childList : false
            //});
            */
            
            setInterval(enable_selection, 1000); // 一回だけだとタイミングによっては無効化されてしまう
        }
    }

,   { // ■ J-Total Music!
        reg_url : '^https?://music\\.j-total\\.net/data/.+'
    ,   sample_url : 'http://music.j-total.net/data/021na/001_nagabuchi_tsuyoshi/005.html'
    ,   options : {
            jquery : true
        }
    ,   main : function(w, d, global_options, options) {
            /*
            //// コピー用に、歌詞中のコード部分を除いたものを貼り付け → コード部分の '/' がうまく除去できないので保留
            //var lyric_body = $('table[align="center"] tt').clone(true), elm = $('<pre/>');
            //lyric_body.find('a').remove();
            //elm.text($.trim(lyric_body.text().replace(/(?:^ +| +$)/gm, ''))).css(global_options.CSS_KASHI);
            //$('table[align="center"] tt').before(elm);
            */
            
            $('body,div.lyricBody').css(global_options.CSS_ENABLE_SELECTION);
        }
    }

,   { // ■ UtaTen 無料歌詞検索サイトの決定版！うたてん
        reg_url : '^https?://utaten\\.com/lyric/.+'
    ,   sample_url : 'http://utaten.com/lyric/%E5%8C%97%E5%AE%87%E6%B2%BB%E3%82%AB%E3%83%AB%E3%83%86%E3%83%83%E3%83%88/%E3%83%88%E3%82%A5%E3%83%83%E3%83%86%E3%82%A3%EF%BC%81/'
    ,   options : {
            jquery : true
        }
    ,   main : function(w, d, global_options, options) {
            // コピー用に、歌詞中のふりがなを除いたものを貼り付け
            var lyric_body = $('div.lyricBody div.medium').clone(true), elm = $('<pre/>');
            lyric_body.find('span.rt').remove();
            elm.text($.trim(lyric_body.text().replace(/(?:^ +| +$)/gm, ''))).css(global_options.CSS_KASHI);
            $('div.lyric__body').before(elm);
            
            $('body,div.lyricBody').css(global_options.CSS_ENABLE_SELECTION);
        }
    }

/* // 雛形
,   { // ■
        reg_url : ''
    ,   sample_url : ''
    ,   options : {
            jquery : true
        }
    ,   main : function(w, d, global_options, options) {
        }
    }
*/
];


var call_main = function(w, d, main, global_options, options) {
    if (!global_options) {global_options = {};}
    if (!options) {options = {};}
    
    var is_jquery_valid = function() {
        var $ = w.$;
        return ($ && $.fn && $.fn.jquery);
    };  //  end of is_jquery_valid
    
    var do_main = function() {
        if (global_options.DEBUG || options.DEBUG) {
            console.log(global_options.NAME_SCRIPT + ': ' + w.location.href);
        }
        main(w, d, global_options, options);
    };
    
    if (!options.jquery || is_jquery_valid()) {
        do_main();
        return;
    }
    
    var check = function() {
        var $ = w.$;
        if (is_jquery_valid()) {
            do_main();
            return;
        }
        setTimeout(check, 100);
    };
    check();
};  //  end of call_main()


var common_enable_selection = function() {
    d.oncontextmenu = d.body.oncontextmenu = d.body.onselectstart = function() {
        return true;
    };
}; // end of common_enable_selection()


var load_script = function(script_url, main, options, script_id) {
    var script = d.createElement('script');
    if (script_url) {
        script.src = script_url;
    }
    if (main) {
        if (!options) {options = {};}
        if (options.jquery) {
            load_script('//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js');
        }
        if (!options.suppress_common_procedure) {
            common_enable_selection();
        }
        script.textContent = '(' + call_main.toString() + ')(' + [
            'window', 'document', main.toString(), JSON.stringify(GLOBAL_OPTIONS), JSON.stringify(options)
        ].join(',') + ');';
    }
    if (script_id) {
        script.id = script_id;
    }
    d.documentElement.appendChild(script);
}; // end of load_script()


var url = w.location.href;

for (var ci = 0, len = site_infomations.length; ci < len; ci++) {
    var site_information = site_infomations[ci];
    if (url.match(site_information.reg_url)) {
        load_script(null, site_information.main, site_information.options, '__user_script__' + GLOBAL_OPTIONS.NAME_SCRIPT);
        break;
    }
}

})(window, document);

// ■ end of file
