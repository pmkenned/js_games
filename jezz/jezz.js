"use strict";

// == Notes: ============
//  level, score, time left
//  area cleared
//  balls: positions, angles, velocity
//  board layout: completed divisions, incomplete divisions
//  welcome, in-game, paused, game over
//
// TODO:
//  * when window is resized, board should scale appropriately
//  * detect ball collisions
//  * prevent balls from getting stuck in walls
//  * balls should stop dividers if they collide
//      * the tip of the divider acts like a black cell
//  * create dividers where mouse click happens (make this more precise)
//  * fill in black areas where no balls are
//  * detect level change conditions
//
// ======================

const UP_DOWN = 0;
const LEFT_RIGHT = 1;

const DIR_NW = 0;
const DIR_NE = 1;
const DIR_SE = 2;
const DIR_SW = 3;

const CELL_EMPTY = 0;
const CELL_BLACK = 1;
const CELL_BLUE  = 2;
const CELL_RED   = 3;

const constants = {
//    board_width_per: 90,
//    board_max_width_px: 700,
    board_num_cols: 50,
    board_num_rows: 30,
    ball_speed: 0.4,
};

Object.freeze(constants);

const from_constants = {
    board_x_left: null,
    board_x_right: null,
    board_y_top: null,
    board_y_bottom: null,
    board_width_px: null,
    board_height_px: null,
    ball_radius_px: null,
    ball_radius_per_width: null,
    ball_radius_per_height: null,
};

let gameState = {};

// TODO: imprecise
function px_to_row(px) {
    return Math.round((px - from_constants.board_y_top) / (2*from_constants.ball_radius_px));
}

// TODO: imprecise
function px_to_col(px) {
    return Math.round((px - from_constants.board_x_left) / (2*from_constants.ball_radius_px));
}

function to_px(x) {
    return Math.round(x) + 0.5;
}

function rect_px(x, y, w, h) {
    gameState.ctx.rect(to_px(x), to_px(y), Math.round(w), Math.round(h));
}

function init_canvas() {
    gameState.win_h = $(window).height();
    gameState.win_w = $(window).width();
    gameState.can_w = gameState.win_w;
    gameState.can_h = gameState.win_h;
    gameState.canvas.attr('width', gameState.can_w);
    gameState.canvas.attr('height', gameState.can_h);

    const can_wh_ratio = gameState.can_w / gameState.can_h;
    const board_wh_ratio = constants.board_num_cols / constants.board_num_rows;

    // TODO: implement max-width
    if (board_wh_ratio > can_wh_ratio) {
        from_constants.board_x_left = 100;
        from_constants.board_x_right = gameState.can_w-100;
        //from_constants.board_x_left = 0;
        //from_constants.board_x_right = gameState.can_w;
        from_constants.board_width_px = from_constants.board_x_right - from_constants.board_x_left;
        from_constants.board_height_px = from_constants.board_width_px / board_wh_ratio;
        from_constants.board_y_top = gameState.can_h/2 - from_constants.board_height_px/2;
        from_constants.board_y_bottom = gameState.can_h/2 + from_constants.board_height_px/2;
    } else {
        from_constants.board_y_top = 200;
        from_constants.board_y_bottom = gameState.can_h-200;
        //from_constants.board_y_top = 0;
        //from_constants.board_y_bottom = gameState.can_h;
        from_constants.board_height_px = from_constants.board_y_bottom - from_constants.board_y_top;
        from_constants.board_width_px = from_constants.board_height_px * board_wh_ratio;
        from_constants.board_x_left = gameState.can_w/2 - from_constants.board_width_px/2;
        from_constants.board_x_right =  gameState.can_w/2 + from_constants.board_width_px/2;
    }

    from_constants.ball_radius_px = 0.5 * from_constants.board_height_px / constants.board_num_rows;
    from_constants.ball_radius_per_width = from_constants.ball_radius_px / from_constants.board_width_px;
    from_constants.ball_radius_per_height = from_constants.ball_radius_px / from_constants.board_height_px;
    //from_constants.ball_speed = 0.1;
}

