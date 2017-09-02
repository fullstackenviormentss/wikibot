﻿# CeJS wikipedia bots demo
Some Wikipedia bot examples using [MediaWiki module](https://github.com/kanasimi/CeJS/blob/master/application/net/wiki.js) of [CeJS library](https://github.com/kanasimi/CeJS).
採用 CeJS [MediaWiki 自動化作業用程式庫](https://github.com/kanasimi/CeJS/blob/master/application/net/wiki.js)來製作維基百科機器人的範例。

## Node.js usage

### Installation
1. Please see [Node.js usage section at CeJS](https://github.com/kanasimi/CeJS#nodejs-usage) for detail.
2. Setup [_CeL.path.txt](https://github.com/kanasimi/CeJS/blob/master/_for%20include/_CeL.path.sample.txt) if necessary.
3. Setup [wiki configuration.js](https://github.com/kanasimi/wikibot/blob/master/wiki%20configuration.sample.js).

### Execution
Let's try it:
``` sh
$ node
```
``` JavaScript
// Load CeJS library.
require('cejs');

// Load modules.
CeL.run('application.net.wiki');

// Set default language. 改變預設之語言。
CeL.wiki.set_language('en');

// Set up the wiki instance.
var wiki = CeL.wiki.login(user_name, password, 'en');

wiki
// Select page(s) and get the contents of the page(s).
.page('Wikipedia:Sandbox')

// Replace the contents of a page.
.edit('wikitext to replace', {
	nocreate : 1
})

// Add a new section to a normal page or a Flow page.
.edit(': text to add.', {
	section : 'new',
	sectiontitle : 'Sandbox test section',
	summary : 'Sandbox test edit (section)',
	nocreate : 1
})

// Modify the page contents.
.edit(function(page_data) {
	/** {String}page title */
	var title = CeL.wiki.title_of(page_data),
	/** {String}page content, maybe undefined. */
	content = CeL.wiki.content_of(page_data);
	// append a new section
	return content + '\n== New section ==\n: text to add.';
}, {
	summary : 'summary'
});
```

Wikidata example:
``` JavaScript
// Set up the wiki instance.
var wiki = CeL.wiki.login(user_name, password, 'en');

wiki.data('維基數據沙盒2', function(data) {
	// Here we are running the callback.
	var data_JSON = data;
}).edit_data(function(entity) {
	// add new / set single value with references
	return {
		生物俗名 : '維基數據沙盒2',
		language : 'zh-tw',
		references : {
			臺灣物種名錄物種編號 : 123456,
			// [[d:Special:AbuseFilter/54]]
			// 導入自 : 'zhwiki',
			載於 : '臺灣物種名錄物種',
			來源網址 : 'https://www.wikidata.org/',
			檢索日期 : new Date
		}
	};

	// set multiple values
	return {
		labels : {
			ja : 'ウィキデータ・サンドボックス2',
			'zh-tw' : [ '維基數據沙盒2', '維基數據沙盒#2', '維基數據沙盒-2' ]
		},
		descriptions : {
			'zh-tw' : '作為沙盒以供測試功能'
		},
		claims : [ {
			生物俗名 : [ 'SB2#1', 'SB2#2', 'SB2#3' ],
			multi : true,
			language : 'zh-tw',
			references : {
				臺灣物種名錄物種編號 : 123456
			}
		}, {
			読み仮名 : 'かな',
			language : 'ja',
			references : {
				imported_from : 'jawiki'
			}
		} ]
	};

	// remove specified value 生物俗名=SB2
	return {
		生物俗名 : 'SB2',
		language : 'zh-tw',
		remove : true
	};

	// to remove ALL "生物俗名"
	return {
		生物俗名 : CeL.wiki.edit_data.remove_all,
		language : 'zh-tw'
	};

}, {
	bot : 1,
	summary : 'bot test: edit property'
});
```

For the "wiki loder.js" using in the examples, See [wiki loder.sample.js](https://github.com/kanasimi/wikibot/blob/master/archive/wiki%20loder.sample.js).


## Screenshot
Screenshot of [WPCHECK.js](https://github.com/kanasimi/wikibot/blob/master/20151002.WPCHECK.js) (fix_16 only):

* Output on console:
![On console](https://upload.wikimedia.org/wikipedia/commons/7/7c/20151002.WPCHECK.console.c.png)

* Log page on Wikipedia (ページ上への作業ログ出力):
![Log page](https://upload.wikimedia.org/wikipedia/commons/d/da/20151002.WPCHECK.log.c.png)

* The contributions:
![Contributions](https://upload.wikimedia.org/wikipedia/commons/f/f1/20151002.WPCHECK.contributions.c.png)


## Features of CeJS MediaWiki module
* Batch processing.
* Access and edit wikimedia sister projects + wikidata.
* Support [Flow](https://www.mediawiki.org/wiki/Flow) page: Using the same way adding section to normal page and Flow page.
* Detection of edit conflicts and <code>{{[bots](https://meta.wikimedia.org/wiki/Template:Bots)}}</code>.
* Query [list](https://www.mediawiki.org/wiki/API:Lists) of backlinks, embeddedin, imageusage, linkshere, fileusage, et al.
* Parse [wikitext](https://www.mediawiki.org/wiki/Wikitext) and modify wikitext inplace.
* Listen to recent changes with diff function supported.

* Parse XML file of [Wikimedia database backup dumps](http://dumps.wikimedia.org/backup-index.html).
* Import Wikimedia database backup dumps data to user-created database on [Tool Labs](http://tools.wmflabs.org/). (See [process_dump.js](https://github.com/kanasimi/wikibot/blob/master/process_dump.js))
* Traversal all 1.5M pages of zhwiki in 12 minutes on Tool Labs. (See [traversal_pages.clear.js](https://github.com/kanasimi/wikibot/blob/master/archive/traversal_pages.clear.js). It will automatically download xml dump file first.) 12分鐘遍歷所有 zhwiki 頁面。（於 Tool Labs，將自動先下載 xml dump file。）
