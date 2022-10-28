$(function(){
	// 加载设置
	var defaultConfig = {color: 'white'}; // 默认配置
	chrome.storage.sync.get(defaultConfig, function(items) {
		document.body.style.backgroundColor = items.color;
	});

	// 初始化国际化
	// $('#test_i18n').html(chrome.i18n.getMessage("helloWorld"));
})

var bg = chrome.extension.getBackgroundPage();

let selectDoc = function() {
	bg.getFictrionObj().resetFictionStorage();
	bg.getFictrionObj().resetFiction();
	chrome.storage.sync.set({ "wmutong_tool_select_stage": 1 });
	alert("请在页面中点击小说完整内容区域");
}

$('#get_fiction').click(e => {
	selectDoc();
});

$('#stop_fiction').click(e => {
	bg.getFictrionObj().download();
	bg.getFictrionObj().resetFictionStorage();
	bg.getFictrionObj().resetFiction();
});
