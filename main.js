class Piece {
	constructor(_x, _y) {
		this.x = _x;
		this.y = _y;

		this.isMoved = false;
		this.isSelected = false;
	}

	Move(_sx, _sy) {
		board[_sy][_sx] = board[this.y][this.x];
		bState[_sy][_sx] = bState[this.y][this.x];

		board[this.y][this.x] = 0;
		bState[this.y][this.x] = 0;

		this.x = _sx;
		this.y = _sy;

		this.isMoved = true;
		this.isSelected = false;

		nowPlayer = (nowPlayer%2)+1;
	}
}

const TILE_SIZE = 45;
const TILE_NUM = 8;
const PIECE_SIZE = 15;
const PIECE_NUM = 6;
const CANVAS_SIZE = TILE_SIZE*TILE_NUM;

const canvas = document.getElementById("canvas");
const g = canvas.getContext("2d");

var board = [
	[3, 2, 4, 5, 6, 4, 2, 3],
	[1, 1, 1, 1, 1, 1, 1, 1],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 5, 5, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[1, 1, 1, 0, 0, 1, 1, 1],
	[3, 2, 4, 0, 6, 4, 0, 3],		//1:歩兵 2:飛車 3:啓馬 4:格 5:クイーン 6:王
]

var bState = [
	[2, 2, 2, 2, 2, 2, 2, 2],
	[2, 2, 2, 2, 2, 2, 2, 2],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 2, 2, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[1, 1, 1, 0, 0, 1, 1, 1],
	[1, 1, 1, 0, 1, 1, 0, 1]
];

