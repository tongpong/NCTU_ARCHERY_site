var config = {
   
  };
  firebase.initializeApp(config);

table=document.getElementById("qrcodeList");
var URL_str="http://archery.nctu.edu.tw/scoring/?varCode=";
function build_table(){
    
    var ref = firebase.database().ref('/Verification');
    var search = ref.on("value",function(snapshot) {
            var target_list=[];
            var target=1;
            var tbdy = document.createElement('tbody');
            for(var i=0;i<snapshot.numChildren();i++){
				code=Object.keys(snapshot.val())[i];
				var target_pos=snapshot.child(code+"/target").val();
				target_list[target_pos]=code;
            }
            for (var i = 0; i < Math.ceil(target_list.length/4); i++) {
                
                    var tr = document.createElement('tr');
                    for (var j = 0; j < 4; j++) {
                        if(target<target_list.length){    
                            var urlstr=URL_str+target_list[target];
                            var td = document.createElement('td');
                            td.align="center";
                            var img=document.createElement('img');
                            img.src="http://chart.apis.google.com/chart?cht=qr&chl="+ urlstr +"&chs=240x240"
                            img.align="center";
                            td.appendChild(img);
                            td.innerHTML+="<br>靶號:"+target+"<br>驗證碼:"+target_list[target]+"<br>網址:archery.nctu.tw/scoring<br>請記得不要清除cookie";
                            tr.appendChild(td)
                            target++;
                        }
                    }
                    tbdy.appendChild(tr);
                    
                
            }
            table.appendChild(tbdy)
    });
    
}
build_table();
