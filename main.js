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
		var bt = bState[this.y][this.x];

		if(!checkPieceEvolution(this.x, this.y, sy)) {
			gameStoped = false;
		} else {
			gameStoped = true;
			ex = sx;
			ey = sy;
		}

		board[this.y][this.x] = 0;		//ボードの情報をきれいに
		bState[this.y][this.x] = 0;

		board[sy][sx] = pt;
		bState[sy][sx] = bt;
		
		this.x = sx;	//座標を移動先へ変える
		this.y = sy;

//		console.log(board, bt, pt, bState);
//		console.log(board[sy][sx])

		if(!this.isMoved) this.isMoved = true;	//すでに動いたフラグを付ける？
		nPlayer = (nPlayer%2)+1;
	}
}

var dp = document.getElementById("mousepos");
console.log(dp);
var ptt = document.getElementById("piecetype");
var btt = document.getElementById("board")
var bst = document.getElementById("bstate")

const canvas = document.getElementById("canvas");
const g = canvas.getContext("2d");

const BOARD_NOTHING = 0;
const BOARD_SIZE = 8;

const SBOX_OFFSET_X = 25;
const SBOX_OFFSET_Y = 120;
const SBOX_WIDTH = 320;
const SBOX_HEIGHT = 120;

const TILE = 45;
const CANVAS_SIZE = TILE*BOARD_SIZE;

const PIECE_CANT_MOVE = 0;
const PIECE_CAN_MOVE = 2;
const PIECE_PAWN = 1;

var isCheckMateO = false;
var isCheckMateT = false;
var gameOver = false;
var gameStoped = false;
var isSelecting = false;

var oPlayer = 1;	//1p
var tPlayer = 2;	//2p
var nPlayer = 1;	//now player

var cImg = new Image();
cImg.src = "chess.png";
const cSIZE = 15;
const cNUM = 6;

var ex, ey;

var pieces = [];

var mouse = {
	x: 0,
	y: 0
};

var cPallet = [
	"#C8C8C8", "#64C8C8"
]

/*var board = [
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
];*/

var board = [
	[3, 2, 4, 5, 6, 0, 2, 3],
	[1, 1, 1, 1, 1, 1, 1, 1],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 5, 0, 0, 0],
	[0, 0, 0, 5, 0, 0, 0, 0],
	[1, 1, 1, 0, 0, 1, 1, 1],
	[3, 2, 4, 0, 6, 4, 2, 3],		//1:歩兵 2:飛車 3:啓馬 4:格 5:クイーン 6:王
]

var amp = [
	[3, 2, 4, 5, 6, 0, 2, 3],
	[1, 1, 1, 1, 1, 1, 1, 1],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 5, 0, 0, 0],
	[0, 0, 0, 5, 0, 0, 0, 0],
	[1, 1, 1, 0, 0, 1, 1, 1],
	[3, 2, 4, 0, 6, 4, 2, 3],		//1:歩兵 2:飛車 3:啓馬 4:格 5:クイーン 6:王
]


var bState = [
	[2, 2, 2, 2, 2, 0, 2, 2],
	[2, 2, 2, 2, 2, 1, 2, 2],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 2, 0, 0, 0],
	[0, 0, 0, 2, 0, 0, 0, 0],
	[1, 1, 1, 0, 0, 1, 1, 1],
	[1, 1, 1, 0, 1, 1, 1, 1]
];

var pMoves = [
	[
		[0, 0, 2, 0, 0],	//1すすめる 4進めるけど取れない 7はじまですすめる 2最初の一回だけ進める 3動けないけどとれるところ 5キャスリングできるところ
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
		[5, 1, 9, 1, 5],
		[0, 1, 1, 1, 0],
		[0, 0, 0, 0, 0]
	]
];

var aMovePos = [
	[],
	[]
];

var lastPlayer = 0;

window.onload = function() {
	init();
}

function init() {
	canvas.onmousemove = mouseUpdate;
	canvas.onmousedown = mouseClick;

	canvas.width = CANVAS_SIZE;
	canvas.height = CANVAS_SIZE;

	g.imageSmoothingEnabled = false;
	g.strokeStyle = "rgba(255, 255, 255, 255)";

	for(var i = 0; i < BOARD_SIZE; i++) {
		for(var n = 0; n < BOARD_SIZE; n++) {
			pieces.push(new Piece(n, i, board[i][n]));
		}
	}

	pushCanMovePos();
	canMovePos.splice(0);
	cantMovePos.splice(0);

	loop();
}

