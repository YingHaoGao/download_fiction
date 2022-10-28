// 注意，必须设置了run_at=document_start 此段代码才会生效
document.addEventListener('DOMContentLoaded', function()
{
    // 处理亲亲小说页面报错
    let qinqin_error = function() {
        $("body").unbind();

        $("body").removeAttr("oncontextmenu");
        $("body").removeAttr("ondragstart");
        $("body").removeAttr("onselectstart");
        $("body").removeAttr("oncopy");
        $("body").removeAttr("onselect");
        $("body").removeAttr("onbeforecopy");
        $("body").removeAttr("onmouseup");
    };
    qinqin_error();

    // 第一版主使用 img 显示部分图片的应对
    let dybz_img_replace = function() {
        let href = location.href;

        if(href.indexOf("diyibanzhu") > -1) {
            let imgs = "男人啊爱按暴醫逼擦潮操插吃抽处床春唇刺粗大洞逗硬儿反犯峰妇抚夫腹干搞根公宫勾股狠花滑坏魂鸡激夹奸交叫娇姐禁精进紧菊渴口裤胯快浪力楼乱裸妈毛迷靡妹摸嫩母娘尿咛女哦趴喷婆屁气枪窃骑妻情亲裙热日肉揉乳软润入塞骚色上舌射身深湿兽受舒爽水睡酥死烫痛舔天体挺头腿脱味慰吻握喔污下小性胸血穴阳痒药腰夜液野衣姨吟淫荫幽诱尤欲吁玉吮窄占征汁嘴,。.慾丢弄";

            for(let i = 1; i <= 168; i++) {
                $(`em.n_${i}`).text(imgs[i-1]);
            }
        }
    };

    // 识别图片文字
    let tesseract = function($target = $("body")) {
        let imgs = $target.find("img");

        return new Promise((resolve, reject) => {
            let getFictionImg = i => {
                if(i < imgs.length) {
                    let src = imgs[i].src;
                    chrome.runtime.sendMessage({origin: "inject", target: "background", type: "getFictionImg", src: src}, function (base64){
                        const { createWorker } = Tesseract;
                        const worker = createWorker({
                            workerPath: chrome.runtime.getURL('js/worker.min.js'),
                            langPath: chrome.runtime.getURL('lang-data'),
                            corePath: chrome.runtime.getURL('js/tesseract-core.wasm.js'),
                            logger: m => {
                                if($("#mutong_fiction_loading").length) {
                                    let sType = "";
                                    switch (m.status) {
                                        case "loading tesseract core":
                                            sType = "加载算法";
                                            break;
                                        case "initializing tesseract":
                                            sType = "初始化算法";
                                            break;
                                        case "loading language traineddata":
                                            sType = "加载语言";
                                            break;
                                        case "initializing api":
                                            sType = "初始化api";
                                            break;
                                        case "recognizing text":
                                            sType = "提取文字";
                                            break;
                                        default:
                                            sType = "";
                                            break;
                                    }

                                    $("#mutong_fiction_loading").find("span").text(` ${sType} - ` + (m.progress.toFixed(2)*100).toFixed(0) + `%(${i+1}/${imgs.length})`)
                                }
                            },
                        });

                        (async () => {
                            await worker.load();
                            await worker.loadLanguage('chi_sim');
                            await worker.initialize('chi_sim');
                            const { data: { text } } = await worker.recognize(base64);
                            //这里我使用了我自己的图片目录，
                            //在实际使用时需要改成你自己的图片路径
                            await worker.terminate();

                            $(imgs[i]).text(text);
                            i++;
                            getFictionImg(i);
                        })();
                    })
                }
                else {
                    if($("#mutong_fiction_loading").length) $("#mutong_fiction_loading").remove();
                    resolve();
                }
            };

            if(imgs.length) {
                let $loading = $("<div id='mutong_fiction_loading' style='position: fixed;z-index: 999999999;background: rgba(0, 0, 0, 0.7);color: #fff;font-size: 24px;padding: 100px 0px;text-align: center;top: 0px;left: 0px;right: 0px;bottom: 0px;'>处理中，请等待 <span>0%</span></div>");
                $("html").append($loading);
                getFictionImg(0);
            }
            else {
                resolve();
            }
        });

        // html2canvas($("#chaptercontent")[0], { letterRendering: 1, allowTaint : true, onrendered : function (canvas) {
        //         console.log(canvas.toDataURL())
        //     } }).then(canvas => {
        //     console.log(canvas.toDataURL())
        //     Tesseract.recognize(canvas.toDataURL())
        //         .then(function (result) { console.log('result', result) })
        // });
    };

    // 轮询页面的处理
    let appendFiction = function() {
        chrome.storage.sync.get(
            ["wmutong_tool_select_stage", "wmutong_tool_pitc_fiction_next_doc_id", "wmutong_tool_pitc_fiction_box_doc_id"],
            function(result) {
                if(result.wmutong_tool_select_stage == 3) {
                    if(result.wmutong_tool_pitc_fiction_box_doc_id) {
                        dybz_img_replace();

                        let classStr = '';
                        let wmutong_tool_pitc_fiction_box_doc_id = JSON.parse(result.wmutong_tool_pitc_fiction_box_doc_id);

                        if(wmutong_tool_pitc_fiction_box_doc_id.class && wmutong_tool_pitc_fiction_box_doc_id.class.length) wmutong_tool_pitc_fiction_box_doc_id.class.map(s => { if(s != "") {classStr += `.${s}`} });
                        else if(wmutong_tool_pitc_fiction_box_doc_id.id) classStr = `#${wmutong_tool_pitc_fiction_box_doc_id.id}`;

                        if(!$(classStr).length) {
                            if(wmutong_tool_pitc_fiction_box_doc_id.class && wmutong_tool_pitc_fiction_box_doc_id.class.length) classStr = `.${wmutong_tool_pitc_fiction_box_doc_id.class[0]}`;
                            else if(wmutong_tool_pitc_fiction_box_doc_id.id) classStr = `#${wmutong_tool_pitc_fiction_box_doc_id.id}`;
                        }

                        tesseract($(classStr)).then(() => {
                            let fictionStr = $(classStr).text();

                            chrome.runtime.sendMessage({origin: "inject", target: "background", type: "appendFiction", str: fictionStr}, data => {
                                if(result.wmutong_tool_pitc_fiction_next_doc_id) {
                                    let nextClassStr = '';
                                    let wmutong_tool_pitc_fiction_next_doc_id = JSON.parse(result.wmutong_tool_pitc_fiction_next_doc_id);

                                    if(wmutong_tool_pitc_fiction_next_doc_id.class && wmutong_tool_pitc_fiction_next_doc_id.class.length) wmutong_tool_pitc_fiction_next_doc_id.class.map(s => { if(s != "") {nextClassStr += `.${s}`} });
                                    else if(wmutong_tool_pitc_fiction_next_doc_id.id) nextClassStr = `#${wmutong_tool_pitc_fiction_next_doc_id.id}`;

                                    setTimeout(() => {
                                        console.log("nextClassStr")
                                        $(nextClassStr)[0] && $(nextClassStr)[0].click();
                                    }, 500);
                                }
                                else {
                                    console.log("length _ download")
                                    chrome.runtime.sendMessage({origin: "inject", target: "background", type: "download"}, data => {
                                        chrome.runtime.sendMessage({origin: "inject", target: "background", type: "resetFiction"});
                                        chrome.runtime.sendMessage({origin: "inject", target: "background", type: "resetFictionStorage"});
                                    });
                                }

                                setTimeout(() => {
                                    console.log("4 _ download")
                                    chrome.runtime.sendMessage({origin: "inject", target: "background", type: "download"}, data => {
                                        chrome.runtime.sendMessage({origin: "inject", target: "background", type: "resetFiction"});
                                        chrome.runtime.sendMessage({origin: "inject", target: "background", type: "resetFictionStorage"});
                                    });
                                }, 4000);
                            });
                        });
                    }
                }
            }
        );
    };
    appendFiction();

    // 移入小说容器doc
    let selectDoc = function(e) {
        chrome.storage.sync.get(["wmutong_tool_select_stage"], function(result){
            if(result.wmutong_tool_select_stage == 1 && !$(e.target).hasClass("tools_select_doc")) {
                $(e.target).addClass("tools_select_doc");
            }
        });
    };
    // 移出小说容器doc
    let unselectDoc = function(e) {
        $(".tools_select_doc").removeClass("tools_select_doc");
    };
    // 选中下一页
    let pitchNext = function(e) {
        let $target = $(e.target);
        let classes = [];
        let id = "";

        if($target.attr("class")) {
            classes = $target.attr("class").replace(" tools_select_doc", "").split(" ");
        }
        if($target.attr("id")) id = $target.attr("id");

        chrome.storage.sync.set({
            "wmutong_tool_select_stage": 3,
            "wmutong_tool_pitc_fiction_next_doc_id": JSON.stringify({ class: classes, id: id })
        });
    };
    // 选中小说容器doc
    let pitchDoc = function(e) {
        let $target = $(e.target);
        let classes = [];
        let id = false;

        dybz_img_replace();

        if($target.attr("class")) {
            let newClassStr = $target.attr("class").replace("tools_select_doc", "");
            if(newClassStr.indexOf(" ") > -1) classes = newClassStr.split(" ");
            else if(newClassStr != "") classes = [newClassStr];
        }

        if($target.attr("id")) id = $target.attr("id");
        if(!classes.length && !id) {
            let $parents = $target.parents("[class]");
            if($parents.length) {
                let newClassStr = $parents.eq(0).attr("class").replace("tools_select_doc", "");
                if(newClassStr.indexOf(" ") > -1) classes = newClassStr.split(" ");
                else if(newClassStr != "") classes = [newClassStr];

                $target = $parents;
            }
        }

        tesseract($target).then(() => {
            chrome.runtime.sendMessage({origin: "inject", target: "background", type: "setFictionName", str: $("title").text()})
            chrome.runtime.sendMessage({origin: "inject", target: "background", type: "resetFiction"}, data => {
                console.log("resetFiction")
                chrome.runtime.sendMessage({origin: "inject", target: "background", type: "appendFiction", str: $target.text()}, data => {
                    console.log("appendFiction")
                    chrome.storage.sync.set({
                        "wmutong_tool_select_stage": 2,
                        "wmutong_tool_pitc_fiction_box_doc_id": JSON.stringify({ class: classes, id: id })
                    });
                    alert("请在页面中点击小说翻页操作");

                    $(document).off("mousedown", ".tools_select_doc", pitchDoc);
                    $(document).off("mousedown", pitchNext).on("mousedown", pitchNext);
                });
            });
        });
    }

    $(document).off("mouseover", selectDoc).on("mouseover", selectDoc);
    $(document).off("mouseout", unselectDoc).on("mouseout", unselectDoc);
    $(document).off("mousedown", ".tools_select_doc", pitchDoc).on("mousedown", ".tools_select_doc", pitchDoc);
});
