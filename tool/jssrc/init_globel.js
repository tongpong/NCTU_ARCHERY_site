var config = {
    apiKey: "AIzaSyAJDWQ-Y40b2tl6zs7hYuZNqFQYiaq71Dw",
    authDomain: "archery-ed959.firebaseapp.com",
    databaseURL: "https://archery-ed959.firebaseio.com",
    projectId: "archery-ed959",
    storageBucket: "archery-ed959.appspot.com",
    messagingSenderId: "107987243756"
};
firebase.initializeApp(config);
var STAGE_CNAME=["決賽","準決賽","8強賽","16強賽","32強賽"];
var STAGE_NAME=["Final","Semi_Final","Quarter","Eighth","Sixteenth"];
var Match_TYPE=["Qualification","Elimination","Group_Elimination"];
var Match_CTYPE=["資格賽","個人對抗賽","團體對抗賽"];
var POSITION_POINT = ["A", "B", "C", "D"];
var PlAYER_GROUP = [];
var Player_count=[];
var PlAYER_GROUP_ch=[];
var Total_TARGETNum;
var MAXTARGET=Total_TARGETNum;
var Elim_top=[];
var Team_top=[];
var start_target={};
var Global_got=false;
var Var_got=false;
var Stage_got=false;
var Match_name='';
var Match_stage='';
var Match_Cstage='';
var Match_type='';
var Match_subtype='';
var Match_Wave=0;
var ElIM_Match=false;
var Elim_targetbase;
var Target_Distance;
var ELIM_POINT_SYSTEM;
var WIN_point=0;

var QUAL_SET_NUM;
var ELIM_SET_NUM;
var GELIM_SET_NUM;
var QUAL_SCORE_NUM;
var ELIM_SCORE_NUM;
var GELIM_SCORE_NUM;
var InitFunction;
window.addEventListener('load', init);
function init(){
    Var_got=false;
    var ref = firebase.database().ref('/Statistics/');
    var search = ref.once("value").then(function(snapshot) {
        if(snapshot!=null){
                var ret_group = snapshot.child("/Field_name").val();
            for(var i=0;i<ret_group.length;i++){
                PlAYER_GROUP[i]=ret_group[i];
            }
            PlAYER_GROUP_ch=snapshot.child("Field_Cname").val();
            Player_count=snapshot.child("Player_count").val();
            Elim_top=snapshot.child("Elim_top").val();
            Team_top=snapshot.child("Team_top").val();
            Elim_targetbase=snapshot.child("Elim_targetbase").val();
            Match_name=snapshot.child("Match_name/0").val();
            start_target=snapshot.child("Target_start").val();
            Total_TARGETNum=snapshot.child("Total_TARGETNum").val()[0];
            Target_Distance=snapshot.child("Target_Distance").val();
            ELIM_POINT_SYSTEM=snapshot.child("ELIM_POINT_SYSTEM").val();
            
            QUAL_SET_NUM=snapshot.child("Qual_set_NUM").val()[0];
            ELIM_SET_NUM=snapshot.child("Elim_set_NUM").val()[0];
            GELIM_SET_NUM=snapshot.child("GElim_set_NUM").val()[0];
            QUAL_SCORE_NUM=snapshot.child("Qual_arrow_NUM").val()[0];
            ELIM_SCORE_NUM=snapshot.child("Elim_arrow_NUM").val()[0];
            GELIM_SCORE_NUM=snapshot.child("GElim_arrow_NUM").val()[0];
          
            Var_got=true;
            
            Global_got=Var_got&Stage_got;
            MAXTARGET=Total_TARGETNum;
        }
        
    }).catch(
        function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorMessage);
        }
    );
    
    init_matchStage();

}

function init_matchStage(){
    Stage_got=false;
    var ref_stage= firebase.database().ref('/Match_stage');
    var search = ref_stage.on("value",function(snapshot) {
        if(snapshot!=null){
         
            Match_stage = snapshot.val();

            var Match_stage_tmp=Match_stage.split("/");
            Match_type=Match_stage_tmp[0];
            Match_Cstage=Match_CTYPE[find_match_id(Match_type)]
            console.log(Match_stage_tmp[1]==undefined)
            if(Match_stage_tmp.length>0&&Match_stage_tmp[1]!=undefined){
                Match_subtype=Match_stage_tmp[1];
                Match_Cstage+="/"+STAGE_CNAME[find_stage_id(Match_subtype)];
            }
            
            
            (Match_type=="Elimination")? WIN_point=6:WIN_point=5;
            ElIM_Match=(Match_type=="Elimination"||Match_type=="Group_Elimination");
            Stage_got=true;
            Global_got=Var_got&Stage_got;
            var ref_wave=firebase.database().ref(Match_type+"/wave").on("value",function(snapshot){
                Match_Wave=snapshot.val();
            });
        }
    });
}

function get_groupID(group){
    for(var i=0;i<PlAYER_GROUP.length;i++){
        if(group==PlAYER_GROUP[i]) return i;
    }
}

function get_group_bytarget(target_in){
  
    for(var i=PlAYER_GROUP.length-1;i>=0;i--){
        
        if(target_in>=start_target[PlAYER_GROUP[i]])
               return PlAYER_GROUP[i];
    }
}

function update_targetStart(match_stage){
    for(var i=0;i<PlAYER_GROUP.length;i++){
        firebase.database().ref('/Statistics/Target_start/'+PlAYER_GROUP[i]).remove();
    }
    var ref = firebase.database().ref('/Statistics/Target_start/'+match_stage);
    var search = ref.once("value").then(function(snapshot){
        firebase.database().ref('/Statistics/Target_start/').update(snapshot.val());
    });
}

function find_stage_id(stage){
    for(var i=0;i<PlAYER_GROUP.length;i++){
        if(stage==STAGE_NAME[i]) return i;
    }
}

function find_match_id(match){
    for(var i=0;i<Match_TYPE.length;i++){
        if(match==Match_TYPE[i]) return i;
    }
}

function find_max_target(stage){
	if(stage=="Sixteenth"){
			return 32;
		}
		else if(stage=="Eighth"){
			return 16;
		}
		else if(stage=="Quarter"){
			return 8;
		}
		
		else return  4;
	
}

function find_next_EStage(stage){
		if(stage=="Sixteenth"){
			return "Eighth";
		}
		else if(stage=="Eighth"){
			return  "Quarter";
		}
		else if(stage=="Quarter"){
			return  "Semi_Final";
		}
		
		else return  "Final";
}

function Rankcompare(a, b) {
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