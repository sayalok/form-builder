// Inital Variable Declare Related In Global Scope
const addBlock    = document.getElementById('addBlock')
const formWrapper = document.getElementById('formWrapper')
var optAmtIndex;

if(addBlock != undefined) {
    addBlock.addEventListener('submit', createBlock)
}

// event delegation event Listner
document.addEventListener('change', enableAmountField)
document.addEventListener('click',generateOptionsFieldOnClick)

/** 
 * 
 * This Function Will Create the block of a question 
 * `inputBlockLength` taking the current block amount so that we can can add a number to every block to identify them seperately
 * 
*/
function createBlock(e) {
    e.preventDefault();
    let inputBlockLength = formWrapper.getElementsByClassName('inputBlock').length
    if(document.getElementById('btnMainSubmit') != undefined) {
        document.getElementById('btnMainSubmit').style.display = 'block'
    }
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

function removeOptionElm(el) {
    el.closest('.optionInputWrapper').remove()
}

function enableAmountField(e) {
    if(e.target && e.target.className == 'form-control optionType') {
        optAmtIndex = e.target.value.split('_')[1]

        let optionType = document.querySelector('.optionType')
        let optTyp = optionType.options[optionType.selectedIndex].value

        if(optTyp != '' && e.target.value.split('_')[0] != 'btntextField' && e.target.value.split('_')[0] != 'btnFile') {
            enableOptionDiv()
        }else {
            clearOptionsDiv(optAmtIndex)
        }
    }
}

function enableOptionDiv() {
    var optionFieldsWrapper = document.getElementsByClassName('optionFieldsWrapper')[optAmtIndex]
    let optTyp              = $(".optionType option:selected").val()
    
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

function generateOptionsFieldOnClick(e) {
    if(e.target && e.target.className == 'btn btn-info insertRow') {
        let id = e.target.id
        var optionFieldsWrapper = document.getElementsByClassName('optionFieldsWrapper')[id] 
        optionFieldsWrapper.insertAdjacentHTML("beforeend", '<div class="optionInputWrapper"><input type="text" class="form-control" name="question_'+id+'" value="" required/><span class="glyphicon glyphicon-remove" aria-hidden="true" onclick="removeOptionElm(this)"></span></div>')
    }
}

function clearOptionsDiv(id) {
    var optionFieldsWrapper = document.getElementsByClassName('optionFieldsWrapper')[id]
    optionFieldsWrapper.style.display = 'none'
    optionFieldsWrapper.innerHTML = ''
}