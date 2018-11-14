
// init_scoringialize Firebase
$("#loadingPage").show();
$("#scoringPage").hide();
$("#verifyPage").hide();
$("#waitingPage").hide();
//window.addEventListener('load', init_scoring);




$("ul.nav-tabs a").click(function(e) {
    e.preventDefault();
    $(this).tab('show');
});

InitFunction= function(){
    init_scoring();
}

var ver_code = document.getElementById("verifyCode");
var ver_smbutton = document.getElementById("btnSubmitCode");
var ver_stage=0;

var POSITION_POINT = ["A", "B", "C", "D"];
var player_num;

var player_school = ["", "", "", ""];
var player_name = ["", "", "", ""];
var player_group = ["", "", "", ""];
var target;
var final_set=0;
var scoreNum=0; 

var Q_sum=[0,0,0,0];




ver_smbutton.addEventListener("click", verification);
ver_code.addEventListener('keypress',
    function(e) {
        if (e.keyCode == 13) {
            verification();
        }
    }
);

function setCookie(cookieName, cookieValue, exdays) {
    if (document.cookie.indexOf(cookieName) >= 0) {
        var expD = new Date();
        expD.setTime(expD.getTime() + (-1 * 24 * 60 * 60 * 1000));
        var uexpires = "expires=" + expD.toUTCString();
        document.cookie = cookieName + "=" + cookieValue + "; " + uexpires;
    }
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    console.log(expires);
    document.cookie = cookieName + "=" + cookieValue + "; " + expires + ";path=/";
    var v = document.cookie;
};

function getCookie(cookieName) {
    var name = cookieName + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
};

function url_verification(){
    let urlParams = new URLSearchParams(window.location.search);
    let varCode = urlParams.get('varCode');
    if(varCode!=null){
        ver_code.value=varCode;
        verification();
    }
}

function init_global(){
    if(Global_got==true){
        
        init_scoring();
        document.title=Match_name;
        document.getElementById("headname").innerHTML=Match_name; 
        //var cookie_vercode_raw = getCookie("cookie_vercode_raw");
        
    }
    else
        window.setTimeout(init_global,500);
}

function init_scoring() {
	$("#loadingPage").show();
    var cookie_vercode_raw = getCookie("cookie_vercode_raw");
    if (!cookie_vercode_raw) {
        ver_stage=0;
        $("#scoringPage").hide();
        $("#verifyPage").show();
        $("#loadingPage").hide();
        url_verification()
    } 
    else {
        console.log(Match_stage.substring(0,11));
        if(Match_stage=="Qualification"){
            scoreNum=QUAL_SCORE_NUM;
            final_set=QUAL_SET_NUM;
            verification_process(cookie_vercode_raw,"Qualification");
        }
            
       
        else if(Match_type=="Elimination"){
            console.log("init Elimination");
            
            final_set=ELIM_SET_NUM;
            scoreNum=ELIM_SCORE_NUM;
            
            console.log(scoreNum)
            verification_process(cookie_vercode_raw,"Elimination");
        }
        else if(Match_type=="Group_Elimination"){
            console.log("init Group_Elimination");
            
            final_set=GELIM_SET_NUM;
            scoreNum=GELIM_SCORE_NUM;
            console.log(scoreNum)
            verification_process(cookie_vercode_raw,"Group_Elimination");
        }
    }
    console.log("init_scoring finish");

};




