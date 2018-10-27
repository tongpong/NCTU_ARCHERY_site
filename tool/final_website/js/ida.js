
 $(function() {
	check_alarm()
   csmapi.set_endpoint('http://140.113.199.203:9999');
   var profile = {
     'dm_name': 'website',
     'idf_list': [],
     'odf_list': [web_odf],
   };
   var stop_btn=$('.result')[1]
   stop_btn.onclick = function(){
	   if(alarming){
		 alarming=0;
		 $('.result')[0].innerText = "";
		 $('.result')[0].innerText = "";
	 }
   }
   var alarming=1;
   
   function web_odf(data) {
     //$('.ODF_value')[0].innerText = data[0];
     //console.log(data[0]);
     if (data[0] == 1) {
       $('.result')[0].innerText = "You Falling Down :(";
	   $('.result')[1].innerText = "Click to Stop";
	   alarming=1;
       //shake();
     }
	 
   }
   function check_alarm(){
	   console.log("window.Notification.permission")
	   navigator.serviceWorker.register('sw.js');
       window.Notification.permission = "granted";
	   if(window.Notification){
		    if(window.Notification.permission != "granted"){
				 window.Notification.requestPermission();
			}
	   }
	   else alert('your browers do not support alarming!!!');
   }
   function showNotification() {
		navigator.serviceWorker.register('sw.js');
        window.Notification.permission = "granted";
        alert(window.Notification.permission);
            if(window.Notification) {
                if(window.Notification.permission == "granted") {
					var notification = new Notification('Falling Alarm', {
                        body: "You Falling Down :("
                    });
                    //setTimeout(function() { notification.close(); }, 5000);
				}
				else {
                        window.Notification.requestPermission();
                    }
            } 
			else alert('your browers do not support alarming!!!');
    };

   /*******************************************************************/
   function ida_init() {}
   var ida = {
     'ida_init': ida_init,
   };
   dai(profile, ida);
 });
