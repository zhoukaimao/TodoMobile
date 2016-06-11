/**
 * Created by Kevin on 2016/6/4.
 * 单击修改，长按选择，左滑操作菜单（完成/取消完成，红旗/取消红旗，删除），右滑完成，点击按钮添加
 * 下拉出现菜单，filter，sort，search
 * swipe 事件
 * clear completed, active count
 */

var CL_COMPLETED = "completed";
var CL_EDITING = "editing";
var CL_IMPORTANT="important";
var guid=0;
var searchMode = false;
/**
 * format date to string
 * @param date
 * @returns {string}
 */
function processDate(date) {
    var NOW = new Date();
    date = new Date(date);
    if ((NOW-date)<=24*60*60*60||date.getDate()==NOW.getDate())return date.getHours()+":"+date.getMinutes();
    else return date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate();
}

/**
 * update items according model data
 */
function update() {
    model.flush();
    var data = model.data;
    var dispItems = [];

    var items = $(".items");
    items.empty();

    /**
     * according to filter, sort, search or anything else
     * select items to show, stored in dispItems
     */
    data.items.forEach(function (itemData) {
        if (
            data.filter == 'All'
            || (data.filter == 'Uncompleted' && !itemData.completed)
            || (data.filter == 'Completed' && itemData.completed)
        ){
            if(searchMode){//in search mode, only display items relative to search item
                if(itemData.msg.indexOf(data.msg)>=0)dispItems.push(itemData);
            }
            else dispItems.push(itemData);
        }
    });
    switch (data.sort){
        case "Default":
            break;
        case "Date-asc":
            dispItems.sort(function (item1,item2) {
                return item1.date > item2.date;
            });
            break;
        case  "Date-desc":
            dispItems.sort(function (item1,item2) {
                return item1.date < item2.date;
            });break;
        case "Flag":
            dispItems.sort(function (item1, item2) {
                return item1.important||(!item1.important&&!item2.important);
            });
            break;
        default:break;
    }
    /**
     * display items in dispItems
     */
    dispItems.forEach(function (itemData) {

        //firstly, create DOM node
        var item = document.createElement("div");
        var id = "item" + guid++;
        item.setAttribute("id",id);
        item.classList.add("item");
        if(itemData.completed)item.classList.add(CL_COMPLETED);
        if(itemData.important)item.classList.add(CL_IMPORTANT);
        item.innerHTML = [
            '<div class="btn">',
            '<img src="img/flag.svg" class="flag" alt="flag">',
            '<img src="img/correct-mark.svg" class="complete" alt="complete">',
            '<img src="img/rubbish-bin-delete-button.svg" class="delete" alt="delete">',
            '</div>',
            '<div class="content">',
                '<label class="text">'+itemData.msg+'</label>',
                '<label class="date">'+processDate(itemData.date)+'</label>',
                '<img src="img/flag.svg">',
            '</div>',
            '<div class="item_sep"></div>'
        ].join('');

        //add various event listeners

        //multiple select
        $(item).on("taphold",function () {
            //to be constructed
            
        });

        //click text to edit
        $(item).find(".content .text").on("click",function () {
            $(item).children().hide();
            var edit = document.createElement('input');
            edit.setAttribute('type', 'text');
            edit.setAttribute('class', 'edit');
            edit.setAttribute('value', this.innerHTML);
            $(edit).on("blur",function () {
                itemData.msg = edit.value;
                itemData.date = new Date().toUTCString();
                update();
            });
            item.appendChild(edit);
            $(edit).focus().select();
        });

        //swipe left or right to show or hide button
        $(item).swipe({
            swipeLeft:function () {
                this.children(".content").animate({
                    right:"100px"
                }, 200);
                this.children(".btn").animate({
                    width:"100px"
                },200);
            },
            swipeRight:function () {
                this.children(".content").animate({
                    right:"0"
                }, 200);
                this.children(".btn").animate({
                    width:"0"
                },200);
            },
            threshold:50
        });

        //add button click listener

        //complete
        $(item).find(".btn .complete").on('click',function () {
            //process button click
            itemData.completed = !itemData.completed;
            update();
        });
        //delete
        $(item).find(".btn .delete").on('click',function () {
            //process button click
            data.history.push(itemData);
            var index = data.items.indexOf(itemData);
            data.items.splice(index,1);
            update();
        });
        //flag
        $(item).find(".btn .flag").on('click',function () {
            //process button click
            itemData.important = !itemData.important;
            update();
        });

        items.prepend(item);//insert into page
    });//end add itemData

    //update title message
    if(searchMode){
        $(".title h3")[0].innerHTML="Search Result<span id='itemCount'></span>";
    }else {
        $(".title h3")[0].innerHTML="Todo List<span id='itemCount'></span>";
    }
    $(".title #itemCount")[0].innerHTML="("+dispItems.length+")";
}//end update

