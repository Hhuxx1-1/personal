const endpoint = "https://script.google.com/macros/s/AKfycbwSkZ2G1OAJ_PIPg9-4RpRaqPZ1IxACRK_w234KqsBstWxSqPW2KsL-M3--2ZZwhLcw/exec";
const myKey = "CahAngon1";
var base64Image_data;
var divSubmit;
var submitBtn;
var S_Latitude;
var S_Longitude;
var ctx;
var gettingLocation_loader;
var nicknameSection;
var nickname_;
const container = document.querySelector("section");

function createNew(parent , elementType, content, attributes = {}) {
    if (!parent) {
      console.error(`Parent element with ID "${parentId}" not found.`);
      return null; // Return null if parent doesn't exist
    }
  
    // Create a new element
    const newElement = document.createElement(elementType);
    newElement.textContent = content;
  
    // Set attributes if provided
    for (const [key, value] of Object.entries(attributes)) {
      newElement.setAttribute(key, value);
    }
  
    // Append the new element to the parent container
    parent.appendChild(newElement);
  
    // Return the created element
    return newElement;
}
  
function setCookie(name, value, days) {
    if (name == "nickname"){
        // send notify for registering nickname into notifURL
        const contents = {
            key :  myKey,
            action : "newName",
            data: value
        };

        fetch(endpoint, 
        { 
            redirect: "follow",
            method: 'POST', // Sending a POST request
            headers: {
                'Content-Type': 'text/plain;charset=utf-8', // Specify content type as text
            },
            body: JSON.stringify(contents), // Convert data to JSON string
            }
        ) .then(response => response.json()) // Handle the response
        .then(data => {
            console.log('Success: Notif', data); // Log the response from the server
            if (data.result == "CreatedNew"){
                createNew(container,"h1","Successfully Created");
                const date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Convert days to milliseconds
                const expires = `expires=${date.toUTCString()}`;
                document.cookie = `${name}=${value}; ${expires}; path=/`;
                location.reload(true);
            }else{
                createNew(container,"h1","Nama Sudah Pernah Digunakan. Mohon Gunakan Nama Lain");
            }
        })
        .catch((error) => {
            console.error('Error:', error); // Log any error
        });
    }
}

