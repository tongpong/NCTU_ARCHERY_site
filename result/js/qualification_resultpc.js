
var main_tab_sel=0;
var sub_tab_sel=3;
$("#loadingPage").show();
var result_table=[
	["qualB","qualWomenC","qualMenC","qualRookie"]
];
var config = {
    apiKey: "AIzaSyAJDWQ-Y40b2tl6zs7hYuZNqFQYiaq71Dw",
    authDomain: "archery-ed959.firebaseapp.com",
    databaseURL: "https://archery-ed959.firebaseio.com",
    projectId: "archery-ed959",
    storageBucket: "archery-ed959.appspot.com",
    messagingSenderId: "107987243756"
};
firebase.initializeApp(config);
window.addEventListener('load', init);



var table_id = ["B_table", "CF_table", "CM_table", "beg_table"];
var POSITION_POINT = ["A","B","C","D"];
var PlAYER_GROUP = ["B_Grad", "C_Grad_F", "C_Grad_M", "Starter", "SPECIAL"];
var PlAYER_GROUP_ch=["乙組","女子丙組","男子丙組","新生組"];
var Player_count=[];
var Elim_top=[];
function main_sel(evt,sel){
	main_tab_sel=sel;
	select_table(evt);
}
function sub_sel(evt,sel){
	sub_tab_sel=sel;
	select_table(evt);
}
function select_table(evt){
	var tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
	var tablinks = document.getElementsByClassName("tablinks2");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
	document.getElementById(result_table[main_tab_sel][sub_tab_sel]).style.display = "block";
    evt.currentTarget.className += " active";
}

function init(){
	document.getElementById(result_table[main_tab_sel][sub_tab_sel]).style.display = "block";
	var ref = firebase.database().ref('/Statistics');
	var search = ref.once("value").then(function(snapshot){
			Player_count=snapshot.child("Player_count").val();
			Elim_top=snapshot.child("Elim_top").val();
			getranking();
	});
}

var color=0;

function getranking() {
	$("#loadingPage").show();
    var ref = firebase.database().ref('/Qualification/player_result/Ranking/');
	
    var search = ref.once("value").then(function(snapshot) {
		//console.log(snapshot.val());
        for (var i = 0; i < 4; i++) {
			color=1;
            if (snapshot.hasChild(PlAYER_GROUP[i])) {
                var Sret = snapshot.child(PlAYER_GROUP[i]).val();
                var table = document.getElementById(table_id[i]);
                var tableRows = table.rows.length;
				//console.log(Sret);
                for (var x = tableRows - 1; x >= 1; x--) {
                    table.deleteRow(-1);
                }
                for (var j = 0; j < Sret.length; j++) {
                    if(j%2==0){
						if(color==0){
							color=1;
						}
						else{
							color=0;
						}
					}
					var sel;
					if(j<Elim_top[PlAYER_GROUP[i]]){
						sel="sel_";
					}
					else sel="";
					if (Sret[j]["Player_pos"] != "undefined") {
                        row = table.insertRow();
                        row.setAttribute("class", "result_row");
						row.setAttribute("id", "Q"+i+j);
						row.addEventListener("click",readtable);
                        for (var k = 0; k < 7; k++) {
                            var cell = row.insertCell();
                            if (k == 0) {
                                cell.innerHTML = j + 1;
                                cell.setAttribute("class", sel+"result"+color);
                            }
                            if (k == 1) {
                                cell.innerHTML = Sret[j]["Player_pos"];
                                cell.setAttribute("class", sel+"result"+color);
                            }
                            if (k == 2) {
                                cell.innerHTML = Sret[j]["Name"];
                                cell.setAttribute("class", sel+"result_name"+color);
                            }
                            if (k == 3) {
                                cell.innerHTML = Sret[j]["School"];
                                cell.setAttribute("class", sel+"result_school"+color);
                            }
                            if (k == 4) {
                                cell.innerHTML = Sret[j]["Q_sum"];
                                cell.setAttribute("class", sel+"result"+color);
                            }
							if (k == 5) {
                                cell.innerHTML = Sret[j]["Q_X_10_sum"];
                                cell.setAttribute("class", sel+"result"+color);
                            }
							if (k == 6) {
                                cell.innerHTML = Sret[j]["Q_X_sum"];
                                cell.setAttribute("class", sel+"result"+color);
                            }
                        }
                    }

                }
            }
        }
		$("#loadingPage").hide();

    });
}

var table_click = document.getElementsByClassName("result_row");

var dialog;
$( function() {
	dialog = $( "#dialog_table" ).dialog({
    autoOpen: false,
    height: 360,
    width: 250,
    modal: true,
	position: { my: "center", at: "center", of: window }
	});
});

function readtable() {
	var title=document.getElementById("dialog_table");
	dialog.dialog({title: PlAYER_GROUP_ch[sub_tab_sel]});
	var rank=$(this).find('td').eq(0).text();
	var sel_player=$(this).find('td').eq(1).text();
	var name=$(this).find('td').eq(2).text();
	var school=$(this).find('td').eq(3).text();
	var sum=$(this).find('td').eq(4).text();
	var X_10=$(this).find('td').eq(5).text();
	var X_sum=$(this).find('td').eq(6).text();
	document.getElementById("det_rank").innerHTML=rank;
	document.getElementById("det_tar").innerHTML=sel_player;
	document.getElementById("det_name").innerHTML=name;
	document.getElementById("det_school").innerHTML=school;
	document.getElementById("det_res").innerHTML=sum;
	document.getElementById("det_x10").innerHTML=X_10;
	document.getElementById("det_x").innerHTML=X_sum;
	var ref = firebase.database().ref('/Qualification/player_result/set_point/'+PlAYER_GROUP[sub_tab_sel]+"/"+sel_player);
	var search = ref.once("value").then(function(snapshot){
		var table = document.getElementById("details_table");
        var tableRows = table.rows.length;
		for (var x = tableRows - 1; x >= 0; x--) {
            table.deleteRow(-1);
        }
		for(var i=1;i<=6;i++){
			var Sret = snapshot.child(i).val();
			if(Sret){
		
					row = table.insertRow();
					for (var k = 0; k <=7; k++) {
                            var cell = row.insertCell();
                            if (k == 0) {
                                cell.innerHTML = i;
                                cell.setAttribute("class", "result_dh");
                            }
                            if (k == 1) {
                                cell.innerHTML = Sret["P1"];
                                cell.setAttribute("class", "result_d");
                            }
                            if (k == 2) {
                                cell.innerHTML = Sret["P2"];
                                cell.setAttribute("class", "result_d");
                            }
                            if (k == 3) {
                                cell.innerHTML = Sret["P3"];
                                cell.setAttribute("class", "result_d");
                            }
                            if (k == 4) {
                                cell.innerHTML = Sret["P4"];
                                cell.setAttribute("class", "result_d");
                            }
							if (k == 5) {
                                cell.innerHTML = Sret["P5"];
                                cell.setAttribute("class", "result_d");
                            }
							if (k == 6) {
                                cell.innerHTML = Sret["P6"];
                                cell.setAttribute("class", "result_d");
                            }
                        
					}
			}
		}
		dialog.dialog( "open" );
	});
     
}

