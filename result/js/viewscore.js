
var table_id = ["B_table", "CM_table", "CF_table", "beg_table"];
var POSITION_POINT = ["A","B","C","D"];
var PlAYER_GROUP = ["B_Grad", "C_Grad_M", "C_Grad_F", "Starter", "SPECIAL"];
var PlAYER_GROUP_ch=["乙組","女子丙組","男子丙組","新生組"];
var Player_count=[];
var Elim_top=[];

var page_now="qualification_result.html";
var index_now=0;
var selection=document.getElementById("mainselection");
function openTab(evt, value) {
    // Declare all variables
	top.frames['main_frame'].location.href = value;
	if(selection.selectedIndex<3){
		page_now=value;
		index_now=selection.selectedIndex;
	}
	else{
		document.getElementById("mainselection").selectedIndex=index_now;
	}
	
}
document.getElementById("reloadicon").addEventListener("click",function(){
	top.frames['main_frame'].location.href = page_now;
});


