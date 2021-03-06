const environment = 'production'
let apiDomain;

if(environment == 'production') {
    apiDomain = ''
}else{
    apiDomain = 'http://localhost/paywellapi/index.php?/FormBuilder/'
}


// Inital Variable Declare Related In Global Scope
const formBuilder = document.getElementById('formBuilder')
//const addBlock    = document.getElementById('addBlock')
//const formWrapper = document.getElementById('formWrapper')
//var optAmtIndex;

// all Event Listner
document.addEventListener('submit', sendForm)
//addBlock.addEventListener('submit', createBlock)

// event delegation event Listner
// document.addEventListener('change', enableAmountField)
document.addEventListener('click',generateOptionsFieldOnClick)

// Event Listner Functions Start Here 
// function createBlock(e) {
//     e.preventDefault();
//     let inputBlockLength = formWrapper.getElementsByClassName('inputBlock').length
//     document.getElementById('btnMainSubmit').style.display = 'block'
//     var newBox = document.createElement("div");
//     newBox.className = "form-group inputBlock";
//     newBox.innerHTML = `
//             <label>Label </label>
//             <input type="text" class="form-control" name="question_${inputBlockLength}" value="" required/>
//             <input type="hidden" class="question_id" value="question_${inputBlockLength}"/>
//             <div class="optDefineDiv">
//                 <label>Select option Type</label>
//                 <select name="" class="form-control optionType" required>
//                     <option value="">Select One</option>
//                     <option value="btntextField_${inputBlockLength}">Text Field</option>
//                     <option value="btnchkBox_${inputBlockLength}">Checkbox</option>
//                     <option value="btnRadio_${inputBlockLength}">Radio</option>
//                     <option value="btndropDown_${inputBlockLength}">DropDown</option>
//                     <option value="btnFile_${inputBlockLength}">File</option>
//                 </select>
//             </div>
//             <div class="optionFieldsWrapper">
                
//             </div>
//     `
//     formWrapper.appendChild(newBox);
// }

function sendForm(e) {
    if(e.target && e.target.id == 'formBuilder') {
        e.preventDefault();

        var formBuilder = document.forms["formBuilder"]
        var data = getInput(formBuilder)

        let apiurl = apiDomain+'insertFormVal';

        $.ajax({
            url: apiurl,
            method: 'post',
            type: "POST",
            data: {'data':data},
            success: function(result) {
                window.scroll({
                    top: 0, 
                    left: 0, 
                    behavior: 'smooth'
                });
                alertControl('block','Data Inserted Successfuly!','alert-success')
            },
            error: function(error) {
                alertControl('block','Data Inserte Failed!','alert-danger')
            }
        });
    }
}

function enableOptionDiv() {
    var optionFieldsWrapper = document.querySelector('#optionFieldsWrapper_'+optAmtIndex)
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

function clearOptionsDiv(id) {
    var optionFieldsWrapper = document.querySelector('#optionFieldsWrapper_'+id)
    optionFieldsWrapper.style.display = 'none'
    optionFieldsWrapper.innerHTML = ''
}

// function removeQueBlockElm(el) {
//     <div class="pull-right">
//     <span class="glyphicon glyphicon-remove" aria-hidden="true" onclick="removeQueBlockElm(this)"></span>
// </div>
//     el.closest('.inputBlock').remove()
// }

function generateOptionsFieldOnClick(e) {
    if(e.target && e.target.className == 'btn btn-info insertRow') {
        let id = e.target.id
        var optionFieldsWrapper = document.querySelector('#optionFieldsWrapper_'+id) 
        optionFieldsWrapper.insertAdjacentHTML("beforeend", '<div class="optionInputWrapper"><input type="text" class="form-control" name="question_'+id+'" value="" required/><span class="glyphicon glyphicon-remove" aria-hidden="true" onclick="removeOptionElm(this)"></span></div>')
    }
}

function removeOptionElm(el) {
    el.closest('.optionInputWrapper').remove()
}



function getInput() {

    /*
        activeStatus
            0 for delete
            1 for Publish 
            2 for Pending
    */
    let formName = document.getElementById('form_name').value;
    formBox = formBuilder.getElementsByClassName('inputBlock');
    let formType = document.getElementById("formType").value;
    let activeStatus = 2;
    let userId = document.getElementById("user_id").value;
    let amount = document.getElementById("amount").value;
    
    var fieldArr = {
    'form_name': formName,
    'form_type': formType,
    'user_id': userId,
    'amount': amount,
    'active_status':activeStatus,
    'fields': {}
    }
    for (let j = 0; j < formBox.length; j++) {        
        fieldArr.fields['field_'+j] = {
            'type': formBox[j].querySelector('.optionType').options[formBox[j].querySelector('.optionType').selectedIndex].value.split('_')[0],
            'label': formBox[j].querySelector('.form-control').value,
            'options': {}
        }
        var optionDivLen = formBox[j].querySelector('.optionFieldsWrapper').getElementsByClassName('form-control')   
        if(optionDivLen.length > 0) {
            for (let i = 0; i < optionDivLen.length; i++) {
                fieldArr.fields['field_'+j].options[i] = optionDivLen[i].value
            }
        }
    }

    return fieldArr
}