function verification_process(cookie_vercode_raw,match_type){
  
            console.log(Match_stage);
            document.getElementById("wave_num").innerHTML = parseInt(Match_Wave);
            document.getElementById("match_type").innerHTML=Match_Cstage;
            var ref = firebase.database().ref('/Verification/' + cookie_vercode_raw);
            var search = ref.once("value").then(function(snapshot) {
                player_num = snapshot.child("/playernum").val();
                console.log(player_num)
                if(ElIM_Match){
                    player_num=2;
					console.log(final_set)
                    if(final_set==Match_Wave){
                        (Match_type=="Elimination")?scoreNum=1:scoreNum=scoreNum;
						(Match_type=="Group_Elimination")?scoreNum=3:scoreNum=scoreNum;
                    }
                }
                
                var finish_wave = snapshot.child("/finish_wave").val();
                var ver_mobile_exc = snapshot.child("/ver_mobile").val();
                var mobile_status = snapshot.child("/status").val();
                console.log(mobile_status);
                var cookie_code = getCookie("cookie_vercode");
                target = getCookie("cookie_target");
                console.log("finish_wave:"+finish_wave+" Match_Wave:"+Match_Wave);
                
                if (cookie_code == ver_mobile_exc) {
                    console.log("finish_wave:"+finish_wave+" Match_Wave:"+Match_Wave);
                    ver_stage=1;
                    console.log(mobile_status=="END");
                    if(mobile_status=="END"){
                        console.log("e_END");
                       gen_accsum(snapshot);
                       document.getElementById("succ_msg").innerHTML="傳送成功!<br>請等待下一波比賽";
                        $("#scoringPage").hide();
						$("#verifyPage").hide();
                        $("#waitingPage").show();
                    }
                    else if(finish_wave <0){
                       console.log("not service");
                        $("#scoringPage").hide();
						$("#verifyPage").hide();
                        if(finish_wave==-1){
                            document.getElementById("succ_msg").innerHTML="比賽尚未開始";
                        }
                       
                        $("#waitingPage").show();
                    }
                    else if (finish_wave == Match_Wave) {
						console.log("finish set");
                        $("#scoringPage").hide();
						$("#verifyPage").hide();
						if(Match_Wave==final_set) 
                            document.getElementById("succ_msg").innerHTML="傳送成功!<br>比賽結束";
                        else
                            document.getElementById("succ_msg").innerHTML="傳送成功!<br>請等待下一波比賽";
						gen_accsum(snapshot);
                        $("#waitingPage").show();
						
                    }
					else if(finish_wave != (Match_Wave-1)){
						console.log("reload");
                        $("#scoringPage").hide();
						$("#verifyPage").hide();
						$("#waitingPage").show();
						var ref2 = firebase.database().ref('/Verification/' + cookie_vercode_raw);
						var updates_finished_set = {};
						updates_finished_set["/finish_wave"] = Match_Wave-1;
						ref2.update(updates_finished_set);
						location.reload();
					}
					
					else {
                        console.log("Scroing");
                        player_data_init_scoring();
						$("#waitingPage").hide();
                        $("#verifyPage").hide();
                        $("#scoringPage").show();
                    }

                } 
                else {
                    ver_stage=0;
					$("#waitingPage").hide();
                    $("#scoringPage").hide();
                    $("#verifyPage").show();
                    $("#loadingPage").hide();
                    url_verification();
                }
                console.log("ver_stage");
            });

}

function player_data_init_scoring() {
    console.log("player_data_init_scoring");
    if(Match_stage=="Qualification"){
        for (var i = 0; i < player_num; i++) {
            Qualification_player_data_init(i,0);
        }
        
    }
    else if(Match_stage.substring(0,11)=="Elimination"){
       
        Elimination_player_data_init(0);   
    }
	else if(Match_type=="Group_Elimination"){
        GElimination_player_data_init(0);
    }
};


function Qualification_player_data_init(position,getsum){
        console.log("Qualification_player_data_init:"+ position)
        var ref = firebase.database().ref('/Player_data/' + target + POSITION_POINT[position]);
        var search = ref.once("value").then(function(snapshot) {
        player_school[position] = snapshot.child("School").val();
        player_name[position] = snapshot.child("Name").val();
        player_group[position] = snapshot.child("Group").val();
		if(getsum==1){
			get_accsum(position);
		}
		else if(position == (player_num - 1)) {
            addTable();
            $("#loadingPage").hide();
        }
    });
}

