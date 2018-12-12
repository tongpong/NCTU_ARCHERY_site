var config = {
};
firebase.initializeApp(config);
window.addEventListener('load', init_page);
var tab_sel=0;
var STAGE_NAME=["Final","Semi_Final","Quarter","Eighth","Sixteenth"];
var STAGE_CNAME=["決賽","準決賽","8強賽","16強賽","32強賽"];
var POSITION_POINT = ["A","B","C","D"];
var PlAYER_GROUP = [];
var PlAYER_GROUP_ch=[];
var Match_name='';
var table_id = [];
var Player_count=[];
var Elim_top=[];
var Team_top=[];
var Target_start=[]
var result_table=[];
var DATA_GOT=false;
var Stage_got=false;
var Global_got=false;
var Match_stage=""
function init_page(){
	
	var ref = firebase.database().ref('/Statistics');
	var search = ref.once("value").then(function(snapshot){
			Player_count=snapshot.child("Player_count").val();
			Elim_top=snapshot.child("Elim_top").val();
            Team_top=snapshot.child("Team_top").val();
            PlAYER_GROUP=snapshot.child("Field_name").val();
            PlAYER_GROUP_ch=snapshot.child("Field_Cname").val();
            Target_start=snapshot.child("Target_start").val();
            Match_name=snapshot.child("Match_name/0").val();
			build_page();
            DATA_GOT=true;
            Global_got=DATA_GOT&Stage_got;
            //console.log(Elim_top);
	});
    var ref_stage= firebase.database().ref('/Match_stage');
    var search = ref_stage.on("value",function(snapshot) {
        if(snapshot!=null){
            console.log(snapshot);
            Match_stage = snapshot.val();
            var Match_stage_tmp=Match_stage.split("/");
            Match_type=Match_stage_tmp[0];
            if(Match_stage_tmp.length>0){
                Match_subtype=Match_stage_tmp[1];
            }
            Stage_got=true;
            Global_got=DATA_GOT&Stage_got;
        }
    });
}

function build_page(){
    //console.log("build_page");
    var tab= $("#page_tab");
    var div_tabcontent=$("#div_tabcontent");
    for(var i=0;i<PlAYER_GROUP_ch.length;i++){
        var node = document.createElement("LI");
        if(i==0)
            tab.append("<button class='tablinks2 active' onclick='sub_sel(event,"+i+")'>"+PlAYER_GROUP_ch[i]+"</button>");
        else
            tab.append("<button class='tablinks2' onclick='sub_sel(event,"+i+")'>"+PlAYER_GROUP_ch[i]+"</button>");
    }
    document.title=Match_name;
    document.getElementById("headname").innerHTML=Match_name;   
}

function create_cell(ROW,cell_type,ID=null,CLASS=null,CONTENT=null,STYLE=null){
    //console.log(cell_type)
    var cell=document.createElement(cell_type);
    if(ID!=null)
        cell.setAttribute('id',ID);
    if(CLASS!=null)
        cell.setAttribute('class',CLASS);
	if(STYLE!=null)
		cell.setAttribute('style',STYLE);
    if(CONTENT!=null)
        cell.innerHTML=CONTENT;
    ROW.append(cell);
}

function sub_sel(evt,sel){
	tab_sel=sel;
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
	document.getElementById(result_table[tab_sel]).style.display = "block";
    evt.currentTarget.className += " active";
}

function find_group_id(group){
    for(var i=0;i<PlAYER_GROUP.length;i++){
        if(group==PlAYER_GROUP[i]) return i;
    }
}

function find_stage_id(stage){
    for(var i=0;i<PlAYER_GROUP.length;i++){
        if(stage==STAGE_NAME[i]) return i;
    }
}
