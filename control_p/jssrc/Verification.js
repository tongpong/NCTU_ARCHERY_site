
var init_ver_code_finish=false;
function init_ver_code(){
    init_ver_code_finish=false;
    var ref = firebase.database().ref();
    ref.child("Verification").remove();
    var search = ref.once("value").then(function(snapshot) {
		var updates={};
		updates["Verification"]=snapshot.child("Initialization/Verification").val();
		firebase.database().ref().update(updates);
        init_ver_code_finish=true;
	});
}



function del_ver_code(){
	var textbox=parseInt(document.getElementById("force_del_tar_ver").value);
	var ref = firebase.database().ref('/Verification').orderByChild("target").equalTo(textbox).once("value").then(function(snapshot){
		//console.log(snapshot.val());
		var code=Object.keys(snapshot.val())[0];
		//console.log(code);
		firebase.database().ref('/Verification/'+code+"/ver_mobile").remove();
		get_target_inf();
	});
}

function force_reset_ent(){
	var textbox=parseInt(document.getElementById("force_reset_ent").value);
	var ref = firebase.database().ref('/Verification').orderByChild("target").equalTo(textbox).once("value").then(function(snapshot){
		//console.log(snapshot.val());
		var code=Object.keys(snapshot.val())[0];
		var updates={};
		updates["finish_wave"]=parseInt(document.getElementById("wave_num").innerHTML)-1;
        updates["status"]={};
		firebase.database().ref('/Verification/'+code).update(updates);
		get_target_inf();
		console.log("reset finsih");
	});
}

function init_ALLfinish_wave(){
    var ref = firebase.database().ref('/Verification');
    var search = ref.once("value").then(function(snapshot) {
        for(var i=0;i<snapshot.numChildren();i++){
            init_finish_wave(i+1);
        }
    });
    
}

function init_finish_wave(target_no){
    //console.log(init_ver_code_finish)
	var ref = firebase.database().ref('/Verification').orderByChild("target").equalTo(target_no).once("value").then(function(snapshot){
		//console.log(snapshot.val());
		var code=Object.keys(snapshot.val())[0];
		var updates={};
		updates["finish_wave"]=0;
		firebase.database().ref('/Verification/'+code).update(updates);
		get_target_inf();
		//console.log("reset finsih");
        //console.log("finish init "+target_no);
	});
}

var VER_SITURATION_CODE=["","_vered","_submitted"];

function get_target_inf(){


	$("#loadingPage").show();
	 target_inf=[];
	 var ref = firebase.database().ref('/Verification');
	 var search = ref.on("value",function(snapshot) {
	$("#loadingPage").hide();
		for(var i=0;i<snapshot.numChildren();i++){
				var target_detal =[];
				target_detal["var_code"]=Object.keys(snapshot.val())[i];
				target_detal["finish_trun"]=parseInt(snapshot.child(target_detal["var_code"]+"/finish_wave").val());
				target_detal["vared"]=snapshot.child((target_detal["var_code"]+"/ver_mobile")).val();
				target_detal["player_num"]=snapshot.child(target_detal["var_code"]+"/playernum").val();
                //target_detal["group_name"]=
				var target_pos=snapshot.child(target_detal["var_code"]+"/target").val();
				target_inf[target_pos]=target_detal;
		}
		//console.log(target_inf);
		var table = document.getElementById("target_infor");
        var tableRows = table.rows.length;
		for (var x = tableRows - 1; x >= 1; x--) {
                    table.deleteRow(-1);
         }
		var situation;
        
        //console.log(target_inf[1].indexOf("vared"));
		for(var i=1;i<=snapshot.numChildren();i++){
			 row = table.insertRow();
             row.setAttribute("class", "target");
			 
			 if(!target_inf[i]["vared"]){
				 situation=0;
                 
			 }
             else if (target_inf[i]["vared"]==""){
                situation=0;
             }
			 else if(target_inf[i]["finish_trun"]<parseInt(document.getElementById("wave_num").innerHTML)||!target_inf[i]["finish_trun"]){
				 console.log(target_inf[i]["vared"]);
                 situation=1;
			 }
			 else if(target_inf[i]["finish_trun"]==parseInt(document.getElementById("wave_num").innerHTML)){
				 situation=2;
			 }
			// console.log(i+":"+situation);
			//console.log(parseInt(document.getElementById("wave_num").innerHTML));
            //console.log(situation);
			 for(var j=0;j<7;j++){
				 var cell = row.insertCell();
				 if(j==0){
					  cell.innerHTML = i;
                      cell.setAttribute("class", "target"+VER_SITURATION_CODE[situation]);
				 }
				 if(j==1){
					  cell.innerHTML = target_inf[i]["player_num"];
                      cell.setAttribute("class", "target"+VER_SITURATION_CODE[situation]);
				 }
				 if(j==2){
					  cell.innerHTML = target_inf[i]["var_code"];
                      cell.setAttribute("class", "target"+VER_SITURATION_CODE[situation]);
				 }
				 if(j==3){
					  cell.innerHTML = target_inf[i]["finish_trun"];
                      cell.setAttribute("class", "target"+VER_SITURATION_CODE[situation]);
				 }
			 }
		}
	});
}