(function (window, $) {
    var Tree = window.Tree = function (ele, arg) {
        var _this = this;
        this.target = $("#" + ele);
        $.extend(this, Tree.prototype.settins, arg);
        this.init = function (res) {
            this.target.html("").addClass("tree");
            var ul = $("<ul></ul>").appendTo(this.target);
            this._createNodes(res, ul, 0);
            if (this.checkOnlyLeaf) {
                this._dealCheckState(ul.find(">li").eq(0));
            }
        }
        this._createNodes = function (res, ul, deep) {
            var li = $("<li></li>").appendTo(ul).data("data", res);
            res.__target = li;
            //只要有ChildNodes属性就认为不是叶子节点
            var isleaf = res.ChildNodes == undefined;
            var div = $("<div></div>").appendTo(li);
            if (this.hoverRow) {
                div.addClass("tree-hover");
            }
            div.click(function (evt) {
                if (evt.target.tagName == "DIV") {
                    if (_this.nodeClickType == "click" && typeof (_this.nodeClick) == "function") {
                        //单击事件时
                        _this.nodeClick.apply(evt.target, [$(this).parent().data("data")]);
                    } else if (_this.nodeClickType == "expand") {
                        //展开操作时
                        if ($(this).parent().children("ul").length == 0) return;
                        if ($(this).children(".tree-dir").hasClass("tree-open")) {
                            $(this).children(".tree-dir").removeClass("tree-open").addClass("tree-close");
                            $(this).children(".tree-dir").parent().parent().children("ul").hide("fast");
                        } else {
                            $(this).children(".tree-dir").removeClass("tree-close").addClass("tree-open");
                            $(this).children(".tree-dir").parent().parent().children("ul").show("fast");
                        }
                    } else if (_this.nodeClickType == "check") {
                        //选中状态时
                        _this.checkNode.apply($(this).children(".tree-chk"));
                    }
                }
            });
            var icon_arr, icon_chk, icon_img;
            if (!isleaf) {
                //当有子节点时
                icon_arr = $("<span class='tree-dir'></span>").appendTo(div);
                if (this.expandAll || (this.expandFirst && deep == 0) || res.Open) {
                    icon_arr.addClass("tree-open");
                } else {
                    icon_arr.addClass("tree-close");
                }
                icon_arr.click(function () {
                    if ($(this).hasClass("tree-open")) {
                        $(this).removeClass("tree-open").addClass("tree-close");
                        $(this).parent().parent().children("ul").hide("fast");
                    } else {
                        $(this).removeClass("tree-close").addClass("tree-open");
                        $(this).parent().parent().children("ul").show("fast");
                    }
                });
            } else {
                icon_arr = $("<span class='tree-dir'></span>").appendTo(div);
            }
            if (this.forceChk == 1 || (this.forceChk == 0 && res.ShowCheckBox)) {
                //强制显示复选框或由数据指定
                icon_chk = $("<span class='tree-chk'></span>").appendTo(div);
                if (this.checkOnlyLeaf) {
                    if (isleaf) {
                        if (res.Checked) {
                            icon_chk.addClass("tree-chk-all");
                            if (this.selectRow) {
                                div.addClass("select-row");
                            }
                        } else {
                            icon_chk.addClass("tree-chk-none");
                        }
                    }
                } else {
                    if (res.Checked) {
                        icon_chk.addClass("tree-chk-all");
                        if (this.selectRow) {
                            div.addClass("select-row");
                        }
                    } else {
                        icon_chk.addClass("tree-chk-none");
                    }
                }
                icon_chk.click(function (arg) {
                    _this.checkNode.apply(this);
                });
            }
            if (this.forceImg == 1 || (this.forceImg == 0 && res.ShowImg)) {
                //强制显示图片或由数据指定
                icon_img = $("<span class='tree-img'></span>").appendTo(div);
                if (res.ImgCls) {
                    icon_img.addClass(res.ImgCls);
                } else {
                    icon_img.addClass(this.defaultImg);
                }
            }
            var nodeText = $("<span class='tree-text'></span>").appendTo(div);
            nodeText.html(res.Text);
            if (res.ChildNodes && res.ChildNodes.length > 0) {
                //生成子节点
                var ul2 = $("<ul></ul>").appendTo(li);
                if (this.expandAll || (this.expandFirst && deep == 0) || res.Open) {

                } else {
                    ul2.hide();
                }
                deep++;
                for (var i = 0; i < res.ChildNodes.length; i++) {
                    this._createNodes(res.ChildNodes[i], ul2, deep);
                }
                deep--;
                //处理子节点的复选框
                if (this.forceChk == 1 || (this.forceChk == 0 && res.ShowCheckBox)) {
                    //todo 
                    //强制显示复选框或由数据指定
                    if (res.Checked) {
                        if (this.casecadeSelect) {
                            div.find(".tree-chk").attr("class", "tree-chk tree-chk-all");
                        }
                    }
                }
            }
        }
        this._dealCheckState = function (li) {
            var lis = li.find(">ul>li");
            for (var i = 0; i < lis.length; i++) {
                this._dealCheckState(lis.eq(i));
            }
            var chk = li.find(">div>.tree-chk");
            var chks = li.find(">ul>li>div>.tree-chk");
            var chk_nos = chks.filter(".tree-chk-none");
            var chk_alls = chks.filter(".tree-chk-all");
            var chk_parts = chks.filter(".tree-chk-part");
            if (chk_parts.length > 0) {
                chk.attr("class", "tree-chk tree-chk-part");
            } else if (chk_alls.length > 0 && chk_nos.length > 0) {
                chk.attr("class", "tree-chk tree-chk-part");
            } else if (chk_alls.length == 0 && chk_nos.length > 0) {
                chk.attr("class", "tree-chk tree-chk-none");
            } else if (chk_alls.length > 0 && chk_nos.length == 0) {
                chk.attr("class", "tree-chk tree-chk-all");
            }
        }
        this.checkNode = function (checked, right) {
            //是否要设置为选中
            if (checked == undefined) {
                checked = !($(this).hasClass("tree-chk-all") || $(this).hasClass("tree-chk-part"));
            }
            //当前节点是否是叶子节点
            var isleaf = $(this).parent().parent().children("ul").length == 0;
            if (!_this.checkOnlyLeaf) {
                //复选框的模式为父节点和叶子节点同等时
                //此时父节点和叶子节点不进行联动
                //此时不用区分当前节点是否是叶子节点
                if (!checked) {
                    //取消选中操作使用beforeUnCheck回调拦截
                    if (typeof (_this.beforeUnCheck) == "function") {
                        //使用回调函数beforeUnCheck
                        if (_this.beforeUnCheck.apply(this, [$(this).parent().parent().data("data")]) == false) {
                            return;
                        }
                    }
                    $(this).attr("class", "tree-chk tree-chk-none");
                    if (_this.selectRow) {
                        $(this).parent().removeClass("select-row");
                    }
                } else {
                    //选中操作使用beforeCheck回调拦截
                    if (typeof (_this.beforeCheck) == "function") {
                        //使用回调函数beforeCheck
                        if (_this.beforeCheck.apply(this, [$(this).parent().parent().data("data")]) == false) {
                            return;
                        }
                    }
                    $(this).attr("class", "tree-chk tree-chk-all");
                    if (_this.selectRow) {
                        $(this).parent().addClass("select-row");
                    }
                }
                if (typeof (_this.afterCheck) == "function") {
                    //使用回调函数afterCheck
                    _this.afterCheck.apply(this, [checked, $(this).parent().parent().data("data")]);
                }
            } else {
                //复选框的模式为只选中子节点时
                //此时父节点和叶子节点要进行联动
                if (isleaf) {
                    //当前节点是叶子节点时
                    if (!checked) {
                        //取消选中操作使用beforeUnCheck回调拦截
                        if (typeof (_this.beforeUnCheck) == "function") {
                            //使用回调函数beforeUnCheck
                            if (_this.beforeUnCheck.apply(this, [$(this).parent().parent().data("data")]) == false) {
                                return;
                            }
                        }
                        $(this).attr("class", "tree-chk tree-chk-none");
                        if (_this.selectRow) {
                            $(this).parent().removeClass("select-row");
                        }
                    } else {
                        //选中操作使用beforeCheck回调拦截
                        if (typeof (_this.beforeCheck) == "function") {
                            //使用回调函数beforeCheck
                            if (_this.beforeCheck.apply(this, [$(this).parent().parent().data("data")]) == false) {
                                return;
                            }
                        }
                        $(this).attr("class", "tree-chk tree-chk-all");
                        if (_this.selectRow) {
                            $(this).parent().addClass("select-row");
                        }
                    }
                    if (typeof (_this.afterCheck) == "function") {
                        //使用回调函数afterCheck
                        _this.afterCheck.apply(this, [checked, $(this).parent().parent().data("data")]);
                    }
                    //父节点联动
                    if (right == undefined) {
                        //当子节点联动结束后处理父节点的联动
                        _this._backChk.apply(this, [checked]);
                    }

                } else {
                    //当前节点为非叶子节点
                    var chks = $(this).parent().parent().find(">ul>li>div>.tree-chk");
                    for (var i = 0; i < chks.length; i++) {
                        //循环遍历所有的子节点
                        _this.checkNode.apply(chks[i], [checked, true]);
                    }
                    var chk_nos = chks.filter(".tree-chk-none");
                    var chk_alls = chks.filter(".tree-chk-all");
                    var chk_parts = chks.filter(".tree-chk-part");
                    if (chk_parts.length > 0) {
                        $(this).attr("class", "tree-chk tree-chk-part");
                    } else if (chk_alls.length > 0 && chk_nos.length > 0) {
                        $(this).attr("class", "tree-chk tree-chk-part");
                    } else if (chk_alls.length == 0 && chk_nos.length > 0) {
                        $(this).attr("class", "tree-chk tree-chk-none");
                    } else if (chk_alls.length > 0 && chk_nos.length == 0) {
                        $(this).attr("class", "tree-chk tree-chk-all");
                    }
                    //父节点联动
                    if (right == undefined) {
                        //当子节点联动结束后处理父节点的联动
                        _this._backChk.apply(this, [checked]);
                    }
                }
            }
        }
        this._backChk = function (checked) {
            var parentChk = $(this).parent()/*div*/.parent()/*li*/.parent()/*ul*/.parent()/*li*/.find(">div>.tree-chk");
            if (parentChk.length == 0) {
                return;
            }
            var chks = $(this).parent()/*div*/.parent()/*li*/.parent()/*ul*/.find(">li>div>.tree-chk");
            if (chks.length == 1) {
                parentChk.attr("class", "tree-chk tree-chk-all");
            } else {
                var chk_nos = chks.filter(".tree-chk-none");
                var chk_alls = chks.filter(".tree-chk-all");
                var chk_parts = chks.filter(".tree-chk-part");
                if (chk_parts.length > 0) {
                    parentChk.attr("class", "tree-chk tree-chk-part");
                } else if (chk_alls.length > 0 && chk_nos.length > 0) {
                    parentChk.attr("class", "tree-chk tree-chk-part");
                } else if (chk_alls.length == 0 && chk_nos.length > 0) {
                    parentChk.attr("class", "tree-chk tree-chk-none");
                } else if (chk_alls.length > 0 && chk_nos.length == 0) {
                    parentChk.attr("class", "tree-chk tree-chk-all");
                }
            }
            _this._backChk.apply(parentChk[0], [checked]);
        }
        this.getCheck = function () {
            //返回所有选中的节点
            var res = [];
            this._getCheck(this.target.find(">ul>li")[0], res);
            return res;
        }
        this._getCheck = function (target, res) {
            var chk = $(target).find(">div>.tree-chk");
            if (this.checkOnlyLeaf) {
                var lis = $(target).find(">ul>li");
                if (lis.length == 0) {
                    if ($(target).find(">div>.tree-chk").hasClass("tree-chk-all")) {
                        res.push($(target).data("data"));
                    }
                } else {
                    for (var i = 0; i < lis.length; i++) {
                        this._getCheck(lis[i], res);
                    }
                }
            } else {
                if ($(target).find(">div>.tree-chk").hasClass("tree-chk-all")) {
                    res.push($(target).data("data"));
                }
                var lis = $(target).find(">ul>li");
                for (var i = 0; i < lis.length; i++) {
                    this._getCheck(lis[i], res);
                }
            }
        }
        this.expand2Checked = function (forceDeep, showUnCheck) {
            //展开到选中的节点,强制展开到的深度,是否显示不被选中的


        }
    }
    Tree.prototype.settins = {
        forceImg: 0,//是否强制显示图片,优先级最高,0-无操作,1-强制显示所有,2-强制关闭所有
        forceChk: 0,//是否强制显示复选框,优先级最高,0-无操作,1-强制显示所有,2-强制关闭所有
        defaultImg: "tree-dept",//默认的图片
        checkOnlyLeaf: true,//复选框的是否只选中叶子节点
        expandAll: false,//是否展开所有的节点
        expandFirst: true,//是否展开第一级节点
        expandSelected: true,//是否展开所有选中的节点
        selectRow: true,//是否对选中的节点行上色
        hoverRow: true,//是否在鼠标悬停到节点时高亮显示
        nodeClickType: "expand",//"expand"|"click"|"check"单击行文本时是展开子节点还是触发事件还是选中节点
        nodeClick: function () { },//单击文本的点击事件,当textClickType的值为"click"时有效
        beforeCheck: function () { },//选中节点前触发
        beforeUnCheck: function () { },//取消选中节点前触发
        afterCheck: function () { }//选中节点或取消训中节点后触发
    };
})(window, jQuery);

/**
checkOnlyLeaf:复选框的选择模式
    为true:表示只关注叶子节点的选中状态,非叶子节点将有三种状态(不选中,选中部分,选中全部),在获取选中的节点时也只会获取叶子节点
    为false:表示叶子节点和非叶子节点互不影响

*/