const pMoves = [
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

const bColors = [
	"#C8C8C8", "#64C8C8"
]

var pieces = [];
var secondPlayer = 2;
var firstPlayer = 1;
var nowPlayer = firstPlayer;

var isCheckMateFP = false;
var isCheckMateSP = false;	//駒がとられるか
var isRealCheckMateFP = false;
var isRealCheckMateSP = false;	//駒がとられるし守ることもできないか

var isGameStop = false;

var enemyCanMovePos = [
	[],
	[]
];

var pImg = new Image();
pImg.src = "chess.png";

var mousePos = {
	x: 0,
	y: 0
};

function temporaryMove(_x, _y, _sx, _sy, _i) {
	var pieceState = board[_y][_x];
	var boardState = bState[_y][_x];

	var pieceDState = board[_sy][_sx];
	var boardDState = bState[_sy][_sx];

	pieces[_i].x = _sx;
	pieces[_i].y = _sy;

	board[_sy][_sx] = board[_y][_x];
	bState[_sy][_sx] = bState[_y][_x];

	board[_y][_x] = 0;
	bState[_y][_x] = 0;

	esp[0] = MovePosCheck(processType.AddECanMovePos, true, secondPlayer);
	esp[1] = MovePosCheck(processType.AddECanMovePos, true, firstPlayer);

	return [pieceState, boardState, pieceDState, boardDState];
}

var esp = [
	[],
	[]
];

function realMove(_x, _y, _sx, _sy, _i, _t) {
	var cMove = true;

	var pbState = temporaryMove(_x, _y, _sx, _sy, _i);

	if(checkIsCantMovePos(nowPlayer, esp)) {
		cMove = false;
	}

	board[_y][_x] = pbState[0];
	bState[_y][_x] = pbState[1];

	board[_sy][_sx] = pbState[2];
	bState[_sy][_sx] = pbState[3];

	pieces[_i].x = _x;
	pieces[_i].y = _y;

	return cMove;
}

var processType = {
	PieceMove: function(_sx, _sy, _i, _n, _p) {	//駒を移動
		var checkCanMoveFlag = checkCanMove(pieces[_i].x, pieces[_i].y, _sx, _sy, _n, _p, _i);

		if(pieces[_i].cantMove) {
			return true;
		}

		if(checkCanMoveFlag[0] && mousePos.x == _sx && mousePos.y == _sy && realMove(pieces[_i].x, pieces[_i].y, _sx, _sy, _i, true)) {
			pieces[_i].Move(_sx, _sy);
			return false;
		}

		if(checkCanMoveFlag[1] != undefined) {
			for(var i = 0; i < checkCanMoveFlag[1].length; i++) {
				_sy = checkCanMoveFlag[1][i].y;
				_sx = checkCanMoveFlag[1][i].x;

				if(mousePos.x == _sx && mousePos.y == _sy && realMove(pieces[_i].x, pieces[_i].y, _sx, _sy, _i, true)) {
					pieces[_i].Move(_sx, _sy);
					return false;	
				}
			}
		}
	}, 
	DrawMDestination: function(_sx, _sy, _i, _n, _p) {	//移動先の描画
		var checkCanMoveFlag = checkCanMove(pieces[_i].x, pieces[_i].y, _sx, _sy, _n, _p, _i);

		if(checkCanMoveFlag[0]) {
			g.strokeStyle = "#000000";
			if(bState[_sy][_sx] == (nowPlayer%2)+1) {
				g.strokeStyle = "#ff0000";
			}

			if(realMove(pieces[_i].x, pieces[_i].y, _sx, _sy, _i)) g.strokeRect(_sx*TILE_SIZE, _sy*TILE_SIZE, TILE_SIZE, TILE_SIZE);

			if(checkCanMoveFlag[1] != undefined) {
				for(var i = 0; i < checkCanMoveFlag[1].length; i++) {
					_sx = checkCanMoveFlag[1][i].x;
					_sy = checkCanMoveFlag[1][i].y;

					g.strokeStyle = "#000000";
					if(bState[_sy][_sx] == (nowPlayer%2)+1) {
						g.strokeStyle = "#ff0000";
					}

					if(realMove(pieces[_i].x, pieces[_i].y, _sx, _sy, _i)) g.strokeRect(_sx*TILE_SIZE, _sy*TILE_SIZE, TILE_SIZE, TILE_SIZE);
				}
			}
		}
	},
	AddECanMovePos: function(_sx, _sy, _i, _n, _p, _et) {	
		if(bState[pieces[_i].y][pieces[_i].x] == _et) {
			var checkCanMoveFlag = checkCanMove(pieces[_i].x, pieces[_i].y, _sx, _sy, _n, _p, _i, (_et%2)+1, _et);
			var ECanMovePos = [];
	
			if(checkCanMoveFlag[0]) {
				ECanMovePos.push({x: _sx, y: _sy});
	
				if(checkCanMoveFlag[1] != undefined) {
					for(var i = 0; i < checkCanMoveFlag[1].length; i++) {
						var bflag = false;

						_sx = checkCanMoveFlag[1][i].x;
						_sy = checkCanMoveFlag[1][i].y;
	
						for(var n = 0; n < ECanMovePos.length; n++) {
							if(_sx == ECanMovePos[n].x && _sy == ECanMovePos[n].y) {
								bflag = true;
							}
						}

						if(!bflag) ECanMovePos.push({x: _sx, y: _sy});
					}
				}
			}
	
			return ECanMovePos;			
		}

		return undefined;
	}, 
	CheckCanMovePos: function(_sx, _sy, _i, _n, _p, _et) {
		if(bState[pieces[_i].y][pieces[_i].x] == _et) {
			var checkCanMoveFlag = checkCanMove(pieces[_i].x, pieces[_i].y, _sx, _sy, _n, _p, _i, (_et%2)+1, _et);

			if(pieces[_i].cantMove) {
				return true;
			}

			if(checkCanMoveFlag[0]) {
				
			}

			if(checkCanMoveFlag[1] != undefined) {
				for(var i = 0; i < checkCanMoveFlag[1].length; i++) {
					_sy = checkCanMoveFlag[1][i].y;
					_sx = checkCanMoveFlag[1][i].x;

					if(mousePos.x == _sx && mousePos.y == _sy && realMove(pieces[_i].x, pieces[_i].y, _sx, _sy, _i, true)) {
						pieces[_i].Move(_sx, _sy);
						return false;	
					}
				}
			}
		}
	}
}

var nowClicking = false;

var dp = document.getElementById("mousepos");
var bst = document.getElementById("bstate")
var bpt = document.getElementById("board");

function checkIsCantMovePos(_p, _e, _t) {
	var isCheckMate = false;

	for(var i = 0; i < pieces.length; i++) {
		if(board[pieces[i].y][pieces[i].x] == 6 && bState[pieces[i].y][pieces[i].x] == _p) {
			var e = _e[_p-1];
			var dx, dy;

			for(var n = 0; n < e.length; n++) {
				dx = e[n].x;
				dy = e[n].y;

				if(pieces[i].y == dy && pieces[i].x == dx) {
					isCheckMate = true;
				}
			}
		}
	}

	return isCheckMate;
}


function Update() {
	if(isRealCheckMateFP || isRealCheckMateSP) {
		isGameStop = true;
	}

//	bst.innerText = bState[0]+"\n"+bState[1]+"\n"+bState[2]+"\n"+bState[3]+"\n"+bState[4]+"\n"+bState[5]+"\n"+bState[6]+"\n"+bState[7];
bst.innerText = isGameStop;
	bpt.innerText = board[0]+"\n"+board[1]+"\n"+board[2]+"\n"+board[3]+"\n"+board[4]+"\n"+board[5]+"\n"+board[6]+"\n"+board[7];
}

function drawPieces() {
	for(var i = 0; i < TILE_NUM; i++) {
		for(var n = 0; n < TILE_NUM; n++) {
			if(board[i][n] != 0) {
				g.drawImage(pImg, ((board[i][n]-1)*PIECE_SIZE)+((PIECE_SIZE*PIECE_NUM)*(bState[i][n]-1)), 0, PIECE_SIZE, PIECE_SIZE, n*TILE_SIZE, i*TILE_SIZE, TILE_SIZE, TILE_SIZE);
			}
		}
	}
}

function drawBoard() {
	for(var i = 0; i < TILE_NUM; i++) {
		for(var n = 0; n < TILE_NUM; n++) {
			g.fillStyle = bColors[(n+i)%2];

			if(board[i][n] == 6) {
				if(isCheckMateFP) {
					if(bState[i][n] == firstPlayer) {
						g.fillStyle = "red";
					}
				}

				if(isCheckMateSP) {
					if(bState[i][n] == secondPlayer) {
						g.fillStyle = "red";
					}
				}
			}

			g.fillRect(n*TILE_SIZE, i*TILE_SIZE, TILE_SIZE, TILE_SIZE);
		}
	}
}

function drawCursor() {
	g.fillStyle = "yellow";
	g.fillRect(mousePos.x*TILE_SIZE, mousePos.y*TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

function MovePosCheck(_pt, _f, _idx) {
	var e = [];

	for(var i = 0; i < pieces.length; i++) {
		if(pieces[i].isSelected || _f) {
			for(var n = 0; n < 5; n++) {
				for(var p = 0; p < 5; p++) {
					if(nowPlayer == firstPlayer) {
						sx = (p-2)+pieces[i].x;
						sy = (n-2)+pieces[i].y;
					} else {
						sx = ((4-p)-2)+pieces[i].x;
						sy = ((4-n)-2)+pieces[i].y;
					}

					if(_idx != undefined) {				//チェックメイト用　　いつかスマートにしたい
						if(_idx == firstPlayer) {
							sx = (p-2)+pieces[i].x;
							sy = (n-2)+pieces[i].y;
						} else {
							sx = ((4-p)-2)+pieces[i].x;
							sy = ((4-n)-2)+pieces[i].y;
						}
					}

					if(sx < 0 || sx > 7 || sy < 0 || sy > 7) {
						continue;
					}

					var pe = _pt(sx, sy, i, n, p, _idx);
					if(pe != undefined) e.push(pe);
				}
			}
		}
	}

	var pos = [];
	for(var i = 0; i < e.length; i++) {
		for(var n = 0; n < e[i].length; n++) {
			pos.push(e[i][n]);
		}
	}

	if(pos != undefined) return pos;
}

function checkIsCheckMate(_p, _e, _np) {
	var fCanPos = enemyCanMovePos;
	var player, enemy;

	var delIdx = []

	for(var i = 0; i < fCanPos[_p].length; i++) {
		player = fCanPos[_p][i];

		for(var n = 0; n < fCanPos[_e].length; n++) {
			enemy = fCanPos[_e][n];

			if(player.x == enemy.x && player.y == enemy.y) {
				delIdx.push(n);
			}
		}
	}

	for(var i = 0; i < delIdx.length; i++) {
		fCanPos[_e].splice(delIdx[i], 1);
	}

	MovePosCheck(processType.CheckCanMovePos, true, _e+1);

	console.log(fCanPos)

	return checkIsCantMovePos(_np, fCanPos);
}

function drawMoveDestination() {
	MovePosCheck(processType.DrawMDestination);
}

function Paint() {
	g.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

	drawBoard();
	drawCursor();
	drawMoveDestination();
	drawPieces();
}

function loop() {
	Update();
	Paint();

	requestAnimationFrame(loop);
}

window.onload = function(e) {
	canvas.width = CANVAS_SIZE;
	canvas.height = CANVAS_SIZE;

	g.imageSmoothingEnabled = false;

	for(var i = 0; i < TILE_NUM; i++) {
		for(var n = 0; n < TILE_NUM; n++) {
			if(board[i][n] != 0) {
				pieces.push(new Piece(n, i));
			}
		}
	}

	enemyCanMovePos[0] = MovePosCheck(processType.AddECanMovePos, true, secondPlayer);
	enemyCanMovePos[1] = MovePosCheck(processType.AddECanMovePos, true, firstPlayer);

	isCheckMateFP = checkIsCantMovePos(firstPlayer, enemyCanMovePos);
	isCheckMateSP = checkIsCantMovePos(secondPlayer, enemyCanMovePos);

	isRealCheckMateFP = checkIsCheckMate(secondPlayer-1, firstPlayer-1, firstPlayer);
	isRealCheckMateSP = checkIsCheckMate(firstPlayer-1, secondPlayer-1, secondPlayer);

	loop();
}

canvas.onmousemove = function(e) {
	if(!nowClicking) {
		mousePos.x = Math.floor(e.offsetX / TILE_SIZE);
		mousePos.y = Math.floor(e.offsetY / TILE_SIZE);

		dp.innerText = "mousepos x: " + mousePos.x + ", y: " + mousePos.y;
	}
}

function checkCanMove(_x, _y, _sx, _sy, _i, _n, _idx, _e, _p) {		//x, y ピースの座標		sx, sy ピースの移動先	i, n pMovesをチェックする	idx ピースのインデックス	e, p　誰が敵か
	if(board[_y][_x]-1 < 0) {
		return false;
	}

	var enemy = (nowPlayer%2)+1;
	var player = nowPlayer;
	if(_e != undefined && _p != undefined) {
		enemy = _e;
		player = _p;
	}

	var clickedPos = pMoves[board[_y][_x]-1][_i][_n];
	var canMove = false;
	var canMovePos = [];

	if(clickedPos != 0 && clickedPos != 9 && clickedPos != 5) {
		canMove = true;

		if(bState[_sy][_sx] == player) {
			canMove = false;
		}

		if(clickedPos == 2 && (pieces[_idx].isMoved || bState[_sy][_sx] == enemy)) {
			canMove = false;
		}

		if(bState[_sy][_sx] == enemy) {
			if(clickedPos == 4) { 
				canMove = false;
			} else if(clickedPos == 3) {
				canMove = true;
			}
		} else {
			if(clickedPos == 3) {
				canMove = false;
			}
		}

		if(clickedPos == 7) {
			var dx = _n-2;
			var dy = _i-2;

			var vx = pieces[_idx].x;
			var vy = pieces[_idx].y;

			if(bState[_y][_x] == secondPlayer) {
				dx = (4-_n)-2;
				dy = (4-_i)-2;
			}

			var isEnemy = false;

			for(var t = 0; t < TILE_SIZE; t++) {
				if(isEnemy) {
					break;
				}

				vx+=dx;
				vy+=dy;

				if(vx < 0 || vx > 7 || vy < 0 || vy > 7) {
					break;
				}

				if(board[vy][vx] == 0) {
					canMovePos.push({x: vx, y: vy});
				} else {
					if(bState[vy][vx] == enemy) {
						canMovePos.push({x: vx, y: vy});
						isEnemy = true;
					} else { 
						break;
					}
				}
			}
		}
	}

	return [canMove, canMovePos];
}

canvas.onmousedown = function(e) {
	mousePos.x = Math.floor(e.offsetX / TILE_SIZE);
	mousePos.y = Math.floor(e.offsetY / TILE_SIZE);

	if(!nowClicking) {
		for(var i = 0; i < pieces.length; i++) {
			if(pieces[i].x == mousePos.x && pieces[i].y == mousePos.y && bState[mousePos.y][mousePos.x] == nowPlayer) {
				nowClicking = true;
				pieces[i].isSelected = true;
			}
		}
	} else {
		MovePosCheck(processType.PieceMove);

		for(var i = 0; i < pieces.length; i++) {
			if(pieces[i].isSelected) pieces[i].isSelected = false;
		}

		nowClicking = false;
	}	

	enemyCanMovePos[0] = MovePosCheck(processType.AddECanMovePos, true, secondPlayer);
	enemyCanMovePos[1] = MovePosCheck(processType.AddECanMovePos, true, firstPlayer);

	isCheckMateFP = checkIsCantMovePos(firstPlayer, enemyCanMovePos);
	isCheckMateSP = checkIsCantMovePos(secondPlayer, enemyCanMovePos);

	isRealCheckMateFP = checkIsCheckMate(secondPlayer-1, firstPlayer-1, firstPlayer);
	isRealCheckMateSP = checkIsCheckMate(firstPlayer-1, secondPlayer-1, secondPlayer);
}
