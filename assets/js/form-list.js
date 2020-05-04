const environment = 'production'
let apiDomain;

if(environment == 'production') {
    apiDomain = ''
}else{
    apiDomain = 'http://localhost/paywellapi/index.php?/FormBuilder/'
}

getFormData();


function getFormData() {
    let apiurl = apiDomain+'getFormList';
    let formListElm = document.getElementById('formList')
    formListElm.innerHTML = ''
    $.ajax({
        url: apiurl,
        method: 'post',
        crossDomain: true,
        type: "POST",
        data: {'data':'test'},
        success: function(res) {
            let c = 0;
            let data = JSON.parse(res)
            if(data.data.length > 0) {
                data.data.forEach(item => {
                    c++
                    var asTxt = item.active_status == 1 ? 'publish' : 'pending' 
                    formListElm.innerHTML += `
                        <tr>
                            <td class="col-xs-1">${c}</td>
                            <td class="col-xs-4">${item.name}</td>
                            <td class="col-xs-1">${item.form_type}</td>
                            <td class="col-xs-1">${item.pay_amount}</td>
                            <td class="col-xs-3">
                                <a href="#previewMod" data-toggle="modal" id="${item.id}" data-target="#preview-modal">Preview</a>
                                ||
                                <a href="#editMod" data-toggle="modal" id="${item.id}" data-target="#edit-modal">Edit</a>
                                ||
                                <a href="#deleteMod" data-toggle="modal" id="${item.id}" data-active-status="${item.active_status}" data-target="#delete-modal">Delete</a>
                            </td>
                            <td class=""col-xs-1> ${asTxt}</td>
                        </tr>
                    `
                });
            }else{
                formListElm.innerHTML += "<h2>No Data To Show</h2>";
            }
        },
        error: function(error) {
            alertControl('block','Something Went Wrong!','alert-danger')
        }
    });
}
$('#preview-modal').on('show.bs.modal', function(e) {
    var id = e.relatedTarget.id;
    apiurl = apiDomain+'getEditFormDataById/'
    $.ajax({
        url: apiurl,
        method: 'post',
        type: "POST",
        data: {'data':id},
        success: function(result) {
            let res = JSON.parse(result);
            let formData = res.data[id]
            let previewForm = document.getElementById('previewForm');

            document.getElementById('publish_form_id').value = res.data[id].form_id 
            if(res.data[id].active_status == 1 ) {
                document.getElementById('btnpublish').innerHTML = 'Pending'
                document.getElementById('publish_form_status').value = 2
            }else{
                document.getElementById('btnpublish').innerHTML = 'Publish'
                document.getElementById('publish_form_status').value = 1
            }
            previewForm.innerHTML = '';
            previewForm.innerHTML += `<h3 class="text-center">${formData.form_name}</h3>`
            if(formData.form_type === 'service') {
                previewForm.innerHTML += `
                    <div class="pull-left"></div>
                    <div class="pull-right">Payable Amount: ${formData.pay_amount}</div>
                    <div class="clearfix"></div>
                `
            }
            Object.keys(formData)
                .forEach(function(key) {
                    let splitKey = key.split('_')
                    if(splitKey[0] == 'Fields') {
                        var formField = document.createElement("div");
                        formField.className = "form-group";

                        formField.innerHTML += `
                            <label>${formData[key].input_label}</label>
                        `
                        var optionWrap = document.createElement("div");
                        //formField.innerHTML += setInputType(formData[key].input_type,formData[key].options)
                        optionWrap.innerHTML += setInputType(formData[key].input_type,formData[key].options)
                        formField.appendChild(optionWrap)
                        previewForm.appendChild(formField);
                    }
                })
        }
    });
})

