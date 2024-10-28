// var arrayData = new Array();
// var archivotxt = new XMLHttpRequest();
// var fileRuta = 'data.txt';
// archivotxt.open("GET",fileRuta, false);
// archivotxt.send(null);
// var txt = archivotxt.responseText;
// for (var i=0; i< txt.length; i++){
//     arrayData.push(txt[i]);
// }
// console.log(txt)
// const lineas = txt.split('\r\n');
// console.log(lineas)

let txt = ""; // Variable para almacenar el contenido del archivo

const fileInput = document.getElementById('fileInput');
const fileContent = document.getElementById('fileContent');

fileInput.addEventListener('change', function() {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      txt = e.target.result; // Guardar el contenido en la variable txt
      fileContent.textContent = txt; // Mostrar el contenido en la página
      console.log(txt)
      const lineas = txt.split('\r\n');
      console.log(lineas)
    };
    reader.readAsText(file);
  }
});
