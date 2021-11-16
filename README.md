# [ComboTree jQuery Plugin](https://github.com/erhanfirat/combo-tree) v 1.2.1
ComboTree is a jQuery Plugin which is a combobox item within tree structured data list and multiple/single selection options and more. It has been developed to manage large amount of choices in a combobox and multi selection feature. 


## 옵션 확장 추가
- **dependentSelect**: *{true/false} | default: false* | 하위 노드가 모두 체크 되어있을경우 (상위) 노드가 체크 되어있을 경우(cascadeSelect:true) 자식노드가 하나라도 체크 해제되면 부모노드도 체크해제 해주는 옵션
- **isTitle**: *{true/false} | default: false* | 타이틀 사용 유무
- **title**: *{String} | default: null* | 타이틀을 사용할 경우 타이틀 내용
- **clickHandler: function(target) {}**: *{function()} | 노드를 클릭시 콜백 되는 메서드


## 사용법
- 아래 기본 사용법에서 확장 옵션을 추가한 사용방법

```html
<input type="text" name="layerType" id="layerType" readonly="readonly" placeholder="combobox" autocomplete="off"/>
```

```javascript
var comboTree = $('#comboTree').comboTree({
    source : SampleJSONData,
    isMultiple: true,
    cascadeSelect: true,
    dependentSelect: true,
    collapse: true,
    isTitle: true, //확장
    title: '타이틀제목', //확장
    clickHandler: function(callback) { //확장
        //callback은 json형태로 반환된다.
        //source에서 jsonData로 만들어진 내용이 들어간다.
        //체크상태에 따라 checked: Y|N 값이 반환된다.
    },
    selected: checkedList
});
```

## 1.2.1 Updates
- Filter is fixed & updated.
- icontains.js dependency is deprecated. 

## Features:
- Tree structured data list in combobox dropdown menu
- Multiple & Single selection
- Cascade selection (for multiple mode)
- Returns selected item(s) as title or id array
- Filtering (for multiple mode)
- Consumes JSON source
- Key controls are available for both selection and filter inputs.

 
## Dependencies:
- jQuery
 
## Configurations:
- **isMultiple**: *{true/false} | default: false* | decide if it is multiple selection behaviour or single
- **cascadeSelect**: *{true/false} | default: false* | decide if parent selection should cascade to children in multiple selection
- **source**: *{JSON Data Array}* | takes source of combobox dropdown menu as a JSON array.
- **selected**: *{JSON Data Array}* | takes the list of ID's that corespond from the source.
- **collapse**: *{true/false} | default: false* | makes sub lists collapsed.

## Methods
- **getSelectedIds()**: Returns selected item(s) id list as array or null. *(i.e. [12, 5, 7], [7], null)*
- **getSelectedNames()**: Returns selected item(s) name list as array or null. *(i.e. ["Piegon", "Cat", "Horse"], ["Lion"], null)*
- **setSource()**: You can initialize ComboTree then set source after your JSON data is retrieved.
- **clearSelection()**: Clear selected items.
- **setSelection(selectionIdList)**: Set selected values of combotree by id array or single id parameter. If you want to clear previous selections please use *clearSelection()* before *setSelection()*.  *(i.e. ct1.setSelection([12, 5, 7]) | ct1.setSelection(5)*

## Events
- **onChange(callBackFunction)**: Triggers after selection changes.


## Usage

There should be an input element to apply and a JSON Data source.

	comboTree1 = $('#justAnInputBox').comboTree({
		source : SampleJSONData,
		isMultiple: true,
		cascadeSelect: true,
		selected: ['0']
	});

	// Array, One title/id, or False value return
	var selectedTitles = comboTree1.getSelectedItemsTitle();
	var selectedIds = comboTree1.getSelectedItemsId();
	
	// To remove plugin
	comboTree1.destroy();
	


## Source

Three parameter are needed: id, title and subs.

	var SampleJSONData = [
        {
            id: 0,
            title: 'Horse'
        }, {
            id: 1,
            title: 'Birds',
            subs: [
                {
                    id: 10,
                    title: 'Piegon'
                }, {
                    id: 11,
                    title: 'Parrot'
                }, {
                    id: 12,
                    title: 'Owl'
                }, {
                    id: 13,
                    title: 'Falcon'
                }
            ]
        }, {
            id: 2,
            title: 'Rabbit'
        }, {
            id: 3,
            title: 'Fox'
        }, {
            id: 5,
            title: 'Cats',
            subs: [
                {
                    id: 50,
                    title: 'Kitty'
                }, {
                    id: 51,
                    title: 'Bigs',
                    subs: [
                        {
                            id: 510,
                            title: 'Cheetah'
                        }, {
                            id: 511,
                            title: 'Jaguar'
                        }, {
                            id: 512,
                            title: 'Leopard'
                        }
                    ]
                }
            ]
        }, {
            id: 6,
            title: 'Fish'
        }
    ];
