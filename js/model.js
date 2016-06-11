/**
 * Created by Kevin on 2016/6/4.
 */
window.model={
  data:{
      items: [
          //{mag: "", date:new Date(), important:false, completed:false}
      ],
      history:[],
      msg:"",//search msg
      filter:"All",//All,Completed,Uncompleted
      sort:"Default"//Default, Date-asc,Date-desc,Flag
  },
    TOKEN:"TodoMobile"
    // data provider interface
    // init: null
    // flush: null
};