function Elimination_player_data_init(getsum){
    console.log("Elimination_player_data_init");
    var querystr=Match_stage+"/"+get_group_bytarget(target)+'/';
    var ref = firebase.database().ref(querystr+'Target_list/'+target+"/tree_node");
    var search = ref.once("value").then(function(snapshot) {
        var ref_node = firebase.database().ref(querystr+snapshot.val());
        var search_node = ref_node.once("value").then(function(snapshot_node) {
            for(var i = 0; i < 2; i++){
                player_school[i] = snapshot_node.child(POSITION_POINT[i]+"/School").val();
                player_name[i] = snapshot_node.child(POSITION_POINT[i]+"/Name").val();
                player_group[i] = get_group_bytarget(target);
                if(getsum==1){
                    get_accsum(i);
                }
                else if(i == (player_num - 1)) {
                    addTable();
                    $("#loadingPage").hide();
                }
            }
            console.log(player_name);
            
        });
        
    });
}

function GElimination_player_data_init(getsum){
    var querystr=Match_stage+"/"+get_group_bytarget(target)+'/';
    var ref = firebase.database().ref(querystr+'Target_list/'+target);
    var search = ref.once("value").then(function(snapshot) {
		var ret=snapshot.val();
		var tree_node=ret["tree_node"];
		target=ret["lower_target"];
		setCookie("cookie_target", target, '1');
        var ref_node = firebase.database().ref(querystr+tree_node);
        var search_node = ref_node.once("value").then(function(snapshot_node) {
            for(var i = 0; i < 2; i++){
                player_school[i] = "";
                player_name[i] = snapshot_node.child(POSITION_POINT[i]+"/Name").val();
                player_group[i] = get_group_bytarget(target);
                if(getsum==1){
                    get_accsum(i);
                }
                else if(i == (player_num - 1)) {
                    addTable();
                    $("#loadingPage").hide();
                }
            }
            console.log(player_name);
            
        });
        
    });
}

function verification() {
    console.log(ver_code.value.toUpperCase());
    var ref = firebase.database().ref('/Verification/' + ver_code.value.toUpperCase());
    var search = ref.once("value").then(function(snapshot) {
            var ret_target = snapshot.child("/target").val();
            console.log(ret_target);
            if (!ret_target) {
                console.log("no code");
                alert("請輸入靶位上的驗證碼!");
            } else {
                var ver_mobile_exc = snapshot.child("/ver_mobile").val();
                if (ver_mobile_exc == "0") {
                    alert("管理登錄");
                } else if (!ver_mobile_exc || ver_mobile_exc == 'null') {
                    var ram = Math.floor(Math.random() * (999999999 - 0 + 1));
                    var cookie_code = ret_target + ram;
                    setCookie("cookie_vercode", cookie_code, '1');
                    setCookie("cookie_vercode_raw", ver_code.value.toUpperCase(), '1');
                    setCookie("cookie_target", ret_target, '1');
                    var updates = {};
                    updates['/ver_mobile'] = cookie_code;
                    ref.update(updates);
                    alert("登錄靶位成功！ 您的靶位是：" + ret_target + "號\n 請不要清除cookie");
                    init_scoring();
                } else {
                    var cookie_code = getCookie("cookie_vercode");
                    console.log(cookie_code);
                    var x = document.cookie;
                    console.log(x);
                    if (cookie_code == ver_mobile_exc) {
                        alert("登入成功！ 您的靶位是：" + ret_target + "號\n")
                        init_scoring();
                    } else {
                        console.log("multilogin");
                        alert("請使用同一台裝置記錄靶位成績！\n如需協助 請尋找就近裁判");
                    }

                }
            }
        })
        .catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorMessage);
        })


};