function setInputType(data,options) {
    var inputVal = '';
    if(data === "btntextField") {
        inputVal = `<input type="text" class="form-control">`
    }else if(data === "btnFile") {
        inputVal = `<input type="file" class="form-control">`
    }else if(data === "btnchkBox") {
        options.forEach(element => {
            inputVal += `<div class="previewOptionWrap"><input type="checkbox"> ${element.option_name}</div>`
        });
    }else if(data === "btnRadio"){
        options.forEach(element => {
            if(element.option_name != undefined) {
                inputVal += `<div class="previewOptionWrap"><input type="radio"> ${element.option_name}</div>`
            }
        });
    }else if(data === "btndropDown"){
        inputVal += `<select class="form-control">`
        inputVal += `<option>Select One</option>`
            options.forEach(element => {
                inputVal += `<option>${element.option_name}</option>`
            });
        inputVal += `</select>`
    }
    return inputVal
}
$('#edit-modal').on('show.bs.modal', function(e) {
    var id = e.relatedTarget.id;
    apiurl = apiDomain+'getEditFormDataById/'
    $.ajax({
        url: apiurl,
        method: 'post',
        type: "POST",
        data: {'data':id},
        success: function(result) {
            let res = JSON.parse(result);
            
            var inputWrapper = document.createElement("div");
            inputWrapper.id = 'inputWrapper';

            let showData = document.getElementById('formWrapper');
            showData.innerHTML = '';
            let item = res.data[id];
            if(res.status == 200) {
                document.getElementById('form_id').value = item.form_id
                showData.innerHTML += `
                    <div class="editFormName">
                        <label>Name: </label>
                        <input type="text" class="form-control" value="${item.form_name}" id="form_name" required>
                    </div>
                    <label>Choose Form Type: </label>
                    <select class="form-control" id="formType" required>
                        <option value="">Select One</option>
                        <option value="service">Service</option>
                        <option value="survey">Survey</option>
                    </select>
                    <div class="amountProp">
                        <label>Amount: </label>
                        <input type="text" class="form-control" value="${item.pay_amount}" id="amount"/>
                    </div>
                    <label>Choose Form Status: </label>
                    <select class="form-control" id="activeStatus" required>
                        <option value="">Select One</option>
                        <option value="1">Publish</option>
                        <option value="2">Pending</option>
                    </select>
                `;
                var optionTypeArr = []
                Object.keys(item)
                    .forEach(function(key) {
                        let optionDiv
                        let splitKey = key.split('_')
                        if(splitKey[0] == 'Fields') {
                            var newBox = document.createElement("div");
                            newBox.className = "form-group inputBlock";
                        
                            newBox.innerHTML += `
                                <label>Label </label>
                                <input type="text" class="form-control" name="question_${splitKey[1]}" value="${item[key].input_label}" required="">
                                <input type="hidden" class="question_id" value="question_${splitKey[1]}">
                                <span style="display:none" class="d_id">${item[key].que_id}</span>
                                <div class="optDefineDiv">
                                    <label>Select option Type</label>
                                    <select name="" class="form-control optionType" id="editOpTyp_${splitKey[1]}" required="">
                                        <option value="">Select One</option>
                                        <option value="btntextField_${splitKey[1]}">Text Field</option>
                                        <option value="btnchkBox_${splitKey[1]}">Checkbox</option>
                                        <option value="btnRadio_${splitKey[1]}">Radio</option>
                                        <option value="btndropDown_${splitKey[1]}">DropDown</option>
                                        <option value="btnFile_${splitKey[1]}">File</option>
                                    </select>
                                </div>
                            `
                            inputWrapper.appendChild(newBox);
                            optionTypeArr.push(item[key].input_type+'_'+splitKey[1])
//                            $('#editOpTyp_'+splitKey[1]).val(item[key].input_type+'_'+splitKey[1])
                            if(item[key].options != undefined) {
                                var optField = document.createElement("div");
                                optField.className = "optionFieldsWrapper";
                                optField.style.display = 'block'
                                optField.innerHTML += ''
                                optField.innerHTML += '<h4>Options List </h4>'
                                optField.innerHTML += '<a class="btn btn-info insertRow" id="'+splitKey[1]+'">Add Row</a>'
                                let c = 0;
                                item[key].options.forEach(element => {
                                    c++
                                    optionFieldMaker(optField,c,splitKey[1], element.option_name, item[key].que_id, element.option_id)
                                });
                                newBox.appendChild(optField);
                            }else{
                                var optField = document.createElement("div");
                                optField.className = "optionFieldsWrapper";
                                newBox.appendChild(optField);
                            }
                        }
                    }); // End Of Foreach
                
                showData.appendChild(inputWrapper)
                if(optionTypeArr.length > 0) {
                    optionTypeCount = 0
                    optionTypeArr.forEach(function(val) {
                        document.getElementById('editOpTyp_'+optionTypeCount).value = val
                        optionTypeCount++
                    })
                }
                $("#formType").val(item.form_type);
                $("#activeStatus").val(item.active_status);
            }
        },
        error: function(error) {
            alertControl('block','Slider Delete Failed!','alert-danger')
        }
    });
})

