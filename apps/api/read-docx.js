const mammoth = require("mammoth");
const path = require("path");

const file = path.join(__dirname, "../../PRD Survey PPG dan Study Lanjut.docx");

mammoth.extractRawText({path: file})
    .then(function(result){
        const text = result.value; 
        console.log(text);
    })
    .catch(function(error){
        console.error(error);
    });
