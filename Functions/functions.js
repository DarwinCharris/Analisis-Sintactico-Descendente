function validate(content){
    //content is the txt content (String)
    // if content is ''
    if (content === ''){
        return false
    }
    //Eliminate blanck spaces
    content= content.replace(' ', '');
    // split the content
     var elements = content.split('\r\n');
    elements.forEach(element => {
        //Element structure UpperCase letter->(someting(|someting)?)*
        console.log(element)
    });
}
validate('A->B|&\r\nc')