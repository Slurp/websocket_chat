/**
 * WebsocketChatClient ===========================
 * 
 * uses socket.io
 * 
 * @author Stephan Langeweg
 */

// debug macro
var debug = true;
window.log=function(){if(this.console && debug == true){console.log(Array.prototype.slice.call(arguments));}};
jQuery.fn.log=function (msg){console.log("%s: %o", msg,this);return this;};

/**
 * Flash Title 
 */
var timer,
initialTitle = document.title,
titleInterval,
isWindowBlurred = false;


var hmtlTitleFlasher = function(titleMessage) {
    if(isWindowBlurred) {
        clearInterval(titleInterval);
        titleInterval = window.setInterval(function() {
            document.title = document.title == initialTitle ? titleMessage : initialTitle;
        }, 1000);
    }
}

window.onblur=function() {
    isWindowBlurred = true;     
}
window.onfocus=function() { 
   isWindowBlurred = false;
   document.title = initialTitle;
   clearInterval(titleInterval);
}

!function ($) {
    "use strict"; // jshint ;_;
    
     /**
     * Class for a websocket chat client
     */
    var socket;
    
    /**
     * Timeout function to hide the chat modal window
     */
    var modalTimeOut = function(){log('timeoutset');setTimeout('$("#chatModal").modal("hide")', 3000)};
 
    
    var WebsocketChatClient = function(elem, options){
      this.elem = elem;
      this.$elem = $(elem);
      this.options = $.extend({}, $.fn.websocketChatClient.defaults, options);
      
      // internal vars
      this.socket;
      this.host = "http://wschat.zwartschaap.net:3000";
      
      // dom elements
      this.messageBox = this.$elem.find('#msg');
      this.chatBox = this.$elem.find('#msgs');
      this.userName = this.$elem.find('#username');
      this.form = this.$elem.find('form#chat');
      this.userList = this.$elem.find('#chat-clients ul');   
      this.disconnectBtn = this.$elem.find('#disconnect');   
      
     }
  
  WebsocketChatClient.prototype = {
          
           constructor: WebsocketChatClient
           
        ,    init: function() {
                log('init');
                // start up socket io
                try{
                    /**
                     * Reserved socket.io events
                     * https://github.com/LearnBoost/socket.io/wiki/Exposed-events
                     */
                    this.socket = io.connect(this.host);
                    socket = this.socket;               
                    
                    this.socket.on('connecting', function () {
                        $('#loading').show();
                    });
                    
                    this.socket.on('connect', function(){
                        log('connected');       
                        $('#loading').hide();
                    });        
                    
                    this.socket.on('message', function (message, callback) {
                        log('message:' + message);
                    })
                    
                     // Server disconnected.
                    this.socket.on('disconnect', function () {
                        log('disconnect');
                        clearTimeout(modalTimeOut);
                        $('#chatModal').modal({
                            remote: 'views/chat/disconnect.html'
                        });
                        modalTimeOut;
                    });
                    
                    // Failed on connection.
                    this.socket.on('connect_failed', function () {
                        log('connect_failed');
                        clearTimeout(modalTimeOut);
                        $('#chatModal').modal({
                            remote: 'views/chat/connectionfailed.html'
                        });
                        modalTimeOut;
                    });
                    
                    // Failed on something.
                    this.socket.on('error', function () {
                        log('error');
                        clearTimeout(modalTimeOut);
                        $('#chatModal').modal({
                            remote: 'views/chat/error.html'
                        });
                        modalTimeOut();
                    });
                    
                    // Failed to reconnect
                    this.socket.on('reconnect_failed', function () {
                        log('reconnect_failed');
                        clearTimeout(modalTimeOut);
                        $('#chatModal').modal({
                            remote: 'views/chat/connectionfailed.html'
                        });
                        modalTimeOut();
                    });
                    
                    // Succesful reconnected
                    this.socket.on('reconnect', function () {
                        log('reconnect');
                        clearTimeout(modalTimeOut);
                        $('#chatModal').modal({
                            remote: 'views/chat/reconnect.html'
                        });
                        modalTimeOut();
                    });
                    
                    // Connection lost, reconnect
                    this.socket.on('reconnecting', function () {
                        log('reconnecting');                        
                        $('#chatModal').modal({
                            remote: 'views/chat/reconnecting.html'
                        });                        
                    });
                    
                    /**
                     * Custom events
                     */
                    this.socket.on('getUserName', $.proxy(function() {
                        this.getUsername();                       
                    },this));
                    
                    // pushed msg from server
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
                   
                    
                    // listener, whenever the server emits 'updaterooms', this
                    // updates the room the client is in
                    this.socket.on('updaterooms',$.proxy(function(rooms, current_room, clients){
                        this.updateRooms(rooms, current_room, clients)
                    },this));
                    
                    this.socket.on('userIsTyping',$.proxy(function(client){
                        this.notifyTyping(client,true)
                    },this));
                    
                    // user room updates
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
             
                // Dom events
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
                
                this.disconnectBtn.on('click',$.proxy(function(event) {
                    event.stopPropagation();
                    this.disconnect();
                    return false;
                },this));
               
                return this;
            }
            // appends a message to chat window
              , getUsername : function() {
                  log('getUserName');
                  // call the server-side function 'adduser' and send one parameter
                  // (value of prompt)
                  if(this.userName.val() == "") {
                      // @todo replace prompt with nicer function
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
            hmtlTitleFlasher('New message!');
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
        
        // sends a notify that current user is typing
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
        // sends a message to the server
        , sendMessage: function() {
            // get the message
            if(this.messageBox.val()) {
                var message = {message:this.messageBox.val()};
                // clear message
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
            
            
            this.userList.empty();
            // if current user isn't the only one in the room
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
            var html = '<li data-clientId="'+client.id+'" class="cf">'+
                        '<a class="clientName"><i class="icon-user"></i>'+client.username+'</a>'+
                        '<span class="composing"></span>'+
                       '</li>'
                    
            this.userList.append(html);
        }
        
      
          // disconnect from the chat server
        , disconnect: function() {
        
            this.socket.disconnect();
            
        }
        
  }
        
    /**
     * WebsocketChatClient plugin definition ===========================
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
        messageContainer: '<div class="row-fluid"></div>', 
        now : new Date()
    }
   
    $.fn.websocketChatClient.Constructor = WebsocketChatClient
  
    $(window).on('load', function () {
       if(!("WebSocket" in window)){
              $('[data-chat="init"]').fadeOut("fast");
              $('[data-chat="init"]').empty();
              $('[data-chat="init"]').append(
                      '<p>Oh no, you need a browser that supports WebSockets. How about <a href="http://www.google.com/chrome">Google Chrome</a>?</p>'
                      );
        }else{
             $('[data-chat="init"]').each(function () {
               var $chatClient = $(this)
                 , data = $chatClient.data()    
                 // console.log(data);
               $chatClient.websocketChatClient(data);
             })
        }
     })  
}(window.jQuery);