function loop() {
	ptt.textContent = "nPlayer: " + nPlayer + "this piece: " + bState[mouse.y][mouse.x] + " isCheckmateO: " + isCheckMateO;
	isCheckMateO = checkIsCheckMate();

	paint();
	requestAnimationFrame(loop);

	for(var i = 0; i < 8; i++) {
		for(var n = 0; n < 8; n++) {
			amp[i][n] = 0;
		}	
	}

	for(var i = 0; i < aMovePos[lastPlayer-1].length; i++) {
		amp[aMovePos[0][i].y][aMovePos[0][i].x] = 1;
	}

	btt.innerText = amp[0]+"\n"+amp[1]+"\n"+amp[2]+"\n"+amp[3]+"\n"+amp[4]+"\n"+amp[5]+"\n"+amp[6]+"\n"+amp[7];
	bst.innerText = bState[0]+"\n"+bState[1]+"\n"+bState[2]+"\n"+bState[3]+"\n"+bState[4]+"\n"+bState[5]+"\n"+bState[6]+"\n"+bState[7];
}

function drawCursor() {
	g.fillStyle = "rgba(255, 255, 0, 50)";
	g.fillRect(mouse.x*TILE, mouse.y*TILE, TILE, TILE);
}

function drawSelectBox() {
	g.save();
	{
		g.lineWidth = 4;
		g.strokeStyle = "#000000";
		g.strokeRect(SBOX_OFFSET_X, SBOX_OFFSET_Y, SBOX_WIDTH, SBOX_HEIGHT);

		g.fillStyle = "#ffffff";
		g.fillRect(SBOX_OFFSET_X, SBOX_OFFSET_Y, SBOX_WIDTH, SBOX_HEIGHT);

		g.font = "18px PixelMplus10";
		g.fillStyle = "#000000";
		g.fillText("どの駒に進化する？", SBOX_OFFSET_X+80, SBOX_OFFSET_Y+30);

		//進化先の駒表示
		g.drawImage(cImg, cSIZE, 0, cSIZE, cSIZE, SBOX_OFFSET_X+60, (SBOX_OFFSET_Y+SBOX_HEIGHT)-67, TILE, TILE);
		g.drawImage(cImg, cSIZE*2, 0, cSIZE, cSIZE, SBOX_OFFSET_X+110, (SBOX_OFFSET_Y+SBOX_HEIGHT)-67, TILE, TILE);
		g.drawImage(cImg, cSIZE*3, 0, cSIZE, cSIZE, SBOX_OFFSET_X+160, (SBOX_OFFSET_Y+SBOX_HEIGHT)-67, TILE, TILE);
		g.drawImage(cImg, cSIZE*4, 0, cSIZE, cSIZE, SBOX_OFFSET_X+210, (SBOX_OFFSET_Y+SBOX_HEIGHT)-67, TILE, TILE);
	}
	g.restore();
}

function drawPiece() {
    for(var i = 0; i < BOARD_SIZE; i++) {
        for(var n = 0; n < BOARD_SIZE; n++) {
            if(board[i][n] != 0) {
				g.drawImage(cImg, (board[i][n]-1)*cSIZE+((bState[i][n]-1)*(cSIZE*cNUM)), 0, cSIZE, cSIZE, n*TILE, i*TILE, TILE, TILE);
			}
        }
    }
}

function drawBoard() {
	for(var i = 0; i < BOARD_SIZE; i++) {
		for(var n = 0; n < BOARD_SIZE; n++) {
			g.fillStyle = cPallet[(n+i)%2];
			if(board[i][n] == 6 && isCheckMateO && bState[i][n] == oPlayer) {
				g.fillStyle = "#ff0000";
			}

			g.fillRect(n*TILE, i*TILE, TILE, TILE);
		}
	}
}

function checkGameSet() {
	if(isCheckMateO) {
		for(var i = 0; i < pieces.length; i++) {
			if(bState[pieces[i].y][pieces[i].x] == oPlayer && pieces[i].type != 0) {

			}
		}
	}
}