function reset_game() {
    gameState.score = 0;
    gameState.level = 1;

    gameState.board = [];
    gameState.board_render = [];
    for (let r = 0; r < constants.board_num_rows; r++) {
        gameState.board.push([]);
        gameState.board_render.push([]);
        for (let c = 0; c < constants.board_num_cols; c++) {
            gameState.board[r].push(0);
            gameState.board_render[r].push(0);
        }
    }

    // surround board with black cells
    for (let r = 0; r < constants.board_num_rows; r++) {
        gameState.board[r][0] = CELL_BLACK;
        gameState.board[r][constants.board_num_cols-1] = CELL_BLACK;
    }
    for (let c = 0; c < constants.board_num_cols; c++) {
        gameState.board[0][c] = CELL_BLACK;
        gameState.board[constants.board_num_rows-1][c] = CELL_BLACK;
    }

    gameState.balls = [];

    gameState.balls.push(
        {pos_x: 5.5, pos_y: 5.5, vel_x: 1, vel_y: 1},
        {pos_x: 10.5, pos_y: 20.5, vel_x: -1, vel_y: 1},
        {pos_x: 26.5, pos_y: 21.5, vel_x: 1, vel_y: -1},
    );

    gameState.divider_orientation = UP_DOWN;
    gameState.canvas[0].style.cursor = 'n-resize';

    gameState.red_divider  = {active: false, start_x: null, start_y: null, end_x: null, end_y: null, dir: null};
    gameState.blue_divider = {active: false, start_x: null, start_y: null, end_x: null, end_y: null, dir: null};
}

function init_game() {
    //gameState.welcome = true;
    gameState.game_over = false;
    gameState.paused = false;
    gameState.advanceFrame = false;
    gameState.t_prev = 0;
    gameState.frameCount = 0;
    gameState.canvas = $('#myCanvas');
    gameState.ctx = gameState.canvas[0].getContext('2d');
    init_canvas();
    reset_game();
}

function contextmenu(e) {
    e.preventDefault();
}

function createBarriers(row, col) {
    console.log(`frame: ${gameState.frameCount} row: ${row} col: ${col} ori: ${gameState.divider_orientation}`);
    if (!gameState.red_divider.active) {
        gameState.red_divider.active = true;
        gameState.red_divider.start_x = col;
        gameState.red_divider.start_y = row;
        gameState.red_divider.end_x = col;
        gameState.red_divider.end_y = row;
        gameState.red_divider.dir = gameState.divider_orientation;
    } else {
        // do nothing
    }
    if (!gameState.blue_divider.active) {
        gameState.blue_divider.active = true;
        if (gameState.divider_orientation == UP_DOWN) {
            gameState.blue_divider.start_x = col;
            gameState.blue_divider.start_y = row+1;
            gameState.blue_divider.end_x = col;
            gameState.blue_divider.end_y = row+1;
        } else {
            gameState.blue_divider.start_x = col+1;
            gameState.blue_divider.start_y = row;
            gameState.blue_divider.end_x = col+1;
            gameState.blue_divider.end_y = row;
        }
        gameState.blue_divider.dir = gameState.divider_orientation;
    } else {
        // do nothing
    }
}

function mousedown(e) {
    if (e.which == 1) {
        const mouse_col = px_to_col(e.offsetX);
        const mouse_row = px_to_row(e.offsetY);
        if (mouse_row !== null) {
            createBarriers(mouse_row, mouse_col);
        }
    } else if (e.which == 3) {
        if (gameState.divider_orientation == UP_DOWN) {
            gameState.divider_orientation = LEFT_RIGHT;
            gameState.canvas[0].style.cursor = 'e-resize';
        } else {
            gameState.divider_orientation = UP_DOWN;
            gameState.canvas[0].style.cursor = 'n-resize';
        }
    }
}

function mouseup(e) {
}

function keyup(e) {
}

