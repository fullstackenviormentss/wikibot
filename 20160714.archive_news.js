﻿// (cd ~/wikibot && date && hostname && nohup time node 20160714.archive_news.js; date) >> archive_news/log &

/*


 */

'use strict';

// Load CeJS library and modules.
require('./wiki loder.js');
// for CeL.get_set_complement()
CeL.run('data.math');

var
/** {Object}wiki operator 操作子. */
wiki = Wiki(true, 'wikinews'),

/** {Number}一整天的 time 值。should be 24 * 60 * 60 * 1000 = 86400000. */
ONE_DAY_LENGTH_VALUE = new Date(0, 0, 2) - new Date(0, 0, 1),

// [[Wikinews:存檔常規]]: 已發表兩週或以上的文章會列入存檔並且可被保護。
time_limit = Date.now() - 14 * ONE_DAY_LENGTH_VALUE,

// ((Infinity)) for do all
test_limit = 2,

template_name_need_check = '需管理員檢查的文章',

page_list = [];

// ----------------------------------------------------------------------------

function check_redirect_to(template_name_hash, callback) {
	var template_name_list = Object.keys(template_name_hash), left = template_name_list.length;
	template_name_list.forEach(function(template_name) {
		wiki.redirect_to('Category:' + template_name, function(redirect_data,
				page_data) {
			// console.log(page_data.response.query);
			// console.log(redirect_data);
			CeL.info(template_name + ' →	' + redirect_data);
			template_name_hash[template_name] = redirect_data;
			if (--left === 0) {
				callback(template_name_hash);
			}
		});
	});
}

function page_data_to_String(page_data) {
	return page_data.pageid + '|' + page_data.title;
}

function main_work(template_name_redirect_to) {

	CeL.wiki.cache([ {
		type : 'categorymembers',
		list : template_name_redirect_to.published,
		reget : true,
		operator : function(list) {
			this.published = list;
			// this.published = list.map(page_data_to_String);
		}

	}, {
		type : 'categorymembers',
		list : template_name_redirect_to.archived,
		reget : true,
		operator : function(list) {
			this.archived = list;
			// this.archived = list.map(page_data_to_String);
		}

	} ], function() {
		CeL.log(this.archived.length + ' archived, ' + this.published.length
				+ ' published.');
		// 取差集: 從比較小的來處理。
		// get [[:Category:Published]] - [[:Category:Archived]]
		var list = CeL.get_set_complement(this.published, this.archived);

		CeL.log('→ ' + list[1].length + ' archived, ' + list[0].length
				+ ' published.');

		if (list[1].length) {
			// 依照現在 {{publish}} 的寫法，不應出現此項。
			CeL.err('有' + list[1].length + '個已存檔，但沒有發布之條目！');
		}

		list = list[0];

		// var list = this.list;
		// list = [ '' ];
		CeL.log('Get ' + list.length + ' pages.');
		if (0) {
			CeL.log(list.slice(0, 8).map(function(page_data, index) {
				return index + ': ' + CeL.wiki.title_of(page_data);
			}).join('\n') + '\n...');
			// 設定此初始值，可跳過之前已經處理過的。
			list = list.slice(0 * test_limit, 1 * test_limit);
		}

		wiki.work({
			no_edit : true,
			each : for_each_page,
			page_options : {
				rvprop : 'ids|timestamp'
			},
			last : archive_page

		}, list);

	}, {
		// default options === this
		namespace : 0,
		// [SESSION_KEY]
		session : wiki,
		// title_prefix : 'Template:',
		// cache path prefix
		prefix : base_directory
	});

}

function for_each_page(page_data) {
	// console.log(page_data);
	// check the articles that are published at least 14 days old.
	// 以最後編輯時間後已超過兩周或以上的文章為準。
	if (Date.parse(page_data.revisions[0].timestamp) < time_limit) {
		page_list.push(page_data);
	}
}

var page_status = CeL.null_Object();
function archive_page() {
	CeL.log('存檔 ' + page_list.length + ' 文章');
	// console.log(page_list.slice(0, 9));
	page_list.forEach(function(page_data) {
		if (false)
			wiki.protect({
				pageid : page_data.pageid,
				protections : 'edit=sysop|move=sysop',
				reason : '[[WN:ARCHIVE|存檔保護]]作業'
			});

		wiki.page(page_data, function(data) {
			/**
			 * {String}page content, maybe undefined.
			 */
			var contents = CeL.wiki.content_of(page_data);
			if (!Array.isArray(contents)) {
				// assert: typeof contents === 'string' && contents has {{published}}
				;
			}
			// 檢查新聞稿發布時間
			var first_has_published = contents.first_matched(/{{\s*[Pp]ublished\s*}}/),
			// assert: first_has_published >= 0
			publish_date = Date.parse(page_data.revisions[first_has_published].timestamp),
			// 發布時間/發表後2日後不應進行大修改。應穩定
			stable_date = publish_date + 2 * ONE_DAY_LENGTH_VALUE,
			// 應穩定之index
			stable_index = page_data.revisions.search_sorted({found:true,comparator:function (revision) {
				return stable_date - Date.parse(revision.timestamp);
			});
			//只檢查首尾差距，因為有時可能被回退了。
			//TODO: 計算首尾之[[:en:edit distance]]。
			for (var index=0;index<stable_index;index++){
				next_text_length=
				if(Math.abs(page_data.revisions[index]['*'].length -)>500){
					;
				}
			}
		}, {
			rvlimit : 'max'
		});

	});
}

// ----------------------------------------------------------------------------

prepare_directory(base_directory);

// CeL.set_debug(2);

check_redirect_to({
	published : null,
	archived : null
}, main_work);
