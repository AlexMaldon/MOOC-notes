var app = {
              /* la aplicación usa vble con el 'model',q contiene los datos q almacenaremos en las notas  */
  model: {    /* el objeto model contiene json, pares clave:valor delimitados por comillas  */
    "notas": [{"titulo": "Comprar pan", "contenido": "Oferta en la panaderia de la esquina"}]
  },          /* notas es una lista (delimitada x corchetes), q contiene un objeto lista (delimitado x llaves), con dos campos titulo=comprarpan y contenido=oferta   */

  firebaseConfig: {
    apiKey: "AIzaSyDKH83e0nGXVTq1Tx5CexclpxEs12reQKg",
    authDomain: "mooc-notes.firebaseapp.com",
    databaseURL: "https://mooc-notes.firebaseio.com",
    storageBucket: "mooc-notes.appspot.com",
    messagingSenderId: "224883080478"
  },

  inicio: function(){
    this.iniciaFastClick();
    this.iniciaFirebase();
    this.iniciaBotones();
    this.refrescarLista();
  },

  iniciaFastClick: function() {
    FastClick.attach(document.body);
  },

  iniciaFirebase: function() {
    firebase.initializeApp(this.firebaseConfig);
  },

  iniciaBotones: function() {
    var salvar = document.querySelector('#salvar');
    var anadir = document.querySelector('#anadir');

    anadir.addEventListener('click' ,this.mostrarEditor ,false);
    salvar.addEventListener('click' ,this.salvarNota ,false);
  },

  mostrarEditor: function() {
    document.getElementById('titulo').value = "";
    document.getElementById('comentario').value = "";
    document.getElementById("note-editor").style.display = "block";
    document.getElementById('titulo').focus();
  },

  salvarNota: function() {
    app.construirNota();
    app.ocultarEditor();
    app.refrescarLista();
    app.grabarDatos();
  },

  construirNota: function() {
    var notas = app.model.notas;
    notas.push({"titulo": app.extraerTitulo() , "contenido": app.extraerComentario() });
  },      /*  con 'push' conseguimos que la nueva nota se agregue a las demás, cuya info la obtenemos 
          mediante los componentes de la aplicación 'extraerTitulo y extraerComentario */

  extraerTitulo: function() {
    return document.getElementById('titulo').value;
  },

  extraerComentario: function() {
    return document.getElementById('comentario').value;
  },

  ocultarEditor: function() {
    document.getElementById("note-editor").style.display = "none";
  },

  refrescarLista: function() {
    var div = document.getElementById('notes-list');
    div.innerHTML = this.anadirNotasALista();
  },

  anadirNotasALista: function() {
    var notas = this.model.notas;
    var notasDivs = '';
    for (var i in notas) {
      var titulo = notas[i].titulo;
      notasDivs = notasDivs + this.anadirNota(i, titulo);
    }
    return notasDivs;
  },

  anadirNota: function(id, titulo) {
    return "<div class='note-item' id='notas[" + id + "]'>" + titulo + "</div>";
  },

/* para que al salir de la app las notas se sigan guardando aplicamos una función de persistencia
solicitamos a Cordova un storage, 'gotFS' después con 'le pedimos q grabe una versión en JSON de nuestro modelo */
  grabarDatos: function() {
    window.resolveLocalFileSystemURL(cordova.file.externalApplicationStorageDirectory, this.gotFS, this.fail);
  },

  gotFS: function(fileSystem) {
    fileSystem.getFile("files/"+"model.json", {create: true, exclusive: false}, app.gotFileEntry, app.fail);
  },

  gotFileEntry: function(fileEntry) {
    fileEntry.createWriter(app.gotFileWriter, app.fail);
  },

  gotFileWriter: function(writer) {
    writer.onwriteend = function(evt) {
      console.log("datos grabados en externalApplicationStorageDirectory");
      if(app.hayWifi()) {
        app.salvarFirebase();
      }
    };
    writer.write(JSON.stringify(app.model));
  },

  /* la librería 'firebase' nos permite guardar nuestros datos en la nube.
  La hemos inicializado más arriba. Y ahora creamos un fichero dentro del storage 
  de firebase y guardamos ahí nuestro modelo en JSON */
  salvarFirebase: function() {
    var ref = firebase.storage().ref('model.json');
    ref.putString(JSON.stringify(app.model));
  },

  hayWifi: function() {
    return navigator.connection.type==='wifi';
  },

  leerDatos: function() {
    window.resolveLocalFileSystemURL(cordova.file.externalApplicationStorageDirectory, this.obtenerFS, this.fail);
  },

  obtenerFS: function(fileSystem) {
    fileSystem.getFile("files/"+"model.json", null, app.obtenerFileEntry, app.noFile);
  },

  obtenerFileEntry: function(fileEntry) {
    fileEntry.file(app.leerFile, app.fail);
  },

  leerFile: function(file) {
    var reader = new FileReader();
    reader.onloadend = function(evt) {
      var data = evt.target.result;
      app.model = JSON.parse(data);
      app.inicio();
    };
    reader.readAsText(file);
  },

  noFile: function(error) {
    app.inicio();
  },

  fail: function(error) {
    console.log(error.code);
  },

};

if ('addEventListener' in document) {
  document.addEventListener("deviceready", function() {
    app.leerDatos();    /* nuestra aplicación empezará a ejecutarse cuando el dispositivo esté listo */
  }, false);
};
