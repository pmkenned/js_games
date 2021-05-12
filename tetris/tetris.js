"use strict";

// References:
//  https://tetris.fandom.com/wiki/SRS
//  https://www.toptal.com/software/definitive-guide-to-datetime-manipulation

// TODO:
// * mobile support
// * mouse support
// * special effects on level change
// * clean up code
// * line removal animation
// * sound effects

const pieces = [
    [
        [
            [0,1,0,0],
            [1,1,1,0],
            [0,0,0,0],
            [0,0,0,0]
        ],
        [
            [0,1,0,0],
            [0,1,1,0],
            [0,1,0,0],
            [0,0,0,0]
        ],
        [
            [0,0,0,0],
            [1,1,1,0],
            [0,1,0,0],
            [0,0,0,0]
        ],
        [
            [0,1,0,0],
            [1,1,0,0],
            [0,1,0,0],
            [0,0,0,0]
        ]
    ],
    [
        [
            [0,0,1,0],
            [1,1,1,0],
            [0,0,0,0],
            [0,0,0,0]
        ],
        [
            [0,1,0,0],
            [0,1,0,0],
            [0,1,1,0],
            [0,0,0,0]
        ],
        [
            [0,0,0,0],
            [1,1,1,0],
            [1,0,0,0],
            [0,0,0,0]
        ],
        [
            [1,1,0,0],
            [0,1,0,0],
            [0,1,0,0],
            [0,0,0,0]
        ]
    ],
    [
        [
            [0,1,1,0],
            [0,1,1,0],
            [0,0,0,0],
            [0,0,0,0]
        ],
        [
            [0,1,1,0],
            [0,1,1,0],
            [0,0,0,0],
            [0,0,0,0]
        ],
        [
            [0,1,1,0],
            [0,1,1,0],
            [0,0,0,0],
            [0,0,0,0]
        ],
        [
            [0,1,1,0],
            [0,1,1,0],
            [0,0,0,0],
            [0,0,0,0]
        ]
    ],
    [
        [
            [1,0,0,0],
            [1,1,1,0],
            [0,0,0,0],
            [0,0,0,0]
        ],
        [
            [0,1,1,0],
            [0,1,0,0],
            [0,1,0,0],
            [0,0,0,0]
        ],
        [
            [0,0,0,0],
            [1,1,1,0],
            [0,0,1,0],
            [0,0,0,0]
        ],
        [
            [0,1,0,0],
            [0,1,0,0],
            [1,1,0,0],
            [0,0,0,0]
        ]
    ],
    [
        [
            [0,0,0,0],
            [1,1,1,1],
            [0,0,0,0],
            [0,0,0,0]
        ],
        [
            [0,0,1,0],
            [0,0,1,0],
            [0,0,1,0],
            [0,0,1,0]
        ],
        [
            [0,0,0,0],
            [0,0,0,0],
            [1,1,1,1],
            [0,0,0,0]
        ],
        [
            [0,1,0,0],
            [0,1,0,0],
            [0,1,0,0],
            [0,1,0,0]
        ]
    ],
    [
        [
            [0,1,1,0],
            [1,1,0,0],
            [0,0,0,0],
            [0,0,0,0]
        ],
        [
            [0,1,0,0],
            [0,1,1,0],
            [0,0,1,0],
            [0,0,0,0]
        ],
        [
            [0,0,0,0],
            [0,1,1,0],
            [1,1,0,0],
            [0,0,0,0]
        ],
        [
            [1,0,0,0],
            [1,1,0,0],
            [0,1,0,0],
            [0,0,0,0]
        ]
    ],
    [
        [
            [1,1,0,0],
            [0,1,1,0],
            [0,0,0,0],
            [0,0,0,0]
        ],
        [
            [0,0,1,0],
            [0,1,1,0],
            [0,1,0,0],
            [0,0,0,0]
        ],
        [
            [0,0,0,0],
            [1,1,0,0],
            [0,1,1,0],
            [0,0,0,0]
        ],
        [
            [0,1,0,0],
            [1,1,0,0],
            [1,0,0,0],
            [0,0,0,0]
        ]
    ]
];

