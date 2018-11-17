
$("#loadingPage").show();
init_qual();

function init_qual(){
    if(Global_got==true){
        build_table();
        getranking();
    }
    else
        window.setTimeout(init_qual,500);
}

function build_table(){
    for(var i=0;i<PlAYER_GROUP_ch.length;i++){
        var div_table=document.createElement("div");
        result_table[i]="qual"+PlAYER_GROUP[i];
        div_table.setAttribute('id',result_table[i]);
        div_table.setAttribute('class','tabcontent');
        div_tabcontent.append(div_table);
        
        var table=document.createElement("table");
        table_id[i]=PlAYER_GROUP[i]+'_table';
        table.setAttribute('id',table_id[i]);
        table.setAttribute('class','result');
        div_table.append(table);
        
        var row=document.createElement("tr");
        row.setAttribute('class','result');
        create_cell(row,"th",null,'result','排名',null);
        create_cell(row,"th",null,'result','靶號');
        create_cell(row,"th",null,'result_name','姓名',null);
        create_cell(row,"th",null,'result_school','學校',null);
        create_cell(row,"th",null,'result','成績',null);
		create_cell(row,"th",null,'result','', "visibility:hidden;");
		create_cell(row,"th",null,'result','', "visibility:hidden;");
        table.append(row);
        document.getElementById(result_table[tab_sel]).style.display = "block";
    }
    document.getElementById(result_table[tab_sel]).style.display = "block";
}
var color=0;
function getranking() {
	$("#loadingPage").show();
    var ref = firebase.database().ref('/Qualification/player_result/Ranking/');
	
    var search = ref.once("value").then(function(snapshot) {

        for (var i = 0; i < PlAYER_GROUP.length; i++) {
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
					if(j<Elim_top[i]){
						sel="sel_";
					}
					else sel="";
					if (Sret[j]["Player_pos"] != "undefined"&&Sret[j]["Name"]!="Empty") {
                        row = table.insertRow();
                        row.setAttribute("class", "result_row");
						row.setAttribute("id", "Q"+i+j);
						row.addEventListener("click",readtable);
                        for (var k = 0; k < 7; k++) {
                            var cell = row.insertCell();
                            if (k == 0) {
                                cell.innerHTML = j + 1;
                                cell.setAttribute("class", sel+"result"+color);
                                cell.setAttribute("style", "font-weight:bold;text-decoration:underline;");
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
                                cell.setAttribute("style", "visibility:hidden;");
                            }
							if (k == 6) {
                                cell.innerHTML = Sret[j]["Q_X_sum"];
                                cell.setAttribute("style", "visibility:hidden;");
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
	dialog.dialog({title: PlAYER_GROUP_ch[tab_sel]});
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
	var ref = firebase.database().ref('/Qualification/player_result/set_point/'+PlAYER_GROUP[tab_sel]+"/"+sel_player);
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