function makeExtraForm() {
    container.innerHTML = ""; // Clear the container

    // Create a dynamic form structure
    const diver = createNew(container, "div", "", { id: "extra-form" });
    const formKegiatan = createNew(diver, "form", "", { id: "dynamicForm" });

    // Input fields and labels
    const labelNamaKegiatan = createNew(formKegiatan, "label", "Nama Kegiatan", { for: "namaKegiatan" });
    const inputNamaKegiatan = createNew(formKegiatan, "input", "", { id: "namaKegiatan", type: "text", name: "namaKegiatan" });
    createNew(formKegiatan, "br", "");

    const labelNamaKoperasi = createNew(formKegiatan, "label", "Nama Koperasi yang Didampingi", { for: "namaKoperasi" });
    const inputNamaKoperasi = createNew(formKegiatan, "input", "", { id: "namaKoperasi", type: "text", name: "namaKoperasi" });
    createNew(formKegiatan, "br", "");

    const labelNamaLokasi = createNew(formKegiatan, "label", "Lokasi", { for: "Lokasi" });
    const inputNamaLokasi = createNew(formKegiatan, "input", "", { id: "Lokasi", type: "text", name: "Lokasi" });
    createNew(formKegiatan, "br", "");

    const labelFileKegiatan = createNew(formKegiatan, "label", "Upload Images", { for: "fileKegiatan" });
    const inputFileKegiatan = createNew(formKegiatan, "input", "", { id: "fileKegiatan", type: "file", name: "fileKegiatan", accept: "image/*", multiple: true });
    createNew(formKegiatan, "br", "");

    const previewContainer = createNew(formKegiatan, "div", "", { id: "imagePreviewContainer" });
    createNew(formKegiatan, "br", "");

    const submitButton = createNew(formKegiatan, "input", "", { type: "submit", value: "Kirim Laporan" });
    const errorContainer = createNew(formKegiatan, "div", "", { id: "errorContainer", class: "error-container" });

    var base64Images;

    inputFileKegiatan.addEventListener("change", async (event) => {
        const files = Array.from(inputFileKegiatan.files);
        try {
            base64Images = await Promise.all(files.map(file => convertFileToBase64(file)))
            // Clear previous previews
            previewContainer.innerHTML = "";
    
            // Preview images
            base64Images.forEach((base64, index) => {
                const img = new Image();
                img.src = base64;
    
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
    
                    const maxWidth = 150;
                    const aspectRatio = img.width / img.height;
                    canvas.width = maxWidth;
                    canvas.height = maxWidth / aspectRatio;
    
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    previewContainer.appendChild(canvas);
                };
    
                img.onerror = () => {
                    console.error(`Error loading image at index ${index}`);
                };
            });
        } catch (error) {
            console.error("Error processing files:", error);
        }
    });
    

    // Event Listener for Form Submission
    formKegiatan.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent page reload

        // Validation
        const errors = [];
        if (!inputNamaKegiatan.value.trim()) errors.push("Nama Kegiatan is required.");
        if (!inputNamaKoperasi.value.trim()) errors.push("Nama Koperasi is required.");
        if (!inputNamaLokasi.value.trim()) errors.push("Lokasi is required.");

        errorContainer.innerHTML = ""; // Clear errors
        if (errors.length > 0) {
            errorContainer.addEventListener("click", () => {
                errorContainer.innerHTML = ""
            });

            errors.forEach((error) => 
                createNew(errorContainer, "p", error)
            );

            setTimeout(() => {
            // console.log("Timeout triggered"); // Debug message
            if (document.body.contains(errorContainer)) { // Check if it's still in the DOM
                errorContainer.innerHTML = ""
            }
            }, 3000);
           
            return;
        }
        // Prepare Data
        const namaKegiatan = inputNamaKegiatan.value;
        const namaKoperasi = inputNamaKoperasi.value;
        const namaLokasi = inputNamaLokasi.value;

        // Data to send
        const contents = {
            key: myKey,
            action: "extraSubmit_form",
            data: nickname_,
            images: base64Images,
            lat: S_Latitude,
            long: S_Longitude,
            kegiatan: namaKegiatan,
            koperasi: namaKoperasi,
            lokasi:namaLokasi,
        };

        // Send the data using Fetch
        try {
            container.innerHTML = ""; // Clear content
            createNew(container, "h2", "Mengirim Data", { class: "center" });

            const response = await fetch(endpoint, {
                redirect: "follow",
                method: "POST",
                headers: {
                    "Content-Type": "text/plain;charset=utf-8",
                },
                body: JSON.stringify(contents),
            });
            const data = await response.json();

            container.innerHTML = ""; // Clear content
            if (data.result === "OK") {
                createNew(container, "h1", "Kirim Laporan Berhasil");
                const divSubmit2 = createNew(container, "div", "", {id: "divSubmit"});
                createNew(divSubmit2,"input","",{type:"button",onclick:"makeExtraForm()",value:"Buat Laporan Baru"})
            } else {
                createNew(container, "h1", "Kirim Laporan Gagal");
                createNew(container, "p", "Jika Masalah tetap Berlanjut Hubungi Admin");
            }
        } catch (error) {
            console.error("Error:", error); // Log any error
            createNew(container, "h1", "Kirim Laporan Gagal");
        }
    });

    // Helper function to convert file to Base64
    function convertFileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}


function reloadPage() {
    location.reload(true); // Reloads the page
}

// Function to get a cookie
function getCookie(name) {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.startsWith(nameEQ)) {
        return cookie.substring(nameEQ.length, cookie.length);
        }
    }
    return null; // Return null if the cookie doesn't exist
}


function getLocation(){
    // Check if Geolocation API is supported
    if (!navigator.geolocation) {
      createNew(container,"h6","Mohon Hidupkan Lokasi Anda",{class:"notif"});
      return;
    }
    const locationResult = createNew(container,"h6","",{class:"notif"});
    // Get the user's location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        locationResult.textContent = `Latitude: ${latitude}, Longitude: ${longitude}`;
        S_Latitude = latitude;
        S_Longitude = longitude;
        gettingLocation_loader.remove();
        submitBtn = createNew(divSubmit, "input", "", {value: "OK", type: "submit"});
      },
      (error) => {
        locationResult.textContent = `Error: ${error.message}`;
      }
    );
}

