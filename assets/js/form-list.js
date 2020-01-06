const environment = 'dev'
let apiDomain;

if(environment == 'production') {
    apiDomain = 'https://agentapi.paywellonline.com/index.php?/FormBuilder/'
}else{
    apiDomain = 'http://localhost/paywellapi/index.php?/FormBuilder/'
}

getFormData();

function alertControl(sts, msg, clsName) {
    let alertDiv = document.getElementById('alert');
    alertDiv.style.display = sts;
    alertDiv.innerHTML = msg;
    alertDiv.classList.add(clsName)

    setTimeout(function() {alertDiv.style.display = 'none'},3000)
}

function getFormData() {
    let apiurl = apiDomain+'getFormList';
    let formListElm = document.getElementById('formList')
    formListElm.innerHTML = ''
    $.ajax({
        url: apiurl,
        method: 'post',
        type: "POST",
        data: {'data':'test'},
        success: function(res) {
            let c = 0;
            let data = JSON.parse(res)
            if(data.data.length > 0) {
                data.data.forEach(item => {
                    c++
                    formListElm.innerHTML += `
                        <tr>
                            <td class="col-xs-1">${c}</td>
                            <td class="col-xs-4">${item.name}</td>
                            <td class="col-xs-2">${item.form_type}</td>
                            <td class="col-xs-2">${item.pay_amount}</td>
                            <td class="col-xs-3">
                                <a href="#editMod" data-toggle="modal" id="${item.id}" data-target="#edit-modal">Edit</a>
                                ||
                                <a href="#deleteMod" data-toggle="modal" id="${item.id}" data-active-status="${item.active_status}" data-target="#delete-modal">Delete</a>
                            </td>
                        </tr>
                    `
                });
            }else{
                formListElm.innerHTML += "<tr style='background-color:#fff'><td class=''></td><td class=''></td><td class='col-xs-1'>No Data To Show</td></tr>";
            }
        },
        error: function(error) {
            alertControl('block','Data Inserte Failed!','alert-danger')
        }
    });
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
            let showData = document.getElementById('formWrapper');
            showData.innerHTML = '';
            let item = res.data[id];

            if(res.status == 200) {
                showData.innerHTML += `
                    <div class="editFormName">
                        <label>Name: </label>
                        <input type="text" class="form-control" value="${item.form_name}" id="edit_form_name" required>
                    </div>
                    <label>Choose Form Type: </label>
                    <select class="form-control" id="edit_formType" required>
                        <option value="">Select One</option>
                        <option value="service">Service</option>
                        <option value="survey">Survey</option>
                    </select>
                    <div class="amountProp">
                        <label>Amount: </label>
                        <input type="text" class="form-control" value="${item.pay_amount}" id="edit_amount"/>
                    </div>
                    <label>Choose Form Status: </label>
                    <select class="form-control" id="edit_activeStatus" required>
                        <option value="">Select One</option>
                        <option value="1">Publish</option>
                        <option value="2">Pending</option>
                    </select>
                `;

                Object.keys(item)
                .forEach(function(key) {
                    let optionDiv
                    let splitKey = key.split('_')
                    if(splitKey[0] == 'Fields') {
                        //console.log(key, item[key]);
                        var newBox = document.createElement("div");
                        newBox.className = "form-group inputBlock";
                    
                        newBox.innerHTML += `
                            <label>Label </label>
                            <input type="text" class="form-control" name="question_${splitKey[1]}" value="${item[key].input_label}" required="">
                            <input type="hidden" class="question_id" value="question_${splitKey[1]}">
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
                        showData.appendChild(newBox);
                        $('#editOpTyp_'+splitKey[1]).val(item[key].input_type+'_'+splitKey[1])
                        if(item[key].options != undefined) {
                            var optField = document.createElement("div");
                            optField.className = "optionFieldsWrapper";
                            optField.style.display = 'block'
                            optField.innerHTML += '<h4>Options List </h4>'
                            optField.innerHTML += '<a class="btn btn-info insertRow" id="'+splitKey[1]+'">Add Row</a>'
                            let c = 0;
                            item[key].options.forEach(element => {
                                c++
                                optionFieldMaker(optField,c,splitKey[1], element)
                            });
                            newBox.appendChild(optField);
                        }else{
                            var optField = document.createElement("div");
                            optField.className = "optionFieldsWrapper";
                        }
                    }  
                }); // End Of Foreach
                
                $("#edit_formType").val(item.form_type);
                $("#edit_activeStatus").val(item.active_status);
            }
        },
        error: function(error) {
            alertControl('block','Slider Delete Failed!','alert-danger')
        }
    });
})


/** 
 * 
 * Generating Option Fields
 * set a counter (c) to check the first option field which can not be deleted 
 * 
*/

function optionFieldMaker(wraper, c, index, elm) {
    if(c == 1) {
        wraper.innerHTML += `
            <div class="optionInputWrapper">
                <input type="text" class="form-control" name="question_${index}" value="${elm}" required="">
            </div>
        `
    }else{
        wraper.innerHTML += `
            <div class="optionInputWrapper">
                <input type="text" class="form-control" name="question_${index}" value="${elm}" required="">
                <span class="glyphicon glyphicon-remove" aria-hidden="true" onclick="removeOptionElm(this)"></span>
            </div>
        `
    }
}
$('#btnUpdate').on('click', function (e) {
    e.preventDefault();
    
    let user_id = $('#user_id').val();
        device_type = $('#editDisplayType option:selected').val();
        status = $('#update_status option:selected').val()
        img_url = $('#updated_img_url').attr("src")
        updated_slider_id = $('#updated_slider_id').val();
        data = {'updated_slider_id':updated_slider_id,'user_id':user_id,'device_type':device_type, 'status': status, 'img_url':img_url}
        apiurl = apiDomain+'updateSlider/'

    $.ajax({
        url: apiurl,
        method: 'post',
        type: "POST",
        data: {'data':data},
        success: function(result) {
            alertControl('block','Slider Updated Successfuly!','alert-success')
            $('#edit-modal').modal('hide');
            fetchSliderData();
        },
        error: function(error) {
            alertControl('block','Slider Updated Failed!','alert-danger')
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