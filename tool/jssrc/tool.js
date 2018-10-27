var STAGE_CNAME=["決賽","準決賽","8強賽","16強賽","32強賽","資格賽"];
var STAGE_NAME=["Final","Semi_Final","Quarter","Eighth","Sixteenth","Qualification"];


var result_smbt = document.getElementById("result_smbt");
var mod_area = document.getElementById("mod_area");
var message_area = document.getElementById("message_area");
var wait = 0;
result_smbt.addEventListener("click", mul_update_result);
message_area.style.backgroundColor = '#99FF66';
message_area.style.color = '#78909C';
message_area.value = "格式為：{靶位},{第1波},{第2波},{第3波},{第4波},{第5波},{第6波},{X+10},{X}\n換行分隔多筆資料\n";

var rows_raw;
var MOD_ERROR =["","NO_PLAYER","INPUT_NO_IN_FORMAT","POINT_NO_IN_FORMAT"]
var error_code = [];
var mod_temp_area;
var fail_num=0;
var rows_remain=0;
var PLAYER_POSITION=["A","B","C","D"]
window.addEventListener('load', init_tool);
var match_mode=0;
var listening;
var listener;
var Match_NOW;

function init_tool(){
	var topM;
	if(match_mode==1){
		topM="Team_top";
		Match_NOW="/Group_Elimination/";
	}
	else{
		topM="Elim_top";
		Match_NOW="/Elimination/";
	}

	if(Global_got){
        var ref2 = firebase.database().ref(Match_type);
        var search2 = ref2.on("value",function(snapshot){
                var wave=snapshot.child("wave").val();
                console.log(wave)
                document.getElementById("stage_name").innerHTML=Match_stage+"<br>";
                document.getElementById("wave_num").innerHTML="第"+wave+"波";
                

        });
        listener=search2;
        listening=ref2;
    }
    else{
        setTimeout(init_tool,500)
    }
}
function stage_trans(name){
	for(var i=0;i<7;i++){
			if(STAGE_NAME[i]==name){
				return i;
			}
	}
}



function mul_update_result(){
	rows_raw = mod_area.value.toUpperCase().split('\n');
    var rows_num = rows_raw.length;
	rows_remain=rows_num;
	fail_num=0;
	message_area.value = "格式為：{靶位},{第1波},{第2波},{第3波},{第4波},{第5波},{第6波},{X+10},{X}\n換行分隔多筆資料\n";
    mod_temp_area=message_area.value;
	message_area.style.backgroundColor = '#99FF66';
	for (var i = 0; i < rows_num; i++){
		if(rows_raw[i].length==0){
			rows_remain--;
			rows_num--;
		}
	}
	for (var i = 0; i < rows_num; i++) {
		if(rows_raw[i][0])
        checked_mod_input(rows_raw[i], i,rows_num);
			
    }
}

function checked_mod_input(rows, rows_id,rows_num) {
    var rows_val = rows.split(/,|\s+|\t/);
    var player_id = rows_val[0].toUpperCase();
	
    var ref = firebase.database().ref('/Player_data/' + player_id+"/");
    if(player_id)
	var search = ref.once("value").then(function(snapshot) {
        var name = snapshot.child("/Name").val();
        var group = snapshot.child("/Group").val();
        var school = snapshot.child("/School").val();
        if (group) {
			error_code[rows_id] = 0;
            MULTupload_result(rows, rows_id, group,rows_num,name,school);
			//console.log(rows_val);
        } else {
			//console.log("no id");
            error_code[rows_id] = 1; //no id
			rows_remain--;
			return_mod_error(rows_id,rows_num);
        }
    });
	else{
		rows_remain--;
		rows_num--;
	}
}

function return_mod_error(rows_id,rows_num){
	//console.log(error_code[rows_id]);
	if(error_code[rows_id]>0){
		if(fail_num==0){
				message_area.style.backgroundColor = "#FFCDD2";
				mod_temp_area+="下列資料輸入失敗:\n";
		}
			fail_num++;
			mod_temp_area+=rows_raw[rows_id];
			mod_temp_area+="//";
			mod_temp_area+=MOD_ERROR[error_code[rows_id]];
			mod_temp_area+='\n';
	}
	if(rows_remain==0){
		mod_temp_area+="總共";
		mod_temp_area+=rows_num;
		mod_temp_area+="筆資料:";
		mod_temp_area+=rows_num-fail_num;
		mod_temp_area+="筆成功|";
		mod_temp_area+=fail_num;
		mod_temp_area+="筆失敗\n";
		message_area.value = mod_temp_area;
	}
}	



function MULTupload_result(rows, rows_id, group,rows_num,name,school) {
var rows_val = rows.split(/,|\s+|\t/);
    var player_id = rows_val[0].toUpperCase();
    var ref = firebase.database().ref('/Qualification/player_result/Qualification_SetOnly_result/' + group + "/" + player_id + '/');
    if (rows_val.length < 8) {
        error_code[rows_id] = 2;
    } 

	if(error_code[rows_id]==0){	
		var updates={};
		updates["Player_pos"] = rows_val[0].toUpperCase();
		updates['/Q_S1/']=parseInt(rows_val[1]);
		updates['/Q_S2/']=parseInt(rows_val[2]);
		updates['/Q_S3/']=parseInt(rows_val[3]);
		updates['/Q_S4/']=parseInt(rows_val[4]);
		updates['/Q_S5/']=parseInt(rows_val[5]);
		updates['/Q_S6/']=parseInt(rows_val[6]);
		updates['/Q_X_10_sum/']=parseInt(Math.max(rows_val[7],rows_val[8]));
		updates['/Q_X_sum/']=parseInt(Math.min(rows_val[7],rows_val[8]));
		updates['/Q_M_sum/']=0;
		updates["Name"] = name;
        updates["School"] = school;
		var Q_sum=0;
		for(var i=1;i<=6;i++){
			Q_sum+=parseInt(rows_val[i]);
		}
		updates['/Q_sum/']=Q_sum;
		ref.update(updates);
		rows_remain--;
	}
	else{
		//console.log(rows_num+" "+rows_id);
		rows_remain--;
		return_mod_error(rows_id,rows_num);
	}
	if(rows_remain==0){
		mod_temp_area+="總共";
		mod_temp_area+=rows_num;
		mod_temp_area+="筆資料:";
		mod_temp_area+=rows_num-fail_num;
		mod_temp_area+="筆成功|";
		mod_temp_area+=fail_num;
		mod_temp_area+="筆失敗\n";
		message_area.value = mod_temp_area;
	}	
}

