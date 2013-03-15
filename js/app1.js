document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
  ////////////////////////
  // lista de contactos //
  ////////////////////////

      $("#test1").live("pageshow", function() {
        alert('Cargando contactos');
        var options = new ContactFindOptions();
        options.multiple = true;
        //options.filter="Acme Corporation";
        filter = ["id", "displayName", "email"];
        //navigator.contacts.find(filter, contactFind, onError, options);
        navigator.contacts.find(filter, contactFind, onError, options);
  });

    ////////////
    // camara //
    ////////////
      $("#cam").live("pageshow", function() {
        console.log('Camara de Fotos');
  });

    ///////////
    // conex //
    ///////////
      $("#conex").live("pageshow", function() {
        checkConnection();
  });

  ////////////
  // compas //
  ////////////
      $("#compass").live("pageshow", function() {
  });

  ////////////
  // ls //
  ////////////
      $("#db2").live("pageshow", function() {
  });

////////////////////
// almacenamiento //
////////////////////
    $("#db1").live("pageshow", function() {

      var db = window.openDatabase("Test", "1.0", "Test", 2000000);

      });
}

function contactFind(contacts){
  alert(contacts.length + ' resultados obtenidos');
  var myresults = document.getElementById("results");
    var string = "";
    for (var i=0; i<contacts.length; i++) {
      //console.log("Contacto: " + contacts[i]);
       if (contacts[i].displayName != null) { string += contacts[i].displayName + "<br/>"};
      string += contacts[i].displayName + "<br/>"
    }
    myresults.innerHTML = string;
}

function onError(contactError) {
     alert('Ooops!');
 }

function checkConnection() {
    var networkState = navigator.network.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.NONE]     = 'No network connection';

    alert('Connection type: ' + states[networkState]);
}

function onPhotoSuccess(imageData) {
      var myImage = document.getElementById('myImage');
      myImage.style.display = 'block';
      myImage.src =  imageData;
      alert(myImage.src);
    }

   function capturePhoto() {
    console.log('envio foto');
    navigator.camera.getPicture(onPhotoSuccess, onPhotoFail, { quality: 20 });
    }

    function onPhotoFail(message) {
      alert('Failed because: ' + message);
    }

////////////////////
// Almacenamiento //
////////////////////

    function createDB (){
          var db = window.openDatabase("Test", "1.0", "Test", 2000000);
        db.transaction(populateDB, errorDB, successDB);
    }

function populateDB(tx) {
        tx.executeSql('DROP TABLE IF EXISTS test1');
        tx.executeSql('CREATE TABLE IF NOT EXISTS test1 (id unique, name)');
        tx.executeSql('INSERT INTO test1 (id, name) VALUES (17, "Reinaldo")');
        tx.executeSql('INSERT INTO test1 (id, name) VALUES (18, "David")');
        tx.executeSql('INSERT INTO test1 (id, name) VALUES (19, "Saul")');
        tx.executeSql('INSERT INTO test1 (id, name) VALUES (10, "Mar")');
    }
    function errorDB(err) {
        alert("Error processing SQL: "+err.code);
    }

function successDB() {
        var db = window.openDatabase("Test", "1.0", "Test", 200000);
        db.transaction(queryDB, errorDB);
        console.log("paso por aqui")
    }

function queryDB(tx) {
        tx.executeSql('SELECT * FROM test1', [], querySuccess, errorDB);
    }
    // Query the success callback
    //
    function querySuccess(tx, results) {
    //first get the number of rows in the result set
    var len = results.rows.length;
     var status = document.getElementById("resultsDB");
     var string = "Rows: " +len+"<br/>";

    for (var i=0;i<len;i++){
      string  += results.rows.item(i).name + "<br/>";
    }

     status.innerHTML = string;
  }

function deleteDB(tx) {
        tx.executeSql('DROP TABLE test1');
    }

function deleteLastRow(tx) {
    tx.executeSql('SELECT * FROM test1', [], deleteSuccess, errorDB);

}
function deleteSuccess (tx,results){
  var len = results.rows.length;
  tx.executeSql ('DELETE FROM test1 WHERE id='+len);
}

  function recuperaROW (){
    var db = window.openDatabase("Test", "1.0", "Test", 200000);
    db.transaction(nuevoDB, errorDB, successDB);
    }

    function nuevoDB(tx) {
    console.log("Aqui esta");
    tx.executeSql('INSERT INTO test1 (id, name) VALUES (125, "Oscar")');
    }

    function deleteROW(){
        console.log("borro ultimo");
      var db = window.openDatabase("Test", "1.0", "Test", 200000);
      db.transaction(deleteLastRow, errorDB, successDB);
    }
    function deleteTABLE(tx){
      console.log("borro TABLA");
      var db = window.openDatabase("Test", "1.0", "Test", 200000);
      db.transaction(deleteDB, errorDB);
    }


/////////////////
//localstorage //
/////////////////

function storeName(){
          var myName = document.getElementById("DBname").value;
          window.localStorage.setItem("name", myName);

          var result = document.getElementById("DBresult");
          result.innerHTML = "Tu nombre es " + window.localStorage.getItem("name");
          return false;
     }

function clearLS(){
          window.localStorage.clear();
          return false;
     }

///////////////
//filesistem //
///////////////
function fileSys(){
          window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFileSystemSuccess, failFS);
          window.resolveLocalFileSystemURI("file:///example.txt", onResolveSuccessFS, failFS);
}
function onFileSystemSuccess(fileSystem) {
        console.log(fileSystem.name);
    }

    function onResolveSuccessFS(fileEntry) {
        console.log(fileEntry.name);
    }

    function failFS(evt) {
        console.log(evt.target.error.code);
    }


