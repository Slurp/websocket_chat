/**
* A node.js powered websocket chat server.
* 
* run node chatserver.js for standalone
*/

var DEBUG = 1;
var PORT = 3000; //the port used for the server
var INIT_MESSAGES = 5; //number of messages stored for a client_id

//io sockets server
var io = require('socket.io').listen(PORT);

//sets the log level of socket.io, with
//log level 2 we wont see all the heartbits
//of each socket but only the handshakes and
//disconnections
io.set('log level', 2);


//usernames which are currently connected to the chat
var usernames = {};

//list for external use.
chatClients = new Object();

// rooms which are currently available in chat
var rooms = ['default','room2','room3'];

//create 2d array for room message storage
var messages = new Array;

for (var i = 0; i < rooms.length; i++) {
	console.log("room: " +  rooms[i]);
	messages[rooms[i]] = new Array;
}
//Listen to connections
io.sockets.on('connection', function(client) {

    if (DEBUG) {
        console.log("New Connection: "+ client.id);
    }
    client.emit("getUserName");
  
    client.emit('updaterooms', rooms,'');
    //broadcast a message
    client.on('msg', function(msg) {
        if (DEBUG) {
            console.log("Message: " + msg);            
        }
        //save message in array
        var msg = JSON.parse(msg);        
        if ( messages[client.room].length >= INIT_MESSAGES) {
        	messages[client.room].shift();
        }
       
        messages[client.room][messages[client.room].length] = JSON.stringify({username:client.username , message:msg.message});
        io.sockets.in(client.room).emit('msg', JSON.stringify({username: client.username , message:msg.message}));
   
        //user stopped typing (he just send a message)
        client.broadcast.to(client.room).emit('userStoppedTyping',chatClients[client.id]);
    });
    
    client.on('userTyping', function(isTyping) {    	
    	if (DEBUG) console.log("Client: " + chatClients[client.id] + " is "); 
    	if(isTyping) {
    		if (DEBUG) console.log("Typing");      
    		client.broadcast.to(client.room).emit('userIsTyping',chatClients[client.id]);
    	} else {
    		if (DEBUG) console.log("Stopped");      
    		client.broadcast.to(client.room).emit('userStoppedTyping',chatClients[client.id]);
    	}
    });
    
	
    client.on('adduser', function(username){
    
    	// Store session info for current client
    	if (DEBUG) {
            console.log("Adduser: " + username);
        }
    	client.username = username;
    	
	    // add the client's username to the global list
    	client[username] = username; 
    	
    	
    	chatClients[client.id] = {username: client.username, id: client.id};
    	enterRoom(client,false);
    });
    
    client.on('switchRoom', function(newroom){
		
    	if (DEBUG) {
            console.log("switchRoom old room: " + client.room);
            console.log("switchRoom new room: " + newroom);
        }
    	enterRoom(client,newroom);
		
	});
	
   

    client.on('disconnect', function() {
    	if (DEBUG) {
              console.log("Disconnected: ", client.id);
    	}
    	client.broadcast.emit('msg',{ username: 'SERVER' , message :client.username + ' has disconnected'});
    	// remove the username from global usernames list
    	delete usernames[client.username];
    	io.sockets.emit('updateusers', {event: 'disconnected', client : chatClients[client.id]}); 
    	delete chatClients[client.id];
    	// update list of users in chat, client-side
    	   
    	client.leave(client.room);
      
    });
});

function enterRoom(client,newRoom) {
	
	// sent message to OLD room
	if(newRoom !=false) {
		client.broadcast.to(client.room).emit('msg',{ username: 'SERVER' , message : client.username+' has left this room' });
		client.broadcast.to(client.room).emit('updateusers', {event: 'leftRoom', client : chatClients[client.id]}); 
		//leave current room
		client.leave(client.room);
	} else {
		newRoom = "default";
	}
	client.join(newRoom);
	// update socket session room title
	client.room = newRoom;		
	client.emit('msg',{ username: 'SERVER' , message :'you have connected to the room:'+ newRoom });
	client.broadcast.to(newRoom).emit('msg',{ username: 'SERVER' , message : client.username+' has joined this room' });
	client.emit('updaterooms', rooms, client.room, getClientsInRoom(client.id, client.room));
	client.broadcast.to(client.room).emit('updateusers', {event: 'joinedRoom', client : chatClients[client.id]}); 
	//send stored messages
    //
	if(messages[client.room].length > 0) {
		console.log("room: " +  messages[ client.room][i]);
		client.emit('init',messages[client.room]);		
	}		
}

//get array of clients in a room
function getClientsInRoom(socketId, room){
	// get array of socket ids in this room
	var socketIds = io.sockets.manager.rooms['/' + room];
	var clients = [];
	
	if(socketIds && socketIds.length > 0){
		socketsCount = socketIds.lenght;
		
		// push every client to the result array
		for(var i = 0, len = socketIds.length; i < len; i++){
			
			// check if the socket is not the requesting
			// socket
			if(socketIds[i] != socketId){
				clients.push(chatClients[socketIds[i]]);
			}
		}
	}
	if (DEBUG) {
        console.log("clients: ", clients);
	}
	return clients;
}

//get the amount of clients in aroom
function countClientsInRoom(room) {
	// 'io.sockets.manager.rooms' is an object that holds
	// the active room names as a key and an array of
	// all subscribed client socket ids
	if(io.sockets.manager.rooms['/' + room]){
		return io.sockets.manager.rooms['/' + room].length;
	}
	return 0;
}