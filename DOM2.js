var fileList = [], uniqueID, landingForm, sdsUid, totalFiles, userEmail, myform, sdsUuid;
var fileInput = document.querySelector('input.file-input');
var emailInput = document.querySelector("input[type=email]");
let allForms = {};


const dateMax = getMaxDate();

const accordion = document.querySelector('body > div.container > div.accordion');
const template = document.querySelector('#templateDiv > div');
const htmlTemplate = template.cloneNode(true);
template.parentElement.remove(); // delete template from HTML so it's pretty.

function doDropdownForms(file, i) {
    //sdsUid = uniqueID();
    let formWrapper = document.createElement('form');
    let jsTemplate = formWrapper.appendChild(htmlTemplate.cloneNode(true));
    //formWrapper.id = sdsUid;
    //const newtext = document.createTextNode(text);
    let dropdownTrigger = jsTemplate.querySelector('div.panel-heading');
    dropdownTrigger.addEventListener("click", doActivate);
    let title = jsTemplate.querySelector('.panel-heading > span');
    title.textContent = '';
    let titleText = document.createTextNode(removeExtension(file.name));
    title.appendChild(titleText);
    let totalsString = jsTemplate.querySelector('span.filecount');
    totalsString.textContent = i+1 + ' of ' + totalFiles;
    let sdsLink = jsTemplate.querySelector('a.button');
    let sdsUrl = URL.createObjectURL(file);
    sdsLink.href = sdsUrl;
    sdsUuid = sdsUrl.split('/')[1];
    formWrapper.id = 'sds-uuid-' + sdsUuid;
    let uuidInput = formWrapper.appendChild(document.createElement('input'));
    uuidInput.setAttribute('type', 'hidden');
    uuidInput.setAttribute('name', 'sdsUuid');
    uuidInput.setAttribute('value', sdsUuid);
    let uploaderInput = formWrapper.appendChild(document.createElement('input'));
    uploaderInput.setAttribute('type', 'hidden');
    uploaderInput.setAttribute('name', 'uploader');
    uploaderInput.setAttribute('value', emailInput.value);


    var nameInput = jsTemplate.querySelector('input[name="fileName"]');
    nameInput.setAttribute('fileindex', i); // use to match file from fileList object
    nameInput.value = removeExtension(file.name);

    var dateInput = jsTemplate.querySelector('input[type="date"]');
    dateInput.max = dateMax;

    var templateInputs = jsTemplate.querySelectorAll('input');
    templateInputs.forEach(element => {
        element.setAttribute('input-id', sdsUid);
    });
/*
    formWrapper.addEventListener('submit', function (event) {
        event.preventDefault();
       // doFormSubmit(event);
    });
*/
    accordion.appendChild(formWrapper);
   // accordion.appendChild(jsTemplate);
}




function clearChildren(elem) {
    while (elem.firstChild) {
        elem.removeChild(elem.firstChild);
    };
}

function uniqueID() {
    function chr4() {
        return Math.random().toString(16).slice(-4);
    }
    return 'SDS-' + chr4() + chr4();
};

function getMaxDate() {
    var dateObj = new Date();
    dateObj.setDate(dateObj.getDate() - 1);
    return dateObj.toISOString().split("T")[0];
}

function doActivate (){
    if (this.parentElement.classList.contains('active')) {
        this.parentElement.classList.toggle('active');
    } else {
        var triggers = document.querySelectorAll('div.panel-heading');
        triggers.forEach(function(element) { 
            element.parentElement.classList.remove('active')
        })
        this.parentElement.classList.toggle('active');
    }
}

landingForm = function (){
    emailInput.addEventListener('change', function () {
        validateEmail(this);
    });
    fileInput.addEventListener('change', function (evnt) {
        var fileListMsg = document.querySelector("label > span.file-name");
        var fileCheckIcon = document.querySelector('span.file-selected-check > i');
        fileListMsg.classList.add('is-loading');
        fileList = [];
        clearChildren(accordion);
        if (fileInput.files.length) {
            
            clearChildren(accordion);
            for (var i = 0; i < fileInput.files.length; i++) {
                if ( fileInput.files[i].type === 'application/pdf' ) {
                    fileList.push(fileInput.files[i]);
                    totalFiles = fileList.length;
                }
            };
            fileCheckIcon.classList.toggle('mdi-check-circle-outline');
            readyForms(); // this builds forms and adds event listeners.
        } else {
            fileCheckIcon.classList.remove('mdi-check-circle-outline');
        }; 
        if (fileList.length === 1) {
            fileListMsg.classList.remove('is-loading');
            fileListMsg.innerHTML = fileList.length + ' File Selected';
        } else if (fileList.length > 1) {
            fileListMsg.classList.remove('is-loading');
            fileListMsg.innerHTML = fileList.length + ' Files Selected';
        } else {
            fileListMsg.classList.remove('is-loading');
            fileListMsg.innerHTML = 'No Files Chosen';
        };

    });

}

