
var refresh = document.getElementById("refresh");
var next_wave = document.getElementById("next_wave");
var force_wave = document.getElementById("force_wave");
var force_sbtn = document.getElementById("force_sbtn");
var gen_sum = document.getElementById("gen_sum");
refresh.addEventListener("click", refresh_wave);
next_wave.addEventListener("click", change_next_wave);
force_sbtn.addEventListener("click", force_change_wave);
gen_sum.addEventListener("click", update_result);
window.addEventListener('load', refresh_wave);
window.addEventListener('load', get_target_inf);
document.getElementById("force_stage_sbtn").addEventListener("click", force_change_stage);



var wave_now=0;



function iframe_reload(){
	console.log("frame reload");
	document.getElementById('ranking_frame').src="../result/qualification_result.html";
}

function refresh_wave() {
    if(Global_got==true){
        var ref = firebase.database().ref('/Qualification/');
        var search = ref.once("value").then(function(snapshot) {
        var ret_wave = snapshot.child("/wave").val();
        if (!ret_wave) {
            document.getElementById("wave_num").innerHTML = '0';
            force_wave.value = 0;
			wave_now=0;
        } else {
            force_wave.value = parseInt(ret_wave);;
            document.getElementById("wave_num").innerHTML = parseInt(ret_wave);
			wave_now=parseInt(ret_wave);
        }
        document.getElementById("match_stage").innerHTML=Match_stage;
		get_target_inf();
        }).catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorMessage);
        })
    }
    else
        window.setTimeout(refresh_wave,500);
    
    
}

function change_next_wave() {
    var ref = firebase.database().ref('/Qualification/');
    var search = ref.once("value").then(function(snapshot) {
        var ret_wave = snapshot.child("/wave").val();
        var updates = {};
        if (!ret_wave || ret_wave == '0') {
            updates['wave'] = '1';
            ref.update(updates);
            document.getElementById("wave_num").innerHTML = '1';
            force_wave.value = 1;
        } else if (parseInt(ret_wave) < 6) {
            updates['wave'] = parseInt(ret_wave) + 1;
            ref.update(updates);
            force_wave.value = updates['wave'];
            document.getElementById("wave_num").innerHTML = updates['wave'];
			wave_now=parseInt(updates['wave']);
        }
		get_target_inf();
		update_result();
    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorMessage);
    })
}

function force_change_wave() {
    var ref = firebase.database().ref('/Qualification/');
    var updates = {};
    updates["wave"] = force_wave.value;
    ref.update(updates);
    document.getElementById("wave_num").innerHTML = updates['wave'];
	wave_now=parseInt(updates['wave']);
}



function get_group_id(group) {
    for (var i=0;i<PlAYER_GROUP.length;i++){
        if(group==PlAYER_GROUP[i])
            return i;
    }
}
var player_rank = [];
var player_num_group = [];
var remain_player=0;

function add_up_sum(player_id, name, group, school) {
    var ref = firebase.database().ref('/Qualification/player_result/set_point/'+group+"/"+player_id);
    console.log("add_up_sum");
    var search = ref.once("value").then(function(snapshot) {
        var Q_sum = 0;
        var Q_X_10_sum = 0;
        var Q_X_sum = 0;
        var Q_M_sum = 0;
        for (var set = 1; set <= wave_now; set++) {
            ret_set = snapshot.child(set).val();
			//console.log(ret_set);
            if (ret_set) {
                Q_sum += parseInt(snapshot.child( set + "/" + "P_SUM").val());
                Q_X_10_sum += parseInt(snapshot.child(set + "/" + "X_10_sum").val());
                Q_X_sum += parseInt(snapshot.child( set + "/" + "X_sum").val());
                Q_M_sum += parseInt(snapshot.child(set + "/" + "M_sum").val());

            }
        }
        var updates = {};
        updates["Player_pos"] = player_id;
        updates["Q_sum"] = Q_sum;
        updates["Q_X_10_sum"] = Q_X_10_sum;
        updates["Q_X_sum"] = Q_X_sum;
        updates["Q_M_sum"] = Q_M_sum;
        updates["Name"] = name;
        updates["School"] = school;
		
        firebase.database().ref('/Qualification/player_result/Qualification_result/' + group + "/" + player_id).update(updates);
        var group_id = get_group_id(group);
        var group_peop = player_num_group[group_id];
        console.log(player_rank)
        player_rank[group_id][group_peop] = updates;
        player_num_group[group_id] ++;
	//	console.log(remain_player);
        if (--remain_player==0) {
			console.log("Finish add up result");
            gen_rank();
        }
    });
}