// ## CONSTANTS ###################################################

const font_face = "Impact";
const lines_per_level = 10;
const level_speedup_factor = 0.75;
const starting_piece_move_period = 500;
const piece_lock_period = 400;
const key_start_repeat = 150;
const key_repeat_period = 30;
const new_piece_period = 300;
const board_squares_wide = 10;
const board_squares_tall = 20;
const board_width_max = 0.90;
const board_height_max = 0.90;

const colors = [
    [0, 0, 100],

    // pieces
    [300, 50, 50],
    [30, 50, 50],
    [60, 50, 50],
    [240, 50, 50],
    [180, 50, 50],
    [120, 50, 50],
    [0, 50, 50],
];

//const T_PIECE = 0;
//const L_PIECE = 1;
//const O_PIECE = 2;
//const J_PIECE = 3;
//const I_PIECE = 4;
//const S_PIECE = 5;
//const Z_PIECE = 6;

// ## END OF CONSTANTS ############################################


// ## GAME STATE VARIABLES ########################################

// canvas-related
let myCanvas;
let ctx;
let win_h, win_w;
let can_w, can_h;
let board_left_x, board_right_x, board_top_y, board_bottom_y;
let sq_px;

// input related
let keys = {};
let keys_repeat = {};
let key_timestamps = {};

// timers
let t_prev;
let piece_lock_timer;
let piece_move_timer;
let new_piece_timer;

let welcome;
let paused;
let game_over;
let new_high_score;
let piece_locked;

let score;
let lines_cleared;
let level;
let piece_move_period;

let board;
let draw_board;

// current piece
let curr_piece;
let next_piece;
let piece_row;
let piece_col;
let piece_ori;
let hold_allowed;
let hold_piece;
let hold_valid;

// ## END OF GAME STATE VARIABLES #################################

function combinedHSL(h, s, l) {
    return `hsl(${h}, ${s}%, ${l}%)`;
}

function combinedHSLA(h, s, l, a) {
    return `hsla(${h}, ${s}%, ${l}, ${a})`;
}

function check_piece_move(piece, orientation, row, col) {
    for (let r=0; r<4; r++) {
        for (let c=0; c<4; c++) {
            const sq = pieces[piece][orientation][r][c];
            if (sq != 0) {
                const sq_r = row + r;
                const sq_c = col + c;
                if ((sq_r < 0) || (sq_r >= board_squares_tall)) {
                    return false;
                }
                if ((sq_c < 0) || (sq_c >= board_squares_wide)) {
                    return false;
                }
                if (board[sq_r][sq_c] != 0) {
                    return false;
                }
            }
        }
    }
    return true;
}

function copy_board() {
    for (let r=0; r<board_squares_tall; r++) {
        for (let c=0; c<board_squares_wide; c++) {
            draw_board[r][c] = board[r][c];
        }
    }
}

// assumes piece position and orientation is valid
function copy_piece_to_board() {
    for (let r=0; r<4; r++) {
        for (let c=0; c<4; c++) {
            const sq = pieces[curr_piece][piece_ori][r][c];
            if (sq != 0) {
                const sq_r = piece_row + r;
                const sq_c = piece_col + c;
                board[sq_r][sq_c] = curr_piece+1; // TIDY TODO: this is ugly
            }
        }
    }
}