//delete 
$('#delete-modal').on('show.bs.modal', function(e) {
    var id = e.relatedTarget.id;
    var status = $(e.relatedTarget).data('active-status')
    $('#deleteItemId').val(id)
    $('#deleteIStatus').val(status)
})

$('#btnDelete').on('click', function (e) {
    e.preventDefault();
    var id = $('#deleteItemId').val();
    var status = parseInt($('#deleteIStatus').val());
    let data = {'id':id, 'status':status }
    apiurl = apiDomain+'deleteForm/'

    $.ajax({
        url: apiurl,
        method: 'post',
        type: "POST",
        data: {'data':data},
        success: function(result) {
            alertControl('block','Successful!','alert-success')
            $('#delete-modal').modal('hide');
            getFormData();
        },
        error: function(error) {
            alertControl('block','Form Delete Failed!','alert-danger')
        }
    });
    
});

//update
const formBuilder = document.getElementById('updateFormBuilder')
document.addEventListener('submit', sendForm)
function sendForm(e) {
    if(e.target && e.target.id == 'updateFormBuilder') {
        e.preventDefault();
        let storeOptData = JSON.parse(localStorage.getItem("optionList"));
        var updateFormBuilder = document.forms["updateFormBuilder"]
 
        var data = getInput(updateFormBuilder)
        let apiurl = apiDomain+'updateFormById';
        $.ajax({
            url: apiurl,
            method: 'post',
            type: "POST",
            data: {'data':data, 'deleteOpt': storeOptData},
            success: function(result) {
                alertControl('block','Data Updated Successfuly!','alert-success')
                $('#edit-modal').modal('hide');
                localStorage.removeItem('optionList');
            },
            error: function(error) {
                alertControl('block','Data Updated Failed!','alert-danger')
            }
        });
    }
}

function getInput() {
    let formId = document.getElementById('form_id').value;
    let formName = document.getElementById('form_name').value;
    formBox = formBuilder.getElementsByClassName('inputBlock');
    let formType = document.getElementById("formType").value;
    let activeStatus = document.getElementById("activeStatus").value;
    let userId = document.getElementById("user_id").value;
    let amount = document.getElementById("amount").value;
    
    var fieldArr = {
        'form_id':formId,
        'form_name': formName,
        'form_type': formType,
        'user_id': userId,
        'amount': amount,
        'active_status':activeStatus,
        'fields': {}
    }
    for (let j = 0; j < formBox.length; j++) {
        let que_id = formBox[j].querySelector('.d_id') != undefined ? formBox[j].querySelector('.d_id').innerHTML : null; 
        fieldArr.fields['field_'+j] = {
            'que_type': formBox[j].querySelector('.optionType').options[formBox[j].querySelector('.optionType').selectedIndex].value.split('_')[0],
            'question': formBox[j].querySelector('input[name=question_'+j+']').value,
            'que_id': que_id,
            'options': {}
        }
        var optionDivLen = formBox[j].querySelector('.optionFieldsWrapper').getElementsByClassName('form-control') 
        var optionId = formBox[j].querySelector('.optionFieldsWrapper').getElementsByClassName('opt_id')   
        if(optionDivLen.length > 0) {
            for (let i = 0; i < optionDivLen.length; i++) {
                let opId = optionId[i] != undefined ? optionId[i].innerHTML : null
                fieldArr.fields['field_'+j].options[i] = {
                    'option_title' : optionDivLen[i].value,
                    'option_id': opId
                }
            }
        }
    }

    return fieldArr
}


/**  
 * This function will remove the option which is click and store the option id and question id on localstroage
*/
function removeOptionElm(el,qid,id) {
    localStorageStore(qid,id)
    el.closest('.optionInputWrapper').remove()
}