var ugk = false;
function checkCantMovePos(_sy, _sx, _x, _y) {
	if(board[_y][_x] != 6) {
		return true;
	}

	ugk = false;

	for(var i = 0; i < aMovePos[lastPlayer-1].length; i++) {
		var a = aMovePos[lastPlayer-1][i];
			
		if(((a.x != _x && a.y != _y)) || (bState[_sy][_sx] == nPlayer%2+1)) {
			if(a.x != _sx && a.y != _sy) {
				continue;
			}
		}
		
		if(a.x == _x && a.y == _y) {
			return false;
		}

		if(a.x == _sx && a.y == _sy) {
			ugk = true;
			return false;
		}
	}

	return true;	//動ける
}

function checkBoardState(_x, _y, _p) {
	if(_y < 0 || _x < 0 || _y > 7 || _x > 7) {
		return false;
	}

	if((board[_y][_x] == 0 && bState[_y][_x] != _p) || (bState[_y][_x] == _p)) {
		return true;
	}

	return false;
}

function checkPieceEvolution(_x, _y, _sy) {
	if(board[_y][_x] != 1) {
		return false;
	}

	var ey = 0;
	if(bState[_y][_x] == tPlayer) {
		ey = 7;
	}
	
	if(_sy == ey) {
		return true;
	}

	return false;
}

var canMovePos = [];
var cantMovePos = [];

function checkMoveDestination(_sy, _sx, _x, _y, _i, _t) {
	if(board[_sy][_sx]-1 < 0) {
		return false;
	}

	var p = nPlayer%2+1;
	var tp = nPlayer;
	if(_t) { 
		tp = lastPlayer%2+1;
		p = lastPlayer;
	}
	
	var pm = pMoves[board[_sy][_sx]-1][_y][_x];
	var vx, vy, dx, dy, bflag, fFlag, cdm;

	var cbFlag = checkBoardState(_sx+(_x-2), _sy+(_y-2), p);
	var cbX = _sx+(_x-2), cbY = _sy+(_y-2);

	if(bState[_sy][_sx] == tPlayer) {
		cbFlag = checkBoardState(_sx+((4-_x)-2), _sy+((4-_y)-2), p);
		var cbX = _sx+((4-_x)-2), cbY = _sy+((4-_y)-2);
	} 

	if(pm != 0 && pm != 3 && pm != 9 && cbFlag) {		//もし移動先が移動できる場所ではなくてとれるけど移動できない場所ではなくて何も駒が置かれていないのであれば		cdm = true;
		cdm = true;

		if(pm == 2) {	//もし移動先が一回しか移動できない場所であれば
			if(pieces[_i].isMoved) {	//すでに移動していたのであれば
				cdm = false;
			}
		}

		if((pm == 4 || pm == 2) && board[cbY][cbX] != BOARD_NOTHING) {
			cdm = false;
		}

		if(pm == 7) {
			vx = _x-2;
			vy = _y-2;

			if(bState[_sy][_sx] == tPlayer) {
				vx = (4-_x)-2;
				vy = (4-_y)-2;
			}

			fFlag = false;

			for(var i = 0; i < BOARD_SIZE; i++) {
				bflag = false;

				dx = _sx+=vx;
				dy = _sy+=vy;

				if(dx < 0 || dy < 0 || dx > 7 || dy > 7) {
					break;
				}

				if(fFlag) {
					break;
				}

				if(bState[dy][dx] == tp) {
					break;
				} else if(bState[dy][dx] == p) {
					fFlag = true;
				}

				for(var n = 0; n < canMovePos.length; n++) {
					if(canMovePos[n].x == dx && canMovePos[n].y == dy) {
						bflag = true;
					}
				}

				if(!bflag) {
					canMovePos.push({x: dx, y: dy});
				}
			}
		}

		if(pm == 5) {
			return false;
		}
	} else if(pm == 3 && cbFlag) {
		if(board[cbY][cbX] != BOARD_NOTHING && bState[cbY][cbX] == (nPlayer%2)+1) {
			cdm = true;
		}
	}

	return cdm;
}

