var config = {
    apiKey: "AIzaSyAJDWQ-Y40b2tl6zs7hYuZNqFQYiaq71Dw",
    authDomain: "archery-ed959.firebaseapp.com",
    databaseURL: "https://archery-ed959.firebaseio.com",
    projectId: "archery-ed959",
    storageBucket: "archery-ed959.appspot.com",
    messagingSenderId: "107987243756"
};
firebase.initializeApp(config);
var POSITION_POINT = ["A", "B", "C", "D"];
var PlAYER_GROUP = [];
var Player_count=[];
var PlAYER_GROUP_ch=[];
var Total_TARGETNum;
var Elim_top=[];
var start_target={};
var Global_got=false;
var Var_got=false;
var Stage_got=false;
var Match_name='';
var Match_stage='';
var Match_type='';
var Match_subtype='';
var Elim_targetbase;
var Target_Distance;
var ELIM_POINT_SYSTEM;
window.addEventListener('load', init);
function init(){
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
            Elim_targetbase=snapshot.child("Elim_targetbase").val();
            Match_name=snapshot.child("Match_name/0").val();
            start_target=snapshot.child("Target_start").val();
            Total_TARGETNum=snapshot.child("Total_TARGETNum").val();
            Target_Distance=snapshot.child("Target_Distance").val();
            ELIM_POINT_SYSTEM=snapshot.child("ELIM_POINT_SYSTEM").val();
            console.log(PlAYER_GROUP);
            Var_got=true;
            Global_got=Var_got&Stage_got;
        }
        
    }).catch(
        function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorMessage);
        }
    );
    
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
            Global_got=Var_got&Stage_got;
        }
    });

}

function get_groupID(group){
    for(var i=0;i<PlAYER_GROUP.length;i++){
        if(group==PlAYER_GROUP[i]) return i;
    }
}

function get_group_bytarget(target_in){
    console.log(start_target);
    for(var i=PlAYER_GROUP.length-1;i>=0;i--){
        
        if(target_in>=start_target[PlAYER_GROUP[i]])
               return PlAYER_GROUP[i];
    }
}