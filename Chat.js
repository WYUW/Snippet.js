    var username;
    var chatUser;

$(document).ready(function(){
    
    var logindialog = document.querySelector('#loginDialog');
    var signupdialog = document.querySelector('#signupDialog');
    var successdialog = document.querySelector('#successDialog');
    

        /* Login */
        
        // Open Login
    $('#loginBtn').click(function() {
        logindialog.showModal();
    });
    
        // Close Login 
    $('#cancelLogin').click(function() {
        logindialog.close();
        $('.errorMessage').text("");
    });
    
       // Press Login (Auth)
    $('#login').click(function() {
        
        username = $('#loginUser').val();
        var email = username + "@mail.com";
        var password = $('#loginPassword').val();
        $('.loadIcon').show();
        firebase.auth().signInWithEmailAndPassword(email, password).then(function(result){
            
          // if no error, proceed...
            // Close signup dialog...
            $('.errorMessage').text("");
            $('.loadIcon').hide();
            logindialog.close();
            // Show success dialog...
            successdialog.showModal();
            $('#successTitle').text("Login Successful");
            $('#insertUser').text(username);
            // call 'Member Area'
            loggedin();
            
        }).catch(function(error) {
            
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          $('.errorMessage').text(error.message);
          $('.loadIcon').hide();
          // ...
          
        });
    });
    
        /* Sign up */
        
        // Open Sign up
    $('#signupBtn').click(function() {
        signupdialog.showModal();
    });
    
        // Close Sign up 
     $('#cancelSignup').click(function() {
        signupdialog.close();
        $('.errorMessage').text("");
    });
    
        // Press Sign up (Auth)
        
    $('#signup').click(function() {
        
        username = $('#signupUser').val();
        var email = username + "@mail.com";
        var password = $('#signupPassword').val();
        $('.loadIcon').show();
        firebase.auth().createUserWithEmailAndPassword(email, password).then(function(result) {
            
          // if no error, proceed...
            // Close signup dialog...
            $('.errorMessage').text("");
            $('.loadIcon').hide();
            signupdialog.close();
            // Show success dialog...
            successdialog.showModal();
            $('#successTitle').text("Account created");
            $('#insertUser').text(username);
            // call 'Member Area'
            loggedin();
            
        }).catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          $('.errorMessage').text(errorMessage);
          $('.loadIcon').hide();
          // ...
          
        });
    });
    
        /* Logout */
        
    $('#logoutBtn').click(function() {
        
        firebase.auth().signOut().then(function() {
            // Sign-out successful.
            // call 'Homescreen'
            loggedout();
            }).catch(function(error) {
            // An error happened.
            alert("logout error: "+ error.message);
        });        
    });
    
        // Close Successdialog
    $('#cancelSuccess').click(function() {
        
        successdialog.close();
        
    });
    
    function loggedin() {
        
        // Hide  Buttons
        $('#signupBtn').hide();
        $('#loginBtn').hide();
        // Show Logout Button
        $('#logoutBtn').show();
        $('#headerTitle').text("Member-Area");
        $('#navUsername').text(username);
        $('.page-content').html("<h1>Welcome</h1>This was done with Firebase and Material Design.<br /><br />");
        chatUser = username;
        // Show Chat
        $("#chatDiv").show();
        loadChat();
    
    }
    
    function loggedout() {
        
        // show Buttons
        $('#signupBtn').show();
        $('#loginBtn').show();
        // Hide Logout Button
        $('#logoutBtn').hide();
        // Hide Chat
        $("#chatDiv").hide();
        
        $('#headerTitle').text("Home");
        $('#navUsername').empty();
        $('.page-content').html("This connects to a database.<br />Try to login with:<br /><br />Username: test<br />Password: password<br /><br />Or create a new account. <br /><hr /><br />Let me know if you see any room for improvements.");
    }
    
    loggedout();
    
    
            /* Catch Chat input Form, prevent submit from page load */
            
      var form = $('form');
      form.submit(function(){
          $.post($(this).attr('action'), $(this).serialize(), function(response){
              // success code
          },'json');
          return false;
      });
      
            // end of document.ready
});


        /****************************/
        /*                          */
        /* logged in Chat feature!! */
        /*                          */
        /****************************/
        
        
         
    var firebaseRef = firebase.database().ref().child("messageDb");
    var didPost;
    var maxPosts = 5;
    var serverTime;
    
            /* Retrieve Server Time */
            // Problem: Might be Client Time, Servertime is recommended.
    function refreshServerTime() {        
        firebase.database().ref("/.info/serverTimeOffset").on('value', function(offset) {
            var offsetVal = offset.val() || 0;
            serverTime = Date.now() + offsetVal;
        });
    }
            /* Read Username, Message, and call function */
            
    function submitMessage() {
            // get message input, then reset input field
        var msg = $("#message").val();
        $("#message").val("");
            // change message linebreaks to <br>
        msg = nl2br (msg);
        function nl2br (str, isXhtml) {
              if (typeof str === 'undefined' || str === null) {
                return '';
              }
              // Adjust comment to avoid issue on locutus.io display
              var breakTag = (isXhtml || typeof isXhtml === 'undefined') ? '<br ' + '/>' : '<br>';
              return (str + '').replace(/(\r\n|\n\r|\r|\n)/g, breakTag + '$1');
        }

        
        addMsg(serverTime, chatUser, msg);
    }
    
            /* add Message Function */
    
    function addMsg(time, name, newMsg) {
    
      var newPostKey = firebase.database().ref().child('messageDb').push().key;
      
      refreshServerTime();
      
      firebase.database().ref('messageDb/' + serverTime).set({
        postKey: newPostKey,
        priority: 0 - Date.now(),
        username: name,
        message: newMsg
      });
      
    }
    
            /* Show More results */
        
    function showMoreResults() {
        maxPosts += 10;
        $("#showMore").hide();
        loadChat();
    }
          
 
            /* Retrieve List / Data */
               
    function loadChat() {
        
        var getMessageKey = firebase.database().ref('messageDb/').orderByChild("priority").limitToFirst(maxPosts);
    
        getMessageKey.on('value', function(snapshot) {
    
            refreshServerTime();
            $("#list").empty();
            didPost = 0;
            snapshot.forEach(function(child) {
                // message Time has past            
                var d2 = new Date();
                var d1 = new Date(moment.unix(child.key/1000).format("YYYY-MM-DD HH:mm:ss"));
                var tDs = Math.floor((d2 - d1) / 1000);
                var tDm = Math.floor(tDs / 60);
                var tDH = Math.floor(tDm / 60);
                var tDD = Math.floor(tDH / 24);
                var tDM = Math.floor(tDD / 30);
                var tDY = Math.floor(tDM / 12);
                var tDescr = "";
                var tVal;
                if (tDY > 1) {
                    tVal = tDY;
                    tDescr = " years";
                } else if (tDY === 1) {
                    tVal = tDY;
                    tDescr = " year";
                } else if (tDM > 1) {
                    tVal = tDM;
                    tDescr = " months";
                } else if (tDM === 1) {
                    tVal = tDM;
                    tDescr = " month";
                } else if (tDD > 1) {
                    tVal = tDD;
                    tDescr = " days";
                } else if (tDD === 1) {
                    tVal = tDD;
                    tDescr = " day";
                } else if (tDH > 1) {
                    tVal = tDH;
                    tDescr = " hours";
                } else if (tDH === 1) {
                    tVal = tDH;
                    tDescr = " hour";
                } else if (tDm > 1) {
                    tVal = tDm;
                    tDescr = " minutes";
                } else if (tDm === 1) {
                    tVal = tDm;
                    tDescr = " minute";
                } else if (tDs > 1) {
                    tVal = tDs;
                    tDescr = " seconds";
                } else if (tDs === 1) {
                    tVal = tDs;
                    tDescr = " second";
                } else if (tDs === 0) {
                    tVal = tDs;
                    tDescr = " seconds";
                } else {
                    alert("Something is wrong!")
                }
               
                var getPostMessage = child.val().message;
                var getPostUsername = child.val().username;
                $("#list").append("<div><span>" + getPostUsername + " wrote...</span><span>" + tVal + tDescr + " ago</span><p>" + getPostMessage + "</p></div>");
                
                didPost++;
                                  
            });
            
            didPost++;
            
            if (didPost > maxPosts) {
                $("#showMore").show(); 
            } 
        });
        
    }                
