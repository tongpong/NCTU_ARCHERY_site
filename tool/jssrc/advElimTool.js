init_advQualTool();
var player_name;
var player_group;
var player_school;
var dialog;
var SCORE_NUM;
var groupTable=[];
function init_advQualTool(){
    console.log("init_advQualTool")
    if(Global_got){
        $("#stage_name").text(Match_Cstage);
        $("#wave_num").text("第"+Match_Wave+"波");
        if(Match_type=="Elimination")
            SCORE_NUM=ELIM_SCORE_NUM;
        else if(Match_type=="Group_Elimination"){
            SCORE_NUM=GELIM_SCORE_NUM;
        }
        getTargetList();
    }
    else{
        window.setTimeout(init_advQualTool,500);
    }
}

function mod_result(){
    init_matchStage();
    if(Global_got){
        ElimChecked_mod_input();
       
    }    
    else{
        window.setTimeout(mod_result,500);
    }
}


function ElimChecked_mod_input() {
    var target=parseInt($("#Eres_TargetID").val());
    var group=get_group_bytarget(target);
    var ref = firebase.database().ref(Match_stage+'/'+group+'/Target_list/'+target);
    if(target)
        var search = ref.once("value").then(function(snapshot) {
            if(snapshot.val()!=null&&snapshot.val()!=undefined){
                var ref2_str=Match_stage+'/'+group+'/'+(snapshot.child("tree_node").val())
                console.log(ref2_str)
                var ref2 = firebase.database().ref(ref2_str);
                var search2=ref2.once("value").then(function(snapshot2){
                    ret=snapshot2.val();
                    var point1=$("#Apoint_val").val().split(/,|\s+|\t/);
                    var point2=$("#Bpoint_val").val().split(/,|\s+|\t/);
                    var set_point=[point1,point2];
                    advElimTool_uploadResult(set_point,ret,group,target);    
                });                
            } 
            else {
                alert("沒有該靶位");
            }
        });
	else{
		alert("輸入靶位");
	}
}


function advElimTool_uploadResult(points,playerDatas,group,target){
    console.log(points);
    var updates={};
    var X_sum = [0,0];
    var X_10_sum = [0,0];
    var M_sum = [0,0];
    var P_sum = [0,0];
    var Elim_set_point=[0,0];
    var htmlmsg="";
    var error=0;
    var ref = firebase.database().ref(Match_stage+'/player_result/set_point/' + group + "/");
    for(var i=0;i<points.length;i++){
        var player=playerDatas[POSITION_POINT[i]]
        var playerElimID=target+POSITION_POINT[i];
        console.log(player)
        if(points[i].length!=SCORE_NUM){
            alert("箭值數量錯誤")
            error=1;
            break;
        }
        else{
            
            for(var j=0;j< points[i].length;j++){
                updates[playerElimID+"/"+Match_Wave+'/P'+(j+1)]=points[i][j]
                if (points[i][j] == 'X' || points[i][j] == 'x') {
                    X_sum[i] += 1;
                    X_10_sum[i] += 1;
                    P_sum[i] += 10;
                } 
                else if (points[i][j] == 'M' || points[i][j] == 'm') {
                    M_sum[i] += 1;
                } 
                else if (parseInt(points[i][j]) == 10) {
                    X_10_sum[i] += 1;
                    P_sum[i] += 10;
                } 
                else if (parseInt(points[i][j]) >= 1 && parseInt(points[i][j]) <= 9) {
                    P_sum[i] += parseInt(points[i][j]);
                } 
                else {
                    alert("箭值錯誤！");
                }
            }
            updates[playerElimID+"/"+Match_Wave+'/P_SUM']=P_sum[i];
            updates[playerElimID+"/"+Match_Wave+'/X_10_sum']=X_10_sum[i];
            updates[playerElimID+"/"+Match_Wave+'/X_sum']=X_sum[i];
            updates[playerElimID+"/"+Match_Wave+'/M_sum']=M_sum[i];
            
            
            htmlmsg+="<br>組別:"+group+"<br>姓名:"+player["Name"]+"<br>單位:"+player["School"]+"<br>分數:"+updates[playerElimID+"/"+Match_Wave+'/P_SUM']+"<br>";
         
       
        }
        
    }
    if(error==0){
        if(P_sum[0]>P_sum[1]){
                Elim_set_point=[2,0];
            }
            else if(P_sum[0]<P_sum[1]){
                Elim_set_point=[0,2];
            }
            else{
                Elim_set_point=[1,1];
            }
        updates[target+""+POSITION_POINT[0]+"/"+Match_Wave+'/Elim_set_point']=Elim_set_point[0];
        updates[target+""+POSITION_POINT[1]+"/"+Match_Wave+'/Elim_set_point']=Elim_set_point[1]; 
        $("#confirm_result_area").html("靶號:"+target+htmlmsg)
        console.log(updates);
        var dialogval=[ref,updates]
        dialog.data("val",dialogval);
        dialog.dialog( "open" );
    }
}