function readyForms() {
    for (var i = 0; i < fileList.length; i++) {
        doDropdownForms(fileList[i], i) // new forms from template
    }
    let allForms = document.querySelectorAll('form');
    allForms.forEach(function(form, index) {
        form.addEventListener('submit', function (event) {
            console.log(form.id + 'Clicked!')
            event.preventDefault();
            submitForm(form, index); // Callback to submit this form.
        });
         /* … */ 
    })
};

function submitForm(form, index) {
    myform = form
    var formdata = new FormData();
    var inputs = form.querySelectorAll('input');
    inputs.forEach(function(input){
        var type = input.type;

        
        switch (type) {
          case 'submit':
            // Don't need submit button
            input.parentElement.innerHTML += '<div class="progress-div" style="float: right;"><progress class="progress progressBar is-info" value="25" max="100" style="width:300px;"></progress><h3 class="status">25% uploaded... please wait</h3><p class="loaded_n_total">Uploaded 2000 bytes of 10000</p></div>'
            console.log(input.name+': '+input.value)
            break;
          case 'date':
            console.log(input.name+': '+input.value)
            formdata.append(input.name, input.value);
            // do date stuff
            break;
          case 'checkbox':
            console.log(input.name+': '+input.checked)
            formdata.append(input.name, input.checked);
            break;
          default:
            if (input.name === 'fileName') {
                console.log(input.value + ' will be used for the new filename for: ' + fileList[index].name)
                formdata.append("file", fileList[index], input.value); // TODO need to verify first argument
                formdata.append("mimeType", fileList[index].type);
            } else {
            console.log(input.name+': '+input.value)
            formdata.append(input.name, input.value);
            }
            break;
        }
    })
    //
    var ajax = new XMLHttpRequest();
    ajax.upload.addEventListener("progress", progressHandler, false);
    ajax.addEventListener("load", completeHandler, false);
    ajax.addEventListener("error", errorHandler, false);
    ajax.addEventListener("abort", abortHandler, false);
    ajax.open("POST", "https://script.google.com/macros/s/AKfycbwj4lOsY1omAz6hKJB678KX2sbSOIzD_VU306Q_LWTWzr0JhPSJwDEuJrhpdgoDLp5W/exec"); // https://script.google.com/macros/s/AKfycbyug3JJwn1M9JJczgDoFbn_anvcBsbslGufMENkLeY/dev
    //use file_upload_parser.php from above url
    ajax.send(formdata);

};

//* ------------------------------------------------------------

function _(el) {
    return document.querySelector(el);
}

/*
function uploadFile() {
    var file = _("file1").files[0];
    // alert(file.name+" | "+file.size+" | "+file.type);
    var formdata = new FormData();
    formdata.append("file", file, "video.mov");
    var ajax = new XMLHttpRequest();
    ajax.upload.addEventListener("progress", progressHandler, false);
    ajax.addEventListener("load", completeHandler, false);
    ajax.addEventListener("error", errorHandler, false);
    ajax.addEventListener("abort", abortHandler, false);
    ajax.open("POST", "http://localhost:5000/profile/upload"); // http://www.developphp.com/video/JavaScript/File-Upload-Progress-Bar-Meter-Tutorial-Ajax-PHP
    //use file_upload_parser.php from above url
    ajax.send(formdata);
}
*/

function progressHandler(event) {
    _("loaded_n_total").innerHTML = "Uploaded " + event.loaded + " bytes of " + event.total;
    var percent = Math.round((event.loaded / event.total) * 100);
    _("progressBar").value = percent;
    _("status").innerHTML = percent + "% uploaded... please wait";
}

