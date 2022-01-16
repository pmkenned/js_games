// TODO: draw keys other than a-z and arrow keys

// Dependencies:
// - pressed: object holding list of pressed keys
// - ctx: 2d context
// - width, height
// - px(x, f): for aligning pixels

let keys = [];

keys.push({name: 'esc', width: 1, row: 1});
keys.push({name: undefined, width: 1, row: 1});
keys.push({name: 'f1', width: 1, row: 1});
keys.push({name: 'f2', width: 1, row: 1});
keys.push({name: 'f3', width: 1, row: 1});
keys.push({name: 'f4', width: 1, row: 1});
keys.push({name: undefined, width: 0.5, row: 1});
keys.push({name: 'f5', width: 1, row: 1});
keys.push({name: 'f6', width: 1, row: 1});
keys.push({name: 'f7', width: 1, row: 1});
keys.push({name: 'f8', width: 1, row: 1});
keys.push({name: undefined, width: 0.5, row: 1});
keys.push({name: 'f9', width: 1, row: 1});
keys.push({name: 'f10', width: 1, row: 1});
keys.push({name: 'f11', width: 1, row: 1});
keys.push({name: 'f12', width: 1, row: 1});
keys.push({name: undefined, width: 0.2, row: 1});
keys.push({name: 'prtsc', width: 1, row: 1});
keys.push({name: 'scrlk', width: 1, row: 1});
keys.push({name: 'pause', width: 1, row: 1});

[..."`1234567890-="].forEach((e, i) => keys.push({name: e, width: 1, row: 2}));
keys.push({name: 'back', width: 2, row: 2});
keys.push({name: undefined, width: 0.2, row: 2});
keys.push({name: 'ins',  width: 1, row: 2});
keys.push({name: 'home', width: 1, row: 2});
keys.push({name: 'pgup', width: 1, row: 2});
keys.push({name: undefined, width: 0.2, row: 2});
keys.push({name: 'numlk', width: 1, row: 2});
keys.push({name: '/', width: 1, row: 2});
keys.push({name: '*', width: 1, row: 2});
keys.push({name: '-', width: 1, row: 2});

keys.push({name: 'tab', width: 1.5, row: 3});
[..."qwertyuiop[]"].forEach((e, i) => keys.push({name: e, width: 1, row: 3}));
keys.push({name: '\\', width: 1.5, row: 3});
keys.push({name: undefined, width: 0.2, row: 3});
keys.push({name: 'del',  width: 1, row: 3});
keys.push({name: 'end',  width: 1, row: 3});
keys.push({name: 'pgdn', width: 1, row: 3});
keys.push({name: undefined, width: 0.2, row: 3});
keys.push({name: '7', width: 1, row: 3});
keys.push({name: '8', width: 1, row: 3});
keys.push({name: '9', width: 1, row: 3});
keys.push({name: '+', width: 1, height: 2, row: 3});

keys.push({name: 'caps', width: 1.8, row: 4});
[..."asdfghjkl;'"].forEach((e, i) => keys.push({name: e, width : 1, row: 4}));
keys.push({name: 'enter', width: 2.2, row: 4});
keys.push({name: undefined, width: 3.4, row: 4});
keys.push({name: '4', width: 1, row: 4});
keys.push({name: '5', width: 1, row: 4});
keys.push({name: '6', width: 1, row: 4});

keys.push({name: 'shift', width: 2, row: 5});
[..."zxcvbnm,./"].forEach((e, i) => keys.push({name: e, width : 1, row: 5}));
keys.push({name: 'shift', width: 3, row: 5});
keys.push({name: undefined, width: 1.2, row: 5});
keys.push({name: '\u2191', width: 1, row: 5});
keys.push({name: undefined, width: 1.2, row: 5});
keys.push({name: '1', width: 1, row: 5});
keys.push({name: '2', width: 1, row: 5});
keys.push({name: '3', width: 1, row: 5});
keys.push({name: 'enter', width: 1, height: 2, row: 5});

keys.push({name: 'ctrl', width: 1.3, row: 6});
keys.push({name: 'win',  width: 1.3, row: 6});
keys.push({name: 'alt',  width: 1.3, row: 6});
keys.push({name: ' ',    width: 5.9, row: 6});
keys.push({name: 'alt',  width: 1.3, row: 6});
keys.push({name: 'fn',   width: 1.3, row: 6});
keys.push({name: 'ctx',  width: 1.3, row: 6});
keys.push({name: 'ctrl', width: 1.3, row: 6});
keys.push({name: undefined, width: 0.2, row: 6});
keys.push({name: '\u2190', width: 1, row: 6});
keys.push({name: '\u2193', width: 1, row: 6});
keys.push({name: '\u2192', width: 1, row: 6});
keys.push({name: undefined, width: 0.2, row: 6});
keys.push({name: '0', width: 2, row: 6});
keys.push({name: '.', width: 1, row: 6});

let keyNamesToKeyNames = {
    '\u2191' : 'ArrowUp',
    '\u2190' : 'ArrowLeft',
    '\u2193' : 'ArrowDown',
    '\u2192' : 'ArrowRight',
};

for (let i = 'a'.charCodeAt(0); i <= 'z'.charCodeAt(0); i++) {
    const c = String.fromCharCode(i);
    keyNamesToKeyNames[c] = c;
}

function drawKeyboard(s=1.0) {

    ctx.lineWidth = 1;
    //ctx.font = `${parseInt(s*6)}px Calibri`;
    ctx.strokeStyle = "black";
    ctx.fillStyle = "black";

    let prevRow = -1;
    let offset = 0;
    for (const [i, x] of keys.entries()) {
        let isPressed = false;

        if (pressed[keyNamesToKeyNames[x.name]])
            isPressed = true;

        const row = x.row;
        if (row != prevRow) {
            offset = 0
        }
        prevRow = row;
        if (x.name !== undefined) {
            const x_height = x.height || 1.0;
            const fontSz = (x.name.length > 1) ? 5 : 12;
            ctx.font = `${parseInt(s*fontSz)}px Calibri`;

            ctx.strokeStyle = isPressed ? "white" : "black";
            ctx.fillStyle = isPressed ? "black" : "white";
            ctx.beginPath();
            ctx.rect(px(width/2+offset-200*s,0.5), px(height+(row*16-120)*s,0.5), px((x.width*16-2)*s,0), px(s*(14*x_height+2*(x_height-1)),0));
            ctx.fill();
            ctx.stroke();

            ctx.strokeStyle = isPressed ? "black" : "white";
            ctx.fillStyle = isPressed ? "white" : "black";
            ctx.fillText(x.name, width/2+offset+2-200*s, height+(row*16-120+10)*s+0.5);
        }
        offset += x.width*16*s;
    }
}
