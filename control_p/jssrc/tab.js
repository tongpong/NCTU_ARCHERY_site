
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
//window.addEventListener('load', init);

var table_id = ["B_table", "CF_table", "CM_table", "beg_table"];
var POSITION_POINT = ["A","B","C","D"];
var PlAYER_GROUP = ["B_Grad", "C_Grad_F", "C_Grad_M", "Starter", "SPECIAL"];
var PlAYER_GROUP_ch=["乙組","女子丙組","男子丙組","新生組"];
var Player_count=[];
var Elim_top=[];
function openTab(evt,page){
    var tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    var tablinks = document.getElementsByClassName("tablinks2");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(page).style.display = "block";
    evt.currentTarget.className += " active";
}
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
    document.getElementById(result_table[sub_tab_sel]).style.display = "block";
    var ref = firebase.database().ref('/Statistics');
    var search = ref.once("value").then(function(snapshot){
            Player_count=snapshot.child("Player_count").val();
            Elim_top=snapshot.child("Elim_top").val();
            PlAYER_GROUP=snapshot.child("Field_name").val();
            PlAYER_GROUP_ch=snapshot.child("Field_Cname").val();
            getranking();
            console.log(PlAYER_GROUP_ch);
    });
}
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