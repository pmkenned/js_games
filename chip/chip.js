"use strict";

// Passwords:
// Level 1:
// Level 2:
// Level 3:
// Level 4:
// Level 5: TQKB
// Level 6: WNLD
// Level 7: FXQO
// Level 8: NHAG
// Level 9: KCRE

// Reference implementation: https://archive.org/details/chips_challenge_windows_3.x

const LEFT_BUTTON = 0;
const RIGHT_BUTTON = 2;

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
//ctx.imageSmoothingEnabled = false; // TODO: find out why this doesn't work

// TODO: show inventory, timer, number of chips remaining
// TODO: buttons that move creatures
// TODO: show player facing which way they moved
// TODO: make sure all creatures move at right speed

// TODO: show/hide entities in editor mode?
// TODO: click-and-drag for textures/entities?

// TODO: use something like this instead of strings
//const Tiles = Object.freeze({
//    FLOOR:      0,
//    WALL:       1,
//    BLOCK:      2,
//});

const fixed_dt = 8; // 125 Hz
const MAX_FRAMETIME = 250;

const TIMER_INTERVAL_MS = 100;
const DIR_TIMER_MS = 100;

let sq;
const nr = 23;
const nc = 23;

let width;
let height;
let pressed;
let mouse_down_left = false;
let mouse_down_right = false;
let paused;
let recording = false;
let playback = false;
let editor_mode;
let advanceFrame;
let accumulator;
let frameCount;
let simRate = 1.0;
let simRate_msg;
let simRate_timeout;

let prevTime;
let msg;

let editor_selection;
let editor_panel = {};

const tile_to_tex_name_dict = {
    BALL_:      [ball_tex,              ball_tex],
    BLOCK:      [block_tex,             block_tex],
    BK_CP:      [block_tex,             block_chip_tex],
    BK_FR:      [block_tex,             block_fire_tex],
    BOMB_:      [bomb_tex,              bomb_tex],
    FLIP_:      [boot_flipper_tex,      boot_flipper_tex],
    BOOTG:      [boot_green_tex,        boot_green_tex],
    BOOTR:      [boot_red_tex,          boot_red_tex],
    SKATE:      [boot_skate_tex,        boot_skate_tex],
    BRDRE:      [border_empty_tex,      border_empty_tex],
    BRDRF:      [border_full_tex,       border_full_tex],
    BTNBL:      [button_blue_tex,       button_blue_tex],
    BTNBR:      [button_brown_tex,      button_brown_tex],
    BTNGR:      [button_green_tex,      button_green_tex],
    BTNRE:      [button_red_tex,        button_red_tex],
    CHIP_:      [chip_tex,              chip_tex],
    CIRBR:      [button_big_brown_tex,  button_big_brown_tex],
    CIRCY:      [button_big_cyan_tex,   button_big_cyan_tex],
    CIRGY:      [button_big_gray_tex,   button_big_gray_tex],
    CLONE:      [clone_tex,             clone_tex],
    CLMCL:      [clone_machine_tex,     clone_machine_tex],
    CLMCR:      [clone_machine_tex,     clone_machine_tex],
    CLMCU:      [clone_machine_tex,     clone_machine_tex],
    CLMCD:      [clone_machine_tex,     clone_machine_tex],
    END__:      [end_tex,               end_tex],
    FIRE_:      [fire_tex,              fire_tex],
    '     ':    [floor_tex,             floor_tex],
//  'TODO':     [floor_edge_tex,        floor_edge_tex],
//  'TODO':     [gravel_tex,            gravel_tex],
    HELP_:      [help_tex,              help_tex],
    ICE__:      [ice_tex,               ice_tex],
    ICEUL:      [ice_ul_tex,            ice_ul_tex],
    ICELL:      [ice_ll_tex,            ice_ll_tex],
    KEYC:       [key_cyan_tex,          key_cyan_tex],
    KEYG:       [key_green_tex,         key_green_tex],
    KEYR:       [key_red_tex,           key_red_tex],
    KEYY:       [key_yellow_tex,        key_yellow_tex],
    LOCKC:      [lock_cyan_tex,         lock_cyan_tex],
    LOCKG:      [lock_green_tex,        lock_green_tex],
    LOCKR:      [lock_red_tex,          lock_red_tex],
    LOCKY:      [lock_yellow_tex,       lock_yellow_tex],
    PUSHR:      [push_right_tex,        push_right_tex],
    PUSHL:      [push_left_tex,         push_left_tex],
    PUSHU:      [push_up_tex,           push_up_tex],
    PUSHD:      [push_down_tex,         push_down_tex],
    RAFT_:      [raft_tex,              raft_tex],
    RAY__:      [ray_tex,               ray_tex],
    SOCK_:      [socket_tex,            socket_tex],
    START:      [floor_tex,             player_front_tex],
    THIEF:      [thief_tex,             thief_tex],
    WALL_:      [wall_tex,              wall_tex],
    BLUEW:      [wall_blue_tex,         wall_blue_tex],
    FAKEW:      [wall_blue_tex,         wall_false_tex],
    HIDEW:      [floor_tex,             wall_invisible_tex],
    SHOWW:      [floor_tex,             wall_reveal_tex],
    WASP_:      [wasp_tex,              wasp_tex],
    WATER:      [water_tex,             water_tex],
};