function checkIsCheckMate() {
	var sx, sy;

	for(var i = 0; i < pieces.length; i++) {
		if(board[pieces[i].y][pieces[i].x] == 6 && pieces[i].type != 0 && bState[pieces[i].y][pieces[i].x] == oPlayer && lastPlayer == oPlayer) {
			for(var n = 0; n < 5; n++) {
				for(var p = 0; p < 5; p++) {
					if(bState[pieces[i].y][pieces[i].x] == oPlayer) {
						sx = (p-2)+pieces[i].x;			//移動先x
						sy = (n-2)+pieces[i].y;			//移動先y
					} else if(bState[pieces[i].y][pieces[i].x] == tPlayer) {
						sx = ((4-p)-2)+pieces[i].x;			//移動先x
						sy = ((4-n)-2)+pieces[i].y;			//移動先y
					} 

					if(sx < 0 || sy < 0 || sx > 7 || sy > 7) {
						continue;
					}

					if(checkMoveDestination(pieces[i].y, pieces[i].x, p, n, i, true)) {
						if(!checkCantMovePos(sy, sx, pieces[i].x, pieces[i].y) && !ugk) {
							return true;
						}
					}
				}
			}
		}
	}

	return false;
}

function pushCanMovePos() {
	if(lastPlayer != 0) aMovePos[lastPlayer-1].splice(0);

	var bflag;

	for(var i = 0; i < pieces.length; i++) {
		if(bState[pieces[i].y][pieces[i].x] == tPlayer){
			lastPlayer = oPlayer;

			for(var n = 0; n < 5; n++) {
				for(var p = 0; p < 5; p++) {
					bflag = false;

					sx = ((4-p)-2)+pieces[i].x;			//移動先x
					sy = ((4-n)-2)+pieces[i].y;			//移動先y

					if(sx < 0 || sy < 0 || sx > 7 || sy > 7) {
						continue;
					}
					
					if(checkMoveDestination(pieces[i].y, pieces[i].x, p, n, i, true)) {
						for(var a = 0; a < aMovePos[lastPlayer-1].length; a++) {
							if(aMovePos[lastPlayer-1][a].x == sx && aMovePos[lastPlayer-1][a].y == sy) {
								bflag = true;
							}
						}
					
						if(!bflag) aMovePos[lastPlayer-1].push({x: sx, y: sy});		
					}

					bflag = false;

					for(var u = 0; u < canMovePos.length; u++) {
						bflag = false;

						if(checkMoveDestination(pieces[i].y, pieces[i].x, p, n, i, true)) {
							var cx = canMovePos[u].x;
							var cy = canMovePos[u].y;

							for(var a = 0; a < aMovePos[lastPlayer-1].length; a++) {
								if(aMovePos[lastPlayer-1][a].x == cx && aMovePos[lastPlayer-1][a].y == cy) {
									bflag = true;
								}
							}

							if(!bflag) aMovePos[lastPlayer-1].push({x: cx, y: cy});
						}
					}
				}
			}
		}
	}
}

function showMoveDestination() {
	var sx, sy, canMove;

	for(var i = 0; i < pieces.length; i++) {
		if(pieces[i].isSelected) {
			for(var n = 0; n < 5; n++) {
				for(var p = 0; p < 5; p++) {
					if(bState[pieces[i].y][pieces[i].x] == oPlayer) {
						sx = (p-2)+pieces[i].x;			//移動先x
						sy = (n-2)+pieces[i].y;			//移動先y
					} else if(bState[pieces[i].y][pieces[i].x] == tPlayer) {
						sx = ((4-p)-2)+pieces[i].x;			//移動先x
						sy = ((4-n)-2)+pieces[i].y;			//移動先y
					}

					if(sx < 0 || sy < 0 || sx > 7 || sy > 7) {
						continue;
					}
					
					if(checkMoveDestination(pieces[i].y, pieces[i].x, p, n, i) && bState[pieces[i].y][pieces[i].x] == nPlayer) {
						if(checkCantMovePos(sy, sx, pieces[i].x, pieces[i].y)) {
							canMove = true;

							g.strokeStyle = "#000000"
							if(board[sy][sx] != BOARD_NOTHING) {
								g.strokeStyle = "#ff0000";
							}

							if(canMove) g.strokeRect(sx*TILE, sy*TILE, TILE, TILE);		//移動先を塗る
						}
					}

					for(var u = 0; u < canMovePos.length; u++) {
						canMove = true;

						var cx = canMovePos[u].x;
						var cy = canMovePos[u].y;

						g.strokeStyle = "#000000"
						if(board[cy][cx] != BOARD_NOTHING) {
							g.strokeStyle = "#ff0000";
						}

						if(canMove) g.strokeRect(cx*TILE, cy*TILE, TILE, TILE);
					}
				}
			}
		}
	}
}

function paint() {
	g.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

	drawBoard();
	if(!gameStoped) drawCursor();
	drawPiece();
	if(gameStoped) drawSelectBox();
	showMoveDestination();
}