/**
 * init web page and init model data
 */
window.onload = function () {
    var data ={};
    model.init(function () {
        data = model.data;
        data.msg="";
    });

    //add tool bar event listener
    var showOpt =false;
    $(".filter").on('tap',function () {//tap to show options which are hide default
        //process select filter
        if(!showOpt){
            showOpt=true;
            var filterOpt = $(".filter-opt");
            filterOpt.show();
            filterOpt.animate({
                height:"100%"
            },200);
        }
    });
    $(".filter-opt .option").on("click",function (event) {//tap to select filter
        event.stopPropagation();
        var filterOpt = $(".filter-opt");
        filterOpt.animate({
            height:"0"
        },200);
        filterOpt.hide();
        showOpt=false;
        data.filter=this.id;
        update();
    });
    $(".sort").on('tap',function () {//tap to show sort options
        //process select change
        if(!showOpt){
            showOpt=true;
            var sortOpt = $(".sort-opt");
            sortOpt.show();
            sortOpt.animate({
                height:"100%"
            },200);
        }
    });
    $(".sort-opt .option").on("click",function (event) {//tap to select sort option
        event.stopPropagation();
        var sortOpt = $(".sort-opt");
        sortOpt.animate({
            height:"0"
        },200);
        sortOpt.hide();
        showOpt=false;
        data.sort = this.id;
        update();
    });

    $(".searchInput").keydown(function (event) {//search input event
        //process click
        if(event.keyCode==13){
            var msg = this.value;
            if(msg){
                data.msg=msg;
                this.value="";
                searchMode = true;
                update();
            }
        }
    });

    //add body swipe event listener
    var itemsOffset = 0;
    var toolShow = false;
    $("body").swipe({
        //swipe up to show tool or scroll items
        swipeUp:function(event, direction, distance, duration, fingerCount) {
            if(toolShow){
                $(".tool").hide();
                toolShow=false;
            }
            else{
                itemsOffset=distance;
                $(".items").animate({
                    top:"-"+itemsOffset+"px"
                },500);
            }
        },
        //swipe down to hide tool or scroll items
        swipeDown:function(event, direction, distance, duration, fingerCount) {
            if(itemsOffset==0){
                $(".tool").show();
                toolShow =true;
            }
            else{
                if(distance>=itemsOffset)itemsOffset=0;
                else itemsOffset -= distance;
                $(".items").animate({
                    top:"-"+itemsOffset+"px"
                },500);
            }
        },
        //swipe left to switch to search mode
        swipeLeft:function (event, direction, distance, duration, fingerCount) {
            if(data.msg){
                searchMode=true;
                update();
            }
        },
        //swipe right to switch to default mode
        swipeRight:function (event, direction, distance, duration, fingerCount) {
            searchMode=false;
            update();
        },
        threshold:150
    });

    //button click event listener
    $("#add").on('click',function () {
        $(".items").hide();
        $(".newTodo").show();
        $(".newTodo_text").focus().select();
    });
    $("#submit").on('click',function () {
        var msg = $(".newTodo_text")[0].value;
        if(msg){
            $(".items").show();
            $(".newTodo").hide();
            var newItem = {msg:msg,date:new Date().toUTCString(),important:false,completed:false};
            data.items.push(newItem);
            $(".newTodo_text")[0].value="";
            update();
        }
    });
    $("#cancel").on('click',function () {
        $(".items").show();
        $(".newTodo").hide();
    });

    update();
};//end window onload