// initialize tile panel for editor
(function() {
    let tr=0, tc=-Math.ceil(Object.keys(tile_to_tex_name_dict).length/nr)-1;
    for (const t of Object.entries(tile_to_tex_name_dict)) {
        editor_panel[`${tr},${tc}`] = t[0];
        tr = (tr+1) % nr;
        if (tr == 0)
            tc++;
    }
})();

let cs = {};
let ss = {};

function saveState() {
    ss = JSON.parse(JSON.stringify(cs));
}

function restoreState() {
    cs = JSON.parse(JSON.stringify(ss));
}

function goToLevel(n) {

    if (n < 1)
        return;
    if (n >= maps.length)
        return;
    cs.level = n;

    cs.player = {
        keyg: 0,
        keyy: 0,
        keyc: 0,
        keyr: 0,
        boot_red: false,
        boot_green: false,
        boot_flipper: false,
        boot_skate: false,
        dir: ' ',
    };
    cs.creatures = [];

    if (n < maps.length)
        cs.map = JSON.parse(JSON.stringify(maps[n]));

    // count chips by default
    for (let r = 0; r < cs.map.length; r++) {
        for (let c = 0; c < cs.map[0].length; c++) {
            if (cs.map[r][c] == 'CHIP_')
                cs.chips++;
        }
    }

    if (n == 1) {
    } else if (n == 2) {
        cs.creatures.push({type: 'wasp', r: -1, c: -8, dir: 'L', pi: 0, path: ['U', 'U', 'L', 'L', 'D', 'D', 'D', 'D', 'D', 'D', 'R', 'R', 'U', 'U', 'R', 'U', 'U', 'L']});
        cs.creatures.push({type: 'wasp', r:  0, c: -7, dir: 'U', pi: 0, path: ['U', 'L', 'U', 'U', 'L', 'L', 'D', 'D', 'D', 'D', 'D', 'D', 'R', 'R', 'U', 'U', 'R', 'U']});
        cs.creatures.push({type: 'wasp', r:  1, c: -8, dir: 'U', pi: 0, path: ['R', 'U', 'U', 'L', 'U', 'U', 'L', 'L', 'D', 'D', 'D', 'D', 'D', 'D', 'R', 'R', 'U', 'U']});
    } else if (n == 3) {
    } else if (n == 4) {
        cs.creatures.push({type: 'tank', r: -4, c: -6, dir: 'U', pi: 0, path: ['D', 'D'], moving: false, reverse: false});
        cs.creatures.push({type: 'tank', r:  0, c: -6, dir: 'U', pi: 0, path: ['D', 'D'], moving: false, reverse: false});
    } else if (n == 5) {
        // TODO: clone machine, brown buttons, turn ray
        cs.creatures.push({type: 'ball', r: -4, c: -3, dir: 'R'});
        cs.creatures.push({type: 'ray',  r: -9, c: -2, dir: 'U', pi: 0, path: ['U', 'U', 'U', 'S', 'U', 'U', 'L', 'L', 'L', 'L', 'L', 'L'], moving: false});
    } else if (n == 6) {
        cs.chips = 4;
    } else {
        // END GAME?
        //goToLevel(1);
    }

    // find player start
    let found_start = false;
    for (let r = 0; r < cs.map.length; r++) {
        for (let c = 0; c < cs.map[0].length; c++) {
            if (cs.map[r][c] == 'START') {
                cs.player.r = r;
                cs.player.c = c;
                found_start = true;
                break;
            }
        }
    }
    if (!found_start) console.error(`No "START" found in map for level ${n}`);

    // locate creatures relative to player
    for (const creature of cs.creatures) {
        creature.r = cs.player.r + creature.r;
        creature.c = cs.player.c + creature.c;
    }

    cs.camera = {};
    cs.camera.r = cs.player.r;
    cs.camera.c = cs.player.c;
}

function nextLevel() { goToLevel(cs.level+1); }
function prevLevel() { goToLevel(cs.level-1); }

function reset(level = 1) {
    resize();
    pressed = {};
    paused = false;
    //recording = false;
    //playback = false;
    editor_mode = false;
    advanceFrame = false;
    accumulator = 0;
    frameCount = 0;
    prevTime = 0;

    cs = {
        level: level,
        timer: TIMER_INTERVAL_MS,
        dir_timer: 0,
        dead: false,
    };

    goToLevel(cs.level);
}

reset();
saveState();

function px(x, f=0.0) { return Math.round(x) + f; }

function worldToScreen(coord) {
    return {
        x: width/2 + coord.x*sq - nc*sq/2,
        y: height/2 + coord.y*sq - nr*sq/2,
        w: coord.w * sq,
        h: coord.h * sq,
    };
}

function drawRect(style, rect) {
    ctx.fillStyle = style;
    const sr = worldToScreen(rect);
    ctx.fillRect(px(sr.x), px(sr.y), sr.w, sr.h);
}

function drawTexture(tex, rect) {
    const sr = worldToScreen(rect);
    ctx.drawImage(tex, px(sr.x), px(sr.y), sr.w, sr.h);
}

