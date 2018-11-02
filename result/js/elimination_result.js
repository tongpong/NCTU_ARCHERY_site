

var stage_now;
var database;
var show_layer=[];
var show_all=0;
var databaseready=false;
window.addEventListener('load', get_stage);
document.getElementById("spread_btn").addEventListener('click',spread_table)

get_stage();
init_elim();
function init_elim(){
    if(Global_got&databaseready){
        $("#loadingPage").show();
        $("#"+result_table[tab_sel]).hide();
        build_table();
        for(var i=0;i<PlAYER_GROUP_ch.length;i++){
            gen_target(i);
        }
    }
    else
        window.setTimeout(init_elim,500);
}

function build_table(){
    for(var i=0;i<PlAYER_GROUP_ch.length;i++){
        var div_table=document.createElement("div");
        result_table[i]="elim"+PlAYER_GROUP[i];
        div_table.setAttribute('id',result_table[i]);
        div_table.setAttribute('class','tabcontent');
        div_tabcontent.append(div_table);
        
        var table=document.createElement("table");
        table_id[i]=PlAYER_GROUP[i]+'_table';
        table.setAttribute('id',table_id[i]);
        table.setAttribute('class','e_result');
        div_table.append(table);
        
    }
}

function spread_table(){
	if(show_all==0)show_all=1;
	else show_all=0;
	for(var i=0;i<i<PlAYER_GROUP_ch.length;i++){
				gen_target(i);
			}
}


function get_stage(){

	var ref = firebase.database().ref('/Elimination');
	var search = ref.on("value",function(snapshot){
		stage_now=snapshot.child("/Stage").val();
		database=snapshot;
        databaseready=true;
        spread_table();
	});
}




function gen_target(idx){
	var table = document.getElementById(table_id[idx]);
	//console.log(table_id[idx]);
	var tableRows = table.rows.length;

    for (var x = tableRows - 1; x >= 0; x--) {
                    table.deleteRow(-1);
     }
	 var color=0;
	 match_lay=get_lay(idx);
	 max_tag=Math.pow(2,match_lay+1);
	 for(var i=0;i<max_tag+4;i++){
		 row = table.insertRow();
		 row.setAttribute("id",table_id[idx]+i);	
		 for(var j=0;j<(match_lay*4+2+4);j++){
			var cell = row.insertCell();
			cell.setAttribute("id",table_id[idx]+i+"_"+j);
			
		 }
	 }
	
	create_wintree(match_lay,max_tag,idx);
}

function create_wintree(lay,max_tag,idx){

	var j=0;
	var offset=0;
	level=Math.pow(2,lay);
	for(var L=0;L<=lay;L++){
		var pow=Math.pow(2,L);
		offset=pow-1;
		var tree_node=0;
		var matching=find_matching(lay-L,stage_now);
		for(var i=0;i<level*2;){
			create_target(i+offset,j,tree_node,1,idx,lay-L,false,matching);
			i+=pow*2;
			tree_node++;
		}
		if(L!=lay)
		for(var i=0;i<level*2;){
			create_connect(i+1+offset,j+2,Math.pow(2,(L+1)),1,idx);
			i+=pow*4;
		}
		else{
			create_target(((max_tag)*3/4),j,tree_node,1,idx,lay-L,false,matching);
		}
		j+=4;
	}
	

}


function create_target(i,j,tree_node,display,idx,lay,repeat,matching){
	//console.log(tree_node);
	var ret=(STAGE_NAME[lay]+"/"+PlAYER_GROUP[idx]+"/"+tree_node);
		var t_id=table_id[idx]+i+"_"+j;
		var t_cell = document.getElementById(t_id);
		var target = database.child(ret+"/target").val();
        t_cell.addEventListener("click",readtable);
        t_cell.innerHTML=target;

		t_cell.setAttribute("class","e_resulttarget");
		span_row(i,j,2,idx);
		
		var p1_id=table_id[idx]+i+"_"+(j+1);
		var p1_cell= document.getElementById(p1_id);
		var A_win,B_win;
		p1_cell.addEventListener("click",readtable);
        p1_cell.setAttribute("alias",STAGE_NAME[lay]+"."+PlAYER_GROUP[idx]+"."+target+".A");
		if(repeat){
			var A_data=database.child(ret+"/C").val();
			var B_data=database.child(ret+"/D").val();
			A_win=database.child(ret+"/C/Win").val();
			B_win=database.child(ret+"/D/Win").val();
		}
		else{
			var A_data=database.child(ret+"/A").val();
			var B_data=database.child(ret+"/B").val();
			A_win=database.child(ret+"/A/Win").val();
			B_win=database.child(ret+"/B/Win").val();
		}
        
        if(A_win&&B_win){
            A_win=database.child(ret+"/A/Judge_Win").val();
			B_win=database.child(ret+"/B/Judge_Win").val();
        }
		
		
		
	
		var p2_id=table_id[idx]+(i+1)+"_"+(j+1);
		var p2_cell= document.getElementById(p2_id);
        p2_cell.setAttribute("alias",STAGE_NAME[lay]+"."+PlAYER_GROUP[idx]+"."+target+".B");
        p2_cell.addEventListener("click",readtable);
		var con_stage=(stage_now=="RO16A"||stage_now=="RO16B")?"RO16":stage_now;
		if(con_stage ==STAGE_NAME[lay]||show_all==1){
			if(A_data){
				p1_cell.innerHTML=A_data["Name"]+"("+(A_data["Rank"]+1)+")";
                if(A_data["Point_Sum"]!=null){
                    p1_cell.innerHTML+=" : "+A_data["Point_Sum"];
                }
            }
            else
				p1_cell.innerHTML="n";	
		
		
			if(B_data){
				p2_cell.innerHTML=B_data["Name"]+"("+(B_data["Rank"]+1)+")";
                if(B_data["Point_Sum"]!= null){
                    p2_cell.innerHTML+=" : "+B_data["Point_Sum"];
                }
            }
            else if(A_data)
				p2_cell.innerHTML="輪控";	
			else 
				p2_cell.innerHTML="n";	
			
			if(A_win){
				p1_cell.setAttribute("class","e_resultwin");
				p2_cell.setAttribute("class","e_resultloss");	
			}
			else if(B_win){
				p1_cell.setAttribute("class","e_resultloss");
				p2_cell.setAttribute("class","e_resultwin");
			}
			else if(matching==1){
				p1_cell.setAttribute("class","e_resultplaying");
				p2_cell.setAttribute("class","e_resultplaying");			
			}
			else{
				p1_cell.setAttribute("class","e_result");
				p2_cell.setAttribute("class","e_result");
			}
		}
		if(lay==0){
			
			$("#loadingPage").hide();
			$("#"+result_table[tab_sel]).show();
		}
			
}