function update_result() {
    console.log("update_result");
    var ref = firebase.database().ref('/Player_data');
    var search = ref.once("value").then(function(snapshot) {
        var player_num = snapshot.numChildren();
        remain_player=player_num;
        player_rank = [];
        for (var i = 0; i < PlAYER_GROUP.length; i++) {
            player_rank.push([]);
            player_rank[i].push([]);
            player_num_group[i] = 0;
        }
        var finish_player = 0;
        console.log(Total_TARGETNum);
        for (var target = 1; target <= Total_TARGETNum; target++) {/////change target sum
            for (var position = 0; position < 4; position++) {
                var player_id = target + POSITION_POINT[position];
                var ret_wave = snapshot.child(player_id).val();
                if (ret_wave) {

                    var name = snapshot.child(player_id + "/Name").val();
                    var group = snapshot.child(player_id + "/Group").val();
                    var school = snapshot.child(player_id + "/School").val();
                    add_up_sum(player_id, name, group, school);
                    finish_player++;

                }
            }
        }
    });
}


var result_smbt = document.getElementById("result_smbt");
var mod_area = document.getElementById("mod_area");
var message_area = document.getElementById("message_area");
var wait = 0;
result_smbt.addEventListener("click", mod_result);
message_area.style.backgroundColor = '#99FF66';
message_area.style.color = '#78909C';
message_area.value = "格式為：{靶位},{波數},{成績1},{成績2},{成績3},{成績4},{成績5},{成績6}）\n換行分隔多筆資料\n";

var rows_raw;
var MOD_ERROR =["","NO_PLAYER","INPUT_NO_IN_FORMAT","POINT_NO_IN_FORMAT"]
var error_code = [];
var mod_temp_area;
var fail_num=0;
var rows_remain=0;
function mod_result() {
    rows_raw = mod_area.value.toUpperCase().split('\n');
    var rows_num = rows_raw.length;
	rows_remain=rows_num;
	fail_num=0;
    message_area.value = "格式為：{靶位},{波數},{成績1},{成績2},{成績3},{成績4},{成績5},{成績6}）\n換行分隔多筆資料\n";
    mod_temp_area=message_area.value;
	message_area.style.backgroundColor = '#99FF66';
    for (var i = 0; i < rows_num; i++) {
        checked_mod_input(rows_raw[i], i,rows_num);
    }
}

function checked_mod_input(rows, rows_id,rows_num) {
    var rows_val = rows.split(/,|\s+|\t/);
    var player_id = rows_val[0];
    var ref = firebase.database().ref('/Player_data/' + player_id+"/");
    var search = ref.once("value").then(function(snapshot) {
        var group = snapshot.child("Group").val();
		//console.log(group);
        if (group) {
			error_code[rows_id] = 0;
            upload_result(rows, rows_id, group,rows_num);
        } else {
            error_code[rows_id] = 1; //no id
			rows_remain--;
			return_mod_error(rows_id,rows_num);
        }
    });
}