function drawText(args) {
    const ts = 0.019;
    args = args ?? {};
    args.size = args.size ?? 40;
    args.text = args.text ?? "";
    args.ro = args.ro ?? 0;
    args.co = args.co ?? 0;
    args.r = args.r ?? Math.floor(nr/2) + args.ro;
    args.c = args.c ?? Math.floor(nc/2) - Math.floor(args.text.length*ts*args.size/2) + args.co;
    args.fill = args.fill ?? "black";
    //args.stroke = args.stroke ?? "black";
    args.bgfill = args.bgfill ?? "white";
    args.bgstroke = args.bgstroke ?? "black";

    const tr = worldToScreen({x: args.c, y: args.r, w: Math.ceil(args.text.length*ts*args.size), h: 1});
    if (args.bgfill || args.bgstroke) {
        ctx.beginPath();
        ctx.rect(tr.x, tr.y, tr.w, -tr.h);
        ctx.fillStyle = args.bgfill;
        ctx.strokeStyle = args.bgstroke;
        if (args.bgfill) ctx.fill();
        if (args.bgstroke) ctx.stroke();
    }
    ctx.font = `${args.size}px Courier New`;
    ctx.lineWidth = 1;
    ctx.fillStyle = args.fill;
    ctx.strokeStyle = args.stroke;
    const offset = sq/5;
    if (args.fill) ctx.fillText(args.text, tr.x+offset, tr.y-offset);
    if (args.stroke) ctx.strokeText(args.text, tr.x+offset, tr.y-offset);
}

function tile_name_to_tex(m)
{
    m = m ?? '';
    m = m.replace(/\d+$/,'');
    const ti = editor_mode ? 1 : 0;
    if      (m in tile_to_tex_name_dict)    return tile_to_tex_name_dict[m][ti];
    else                                    return editor_mode ? help_tex : floor_tex;
}

function is_inside_view(r, c) { return (r >= 0 && r < nr && c >= 0 && c < nc); }
function is_inside_map(r, c) { return (r >= 0 && c >= 0 && r < cs.map.length && c < cs.map[0].length); }

function draw() {
    ctx.clearRect(0, 0, width, height);

    // draw map
    for (let r = 0; r < nr; r++) {
        for (let c = 0; c < nc; c++) {
            const rm = cs.camera.r - Math.floor(nr/2) + r;
            const cm = cs.camera.c - Math.floor(nc/2) + c;
            const m = is_inside_map(rm, cm) ? cs.map[rm][cm] : null;
            let tex = tile_name_to_tex(m);
            drawTexture(tex, {x: c, y: r, w: 1, h: 1});
        }
    }

    // draw player

    let player_tex = player_front_tex;
    const player_tile = cs.map[cs.player.r][cs.player.c];

    if (player_tile == '     ' || player_tile == 'START') {
        if (cs.player.dir == ' ')
            player_tex = player_front_tex;
        else if (cs.player.dir == 'U')
            player_tex = player_back_tex;
        else if (cs.player.dir == 'D')
            player_tex = player_front_tex;
        else if (cs.player.dir == 'L')
            player_tex = player_left_tex;
        else if (cs.player.dir == 'R')
            player_tex = player_right_tex;
    } else if (player_tile == 'FIRE_') {
        if (!cs.player.boot_flipper) {
            player_tex = burn_tex;
        } else {
            player_tex = player_front_tex; // TODO
        }
    } else if (player_tile == 'WATER') {
        if (!cs.player.boot_flipper) {
            player_tex = splash_tex;
        } else {
            if (cs.player.dir == ' ')
                player_tex = swim_front_tex;
            else if (cs.player.dir == 'U')
                player_tex = swim_back_tex;
            else if (cs.player.dir == 'D')
                player_tex = swim_front_tex;
            else if (cs.player.dir == 'L')
                player_tex = swim_left_tex;
            else if (cs.player.dir == 'R')
                player_tex = swim_right_tex;
        }
    } else if (player_tile.substr(0,3) == 'ICE') {
        if (cs.player.dir == ' ')
            player_tex = player_ice_front_tex;
        else if (cs.player.dir == 'U')
            player_tex = player_ice_back_tex;
        else if (cs.player.dir == 'D')
            player_tex = player_ice_front_tex;
        else if (cs.player.dir == 'L')
            player_tex = player_ice_left_tex;
        else if (cs.player.dir == 'R')
            player_tex = player_ice_right_tex;
    }

    const rp = Math.floor(nr/2) + cs.player.r - cs.camera.r;
    const cp = Math.floor(nc/2) + cs.player.c - cs.camera.c;
    drawTexture(player_tex, {x: cp, y: rp, w: 1, h: 1});

    // draw creatures
    for (const creature of cs.creatures) {
        if (creature.dead)
            continue;
        const rc = Math.floor(nr/2) + creature.r - cs.camera.r;
        const cc = Math.floor(nc/2) + creature.c - cs.camera.c;
        if (!is_inside_view(rc, cc)) continue;
        // TODO: choose tex based on creature.dir
        let creature_tex = null;
        if      (creature.type == 'tank') creature_tex = tank_up_tex;
        else if (creature.type == 'ball') creature_tex = ball_tex;
        else if (creature.type == 'ray')  creature_tex = ray_tex;
        else if (creature.type == 'wasp') creature_tex = wasp_tex;
        drawTexture(creature_tex, {x: cc, y: rc, w: 1, h: 1});
    }

    if (recording)
        drawText({r: 0, text: "RECORDING"});
    if (playback)
        drawText({r: 0, text: "PLAYBACK"});
    if (paused)
        drawText({text: "PAUSED"});
    if (editor_mode) {
        drawText({r: 0, text: "EDITOR"});

        // highlight selection
        const sel_cmin = Math.min(editor_selection.ca, editor_selection.cb);
        const sel_rmin = Math.min(editor_selection.ra, editor_selection.rb);
        const sel_w = Math.abs(editor_selection.cb - editor_selection.ca) + 1;
        const sel_h = Math.abs(editor_selection.rb - editor_selection.ra) + 1;
        drawRect("hsla(240, 50%, 50%, 0.5)", {x: sel_cmin, y: sel_rmin, w: sel_w, h: sel_h});

        // draw tile panel
        let tr=0, tc=-Math.ceil(Object.keys(tile_to_tex_name_dict).length/nr)-1;
        for (const t of Object.entries(tile_to_tex_name_dict)) {
            drawTexture(t[1][1], {x: tc, y: tr, w: 1, h: 1});
            tr = (tr+1) % nr;
            if (tr == 0)
                tc++;
        }

        // draw +/- buttons for sides
        drawTexture(push_left_tex,  {x: 0,                y: Math.floor(nr/2), w: 1, h: 1}); // left side
        drawTexture(push_right_tex, {x: 1,                y: Math.floor(nr/2), w: 1, h: 1}); // left side
        drawTexture(push_up_tex,    {x: Math.floor(nc/2), y: 0,                w: 1, h: 1}); // top side
        drawTexture(push_down_tex,  {x: Math.floor(nc/2), y: 1,                w: 1, h: 1}); // top side
        drawTexture(push_right_tex, {x: nc-1,             y: Math.floor(nr/2), w: 1, h: 1}); // right side
        drawTexture(push_left_tex,  {x: nc-2,             y: Math.floor(nr/2), w: 1, h: 1}); // right side
        drawTexture(push_down_tex,  {x: Math.floor(nc/2), y: nr-1,             w: 1, h: 1}); // bottom side
        drawTexture(push_up_tex,    {x: Math.floor(nc/2), y: nr-2,             w: 1, h: 1}); // bottom side
    }

    if (cs.dead) {
        drawText({text: msg, size: 20});
        drawText({ro: 2, text: "Press r to restart", size: 20});
    }

    if (simRate_msg !== undefined)
        drawText({text: simRate_msg, size: 30});
}

