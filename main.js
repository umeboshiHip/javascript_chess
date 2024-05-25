class Piece {
	constructor(_x, _y, _type) {
		this.x = _x;
		this.y = _y;

		this.isMoved = false;
		this.isSelected = false;

		this.type = PIECE_CANT_MOVE;

		if(_type != BOARD_NOTHING) {
			this.type = PIECE_CAN_MOVE;

			if(_type == PIECE_PAWN) {
				this.type = PIECE_PAWN;
			}
		}
	}

	Move(sx, sy) {
		var pt = board[this.y][this.x];		//移動前のボードの状態を保存
		board[this.y][this.x] = 0;		//ボードの情報をきれいに
		bState[this.y][this.x] = 0;

		this.x = sx;	//座標を移動先へ変える
		this.y = sy;

		board[this.y][this.x] = pt;			//ボードの情報を変える
		bState[this.y][this.x] = wPlayer;

		if(!this.isMoved) this.isMoved = true;	//すでに動いたフラグを付ける？
	}
}

var dp = document.getElementById("mousepos");
console.log(dp);
var pt = document.getElementById("piecetype");
var bt = document.getElementById("board")
var bst = document.getElementById("bstate")

const canvas = document.getElementById("canvas");
const g = canvas.getContext("2d");

const TILE = 30;
const CANVAS_SIZE = TILE*8;

const PIECE_CANT_MOVE = 0;
const PIECE_CAN_MOVE = 2;
const PIECE_PAWN = 1;

const BOARD_NOTHING = 0;
const BOARD_SIZE = 8;

var gameOver = false;
var isSelecting = false;
var wPlayer = 1;

var cImg = new Image();
cImg.src = "chess.png";
const cSIZE = 15;
const cNUM = 6;

var pieces = [];

var mouse = {
	x: 0,
	y: 0
};

var cPallet = [
	"#C8C8C8", "#64C8C8"
]

var board = [
	[3, 2, 4, 5, 6, 4, 2, 3],
	[1, 1, 1, 1, 1, 1, 1, 1],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[1, 1, 1, 1, 1, 1, 1, 1],
	[3, 2, 4, 5, 6, 4, 2, 3],		//1:歩兵 2:飛車 3:啓馬 4:格 5:クイーン 6:王
]

var bState = [
	[2, 2, 2, 2, 2, 2, 2, 2],
	[2, 2, 2, 2, 2, 2, 2, 2],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[1, 1, 1, 1, 1, 1, 1, 1],
	[1, 1, 1, 1, 1, 1, 1, 1]
];

var pMoves = [
	[
		[0, 0, 2, 0, 0],	//1すすめる 4進めるけど取れない 7はじまですすめる 2最初の一回だけ進める 3動けないけどとれるところ
		[0, 3, 4, 3, 0],
		[0, 0, 9, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0]
	],
	[
		[0, 1, 0, 1, 0],
		[1, 0, 0, 0, 1],
		[0, 0, 9, 0, 0],
		[1, 0, 0, 0, 1],
		[0, 1, 0, 1, 0]
	],
	[
		[0, 0, 0, 0, 0],
		[0, 0, 7, 0, 0],
		[0, 7, 9, 7, 0],
		[0, 0, 7, 0, 0],
		[0, 0, 0, 0, 0]
	],
	[
		[0, 0, 0, 0, 0],
		[0, 7, 0, 7, 0],
		[0, 0, 9, 0, 0],
		[0, 7, 0, 7, 0],
		[0, 0, 0, 0, 0]
	],
	[
		[0, 0, 0, 0, 0],
		[0, 7, 7, 7, 0],
		[0, 7, 9, 7, 0],
		[0, 7, 7, 7, 0],
		[0, 0, 0, 0, 0]
	],
	[
		[0, 0, 0, 0, 0],
		[0, 1, 1, 1, 0],
		[0, 1, 9, 1, 0],
		[0, 1, 1, 1, 0],
		[0, 0, 0, 0, 0]
	]
];

window.onload = function() {
	init();
}

function init() {
	canvas.onmousemove = mouseUpdate;
	canvas.onmousedown = mouseClick;

	canvas.width = CANVAS_SIZE;
	canvas.height = CANVAS_SIZE;

	g.imageSmoothingEnabled = false;

	for(var i = 0; i < BOARD_SIZE; i++) {
		for(var n = 0; n < BOARD_SIZE; n++) {
			pieces.push(new Piece(n, i, board[i][n]));
		}
	}

	loop();
}

function loop() {
	if(!gameOver) {
		paint();
		requestAnimationFrame(loop);

		bt.innerText = board[0]+"\n"+board[1]+"\n"+board[2]+"\n"+board[3]+"\n"+board[4]+"\n"+board[5]+"\n"+board[6]+"\n"+board[7];
		bst.innerText = bState[0]+"\n"+bState[1]+"\n"+bState[2]+"\n"+bState[3]+"\n"+bState[4]+"\n"+bState[5]+"\n"+bState[6]+"\n"+bState[7];
	}
}

function drawCursor() {
	g.fillStyle = "rgba(255, 255, 0, 50)";
	g.fillRect(mouse.x*TILE, mouse.y*TILE, TILE, TILE);
}