function clear_lines() {
    let lines_cleared_now = 0;
    for (let r=board_squares_tall-1; r >= 0; r--) {
        let line_full = true;
        for (let c=0; c < board_squares_wide; c++) {
            if (board[r][c] == 0) {
                line_full = false;
                break;
            }
        }
        if (line_full && r > 0) {
            lines_cleared_now++;
            for (let r2=r; r2 > 0; r2--) {
                for (let c=0; c < board_squares_wide; c++) {
                    board[r2][c] = board[r2-1][c];
                }
            }
            for (let c=0; c < board_squares_wide; c++) {
                board[0][c] = 0;
            }
            r++; // repeat this row
        }
    }
    lines_cleared += lines_cleared_now;

    let factor;
    if (level == 1)                     { factor = 1; }
    else if (level >= 2 && level <= 3)  { factor = 2; }
    else if (level >= 4 && level <= 5)  { factor = 3; }
    else if (level >= 6 && level <= 7)  { factor = 5; }
    else if (level >= 8)                { factor = 5; }

    if (lines_cleared_now == 0) { }
    else if (lines_cleared_now == 1) { score += factor*40; }
    else if (lines_cleared_now == 2) { score += factor*100; }
    else if (lines_cleared_now == 3) { score += factor*300; }
    else if (lines_cleared_now == 4) { score += factor*1200; }
    else { console.error(`lines_cleared_now == ${lines_cleared_now}?`); }
}

function init_board() {
    board = [];
    draw_board = [];
    for (let r=0; r<board_squares_tall; r++) {
        board.push([]);
        draw_board.push([]);
        for (let c=0; c<board_squares_wide; c++) {
            board[r].push(0);
            draw_board[r].push(0);
        }
    }
}

function to_px(x) {
    return Math.round(x) + 0.5;
}

function init_canvas() {
    win_h = $(window).height();
    win_w = $(window).width();
    can_w = win_w-0;
    can_h = win_h-0;
    myCanvas.attr('width', can_w);
    myCanvas.attr('height', can_h);

    const extra_squares = 6;

    const sq_px_w = Math.round(board_width_max * can_w / (board_squares_wide + extra_squares));
    const sq_px_h = Math.round(board_height_max * can_h / board_squares_tall);

    sq_px = Math.min(sq_px_w, sq_px_h);

    board_left_x = to_px(can_w/2 - (board_squares_wide + extra_squares)/2*sq_px);
    board_right_x = to_px(board_left_x + board_squares_wide*sq_px);
    board_top_y = to_px(can_h/2 - (board_squares_tall/2)*sq_px);
    board_bottom_y = to_px(board_top_y + board_squares_tall*sq_px);
}

function resize() {
    init_canvas();
}

function reset_game() {
    init_board();

    next_piece = Math.floor(Math.random() * pieces.length);
    curr_piece = Math.floor(Math.random() * pieces.length);
    piece_locked = false;
    piece_row = 0;
    piece_col = 3;
    piece_ori = 0;

    piece_lock_timer = piece_lock_period;
    piece_move_timer = starting_piece_move_period;
    piece_move_period = piece_move_timer;
    new_piece_timer = new_piece_period;

    score = 0;
    level = 1;
    lines_cleared = 0;
    hold_allowed = true;
    hold_valid = false;

    new_high_score = false;
    game_over = false;
    paused = false;
    welcome = false;
}

