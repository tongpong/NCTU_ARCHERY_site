var init_btn = document.getElementById("init_btn");
init_btn.addEventListener("click", init_Eset);

var init_btn = document.getElementById("init_data_btn");
init_btn.addEventListener("click", init_GEsetData);


var next_wave = document.getElementById("next_wave");
var force_wave = document.getElementById("force_wave");
var force_sbtn = document.getElementById("force_sbtn");
next_wave.addEventListener("click", change_next_wave);
force_sbtn.addEventListener("click", force_change_wave);
document.getElementById("stage_btn").addEventListener("click", change_next_EStage);
document.getElementById("force_stage_sbtn").addEventListener("click", force_change_stage);
document.getElementById("refresh").addEventListener("click", init_GEliminationControl);
var WIN_tree;
var G_rank;
var GROUP_static = {};
var Group_list = {};
init_GEliminationControl();

function gen_tree(level) {
    var tree = [];
    for (var i = 0; i < level; i++) {
        tree.push([]);
        if (i == 0) {
            tree[0].push(0);
            tree[0].push(1);
            tree[0].push(3);
            tree[0].push(2);
        } else {
            var k = 0;
            var p_num = Math.pow(2, i + 1);
            for (j = 0; j < p_num / 2 / 2; j++) {
                tree[i].push(p_num - tree[i - 1][k] - 1);
                tree[i].push(tree[i - 1][k])
                k++;
            }
            for (j = 0; j < p_num / 2 / 2; j++) {
                tree[i].push(tree[i - 1][k])
                tree[i].push(p_num - tree[i - 1][k] - 1);
                k++;
            }
        }
    }
    WIN_tree = tree;
}

gen_tree(5);



function init_GEliminationControl() {
    if (Global_got == true) {
        if (Match_type == "Group_Elimination") {
            for (var i = 1; i <= MAXTARGET; i++)
                get_Elimaccsum(i)
        }
        checked_win();
        get_target_inf();
        var ref2 = firebase.database().ref('/Group_Elimination');
        var search2 = ref2.once("value").then(function(snapshot) {

            var stage = stage_trans(snapshot.child("Stage").val());



            var wave = snapshot.child("wave").val();
            if (stage) {
                document.getElementById("stage_name").innerHTML = Match_stage + "<br>";
                document.getElementById("wave_num").innerHTML = wave;
            } else {
                document.getElementById("stage_name").innerHTML = STAGE_CNAME[5] + "<br>";
                document.getElementById("wave_num").innerHTML = wave;
            }
            update_targetStart('Group_Elimination/' + Match_subtype);
        });
        //iframe_reload();
    } else
        window.setTimeout(init_GEliminationControl, 500);
}

function init_row(rows, q_data, player_data) {
    var sigle_list = {};
    var g_sum = 0;
    var x_sum = 0;
    var x_10_sum = 0;
    var player_name = [];
    for (var i = 2; i < 5; i++) {
        if (q_data[rows[i].toUpperCase()]) {
            g_sum += q_data[rows[i]]["Q_sum"];
            x_sum += q_data[rows[i]]["Q_X_sum"];
            x_10_sum += q_data[rows[i]]["Q_X_10_sum"];
            player_name.push(q_data[rows[i]]["Name"]);
        } else {
            player_name.push(player_data[rows[i]]["Name"]);
        }

    }
    console.log(player_name)
    sigle_list["Q_sum"] = g_sum;
    sigle_list["Q_X_10_sum"] = x_10_sum;
    sigle_list["Q_X_sum"] = x_sum;
    sigle_list["Q_M_sum"] = 0;
    sigle_list["Player_1"] = rows[2].toUpperCase();
    sigle_list["Player_2"] = rows[3].toUpperCase();
    sigle_list["Player_3"] = rows[4].toUpperCase();
    sigle_list["Name"] = rows[1];

    sigle_list["Player_names"] = player_name;
    console.log(sigle_list);
    //console.log(rows)
    Group_list[get_groupID(rows[0])].push(sigle_list);
}


