<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class FormBuilder extends CI_Controller {

    public $environment = 'dev';
    private $dbName;

    public function __construct() {
        parent::__construct();
        if($this->environment == 'production') {
            $this->dbName = 'crs_db_lab';
        }else{
            $this->dbName = 'local_database';
        }

    }

	public function insertFormVal()
	{
        header('Access-Control-Allow-Origin: *');
        $response = [];
        if($_SERVER['REQUEST_METHOD'] == 'POST') { 
            $result = $_POST['data'];
            $dbCon = $this->load->database($this->dbName, TRUE);

            if(!empty($result)) {
                $formId = 0;
                if($result['form_name'] != '' && $result['form_type'] != '') {
                    $sql = "INSERT INTO form (name, form_type, created_by, pay_amount,active_status) VALUES ('".$result['form_name']."','".$result['form_type']."',".$result['user_id'].",".$result['amount'].",".$result['active_status'].")";
                   
                    $res = $dbCon->query($sql);

                    if($res) {
                        $sql = $dbCon->query("SELECT id FROM form ORDER BY id DESC LIMIT 0 , 1");
                        $insertedID = $sql->result();
                        foreach ($insertedID as $value) {
                            $formId =  $value->id;
                        }
                    }
                    foreach($result as $key => $val) {
                        if(is_array($val)) {
                            foreach($val as $innerRow) {
                                $qsql = "INSERT INTO questions (form_id, que_type, question,created_by,que_status) values(";
                                $qsql .= "".$formId.",";
    
                                $valuesArrs = [];
                                $options = false;   // Flag to check if a que has options 
    
                                foreach($innerRow as $fldarr) {
                                    if(!is_array($fldarr)) {
                                        $qsql .= "'".$fldarr."',";
                                    }else {
                                        $options = true;
                                        array_push($valuesArrs,$fldarr);
                                    }
                                }
                                $qsql .= "".$result['user_id'].",1)";
                                $res = $dbCon->query($qsql);
    
                                if($options) {
                                    $qid = $this->findRowId($dbCon, 'qid', 'questions');
                                    foreach($valuesArrs as $valuesArr) {
                                        foreach($valuesArr as $v) {
                                            $osql = "INSERT INTO questions_option (question_id, que_option,opt_status)  VALUES (".$qid.",'".$v."',1)";
                                            $res = $dbCon->query($osql);
                                        }
                                    }
                                    
                                }
                            }
                        }
                    }
                    $response['status'] = 200;
                    $response['message'] = "Successful";
                }else{
                    $response['status'] = 500;
                    $response['message'] = "Something Went Wrong !";
                }
            }else {
                $response['status'] = 500;
                $response['message'] = "Failed";
            }
        }else{
            $response['status'] = 500;
            $response['message'] = "Invalid Request Method";
        }
        echo $data = json_encode($response);
    }

    public function getFormData()
    {
        $response = [];
        $tokenArr = $this->input->request_headers();
        
   
        if($_SERVER['REQUEST_METHOD'] == 'GET') {
            if(!empty($tokenArr['token'])) {
                $getToken = $tokenArr['token'];
                $token = md5(date("Y-m-d"));
                if($getToken === $token) {
                    $dbCon = $this->load->database($this->dbName, TRUE);
                    $sql = $dbCon->query("SELECT form_id, name, form_type, pay_amount, active_status, qid, que_type, question, optid, que_option FROM form LEFT JOIN questions ON questions.form_id = form.id LEFT JOIN questions_option ON questions_option.question_id = questions.qid WHERE form.active_status != 0 AND questions.que_status > 0 AND ( questions_option.opt_status > 0 OR questions_option.opt_status IS NULL ) ORDER BY qid");
                    $result = json_decode(json_encode($sql->result()),TRUE);
                    if(!empty($result)) {
                        $newAr = $this->processData($result);
                        
                        $response['status'] = 200;
                        $response['message'] = "Successful";
                        $response['data'] = $newAr;
                    }else{
                        $response['status'] = 500;
                        $response['message'] = "Failed";
                    }
                }else{
                    $response['status'] = 500;
                    $response['message'] = "Not authorized";
                }
            }else{
                $response['status'] = 500;
                $response['message'] = "Token Not Found";
            }
        }else{
            $response['status'] = 500;
            $response['message'] = "Invalid Request Method";
        }
        echo json_encode($response);
    }

    public function getFormList()
    {
        header('Access-Control-Allow-Origin: *');
        $response = [];
        if($_SERVER['REQUEST_METHOD'] === 'POST') {
            $dbCon = $this->load->database($this->dbName, TRUE);
            $sql = $dbCon->query("SELECT * FROM form WHERE active_status != 0");
            $result = json_decode(json_encode($sql->result()),TRUE);
            
            $response['data'] = $result;

        }else{
            $response['status'] = 500;
            $response['message'] = "Invalid Request Method";
        }
        echo json_encode($response);
    }

    public function insertFillFormData()
    {
        /*
            dummy json strcture for this method
            form_type value will be `survey` or `service`

            dummy json strcture for survey
        {
            "form_id": 27,
            "form_type":"survey",
            "answers": [
                {
                    "que_id": 2,
                    "que_field_type": "btntxt",
                    "que_value_text":"Mr. A"
                },
                {
                    "que_id": 3,
                    "que_field_type": "btnchk",
                    "que_value_select": "job, student"
                },
                {
                    "que_id": 34,
                    "que_field_type": "btnRadio",
                    "que_value_boolean":0
                },
                {
                    "que_id": 86,
                    "que_field_type": "btndropdown",
                    "que_value_select": "yeah test"
                },
                {
                    "que_id": 79,
                    "que_field_type": "btnFile",
                    "que_value_file": "test.jpg"
                },
                {
                    "que_id": 98,
                    "que_field_type": "btntxt",
                    "que_value_float": 22.2
                },  
                {
                    "que_id": 99,
                    "que_field_type": "btntxt",
                    "que_value_int": 5
                }
            ]
        } 
            dummy json strcture for service
        {
            "form_id": 27,
            "form_type":"service",
            "retailer_id": "45484",
            "amount": 500,
            "answers": [
                {
                    "que_id": 2,
                    "que_field_type": "btntxt",
                    "que_value_text":"Mr. A"
                },
                {
                    "que_id": 3,
                    "que_field_type": "btnchk",
                    "que_value_select": "job, student"
                },
                {
                    "que_id": 34,
                    "que_field_type": "btnRadio",
                    "que_value_boolean":0
                },
                {
                    "que_id": 86,
                    "que_field_type": "btndropdown",
                    "que_value_select": "yeah test"
                },
                {
                    "que_id": 79,
                    "que_field_type": "btnFile",
                    "que_value_file": "test.jpg"
                },
                {
                    "que_id": 98,
                    "que_field_type": "btntxt",
                    "que_value_float": 22.2
                },  
                {
                    "que_id": 99,
                    "que_field_type": "btntxt",
                    "que_value_int": 5
                }
            ]
        }

        */


        $response = [];
        if($_SERVER['REQUEST_METHOD'] == 'POST') {
            $body = file_get_contents('php://input');
            $data = json_decode($body,true);

            if(isset($data) && !empty($data)) {
                $dbCon = $this->load->database($this->dbName, TRUE);
                $answers = [];
                
                foreach($data as $key => $val) {
                    if(is_array($val)) {
                        foreach($val as $ansArr) {
                            array_push($answers,$ansArr);
                        }
                    }
                }
                if($data['form_type'] == 'service') {
                    $tsql = "INSERT INTO transactions (form_id, retailer_id, amount) VALUES (";
                    foreach($data as $key => $val) {
                        if(!is_array($val)) {
                            if($key == 'form_id') {
                                $tsql .= "".$val.",";
                            }else if($key == 'retailer_id') {
                                $tsql .= "".$val.",";
                            }else if($key == 'amount') {
                                $tsql .= "".$val."";
                            }
                        }
                    }
                    $tsql .= ")";
                    $tres = $dbCon->query($tsql);
                }else if($data['form_type'] == 'survey') {
                    $tres = 'service';
                }

                if($tres) {
                    if($tres === 'service') {
                        $tId = 'NULL';
                    }else{
                        $trsql = $dbCon->query("SELECT id FROM transactions ORDER BY id DESC LIMIT 0 , 1");
                        $tdatas = $trsql->result();
                        foreach ($tdatas as $tdata) {
                            $tId =  $tdata->id;
                        }
                    }
                    if($tId) {
                        foreach($answers as $ans){
                            $asql = "INSERT INTO questions_value (question_id, que_type ,que_value_text, que_value_boolean, que_value_float,que_value_int,que_value_select,que_value_file,trans_id) VALUES (";
                            foreach($ans as $singleKey => $singleAns){
                                if($singleKey == 'que_id'){
                                    $asql .= "".$singleAns.",";
                                } else if($singleKey == 'que_field_type') {
                                    $asql .= "'".$singleAns."',";
                                } else if($singleKey == 'que_value_text') {
                                    $asql .= "'".$singleAns."',NULL, NULL, NULL, NULL,NULL,";
                                }else if($singleKey == 'que_value_boolean') {
                                    $asql .= "NULL,".$singleAns.",NULL, NULL, NULL,NULL,";
                                }else if($singleKey == 'que_value_float') {
                                    $asql .= "NULL, NULL,".$singleAns.",NULL, NULL,NULL,";
                                }else if($singleKey == 'que_value_int') {
                                    $asql .= "NULL, NULL,NULL,".$singleAns.",NULL,NULL,";
                                }else if($singleKey == 'que_value_file') {
                                    $asql .= "NULL, NULL,NULL,NULL,NULL,'".$singleAns."',";
                                }else if($singleKey == 'que_value_select') {
                                    $asql .= "NULL, NULL,NULL, NULL,'".$singleAns."',NULL,";
                                }
                            }
                            $asql .= "".$tId.")";

                            $dbCon->query($asql);
                        }
                        $response['status'] = 200;
                        $response['message'] = "Success!";
                    }
                }
            }else{            
                $response['status'] = 500;
                $response['message'] = "No Data Found";         
            }

        }else{
            $response['status'] = 500;
            $response['message'] = "Invalid Request Method";
        }

        echo json_encode($response);
    }

    public function processData($result)
    {
        $newAr = array();
        foreach($result as $val) {
            if(!array_key_exists($val['form_id'], $newAr)) {
                $c = 0;
                $newAr += [ 
                    $val['form_id'] => array(
                        'form_id' => $val['form_id'],
                        'form_name' => $val['name'],
                        'form_type' => $val['form_type'],
                        'pay_amount' => $val['pay_amount'],
                        'active_status' => $val['active_status'],
                    ) 
                ];
                $newAr[$val['form_id']] += [ 
                    'Fields_'.$c => array(
                        'que_id' => $val['qid'],
                        'input_type' => $val['que_type'],
                        'input_label' => $val['question']
                    ) 
                ];
                if($val['que_option'] != '') {
                    //$newAr[$val['form_id']]['Fields_'.$c]['options'] = array($val['que_option']);
                    
                    $newAr[$val['form_id']]['Fields_'.$c]['options'] = [
                        'option_id' => $val['optid'],
                        'option_name' => $val['que_option']
                    ];
                }
                $c++;
            }else{
                if($newAr[$val['form_id']]['Fields_'.($c-1)]['input_label'] == $val['question']) {
                    array_push($newAr[$val['form_id']]['Fields_'.($c-1)]['options'],[
                        'option_id' => $val['optid'],
                        'option_name' => $val['que_option']
                    ]);
                }else{
                    $newAr[$val['form_id']] += [ 
                        'Fields_'.$c => array(
                            'que_id' => $val['qid'],
                            'input_type' => $val['que_type'],
                            'input_label' => $val['question']
                        ) 
                    ];
                    if($val['que_option'] != '') {
                        //$newAr[$val['form_id']]['Fields_'.$c]['options'] = array($val['que_option']);
                        $newAr[$val['form_id']]['Fields_'.$c]['options'] = array(
                            ['option_id' => $val['optid'],
                            'option_name' => $val['que_option']]
                        );
                    }
                    $c++;
                }
            }
        }
        return $newAr;
    }
    public function getEditFormDataById()
    {
        $response = [];
        if($_SERVER['REQUEST_METHOD'] === 'POST') {
            $id = $_POST['data'];
            $dbCon = $this->load->database($this->dbName, TRUE);
            //$res = $dbCon->query("SELECT form_id, name, form_type, pay_amount, active_status, qid, que_type, question, optid, que_option FROM form LEFT JOIN questions ON questions.form_id = form.id LEFT JOIN questions_option ON questions_option.question_id = questions.qid WHERE form.active_status != 0 AND form.id =".$id." ORDER BY questions.qid");
            $res = $dbCon->query("SELECT form_id, name, form_type, pay_amount, active_status, qid, que_type, question, optid, que_option FROM form LEFT JOIN questions ON questions.form_id = form.id LEFT JOIN questions_option ON questions_option.question_id = questions.qid WHERE form.id = ".$id." AND form.active_status != 0 AND questions.que_status > 0 AND ( questions_option.opt_status > 0 OR questions_option.opt_status IS NULL ) ORDER BY qid");
            $result = json_decode(json_encode($res->result()),TRUE);
            if(!empty($result)) {
                $newAr = $this->processData($result);
                
                $response['status'] = 200;
                $response['message'] = "Successful";
                $response['data'] = $newAr;
            }else{
                $response['status'] = 500;
                $response['message'] = "Failed";
            }
        }else{
            $response['status'] = 500;
            $response['message'] = "Invalid Request Method";
        }
        echo json_encode($response);
    }

    public function deleteForm()
    {
        $response = [];
        if($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = $_POST['data'];
            $id = $data['id'];
            $status = 0;

            $dbCon = $this->load->database($this->dbName, TRUE);
            $res = $dbCon->query("UPDATE form SET active_status=".$status." WHERE id=".$id."");
            if($res) {
                $response['status'] = 200;
                $response['message'] = "Successful!";
            }else{
                $response['status'] = 200;
                $response['message'] = "Something Went Wrong!";
            }

        }else{
            $response['status'] = 500;
            $response['message'] = "Invalid Request Method";
        }
        echo json_encode($response);
    }


    public function updateFormById()
    {
        header('Access-Control-Allow-Origin: *');
        $response = [];
        if($_SERVER['REQUEST_METHOD'] == 'POST') { 
            $result = $_POST['data'];
            $deleteOptRes = $_POST['deleteOpt'];
            $dbCon = $this->load->database($this->dbName, TRUE);
            if(!empty($result)) {
                if($result['form_name'] != '' && $result['form_type'] != '') {
                    $sql = "UPDATE form SET name = '".$result['form_name']."', form_type = '".$result['form_type']."', created_by = ".$result['user_id'].", pay_amount = ".$result['amount'].", active_status = ".$result['active_status']." WHERE id = ".$result['form_id']."";
                    $res = $dbCon->query($sql);
                    if($res) {
                        foreach($result as $key => $val) {
                            if(is_array($val)) {
                                foreach($val as $innerRow) {
                                    if($innerRow['que_id'] != '') {
                                        //Updating Old Label

                                        $qsql = "UPDATE questions SET ";

                                        $valuesArrs = [];
                                        $options = false;   // Flag to check if a que has options
                                        $qid = 0;
                                        foreach($innerRow as $fldKey => $fldval) {
                                            if(!is_array($fldval)) {
                                                if ($fldKey != 'que_id') {
                                                    $qsql .= "".$fldKey." = '".$fldval."',";
                                                }else{
                                                    $qid = $fldval;
                                                }
                                            }else {
                                                $options = true;
                                                array_push($valuesArrs,$fldval);
                                            }
                                        }
                                        $qsql .= "created_by = ".$result['user_id']." WHERE qid =".$qid."";
                                        $res = $dbCon->query($qsql);

                                        if($options) {
                                            foreach($valuesArrs as $valuesArr) {
                                                foreach($valuesArr as $v) {
                                                    if($v['option_id'] != '') {
                                                        $osql = "UPDATE questions_option SET que_option = '".$v['option_title']."' WHERE optid = ".$v['option_id']."";
                                                        $res = $dbCon->query($osql);
                                                    }else{
                                                        $osql = "INSERT INTO questions_option (question_id, que_option)  VALUES (".$qid.",'".$v['option_title']."')";
                                                        $res = $dbCon->query($osql);
                                                    }
                                                }
                                            }
                                        }
                                    }else{
                                        // inserting new label 
                                        $qsql = "INSERT INTO questions (form_id, que_type, question,created_by) values(";
                                        $qsql .= "".$result['form_id'].",";
            
                                        $valuesArrs = [];
                                        $options = false;   // Flag to check if a que has options 
            
                                        foreach($innerRow as $fldKey => $fldarr) {
                                            if(!is_array($fldarr)) {
                                                if ($fldKey != 'que_id') {
                                                    $qsql .= "'".$fldarr."',";
                                                }
                                            }else {
                                                $options = true;
                                                array_push($valuesArrs,$fldarr);
                                            }
                                        }
                                        $qsql .= "".$result['user_id'].")";
                                        $res = $dbCon->query($qsql);
                                        if($options) {
                                            $qid = $this->findRowId($dbCon, 'qid', 'questions');    // Getting The last Inserted Question Id    
                                            foreach($valuesArrs as $valuesArr) {
                                                foreach($valuesArr as $v) {
                                                    $osql = "INSERT INTO questions_option (question_id, que_option)  VALUES (".$qid.",'".$v['option_title']."')";
                                                    $res = $dbCon->query($osql);
                                                }
                                            }
                                            
                                        }
                                    }
                                }
                            }
                        }
                        $response['status'] = 200;
                        $response['message'] = "Data Update Successful !";
                    }else{
                        $response['status'] = 500;
                        $response['message'] = "Something Went Wrong !";
                    }
                }else{
                    $response['status'] = 500;
                    $response['message'] = "Something Went Wrong !";
                }

                if(!empty($deleteOptRes)) {
                    foreach($deleteOptRes['optionList'] as $options) {
                        foreach($options as $key => $val) {
                            $dosql = "UPDATE questions_option SET opt_status = 0 WHERE optid = ".$val."";
                            $res = $dbCon->query($dosql);
                        }
                    }
                }
            }else {
                $response['status'] = 500;
                $response['message'] = "Failed";
            }
        }else{
            $response['status'] = 500;
            $response['message'] = "Invalid Request Method";
        }
        echo json_encode($response);
    }

    public function publishFOrm()
    {

        /**
         * 
         *  0 For delete
         *  1 For Publish
         *  2 for Pending
         * 
         */
        $response = [];
        if($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = $_POST['data'];
            
            $dbCon = $this->load->database($this->dbName, TRUE);
            $res = $dbCon->query("UPDATE form SET active_status=".$data['publish_form_status']." WHERE id=".$data['publish_form_id']."");
            if($res) {
                $response['status'] = 200;
                $response['message'] = "Successful!";
            }else{
                $response['status'] = 500;
                $response['message'] = "Something Went Wrong!";
            }

        }else{
            $response['status'] = 500;
            $response['message'] = "Invalid Request Method";
        }
        echo json_encode($response);   
    }

    public function findRowId($dbCon, $fild, $tbl)
    {
        $qIdsql = $dbCon->query("SELECT ".$fild." FROM ".$tbl." ORDER BY ".$fild." DESC LIMIT 0 , 1");
        $queIdRes = $qIdsql->result();
        foreach ($queIdRes as $value) {
            $qid =  $value->qid;
        }
        return $qid;
    }
}