function drawSquare(sq, ul_x, ul_y) {

    const ur_x = to_px(ul_x + sq_px);
    const ur_y = to_px(ul_y);

    const ll_x = to_px(ul_x);
    const ll_y = to_px(ul_y + sq_px);

    const lr_x = to_px(ul_x + sq_px);
    const lr_y = to_px(ul_y + sq_px);

    const center_x = to_px(ul_x + sq_px/2);
    const center_y = to_px(ul_y + sq_px/2);

    const draw_gray = paused || game_over;

    ctx.beginPath();
    ctx.moveTo(ul_x, ul_y);
    ctx.lineTo(center_x, center_y);
    ctx.lineTo(ll_x, ll_y);
    ctx.closePath();
    let color_left = colors[sq].slice();
    if (draw_gray) { color_left[1] = 0; }
    color_left[2] += 15;
    ctx.fillStyle = combinedHSL(...color_left);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(ur_x, ur_y);
    ctx.lineTo(center_x, center_y);
    ctx.lineTo(ul_x, ul_y);
    ctx.closePath();
    let color_top = colors[sq].slice();
    if (draw_gray) { color_top[1] = 0; }
    color_top[2] += 20;
    ctx.fillStyle = combinedHSL(...color_top);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(lr_x, lr_y);
    ctx.lineTo(center_x, center_y);
    ctx.lineTo(ur_x, ur_y);
    ctx.closePath();
    let color_right = colors[sq].slice();
    if (draw_gray) { color_right[1] = 0; }
    color_right[2] -= 15;
    ctx.fillStyle = combinedHSL(...color_right);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(ll_x, ll_y);
    ctx.lineTo(center_x, center_y);
    ctx.lineTo(lr_x, lr_y);
    ctx.closePath();
    let color_bottom = colors[sq].slice();
    if (draw_gray) { color_bottom[1] = 0; }
    color_bottom[2] -= 20;
    ctx.fillStyle = combinedHSL(...color_bottom);
    ctx.fill();

    ctx.beginPath();
    ctx.rect(ul_x + sq_px/6, ul_y + sq_px/6, sq_px - 2*sq_px/6, sq_px - 2*sq_px/6);
    ctx.closePath();
    if (sq > 0) {
        ctx.shadowColor = combinedHSL(...colors[sq]);
        let color_center = colors[sq].slice();
        if (draw_gray) { color_center[1] = 0; }
        ctx.fillStyle = combinedHSL(...color_center);
        ctx.fill();
    }

}