function GEN_GRankList(snapshot, player_snap) {
    Group_list = [];
    GROUP_static = {};
    for (var i = 0; i < PlAYER_GROUP.length; i++) {
        GROUP_static[PlAYER_GROUP[i]] = 0;
        Group_list.push([]);
    }
    var input = init_data.value.split('\n');
    for (var i = 0; i < input.length; i++) {
        if (input[i].length > 0) {
            var rows = input[i].split(/,|\s+|\t/);
            if (rows.length == 5 & rows[0] != "Group") {
                var sub_data = snapshot.child(rows[0]).val();
                init_row(rows, sub_data, player_snap.val());
                GROUP_static[rows[0]]++;
            }
        }
    }
    var updates = {};
    for (var i = 0; i < PlAYER_GROUP.length; i++) {
        Group_list[i].sort(Rankcompare);
        updates["/Qual_Ranking/" + PlAYER_GROUP[i]] = Group_list[i];
    }
    firebase.database().ref('/Group_Elimination').update(updates);

}
var init_data = document.getElementById("init_GEarea");

function init_Eset() {
    var wave_data = {};
    wave_data["wave"] = 1;
    wave_data["Stage"] = STAGE_NAME[STAGE_NAME.length - 1];
    firebase.database().ref('/Group_Elimination/').update(wave_data);
    var updates = {};
    updates['Match_stage'] = "Group_Elimination/" + STAGE_NAME[STAGE_NAME.length - 1];
    firebase.database().ref().update(updates);
    Setting_ver();
}

function init_GEsetData() {
    firebase.database().ref("Group_Elimination").remove();
    var loc = "Qualification_result";
    if (document.getElementById("SetOnlyCheck").checked) loc = "Qualification_SetOnly_result";
    var ref_player = firebase.database().ref('/Player_data').once("value").then(function(player_snap) {


        var ref = firebase.database().ref('/Qualification/player_result/' + loc);
        var search = ref.once("value").then(function(snapshot) {
            GEN_GRankList(snapshot, player_snap);

            for (var j = STAGE_NAME.length - 1; j >= 0; j--) {
                var MAX_target = 1;
                start_target = {};
                for (var i = 0; i < PlAYER_GROUP.length; i++) {
                    var print_data = false;
                    if (top_convert(Team_top[i]) == j) print_data = true
                    MAX_target = init_GElimStage0(j, i, print_data, MAX_target, Group_list[i]);
                    console.log(MAX_target);
                    firebase.database().ref('/Statistics/Target_start/Group_Elimination/' + STAGE_NAME[j]).update(start_target);
                }
            }

            console.log("update_wave")
            var wave_data = {};
            wave_data["wave"] = 1;
            wave_data["Stage"] = STAGE_NAME[STAGE_NAME.length - 1];
            firebase.database().ref('/Group_Elimination/').update(wave_data);
            init_GEliminationControl();
        });
    });
}

function init_GElimStage0(stage_ID, group_id, print_data, MAX_target, GRank_list) {
    // console.log(STAGE_NAME[stage_ID]+" "+PlAYER_GROUP[group_id]);
    var E_match_ID = top_convert(Team_top[group_id])
    if (E_match_ID >= stage_ID) {
        console.log(PlAYER_GROUP[group_id] + " " + STAGE_NAME[stage_ID]);
        var updates = {};
        if (MAX_target < Elim_targetbase[group_id] && Target_Distance[group_id] != Target_Distance[group_id - 1])
            MAX_target = Elim_targetbase[group_id];
        start_target[PlAYER_GROUP[group_id]] = MAX_target;
        var s_ptr, e_ptr;
        s_ptr = 0;
        e_ptr = find_max_target(STAGE_NAME[stage_ID]) - 1;
        console.log(e_ptr)

        while (s_ptr < e_ptr) {
            var tree_node = get_position(s_ptr, stage_ID);

            updates = set_GElimPlayer(updates, tree_node, s_ptr++, e_ptr--, group_id, print_data, GRank_list)
            MAX_target++;

            if (stage_ID == 0) {
                updates = set_GElimPlayer(updates, tree_node + 1, s_ptr++, e_ptr--, group_id, print_data, GRank_list)
            }
        }
        console.log(updates);
        firebase.database().ref('/Group_Elimination/' + STAGE_NAME[stage_ID] + "/" + PlAYER_GROUP[group_id]).update(updates);

    }
    return MAX_target;
}

