init_advQualTool();
var player_name;
var player_group;
var player_school;
var dialog;
var SCORE_NUM;
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