function render() {

    ctx.clearRect(0,0, can_w, can_h);
    let bg_color = level*30 % 360;
    ctx.fillStyle = `hsl(${bg_color}, 30%, 20%)`;
    ctx.fillRect(0,0, can_w, can_h);

    // text properties
    const fn_sz = Math.floor(sq_px);
    ctx.font = `${fn_sz}px ${font_face}`;
    ctx.fillStyle = "white";

    // "Next"
    const next_x = to_px(board_right_x + sq_px);
    const next_y = to_px(board_top_y + sq_px);
    ctx.fillText("Next", next_x, next_y);

    // draw next piece preview
    if (!welcome) {
        for (let r=0; r<4; r++) {
            for (let c=0; c<4; c++) {
                const sq_bool = pieces[next_piece][0][r][c];
                if (sq_bool) {
                    const sq = next_piece + 1;
                    const ul_x = to_px(board_right_x + (c+1)*sq_px);
                    const ul_y = to_px(board_top_y + (2+r)*sq_px);
                    drawSquare(sq, ul_x, ul_y);
                }
            }
        }
    }

    // "Hold"
    const hold_x = to_px(board_right_x + sq_px);
    const hold_y = to_px(board_top_y + sq_px*6);
    ctx.fillStyle = "white";
    ctx.fillText("Hold", hold_x, hold_y);

    // draw hold piece
    if (hold_valid) {
        for (let r=0; r<4; r++) {
            for (let c=0; c<4; c++) {
                const sq_bool = pieces[hold_piece][0][r][c];
                if (sq_bool) {
                    const sq = hold_piece + 1;
                    const ul_x = to_px(board_right_x + (c+1)*sq_px);
                    const ul_y = to_px(board_top_y + (7+r)*sq_px);
                    drawSquare(sq, ul_x, ul_y);
                }
            }
        }
    }

    const level_x = to_px(board_right_x + sq_px);
    const level_y = to_px(board_top_y + 11*sq_px);
    ctx.fillStyle = "white";
    ctx.fillText(`Level: ${level}`, level_x, level_y);
    ctx.fillText(`Score: ${score}`, level_x, level_y+sq_px);
    ctx.fillText(`Lines: ${lines_cleared}`, level_x, level_y+2*sq_px);

    // draw board
    ctx.strokeStyle = 'hsl(0, 0%, 20%)';
    ctx.fillStyle = "hsl(240, 0%, 40%)";
    ctx.lineWidth = 1.0;
    for (let r=0; r<board_squares_tall; r++) {
        for (let c=0; c<board_squares_wide; c++) {
            const ul_x = to_px(board_left_x + c*sq_px);
            const ul_y = to_px(board_top_y + r*sq_px);
            ctx.beginPath();
            ctx.rect(ul_x, ul_y, sq_px, sq_px);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
        }
    }

    // draw colored squares
    for (let r=0; r<board_squares_tall; r++) {
        for (let c=0; c<board_squares_wide; c++) {
            const sq = draw_board[r][c];
            if (sq == 0) {
                continue;
            }

            const ul_x = to_px(board_left_x + c*sq_px);
            const ul_y = to_px(board_top_y + r*sq_px);

            if (sq > 0) {
                drawSquare(sq, ul_x, ul_y);
            } else {
                ctx.beginPath();
                ctx.rect(ul_x, ul_y, sq_px, sq_px);
                ctx.closePath();
                ctx.lineWidth = 3.0;
                let stroke_color = colors[-sq].slice();
                if (paused) { stroke_color[1] = 0; }
                ctx.strokeStyle = combinedHSL(...stroke_color);
                ctx.stroke();
                let fill_hue = colors[-sq][0];
                let fill_sat = colors[-sq][1];
                if (paused) { fill_sat = 0; }
                ctx.fillStyle = `hsla(${fill_hue}, ${fill_sat}%, 50%, 0.15)`;
                ctx.fill();
            }

        }
    }

    // board border
    ctx.beginPath();
    const b_px = 3;
    ctx.rect(board_left_x-b_px, board_top_y-b_px, board_squares_wide*sq_px+2*b_px, board_squares_tall*sq_px+2*b_px);
    ctx.closePath();
    ctx.strokeStyle = "hsl(240, 50%, 50%)";
    ctx.lineWidth = 2*b_px;
    ctx.stroke();

    // display paused or game over
    ctx.fillStyle = "black";
    const status_fn_sz = Math.floor(2*sq_px);
    ctx.font = `${status_fn_sz}px ${font_face}`;
    ctx.lineWidth = 4.0;
    let fill_color = 0.15*Date.now() % 360;
    ctx.strokeStyle = "black";
    // TIDY TOOD: clean up this mess
    if (welcome) {
        ctx.fillStyle = `hsl(${fill_color}, 70%, 70%)`;
        const status_x = to_px(board_left_x + sq_px*0.8);
        const status_y = to_px(board_top_y + (board_squares_tall/2)*sq_px);
        const welcome_fn_sz = Math.floor(sq_px);
        ctx.fillText("Tetris", status_x+2*sq_px, status_y-sq_px);
        ctx.strokeText("Tetris", status_x+2*sq_px, status_y-sq_px);
        ctx.font = `${welcome_fn_sz}px ${font_face}`;
        ctx.lineWidth = 2.0;
        ctx.fillStyle = `hsl(0, 100%, 100%)`;
        ctx.fillText("<Esc> to start", status_x+1.5*sq_px, status_y);
        ctx.strokeText("<Esc> to start", status_x+1.5*sq_px, status_y);
        ctx.fillText("Drop: space", status_x+1.5*sq_px, status_y+2*sq_px);
        ctx.strokeText("Drop: space", status_x+1.5*sq_px, status_y+2*sq_px);
        ctx.fillText("Hold: z", status_x+1.5*sq_px, status_y+3*sq_px);
        ctx.strokeText("Hold: z", status_x+1.5*sq_px, status_y+3*sq_px);
        ctx.fillText("Pause: <Esc>", status_x+1.5*sq_px, status_y+4*sq_px);
        ctx.strokeText("Pause: <Esc>", status_x+1.5*sq_px, status_y+4*sq_px);
    } else if (game_over) {
        if (new_high_score) { ctx.fillStyle = `hsl(${fill_color}, 70%, 70%)`; }
        else { ctx.fillStyle = 'white'; }
        const status_x = to_px(board_left_x + sq_px*0.8);
        const status_y = to_px(board_top_y + (board_squares_tall/2)*sq_px);
        ctx.fillText("Game Over", status_x, status_y);
        ctx.strokeText("Game Over", status_x, status_y);
        const high_score_fn_sz = Math.floor(sq_px);
        ctx.font = `${high_score_fn_sz}px ${font_face}`;
        if (new_high_score) {
            ctx.fillText("New High Score!", status_x+0.8*sq_px, status_y + 2*sq_px);
            ctx.strokeText("New High Score!", status_x+0.8*sq_px, status_y + 2*sq_px);
            const score_en = score.toLocaleString('en');
            const num_digits = Math.log(score+1)/Math.log(10);
            const score_x = status_x+4*sq_px - 0.3*sq_px*num_digits;
            ctx.fillText(`${score_en}`, score_x, status_y + 4*sq_px);
            ctx.strokeText(`${score_en}`, score_x, status_y + 4*sq_px);
        } else {
            ctx.fillText("Current high score:", status_x+0.2*sq_px, status_y + 2*sq_px);
            ctx.strokeText("Current high score:", status_x+0.2*sq_px, status_y + 2*sq_px);
            const current_high_score = localStorage.getItem('high_score');
            const score_en = parseInt(current_high_score).toLocaleString('en');
            const num_digits = Math.log(current_high_score+1)/Math.log(10);
            const score_x = status_x+4*sq_px - 0.3*sq_px*num_digits;
            ctx.fillText(`${score_en}`, score_x, status_y + 4*sq_px);
            ctx.strokeText(`${score_en}`, score_x, status_y + 4*sq_px);
        }
    } else if (paused) {
        const status_x = to_px(board_left_x+sq_px*2);
        const status_y = to_px(board_top_y + (board_squares_tall/2)*sq_px);
        ctx.fillStyle = `hsl(${fill_color}, 70%, 70%)`;
        ctx.fillText("Paused", status_x, status_y);
        ctx.strokeText("Paused", status_x, status_y);
    }
}