function set_GElimPlayer(updates, tree_node, s_ptr, e_ptr, group_id, print_data, GRank_list) {
    console.log("start:" + s_ptr);
    console.log(GRank_list);
    var match_target = 2 * s_ptr + start_target[PlAYER_GROUP[group_id]];
    updates[tree_node + "/target"] = match_target;
    if (print_data) {
        console.log(GRank_list[s_ptr]);
        if (GRank_list[s_ptr]) {
            updates[tree_node + "/A/Name"] = GRank_list[s_ptr]["Name"];
            updates[tree_node + "/A/Player_1"] = GRank_list[s_ptr]["Player_1"];
            updates[tree_node + "/A/Player_2"] = GRank_list[s_ptr]["Player_2"];
            updates[tree_node + "/A/Player_3"] = GRank_list[s_ptr]["Player_3"];
            updates[tree_node + "/A/Player_Names"] = GRank_list[s_ptr]["Player_names"]
            updates[tree_node + "/A/target"] = match_target;
            updates[tree_node + "/A/Rank"] = s_ptr;
        }
        if (GRank_list[e_ptr]) {
            updates[tree_node + "/B/Name"] = GRank_list[e_ptr]["Name"];
            updates[tree_node + "/B/Player_1"] = GRank_list[e_ptr]["Player_1"];
            updates[tree_node + "/B/Player_2"] = GRank_list[e_ptr]["Player_2"];
            updates[tree_node + "/B/Player_3"] = GRank_list[e_ptr]["Player_3"];
            updates[tree_node + "/B/Player_Names"] = GRank_list[s_ptr]["Player_names"]
            updates[tree_node + "/B/target"] = match_target + 1;
            updates[tree_node + "/B/Rank"] = e_ptr;
        }
    } else {
        // updates[tree_node+"/A/Name"]="NULL"
        //updates[tree_node+"/B/Name"]="NULL"
    }
    updates["Target_list/" + match_target + "/tree_node"] = tree_node;
    updates["Target_list/" + (match_target + 1) + "/tree_node"] = tree_node;
    if (!updates[tree_node + "/B/Name"] & typeof(updates[tree_node + "/A/Name"]) != "undefined") {
        updates[tree_node + "/A/Win"] = true;
    }
    return updates;
}




function top_convert(TOP) {
    if (TOP == 32) return 4;
    if (TOP == 16) return 3;
    if (TOP == 8) return 2;
    if (TOP == 4) return 1;
    if (TOP == 2) return 0;
}

function stage_trans(name) {
    for (var i = 0; i < STAGE_NAME.length; i++) {
        if (STAGE_NAME[i] == name) {
            return i;
        }
    }
}

function force_change_wave() {
    var ref = firebase.database().ref('/Group_Elimination/');
    var updates = {};
    updates["wave"] = parseInt(force_wave.value);
    ref.update(updates);
    document.getElementById("wave_num").innerHTML = updates['wave'];
    init_GEliminationControl();
}

function change_next_wave() {
    //checked_win();
    var ref = firebase.database().ref('/Group_Elimination/');
    var search = ref.once("value").then(function(snapshot) {
        var ret_wave = snapshot.child("/wave").val();
        var updates = {};
        if (!ret_wave || ret_wave == '0') {
            updates['wave'] = 1;
            ref.update(updates);
            document.getElementById("wave_num").innerHTML = '1';
            force_wave.value = 1;
        } else if (parseInt(ret_wave) < 6) {
            updates['wave'] = parseInt(ret_wave) + 1;
            ref.update(updates);
            force_wave.value = updates['wave'];
            document.getElementById("wave_num").innerHTML = updates['wave'];

        }
        init_GEliminationControl();
    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorMessage);
    })
}

function change_next_EStage() {
    init_GEliminationControl();
    var ref = firebase.database().ref('/Group_Elimination');
    var search = ref.once("value").then(function(snapshot) {
        var stage_ID = stage_trans(snapshot.child("Stage").val());
        console.log("stage:" + stage_ID)
        if (stage_ID > 0) {
            var updates = {};
            updates["/Group_Elimination/Stage"] = STAGE_NAME[stage_ID - 1];
            updates["/Group_Elimination/wave"] = 1;
            updates['Match_stage'] = "Group_Elimination/" + STAGE_NAME[stage_ID - 1];
            firebase.database().ref().update(updates);
            Setting_ver();
        }
    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorMessage);
    })
}

function force_change_stage() {
    var ref = firebase.database().ref('/Group_Elimination/');
    var updates = {};
    var idx = parseInt(document.getElementById("stage_sel").value);
    updates["Stage"] = STAGE_NAME[idx];
    ref.update(updates);
    var update = {};
    update['Match_stage'] = "Group_Elimination/" + STAGE_NAME[idx];
    firebase.database().ref().update(update);
    Setting_ver();
    init_GEliminationControl();
}