function mouseUpdate(e) {
	if(!isSelecting) {
		mouse.x = Math.floor(e.offsetX / TILE);
		mouse.y = Math.floor(e.offsetY / TILE);
	}

	dp.textContent = "x: "+mouse.x+", y: "+mouse.y;
}

function pieceSelect(_y, _x) {
	if(bState[_y][_x] != nPlayer) {
		return false;
	} 

	if(pieces[(_y*BOARD_SIZE)+_x].type != PIECE_CANT_MOVE) {	
		if(pieces[(_y*BOARD_SIZE)+_x].isMoved) {
			for(var i = 0; i < pieces.length; i++) {
				if(pieces[i].x == _x && pieces[i].y == _y && pieces[i].type != PIECE_CANT_MOVE) {
					pieces[i].isSelected = true;
				}
			}
		} else {
			pieces[(_y*BOARD_SIZE)+_x].isSelected = true;
		}
	} else {
		for(var i = 0; i < pieces.length; i++) {
			if(pieces[i].x == _x && pieces[i].y == _y && pieces[i].type != PIECE_CANT_MOVE) {
				pieces[i].isSelected = true;
			}
		}
	}

	if(isCheckMateO) {
		var idx = (_y*BOARD_SIZE)+_x;
		var sx, sy, lx, ly, pbState, canPush, isClicked;

		for(var i = 0; i < 5; i++) {
			for(var n = 0; n < 5; n++) {
				canPush = false;
				isClicked = false;

				if(bState[pieces[idx].y][pieces[idx].x] == oPlayer) {
					sx = (n-2)+pieces[idx].x;			//移動先x
					sy = (i-2)+pieces[idx].y;			//移動先y
				} else if(bState[pieces[idx].y][pieces[idx].x] == tPlayer) {
					sx = ((4-n)-2)+pieces[idx].x;			//移動先x
					sy = ((4-i)-2)+pieces[idx].y;			//移動先y
				}

				if(sx < 0 || sy < 0 || sx > 7 || sy > 7) {		//移動先が画面外だったら
					continue;
				}
				
				if(checkMoveDestination(pieces[idx].y, pieces[idx].x, n, i, idx)) {
					if(checkCantMovePos(sy, sx, pieces[idx].x, pieces[idx].y)) {
						lx = pieces[idx].x;
						ly = pieces[idx].y;

						pbState = temporaryMove(sx, sy, lx, ly);
						pushCanMovePos();

						if(checkIsCheckMate()) {
							canPush = true;
						} else {
							canPush = false;
						}

						board[sy][sx] = pbState[2];
						bState[sy][sx] = pbState[3];

						board[ly][lx] = pbState[0];
						bState[ly][lx] = pbState[1];

						for(var t = 0; t < cantMovePos.length; t++) {
							if(cantMovePos[t].x == sx && cantMovePos[t].y == sy) {
								canPush = false;
							}
						}

						if(canPush) {
							cantMovePos.push({x: sx, y: sy});
							isClicked = true;
						}
					}
				}

				if(!isClicked) {
					for(var u = 0; u < canMovePos.length; u++){
						var cx = canMovePos[u].x;
						var cy = canMovePos[u].y;
	
						canPush = false;
	
						lx = pieces[idx].x;
						ly = pieces[idx].y;
	
						pbState = temporaryMove(cx, cy, lx, ly);
						pushCanMovePos();
						
						board[cy][cx] = pbState[2];
						bState[cy][cx] = pbState[3];
	
						board[ly][lx] = pbState[0];
						bState[ly][lx] = pbState[1];
					
						if(checkIsCheckMate()) {
							canPush = true;
						} else {
							canPush = false;
						}
	
						for(var t = 0; t < cantMovePos.length; t++) {
							if(cantMovePos[t].x == cx && cantMovePos[t].y == cy) {
								canPush = false;
							}
						}
	
						if(checkMoveDestination(pieces[idx].y, pieces[idx].x, n, i, idx)) {
							if(canPush) cantMovePos.push({x: cx, y: cy});
						}
					}	
				}
			}
		}
	}

	return true;
}