function confirm_result(){
    var ref=dialog.data("val")[0];
    //console.log(dialog.data("val")[1]);
    ref.update(dialog.data("val")[1]);
    dialog.dialog( "close" );
}


$( function() {
	dialog = $("#confirmPage").dialog({
    autoOpen: false,
    height: 250,
    width: 200,
    modal: true,
    buttons: {
      "確定": confirm_result,
      "取消": function() {
       dialog.dialog( "close" );
      }
    },
	position: { my: "center", at: "center", of: window }
	});
});


function getTargetList(){
    groupTable=[];
    $("#group_sel").removeAttr("tr");
    
    
    var ref = firebase.database().ref(Match_stage);
    var search=ref.once("value").then(function(snapshot) {
        var tr= document.createElement("tr");
        var width=100/PlAYER_GROUP.length;
        for(var i=0;i<PlAYER_GROUP.length;i++){
            var td= document.createElement("td");
            td.setAttribute("style","border-style:groove;border-width:1px;width:"+width+"%")
            td.setAttribute("onclick","select_table("+i+")")
            var raw_data=snapshot.child(PlAYER_GROUP[i]).val();
            groupTable.push(buildListTable(raw_data,PlAYER_GROUP[i]));
            td.innerHTML=PlAYER_GROUP[i];
            tr.appendChild(td);
        }
        $("#group_sel").append(tr);
        select_table(0);
    });
}

function buildListTable(data,group){
    var table=document.createElement("table");
    table.setAttribute("style","border-style:groove;border-width:1px;width:100%;text-align:center;border-collapse:collapse;")
    var target_list=data["Target_list"];
    var target_no=Object.keys(target_list);
    var style_color=["background-color:#ffff00;border:none","background-color:#b3ffff;border:none"]
    for(var i=0;i<target_no.length;i++){
        
        var tr1= document.createElement("tr");
        var td_target= document.createElement("td");
        td_target.colspan=2;
        td_target.innerHTML=target_no[i];
        td_target.setAttribute("width","50%")
        tr1.appendChild(td_target);
        var td_playerA=document.createElement("td");
        var tree_node=target_list[target_no[i]]["tree_node"];
        var targetdata=data[tree_node]
        if(targetdata["A"])
            td_playerA.innerHTML=targetdata["A"]["Name"]+" "+targetdata["A"]["School"]+" : "+targetdata["A"]["Point_Sum"];
        else
            td_playerA.innerHTML="輪空"
        tr1.appendChild(td_playerA);
            
            var tr2=document.createElement("tr");
            var td_playerB=document.createElement("td");
            if(targetdata["B"]){
                td_playerB.innerHTML=targetdata["B"]["Name"]+" "+targetdata["B"]["School"]+" : "+targetdata["B"]["Point_Sum"];
            }
            else{
                td_playerB.innerHTML="輪空";
            }
            tr2.appendChild(document.createElement("td"));
            tr2.appendChild(td_playerB);
            
            tr1.setAttribute("style",style_color[i%2])
            tr2.setAttribute("style",style_color[i%2])
            table.appendChild(tr1);
            table.appendChild(tr2);
        
    }
    return table;
}

function select_table(index){
    $("#list_area").html(groupTable[index]);
}



