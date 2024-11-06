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
function splitString(str) {
    const result = [];
    for (let i = 0; i < str.length; i++) {
        if (str[i] === 'i' && str[i + 1] === 'd') {
            result.push('id');
            i++; // Saltamos el siguiente carácter ('d') ya que fue incluido como "id"
        } else {
            result.push(str[i]);
        }
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
                let terminals = splitString(terminal)
                for (let ter of terminals){
                    if(ter !== '' && !Terminals.includes(ter)){
                        Terminals.push(ter)
                    }
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
function contarCifrasEnComun(lista) {
    if (lista.length === 0) return 0;

    // Tomamos el primer elemento como referencia
    let referencia = lista[0];
    let contador = 0;

    // Recorremos cada carácter de la referencia
    for (let i = 0; i < referencia.length; i++) {
        // Verificamos si todos los elementos tienen el mismo carácter en la posición actual
        if (lista.every(str => str[i] === referencia[i])) {
            contador++;
        } else {
            break; // Sale del bucle al encontrar una diferencia
        }
    }
    
    return contador;
}
function factorization (gram){
    let fact = new Gramatica()
    //Para casa A de A-> X|Y|... uso de pivote a cada elemento de la producción y busco el patron a partir del primer carácter
    for (let element of gram.rightPart){
        let X=[] //No tienen patrón
        let Y=[] // Tienen patrón
        let production = element.productions
        i = 0 
        j = 1
        while (i< production.length){
            while (j< production.length){
                if (production[i][0] === production[j][0]){
                    Y.push(production[j])
                }
                j+=1
            }
            if(Y.length >0){
                Y.unshift(production[i])
                break //Hay patron, lo cual indica que hay recursividad (Solo existe un patron por producción)
            }
            i+=1
            j=i+1
        }

        if(Y.length>0){
            //Encontrar el patrón 
            let salto = contarCifrasEnComun(Y)
            let patron = Y[0].substring(0,salto)
            for (let prod of Y){
                //agregar la parte del patrón
                fact.add(element.NTerm, `${patron}${element.NTerm}'`)
                // agregar la parte sin patrón
                if (prod.substring(salto) === ''){
                    fact.add(`${element.NTerm}'`, '&')
                }else{
                    fact.add(`${element.NTerm}'`, prod.substring(salto))
                }
                
            }
            for (let solos of X){
                fact.add(element.NTerm, solos)
            }
        }else{
            for(let prod of production){
                if (!Y.includes(prod)){
                    fact.add(element.NTerm, prod)
                }
                
            }
        }

    }
    return fact
}
function newcomponents(gram){
    let terminals =[]
    let noTerminals = []
    for (let nter of gram.rightPart){
        if (!noTerminals.includes(nter.NTerm)){
            noTerminals.push(nter.NTerm)
        }
        for(let prod of nter.productions){
            i=0
            while(i< prod.length){
                if (prod[i]>= 'A' && prod[i] <= 'Z'){
                    if (prod[i+1] === "'"){
                        i=i+2
                    }
                    else{
                        i=i+1
                    }
                }else{
                    let termi =findTerminal(prod.substring(i))
                    let lterminals = splitString(termi)
                    for (let ter of lterminals){
                        if(ter !== '&' && !terminals.includes(ter)){
                            terminals.push(ter)
                        }
                    }
                    if (termi.length !=0){
                        i = i+ termi.length
                    }
                }
            }
        }
    }
    return [terminals, noTerminals]
}




function calculateFirst(rightPart) {
    let firstSets = {};

    // Inicializar el conjunto "primero" para cada no terminal
    for (let produccion of rightPart) {
        firstSets[produccion.NTerm] = new Set();
    }

    // Función para calcular el primero de una cadena específica
    function firstOfString(str) {
        let firstSet = new Set();
        let canBeEmpty = true;

        for (let i = 0; i < str.length; i++) {
            canBeEmpty = false;
            
            // Detectar "id" como un terminal completo al inicio de la cadena
            if (str.slice(i, i + 2) === "id") {
                firstSet.add("id");
                i++; // Avanza el índice para saltar el carácter "d"
                canBeEmpty = false;
                break;
            } else if (!(str[i] >= 'A' && str[i] <= 'Z')) { // Es un terminal de un solo carácter
                firstSet.add(str[i]);
                canBeEmpty = false;
                break;
            } else { // Es un no terminal
                for (let f of firstSets[str[i]]) {
                    if (f !== '&') {
                        firstSet.add(f);
                    } else {
                        canBeEmpty = true;
                    }
                }   /* A -> B 
                      B -> epsilon */
                if (!canBeEmpty) {
                    break;
                }
            }
        }

        if (canBeEmpty) {
            firstSet.add('&');
        }
        return firstSet;
    }

    // Calcular el conjunto primero de cada no terminal
    let changed = true;
    while (changed) {
        changed = false;
        for (let produccion of rightPart) {
            let nterm = produccion.NTerm;
            for (let production of produccion.productions) {
                let beforeSize = firstSets[nterm].size;
                let firstSetForProduction = firstOfString(production);

                for (let f of firstSetForProduction) {
                    firstSets[nterm].add(f);
                }

                if (firstSets[nterm].size > beforeSize) {
                    changed = true;
                }
            }
        }
    }

    return firstSets;
}





let str = 'S->Sid\r\nS->B\r\nB->(id)i'
//console.log(str)
//console.log(validate(str))
let[terminales, noterminales, gramatica] = components(str)
//console.log(noterminales)
//console.log(terminales)
let nueva = leftRecursion(gramatica)
let n2 = factorization(nueva)
for (let elemento of nueva.rightPart){
    console.log(elemento)
}
//Factorizada
let [terminales2, noterminales2 ]= newcomponents(n2)
console.log(terminales2)
console.log(noterminales2)
console.log('Factorizada')
console.log(n2.rightPart)
console.log(calculateFirst(n2.rightPart))