function drawPiece() {
    for(var i = 0; i < BOARD_SIZE; i++) {
        for(var n = 0; n < BOARD_SIZE; n++) {
            if(board[i][n] != 0) {
				g.drawImage(cImg, (board[i][n]-1)*cSIZE, 0, cSIZE, cSIZE, n*TILE, i*TILE, TILE, TILE);
			}
        }
    }
}

function drawBoard() {
	for(var i = 0; i < BOARD_SIZE; i++) {
		for(var n = 0; n < BOARD_SIZE; n++) {
			g.fillStyle = cPallet[(n+i)%2];
			g.fillRect(n*TILE, i*TILE, TILE, TILE);
		}
	}
}

function checkBoardState(_x, _y) {
	if(board[_y][_x] == 0) {
		return true;
	}

	return false;
}

function checkMoveDestination(_sy, _sx, _x, _y, _i) {
	var pm = pMoves[(board[_sy][_sx])-1][_y][_x];
	var cdm = false;

	if(pm != 0 && pm != 3 && checkBoardState(_sx+(_x-2), _sy+(_y-2))) {		//もし移動先が移動できる場所ではなくてとれるけど移動できない場所ではなくて何も駒が置かれていないのであれば
		cdm = true;

		if(pm == 2) {	//もし移動先が一回しか移動できない場所であれば
			if(pieces[_i].isMoved) {	//すでに移動していたのであれば
				cdm = false;
			}
		}
	}

	return cdm;	//濡れない
}

function showMoveDestination() {
	var sx, sy;

	for(var i = 0; i < pieces.length; i++) {
		if(pieces[i].isSelected) {
			for(var n = 0; n < 5; n++) {
				for(var p = 0; p < 5; p++) {
					if(wPlayer == 1) {
						sx = (p-2)+pieces[i].x;		//mouseClick関関数のところと一緒
						sy = (n-2)+pieces[i].y;

						if(sx < 0 || sy < 0 || sx > 7 || sy > 7) {
							break;
						}
						
						if(board[sy][sx] == BOARD_NOTHING && checkMoveDestination(pieces[i].y, pieces[i].x, p, n, i)) {
							g.strokeRect(sx*TILE, sy*TILE, TILE, TILE);		//移動先を塗る
						}
					}
				}
			}
		}
	}
}

function paint() {
	g.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

	drawBoard();
	drawCursor();
	drawPiece();
	showMoveDestination();
}

function mouseUpdate(e) {
	if(!isSelecting) {
		mouse.x = Math.floor(e.offsetX / 30);
		mouse.y = Math.floor(e.offsetY / 30);
	}

	dp.textContent = "x: "+mouse.x+", y: "+mouse.y;
}

function pieceSelect(_y, _x) {
	if(pieces[(_y*8)+_x].type != PIECE_CANT_MOVE) {	
		if(pieces[(_y*8)+_x].isMoved) {
			for(var i = 0; i < pieces.length; i++) {
				if(pieces[i].x == _x && pieces[i].y == _y && pieces[i].type != PIECE_CANT_MOVE) {
					pieces[i].isSelected = true;
				}
			}
			console.log("nook b")

		} else {
			pieces[(_y*8)+_x].isSelected = true;
			console.log("nook a")
		}
	} else {
		for(var i = 0; i < pieces.length; i++) {
			if(pieces[i].x == _x && pieces[i].y == _y && pieces[i].type != PIECE_CANT_MOVE) {
				pieces[i].isSelected = true;
				console.log("ok")
			}
		}
	}
}


function mouseClick(e) {
	var sx, sy;

	for(var i = 0; i < pieces.length; i++) {
		var isc = [];

		if(pieces[i].isSelected) {
			isc.push(i);
		}

		if(pieces[i].x == mouse.x && pieces[i].y == mouse.y && pieces[i].type != PIECE_CANT_MOVE) {
			pt.textContent = "piece type: "+board[mouse.y][mouse.x]+", pieceismove: "+pieces[i].isMoved+" piecesx:" + pieces[i].x + "piecesy: " + pieces[i].y + " selected: " + isc+" isc: "+isc.length;
		}
	}

	if(bState[mouse.y][mouse.x] == wPlayer) {
		mouse.x = Math.floor(e.offsetX / 30);
		mouse.y = Math.floor(e.offsetY / 30);

		for(var i = 0; i < pieces.length; i++) {
			if(pieces[i].isSelected) {
				for(var n = 0; n < 5; n++) {
					for(var p = 0; p < 5; p++) {
						sx = (p-2)+pieces[i].x;			//移動先x
						sy = (n-2)+pieces[i].y;			//移動先y

						if(sx < 0 || sy < 0 || sx > 7 || sy > 7) {		//移動先が画面外だったら
							break;
						}

						if(checkMoveDestination(pieces[i].y, pieces[i].x, p, n, i) && mouse.x == sx && mouse.y == sy) {
							pieces[i].Move(sx, sy);
						}
					}
				}
			}
		}
	}

	isSelecting = !isSelecting ? true : false;		//クリックしてたらしてない状態にして逆なら逆に

	if(isSelecting) {
		pieceSelect(mouse.y, mouse.x);	//もしクリックされたならクリックされた駒を選択状態にする
	} else {
		for(var i = 0; i < pieces.length; i++) {
			pieces[i].isSelected = false;		//クリックされている状態じゃないのですべての駒を選択していない状態にする
		}
	}
}
