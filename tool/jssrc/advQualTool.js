init_advQualTool();
var player_name;
var player_group;
var player_school;
var dialog;
function init_advQualTool(){
    console.log("init_advQualTool")
    if(Global_got){
        $("#stage_name").text(Match_Cstage);
        $("#wave_num").text("第"+Match_Wave+"波");
    }
    else{
        window.setTimeout(init_advQualTool,500);
    }
}

function mod_result(){
    init_matchStage();
    if(Global_got)
        checked_mod_input();
    else{
        window.setTimeout(mod_result,500);
    }
}

function checked_mod_input() {
    var points = $("#point_val").val().split(/,|\s+|\t/);
    var player_id = $("#res_PlayerID").val().toUpperCase();
    var ref = firebase.database().ref('/Player_data/' + player_id+"/");
    if(player_id)
	var search = ref.once("value").then(function(snapshot) {
        var name = snapshot.child("/Name").val();
        var group = snapshot.child("/Group").val();
        var school = snapshot.child("/School").val();
        if (group != null && group!=undefined) {
            advQualTool_uploadResult(player_id,group,name,school,points);
        } else {
			alert("沒有該靶位");
        }
    });
	else{
		alert("輸入靶位");
	}
}

function advQualTool_uploadResult(player_id,group,name,school,points){
    console.log(points);
    if(points.length!=QUAL_SCORE_NUM){
        alert("箭值數量錯誤")
    }
    else{
        var updates={};
        var X_sum = 0;
        var X_10_sum = 0;
        var M_sum = 0;
        var P_sum = 0;
        var ref = firebase.database().ref('/Qualification/player_result/set_point/' + group + "/" + player_id + '/'); 
        for(var i=0;i< points.length;i++){
            
            updates[Match_Wave+'/P'+(i+1)]=points[i]
            console.log(updates)
            if (points[i] == 'X' || points[i] == 'x') {
                X_sum += 1;
                X_10_sum += 1;
                P_sum += 10;
            } 
			else if (points[i] == 'M' || points[i] == 'm') {
                M_sum += 1;
            } 
			else if (parseInt(points[i]) == 10) {
                X_10_sum += 1;
                P_sum += 10;
            } 
			else if (parseInt(points[i]) >= 1 && parseInt(points[i]) <= 9) {
                P_sum += parseInt(points[i]);
            } 
			else {
                alert("箭值錯誤！");
            }
        }
        updates[Match_Wave+'/P_SUM']=P_sum;
		updates[Match_Wave+'/X_10_sum']=X_10_sum;
		updates[Match_Wave+'/X_sum']=X_sum;
		updates[Match_Wave+'/M_sum']=M_sum;
        
        var dialogval=[ref,updates]
        $("#confirm_result_area").html("組別:"+group+"<br>姓名:"+name+"<br>單位:"+school+"<br>分數:"+updates[Match_Wave+'/P_SUM'])
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