function canGo(dr, dc)
{
    const r = cs.player.r + dr;
    const c = cs.player.c + dc;
    const r2 = cs.player.r + 2*dr;
    const c2 = cs.player.c + 2*dc;

    if (cs.map[r][c] == 'BLOCK' || cs.map[r][c].substr(0,3) == 'BK_') {
        if (cs.map[r2][c2] == '     ')
            return true;
        else if (cs.map[r2][c2] == 'WATER')
            return true;
        else
            return false;
    }

    if (cs.map[r][c] == 'WALL_' || cs.map[r][c] == 'BLUEW' || cs.map[r][c] == 'BRDRF' || cs.map[r][c] == 'HIDEW' || cs.map[r][c] == 'SHOWW' || cs.map[r][c].substr(0,4) == 'CLMC')
        return false;

    if (cs.map[r][c] == 'LOCKR' && cs.player.keyr == 0)
        return false;
    if (cs.map[r][c] == 'LOCKY' && cs.player.keyy == 0)
        return false;
    if (cs.map[r][c] == 'LOCKC' && cs.player.keyc == 0)
        return false;
    if (cs.map[r][c] == 'LOCKG' && cs.player.keyg == 0)
        return false;

    if (cs.map[r][c] == 'SOCK_' && cs.chips > 0)
        return false;

    return true;
}