// local stroage setup starts
function localStorageStore(qid,id) {
    let storeData = JSON.parse(localStorage.getItem("optionList"));
    var mainStorage = '{"optionList" : []}'
    var mainStoragePrse = JSON.parse(mainStorage);

    if(storeData == null) {
        mainStoragePrse['optionList'].push({ [qid]: id })
        localStorage.setItem("optionList",JSON.stringify(mainStoragePrse));
    }else{
        storeData['optionList'].push({ [qid]: id })
        localStorage.setItem("optionList",JSON.stringify(storeData));
    }
}
document.addEventListener('click', clearStrroage)
function clearStrroage(e) {
    if(e.target && e.target.id == 'btnCloseEdit') {
        localStorage.removeItem('optionList');
    }
}
if (window.performance) {
    localStorage.clear();
}
// local stroage setup ends

function enableOptionDiv() {
    var optionFieldsWrapper = document.getElementsByClassName('optionFieldsWrapper')[optAmtIndex]
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

document.addEventListener('click',generateOptionsFieldOnClick)
function generateOptionsFieldOnClick(e) {
    if(e.target && e.target.className == 'btn btn-info insertRow') {
        let id = e.target.id
        var optionFieldsWrapper = document.getElementsByClassName('optionFieldsWrapper')[id]
        optionFieldsWrapper.insertAdjacentHTML("beforeend", '<div class="optionInputWrapper"><input type="text" class="form-control" name="question_'+id+'" value="" required/><span class="glyphicon glyphicon-remove" aria-hidden="true" onclick="removeOptionElm(this)"></span></div>')
    }
}
function generateOptionsField(opName) {
    var optionsField = '<div class="optionInputWrapper"><input type="text" class="form-control" name="question_'+opName+'" value="" required/></div>'
    return optionsField
}
function clearOptionsDiv(id) {
    var optionFieldsWrapper = document.getElementsByClassName('optionFieldsWrapper')[id]
    if(optionFieldsWrapper.getElementsByClassName('optionInputWrapper').length > 0) {
        for (let index = 0; index < optionFieldsWrapper.getElementsByClassName('optionInputWrapper').length; index++) {
            let oid = optionFieldsWrapper.getElementsByClassName('optionInputWrapper')[index].getElementsByClassName('opt_id')[0].innerHTML
            let qid = document.getElementsByClassName('inputBlock')[id].getElementsByClassName('d_id')[0].innerHTML
            localStorageStore(qid,oid)
        }
    }
    optionFieldsWrapper.style.display = 'none'
    optionFieldsWrapper.innerHTML = ''
}
/** 
 * 
 * Generating Option Fields
 * set a counter (c) to check the first option field which can not be deleted 
 * 
*/

function optionFieldMaker(wraper, c, index, elm, qId, optId) {
    if(c == 1) {
        wraper.innerHTML += `
            <div class="optionInputWrapper">
                <input type="text" class="form-control" name="question_${index}" value="${elm}" required="">
                <span style="display:none" class="opt_id">${optId}</span>
            </div>
        `
    }else{
        wraper.innerHTML += `
            <div class="optionInputWrapper">
                <input type="text" class="form-control" name="question_${index}" value="${elm}" required="">
                <span class="glyphicon glyphicon-remove" aria-hidden="true" onclick="removeOptionElm(this,${qId},${optId})"></span>
                <span style="display:none" class="opt_id">${optId}</span>
            </div>
        `
    }
}

// Publish Form
if(document.getElementById('btnpublish') != undefined) {
    document.getElementById('btnpublish').addEventListener('click', function (e) {
        e.preventDefault();
        var publish_form_id = document.getElementById('publish_form_id').value
        var publish_form_status = document.getElementById('publish_form_status').value
        let data = {
            'publish_form_id': publish_form_id,
            'publish_form_status': publish_form_status
        }
        let apiurl = apiDomain+'publishFOrm';
        $.ajax({
            url: apiurl,
            method: 'post',
            type: "POST",
            data: {'data':data},
            success: function(result) {
                alertControl('block','Data Updated Successfuly!','alert-success')
                $('#edit-modal').modal('hide');
                localStorage.removeItem('optionList');
            },
            error: function(error) {
                alertControl('block','Data Updated Failed!','alert-danger')
            }
        });
    })
}