function update(t) {

    const dt = t - t_prev;
    t_prev = t;

    if (!paused && !game_over && !welcome) {
        if (piece_locked) {

            new_piece_timer -= dt;
            if (new_piece_timer < 0) {

                curr_piece = next_piece;
                next_piece = Math.floor(Math.random() * pieces.length);
                piece_row = 0;
                piece_col = 3;
                piece_ori = 0;

                if (!check_piece_move(curr_piece, piece_ori, piece_row, piece_col)) {
                    //console.log('game over');
                    const current_high_score = localStorage.getItem('high_score');
                    if (!current_high_score || (score > current_high_score)) {
                        localStorage.setItem('high_score', score);
                        new_high_score = true;
                    }
                    game_over = true;
                }

                new_piece_timer = new_piece_period;
                piece_locked = false;
                hold_allowed = true;
            }

        } else {

            const now = Date.now();

            // TIDY TODO: DRY

            if (keys['ArrowLeft']) {
                const key_dt = now - key_timestamps['ArrowLeft'];
                if (key_dt > 0) {
                    const next_time = (keys_repeat['ArrowLeft']) ? key_repeat_period : key_start_repeat;
                    keys_repeat['ArrowLeft'] = true;
                    key_timestamps['ArrowLeft'] = now + next_time;
                    if (check_piece_move(curr_piece, piece_ori, piece_row, piece_col-1)) {
                        piece_col--;
                        piece_lock_timer = piece_lock_period;
                    }
                }
            }
            if (keys['ArrowRight']) {
                const key_dt = now - key_timestamps['ArrowRight'];
                if (key_dt > 0) {
                    const next_time = (keys_repeat['ArrowRight']) ? key_repeat_period : key_start_repeat;
                    keys_repeat['ArrowRight'] = true;
                    key_timestamps['ArrowRight'] = now + next_time;
                    if (check_piece_move(curr_piece, piece_ori, piece_row, piece_col+1)) {
                        piece_col++;
                        piece_lock_timer = piece_lock_period;
                    }
                }
            }
            if (keys['ArrowDown']) {
                const key_dt = now - key_timestamps['ArrowDown'];
                if (key_dt > 0) {
                    const next_time = (keys_repeat['ArrowDown']) ? key_repeat_period : key_start_repeat;
                    keys_repeat['ArrowDown'] = true;
                    key_timestamps['ArrowDown'] = now + next_time;
                    if (check_piece_move(curr_piece, piece_ori, piece_row+1, piece_col)) {
                        piece_row++;
                        piece_lock_timer = piece_lock_period;
                    }
                }

            }
            if (keys['ArrowUp']) {
                const key_dt = now - key_timestamps['ArrowUp'];
                if (key_dt > 0) {
                    const next_time = (keys_repeat['ArrowUp']) ? key_repeat_period : key_start_repeat;
                    keys_repeat['ArrowUp'] = true;
                    key_timestamps['ArrowUp'] = now + next_time;
                    const new_ori = (piece_ori + 1) % 4;
                    if (check_piece_move(curr_piece, new_ori, piece_row, piece_col)) {
                        piece_ori = new_ori;
                        piece_lock_timer = piece_lock_period;
                    } else if (check_piece_move(curr_piece, new_ori, piece_row, piece_col-1)) {
                        piece_col--;
                        piece_ori = new_ori;
                        piece_lock_timer = piece_lock_period;
                    } else if (check_piece_move(curr_piece, new_ori, piece_row, piece_col+1)) {
                        piece_col++;
                        piece_ori = new_ori;
                        piece_lock_timer = piece_lock_period;
                    } else if (check_piece_move(curr_piece, new_ori, piece_row-1, piece_col-1)) {
                        piece_row--;
                        piece_col--;
                        piece_ori = new_ori;
                        piece_lock_timer = piece_lock_period;
                    } else if (check_piece_move(curr_piece, new_ori, piece_row-1, piece_col+1)) {
                        piece_row--;
                        piece_col++;
                        piece_ori = new_ori;
                        piece_lock_timer = piece_lock_period;
                    }
                }
            }

            piece_move_timer -= dt;

            if (piece_move_timer < 0) {
                // check to see if piece can move down; if not, start lock timer
                if (check_piece_move(curr_piece, piece_ori, piece_row+1, piece_col)) {
                    piece_row++;
                    piece_move_timer = piece_move_period;
                } else {
                    piece_lock_timer -= dt;
                    if (piece_lock_timer < 0) {
                        copy_piece_to_board();
                        clear_lines();
                        level = Math.floor(lines_cleared/lines_per_level)+1;
                        piece_move_period = starting_piece_move_period*Math.pow(level_speedup_factor,level-1);
                        //console.log('piece locked');
                        piece_locked = true;
                        piece_move_timer = piece_move_period;
                        piece_lock_timer = piece_lock_period;
                    }
                }
            }

        }

        if (!piece_locked) {
            copy_board(); // reset draw_board (erase old drop preview)

            // drop preview
            let drop_preview_row = (piece_row + 1);
            while (check_piece_move(curr_piece, piece_ori, drop_preview_row, piece_col)) {
                drop_preview_row++;
            }
            drop_preview_row--;
            for (let r=0; r<4; r++) {
                for (let c=0; c<4; c++) {
                    if (r+piece_row >= board_squares_tall) { break; }
                    if (c+piece_col >= board_squares_wide) { continue; }
                    const sq = pieces[curr_piece][piece_ori][r][c];
                    if (sq != 0) {
                        draw_board[r+drop_preview_row][c+piece_col] = -(curr_piece+1);
                    }
                }
            }

            // overlay current piece
            for (let r=0; r<4; r++) {
                for (let c=0; c<4; c++) {
                    if (r+piece_row >= board_squares_tall) { break; }
                    if (c+piece_col >= board_squares_wide) { continue; }
                    const sq = pieces[curr_piece][piece_ori][r][c];
                    if (sq != 0) {
                        draw_board[r+piece_row][c+piece_col] = curr_piece+1;
                    }
                }
            }
        }
    }

    render();

    window.requestAnimationFrame(update);
}