function addTable() {
    for (var i = 1; i <= player_num; i++) {
        var $div = $("<div>").addClass("col-xs-12");
        var $table = $("<table>").addClass("table table-bordered").attr("id", "t" + i);
        var tbid = "t" + i;
        $table.append("<thead><tr><th><th>");
        var player_ID=target + POSITION_POINT[i - 1];
        if(Match_type=="Group_Elimination"){
            player_ID=parseInt(target)+i-1;
        }
        var player_info = player_ID+ "&emsp;" + player_name[i - 1] + "&emsp;" + player_school[i - 1] + "&emsp;" + PlAYER_GROUP_ch[get_groupID(player_group[i - 1])];
        $table.find("th:first").attr("colspan", scoreNum).html("<div class=\"col-xs-20 text-center\"><h4>"+player_info+"</h4></div>"); //html裡面加上靶號,大學,姓名
        $table.find("th:last").html("總分");

        $table.append("<tbody><tr>");
        var $row = $table.find("tr:last");

        for (var j = 1; j <= scoreNum; j++) {
            $row.append("<td>");
            $row.children("td:last").addClass("tableData").attr("id", "td" + i + j);
            $row.children("td:last").html("\xa0");

        }

        $row.append("<td>");
        $row.children("td:last").addClass("total");

        $div.append($table);
        $("#scoreTable").append($div);
        if (set_result[i - 1][0] != " ") {
            for (var j = 1; j <= scoreNum; j++) {
                var tdid = "td" + i + j;
                $("#" + tdid).html(set_result[i - 1][j - 1]);
                setTotalScore(tdid, tbid, set_result[i - 1][j - 1]);
            }
        }

    }
    for (var i = 0; i < table_click.length; i++) {
        table_click[i].addEventListener("click", readtable);
    }
};



var isSelected = false;
var targetID;
var selectedTable;
var table_click = document.getElementsByClassName("tableData");



function readtable() {
    console.log(isSelected);
    $(".tableData").css("background-color", "white");
    $(this).css("background-color", "yellow");
    $(this).siblings(".tableData").css("background-color", "yellow");
    isSelected = true;
    selectedTable = $(this).parents("table").attr("id");

    targetID = $(this).parent().children(".tableData:contains('\xa0'):first").attr("id");
}

function setTotalScore(targetID, selectedTable, value) {

    var totalScore = parseInt($("#" + selectedTable + " .total").html());
    var player = selectedTable[1] - 1;
    if (typeof targetID === "undefined") return;
    if (isNaN(totalScore)) {
        totalScore = 0;
    }
    if (value === "X") {
        totalScore += 10;
    } else if (value === "M") {
        totalScore += 0;
    } else if (value === " ") {
        totalScore += 0;
    } else totalScore += parseInt(value);
    $("#" + selectedTable + " .total").html(totalScore);
};

$("#keypad .btn").click(function() {

    if (isSelected) {
        var value = $(this).html();
        if (value === "清除") {
            $("#" + selectedTable + " td").html("\xa0");
            targetID = $("#" + selectedTable + " td:first").attr("id");
            var row = selectedTable[1] - 1;
            for (var i = 0; i < scoreNum; i++) {
                set_result[row][i] = " ";
            }

        } else {
            $("#" + targetID).html(value);
            var rowi = targetID[2] - 1;
            var rowj = targetID[3] - 1;
            set_result[rowi][rowj] = value;
            setTotalScore(targetID, selectedTable, value);
            targetID = $("#" + targetID).parent().children(".tableData:contains('\xa0'):first").attr("id");
        }
    }
});