function temporaryMove(_sx, _sy, _x, _y) {
	var pt = board[_y][_x];		//移動前のボードの状態を保存
	var bt = bState[_y][_x];
	var pvt = board[_sy][_sx];
	var bvt = bState[_sy][_sx];

	board[_y][_x] = 0;		//ボードの情報をきれいに
	bState[_y][_x] = 0;

	board[_sy][_sx] = pt;
	bState[_sy][_sx] = bt;
	
	return [pt, bt, pvt, bvt];
}

function mouseClick(e) {
	if(!gameStoped) {
		var sx, sy, canMove;

		for(var i = 0; i < pieces.length; i++) {
			var isc = [];

			if(pieces[i].isSelected) {
				isc.push(i);
			}

			if(pieces[i].x == mouse.x && pieces[i].y == mouse.y && pieces[i].type != PIECE_CANT_MOVE) {
	//			pt.textContent = "piece type: "+board[mouse.y][mouse.x]+", pieceismove: "+pieces[i].isMoved+" piecesx:" + pieces[i].x + "piecesy: " + pieces[i].y + " selected: " + isc+" isc: "+isc.length;
			}
		}

		if(bState[mouse.y][mouse.x] == nPlayer) {
			mouse.x = Math.floor(e.offsetX / TILE);
			mouse.y = Math.floor(e.offsetY / TILE);

			var isClicked = false;

			for(var i = 0; i < pieces.length; i++) {
				if(pieces[i].isSelected) {
					for(var n = 0; n < 5; n++) {
						for(var p = 0; p < 5; p++) {
							if(bState[pieces[i].y][pieces[i].x] == oPlayer) {
								sx = (p-2)+pieces[i].x;			//移動先x
								sy = (n-2)+pieces[i].y;			//移動先y
							} else if(bState[pieces[i].y][pieces[i].x] == tPlayer) {
								sx = ((4-p)-2)+pieces[i].x;			//移動先x
								sy = ((4-n)-2)+pieces[i].y;			//移動先y
							}

							if(sx < 0 || sy < 0 || sx > 7 || sy > 7) {		//移動先が画面外だったら
								continue;
							}

							canMove = true;
							isClicked = false;

							if(checkMoveDestination(pieces[i].y, pieces[i].x, p, n, i) && mouse.x == sx && mouse.y == sy && !isClicked) {
								if(checkCantMovePos(sy, sx, pieces[i].x, pieces[i].y)) {
									if(isCheckMateO || isCheckMateT) {
										for(var t = 0; t < cantMovePos.length; t++) {
											if(cantMovePos[t].x == sx && cantMovePos[t].y == sy) {
												canMove = false;
											}
										}
									}

									if(canMove) {
										pieces[i].Move(sx, sy);
										isClicked = true;
									}
								}
							}

							if(!isClicked) {
								for(var u = 0; u < canMovePos.length; u++) {
									sx = canMovePos[u].x;
									sy = canMovePos[u].y;

									if(isCheckMateO || isCheckMateT) {
										for(var t = 0; t < cantMovePos.length; t++) {
											if(cantMovePos[t].x == sx && cantMovePos[t].y == sy) {
												canMove = false;
											}
										}
									}

									if(checkMoveDestination(pieces[i].y, pieces[i].x, p, n, i) && mouse.x == sx && mouse.y == sy && !isClicked) {
										if(canMove) {
											pieces[i].Move(sx, sy);
											isClicked = true;
										}
									}
								}
							}
						}
					}
				}
			}
		}

		isSelecting = !isSelecting ? true : false;		//クリックしてたらしてない状態にして逆なら逆に

		if(isSelecting) {
			isSelecting = pieceSelect(mouse.y, mouse.x);	//もしクリックされたならクリックされた駒を選択状態にする
		} else {
			for(var i = 0; i < pieces.length; i++) {
				pieces[i].isSelected = false;		//クリックされている状態じゃないのですべての駒を選択していない状態にする
			}

			pushCanMovePos();
			cantMovePos.splice(0);
			canMovePos.splice(0);
		}
	} else {
		var pType = 0;
		var canBreak = false;

		if(mouse.x == 2 && mouse.y == 4) {pType = 2; canBreak = true;}
		if(mouse.x == 3 && mouse.y == 4) {pType = 3; canBreak = true;}
		if(mouse.x == 4 && mouse.y == 4) {pType = 4; canBreak = true;}
		if(mouse.x == 5 && mouse.y == 4) {pType = 5; canBreak = true;}

		if(canBreak) {
			board[ey][ex] = pType;
			gameStoped = false;
			g.lineWidth = 1;
		}
	}
}