function create_connect(i,j,length,display,idx){
	//console.log(i);
	var tp_cell= document.getElementById(table_id[idx]+i+"_"+j);
	tp_cell.setAttribute("class","connecttop");
	
	var bt_cell= document.getElementById(table_id[idx]+(i+length-1)+"_"+j);
	bt_cell.setAttribute("class","connectbtm");
	
	for(var a=1;a<=length-2;a++){
		var vt_cell= document.getElementById(table_id[idx]+(i+a)+"_"+j);
		vt_cell.setAttribute("class","connectvec");
	}
	var hz_cell=document.getElementById(table_id[idx]+(i+(length/2-1))+"_"+(j+1));
	hz_cell.setAttribute("class","connecthoz");
}

function span_row(i,j,num,idx){
	var c_id=table_id[idx]+i+"_"+j;
	var cell = document.getElementById(c_id);
	cell.setAttribute("rowspan",num);
	var r_id=table_id[idx]+(i+1)+"_"+j;
		
	document.getElementById(r_id).remove();
}

function get_lay(idx){
	if(Elim_top[idx]==32){
		return 4;
	}
	else if(Elim_top[idx]==16){
		return 3;
	}
	else if(Elim_top[idx]==8){
		return 2;
	}
	
	else if(Elim_top[idx]==4){
		return 1;
	}
	return 1;
}

function find_matching(idx,stage){ //get the match now playing
	if(stage==STAGE_NAME[idx]){
		return 1;
	}
	return 0;
}

function readtable() {
    var alias=$(this).attr('alias');
	var FieldID=alias.split('.');
    var Set_point=database.child(FieldID[0]+"/player_result/set_point/"+FieldID[1]+"/"+FieldID[2]+FieldID[3]).val();
    var target_node=database.child(FieldID[0]+"/"+FieldID[1]+"/Target_list/"+FieldID[2]+"/tree_node").val();
    var player_info=database.child(FieldID[0]+"/"+FieldID[1]+"/"+target_node+"/"+FieldID[3]).val();
    console.log(player_info)
    document.getElementById("det_rank").innerHTML=player_info["Rank"]+1;
	document.getElementById("det_name").innerHTML=player_info["Name"];
	document.getElementById("det_school").innerHTML=player_info["School"];

    var Elim_Psum=0;
    var Psum=0;
    var table = document.getElementById("details_table");
        var tableRows = table.rows.length;
		for (var x = tableRows - 1; x >= 0; x--) {
            table.deleteRow(-1);
        }
        if(Set_point)
		for(var i=1;i<=Object.keys(Set_point).length;i++){
			var Sret = Set_point[i];
			if(!$.isEmptyObject(Sret)){
                    console.log(Sret);
					row = table.insertRow();
                    var cell = row.insertCell();
                    cell.innerHTML = i;
                    cell.setAttribute("class", "result_dh");
                    var p_key=Object.keys(Sret)
                    var counter=1;
                    Psum+=Sret["P_SUM"];
                    Elim_Psum+=Sret["Elim_set_point"];
                    for(var j=0;j<p_key.length;j++){
                        if(p_key[j]==("P"+counter)){
                            cell = row.insertCell();
                            cell.innerHTML = Sret[p_key[j]];
                            cell.setAttribute("class", "result_d");
                            counter++;
                        }
                        
                    }  
				
			}
		}
    document.getElementById("det_Group").innerHTML=PlAYER_GROUP_ch[find_group_id(FieldID[1])];
    document.getElementById("det_match").innerHTML=STAGE_CNAME[find_stage_id(FieldID[0])];
    document.getElementById("det_rank").innerHTML=player_info["Rank"]+1;
	document.getElementById("det_name").innerHTML=player_info["Name"];
	document.getElementById("det_school").innerHTML=player_info["School"];
    document.getElementById("det_res").innerHTML=Psum;
	document.getElementById("det_Epoint").innerHTML=Elim_Psum;
    console.log(player_info)
    if(player_info["Judge_Win"])
        document.getElementById("judge").innerHTML="裁判同分判決"
    else{
        document.getElementById("judge").innerHTML=""
    }
        dialog.dialog( "open" );
}



$( function() {
	dialog = $( "#dialog_table" ).dialog({
    autoOpen: false,
    height: 360,
    width: 250,
    modal: true,
	position: { my: "center", at: "center", of: window }
	});
});