function blur() {
    if (!game_over && !welcome) {
        paused = true;
    }
}

function keyup(e) {
    keys[e.key] = false;
    keys_repeat[e.key] = false;
}

// TIDY TODO: handle input in centralized place as much as possible
function keydown(e) {

    if (!(e.key in keys) || !keys[e.key]) {
        key_timestamps[e.key] = Date.now();
    }
    keys[e.key] = true;

    if (e.key == 'Escape') {
        if (welcome) {
            welcome = false;
        } else if (game_over) {
            reset_game();
        } else {
            paused = !paused;
        }
    } else if (e.key == 'ArrowLeft') {
    } else if (e.key == 'ArrowRight') {
    } else if (e.key == 'ArrowUp') {
    } else if (e.key == 'ArrowDown') {
    } else if (e.key == 'z') {
        if (!welcome && !game_over && !paused) {
            // might be an edge case here
            // should check to make sure piece fits before swapping
            if (hold_allowed) {
                if (hold_valid) {
                    const tmp = curr_piece;
                    curr_piece = hold_piece;
                    hold_piece = tmp;
                } else {
                    hold_valid = true;
                    hold_piece = curr_piece;
                    curr_piece = next_piece;
                    next_piece = Math.floor(Math.random() * pieces.length);
                }
                piece_row = 0;
                piece_col = 3;
                piece_ori = 0;
                hold_allowed = false;
            }
        }
    } else if (e.key == ' ') {
        if (!welcome && !game_over && !paused) {
            let new_row = (piece_row + 1);
            while (check_piece_move(curr_piece, piece_ori, new_row, piece_col)) {
                new_row++;
            }
            new_row--;
            piece_row = new_row;
            piece_move_timer = 0;
            piece_lock_timer = 0;
            new_piece_timer = 0;
        }
    } else {
        //console.log('Unhandled key: ' + e.key);
    }
}

