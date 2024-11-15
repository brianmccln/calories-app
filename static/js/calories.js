// get the DOM elements:
const fileInput = document.querySelector('input');
const sendBtn = document.querySelector('button');
const uploadedImg = document.querySelector('#uploaded-img');
const mealNameP = document.querySelector('#meal-name');
const descriptionP = document.querySelector('#description');
const prepInstructionsP = document.querySelector('#prep-instructions');
const calCountP = document.querySelector('#calorie-count');
const calsPerItemP = document.querySelector('#calories-per-item');
const gramsP = document.querySelector('#grams');
// get the micronutirents checkboxes
const vitaminsCB = document.querySelector('#vitamins-cb');
const mineralsCB = document.querySelector('#minerals-cb');
// get the vitamins and minerals p tags for output (which occurs only if checkboxes are checked)
const vitaminsP = document.querySelector('#vitamins');
const mineralsP = document.querySelector('#minerals');

// call a function when fileInput changes (which occurs whenever an image is browsed to and its name appears)
fileInput.addEventListener('change', displayUploadedImage);
sendBtn.addEventListener('click', sendImageToPythonFlask);

// instantiate a new FormData obj and append the uploaded file to the form data obj
let formData;
let uploadedFile;

// function runs when Choose File gets image file
function displayUploadedImage() {
    // store the uploaded img obj as var.. uploaded img exists as item 0 of files array which is a property of the fileInput obj
    uploadedFile = fileInput.files[0];
    // instantiate a new, fresh FormData obj which will erase previous image that may have been uploaded by mistake
    formData = new FormData();
    formData.append("image", uploadedFile);
    // calCountP.textContent = formData;
    // set the src of the uploadedImg img tag to be the uploaded image (as oppsed to no source) -- your uploaded image should appear in the img element .. !!
    uploadedImg.src = URL.createObjectURL(uploadedFile);
}