function move(dr, dc)
{
    const r = cs.player.r + dr;
    const c = cs.player.c + dc;
    const r2 = cs.player.r + 2*dr;
    const c2 = cs.player.c + 2*dc;

    //const t = cs.map[r][c];
    //const t2 = cs.map[r2][c2];

    if (cs.map[r][c].substr(0,4) == 'LOCK') {
        const color = cs.map[r][c].substr(4,1);
        if      (color == 'C') cs.player.keyc--;
        else if (color == 'G') cs.player.keyg--;
        else if (color == 'R') cs.player.keyr--;
        else if (color == 'Y') cs.player.keyy--;
        cs.map[r][c] = '     ';
    }

    if (cs.map[r][c] == 'BOOTR') {
        cs.map[r][c] = '     ';
        cs.player.boot_red = true;
    }
    if (cs.map[r][c] == 'BOOTG') {
        cs.map[r][c] = '     ';
        cs.player.boot_green = true;
    }
    if (cs.map[r][c] == 'FLIP_') {
        cs.map[r][c] = '     ';
        cs.player.boot_flipper = true;
    }
    if (cs.map[r][c] == 'SKATE') {
        cs.map[r][c] = '     ';
        cs.player.boot_skate = true;
    }

    // keys
    if (cs.map[r][c].substr(0,3) == 'KEY') {
        const color = cs.map[r][c].substr(3,1);
        const n = parseInt(cs.map[r][c].substr(4,1));
        if      (color == 'C') cs.player.keyc += n;
        else if (color == 'G') cs.player.keyg += n;
        else if (color == 'R') cs.player.keyr += n;
        else if (color == 'Y') cs.player.keyy += n;
        cs.map[r][c] = '     ';
    }

    if (cs.map[r][c] == 'RAFT_') {
        cs.map[r][c] = '     ';
    }

    if (cs.map[r][c] == 'FAKEW') {
        cs.map[r][c] = '     ';
    }

    if (cs.map[r][c] == 'BLOCK') {
        cs.map[r][c] = '     ';
        if (cs.map[r2][c2] == 'WATER')
            cs.map[r2][c2] = 'RAFT_';
        else
            cs.map[r2][c2] = 'BLOCK';
    }

    // BLOCKs with things underneath
    if (cs.map[r][c].substr(0,3) == 'BK_') {
        if (cs.map[r][c] == 'BK_CP') {
            cs.map[r][c] = 'CHIP_'; // TODO: make it more obvious that a chip was picked up
        } else if (cs.map[r][c] == 'BK_FR') {
            cs.map[r][c] = 'FIRE_';
        }
        if (cs.map[r2][c2] == 'WATER')
            cs.map[r2][c2] = 'RAFT_';
        else
            cs.map[r2][c2] = 'BLOCK';
    }

    // start moving tanks
    if (cs.map[r][c] == 'BTNBL') {
        for (const tank of cs.creatures.filter(obj => obj.type == 'tank'))
            tank.moving = true;
    }

    // start moving rays
    if (cs.map[r][c] == 'BTNBR') {
        // TODO: associate each button with specific part of path
        for (const ray of cs.creatures.filter(obj => obj.type == 'ray'))
            ray.moving = true;
    }

    if (cs.map[r][c] == 'BTNRE') {
        console.log('TODO: activate clone machine');
    }

    // toggle bordered walls
    if (cs.map[r][c] == 'BTNGR') {
        for (let rx = 0; rx < cs.map.length; rx++) {
            for (let cx = 0; cx < cs.map[0].length; cx++) {
                if      (cs.map[rx][cx] == 'BRDRE') cs.map[rx][cx] = 'BRDRF';
                else if (cs.map[rx][cx] == 'BRDRF') cs.map[rx][cx] = 'BRDRE';
            }
        }
    }

    if (cs.map[r][c] == 'THIEF') {
        cs.player.keyr = 0;
        cs.player.keyg = 0;
        cs.player.keyy = 0;
        cs.player.keyc = 0;
        cs.boot_red = false;
        cs.boot_green = false;
        cs.boot_flipper = false;
        cs.boot_skate = false;
    }

    cs.player.r = r;
    cs.player.c = c;
    cs.camera.r = cs.player.r;
    cs.camera.c = cs.player.c;

    if (cs.map[r][c] == 'FIRE_' && !cs.player.boot_red) {
        msg = "Oops! Don't step in the fire without fire boots!";
        cs.dead = true;
    }

    if (cs.map[r][c] == 'WATER' && !cs.player.boot_flipper) {
        msg = "Oops! Chip can't swim without flippers!";
        cs.dead = true;
    }

    if (cs.map[r][c] == 'BOMB_') {
        msg = "Oops! Look out for bombs!";
        cs.dead = true;
    }

    if (cs.map[r][c] == 'CHIP_') {
        cs.map[r][c] = '     ';
        cs.chips--;
    }

    if (cs.map[r][c] == 'SOCK_') {
        cs.map[r][c] = '     ';
    }

    if (cs.map[r][c] == 'END__') {
        nextLevel();
    }
}

function tryMove(dr, dc)
{
    const r = cs.player.r + dr;
    const c = cs.player.c + dc;
    if (cs.map[r][c] == 'BLUEW' || cs.map[r][c] == 'SHOWW') {
        cs.map[r][c] = 'WALL_';
    }
    if      (dr > 0) cs.player.dir = 'D';
    else if (dr < 0) cs.player.dir = 'U';
    else if (dc > 0) cs.player.dir = 'R';
    else if (dc < 0) cs.player.dir = 'L';
}

function handleInput(t, dt) {

    // don't allow movement while on ice; TODO: is this right?
    const player_tile = cs.map[cs.player.r][cs.player.c];
    if (player_tile.substr(0,3) == 'ICE' && !cs.player.boot_skate)
        return;

    let dr = 0, dc = 0;

    let arrow_key_pressed = pressed.ArrowLeft || pressed.ArrowRight || pressed.ArrowUp || pressed.ArrowDown;

    if (arrow_key_pressed && cs.dir_timer <= 0) {
        if (pressed.ArrowLeft)  { dc = -1; }
        if (pressed.ArrowRight) { dc =  1; }
        if (pressed.ArrowUp)    { dr = -1; }
        if (pressed.ArrowDown)  { dr =  1; }
        cs.dir_timer = DIR_TIMER_MS;
        pressed = {};
    }

    if (dr != 0 || dc != 0) {
        tryMove(dr, dc);
        if (canGo(dr, dc))
            move(dr, dc);
    }

    if (arrow_key_pressed) {
        if (pressed.ArrowLeft)  { cs.player.dir = 'L'; }
        if (pressed.ArrowRight) { cs.player.dir = 'R'; }
        if (pressed.ArrowUp)    { cs.player.dir = 'U'; }
        if (pressed.ArrowDown)  { cs.player.dir = 'D'; }
    }
}

