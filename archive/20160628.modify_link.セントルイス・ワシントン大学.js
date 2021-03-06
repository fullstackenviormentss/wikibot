﻿// (cd ~/wikibot && date && hostname && nohup time node 20160628.modify_link.セントルイス・ワシントン大学.js; date) >> modify_link.セントルイス・ワシントン大学/log &

/*

 2016/6/28 21:20:22	セントルイス・ワシントン大学の記事名変更に伴う修正: 仮運用を行って

 */

'use strict';

// Load CeJS library and modules.
require('./wiki loder.js');

// Set default language. 改變預設之語言。 e.g., 'zh'
set_language('ja');

/** {String}預設之編輯摘要。總結報告。編集内容の要約。 */
summary = '[[Special:Diff/60223628|Bot作業依頼]]：[[セントルイス・ワシントン大学]]の記事名変更に伴う修正';

var
/** {Object}wiki operator 操作子. */
wiki = Wiki(true),

/** {revision_cacher}記錄處理過的文章。 */
processed_data = new CeL.wiki.revision_cacher(base_directory + 'processed.'
		+ use_language + '.json'),

// ((Infinity)) for do all
test_limit = Infinity,

// [ all ]
PATTERN_TO_REPLACE = /(?:(?:\[\[)?セント・?ルイス(?:\]\])?(?:の|にある))?\[\[\s*ワシントン大学[ _]\(セントルイス\)\s*(?:\|[^\]]*)?\]\]/g;

if (false) {
	// [ all, 州 ]
	PATTERN_TO_REPLACE = /(?:(州(?:\]\])?)?(?:\[\[)?セント・?ルイス(?:\]\])?(?:の|にある))?\[\[\s*ワシントン大学[ _]\(セントルイス\)\s*(?:\|[^\]]*)?\]\]/g;
}

function for_each_page(page_data, messages) {
	if (!page_data || ('missing' in page_data)) {
		// error?
		return [ CeL.wiki.edit.cancel, '條目已不存在或被刪除' ];
	}

	if (page_data.ns !== 0) {
		throw '非條目:[[' + page_data.title + ']]! 照理來說不應該出現有 ns !== 0 的情況。';
	}

	/** {String}page title = page_data.title */
	var title = CeL.wiki.title_of(page_data),
	/**
	 * {String}page content, maybe undefined. 條目/頁面內容 = revision['*']
	 */
	content = CeL.wiki.content_of(page_data);

	if (!content) {
		return [ CeL.wiki.edit.cancel,
				'No contents: [[' + title + ']]! 沒有頁面內容！' ];
	}

	if (false) {
		// 首先需要檢查前後文，確認可能出現的問題!
		console.log(content.match(PATTERN_TO_REPLACE).join('\n').replace(
				/\[\[\s*ワシントン大学[ _]\(セントルイス\)\s*/g, '~~~~~~~~~~'));
	}

	return content.replace(PATTERN_TO_REPLACE, '[[セントルイス・ワシントン大学]]');
}

// ----------------------------------------------------------------------------

// CeL.set_debug(2);

// 先創建出/準備好本任務獨有的目錄，以便後續將所有的衍生檔案，如記錄檔、cache 等置放此目錄下。
prepare_directory(base_directory);
// prepare_directory(base_directory, true);

CeL.wiki.cache([ {
	type : 'backlinks',
	list : 'ワシントン大学 (セントルイス)',
	operator : function(list) {
		this.list = list;
	}

} ], function() {
	var list = this.list;
	// list = [ '' ];
	CeL.log('Get ' + list.length + ' pages.');
	if (0) {
		// 設定此初始值，可跳過之前已經處理過的。
		list = list.slice(0 * test_limit, 1 * test_limit);
		CeL.log(list.slice(0, 8).map(function(page_data) {
			return CeL.wiki.title_of(page_data);
		}).join('\n') + '\n...');
	}

	wiki.work({
		each : for_each_page,
		summary : summary
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