function left() {
    console.log('left');
    keydown({key: 'ArrowLeft'});
    setTimeout(function(){ keyup({key: 'ArrowLeft'}); }, 30);
}

function right() {
    console.log('right');
    keydown({key: 'ArrowRight'});
    setTimeout(function(){ keyup({key: 'ArrowRight'}); }, 30);
}

$(function() {

    // TIDY TODO: DRY
    keys_repeat['ArrowLeft'] = false;
    keys_repeat['ArrowRight'] = false;
    keys_repeat['ArrowUp'] = false;
    keys_repeat['ArrowDown'] = false;
    keys_repeat[' '] = false;
    keys_repeat['Escape'] = false;
    keys_repeat['z'] = false;
    keys['ArrowLeft'] = false;
    keys['ArrowRight'] = false;
    keys['ArrowUp'] = false;
    keys['ArrowDown'] = false;
    keys[' '] = false;
    keys['Escape'] = false;
    keys['z'] = false;

    //localStorage.removeItem('high_score');

    myCanvas = $('#myCanvas');
    init_canvas();
    ctx = myCanvas[0].getContext('2d');

    reset_game();
    t_prev = 0;
    welcome = true;

    $(window).keyup(keyup);
    $(window).keydown(keydown);
    $(window).blur(blur);

    $(window).resize(resize);

    window.requestAnimationFrame(update);
});
