<?php

?>
<!DOCTYPE html>
<html>
    <head>
        <title>Zwartschaap.net Websocket Chat</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <!-- Bootstrap -->
        <link href="css/bootstrap.min.css" rel="stylesheet" media="screen">
        <link href="css/bootstrap-responsive.min.css" rel="stylesheet" media="screen">
        <link rel="stylesheet" href="css/chat.css">
    </head>
    <body>
        <div class="navbar navbar-inverse navbar-fixed-top">
            <div class="navbar-inner">
                <div class="container-fluid">
                    <button data-target=".nav-collapse" data-toggle="collapse" class="btn btn-navbar" type="button">
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    </button>
                    <a href="#" class="brand">Websocket chat</a>
                    <div class="nav-collapse collapse">
                        <p class="navbar-text pull-right">
                          Logged in as <a class="navbar-link" href="#">Slurp</a>
                        </p>
                        <ul class="nav">
                          <li class="active"><a href="#">Home</a></li>
                          <li><a href="#about">About</a></li>
                          <li><a href="#contact">Contact</a></li>
                        </ul>
                    </div><!--/.nav-collapse -->
                </div>
            </div>
        </div>
        <div class="container-fluid">
          <div class="row-fluid">
            <div class="span3">
              <div class="well sidebar-nav">
                <ul class="nav nav-list">
                  <li class="nav-header">Bootstrap (css, javascript)</li>
                  <li><a href="http://twitter.github.com/bootstrap/index.html">Main</a></li>                 
                  <li class="nav-header">Websocket</li>
                  <li><a href="http://socket.io">http://socket.io</a></li>      
                  <li><a href="https://github.com/learnboost/socket.io">learnboost socket.io</a>
                   <li><a href="https://github.com/LearnBoost/websocket.io">learnboost websocket.io</a>
                          
                  <li class="nav-header">Node.js</li>                  
                </ul>
              </div><!--/.well -->
            </div><!--/span-->
            <div class="span9">
              <h1>Socket.io chat client</h1>
              <div class="row-fluid" data-chat='init'>
                    
                       
                   <div class="chat-window">
						<div class="chat-title">
							<span class="icon">
								<i class="icon-comment"></i>
							</span>
							<h5>Support chat</h5>
							<div class="dropdown btn-group pull-right">
                                <button class="btn btn-primary"> Rooms</button>
                                <button class="btn btn-primary dropdown-toggle" data-toggle="dropdown">
                                <span class="caret"></span>
                                </button>
                              
                               <ul class="dropdown-menu" role="menu" aria-labelledby="dLabel" id="rooms">
                               <!-- populated by the chat client -->                            
                               </ul>
                           </div>
						</div>
						<div class="chat-inner nopadding">
							<div class="chat-content panel-left">                   
							   <div id="chat-messages" class="chat-messages">
									<div id="msgs" class="chatroom ">
									
								    </div>
							   </div>									
							   <div class="chat-message well ">
									<div id="form">
                                        <form id="chat" class="form-inline">
                                            <label for="username">Username: </label>
                                                <input id="username" name="username" type="text" placeholder="Username">
                                            <label for="msg"> Message: </label>
                                            <div class="input-append">
                                                <input id="msg" type="text" class="name="message" placeholder="Message"/>
                                                <button class="btn" type="submit">Sumbit</button>
                                            </div>                                                    
                                        </form>
                                   </div>						                  
							   </div>   
							    <button id="disconnect" class="btn btn-danger pull-right">Disconnect</button>                
							</div>
							<div class="chat-users panel-right">
								<div class="panel-title"><h5>Online Users</h5></div>
								<div id="chat-clients" class="panel-content nopadding">
									<ul class="contact-list">
										
									</ul>
								</div>
							</div>
						</div>
					</div>
                  </div>  
                 
                  <!-- extra html for client -->
                  <div class="hide" id="loading">
                        <img src="img/loading.gif">
                  </div>    
                  <!-- modal for messages -->
                     <div id="chatModal" class="modal hide fade">
                        <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                        <h3>Chat server</h3>
                        </div>
                        <div class="modal-body">
                      
                        </div>
                        <div class="modal-footer">
                            <a href="#" data-dismiss="modal" class="btn">Close</a>
                        </div>
                     </div>      
             </div>
          </div><!--/row-->
            
          <hr>
    
          <footer>
            <p>&copy; Zwartschaap.net</p>
          </footer>    
        </div>
        <!-- Javascript -->       
        <script src="http://code.jquery.com/jquery.js"></script>
        <script src="js/bootstrap.min.js"></script>
         <!-- socket.io -->
        <script src="node_modules/socket.io/node_modules/socket.io-client/dist/socket.io.js"></script>
        <script src="js/chatclient.js"></script>
    </body>
</html>