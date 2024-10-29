class Produccion {
    constructor(NTerm, productions) {
        this.NTerm = NTerm;            // Atributo NTerm
        this.productions = productions; // Lista de producciones
    }
}

class Gramatica {
    constructor() {
        this.rightPart = []; // Inicializa la lista de producciones
    }

    add(tag, production) {
        // Busca si el tag ya existe como NTerm
        const existingProduccion = this.rightPart.find(prod => prod.NTerm === tag);

        if (!existingProduccion) {
            // Si no existe, crea un nuevo objeto Produccion y lo añade a la lista
            this.rightPart.push(new Produccion(tag, [production]));
        } else {
            // Si existe, agrega la producción a la lista existente
            if (!existingProduccion.productions.includes(production)){
                existingProduccion.productions.push(production);
            }
            
        }
    }
}
function validate(content){
    //content is the txt content (String)
    // if content is ''
    if (content === ''){
        return false
    }
    //Remove blanck spaces
    content= content.replace(' ', '');
    // split the content
    var elements = content.split('\r\n');
    for (let element of elements) {
        // La estructura esperada es una letra mayúscula seguida de '->'
        // Longitud mínima de 4: "A->A"
        if (element.length < 4) {
            return false;
        }
        if (!(element[0] >= 'A' && element[0] <= 'Z')) {
            return false;
        }
        if (!(element[1] === '-' && element[2] === '>')) {
            return false;
        }
    }
    return true;
}
function findTerminal(str) {
    let result = '';

    for (let i = 0; i < str.length; i++) {
        if (str[i] >= 'A' && str[i] <= 'Z') {
            break; // Salir del bucle si se encuentra una letra mayúscula
        }
        result += str[i]; // Agregar el carácter al resultado
    }

    return result;
}
function components(content){
    let Terminals=[]
    let NoTerminals=[]
    let gram= new Gramatica()
    //Remove blanck spaces
    content= content.replace(' ', '');
    // split the content
    var elements = content.split('\r\n');
    for (let element of elements) {
        //Left part 
        if(!NoTerminals.includes(element[0])){
            NoTerminals.push(element[0])
        }
        //Right part
        let right = element.substring(3)
        let i =0
        gram.add(element[0], right)
        while(i<right.length){
            let chart = right[i]
            if((chart>= 'A' && chart <= 'Z')){
                if (!NoTerminals.includes(chart)){
                    NoTerminals.push(chart)
                }   
            }else{
                let sub = right.substring(i)
                let terminal = findTerminal(sub)
                if (terminal !== '' && !Terminals.includes(terminal)){
                    Terminals.push(terminal)
                }
                if (terminal.length !=0){
                    i = i+ terminal.length-1
                }
            }
            i+=1
        }
    }
    return [Terminals, NoTerminals, gram]
}
function leftRecursion(gram){
    let newgram = new Gramatica()
    for (let element of gram.rightPart){
        let X=[]
        let Y=[]
        for (let production of element.productions){
            if(production[0]===element.NTerm){
                X.push(production.substring(1))
            }else{
                Y.push(production)
            }
        }
        if(X.length > 0){
            for(let yi of Y){
                let left = element.NTerm
                let right = yi+element.NTerm+"'"
                newgram.add(left, right)
            }
            for(let xi of X){
                newgram.add(`${element.NTerm}'`, `${xi}${element.NTerm}'`)
            }
            newgram.add(`${element.NTerm}'`, "&")
        }else{
            newgram.rightPart.push(element)
        }
    }
    return newgram
}
let str = 'E->E+T\r\nE->E-T\r\nE->T\r\nT->T*F\r\nT->T/F\r\nT->F\r\nF->(E)\r\nF->id'
console.log(str)
console.log(validate(str))
let[terminales, noterminales, gramatica] = components(str)
console.log(noterminales)
console.log(terminales)
let nueva = leftRecursion(gramatica)
for (let elemento of nueva.rightPart){
    console.log(elemento)
}