function keydown(e) {
    if (e.key == 'Escape') {
        gameState.paused = !gameState.paused;
    } else if (e.key == 'f') {
        gameState.advanceFrame = true;
    }
}

function blur() {
}

function resize() {
    init_canvas();
}

function render(t) {
    //gameState.ctx.clearRect(0,0, gameState.can_w, gameState.can_h);
    gameState.ctx.beginPath();
    gameState.ctx.rect(0,0, gameState.can_w, gameState.can_h);
    gameState.ctx.fillStyle = "black";
    gameState.ctx.fill();

    gameState.ctx.beginPath();
    gameState.ctx.rect(from_constants.board_x_left, from_constants.board_y_top, from_constants.board_width_px, from_constants.board_height_px);
    gameState.ctx.fillStyle = "white";
    gameState.ctx.fill();

    for (let r = 0; r < constants.board_num_rows; r++) {
        for (let c = 0; c < constants.board_num_cols; c++) {
            const cell = gameState.board_render[r][c];
            gameState.ctx.beginPath();
            gameState.ctx.rect(c*from_constants.ball_radius_px*2 + from_constants.board_x_left, r*from_constants.ball_radius_px*2 + from_constants.board_y_top, 2*from_constants.ball_radius_px, 2*from_constants.ball_radius_px);
            if (cell == CELL_EMPTY) { gameState.ctx.fillStyle = "white"; }
            else if (cell == CELL_BLACK) { gameState.ctx.fillStyle = "black"; }
            else if (cell == CELL_BLUE) { gameState.ctx.fillStyle = "blue"; }
            else if (cell == CELL_RED) { gameState.ctx.fillStyle = "red"; }
            gameState.ctx.fill();
        }
    }

    for (let ball of gameState.balls) {
        gameState.ctx.beginPath();
        //const ball_x = ball.pos_x * from_constants.board_width_px + from_constants.board_x_left;
        //const ball_y = ball.pos_y * from_constants.board_height_px + from_constants.board_y_top;
        const ball_x = ball.pos_x * from_constants.ball_radius_px*2 + from_constants.board_x_left;
        const ball_y = ball.pos_y * from_constants.ball_radius_px*2 + from_constants.board_y_top;
        gameState.ctx.arc(ball_x, ball_y, from_constants.ball_radius_px, 0, 2 * Math.PI);
        gameState.ctx.stroke();
        gameState.ctx.beginPath();
        gameState.ctx.arc(ball_x, ball_y, from_constants.ball_radius_px, Math.PI/2, 3*Math.PI/2);
        //const new_pos_int = ((Math.floor(new_x) == new_x) && (Math.floor(new_y) == new_y)) ? true : false;
        const pos_int = ((Math.floor(ball.pos_x) == ball.pos_x) && (Math.floor(ball.pos_y) == ball.pos_y)) ? true : false;
        if (pos_int) {
            gameState.ctx.fillStyle = "blue";
        } else {
            gameState.ctx.fillStyle = "red";
        }
        gameState.ctx.fillStyle = "red";
        gameState.ctx.fill();
    }
}

function copy_board() {
    for (let r=0; r < constants.board_num_rows; r++) {
        for (let c=0; c < constants.board_num_cols; c++) {
            gameState.board_render[r][c] = gameState.board[r][c];
        }
    }
}

function getDirFromVel(ball) {
    let dir = null;
    if (ball.vel_x < 0 && ball.vel_y < 0) { dir = DIR_NW; }
    else if (ball.vel_x < 0 && ball.vel_y > 0) { dir = DIR_SW; }
    else if (ball.vel_x > 0 && ball.vel_y < 0) { dir = DIR_NE; }
    else if (ball.vel_x > 0 && ball.vel_y > 0) { dir = DIR_SE; }
    return dir;
}