function completeHandler(event) {
    _("status").innerHTML = event.target.responseText;
    _("progressBar").value = 0; //wil clear progress bar after successful upload
}

function errorHandler(event) {
    _("status").innerHTML = "Upload Failed";
}

function abortHandler(event) {
    _("status").innerHTML = "Upload Aborted";
}

/*
_('upload_form').addEventListener('submit', (e) => {
    e.preventDefault();
    uploadFile();
});


DAP- Ready-Mixed Concrete Patch will be used for the new filename for: DAP- Ready-Mixed Concrete Patch.pdf
DOM2.js:181 productName: patch
DOM2.js:181 manufacturer: dap
DOM2.js:167 date: 2022-09-06
DOM2.js:172 engineering: true
DOM2.js:172 houseKeeping: false
DOM2.js:172 pantry: false
DOM2.js:172 frontOffices: false
DOM2.js:172 poolRoom: false
DOM2.js:164 : Upload SDS & Meta
DOM2.js:181 sdsUuid: d8e3332f-6bd1-47e6-9f1a-ad19c035bd96
DOM2.js:181 uploader: lee@lee.com
*/
// -------------------------------------- */

function validateEmail(inputText) {
    var emailCheckIcon = inputText.parentElement.lastChild.lastChild;
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    var submitSpan = document.querySelector('span.file-label');
    if (inputText.value.match(mailformat)) {
        userEmail = inputText.value;
        clearTextColor (emailCheckIcon, 'check');
        fileInput.disabled = false;
        submitSpan.classList.remove('disable');
        submitSpan.parentElement.parentElement.classList.remove('disable');
    }
    else {
        clearTextColor (emailCheckIcon, 'warn');
        fileInput.disabled = true;
        submitSpan.classList.add('disable');
        submitSpan.parentElement.parentElement.classList.add('disable');
    }
};

function clearTextColor (icon, state) {
    if (icon.parentElement.classList.contains('has-text-warning')) {
        icon.parentElement.classList.remove('has-text-warning');
    };
    if (icon.parentElement.classList.contains('has-text-success')) {
        icon.parentElement.classList.remove('has-text-success');
    };

    if (icon.classList.contains('fa-exclamation-triangle')) {
        icon.classList.remove('fa-exclamation-triangle');
    };
    if (icon.classList.contains('mdi-check-outline')) {
        icon.classList.remove('mdi-check-outline');
    };
    if (state === 'check') {
        icon.parentElement.classList.add('has-text-success');
        icon.parentElement.parentElement.firstChild.classList.add('disable');
        icon.parentElement.parentElement.classList.add('disable');
        icon.classList.add('mdi-check-outline');
    };
    if (state === 'warn') {
        icon.parentElement.classList.add('has-text-warning');
        icon.classList.add('mdi-alert');
    };
};

function removeExtension(filename) {
    return filename.substring(0, filename.lastIndexOf('.')) || filename;
  }


landingForm();
 // uniqueID() // "SDS-e27881c4"

//console.log(window.crypto.getRandomValues(new Uint32Array(4)).join(''))
/*
let sdsListing = accordion.appendChild(document.createElement('div'))
        .appendChild(document.createElement('p'))
        .appendChild(document.createElement('span'));
    sdsListing.innerText = 'DAP- Ready-Mixed Concrete Patch.pdf';
    sdsListing.parentElement.className = 'panel-heading';
    sdsListing.parentElement.parentElement.className = 'panel is-info active';

let arrowIcon = sdsListing.parentElement.appendChild(document.createElement('span'))
        .appendChild(document.createElement('i'));

let checkIcon = sdsListing.parentElement.appendChild(document.createElement('span'))
        .appendChild(document.createElement('i'));
    checkIcon.className = 'mdi mdi-18px mdi-check-outline';
    checkIcon.parentElement.className = 'mr-2';

let sdsDropdown = sdsListing.parentElement.parentElement.appendChild(document.createElement('div'));
    sdsDropdown.className = 'drop-down';



    // Grab all IDs that begin with "SDS-" like "SDS-e27881c4"
    // const startsAbc = document.querySelectorAll("[id^='SDS-']");
    // get the button form ID = document.querySelector("#SDS-269c0db6 > div > div:nth-child(8) > div.field-body > div > div > input");
    // get inputs from form I

   form data https://developer.mozilla.org/en-US/docs/Web/API/FormData
*/