function checked_win() {
    var ref = firebase.database().ref('/Group_Elimination/');
    var search = ref.once("value").then(function(snapshot) {
        var stage = snapshot.child("/Stage").val();
        if (stage) {
            for (var i = 0; i < PlAYER_GROUP.length; i++) {
                //console.log(stage+"/"+PlAYER_GROUP[i]);
                var data = snapshot.child(stage + "/" + PlAYER_GROUP[i]);
                if (!data.val());
                else if (stage != "Final")
                    search_win(data, PlAYER_GROUP[i], stage);
            }
        }
    });
}


function search_win(data, group, stage) {
    var stage_ID = stage_trans(stage);
    var s_node = 0;
    var e_node = find_max_target(stage) / 2 - 1;
    var updates = {};
    var next_node = s_node;
    //console.log(s_node+" "+e_node)
    while (s_node < e_node) {
        var n_node = s_node + 1;
        var nextStage_node = Math.floor(n_node / 2);
        if (data.child(s_node + "/" + "target").val() < data.child(n_node + "/" + "target").val()) {
            var s_nodeVal = data.child(s_node).val();
            var n_nodeVal = data.child(n_node).val();
        } else {
            var s_nodeVal = data.child(n_node).val();
            var n_nodeVal = data.child(s_node).val();
        }

        // console.log(s_nodeVal)
        var groupA;
        var groupB;
        groupA = check_winner(s_nodeVal);
        groupB = check_winner(n_nodeVal);
        console.log(s_node);
        console.log(groupA);
        if (groupA["win"]) {
            groupA["win"]["Judge_Win"] = [];
            groupA["win"]["Win"] = [];
            update_node(groupA["win"], group, stage_ID - 1, nextStage_node + "/A")
        }
        if (groupB["win"]) {
            groupB["win"]["Judge_Win"] = [];
            groupB["win"]["Win"] = [];
            update_node(groupB["win"], group, stage_ID - 1, nextStage_node + "/B")
        }
        if (stage == "Semi_Final") {
            nextStage_node += 1;
            if (groupA["loss"]) {
                groupA["loss"]["Judge_Win"] = [];
                groupA["loss"]["Win"] = [];
                update_node(groupA["loss"], group, stage_ID - 1, nextStage_node + "/A")
            }
            if (groupB["loss"]) {
                groupB["loss"]["Judge_Win"] = [];
                groupB["loss"]["Win"] = [];
                update_node(groupB["loss"], group, stage_ID - 1, nextStage_node + "/B")
            }
            s_node += 2;
        }
        s_node += 2;
    }
    console.log("finish update " + group);


}

function check_winner(data_val) {
    var group = {};
    if (typeof(data_val["A"]) != "undefined") {
        if (data_val["A"]["Win"] && data_val["B"]["Win"]) {
            if (data_val["A"]["Judge_Win"] == true) {
                group["win"] = data_val["A"];
                group["loss"] = data_val["B"];
            } else if (data_val["B"]["Judge_Win"] == true) {
                group["win"] = data_val["B"];
                group["loss"] = data_val["A"];

            }
        } else if (data_val["A"]["Win"] == true) {
            group["win"] = data_val["A"];
            group["loss"] = data_val["B"];

        } else if (typeof(data_val["B"]) != "undefined") {
            if (data_val["B"]["Win"] == true) {
                group["win"] = data_val["B"];
                group["loss"] = data_val["A"];
            }
        } else {
            group["win"] = data_val["A"];
            //group["loss"]=data_val["B"];
        }

    }

    console.log(group);
    return group;
}

function update_node(data_val, group, stage_ID, node) {
    var path = '/Group_Elimination/' + STAGE_NAME[stage_ID] + "/" + group + "/" + node;
    //console.log(path)
    var ref = firebase.database().ref(path);
    ref.update(data_val);
}

function get_position(rank, level) { //rank start from 0
    var i = 0;

    for (i = 0; i < WIN_tree[level].length; i++) {
        if (WIN_tree[level][i] == rank) {
            if (level != 4) return Math.floor(i / 2);
            else return Math.floor(i / 4);
        }
    }

}


function Setting_ver() {
    init_ver_code_finish = false;
    init_ver_code();
    setTimeout(Init_targetVAR, 1000);
}