function update(t, dt) {

    for (const creature of cs.creatures) {
        if (creature.r == cs.player.r && creature.c == cs.player.c) {
            if (creature.dead)
                continue;
            msg = "Look out for creatures!";
            cs.dead = true;
        }
    }

    if (cs.dir_timer > 0) {
        cs.dir_timer -= dt;
    }

    if (cs.timer > 0) {
        cs.timer -= dt;
        return;
    }
    cs.timer += TIMER_INTERVAL_MS;

    // tanks
    for (const tank of cs.creatures.filter(obj => obj.type == 'tank')) {
        if (!tank.moving)
            continue;
        tank.dir = tank.path[tank.pi];
        if (tank.reverse) {
            if      (tank.dir == 'U')  tank.dir = 'D';
            else if (tank.dir == 'D')  tank.dir = 'U';
            else if (tank.dir == 'L')  tank.dir = 'R';
            else if (tank.dir == 'R')  tank.dir = 'L';
        }
        if      (tank.dir == 'U') tank.r--;
        else if (tank.dir == 'L') tank.c--;
        else if (tank.dir == 'R') tank.c++;
        else if (tank.dir == 'D') tank.r++;

        if (tank.reverse)   tank.pi--;
        else                tank.pi++;

        if (tank.pi == tank.path.length) {
            tank.moving = false;
            tank.reverse = true;
            tank.pi--;
        } else if (tank.pi == -1) {
            tank.moving = false;
            tank.reverse = false;
            tank.pi++;
        }
    }

    // wasps
    for (const wasp of cs.creatures.filter(obj => obj.type == 'wasp')) {
        wasp.dir = wasp.path[wasp.pi];
        if      (wasp.dir == 'U') wasp.r--;
        else if (wasp.dir == 'L') wasp.c--;
        else if (wasp.dir == 'R') wasp.c++;
        else if (wasp.dir == 'D') wasp.r++;
        wasp.pi = (wasp.pi + 1) % wasp.path.length;
    }

    // balls
    for (const ball of cs.creatures.filter(obj => obj.type == 'ball')) {
        // TODO: DRY this code
        let btile;
        if (ball.dir == 'R') {
            ball.c++;
            btile = cs.map[ball.r][ball.c];
            if (btile == 'WALL_' || btile == 'BLUEW' || btile == 'BRDRF' || btile == 'HIDEW' || btile == 'SHOWW') {
                ball.c--;
                ball.dir = 'L';
            }
        } else {
            ball.c--;
            btile = cs.map[ball.r][ball.c];
            if (btile == 'WALL_' || btile == 'BLUEW' || btile == 'BRDRF' || btile == 'HIDEW' || btile == 'SHOWW') {
                ball.c++;
                ball.dir = 'R';
            }
        }
        if (btile == 'BTNRE') {
            for (let rx = 0; rx < cs.map.length; rx++) {
                for (let cx = 0; cx < cs.map[0].length; cx++) {
                    if      (cs.map[rx][cx].substr(0,4) == 'CLMC') {
                        ;
                    }
                }
            }
        }
    }

    // rays
    for (const ray of cs.creatures.filter(obj => obj.type == 'ray')) {
        // TODO
        if (ray.dead)
            continue;
        if (!ray.moving)
            continue;
        let new_dir = ray.path[ray.pi];;
        if      (new_dir == 'U') ray.r--;
        else if (new_dir == 'L') ray.c--;
        else if (new_dir == 'R') ray.c++;
        else if (new_dir == 'D') ray.r++;
        else if (new_dir == 'S') { new_dir = ray.dir; ray.moving = false; };
        ray.dir = new_dir;
        ray.pi = (ray.pi + 1) % ray.path.length;
        if (cs.map[ray.r][ray.c] == 'BOMB_') {
            ray.dead = true;
            cs.map[ray.r][ray.c] = '     ';
        }
    }

    const player_tile = cs.map[cs.player.r][cs.player.c];

    // ice
    if (player_tile.substr(0,3) == 'ICE' && !cs.player.boot_skate) {
        if (player_tile == 'ICE__') {
            if      (cs.player.dir == 'L') cs.player.c--;
            else if (cs.player.dir == 'R') cs.player.c++;
            else if (cs.player.dir == 'U') cs.player.r--;
            else if (cs.player.dir == 'D') cs.player.r++;
        } else if (player_tile == 'ICEUL') {
            if      (cs.player.dir == 'L') { cs.player.dir = 'D'; cs.player.r++;    }
            else if (cs.player.dir == 'R') { cs.player.dir = ' ';                   }
            else if (cs.player.dir == 'U') { cs.player.dir = 'R'; cs.player.c++;    }
            else if (cs.player.dir == 'D') { cs.player.dir = ' ';                   }
        } else if (player_tile == 'ICELL') {
            if      (cs.player.dir == 'L') { cs.player.dir = 'U'; cs.player.r--;    }
            else if (cs.player.dir == 'R') { cs.player.dir = ' ';                   }
            else if (cs.player.dir == 'U') { cs.player.dir = ' ';                   }
            else if (cs.player.dir == 'D') { cs.player.dir = 'R'; cs.player.c++;    }
        } else if (player_tile == 'ICEUR') {
            console.error('TODO!');
        } else if (player_tile == 'ICELR') {
            console.error('TODO!');
        }
    }

    // pushers
    if (player_tile.substr(0,4) == 'PUSH' && !cs.player.boot_green) {
        if      (player_tile == 'PUSHL') cs.player.c--;
        else if (player_tile == 'PUSHR') cs.player.c++;
        else if (player_tile == 'PUSHU') cs.player.r--;
        else if (player_tile == 'PUSHD') cs.player.r++;
    }

    cs.camera.r = cs.player.r;
    cs.camera.c = cs.player.c;
}

