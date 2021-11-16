/*!
 * jQuery ComboTree Plugin
 * Author:  Erhan FIRAT
 * Mail:    erhanfirat@gmail.com
 * Licensed under the MIT license
 * Version: 1.2.1
 * extend: isTitle, title, clickHandler()옵션을 추가.
 */


;(function ( $, window, document, undefined ) {

  // Default settings
  var comboTreePlugin = 'comboTree',
    defaults = {
      source: [],
      isMultiple: false,
      cascadeSelect: false,
      selected: [],
      collapse: false,
      selectableLastNode: false,
      dependentSelect: false, //하위노드 모두가 체크 되어있을때 부모(상위)노드도 체크되어있는뎅 자식노드 하나라도 체크 해제되면 부모노드도 해제해주는 옵션(2021.11.04 이준호 확장 추가)
      isTitle: false, //타이틀을 사용 여부(2021.11.04 이준호 확장추가)
      title: null, //기본 타이틀 값(2021.11.04 이준호 확장추가)
      clickHandler: function(target) {} //클릭시 콜백되는 함수(2021.11.04 이준호 확장추가)
    };

  // LIFE CYCLE
  function ComboTree( element, options ) {

    this.options = $.extend( {}, defaults, options) ;
    this._defaults = defaults;
    this._name = comboTreePlugin;

    this.constructorFunc(element, options);
  }

  ComboTree.prototype.constructorFunc = function(element, options){
    this.elemInput = element;
    this._elemInput = $(element);

    this.init();
  }

  ComboTree.prototype.init = function () {
    // Setting Doms
    this.comboTreeId = 'comboTree' + Math.floor(Math.random() * 999999);

    this._elemInput.addClass('comboTreeInputBox');

    if (this._elemInput.attr('id') === undefined)
      this._elemInput.attr('id', this.comboTreeId + 'Input');
    this.elemInputId = this._elemInput.attr('id');

    this._elemInput.wrap('<div id="'+ this.comboTreeId + 'Wrapper" class="comboTreeWrapper"></div>');
    this._elemInput.wrap('<div id="'+ this.comboTreeId + 'InputWrapper" class="comboTreeInputWrapper"></div>');
    this._elemWrapper = $('#' + this.comboTreeId + 'Wrapper');

    this._elemArrowBtn = $('<div id="' + this.comboTreeId + 'ArrowBtn" class="comboTreeArrowBtn" type="button"><span class="mdi mdi-chevron-down comboTreeArrowBtnImg"></span></div>');
    this._elemInput.after(this._elemArrowBtn);
    this._elemWrapper.append('<div id="' + this.comboTreeId + 'DropDownContainer" class="comboTreeDropDownContainer"><div class="comboTreeDropDownContent"></div>');

    // DORP DOWN AREA
    this._elemDropDownContainer = $('#' + this.comboTreeId + 'DropDownContainer');

    this._elemDropDownContainer.html(this.createSourceHTML());
    this._elemFilterInput = this.options.isMultiple ? $('#' + this.comboTreeId + 'MultiFilter') : null;
    this._elemSourceUl = $('#' + this.comboTreeId + 'ComboTreeSourceUl');

    this._elemItems = this._elemDropDownContainer.find('li');
    this._elemItemsTitle = this._elemDropDownContainer.find('span.comboTreeItemTitle');

    // VARIABLES
    this._selectedItem = {};
    this._selectedItems = [];

    this.processSelected();

    this.bindings();
  };

  ComboTree.prototype.unbind = function () {
    this._elemArrowBtn.off('click');
    this._elemInput.off('click');
    this._elemItems.off('click');
    this._elemItemsTitle.off('click');
    this._elemItemsTitle.off("mousemove");
    this._elemInput.off('keyup');
    this._elemInput.off('keydown');
    this._elemInput.off('mouseup.' + this.comboTreeId);
    $(document).off('mouseup.' + this.comboTreeId);
  }

  ComboTree.prototype.destroy = function () {
    this.unbind();
    this._elemWrapper.before(this._elemInput);
    this._elemWrapper.remove();
    //this._elemInput.removeData('plugin_' + comboTreePlugin);
  }



  // CREATE DOM HTMLs

  ComboTree.prototype.removeSourceHTML = function () {
    this._elemDropDownContainer.html('');
  };

  ComboTree.prototype.createSourceHTML = function () {
    var sourceHTML = '';
    if (this.options.isMultiple)
      sourceHTML = this.createFilterHTMLForMultiSelect();
    sourceHTML += this.createSourceSubItemsHTML(this.options.source);
    return sourceHTML;
  };

  ComboTree.prototype.createFilterHTMLForMultiSelect = function (){
    return '<input id="' + this.comboTreeId + 'MultiFilter" type="text" class="multiplesFilter" placeholder="검색"/>';
  }

  ComboTree.prototype.createSourceSubItemsHTML = function (subItems, parentId) {
    var subItemsHtml = '<UL id="' + this.comboTreeId + 'ComboTreeSourceUl' + (parentId ? parentId : 'main' ) + '" style="' + ((this.options.collapse && parentId) ? 'display:none;' : '')  + '">';
    for (var i=0; i<subItems.length; i++){
      subItemsHtml += this.createSourceItemHTML(subItems[i]);
    }
    subItemsHtml += '</UL>'
    return subItemsHtml;
  }

  ComboTree.prototype.createSourceItemHTML = function (sourceItem) {
    var itemHtml = "",
      isThereSubs = sourceItem.hasOwnProperty("subs");
    let isSelectable = (sourceItem.isSelectable === undefined ? true : sourceItem.isSelectable),
      selectableClass = (isSelectable || isThereSubs) ? 'selectable' : 'not-selectable',
      selectableLastNode = (this.options.selectableLastNode!==undefined && isThereSubs) ? this.options.selectableLastNode : false;

    itemHtml += '<LI id="' + this.comboTreeId + 'Li' + sourceItem.id + '" class="ComboTreeItem' + (isThereSubs?'Parent':'Chlid') + '"> ';

    if (isThereSubs)
      itemHtml += '<span class="comboTreeParentPlus">' + (this.options.collapse ? '<span class="mdi mdi-chevron-right-circle-outline"></span>' : '<span class="mdi mdi-chevron-down-circle-outline"></span>') + '</span>'; // itemHtml += '<span class="comboTreeParentPlus">' + (this.options.collapse ? '+' : '&minus;') + '</span>';

    if (this.options.isMultiple)
      itemHtml += '<span data-id="' + sourceItem.id + '" data-selectable="' + isSelectable + '" class="comboTreeItemTitle ' + selectableClass + '">' + (!selectableLastNode && isSelectable ? '<input type="checkbox" />' : '') + sourceItem.title + '</span>';
    else
      itemHtml += '<span data-id="' + sourceItem.id + '" data-selectable="' + isSelectable + '" class="comboTreeItemTitle ' + selectableClass + '">' + sourceItem.title + '</span>';

    if (isThereSubs)
      itemHtml += this.createSourceSubItemsHTML(sourceItem.subs, sourceItem.id);

    itemHtml += '</LI>';
    return itemHtml;
  };


  // BINDINGS
  ComboTree.prototype.bindings = function () {
    var _this = this;

    $(this._elemInput).focus(function (e) {
      if (!_this._elemDropDownContainer.is(':visible'))
        $(_this._elemDropDownContainer).slideToggle(100);
    });

    this._elemArrowBtn.on('click', function(e){
      e.stopPropagation();
      _this.toggleDropDown();
    });
    this._elemInput.on('click', function(e){
      e.stopPropagation();
      if (!_this._elemDropDownContainer.is(':visible'))
        _this.toggleDropDown();
    });
    this._elemItems.on('click', function(e){
      e.stopPropagation();
      if ($(this).hasClass('ComboTreeItemParent')){
        _this.toggleSelectionTree(this);
      }
    });
    this._elemItemsTitle.on('click', function(e){
      e.stopPropagation();
      if (_this.options.isMultiple) {
        _this.multiItemClick(this);
      } else {
        _this.singleItemClick(this);
      }

      /**
       * 2021.11.04 이준호
       * clickHandler에 현재 클릭된 data 속성값 callback 해주기(확장추가)
       * 체크상태 여부도 같이 보내주기
       */
      var $item = $(this);
      var itemChecked = $item.find("input[type='checkbox']").is(':checked');
      _this.options.clickHandler.call(this, $.extend({'checked': itemChecked}, $item[0].dataset));
      
    });
    this._elemItemsTitle.on("mousemove", function (e) {
      e.stopPropagation();
      _this.dropDownMenuHover(this);
    });

    // KEY BINDINGS
    this._elemInput.on('keyup', function(e) {
      e.stopPropagation();

      switch (e.keyCode) {
        case 27:
          _this.closeDropDownMenu(); break;
        case 13:
        case 39: case 37: case 40: case 38:
          e.preventDefault();
          break;
        default:
          if (!_this.options.isMultiple)
            _this.filterDropDownMenu();
          break;
      }
    });

    this._elemFilterInput && this._elemFilterInput.on('keyup', function (e) {
      e.stopPropagation();

      switch (e.keyCode) {
        case 27:
          if ($(this).val()) {
            $(this).val('');
            _this.filterDropDownMenu();
          } else {
            _this.closeDropDownMenu();
          }
          break;
        case 40: case 38:
          e.preventDefault();
          _this.dropDownInputKeyControl(e.keyCode - 39); break;
        case 37: case 39:
          e.preventDefault();
          _this.dropDownInputKeyToggleTreeControl(e.keyCode - 38);
          break;
        case 13:
          _this.multiItemClick(_this._elemHoveredItem);
          e.preventDefault();
          break;
        default:
          _this.filterDropDownMenu();
          break;
      }
    });

    this._elemInput.on('keydown', function(e) {
      e.stopPropagation();

      switch (e.keyCode) {
        case 9:
          _this.closeDropDownMenu(); break;
        case 40: case 38:
          e.preventDefault();
          _this.dropDownInputKeyControl(e.keyCode - 39); break;
        case 37: case 39:
          e.preventDefault();
          _this.dropDownInputKeyToggleTreeControl(e.keyCode - 38);
          break;
        case 13:
          if (_this.options.isMultiple)
            _this.multiItemClick(_this._elemHoveredItem);
          else
            _this.singleItemClick(_this._elemHoveredItem);
          e.preventDefault();
          break;
        default:
          if (_this.options.isMultiple)
            e.preventDefault();
      }
    });

    // ON FOCUS OUT CLOSE DROPDOWN
    $(document).on('mouseup.' + _this.comboTreeId, function (e){
      if (!_this._elemWrapper.is(e.target) && _this._elemWrapper.has(e.target).length === 0 && _this._elemDropDownContainer.is(':visible'))
        _this.closeDropDownMenu();
    });
  };

  // EVENTS HERE

  // DropDown Menu Open/Close
  ComboTree.prototype.toggleDropDown = function () {
    let _this = this;
    $(this._elemDropDownContainer).slideToggle(100, function () {
      if (_this._elemDropDownContainer.is(':visible'))
        $(_this._elemInput).focus();
    });
  };

  ComboTree.prototype.closeDropDownMenu = function () {
    $(this._elemDropDownContainer).slideUp(100);
  };

  // Selection Tree Open/Close
  ComboTree.prototype.toggleSelectionTree = function (item, direction) {
    var subMenu = $(item).children('ul')[0];
    if (direction === undefined){
      if ($(subMenu).is(':visible'))
        $(item).children('span.comboTreeParentPlus').html('<span class="mdi mdi-chevron-right-circle-outline"></span>'); //$(item).children('span.comboTreeParentPlus').html("+");
      else
        $(item).children('span.comboTreeParentPlus').html('<span class="mdi mdi-chevron-down-circle-outline"></span>'); //$(item).children('span.comboTreeParentPlus').html("&minus;");

      $(subMenu).slideToggle(50);
    }
    else if (direction == 1 && !$(subMenu).is(':visible')){
      $(item).children('span.comboTreeParentPlus').html('<span class="mdi mdi-chevron-down-circle-outline"></span>'); //$(item).children('span.comboTreeParentPlus').html("&minus;");
      $(subMenu).slideDown(50);
    }
    else if (direction == -1){
      if ($(subMenu).is(':visible')){
        $(item).children('span.comboTreeParentPlus').html('<span class="mdi mdi-chevron-right-circle-outline"></span>'); //$(item).children('span.comboTreeParentPlus').html("+");
        $(subMenu).slideUp(50);
      }
      else {
        this.dropDownMenuHoverToParentItem(item);
      }
    }

  };


  // SELECTION FUNCTIONS
  ComboTree.prototype.selectMultipleItem = function(ctItem){

    if (this.options.selectableLastNode && $(ctItem).parent('li').hasClass('ComboTreeItemParent')) {

      this.toggleSelectionTree($(ctItem).parent('li'));

      return false;
    }

    if ($(ctItem).data("selectable") == true) {
      this._selectedItem = {
        id: $(ctItem).attr("data-id"),
        title: $(ctItem).text()
      };

      let check = this.isItemInArray(this._selectedItem, this.options.source);
      if (check) {
        var index = this.isItemInArray(this._selectedItem, this._selectedItems);
        if (index) {
          this._selectedItems.splice(parseInt(index), 1);
          $(ctItem).find("input").prop('checked', false);
        } else {
          this._selectedItems.push(this._selectedItem);
          $(ctItem).find("input").prop('checked', true);
        }
      } // if check
    } // if selectable
  };

  ComboTree.prototype.singleItemClick = function (ctItem) {
    if ($(ctItem).data("selectable") == true) {
      this._selectedItem = {
        id: $(ctItem).attr("data-id"),
        title: $(ctItem).text()
      };
    } // if selectable

    this.refreshInputVal();
    this.closeDropDownMenu();
  };

  ComboTree.prototype.multiItemClick = function (ctItem) {
    this.selectMultipleItem(ctItem);

    /*
    //원본코드
    if (this.options.cascadeSelect) {
      if ($(ctItem).parent('li').hasClass('ComboTreeItemParent')) {
        var subMenu = $(ctItem).parent('li').children('ul').first().find('input[type="checkbox"]');
        subMenu.each(function() {
          var $input = $(this)
          if ($(ctItem).children('input[type="checkbox"]').first().prop("checked")!==$input.prop('checked')) {
            $input.prop('checked', !$(ctItem).children('input[type="checkbox"]').first().prop("checked"));
            $input.trigger('click');
          }
        });
      }
    }
    */
    //부모노드가 선택될경우 하위 노트 모두 선택되기 해제일경우도 모두 해제되기 코드 수정.
    if (this.options.cascadeSelect) {
      if ($(ctItem).parent('li').hasClass('ComboTreeItemParent')) {
        var checked = $(ctItem).find('input[type="checkbox"]').is(':checked');
        var subMenu = $(ctItem).parent('li').children('ul').first().find('input[type="checkbox"]');
        subMenu.each(function() {
          var $inputCheck = $(this);
          if (checked) {
            $inputCheck.prop('checked', true);
          } else {
            $inputCheck.prop('checked', false);
          }
        });
      }
    }
    
    //형제노드가 전부 체크되어있을때 하나라도 체크해제되면 부모노드 체크박스도 해제되는 옵션이 활성화 되었을때
    if (this.options.dependentSelect) { 
      var parent = $(ctItem).parent().parent().parent('li');
      if (!$(ctItem).parent('li').hasClass('ComboTreeItemParent')) { //부모노드가 있을경우
        var parentUl = $(ctItem).closest('ul');
        var childLi = parentUl.children('li'); 
        var childLiChecked = childLi.find('input[type="checkbox"]:checked');
        var parentInput = parent.children('.comboTreeItemTitle').children('input[type="checkbox"]');
        var parentChecked = parentInput.is(':checked');

        if (childLi.length != childLiChecked.length) {
          parentInput.prop('checked', false);
        } else if (childLi.length == childLiChecked.length) {
          parentInput.prop('checked', true);
        }
      }
    }

    this.refreshInputVal();
  };


  // recursive search for item in arr
  ComboTree.prototype.isItemInArray = function (item, arr) {
    for (var i=0; i<arr.length; i++) {
      if (item.id == arr[i].id && item.title == arr[i].title)
        return i + "";

      if (arr[i].hasOwnProperty("subs")) {
        let found = this.isItemInArray(item, arr[i].subs);
        if (found)
          return found;
      }
    }
    return false;
  };

  ComboTree.prototype.refreshInputVal = function () {
    var tmpTitle = "";
    if (this.options.isTitle == false) { //isTitle이 false일경우에만 동작되게
      if (this.options.isMultiple) {
        for (var i=0; i<this._selectedItems.length; i++){
          tmpTitle += this._selectedItems[i].title;
          if (i<this._selectedItems.length-1)
            tmpTitle += ", ";
        }
      }
      else {
        tmpTitle = this._selectedItem.title;
      }  
    } else {
      if (this.options.title != '' || this.options.title != null) {
        tmpTitle = this.options.title;
      }
    }

    this._elemInput.val(tmpTitle);
    this._elemInput.trigger('change');

    if (this.changeHandler)
      this.changeHandler();
  };

  ComboTree.prototype.dropDownMenuHover = function (itemSpan, withScroll) {
    this._elemItems.find('span.comboTreeItemHover').removeClass('comboTreeItemHover');
    $(itemSpan).addClass('comboTreeItemHover');
    this._elemHoveredItem = $(itemSpan);
    if (withScroll)
      this.dropDownScrollToHoveredItem(this._elemHoveredItem);
  }

  ComboTree.prototype.dropDownScrollToHoveredItem = function (itemSpan) {
    var curScroll = this._elemSourceUl.scrollTop();
    this._elemSourceUl.scrollTop(curScroll + $(itemSpan).parent().position().top - 80);
  }

  ComboTree.prototype.dropDownMenuHoverToParentItem = function (item) {
    var parentSpanItem = $($(item).parents('li.ComboTreeItemParent')[0]).children("span.comboTreeItemTitle");
    if (parentSpanItem.length)
      this.dropDownMenuHover(parentSpanItem, true);
    else
      this.dropDownMenuHover(this._elemItemsTitle[0], true);
  }

  ComboTree.prototype.dropDownInputKeyToggleTreeControl = function (direction) {
    var item = this._elemHoveredItem;
    if ($(item).parent('li').hasClass('ComboTreeItemParent'))
      this.toggleSelectionTree($(item).parent('li'), direction);
    else if (direction == -1)
      this.dropDownMenuHoverToParentItem(item);
  }

  ComboTree.prototype.dropDownInputKeyControl = function (step) {
    if (!this._elemDropDownContainer.is(":visible"))
      this.toggleDropDown();

    var list = this._elemItems.find("span.comboTreeItemTitle:visible");
    i = this._elemHoveredItem?list.index(this._elemHoveredItem) + step:0;
    i = (list.length + i) % list.length;

    this.dropDownMenuHover(list[i], true);
  },

    ComboTree.prototype.filterDropDownMenu = function () {
      var searchText =  '';
      if (!this.options.isMultiple)
        searchText = this._elemInput.val();
      else
        searchText = $("#" + this.comboTreeId + "MultiFilter").val();

      if (searchText != ""){
        this._elemItemsTitle.hide();
        this._elemItemsTitle.siblings("span.comboTreeParentPlus").hide();
        list = this._elemItems.filter(function(index, item){
          return item.innerHTML.toLowerCase().indexOf(searchText.toLowerCase()) != -1;
        }).each(function (i, elem) {
          $(this.children).show()
          $(this).siblings("span.comboTreeParentPlus").show();
        });
      }
      else{
        this._elemItemsTitle.show();
        this._elemItemsTitle.siblings("span.comboTreeParentPlus").show();
      }
    }

  ComboTree.prototype.processSelected = function () {
    let elements = this._elemItemsTitle;
    let selectedItem = this._selectedItem;
    let selectedItems = this._selectedItems;
    this.options.selected.forEach(function(element) {
      let selected = $(elements).filter(function(){
        return $(this).data('id') == element;
      });

      if(selected.length > 0){
        $(selected).find('input').attr('checked', true);

        selectedItem = {
          id: selected.data("id"),
          title: selected.text()
        };
        selectedItems.push(selectedItem);
      }
    });

    //Without this it doesn't work
    this._selectedItem = selectedItem;

    this.refreshInputVal();
  };


  // METHODS


  ComboTree.prototype.findItembyId = function(itemId, source) {
    if (itemId && source) {
      for (let i=0; i<source.length; i++) {
        if (source[i].id == itemId)
          return {id: source[i].id, title: source[i].title};
        if (source[i].hasOwnProperty("subs")) {
          let found = this.findItembyId(itemId, source[i].subs);
          if (found)
            return found;
        }
      }
    }
    return null;
  }

  // Returns selected id array or null
  ComboTree.prototype.getSelectedIds = function () {
    if (this.options.isMultiple && this._selectedItems.length>0){
      var tmpArr = [];
      for (i=0; i<this._selectedItems.length; i++)
        tmpArr.push(this._selectedItems[i].id);

      return tmpArr;
    }
    else if (!this.options.isMultiple && this._selectedItem.hasOwnProperty('id')){
      return [this._selectedItem.id];
    }
    return null;
  };

  // Retuns Array (multiple), Integer (single), or False (No choice)
  ComboTree.prototype.getSelectedNames = function () {
    if (this.options.isMultiple && this._selectedItems.length>0){
      var tmpArr = [];
      for (i=0; i<this._selectedItems.length; i++)
        tmpArr.push(this._selectedItems[i].title);

      return tmpArr;
    }
    else if (!this.options.isMultiple && this._selectedItem.hasOwnProperty('id')){
      return this._selectedItem.title;
    }
    return null;
  };

  ComboTree.prototype.setSource = function(source) {
    this._selectedItems = [];

    this.destroy();
    this.options.source = source;
    this.constructorFunc(this.elemInput, this.options);
  };

  ComboTree.prototype.clearSelection = function() {
    for (i=0; i<this._selectedItems.length; i++) {
      let itemElem = $("#" + this.comboTreeId + 'Li' + this._selectedItems[i].id);
      $(itemElem).find("input").prop('checked', false);
    }
    this._selectedItems = [];
    this.refreshInputVal();
  };

  ComboTree.prototype.setSelection = function (selectionIdList) {
    if (selectionIdList && selectionIdList.length && selectionIdList.length > 0) {
      for (let i = 0; i < selectionIdList.length; i++) {
        let selectedItem = this.findItembyId(selectionIdList[i], this.options.source);

        if (selectedItem) {
          let check = this.isItemInArray(selectedItem, this.options.source);
          if (check) {
            var index = this.isItemInArray(selectedItem, this._selectedItems);
            if (!index) {
              let selectedItemElem = $("#" + this.comboTreeId + 'Li' + selectionIdList[i]);

              this._selectedItems.push(selectedItem);
              this._selectedItem = selectedItem;
              $(selectedItemElem).find("input").prop('checked', true);
            }
          }
        }
      }
    }

    this.refreshInputVal();
  };


  // EVENTS

  ComboTree.prototype.onChange = function(callBack) {
    if (callBack && typeof callBack === "function")
      this.changeHandler = callBack;
  };



  // -----

  $.fn[comboTreePlugin] = function (options) {
    var ctArr = [];
    this.each(function () {
      if (!$.data(this, 'plugin_' + comboTreePlugin)) {
        $.data(this, 'plugin_' + comboTreePlugin, new ComboTree( this, options));
        ctArr.push($(this).data()['plugin_' + comboTreePlugin]);
      }
    });

    if (this.length == 1)
      return ctArr[0];
    else
      return ctArr;
  }

})( jQuery, window, document );