document.getElementById("Eresult_smbt").addEventListener("click",search_target);
document.getElementById("Esel_smbt").addEventListener("click",submit_winner);
var select_result=-1;
var dataA,dataB;
var player_a,player_b;
var geta=false,getb=false;
function search_target(){
    console.log("search");
	select_result=-1;
	document.getElementById("player2_area").style.backgroundColor = "";
	document.getElementById("player1_area").style.backgroundColor = "";	
      var ref = firebase.database().ref(Match_type);
	  var search = ref.once("value").then(function(snapshot) {
		var stage = Match_subtype;
		database=snapshot;
		var repeat=false;

		console.log(stage);
		var target=parseInt(document.getElementById("E_target").value);
		var group=get_group_bytarget(target);
		var tree_node;
		console.log(snapshot.val());
        var Target_list=snapshot.child(Match_subtype+"/"+group+"/"+"Target_list").val();
		
        tree_node=Target_list[target]["tree_node"];
        console.log(tree_node)
		dataA=stage+"/"+group+"/"+tree_node+"/A";
		dataB=stage+"/"+group+"/"+tree_node+"/B";
        console.log(dataA)
        player_a=snapshot.child(dataA).val();
		player_b=snapshot.child(dataB).val();
        
		if(player_a){
            var pa_data=player_a["Name"];
            if(Match_type=="Elimination") pa_data+="<br>"+player_a["School"];
			document.getElementById("player1_area").innerHTML=pa_data;
			document.getElementById("player1_area").setAttribute("class","Eplayer");
			document.getElementById("player1_area").addEventListener("click",select_win);
			geta=true;
		}
		else{
			document.getElementById("player1_area").style.backgroundColor = "#FFCDD2";	
			document.getElementById("player1_area").innerHTML="no data";			
		}
		if(player_b){
            var pb_data=player_b["Name"];
            if(match_mode=="Elimination")pb_data+="<br>"+player_b["School"];
		document.getElementById("player2_area").innerHTML=pb_data;
		document.getElementById("player2_area").setAttribute("class","Eplayer");
		document.getElementById("player2_area").addEventListener("click",select_win);
			getb=true;
		}
		else{
			document.getElementById("player2_area").style.backgroundColor = "#FFCDD2";	
			document.getElementById("player2_area").innerHTML="no data";			
		}
	  });
}
function select_win(e){
	//console.log(e.srcElement.id);
	if(geta&&getb){
			
			if(e.srcElement.id=="player1_area"){
					document.getElementById("player1_area").setAttribute("class","Eplayersel");
				document.getElementById("player2_area").setAttribute("class","Eplayer");
				select_result=0;
			}
			else if(e.srcElement.id=="player2_area"){
				document.getElementById("player1_area").setAttribute("class","Eplayer");
				document.getElementById("player2_area").setAttribute("class","Eplayersel");
				select_result=1;
			}
	}
	

}

function reset_sel(){
document.getElementById("player1_area").innerHTML="";
document.getElementById("player2_area").innerHTML="";
document.getElementById("player2_area").setAttribute("class","Eplayer");
document.getElementById("player1_area").setAttribute("class","Eplayer");
document.getElementById("E_target").value="";

}

function submit_winner(){
	if(select_result==0){
		 var updates={};
		 updates["Win"]=true;
         updates["Judge_Win"]=true;
		 firebase.database().ref(Match_type+"/"+dataA).update(updates);
		 updates["Win"]=null;
         updates["Judge_Win"]=false;
		 firebase.database().ref(Match_type+"/"+dataB).update(updates);
		 window.alert("A 勝");
		 reset_sel();
	}
	else if(select_result==1){
		var updates={};
		 updates["Win"]=true;
         updates["Judge_Win"]=true;
		 firebase.database().ref(Match_type+"/"+dataB).update(updates);
		 updates["Win"]=null;
		 updates["Judge_Win"]=false;
         firebase.database().ref(Match_type+"/"+dataA).update(updates);
		window.alert("B 勝");
		reset_sel();
	}
	else{
		window.alert("選擇選手");
        
	}
    document.getElementById("player1_area").addEventListener("click",select_win);
        document.getElementById("player2_area").addEventListener("click",select_win);
	select_result=-1;
	geta=false;
	getb=false;
}