var set_result = [
    [" ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " "],
];
var set_total = [
    0, 0, 0, 0
];
var set_xtotal = [
    0, 0, 0, 0
];
var set_x_10_total = [
    0, 0, 0, 0
];
var set_m_total = [
    0, 0, 0, 0
];
var elim_set_point=[0,0];

function reset_result() {
    for (var i = 0; i < player_num; i++) {
        set_result[i] = [" ", " ", " ", " ", " ", " "];
    }
    set_total = [0, 0, 0, 0];
    set_xtotal = [0, 0, 0, 0];
    set_x_10_total = [0, 0, 0, 0];
    set_m_total = [0, 0, 0, 0];
}

var btn_subresult = document.getElementById("btnSubmitresult");
btn_subresult.addEventListener("click", cal_result);
var btn_subresult2 = document.getElementById("btnSubmitresult2");
btn_subresult2.addEventListener("click", cal_result);

var dialog;
$( function() {
	dialog = $( "#confirmPage" ).dialog({
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
function cal_result() {
    set_total = [0, 0, 0, 0];
    set_xtotal = [0, 0, 0, 0];
    set_x_10_total = [0, 0, 0, 0];
    set_m_total = [0, 0, 0, 0];
    elim_set_point=[0,0]
    var confirm_data = "";
	
    for (var i = 0; i < player_num; i++) {
		set_result[i].sort(compare);
        console.log(set_result[i]);
		for (var j = 0; j < scoreNum; j++) {
            if (set_result[i][j] == " " || set_result[i][j] == "M") {
                set_m_total[i] += 1;
				set_result[i][j] ="M";
            } else if (set_result[i][j] == "X") {
                set_xtotal[i] += 1;
                set_x_10_total[i] += 1;
                set_total[i] += 10;
            } else if (set_result[i][j] == "10") {
                set_x_10_total[i] += 1;
                set_total[i] += 10;
            } else {
                set_total[i] += parseInt(set_result[i][j]);
            }
        }
        confirm_data += target + POSITION_POINT[i] + "\t:\t" + set_total[i] + "<br>";
    }
   // console.log(Match_type=="Elimination"&ELIM_POINT_SYSTEM[get_groupID(player_group[0])]==1);
    if(ElIM_Match&ELIM_POINT_SYSTEM[get_groupID(player_group[0])]==1){
        if(set_total[0]>set_total[1]){
            elim_set_point=[2,0];
        }
        else if(set_total[0]<set_total[1]){
            elim_set_point=[0,2];
        }
        else{
            elim_set_point=[1,1]
        }
    }
	document.getElementById("confirm_result_area").innerHTML = confirm_data;
	console.log("con");
	dialog.dialog( "open" );
}

function confirm_result(){
		console.log("confirm result");
        var cookie_vercode_raw = getCookie("cookie_vercode_raw");
        var ref = firebase.database().ref('/Verification/' + cookie_vercode_raw);
        var search = ref.once("value").then(function(snapshot) {
            var finish_wave = snapshot.child("/finish_wave").val();
			console.log(finish_wave);
            var ver_mobile_exc = snapshot.child("/ver_mobile").val();
            var cookie_code = getCookie("cookie_vercode");
            if (ver_mobile_exc != cookie_code) {
                alert("驗證碼已過期！ 請尋找附近裁判或工作人員！");
                location.reload();
            } else if (Match_Wave == finish_wave) {
                alert("重複輸入！ 請等待下一波！ 如有需要請尋找附近裁判");
				location.reload();
            } else {
                send_result();
				
            }
        });
}








function send_result() {
	console.log("send result ");
	var cookie_vercode_raw = getCookie("cookie_vercode_raw");
	var refs = firebase.database().ref('/Verification/' + cookie_vercode_raw);
    var search = refs.once("value").then(send_Qualification_result);
    
}

function send_Qualification_result(snapshot){
    var finish_wave = snapshot.child("/finish_wave").val();	
	for (var i = 0; i < player_num; i++) {
        var ref = firebase.database().ref(Match_stage+'/player_result/set_point/' + player_group[i] + "/" + target + POSITION_POINT[i]);
        var updates = {};
        for(var j=0;j<scoreNum;j++){
            updates[Match_Wave + '/P'+(j+1)] = set_result[i][j];
        }
        
        updates[Match_Wave + '/P_SUM/'] = set_total[i];
        updates[Match_Wave + '/X_10_sum/'] = set_x_10_total[i];
        updates[Match_Wave + '/X_sum/'] = set_xtotal[i];
        updates[Match_Wave + '/M_sum/'] = set_m_total[i];
        if(ElIM_Match&ELIM_POINT_SYSTEM[get_groupID(player_group[0])]==1){
             updates[Match_Wave + '/Elim_set_point/'] = elim_set_point[i];
        }
        ref.update(updates);
    }
    
    var cookie_vercode_raw = getCookie("cookie_vercode_raw");
    var ref2 = firebase.database().ref('/Verification/' + cookie_vercode_raw);
    var updates_finished_set = {};
    updates_finished_set["/finish_wave"] = Match_Wave;
	ref2.update(updates_finished_set);
    console.log(Match_Wave);
	console.log(finish_wave);
	console.log("send finish");
	$("#loadingPage").show();
	location.reload();
}




function gen_accsum(snapshot){
	console.log("gen_sum:"+player_num);
    var finish_wave = snapshot.child("/finish_wave").val();	
	if(Match_type=="Qualification"){
        for (var i = 0; i < player_num; i++) {
            Qualification_player_data_init(i,1);
        }
    }
    else if(Match_type=="Elimination"){
        Elimination_player_data_init(1);
    }
    else if(Match_type=="Group_Elimination"){
        GElimination_player_data_init(1);
    }
		
    
	
}

function get_accsum(position){
	
    var ref = firebase.database().ref(Match_stage+'/player_result/set_point/' + player_group[position] + "/" + target + POSITION_POINT[position]);
	var search = ref.once("value").then(function(snapshot) {
            Q_sum[position]=0;
            
            console.log(Match_Wave)
            
			for(var j = 1;j<=Match_Wave;j++){
                if(ElIM_Match&ELIM_POINT_SYSTEM[get_groupID(player_group[0])]==1){
					if(parseInt(snapshot.child(j+"/Elim_set_point").val())>=0)
						Q_sum[position]+=parseInt(snapshot.child(j+"/Elim_set_point").val());
                    if(Q_sum[position]>=WIN_point){
                        console.log("player"+position+" win")
                        submit_winner(position);
                    }
                }
				else if(snapshot.child("/"+j+"/P_SUM").val())
                    if(parseInt(snapshot.child(j+"/P_SUM").val())>=0)
						Q_sum[position]+=parseInt(snapshot.child(j+"/P_SUM").val());
			}
		
			if(position==(player_num-1)){
				var acc_sum_out="";
				for(var k=0;k<player_num;k++){
                    var player_ID=target+POSITION_POINT[k];
                    if(Match_type=="Group_Elimination"){
                        player_ID=parseInt(target)+k;
                    }
					acc_sum_out+=player_ID+":\t"+Q_sum[k]+"<br>";
				}
				document.getElementById("acc_sum_proj").innerHTML = acc_sum_out;
				$("#loadingPage").hide();
			}
		});
}

function submit_winner(select_result){
    var querystr=Match_stage+"/"+get_group_bytarget(target)+'/';
    var ref=firebase.database().ref(querystr+"Target_list/"+target+"/tree_node");
    var search = ref.once("value").then(function(snapshot) {
        var Target_node=snapshot.val()
        var dataA=Match_stage+"/"+player_group[0]+"/"+Target_node+"/A";
        var dataB=Match_stage+"/"+player_group[1]+"/"+Target_node+"/B";
        console.log(dataA);
        if(select_result==0){
             var updates={};
             updates["Win"]=true;
             firebase.database().ref(dataA).update(updates);
             updates["Win"]=null;
             firebase.database().ref(dataB).update(updates);

        }
        else if(select_result==1){
            var updates={};
             updates["Win"]=true;
             firebase.database().ref(dataB).update(updates);
             updates["Win"]=null;
             firebase.database().ref(dataA).update(updates);

        }
    });
    
    
    var cookie_vercode_raw = getCookie("cookie_vercode_raw");
    var ref2 = firebase.database().ref('/Verification/' + cookie_vercode_raw);
    var updates_finished_set = {};
    updates_finished_set["/status"] = "END";
	ref2.update(updates_finished_set);

}

function compare(a, b) {
    console.log(a+"|"+b);
	if(a=="M"||a==" ")return 1;
	else if(b=="X"&&a!="X") return 1;
	else if(parseInt(b)>parseInt(a)) return 1;
	else return 0;
	
}

