chrome.contextMenus.create({
	title: "测试右键菜单",
	onclick () {
		alert('您点击了右键菜单！')
	}
});
chrome.contextMenus.create({
	title: '使用度娘搜索：%s', // %s表示选中的文字
	contexts: ['selection'], // 只有当选中文字时才会出现此右键菜单
	onclick: function(params) {
		// 注意不能使用location.href，因为location是属于background的window对象
		chrome.tabs.create({url: 'https://www.baidu.com/s?ie=utf-8&wd=' + encodeURI(params.selectionText)});
	}
});

// 悬浮窗口
const MinWindow = function(options) {
	// let adsorb = options.adsorb;
	// let location = options.location;
	// let size = options.size;
	// let windowHref = options.windowHref;

	// /* ------------ 原型属性 ------------ */
	// // 是否吸附
	// this.adsorb = adsorb || false;
	// // 初始位置
	// this.location = location || { top: 0, left: 0 };
	// // 初始窗口大小
	// this.size = size || { width: 200, height: 200 };
	// // 访问网址
	// this.windowHref = windowHref || 'www.baidu.com';


	/* ------------ 内部方法 ------------ */
	// 构建dom
	const createDom = () => {
		let that = this;
		// let { location, size } = that;

		let dContainer = $('<div>', {
			class: 'container'
		});

		// dContainer.css({ 'top': location.top, 'left': location.left, 'width': size.width, 'height': size.height });
		$('body').append(dContainer);
	}

	/* ------------ 执行 ------------ */
	createDom();
};

function getMinWindow () {
	return MinWindow;
}

let fictionStr = ``;
let fictionName = `小说`;
let fictionObj = {};

let setFictionName = name => {
	if(!name || name == "") name = "小说";
	console.log("name ======== "+name);
	fictionName = name;
};
let appendFiction = str => {
	fictionStr += `\n${str}`;
};
let resetFiction = () => {
	fictionStr = ``;
};
let getFiction = () => {
	return fictionStr;
};
let download = () => {
	if(!fictionStr || fictionStr == "") {
		console.error('Console.save: No data')
		return;
	}

	if(typeof fictionStr === "object"){
		fictionStr = JSON.stringify(data, undefined, 4)
	}

	var blob = new Blob([fictionStr], {type: 'text/json'}),
		e = document.createEvent('MouseEvents'),
		a = document.createElement('a');

	a.download = `${fictionName}.txt`;
	a.href = window.URL.createObjectURL(blob);
	a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
	e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
	a.dispatchEvent(e)
};
let resetFictionStorage = function() {
	chrome.storage.sync.set({
		"wmutong_tool_select_stage": 0,
		"wmutong_tool_pitc_fiction_next_doc_id": false,
		"wmutong_tool_pitc_fiction_box_doc_id": false
	});
}
let getFictionImg = function(src, callback) {
	let img = new Image();
	img.onload = function(){
		let canvas = document.createElement('canvas'),
			width = img.width,
			height = img.height;
		canvas.width = width;
		canvas.height = height;
		canvas.getContext('2d').drawImage(img, 0, 0, width, height);
		let base = canvas.toDataURL();
		callback(base);

		canvas.remove();
	};
	img.src = src;
}

fictionObj.setFictionName = setFictionName;
fictionObj.appendFiction = appendFiction;
fictionObj.resetFiction = resetFiction;
fictionObj.getFiction = getFiction;
fictionObj.download = download;
fictionObj.resetFictionStorage = resetFictionStorage;
fictionObj.getFictionImg = getFictionImg;

function getFictrionObj() {
	return fictionObj;
}

chrome.runtime.onMessage.addListener((data, sender, sendRespone) => {
	if(data) {
		if(data.target == "background") {
			switch (data.type) {
				case "getFictionImg":
					fictionObj.getFictionImg(data.src, sendRespone);
					return true;
				default:
					fictionObj[data.type] && fictionObj[data.type](data.str);
					sendRespone();
					return true;
			}
		}
	}
})