function simulateInputOnFrame(n, verbose=true) {
    if (n in inputsToSim) {
        for (let input of inputsToSim[n]) {
            if (verbose) { console.log(`input '${input.key}' ${input.mode} on frame ${n}`); }
            let e = {key: input.key};
            if (input.mode == 'down')   { keydown(e); }
            else                        { keyup(e); }
        }
    }
}

function loop(t) {
    let frameTime = t - prevTime;
    prevTime = t;

    if (!editor_mode && !cs.dead && (!paused || advanceFrame)) {

        if (frameTime > MAX_FRAMETIME) {
            console.log(`frameTime > MAX_FRAMETIME : ${frameTime}`);
            frameTime = MAX_FRAMETIME;
        }

        accumulator += frameTime * simRate;

        while (accumulator >= fixed_dt) {
            frameCount++;
            if (playback) {
                simulateInputOnFrame(frameCount);
                if (frameCount > last_playback_frame)
                    playback = false;
            }
            handleInput(t, fixed_dt);
            update(t, fixed_dt);
            accumulator -= fixed_dt;
        }
        advanceFrame = false;
    }
    draw();
    window.requestAnimationFrame(loop);
}

loop(0);

function blur(e) {
    if (!editor_mode)
        paused = true;
}

function focus(e) {
    //paused = false;
}

function resize(e) {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    const sqh = Math.round(height/(nr+1));
    const sqw = Math.round(width/(nc+1));
    sq = Math.min(sqh, sqw, 32);
}

function mouse_get_tile_info(x, y)
{
    let rv = {};
    rv.c = Math.floor((x - width/2 + (sq*nc/2))/sq);
    rv.r = Math.floor((y - height/2 + (sq*nr/2))/sq);
    rv.add_row_top      = (rv.c == Math.floor(nc/2)) && (rv.r == 0);
    rv.sub_row_top      = (rv.c == Math.floor(nc/2)) && (rv.r == 1);
    rv.add_row_bot      = (rv.c == Math.floor(nc/2)) && (rv.r == nr-1);
    rv.sub_row_bot      = (rv.c == Math.floor(nc/2)) && (rv.r == nr-2);
    rv.add_col_left     = (rv.c == 0) && (rv.r == Math.floor(nr/2));
    rv.sub_col_left     = (rv.c == 1) && (rv.r == Math.floor(nr/2));
    rv.add_col_right    = (rv.c == nc-1) && (rv.r == Math.floor(nr/2));
    rv.sub_col_right    = (rv.c == nc-2) && (rv.r == Math.floor(nr/2));
    rv.tile_name = editor_panel[`${rv.r},${rv.c}`];
    rv.rm = cs.camera.r - Math.floor(nr/2) + rv.r;
    rv.cm = cs.camera.c - Math.floor(nc/2) + rv.c;
    rv.valid = rv.rm >= 0 && rv.cm >= 0 && rv.rm < cs.map.length && rv.cm < cs.map[0].length;
    rv.m = rv.valid ? rv.m = cs.map[rv.rm][rv.cm] : null;
    return rv;
}

