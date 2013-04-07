/**
* A node.js powered websocket chat server.
* 
* run node chatserver.js for standalone
*/
var DEBUG = true;
var PORT = 3000; //the port used for the server
var INIT_MESSAGES = 5; //number of messages stored for a client_id

//io sockets server
var io = require('socket.io').listen(PORT);

var messages = [];

/**
 * Add a message to the array with a max of INIT_MESSAGES
 */
Array.prototype.inject = function(element) {

    if (this.length >= INIT_MESSAGES) {
        this.shift();
    }
    this.push(element);
}

//usernames which are currently connected to the chat
var usernames = {};

// rooms which are currently available in chat
var rooms = ['default','room2','room3'];


//Listen to connections
io.sockets.on('connection', function(client) {

    if (DEBUG) {
        console.log("New Connection: ", client.id);
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
        messages[client.room].inject(msg);
        client.to(client.room).emit('msg', {username: client.username , message:msg.message});
    });
    
	
    client.on('adduser', function(username){
    
    	// Store session info for current client
    	//if (DEBUG) {
            console.log("Adduser user name: " + username);
        //}
    	client.username = username;
    	
	    // add the client's username to the global list
    	client[username] = username;
	    client.room = "default";
	    client.join(client.room);
    	
	    //Send info to the client
    	client.emit('msg',{username: 'SERVER' , message :' you have connected to the default room'});
    	client.broadcast.to(client.room).emit('msg',{ username: 'SERVER' , message :client.username + ' has connected to this room' });
    	client.emit('updaterooms', rooms, client.room);
    	
    	//send stored messages
	    //
    });
    
    client.on('switchRoom', function(newroom){
		
    	if (DEBUG) {
            console.log("switchRoom old room: " + client.room);
            console.log("switchRoom new room: " + newroom);
        }
		// sent message to OLD room
		client.broadcast.to(client.room).emit('msg',{ username: 'SERVER' , message : client.username+' has left this room' });
		
		//Switch rooms
		client.leave(client.room);
    	client.join(newroom);
		// update socket session room title
		client.room = newroom;		
		client.emit('msg',{ username: 'SERVER' , message :'you have connected to '+ newroom });
		client.broadcast.to(newroom).emit('msg',{ username: 'SERVER' , message : client.username+' has joined this room' });
		client.emit('updaterooms', rooms, client.room);
	});
	
   

    client.on('disconnect', function() {
    	if (DEBUG) {
              console.log("Disconnected: ", client.id);
    	}
    	client.broadcast.emit('msg',{ username: 'SERVER' , message :client.username + ' has disconnected'});
    	// remove the username from global usernames list
    	delete usernames[client.username];
    	// update list of users in chat, client-side
    	io.sockets.emit('updateusers', usernames);    
    	client.leave(client.room);
      
    });
});