function cameraCaptureListener(cameraInput,form,statuses,wrapperCapture){
    cameraInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
      
        if (!file) {
          statuses.textContent = "No file selected.";
          return;
        }
      
        // Ensure the file is an image
        if (!file.type.startsWith('image/')) {
          statuses.textContent = "Selected file is not an image.";
          return;
        }
      
        // Use FileReader to read the image as Base64
        const reader = new FileReader();
        reader.onload = () => {
            const base64Image = reader.result.split(',')[1]; // Remove "data:image/*;base64," prefix
            // console.log(base64Image); // Base64 string (plain text)
            base64Image_data = base64Image;
            
            const img = new Image();
            img.onload = () => {
                // Resize the image
                const MAX_WIDTH = 800;
                const scaleFactor = MAX_WIDTH / img.width;
        
                canvasPreview.width = MAX_WIDTH;
                canvasPreview.height = img.height * scaleFactor;
        
                // Draw the resized image on canvas
                ctx.drawImage(img, 0, 0, canvasPreview.width, canvasPreview.height);

                if (!divSubmit) {
                    divSubmit = createNew(form, "div", "", {id: "divSubmit"});
                }
                if (!submitBtn) {
                    wrapperCapture.remove(); //remove the capture button
                    gettingLocation_loader = createNew(container,"div","",{class:"notif"});
                    createNew(gettingLocation_loader,"h3","Sedang Mendapatkan Lokasi Anda");
                    getLocation();
                }
            };
        
            img.onerror = () => {
                statuses.textContent = "Error loading image.";
            };
        
            img.src = reader.result; // Set the image source

        };
      
      
        reader.onerror = () => {
          console.error("Error reading file.");
          statuses.textContent = "Error reading file.";
        };
      
        reader.readAsDataURL(file); // Read file as Base64 string
      });
}

function loadP(nickname) {
    // console.log("Tampilkan Halaman Presensi");
    const previewImage   = createNew(container,"div","",{id:"previewImage"});
    const canvas         = createNew(previewImage,"canvas","",{id:"canvasPreview",style:"max-width: 100%;"})
    const divform        = createNew(container,"div","",{id:"div-form"});
    const form           = createNew(divform,"form","");
    const statuses       = createNew(form,"p","",{class:"info"});
    const wrapperCapture = createNew(form,"div","");
    const cameraInput    = createNew(wrapperCapture,"input","",{ type:"file" , id:"cameraInput" ,  accept:"image/*" , capture:"environment"});
    const labelCapture   = createNew(wrapperCapture,"label","Ambil Foto",{for:"cameraInput"});
    ctx = canvas.getContext('2d');
    cameraCaptureListener(cameraInput,form,statuses,wrapperCapture);
    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent page reload
        container.innerHTML = ""; //clear content
        createNew(container,"h2","Mengirim Data",{class:"center"});
        const contents = {
            key :  myKey,
            action : "submit",
            data: nickname,
            image: base64Image_data,
            lat : S_Latitude,
            long: S_Longitude
        };
        fetch(endpoint, 
        { 
            redirect: "follow",
            method: 'POST', // Sending a POST request
            headers: {
                'Content-Type': 'text/plain;charset=utf-8', // Specify content type as text
            },
            body: JSON.stringify(contents), // Convert data to JSON string
            }
        ) .then(response => response.json()) // Handle the response
        .then(data => {
            console.log('Success:', data); // Log the response from the server
            container.textContent = ""
            if (data.result=="OK"){
                createNew(container,"h1","Presensi Berhasil");
                createNew(container,"p","Setelah Melakukan Presensi anda Bisa Membuat Laporan Kegiatan dengan menekan Tombol \"Buat Laporan\"");
                const divSubmit2 = createNew(container, "div", "", {id: "divSubmit"});
                createNew(divSubmit2,"input","",{type:"button",onclick:"makeExtraForm()",value:"Buat Laporan"})
            }else{
                createNew(container,"h1","Presensi Gagal");
                createNew(container,"p","Jika Masalah tetap Berlanjut Hubungi Atmin");
            }
        })
        .catch((error) => {
            console.error('Error:', error); // Log any error
        });
    });
}