function update(t) {
    const dt = t - gameState.t_prev;
    gameState.t_prev = t;

    if (!gameState.paused || gameState.advanceFrame) {

        gameState.frameCount++;

        if (gameState.advanceFrame) {
            console.log(`frame ${gameState.frameCount}`);
        }

        if (gameState.red_divider.active) {
            if (gameState.red_divider.dir == UP_DOWN) {
                const c = gameState.red_divider.start_x;
                for (let ball of gameState.balls) {
                    // TODO: account for 0.5 positions
                    if ((ball.pos_x == c) && (ball.pos_y <= gameState.red_divider.start_y && ball.pos_y >= gameState.red_divider.end_y)) {
                        console.log('UP_DOWN collision with red');
                        gameState.red_divider.active = false;
                    }
                }
            } else {
                const r = gameState.red_divider.start_y;
                for (let ball of gameState.balls) {
                    // TODO: account for 0.5 positions
                    if ((ball.pos_y == r) && (ball.pos_x <= gameState.red_divider.start_x && ball.pos_x >= gameState.red_divider.end_x)) {
                        console.log('LEFT_RIGHT collision with red');
                        gameState.red_divider.active = false;
                    }
                }
            }
        }

        if (gameState.blue_divider.active) {
            if (gameState.blue_divider.dir == UP_DOWN) {
                const c = gameState.blue_divider.start_x;
                for (let ball of gameState.balls) {
                    // TODO: account for 0.5 positions
                    if ((ball.pos_x == c) && (ball.pos_y <= gameState.blue_divider.end_y && ball.pos_y >= gameState.blue_divider.start_y)) {
                        console.log('UP_DOWN collision with blue');
                        gameState.blue_divider.active = false;
                    }
                }
            } else {
                const r = gameState.blue_divider.start_y;
                for (let ball of gameState.balls) {
                    // TODO: account for 0.5 positions
                    if ((ball.pos_y == r) && (ball.pos_x <= gameState.blue_divider.end_x && ball.pos_x >= gameState.blue_divider.start_x)) {
                        console.log('LEFT_RIGHT collision with blue');
                        gameState.blue_divider.active = false;
                    }
                }
            }
        }

        if (gameState.frameCount == 20)  { createBarriers(16,23);  gameState.divider_orientation = 1; }
        if (gameState.frameCount == 179) { createBarriers(13,13);  gameState.divider_orientation = 0; }
        if (gameState.frameCount == 258) { createBarriers(20, 11); gameState.divider_orientation = 1; }
        if (gameState.frameCount == 338) { createBarriers(22, 17); gameState.divider_orientation = 0; }
        if (gameState.frameCount == 433) { createBarriers(25, 16); gameState.divider_orientation = 1; }
        if (gameState.frameCount == 508) { createBarriers(26, 20); gameState.divider_orientation = 0; }
        if (gameState.frameCount == 580) { createBarriers(27, 20); gameState.divider_orientation = 0; }
        if (gameState.frameCount == 634) { createBarriers(28, 19); gameState.divider_orientation = 0; }
        if (gameState.frameCount == 693) { createBarriers(28, 18); gameState.divider_orientation = 0; }
        if (gameState.frameCount == 762) { createBarriers(5 , 13); gameState.divider_orientation = 1; }
        if (gameState.frameCount == 823) { createBarriers(8 , 6 ); gameState.divider_orientation = 0; }
        if (gameState.frameCount == 954) { createBarriers(6 , 6 ); gameState.divider_orientation = 0; }

        if (gameState.frameCount % 4 == 0) {

            if (gameState.red_divider.active) {
                if (gameState.red_divider.dir == UP_DOWN) {
                    const c = gameState.red_divider.start_x;
                    if ((gameState.red_divider.end_y > 0) && (gameState.board[gameState.red_divider.end_y][c] != CELL_BLACK)) {
                        gameState.red_divider.end_y--;
                    } else {
                        gameState.red_divider.active = false;
                        for (let r=gameState.red_divider.start_y; r >= gameState.red_divider.end_y; r--) {
                            gameState.board[r][c] = CELL_BLACK;
                        }
                    }
                } else {
                    const r = gameState.red_divider.start_y;
                    if ((gameState.red_divider.end_x > 0) && (gameState.board[r][gameState.red_divider.end_x] != CELL_BLACK)) {
                        gameState.red_divider.end_x--;
                    } else {
                        gameState.red_divider.active = false;
                        for (let c=gameState.red_divider.start_x; c >= gameState.red_divider.end_x; c--) {
                            gameState.board[r][c] = CELL_BLACK;
                        }
                    }
                }
            }

            if (gameState.blue_divider.active) {
                if (gameState.blue_divider.dir == UP_DOWN) {
                    const c = gameState.blue_divider.start_x;
                    if ((gameState.blue_divider.end_y < constants.board_num_rows) && (gameState.board[gameState.blue_divider.end_y][c] != CELL_BLACK)) {
                        gameState.blue_divider.end_y++;
                    } else {
                        gameState.blue_divider.active = false;
                        for (let r=gameState.blue_divider.start_y; r < gameState.blue_divider.end_y; r++) {
                            gameState.board[r][c] = CELL_BLACK;
                        }
                    }
                } else {
                    const r = gameState.blue_divider.start_y;
                    if ((gameState.blue_divider.end_x < constants.board_num_cols) && (gameState.board[r][gameState.blue_divider.end_x] != CELL_BLACK)) {
                        gameState.blue_divider.end_x++;
                    } else {
                        gameState.blue_divider.active = false;
                        for (let c=gameState.blue_divider.start_x; c <= gameState.blue_divider.end_x; c++) {
                            gameState.board[r][c] = CELL_BLACK;
                        }
                    }
                }
            }
        }

        copy_board();

        if (gameState.red_divider.active) {
            if (gameState.red_divider.dir == UP_DOWN) {
                const c = gameState.red_divider.start_x;
                for (let r=gameState.red_divider.start_y; r > gameState.red_divider.end_y; r--) {
                    gameState.board_render[r][c] = CELL_RED;
                }
            } else {
                const r = gameState.red_divider.start_y;
                for (let c=gameState.red_divider.start_x; c > gameState.red_divider.end_x; c--) {
                    gameState.board_render[r][c] = CELL_RED;
                }
            }
        }
        if (gameState.blue_divider.active) {
            if (gameState.blue_divider.dir == UP_DOWN) {
                const c = gameState.blue_divider.start_x;
                for (let r=gameState.blue_divider.start_y; r < gameState.blue_divider.end_y; r++) {
                    gameState.board_render[r][c] = CELL_BLUE;
                }
            } else {
                const r = gameState.blue_divider.start_y;
                for (let c=gameState.blue_divider.start_x; c < gameState.blue_divider.end_x; c++) {
                    gameState.board_render[r][c] = CELL_BLUE;
                }
            }
        }

        // TODO: collision check algorithm:
        // * begin with assumption that all four possible directions are valid
        // * check for a collision in the direction the ball is moving
        // * if collision, check for a collision in the new direction
        // * if the new direction has already been ruled out, the ball stops moving
        // * a collision can be hitting a black square, another ball, or the board wall
        // * (simplification: make the board surrounded with black squares; eliminates special case)

        if (gameState.frameCount % 2 == 0) {
            for (let ball of gameState.balls) {

                let valid_dirs = [true, true, true, true];

                let desired_dir = getDirFromVel(ball);

                // loop until the ball either finds a way to go, or is inferred to be stuck
                while (true) {
                    if (!valid_dirs[desired_dir]) {
                        // we've already checked this direction; ball is stuck
                        ball.vel_x = 0;
                        ball.vel_y = 0;
                        break;
                    }

                    const new_x = ball.pos_x + ball.vel_x * 0.5;
                    const new_y = ball.pos_y + ball.vel_y * 0.5;

                    let collision = false;
                    const new_pos_int = ((Math.floor(new_x) == new_x) && (Math.floor(new_y) == new_y)) ? true : false;
                    if (new_pos_int) {
                        if ((gameState.board[new_y][new_x] == CELL_BLACK) ||
                            ((new_x-1 >= 0) && (gameState.board[new_y][new_x-1] == CELL_BLACK)) ||
                            ((new_y-1 >= 0) && (gameState.board[new_y-1][new_x] == CELL_BLACK)) ||
                            ((new_x-1 >= 0 && new_y-1 >= 0) && (gameState.board[new_y-1][new_x-1] == CELL_BLACK))) {
                            //console.log('.');
                            collision = true;
                        }
                    }

                    if (collision) {
                        valid_dirs[desired_dir] = false;
                        // calculate new velocities
                        if (desired_dir == DIR_NW) {
                            const tl_cell = gameState.board[new_y-1][new_x-1];
                            const t_cell = gameState.board[new_y-1][new_x];
                            const l_cell = gameState.board[new_y][new_x-1];
                            const top_wall          = (tl_cell == CELL_BLACK) && (l_cell == CELL_EMPTY) && (t_cell == CELL_BLACK);
                            const side_wall         = (tl_cell == CELL_BLACK) && (l_cell == CELL_BLACK) && (t_cell == CELL_EMPTY);
                            const head_on_corner    = (tl_cell == CELL_BLACK) && (((l_cell == CELL_EMPTY) && (t_cell == CELL_EMPTY)) || ((l_cell == CELL_BLACK) && (t_cell == CELL_BLACK))); // TODO: edge case l & u, not ul
                            const l_corner          = (tl_cell == CELL_EMPTY) && (l_cell == CELL_BLACK) && (t_cell == CELL_EMPTY);
                            const r_corner          = (tl_cell == CELL_EMPTY) && (l_cell == CELL_EMPTY) && (t_cell == CELL_BLACK);
                            if (top_wall) {
                                ball.vel_x = -1;
                                ball.vel_y = 1;
                            } else if (side_wall) {
                                ball.vel_x = 1;
                                ball.vel_y = -1;
                            } else if (head_on_corner) {
                                ball.vel_x = 1;
                                ball.vel_y = 1;
                            } else if (l_corner) {
                                ball.vel_x = 1;
                                ball.vel_y = -1;
                            } else if (r_corner) {
                                ball.vel_x = -1;
                                ball.vel_y = 1;
                            } else {
                            }
                        } else if (desired_dir == DIR_NE) {
                            const tr_cell = gameState.board[new_y-1][new_x];
                            const t_cell = gameState.board[new_y-1][new_x-1];
                            const r_cell = gameState.board[new_y][new_x];
                            const top_wall          = (tr_cell == CELL_BLACK) && (r_cell == CELL_EMPTY) && (t_cell == CELL_BLACK);
                            const side_wall         = (tr_cell == CELL_BLACK) && (r_cell == CELL_BLACK) && (t_cell == CELL_EMPTY);
                            const head_on_corner    = (tr_cell == CELL_BLACK) && (((r_cell == CELL_EMPTY) && (t_cell == CELL_EMPTY)) || ((r_cell == CELL_BLACK) && (t_cell == CELL_BLACK))); // TODO: edge case l & u, not ul
                            const l_corner          = (tr_cell == CELL_EMPTY) && (r_cell == CELL_EMPTY) && (t_cell == CELL_BLACK);
                            const r_corner          = (tr_cell == CELL_EMPTY) && (r_cell == CELL_BLACK) && (t_cell == CELL_EMPTY);
                            if (top_wall) {
                                ball.vel_x = 1;
                                ball.vel_y = 1;
                            } else if (side_wall) {
                                ball.vel_x = -1;
                                ball.vel_y = -1;
                            } else if (head_on_corner) {
                                ball.vel_x = -1;
                                ball.vel_y = 1;
                            } else if (r_corner) {
                                ball.vel_x = -1;
                                ball.vel_y = -1;
                            } else if (l_corner) {
                                ball.vel_x = 1;
                                ball.vel_y = 1;
                            } else {
                            }
                        } else if (desired_dir == DIR_SE) {
                            const br_cell = gameState.board[new_y][new_x];
                            const b_cell = gameState.board[new_y][new_x-1];
                            const r_cell = gameState.board[new_y-1][new_x];
                            const bottom_wall       = (br_cell == CELL_BLACK) && (r_cell == CELL_EMPTY) && (b_cell == CELL_BLACK);
                            const side_wall         = (br_cell == CELL_BLACK) && (r_cell == CELL_BLACK) && (b_cell == CELL_EMPTY);
                            const head_on_corner    = (br_cell == CELL_BLACK) && (((r_cell == CELL_EMPTY) && (b_cell == CELL_EMPTY)) || ((r_cell == CELL_BLACK) && (b_cell == CELL_BLACK))); // TODO: edge case l & u, not ul
                            const l_corner          = (br_cell == CELL_EMPTY) && (r_cell == CELL_BLACK) && (b_cell == CELL_EMPTY);
                            const r_corner          = (br_cell == CELL_EMPTY) && (r_cell == CELL_EMPTY) && (b_cell == CELL_BLACK);
                            if (bottom_wall) {
                                ball.vel_x = 1;
                                ball.vel_y = -1;
                            } else if (side_wall) {
                                ball.vel_x = -1;
                                ball.vel_y = 1;
                            } else if (head_on_corner) {
                                ball.vel_x = -1;
                                ball.vel_y = -1;
                            } else if (r_corner) {
                                ball.vel_x = 1;
                                ball.vel_y = -1;
                            } else if (l_corner) {
                                ball.vel_x = -1;
                                ball.vel_y = 1;
                            } else {
                            }
                        } else if (desired_dir == DIR_SW) {
                            const bl_cell = gameState.board[new_y][new_x-1];
                            const b_cell = gameState.board[new_y][new_x];
                            const l_cell = gameState.board[new_y-1][new_x-1];
                            const bottom_wall       = (bl_cell == CELL_BLACK) && (l_cell == CELL_EMPTY) && (b_cell == CELL_BLACK);
                            const side_wall         = (bl_cell == CELL_BLACK) && (l_cell == CELL_BLACK) && (b_cell == CELL_EMPTY);
                            const head_on_corner    = (bl_cell == CELL_BLACK) && (((l_cell == CELL_EMPTY) && (b_cell == CELL_EMPTY)) || ((l_cell == CELL_BLACK) && (b_cell == CELL_BLACK))); // TODO: edge case l & u, not ul
                            const l_corner          = (bl_cell == CELL_EMPTY) && (l_cell == CELL_EMPTY) && (b_cell == CELL_BLACK);
                            const r_corner          = (bl_cell == CELL_EMPTY) && (l_cell == CELL_BLACK) && (b_cell == CELL_EMPTY);
                            if (bottom_wall) {
                                ball.vel_x = -1;
                                ball.vel_y = -1;
                            } else if (side_wall) {
                                ball.vel_x = 1;
                                ball.vel_y = 1;
                            } else if (head_on_corner) {
                                ball.vel_x = 1;
                                ball.vel_y = -1;
                            } else if (l_corner) {
                                ball.vel_x = -1;
                                ball.vel_y = -1;
                            } else if (r_corner) {
                                ball.vel_x = 1;
                                ball.vel_y = 1;
                            } else {
                            }
                        }
                        desired_dir = getDirFromVel(ball);
                    } else {
                        // no collision; continue normally
                        break;
                    }
                }

                ball.pos_x = ball.pos_x + ball.vel_x * 0.5;
                ball.pos_y = ball.pos_y + ball.vel_y * 0.5;
            }
        }

    }

    if (gameState.advanceFrame) {
        gameState.advanceFrame = false;
    }

    render(t);

    window.requestAnimationFrame(update);
}


$(function() {
    $(window).keyup(keyup);
    $(window).keydown(keydown);
    $(window).mousedown(mousedown);
    $(window).mouseup(mouseup);
    $(window).blur(blur);
    $(window).resize(resize);
    $(window).contextmenu(contextmenu);

    init_game();

    window.requestAnimationFrame(update);

});