function upload_result(rows, rows_id, group,rows_num) {
    var rows_val = rows.split(/,|\s+|\t/);
    var player_id = rows_val[0].toUpperCase();
    var set = rows_val[1];
    var X_sum = 0;
    var X_10_sum = 0;
    var M_sum = 0;
    var P_sum = 0;
    var ref = firebase.database().ref('/Qualification/player_result/set_point/' + group + "/" + player_id + '/');
    if (rows_val.length < 7) {
        error_code[rows_id] = 2;
    } 
	else {
        for (var j = 2; j <= 7; j++) {
            if (rows_val[j] == 'X' || rows_val[j] == 'x') {
                X_sum += 1;
                X_10_sum += 1;
                P_sum += 10;
            } 
			else if (rows_val[j] == 'M' || rows_val[j] == 'm') {
                M_sum += 1;
            } 
			else if (parseInt(rows_val[j]) == 10) {
                X_10_sum += 1;
                P_sum += 10;
            } 
			else if (parseInt(rows_val[j]) >= 1 && parseInt(rows_val[j]) <= 9) {
                P_sum += parseInt(rows_val[j]);
            } 
			else {
                exclude++;
                error_code[rows_id] = 3;
            }
        }
		
    }
	if(error_code[rows_id]==0){	
		var updates={};
		updates[set+'/P1/']=rows_val[2];
		updates[set+'/P2/']=rows_val[3];
		updates[set+'/P3/']=rows_val[4];
		updates[set+'/P4/']=rows_val[5];
		updates[set+'/P5/']=rows_val[6];
		updates[set+'/P6/']=rows_val[7];
		updates[set+'/P_SUM/']=P_sum;
		updates[set+'/X_10_sum/']=X_10_sum;
		updates[set+'/X_sum/']=X_sum;
		updates[set+'/M_sum/']=M_sum;
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

function return_mod_error(rows_id,rows_num){
	if(error_code[rows_id]>0){
		if(fail_num==0){
				message_area.style.backgroundColor = "#FFCDD2";
				mod_temp_area+="下列資料輸入失敗:\n";
		}
			fail_num++;
			mod_temp_area+=rows_raw[rows_id];
			mod_temp_area+"//";
			mod_temp_area+=MOD_ERROR[error_code[rows_id]];
			mod_temp_area+='\n';
	}
	
	
}







var ID_rank_acc = [];
var Data_rank_acc = [];

function gen_rank() {
    player_rank = [];
        for (var i = 0; i < PlAYER_GROUP.length; i++) {
            player_rank.push([]);
            player_rank[i].push([]);
        }
    for (var i = 0; i < PlAYER_GROUP.length; i++) {
		gen_group_rank(PlAYER_GROUP[i]);
    }

}


function gen_group_rank(group) {
	if( document.getElementById("SetOnlyCheck").checked)
		ref = firebase.database().ref('/Qualification/player_result/Qualification_SetOnly_result/'+group);
	else 
		ref = firebase.database().ref('/Qualification/player_result/Qualification_result/'+group);
	var search = ref.once("value").then(function(snapshot){
		var group_id=get_group_id(group);
		for(var i=0;i<snapshot.numChildren();i++){
			var key=Object.keys(snapshot.val())[i];
			player_rank[group_id][i]=snapshot.child(key).val();
			
		}
	//	console.log(player_rank[group_id]);
		player_rank[group_id].sort(compare);
		ref2 = firebase.database().ref('/Qualification/player_result/Ranking/');
		var updates={};
		updates["/"+group]=player_rank[group_id];
		ref2.update(updates);
		console.log("finish update ranking");
		if(group_id==3){
			iframe_reload();
		}
	});
		
	
    
	
}



function compare(a, b) {
    if (a["Q_sum"] < b["Q_sum"]){ 
		
	return 1;}
    else if (a["Q_sum"] > b["Q_sum"]) return -1;
    else {
        if (a["Q_X_10_sum"] < b["Q_X_10_sum"]) return 1;
        else if (a["Q_X_10_sum"] > b["Q_X_10_sum"]) return -1;
        else {
            if (a["Q_X_sum"] < b["Q_X_sum"]) return 1;
            else if (a["Q_X_sum"] > b["Q_X_sum"]) return -1;
            else {
                if (a["Q_M_sum"] > b["Q_M_sum"]) return 1;
                else if (a["Q_M_sum"] < b["Q_M_sum"]) return -1;
                else return 0;
            }
        }
    }
}





var del_ver_btn=document.getElementById("force_del_sbtn");
del_ver_btn.addEventListener("click",del_ver_code)



var force_reset_ent_btn=document.getElementById("force_reset_ent_btn");
force_reset_ent_btn.addEventListener("click",force_reset_ent)



document.getElementById("init_btn").addEventListener("click",init_qual);

function init_qual(){
	var ref = firebase.database().ref();
	ref.child("Qualification").remove();
	ref.child("Player_data").remove();
	ref.child("Verification").remove();
	ref.child("Statistics").remove();
    var search = ref.once("value").then(function(snapshot) {
		var updates={};
        updates["Match_stage"]="Qualification";
		updates["Qualification/wave"]=1;
		updates["Player_data"]=snapshot.child("Initialization/Player_data").val();
		updates["Statistics"]=snapshot.child("Initialization/Statistics").val();
		updates["Verification"]=snapshot.child("Initialization/Verification").val();
        updates["TargetSet"]=snapshot.child("Initialization/TargetSet").val();
		firebase.database().ref().update(updates);
        console.log("init finish_wave");
        init_ALLfinish_wave();
	});
}
/*
function FIND_GROUPSTART(group,Player_data){
    var key = Object.keys(Player_data);
    for(var i=0;i<key.length;i++){
        if(Player_data[keys[i]]==)
    }
}
*/
function force_change_stage() {
    var ref = firebase.database().ref();
    var updates = {};
    updates["Match_stage"]="Qualification";
    firebase.database().ref().update(updates);
    //init_match_stage();
    refresh_wave();
    
}

$(function() {
    $("#main").collapse({
        //可加入參數
    });
});