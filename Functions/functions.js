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
    return [Terminals, NoTerminals]
}
let str = 'A->BidD|&\r\nC->A'
console.log(str)
console.log(validate(str))
let[terminales, noterminales] = components(str)
console.log(noterminales)
console.log(terminales)