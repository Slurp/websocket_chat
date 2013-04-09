/**
* WebsocketChatClient
* =========================== 
* 
* uses socket.io
* 
* @author Stephan Langeweg
*/

// debug macro
var debug = true;
window.log=function(){if(this.console && debug == true){console.log(Array.prototype.slice.call(arguments));}};
jQuery.fn.log=function (msg){console.log("%s: %o", msg,this);return this;};



!function ($) {
	"use strict"; // jshint ;_;
	
	
	
  
  
  /**
   * Class for a websocket chat client
   */
  var socket;
  
  var WebsocketChatClient = function(elem, options){
      this.elem = elem;
      this.$elem = $(elem);
      this.options = $.extend({}, $.fn.websocketChatClient.defaults, options);
      
      //internal vars
      this.socket;
      this.host = "http://wschat.zwartschaap.net:3000";
      this.messageBox = this.$elem.find('#msg');
      this.chatBox = this.$elem.find('#msgs');
      this.userName = this.$elem.find('#username');
      this.form = this.$elem.find('form#chat');
      this.userList = this.$elem.find('#chat-clients ul');
      this.debug = true;
      
  }
  
  WebsocketChatClient.prototype = {
          
           constructor: WebsocketChatClient
           
        ,    init: function() {
                log('init');
                //start up socket io
                try{
                    this.socket = io.connect(this.host);
                    socket = this.socket;                    
                    this.socket.on('connect', function(){
                    	log('connected');                		
                	});        
                    
                    this.socket.on('getUserName', $.proxy(function() {
                    	this.getUsername();               		
                    },this));
                    
                    //pushed msg from server
                    this.socket.on('msg', $.proxy(function(data) {
                    	if(data !== null) {
	                    	if(typeof data == "object")
	                    	{
	                    		 this.displayMessage(data);
	                    	} else {
	                    		 this.displayMessage(JSON.parse(data));
	                    	}
                    	}  
                    },this));
      
                    this.socket.on('init', $.proxy(function(data) {
                    	this.displayMessage({'username':'Server', 'message' :'Last 5 messages'});
                    	for(var message in data) {
                    		this.displayMessage(JSON.parse(data[message]),true);  
                    	}
                    },this));
                   
                    
                	// listener, whenever the server emits 'updaterooms', this updates the room the client is in
                    this.socket.on('updaterooms',$.proxy(function(rooms, current_room, clients){
                    	this.updateRooms(rooms, current_room, clients)
                    },this));
                    
                    this.socket.on('userIsTyping',$.proxy(function(client){
                    	this.notifyTyping(client,true)
                    },this));
                    
                    //user updates
                    this.socket.on('updateusers',$.proxy(function(data){
                    	if(data.event == 'disconnected' 
                        || data.event == 'leftRoom') {
                    		this.deleteUserFromChatList(data.client);
                    	} 
                    	if(data.event == "joinedRoom") {
                    		this.addClient(data.client, false);
                    	}
                    		
                    },this));
                    
                    this.socket.on('userStoppedTyping',$.proxy(function(client){
                    	this.notifyTyping(client,false)
                    },this));
                    
                   
                                     
                } catch(exception){
                	log(exception);
                	this.displayMessage({'username':'Error', 'message' :exception});
                	
                }
             
                this.messageBox.keypress($.proxy(function(event) {
                    if(event.keyCode != 13) { 
                    	this.typing(); 
                    }
                },this));
                
                this.form.on('submit',$.proxy(function(event) {
                		event.stopPropagation();
                		this.sendMessage();
                		return false;
                },this));
               
                return this;
            }
        // appends a message to chat window
  		, getUsername : function() {
  			log('getUserName');
    		// call the server-side function 'adduser' and send one parameter (value of prompt)
        	if(this.userName.val() == "") {
        		//@todo replace prompt with nicer function
        		this.userName.val(prompt("What's your name?")).attr("readonly", "readonly"); ;
        	}
    		this.socket.emit('adduser',this.userName.val()); 
  		}
  
        , displayMessage: function(msg,isHistory = false) {    	
        	if(typeof msg != "object")
        	{
        		console.log(msg);
        		msg = JSON.parse(msg);
        	} 
        	 this.chatBox.append(function() {
                 var div = $('<div class="row-fluid"></div>');
                 if(true == isHistory) {
                	 div.addClass('muted');
                 }
                 div.html('<b>' + msg.username + ':</b> ' + msg.message);               
                 return div;
             });
        	 this.chatBox[0].scrollTop =  this.chatBox[0].scrollHeight;
    		
	    }
        
        //sends a notify that current user is typing
        , typing: function() {
        	 if(this.messageBox.val()) {
            	 this.socket.emit('userTyping', true);
             } else {
            	 this.socket.emit('userTyping', false);
             }
        }
        , notifyTyping: function(client,isTyping) {
        	var userEntry = this.userList.find('[data-clientid='+client.id+']');
        	log(userEntry);
        	if(userEntry != undefined) {
        		if(isTyping) {
        			userEntry.find('.composing').text('typing...').addClass('muted');
        		} else {
        			userEntry.find('.composing').text('').removeClass('muted');
        		}
        	}
        }
        
        , deleteUserFromChatList: function(client) {
        	var userEntry = this.userList.find('[data-clientid='+client.id+']');
        	userEntry.fadeOut(100).remove();
        }
        //sends a message to the server
        , sendMessage: function() {
        	//get the message            
            if(this.messageBox.val()) {
            	var message = {message:this.messageBox.val()};
            	//clear message
            	this.messageBox.val("");  
            	this.socket.emit('msg', JSON.stringify(message));
            } else {
            	shake('form', this.messageBox, 'wobble', 'yellow');
            }
        }
       
       // update the room 
        , updateRooms: function(rooms, current_room, clients) {
        	log(clients);
        	$('#rooms').empty();                  
        	$.each(rooms, function(key, value) {
        		if(value == current_room){
        			$('#rooms').append(' <li class="active"><a href="#" tabindex="-1" role="menuitem">'+ value + '</a></li>');
        		}
        		else {
        			$('#rooms').append(' <li><a href="#" tabindex="-1" role="menuitem" id="'+ value + '">'+ value + '</a></li>');                    		
        			$('#rooms #'+ value).on('click',function(event) { 
        				event.stopPropagation();
        				socket.emit('switchRoom', this.text);
        				return false;
        			});
        		}
        	});
        	
        	// if current user isn't the only one in the room
        	this.userList.clear();
        	if(clients != undefined) {
        		for(var i = 0, len = clients.length; i < len; i++){
        			if(clients[i]){
        				this.addClient(clients[i], false);
        			}
				}
        	}
        }
        
        // add a client to the clients list
        , addClient: function(client){
        	log(client)
        	//$html.appendTo('.chat-clients ul')
        	var html = '<li data-clientId="'+client.id+'" class="cf">'+
						'<a class="clientName"><i class="icon-user"></i>'+client.username+'</a>'+
						'<span class="composing"></span>'+
					   '</li>'
					
			this.userList.append(html);
        }
        
      
  		//disconnect from the chat server
        , disconnect: function() {
        
        	$('#disconnect').on('click', this.socket.disconnect());
        	
        }
        
  }
        
  /**
   * WebsocketChatClient plugin definition
   * =========================== 
   */
   $.fn.websocketChatClient = function (option) {
         
   
     return this.each(function() {
      
         var $this = $(this)
         , data = $this.data('websocketChatClient')
         , options = typeof option == 'object' && option
        
       if (!data) $this.data('websocketChatClient', (data = new WebsocketChatClient(this, options)))
       
        if (typeof option == 'string') data[option]()
        if (typeof option == 'object') data['init']()
     });
   };

   $.fn.websocketChatClient.defaults = {
       toggleMessage: '<a href="#" id="toggleMessages"></a>'
      , messageContainer: '<div class="row-fluid"></div>'
      , closeButton: '<button class="close" data-dismiss="alert">x</button>'
      , now : new Date()
     }
   
   $.fn.websocketChatClient.Constructor = WebsocketChatClient
  
   $(window).on('load', function () {
	   if(!("WebSocket" in window)){
		      $('[data-chat="init"]').fadeOut("fast");
		      $('<p>Oh no, you need a browser that supports WebSockets. How about <a href="http://www.google.com/chrome">Google Chrome</a>?</p>').appendTo('.container-fluid');
		}else{
	         $('[data-chat="init"]').each(function () {
	           var $chatClient = $(this)
	             , data = $chatClient.data()    
	             //console.log(data);
	           $chatClient.websocketChatClient(data);
	         })
		}
     })  
}(window.jQuery);