// function funs when user clicks Send Image button
function sendImageToPythonFlask() {
    // check if checkboxes are checked
    console.log("Vitamins checked:", vitaminsCB.checked);
    console.log("Minerals checked:", mineralsCB.checked);
    let isVitamins = vitaminsCB.checked; // true or false
    let isMinerals = mineralsCB.checked;
    // add the vitamins and minerals booleans to the form data obj
    // which already has the image data:
    formData.append("isVitamins", isVitamins);
    formData.append("isMinerals", isMinerals);

    // if no image uploaded, uploadedFile is still undefined, which is falsey return / exit
    if(!uploadedFile) {
        console.log("No file uploaded!")
        calCountP.textContent = "You must upload a food image file before clicking Send button!";
        return
    }
    // do a fetch()-then()-then() triple play, sending the formData to python route, which will take it from there by sending image w prompt to AI for analysis
    fetch('/upload', {
        method: "POST",
        body: formData,
    })
    .then(resJson => resJson.json())
    .then(resObj => {
        console.log(resObj)
        mealNameP.textContent = resObj.meal_name;
        descriptionP.textContent = resObj.description;
        prepInstructionsP.innerHTML = "<b>Prep Instructions:</b> " + resObj.prep_instructions;
        calCountP.textContent = "Total Calories: " + resObj.total_calories;
        // loop the items: {name: broccoli, cals: 80}
        const calsPerItem = resObj.calories_per_item;
        calsPerItemP.innerHTML = "<b>Itemized Calories:</b>"
        for(let i = 0; i < calsPerItem.length; i++) {
            calsPerItemP.innerHTML += `<br>${calsPerItem[i].name} : 
                                        ${calsPerItem[i].cals} cals`;
        }
        gramsP.innerHTML = `Protein: ${resObj.grams_protein}g 
                            | Fat: ${resObj.grams_fat}g
                            | Carbs: ${resObj.grams_carbs}g`
        // conditionally output vitamin and / or mineral data:
        if(resObj.vitamins) {
            vitaminsP.innerHTML = "<b>Vitamins:</b>";
            vitaminsP.innerHTML += `<br>Vitamin A: ${resObj.vitamins.A.mg}mg - RDA: ${resObj.vitamins.A.pct_rda}%`;
            vitaminsP.innerHTML += `<br>B1 (thiamine): ${resObj.vitamins.B1.mg}mg - RDA: ${resObj.vitamins.B1.pct_rda}%`;
            vitaminsP.innerHTML += `<br>B2 (riboflavin): ${resObj.vitamins.B2.mg}mg - RDA: ${resObj.vitamins.B2.pct_rda}%`;
            vitaminsP.innerHTML += `<br>B3 (niacin): ${resObj.vitamins.B3.mg}mg - RDA: ${resObj.vitamins.B3.pct_rda}%`;
            vitaminsP.innerHTML += `<br>B5 (pantonthenic acid): ${resObj.vitamins.B5.mg}mg - RDA: ${resObj.vitamins.B5.pct_rda}%`;
            vitaminsP.innerHTML += `<br>B6 (pyridoxine): ${resObj.vitamins.B6.mg}mg - RDA: ${resObj.vitamins.B6.pct_rda}%`;
            vitaminsP.innerHTML += `<br>B7 (biotin): ${resObj.vitamins.B7.mg}mg - RDA: ${resObj.vitamins.B7.pct_rda}%`;
            vitaminsP.innerHTML += `<br>B9 (folic acid): ${resObj.vitamins.B9.mg}mg - RDA: ${resObj.vitamins.B9.pct_rda}%`;
            vitaminsP.innerHTML += `<br>B12 (cyanocobalamin): ${resObj.vitamins.B12.mg}mg - RDA: ${resObj.vitamins.B12.pct_rda}%`;
            vitaminsP.innerHTML += `<br>C (ascorbic acid): ${resObj.vitamins.C.mg}mg - RDA: ${resObj.vitamins.C.pct_rda}%`;
            vitaminsP.innerHTML += `<br>D2 (ergocalciferol): ${resObj.vitamins.D2.mg}mg - RDA: ${resObj.vitamins.D2.pct_rda}%`;
            vitaminsP.innerHTML += `<br>D3 (cholecalciferol): ${resObj.vitamins.D3.mg}mg - RDA: ${resObj.vitamins.D3.pct_rda}%`;
            vitaminsP.innerHTML += `<br>E (alpha-tocopherol): ${resObj.vitamins.E.mg}mg - RDA: ${resObj.vitamins.E.pct_rda}%`;
        }
        if(resObj.minerals) {
            mineralsP.innerHTML = "<b>Minerals:</b>";
            mineralsP.innerHTML += `<br>Calcium (Ca): ${resObj.minerals.calcium.mg}mg - RDA: ${resObj.minerals.calcium.pct_rda}%`;
            mineralsP.innerHTML += `<br>Chromium (Cr): ${resObj.minerals.chromium.mg}mg - RDA: ${resObj.minerals.chromium.pct_rda}%`;
            mineralsP.innerHTML += `<br>Copper (Cu): ${resObj.minerals.copper.mg}mg - RDA: ${resObj.minerals.copper.pct_rda}%`;
            mineralsP.innerHTML += `<br>Iodine (I): ${resObj.minerals.iodine.mg}mg - RDA: ${resObj.minerals.iodine.pct_rda}%`;
            mineralsP.innerHTML += `<br>Iron (Fe): ${resObj.minerals.iron.mg}mg - RDA: ${resObj.minerals.iron.pct_rda}%`;
            mineralsP.innerHTML += `<br>Magnesium (Mg): ${resObj.minerals.magnesium.mg}mg - RDA: ${resObj.minerals.magnesium.pct_rda}%`;
            mineralsP.innerHTML += `<br>Manganese (Mn): ${resObj.minerals.manganese.mg}mg - RDA: ${resObj.minerals.manganese.pct_rda}%`;
            mineralsP.innerHTML += `<br>Phosphorous (P): ${resObj.minerals.phosphorous.mg}mg - RDA: ${resObj.minerals.phosphorous.pct_rda}%`;
            mineralsP.innerHTML += `<br>Potassium (K): ${resObj.minerals.potassium.mg}mg - RDA: ${resObj.minerals.potassium.pct_rda}%`;
            mineralsP.innerHTML += `<br>Selenium (Se): ${resObj.minerals.selenium.mg}mg - RDA: ${resObj.minerals.selenium.pct_rda}%`;
            mineralsP.innerHTML += `<br>Sodium (Na): ${resObj.minerals.sodium.mg}mg - RDA: ${resObj.minerals.sodium.pct_rda}%`;
            mineralsP.innerHTML += `<br>Sulfur (S): ${resObj.minerals.sulfur.mg}mg - RDA: ${resObj.minerals.sulfur.pct_rda}%`;
            mineralsP.innerHTML += `<br>Zinc (Zn): ${resObj.minerals.zinc.mg}mg - RDA: ${resObj.minerals.zinc.pct_rda}%`;
        }
    })
    .catch(error => console.log(error))
} // end function