function Init_targetVAR() {
    if (init_ver_code_finish) {
        var ref = firebase.database().ref('/Group_Elimination/' + Match_subtype);
        //try{
        var search = ref.once("value").then(function(snapshot) {
            var ret = snapshot.val();
            var stage_group = Object.keys(snapshot.val());
            for (var i = 0; i < stage_group.length; i++) {
                console.log(stage_group[i])
                var target_list = Object.keys(ret[stage_group[i]]['Target_list']);
                console.log(target_list);
                for (var j = 0; j < target_list.length; j++) {
                    var target_node = ret[stage_group[i]]['Target_list'][target_list[j]]["tree_node"];
                    console.log(ret);
                    //if(ret[stage_group[i]][target_node]['A']&ret[stage_group[i]][target_node]["B"])
                    console.log(typeof(ret[stage_group[i]][target_node]['A']));
                    if (typeof(ret[stage_group[i]][target_node]['A']) != "undefined" & typeof(ret[stage_group[i]][target_node]['B']) != "undefined") {
                        console.log(target_list[j])
                        init_finish_wave(parseInt(target_list[j]))
                    }
                }

            }
        });
        //}
        // catch(error){
        //  console.log(error);
        //}

    } else
        setTimeout(Init_targetVAR, 500);
}

function get_Elimaccsum(target) {
    console.log("get_Elimaccsum " + target)
    var player_num = 2;
    var group = get_group_bytarget(target);
    for (var i = 0; i < player_num; i++) {
        get_PlayerElimAccSum(group, target, i);
    }
}

function get_PlayerElimAccSum(group, target, positionID) {
    var queryStr = Match_stage + '/player_result/set_point/' + group + "/" + target + POSITION_POINT[positionID];
    var ref = firebase.database().ref(queryStr);
    var search = ref.once("value").then(function(snapshot) {
        var acc_sum = 0;
        if (snapshot.val()) {

            for (j = 1; j <= ELIM_SET_NUM; j++) {
                if (ELIM_POINT_SYSTEM[get_groupID(group)] == 1) {
                    if (snapshot.child(j + "/Elim_set_point").val()) {
                        acc_sum += parseInt(snapshot.child(j + "/Elim_set_point").val());

                    }
                } else if (snapshot.child("/" + j + "/P_SUM").val())
                    acc_sum += parseInt(snapshot.child(j + "/P_SUM").val());
            }
            console.log(queryStr);
            console.log(acc_sum);
            update_PlayerElimAccSum(acc_sum, group, target, positionID)

        }
    });
}

function update_PlayerElimAccSum(acc_sum, group, target, positionID) {
    console.log("update_Elimaccsum " + target)
    var querystr = Match_stage + "/" + get_group_bytarget(target) + '/';
    var ref = firebase.database().ref(querystr + "Target_list/" + target + "/tree_node");
    var search = ref.once("value").then(function(snapshot) {

        var Target_node = snapshot.val()
        var dataA = Match_stage + "/" + group + "/" + Target_node + "/" + POSITION_POINT[positionID];
        var updates = {};
        updates["Point_Sum"] = acc_sum;
        if (acc_sum >= WIN_point) {
            updates["Win"] = true;
        } else
            updates["Win"] = null;
        firebase.database().ref(dataA).update(updates);


    });
}

//----------------------------------------------------------------
var result_smbt = document.getElementById("result_smbt");
var mod_area = document.getElementById("mod_area");
var message_area = document.getElementById("message_area");
var wait = 0;
result_smbt.addEventListener("click", mod_result);
message_area.style.backgroundColor = '#99FF66';
message_area.style.color = '#78909C';
var message_string = "換行分隔多筆資料\n";
message_area.value = message_string;

var rows_raw;
var MOD_ERROR = ["", "NO_PLAYER", "INPUT_NO_IN_FORMAT", "POINT_NO_IN_FORMAT"]
var error_code = [];
var mod_temp_area;
var fail_num = 0;
var rows_remain = 0;



function mod_result() {
    rows_raw = mod_area.value.toUpperCase().split('\n');
    var rows_num = rows_raw.length;
    rows_remain = rows_num;
    fail_num = 0;
    message_area.value = message_string;
    mod_temp_area = message_area.value;
    message_area.style.backgroundColor = '#99FF66';
    for (var i = 0; i < rows_num; i++) {
        checked_mod_input(rows_raw[i], i, rows_num);
    }
}

