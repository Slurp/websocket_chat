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
                    	log('getUserName');
                		// call the server-side function 'adduser' and send one parameter (value of prompt)
                    	if(this.userName.val() == "") {
                    		//@todo replace prompt with nicer function
                    		this.userName.val(prompt("What's your name?")).attr("disabled", "disabled"); ;
                    	}
                		this.socket.emit('adduser',this.userName.val());                		
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
                          var messages = JSON.parse(data);
                          var i = null;
                          
                          this.displayMessage({'username':'Server', 'message' :'Last 5 messages'});
                          for (i in messages) {
                        	  this.displayMessage(messages[i],true);
                          }
                    },this));
            
                    
                	// listener, whenever the server emits 'updaterooms', this updates the room the client is in
                    this.socket.on('updaterooms', function(rooms, current_room) {
                    	$('#rooms').empty();
                    	$.each(rooms, function(key, value) {
                    		if(value == current_room){
                    			$('#rooms').append('<div>' + value + '</div>');
                    		}
                    		else {
                    			$('#rooms').append('<div><a href="#" class="room" id="'+ value +'">' + value + '</a></div>');                    		
                    			$('#rooms #'+ value).on('click',function(event) { 
                    				event.stopPropagation();
                    				socket.emit('switchRoom', this.text);
                    				return false;
                    			});
                    		}
                    	});
                    });
                   
                                     
                } catch(exception){
                	log(exception);
                	this.displayMessage({'username':'Error', 'message' :exception});
                	
                }
                //attach events
                this.messageBox.keypress($.proxy(function(event) {
                	if(event.keyCode == 13) {
                		this.sendMessage();
                	}
                },this));
               
                return this;
            }
        // appends a message to chat window
        , displayMessage: function(msg,isHistory = false) {    	
        	 log(msg);
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
        
        //sends a message to the server
        , sendMessage: function() {
            var msg = {};
            //get username and message 
            $.each($('#chat').serializeArray(), function(i,v) {
                msg[v.name] = v.value;
            });
            //clear message
            this.messageBox.val("");
            
            this.socket.emit('msg', JSON.stringify(msg));
           // this.displayMessage(msg);
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
		      $('#chatLog, input, button, #examples').fadeOut("fast");
		      $('<p>Oh no, you need a browser that supports WebSockets. How about <a href="http://www.google.com/chrome">Google Chrome</a>?</p>').appendTo('#container');
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