function loadNP() {
    createNew(container,"h2","Anda Sudah Melakukan Presensi");
    if (!divSubmit) {
        divSubmit = createNew(container, "div", "", {id: "divSubmit"});
    }
    createNew(divSubmit,"input","",{type:"button",onclick:"makeExtraForm()",value:"Buat Laporan"})
}

function loadAbsensi(nickname){
    // console.log("user is Active");
    const loader = createNew(container,"p","Mohon Tunggu Sebentar",{class:"loader"});

    const contents = {
        key :  myKey,
        action : "cekPresence",
        data: nickname
    };

    fetch(endpoint, 
    { 
        redirect: "follow",
        method: 'POST', // Sending a POST request
        headers: {
            'Content-Type': 'text/plain;charset=utf-8', // Specify content type as text
        },
        body: JSON.stringify(contents), // Convert data to JSON string
        }
    ) .then(response => response.json()) // Handle the response
    .then(data => {
        console.log('Success: ', data); // Log the response from the server
        loader.remove();
        if (data.result == "OK"){
            loadNP(nickname)
        }else{
            loadP(nickname)
        }
    })
    .catch((error) => {
        console.error('Error:', error); // Log any error
    });

};

function userIsInactive(nickname){
    // console.log("user is inactive");
    createNew(container,"p","Sepertinya Nama Kamu Belum di Aktifkan Oleh Admin");
    if (!divSubmit) {
        divSubmit = createNew(container, "div", "", {id: "divSubmit"});
    }
    createNew(divSubmit,"input","",{type:"button",onclick:"reloadPage()",value:"Refresh"})
}

function loadUser(nickname) {

    // validate input nickname 
    if (typeof nickname !== 'string') {
        throw new Error('Nickname must be a string');
    }

    // Ensure the nickname is not empty and has a length between 3 and 20 characters
    if (nickname.trim().length === 0) {
        throw new Error('Nickname cannot be empty');
    }

    const contents = {
        key :  myKey,
        action : "checkName",
        data: nickname
    };

    fetch(endpoint, 
    { 
        redirect: "follow",
        method: 'POST', // Sending a POST request
        headers: {
            'Content-Type': 'text/plain;charset=utf-8', // Specify content type as text
        },
        body: JSON.stringify(contents), // Convert data to JSON string
        }
    ) .then(response => response.json()) // Handle the response
    .then(data => {
        console.log('Success: ', data); // Log the response from the server
        nicknameSection.remove();
        if (data.result == "OK"){
            loadAbsensi(nickname)
        }else{
            userIsInactive(nickname)
        }
    })
    .catch((error) => {
        console.error('Error:', error); // Log any error
    });
}

function onStart() {
    let nickname = getCookie('nickname'); // Check if the nickname cookie exists
    nicknameSection = createNew(container,"div","",{id:"div-form"});
    if (!nickname) {
        const welcomeMessage = createNew(nicknameSection,"h1","Sepertinya Anda Baru!");
        const nicknameForm = createNew(nicknameSection,"form","",{class:"small-form"});        
        createNew(nicknameForm,"label","Masukan Nama Lengkap :",{for:"nicknameInput"});
        const nicknameInput = createNew(nicknameForm,"input","",{type:"text", id:"nicknameInput"});
        createNew(nicknameForm,"button","Konfirmasi",{type:"submit"});
        nicknameForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent page reload

        // Get the input value
        nickname = nicknameInput.value.trim();

        if (nickname) {
          // Save the nickname as a cookie
          setCookie('nickname', nickname, 365); // Save for 1 year
          welcomeMessage.textContent = `Selamat Datang, ${nickname}!`;
          nicknameSection.remove();
        } else {
          alert('Please enter a valid nickname.');
        }
      });
    } else {
      // Use the saved nickname
      createNew(container,"h1",`Halo, ${nickname}!`);
      nickname_ = nickname;
      loadUser(nickname)
    }
  }

window.onload = () => {
    onStart();
};