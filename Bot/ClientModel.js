
var ClientConstant = require('./ClientConstant');
var Bot = require('./Bot');
var Card = require("../Card");
// var MessageQueue = require('./MessageQueue');
// var Message = require('./Message');


function ClientModel(roomId){

    this._roomId = roomId;
    this._socket = undefined;
    this._bot = new Bot();
}

ClientModel.prototype.setSocket = function setSocket(sock)
{
	this._socket = sock;
}

ClientModel.prototype.initialize = function initialize()
{   

	/* request selected avatar by other players */

    var s = makeJSON(ClientConstant.REQUESTAVATARS_CODE,{"roomId":this._roomId});
    this._socket.send(s);


    /* request rules of the room */

    var rule = makeJSON(ClientConstant.BOTRULES_LIST, {"roomId":this._roomId});
    this._socket.send(rule);

}

ClientModel.prototype.parse = function parse(msg)
{
	var parsedJSON = JSON.parse(msg);
	var content = (parsedJSON.pop())["response"]

	var code = content["code"];
	var data = content["data"];

	switch(code)
	{
		case ClientConstant.BOTRULES_LIST:
			botRulesHandler(this, data);
		break;

		case ClientConstant.REQUESTAVATARS_CODE:
			requestAvatarHandler(this, data);
		break;

		case ClientConstant.LOBBYDETAILS_CODE:
			lobbyHandler(this, data);
		break;

		case ClientConstant.CARD_CODE:
			cardCodeHandler(this,data);
		break;

		case ClientConstant.MOVE_CODE:
			moveCodeHandler(this, data);
		break;

		case ClientConstant.TURN_CODE:
			turnCodeHandler(this, data);
		break;

		case ClientConstant.RULES_LIST:
			ruleListHandler(this, data);
		break;

		case ClientConstant.NEWROUND_CODE:
			newRoundHandler(this, data);
		break;

		case ClientConstant.DELETEDEALT_CODE:
			deleteCodeHandler(this, data)
		break

		case ClientConstant.PASSTURN_CODE:

			this.sendMsgSeq(3500);

		break;

		case ClientConstant.ROUNDWIN_CODE:
			
			this.sendMsgSeq(3500);

		break;
	}
}


function deleteCodeHandler(elem, data)
{
	var id = data["caller"]; 

	if(id == elem._bot.getUserId())
	{
		console.log("delete");
		elem.sendMsgSeq(1000);
	}
}


function newRoundHandler(elem,data)
{
	elem._bot.clearMoves();
	elem.sendMsgSeq(3500);
}


function ruleListHandler(elem, data)
{
	var rules = data["ruleId"]; 

	elem._bot.parseMoveRules(rules);

	elem.sendMsgSeq(3500);
}


function botRulesHandler(elem, data)
{
	elem._bot.addRoomRules(data["rules"])
}


function turnCodeHandler(elem, data)
{
	var prevTurnId = data["prevTurnId"];
	var turnId = data["userId"];


	if(prevTurnId && (prevTurnId == elem._bot.getUserId()))
	{
		elem.sendMsgSeq(0);
	}


	if(turnId && elem._bot.getUserId() == turnId)
	{

		setTimeout(function(){

			var turnCard = elem._bot.getTurnCards();

			if(turnCard != undefined)
			{
				var moveData = {"userId":elem._bot.getUserId(),"cards":turnCard};
				moveData = makeJSON(ClientConstant.MOVE_CODE, moveData);

				elem._socket.send(moveData);
			}
			else
			{
				var passTurnData = {"userId":elem._bot.getUserId()};
				passTurnData = makeJSON(ClientConstant.PASSTURN_CODE, passTurnData);

				elem._socket.send(passTurnData);
			}

		}, 5000)
	}

}


function moveCodeHandler(elem, data)
{
	var cards = parseCards(data);

	if(data["userId"] != elem._bot.getUserId())
	{
		elem._bot.addMoveCard(cards);
	}
	else
	{
		elem._bot.removeCards(cards);
		elem.sendMsgSeq(0);
	}
}


function cardCodeHandler(elem, data)
{
	var cards = parseCards(data);
	elem._bot.addCards(cards);
}

function parseCards(data)
{
	var cards = data["cards"];
	var temp = [];

	for(var i = 0; i < cards.length; i++)
	{
		var suit = cards[i]["_suit"];
		var kind = cards[i]["_kind"];

		temp.push(new Card(suit,kind));
	}

	return temp;
}

function requestAvatarHandler(elem, data)
{
	elem._bot.setPhotoId(data);

	var joinData = {"roomId":elem._roomId,"avatarId":elem._bot.getPhotoId()}
	joinData = makeJSON(ClientConstant.JOINGAME_CODE,joinData);

	elem._socket.send(joinData);
}

function lobbyHandler(elem, data)
{
	elem._bot.setUserId(data["userId"]);

	var greetData = {"userId":elem._bot.getUserId()};
	greetData = makeJSON(ClientConstant.GREET_CODE, greetData);

	elem._socket.send(greetData);
}

function makeJSON(code, data)
{
    var data1 = {"code":code,"data":data};
    return JSON.stringify(data1);
}


ClientModel.prototype.sendMsgSeq = function sendMsgSeq(time)
{
	var _this = this;

	setTimeout(function()
	{
		var content = {"userId":_this._bot.getUserId()}
		var data = makeJSON(ClientConstant.MESSAGESEQ_CODE,content);

		_this._socket.send(data); 
	},time);

}

module.exports = ClientModel;
