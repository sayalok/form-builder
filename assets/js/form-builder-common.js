const addBlock    = document.getElementById('addBlock')
const formWrapper = document.getElementById('formWrapper')

if(addBlock != undefined) {
    addBlock.addEventListener('submit', createBlock)
}

document.addEventListener('change', enableAmountField)



/** 
 * 
 * This Function Will Create the block of a question 
 * `inputBlockLength` taking the current block amount so that we can can add a number to every block to identify them seperately
 * 
*/
function createBlock(e) {
    e.preventDefault();
    let inputBlockLength = formWrapper.getElementsByClassName('inputBlock').length
    document.getElementById('btnMainSubmit').style.display = 'block'
    var newBox = document.createElement("div");
    newBox.className = "form-group inputBlock";
    newBox.innerHTML = `
            <label>Label </label>
            <input type="text" class="form-control" name="question_${inputBlockLength}" value="" required/>
            <input type="hidden" class="question_id" value="question_${inputBlockLength}"/>
            <div class="optDefineDiv">
                <label>Select option Type</label>
                <select name="" class="form-control optionType" required>
                    <option value="">Select One</option>
                    <option value="btntextField_${inputBlockLength}">Text Field</option>
                    <option value="btnchkBox_${inputBlockLength}">Checkbox</option>
                    <option value="btnRadio_${inputBlockLength}">Radio</option>
                    <option value="btndropDown_${inputBlockLength}">DropDown</option>
                    <option value="btnFile_${inputBlockLength}">File</option>
                </select>
            </div>
            <div class="optionFieldsWrapper">
                
            </div>
    `
    formWrapper.appendChild(newBox);
}
var optAmtIndex;
function enableAmountField(e) {
    if(e.target && e.target.className == 'form-control optionType') {
        optAmtIndex = e.target.value.split('_')[1]

        let optionType = document.querySelector('.optionType')
        let optTyp = optionType.options[optionType.selectedIndex].value

        if(optTyp != '' && e.target.value.split('_')[0] != 'btntextField' && e.target.value.split('_')[0] != 'btnFile') {
            enableOptionDiv()
        }else {
            //clearOptionsDiv(optAmtIndex)
        }
    }
}

function enableOptionDiv() {
    var optionFieldsWrapper = document.getElementsByClassName('optionFieldsWrapper')
    let optionType          = document.getElementsByClassName('optionType')
    
    let optTyp              = $( ".optionType option:selected" ).val()
    
    optionFieldsWrapper.innerHTML = '';
    if(optTyp != '') {
        var generateHtml = generateOptionsField(optAmtIndex)
        optionFieldsWrapper.style.display = 'block'
        optionFieldsWrapper.innerHTML += '<h4>Options List </h4>'
        optionFieldsWrapper.innerHTML += '<a class="btn btn-info insertRow" id="'+optAmtIndex+'">Add Row</a>'
        optionFieldsWrapper.innerHTML += generateHtml
    }
}

function generateOptionsField(opName) {
    var optionsField = '<div class="optionInputWrapper"><input type="text" class="form-control" name="question_'+opName+'" value="" required/></div>'
    return optionsField
}

// function enableOptionDiv() {
//     var optionFieldsWrapper = document.getElementsByClassName('optionFieldsWrapper')[optAmtIndex]
//     let optionType          = document.getElementsByClassName('optionType')[optAmtIndex]
//     let optTyp              = optionType.options[optionType.selectedIndex].value
    
//     optionFieldsWrapper.innerHTML = '';
//     if(optTyp != '') {
//         var generateHtml = generateOptionsField(optAmtIndex)
//         optionFieldsWrapper.style.display = 'block'
//         optionFieldsWrapper.innerHTML += '<h4>Options List </h4>'
//         optionFieldsWrapper.innerHTML += '<a class="btn btn-info insertRow" id="'+optAmtIndex+'">Add Row</a>'
//         optionFieldsWrapper.innerHTML += generateHtml
//     }
// }

function removeOptionElm(el) {
    el.closest('.optionInputWrapper').remove()
}
// function removeQueBlockElm(el) {
//     el.closest('.inputBlock').remove()
// }