<?php

?>
<!DOCTYPE html>
<html>
    <head>
        <title>Zwartschaap.net Websocket Chat</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <!-- Bootstrap -->
        <link href="css/bootstrap.min.css" rel="stylesheet" media="screen">
        <style type="text/css">
          body {
            padding-top: 60px;
            padding-bottom: 40px;
          }
          .sidebar-nav {
            padding: 9px 0;
          }
    
          @media (max-width: 980px) {
            /* Enable use of floated navbar text */
            .navbar-text.pull-right {
              float: none;
              padding-left: 5px;
              padding-right: 5px;
            }
          }
        </style>
       
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
                  <li class="nav-header">Bootstrap</li>
                  <li><a href="http://twitter.github.com/bootstrap/index.html">Main</a></li>                 
                  <li class="nav-header">Websocket</li>
                  <li><a href="http://socket.io">http://socket.io</a></li>                
                  <li class="nav-header">Sidebar</li>
                  <li><a href="#">Link</a></li>                  
                </ul>
              </div><!--/.well -->
            </div><!--/span-->
            <div class="span9">
              <div class="hero-unit">
                <h1>Socekt.io chat client</h1>
                <p>This is a template for a simple marketing or informational website. It includes a large callout called the hero unit and three supporting pieces of content. Use it as a starting point to create something more unique.</p>
                <p><a class="btn btn-primary btn-large" href="#">Learn more »</a></p>
              </div>      
              
              <div class="row-fluid">
                  <h1>WebSockets Client</h1>  
      
                    <div id="chatLog">  
              
                    </div><!-- #chatLog -->  
                     <div id="msgs" class="well"></div>
                    <div id="form">
                        <form id="chat">
                            <label for="username">Username: </label>
                                <input name="username" type="text">
                            <label for="msg"> Message: </label>
                                <input id="msg" type="text" name="message"/><br/>
                        </form>
                    </div>
                    <button id="disconnect">Disconnect</button>        
               </div>
          </div><!--/row-->
            
          <hr>
    
          <footer>
            <p>&copy; Zwartschaap.net</p>
          </footer>
    
        </div>
       
        <script src="http://code.jquery.com/jquery.js"></script>
        <script src="js/bootstrap.min.js"></script>
         <!-- socket.io -->
        <script src="node_modules/socket.io/node_modules/socket.io-client/dist/socket.io.js"></script>
        <script src="js/chatclient.js"></script>
    </body>
</html>