function mousedown(e) {
    if (e.button == LEFT_BUTTON) mouse_down_left = true;

    if (editor_mode) {
        if (e.button != LEFT_BUTTON)
            return;

        const tile_info = mouse_get_tile_info(e.clientX, e.clientY);

        if      (tile_info.add_row_top) {
            cs.map.splice(0, 0, cs.map[0].slice(0));
            for (const creature of cs.creatures)
                creature.r++;
            cs.player.r++;
        } else if (tile_info.sub_row_top) {
            cs.map.splice(0, 1);
            for (const creature of cs.creatures)
                creature.r--;
            cs.player.r--;
        } else if (tile_info.add_row_bot) {
            cs.map.push(cs.map[cs.map.length-1].slice(0));
        } else if (tile_info.sub_row_bot) {
            cs.map.pop();
        } else if (tile_info.add_col_left) {
            for (const row of cs.map)
                row.splice(0, 0, row[0]);
            for (const creature of cs.creatures)
                creature.c++;
            cs.player.c++;
        } else if (tile_info.sub_col_left) {
            for (const row of cs.map)
                row.splice(0, 1);
            for (const creature of cs.creatures)
                creature.c--;
            cs.player.c--;
        } else if (tile_info.add_col_right) {
            for (const row of cs.map)
                row.push(row[row.length-1]);
        } else if (tile_info.sub_col_right) {
            for (const row of cs.map)
                row.pop();
        } else if (tile_info.tile_name === undefined) {
            editor_selection = {};
            if (tile_info.valid) {
                // TODO: DRY
                const rm = cs.camera.r - Math.floor(nr/2) + tile_info.r;
                const cm = cs.camera.c - Math.floor(nc/2) + tile_info.c;
                console.log(rm, cm);
                editor_selection.rb = editor_selection.ra = tile_info.r;
                editor_selection.cb = editor_selection.ca = tile_info.c;
            }
        } else {
            const sel_cmin = Math.min(editor_selection.ca, editor_selection.cb);
            const sel_rmin = Math.min(editor_selection.ra, editor_selection.rb);
            const sel_w = Math.abs(editor_selection.cb - editor_selection.ca) + 1;
            const sel_h = Math.abs(editor_selection.rb - editor_selection.ra) + 1;
            for (let r = sel_rmin; r < sel_rmin + sel_h; r++) {
                for (let c = sel_cmin; c < sel_cmin + sel_w; c++) {
                    const rm = cs.camera.r - Math.floor(nr/2) + r;
                    const cm = cs.camera.c - Math.floor(nc/2) + c;
                    cs.map[rm][cm] = tile_info.tile_name;
                }
            }
        }
    }
}

function mouseup(e) {
    if (e.button == LEFT_BUTTON) mouse_down_left = false;
}

function mousemove(e) {
    if (editor_mode) {
        if (!mouse_down_left)
            return;
        const tile_info = mouse_get_tile_info(e.clientX, e.clientY);
        if (tile_info.valid) {
            editor_selection.rb = tile_info.r;
            editor_selection.cb = tile_info.c;
        }
    }
}

function startRecording()
{
    recording = true;
    reset(cs.level);
    inputsToSim = {};
}

function stopRecording()
{
    last_playback_frame = frameCount;
    recording = false;
    console.log(inputsToSim);
}

function keydown(e) {
    if (!editor_mode) {
        if (e.key === 'Escape') {
            paused = !paused;
        } else if (e.key === 'n') {
            nextLevel();
        } else if (e.key === 'p') {
            prevLevel();
        } else if (e.key === 's') {
            saveState();
        } else if (e.key === 'd') {
            restoreState();
        } else if (e.key === ',' || e.key === '.') {
            if (e.key === ',')
                simRate /= 2;
            else if (e.key === '.')
                simRate *= 2;
            simRate_msg = `simRate: ${simRate}`;
            if (simRate_timeout !== undefined) clearTimeout(simRate_timeout);
            simRate_timeout = setTimeout(function() { simRate_msg = undefined; }, 1000);
            console.log(`simRate: ${simRate}`);
        } else if (e.key === '`') {
            advanceFrame = true;
        } else if (e.key === 'u') {
            // TODO: undo!
        } else if (e.key === 'U') {
            // TODO: redo!
        } else if (e.key === 'e') {
            // TODO: reset()?
            editor_mode = true;
            editor_selection = {};
            paused = false;
        } else if (e.key === 'R') {
            if (!recording) startRecording();
            else            stopRecording();
        } else if (e.key === 'P') {
            if (recording)
                stopRecording();
            playback = !playback;
            if (playback)
                reset(cs.level);
        } else if (e.key === 'r') {
            reset(cs.level);
        } else {
            if (recording) {
                if (!(frameCount in inputsToSim))
                    inputsToSim[frameCount] = [];
                inputsToSim[frameCount].push({key: e.key, mode: 'down'});
            }
            pressed[e.key] = true;
        }
    } else {
        if (e.key === 'Escape') {
            editor_selection = {};
        } else if (e.key === 'e') {
            console.log(cs.map); // TODO: output the map
            editor_mode = false;
            cs.camera.r = cs.player.r;
            cs.camera.c = cs.player.c;
        } else if (e.key === 'ArrowUp') {
            cs.camera.r--;
        } else if (e.key === 'ArrowDown') {
            cs.camera.r++;
        } else if (e.key === 'ArrowLeft') {
            cs.camera.c--;
        } else if (e.key === 'ArrowRight') {
            cs.camera.c++;
        } else {
        }
    }
}

function keyup(e) {
    if (!editor_mode) {
        if (e.key === 'Escape') {
        } else if (e.key === 'r') {
        } else {
            if (recording) {
                if (!(frameCount in inputsToSim))
                    inputsToSim[frameCount] = [];
                inputsToSim[frameCount].push({key: e.key, mode: 'up'});
            }
            pressed[e.key] = false;
        }
    } else {
    }
}

window.addEventListener('blur', blur);
window.addEventListener('focus', focus);
window.addEventListener('mousedown', mousedown);
window.addEventListener('mouseup', mouseup);
window.addEventListener('mousemove', mousemove);
window.addEventListener('keydown', keydown);
window.addEventListener('keyup', keyup);
window.addEventListener('resize', resize);