function checked_mod_input(rows, rows_id, rows_num) {
    var rows_val = rows.split(/,|\s+|\t/);
    var target_in = rows_val[0];
    var match_type_num = parseInt(rows_val[1]);
    var match_type = STAGE_NAME[match_type_num];
    var group = get_group_bytarget(target_in);
    var ref = firebase.database().ref('Group_Elimination/' + match_type + '/' + group + '/Target_list');
    var search = ref.once("value").then(function(snapshot) {
        var val_get = snapshot.val();
        console.log(group);
        if (val_get[target_in]) {
            error_code[rows_id] = 0;
            upload_result(rows, rows_id, group, rows_num);
        } else {
            error_code[rows_id] = 1; //no id
            rows_remain--;
            return_mod_error(rows_id, rows_num);
            console.log("NOTARGET IN:" + rows_id);
        }
    });
}



function upload_result(rows, rows_id, group, rows_num) {
    var rows_val = rows.split(/,|\s+|\t/);
    var target_in = rows_val[0].toUpperCase();
    var match_type_num = parseInt(rows_val[1]);
    var match_type = STAGE_NAME[match_type_num];
    var set = rows_val[2];
    var X_sum = [0, 0];
    var X_10_sum = [0, 0];
    var M_sum = [0, 0];
    var P_sum = [0, 0];
    var Elim_set_point = [0, 0];
    var ref = firebase.database().ref('/Group_Elimination/' + match_type + '/player_result/set_point/' + group + "/");
    if (rows_val.length < (GELIM_SCORE_NUM * 2 + 3)) {
        error_code[rows_id] = 2;
        console.log("len error")
    } else {
        var offset = 3
        for (var i = 0; i < 2; i++) {
            for (var j = offset; j < GELIM_SCORE_NUM + offset; j++) {
                if (rows_val[j] != "") {
                    if (rows_val[j] == 'X' || rows_val[j] == 'x') {
                        X_sum[i] += 1;
                        X_10_sum[i] += 1;
                        P_sum[i] += 10;
                    } else if (rows_val[j] == 'M' || rows_val[j] == 'm') {
                        M_sum[i] += 1;
                    } else if (parseInt(rows_val[j]) == 10) {
                        X_10_sum[i] += 1;
                        P_sum[i] += 10;
                    } else if (parseInt(rows_val[j]) >= 1 && parseInt(rows_val[j]) <= 9) {
                        P_sum[i] += parseInt(rows_val[j]);
                    } else {
                        exclude++;
                        error_code[rows_id] = 3;
                    }
                }
            }
            offset += GELIM_SCORE_NUM;
        }
        if (P_sum[0] > P_sum[1]) {
            Elim_set_point = [2, 0];
        } else if (P_sum[0] < P_sum[1]) {
            Elim_set_point = [0, 2];
        } else {
            Elim_set_point = [1, 1];
        }
    }
    if (error_code[rows_id] == 0) {
        var updates = {};
        var playermark = ["A", "B"];
        var offset = 3;
        for (var i = 0; i < 2; i++) {
            var player_id = target_in + playermark[i];
            for (var j = offset; j < offset + GELIM_SCORE_NUM; j++) {
                updates[player_id + "/" + set + '/P' + (j - offset - 1)] = rows_val[j];
            }
            updates[player_id + "/" + set + '/P_SUM/'] = P_sum[i];
            updates[player_id + "/" + set + '/X_10_sum/'] = X_10_sum[i];
            updates[player_id + "/" + set + '/X_sum/'] = X_sum[i];
            updates[player_id + "/" + set + '/M_sum/'] = M_sum[i];
            updates[player_id + "/" + set + '/Elim_set_point/'] = Elim_set_point[i];
            offset += GELIM_SCORE_NUM;
        }



        ref.update(updates);
        rows_remain--;
    } else {
        //console.log(rows_num+" "+rows_id);
        rows_remain--;
        return_mod_error(rows_id, rows_num);
    }
    if (rows_remain == 0) {
        mod_temp_area += "總共";
        mod_temp_area += rows_num;
        mod_temp_area += "筆資料:";
        mod_temp_area += rows_num - fail_num;
        mod_temp_area += "筆成功|";
        mod_temp_area += fail_num;
        mod_temp_area += "筆失敗\n";
        message_area.value = mod_temp_area;
    }
}

function return_mod_error(rows_id, rows_num) {
    if (error_code[rows_id] > 0) {
        if (fail_num == 0) {
            message_area.style.backgroundColor = "#FFCDD2";
            mod_temp_area += "下列資料輸入失敗:\n";
        }
        fail_num++;
        mod_temp_area += rows_raw[rows_id];
        mod_temp_area + "//";
        mod_temp_area += MOD_ERROR[error_code[rows_id]];
        mod_temp_area += '\n';
    }


}