function search_treeNode(target,data){
	try{
		for(var i=0;i<data.length;i++){
			if(data[i]["target"]==target){
				return i;
			}
		
		}
	}
	catch(err) {
		console.log(err.message);
		document.getElementById("E_target").style.backgroundColor = "#FFCDD2";	
	}
}

document.getElementById("Eresult_smbt").addEventListener("click",search_target);
document.getElementById("Esel_smbt").addEventListener("click",submit_winner);
var select_result=-1;
var dataA,dataB;
var player_a,player_b;
var geta=false,getb=false;
function search_target(){
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
            if(match_mode==0) pa_data+="<br>"+player_a["School"];
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
            if(match_mode==0)pb_data+="<br>"+player_b["School"];
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
		 firebase.database().ref(Match_type+"/"+dataA).update(updates);
		 updates["Win"]=null;
		 firebase.database().ref(Match_type+"/"+dataB).update(updates);
		 window.alert("A 勝");
		 reset_sel();
	}
	else if(select_result==1){
		var updates={};
		 updates["Win"]=true;
		 firebase.database().ref(Match_type+"/"+dataB).update(updates);
		 updates["Win"]=null;
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

document.getElementById("Qres_smbt").addEventListener("click",submitsingle);
function submitsingle(){
	var target_input= document.getElementById("Qres_target").value;
	document.getElementById("Qres_target").style.backgroundColor = "";
	if(parseInt(target_input)>0){
		for(var i=0;i<4;i++){
			
			singleMOD_checkPlayer(target_input+PLAYER_POSITION[i],PLAYER_POSITION[i])
		}
		document.getElementById("Qres_target").value = "";
	}
	else{
		document.getElementById("Qres_target").style.backgroundColor = "#FFCDD2";
	}
	
}

function singleMOD_checkPlayer(player_id,player_pos){
	document.getElementById("Qres_"+player_pos).style.backgroundColor ='';
	var ref = firebase.database().ref('/Player_data/' + player_id+"/");
	var search = ref.once("value").then(function(snapshot) {
		var name = snapshot.child("/Name").val();
		var group = snapshot.child("/Group").val();
		var school = snapshot.child("/School").val();
		if(group){
			SINGupdate_result(player_id,player_pos,group,name,school);
		}
		else{
			document.getElementById("Qres_"+player_pos).placeholder = "empty position";
            document.getElementById("Qres_"+player_pos).value="";
        }
    });
}

function SINGupdate_result(player_id,player_pos,group,name,school){
	var raw_input=document.getElementById("Qres_"+player_pos).value.split(/,|\s+|\t|[.]|\*|-|#|\+/);
    console.log(raw_input)
	try{
	if(raw_input.length==8){
		var ref = firebase.database().ref('/Qualification/player_result/Qualification_SetOnly_result/' + group + "/" + player_id + '/');
		var updates={};
		updates["Player_pos"] = player_id.toUpperCase();
		updates['/Q_S1/']=parseInt(raw_input[0]);
		updates['/Q_S2/']=parseInt(raw_input[1]);
		updates['/Q_S3/']=parseInt(raw_input[2]);
		updates['/Q_S4/']=parseInt(raw_input[3]);
		updates['/Q_S5/']=parseInt(raw_input[4]);
		updates['/Q_S6/']=parseInt(raw_input[5]);
		updates['/Q_X_10_sum/']=Math.max(parseInt(raw_input[7]),parseInt(raw_input[6]));
		updates['/Q_X_sum/']=Math.min(parseInt(raw_input[7]),parseInt(raw_input[6]));
		updates['/Q_M_sum/']=0;
		updates["Name"] = name;
        updates["School"] = school;
		var Q_sum=0;
		for(var i=0;i<=5;i++){
			Q_sum+=parseInt(raw_input[i]);
		}
		updates['/Q_sum/']=Q_sum;
		ref.update(updates);
		document.getElementById("Qres_"+player_pos).style.backgroundColor ='#99FF66';
		document.getElementById("Qres_"+player_pos).value=null; 
		document.getElementById("Qres_"+player_pos).placeholder = player_id+" update success"
	}
	else{
		document.getElementById("Qres_"+player_pos).style.backgroundColor = "#FFCDD2";
		document.getElementById("Qres_"+player_pos).placeholder = "wrong format";
	}}
	catch(err){
		console.log(err.message);
		document.getElementById("Qres_"+player_pos).value=null;
		document.getElementById("Qres_"+player_pos).style.backgroundColor = "#FFCDD2";
		document.getElementById("Qres_"+player_pos).placeholder = "wrong format";
	}
}


function sub_sel(evt,sel){
	match_mode=sel;
	select_table(evt);
    console.log(sel)
	//listening.removeEventListener(listener);
	init();
}

function select_table(evt){
	var tablinks = document.getElementsByClassName("tablinks2");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    evt.currentTarget.className += " active";
}