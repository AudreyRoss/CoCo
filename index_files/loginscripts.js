function setErrors() {
    var netiderr = document.getElementById("netid-error");
    var pwderr = document.getElementById("pwd-error");
    
    netiderr.style.display = "none";
    pwderr.style.display = "none";
}

function validateField(name) {
    var err = document.getElementById(name + "-error");
    var val = document.getElementById(name).value;
    if (val == "") {
        err.style.display = "block";
        return false;
    }
    else {
    err.style.display = "none";
    return true;
    }
}


function validateForm() {
    var valid = true;
    if (!validateField("netid")) {
        valid = false;
    }
    if (!validateField("pwd")) {
        valid = false;
        }
        
        if (valid) {
            var netid = document.getElementById("netid").value;
            var pwd = document.getElementById("pwd").value;
            
            localStorage.setItem("netid", netid);
            localStorage.setItem("pwd", pwd);
            
            sessionStorage.setItem("signedin", "true");
        }
        
    return valid;
}