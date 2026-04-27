// Global variables
let currentScreen = 'instruction';
let currentRound = 1;
const totalRounds = 4; // Changed to 4 rounds
const facesPerRound = 10; // Changed to 10 faces per round
const selectionsPerRound = 4; // Changed to 4 selections per round

let faces = [];
let selectedFaces = [];
let allSelections = [];
let participantData = {
    gender: '',
    ageRange: ''
};
let allParticipantsData = {
    avgMalePct: 0,
    avgFemalePct: 0
};

// Grid parameters
let gridCols = 5; // Changed to 5 columns
let gridRows = 2; // Changed to 2 rows (5x2 = 10 faces)
let faceSize = 120; // Made larger since fewer faces
let gridSpacing = 20; // More spacing
let gridOffsetX, gridOffsetY;

// Images
let maleImages = [];
let femaleImages = [];
let welcomeScreenImage;

// Form inputs
let genderSelected = '';
let ageRangeSelected = ''; // Changed from ageValue
let inputActive = ''; // No longer needed but keeping for compatibility

// Click debouncing
let lastClickTime = 0;
let clickDebounceMs = 200; // Minimum time between clicks

function preload() {
    // Load welcome screen image
    welcomeScreenImage = loadImage('welcome_screen.png'); // or .jpg - we'll use your image
    
    // Load male images (20 total)
    for (let i = 1; i <= 20; i++) {
        let filename = 'images/male/male_' + nf(i, 2) + '.jpg';
        maleImages.push(loadImage(filename));
    }
    
    // Load female images (20 total) - CHANGED FROM 21
    for (let i = 1; i <= 20; i++) {
        let filename = 'images/female/female_' + nf(i, 2) + '.jpg';
        femaleImages.push(loadImage(filename));
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    generateFaces();
    textFont('Arial'); // Keep Arial as default
}

function generateFaces() {
    let allMaleFaces = []; // Pool of male faces
    let allFemaleFaces = []; // Pool of female faces
    
    // Generate all 20 male faces
    for (let i = 0; i < 20; i++) {
        allMaleFaces.push({
            id: i,
            gender: 'Male',
            image: maleImages[i]
        });
    }
    
    // Generate all 20 female faces
    for (let i = 20; i < 40; i++) {
        allFemaleFaces.push({
            id: i,
            gender: 'Female',
            image: femaleImages[i - 20]
        });
    }
    
    // Shuffle male faces
    for (let i = allMaleFaces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allMaleFaces[i], allMaleFaces[j]] = [allMaleFaces[j], allMaleFaces[i]];
    }
    
    // Shuffle female faces
    for (let i = allFemaleFaces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allFemaleFaces[i], allFemaleFaces[j]] = [allFemaleFaces[j], allFemaleFaces[i]];
    }
    
    // Pick 5 random males and 5 random females
    faces = [];
    faces = faces.concat(allMaleFaces.slice(0, 5));
    faces = faces.concat(allFemaleFaces.slice(0, 5));
    
    // Shuffle the combined 10 faces so males and females are mixed
    for (let i = faces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [faces[i], faces[j]] = [faces[j], faces[i]];
    }
}

function shuffleFaces() {
    for (let i = faces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [faces[i], faces[j]] = [faces[j], faces[i]];
    }
}

function draw() {
    if (currentScreen === 'instruction') {
        drawInstructions();
    } else if (currentScreen === 'demographic') {
        drawDemographicForm();
    } else if (currentScreen === 'selection') {
        drawSelection();
    } else if (currentScreen === 'results') {
        drawResults();
    }
}

function drawInstructions() {
    background(255);
    
    // Draw the welcome screen image to fill the canvas
    image(welcomeScreenImage, 0, 0, width, height);
    
    // The START button clickable area
    let btnX = width/2 - 60;
    let btnY = height * 0.75;
    let btnW = 120;
    let btnH = 60;
    
    let isHovered = mouseX > btnX && mouseX < btnX + btnW && mouseY > btnY && mouseY < btnY + btnH;
    if (isHovered) cursor(HAND);
}

function drawDemographicForm() {
    background(234, 212, 188); // New beige background
    
    // Add grainy effect
    loadPixels();
    for (let i = 0; i < pixels.length; i += 4) {
        let grain = random(-15, 15); // Adjust grain intensity
        pixels[i] += grain;     // Red
        pixels[i + 1] += grain; // Green
        pixels[i + 2] += grain; // Blue
    }
    updatePixels();
    
    // Use Helvetica font for this screen only
    push();
    
    fill(50, 40, 143); // Dark blue text
    textAlign(CENTER);
    
    // "Participant Information" - Helvetica Neue, bold
    textFont('Helvetica Neue');
    textSize(36);
    textStyle(BOLD);
    text('Participant Information', width/2, 120); // Lowered from 100
    
    // Subtitle - Helvetica Neue, bold
    textFont('Helvetica Neue');
    textSize(14);
    textStyle(BOLD);
    text('This data is anonymous and used only for research analysis', width/2, 160); // Lowered from 140
    
    let formY = 220; // Lowered from 200
    
    // Gender - Helvetica, BOLD
    textFont('Helvetica');
    textAlign(LEFT);
    textSize(18);
    textStyle(BOLD); // Changed to BOLD
    text('Gender:', width/2 - 200, formY);
    
    textStyle(NORMAL); // Back to normal for options
    textSize(16);
    drawRadioButton(width/2 - 200, formY + 30, 'Male', genderSelected === 'Male');
    drawRadioButton(width/2 - 50, formY + 30, 'Female', genderSelected === 'Female');
    drawRadioButton(width/2 + 100, formY + 30, 'Other', genderSelected === 'Other');
    
    // Age Range - Helvetica, BOLD
    formY += 120;
    textSize(18);
    textStyle(BOLD); // Changed to BOLD
    text('Age Range:', width/2 - 200, formY);
    
    textStyle(NORMAL); // Back to normal for options
    textSize(16);
    drawRadioButton(width/2 - 200, formY + 30, '18-25', ageRangeSelected === '18-25');
    drawRadioButton(width/2 - 50, formY + 30, '26-35', ageRangeSelected === '26-35');
    drawRadioButton(width/2 + 100, formY + 30, '36-45', ageRangeSelected === '36-45');
    
    formY += 60;
    drawRadioButton(width/2 - 200, formY, '46-55', ageRangeSelected === '46-55');
    drawRadioButton(width/2 - 50, formY, '56-65', ageRangeSelected === '56-65');
    drawRadioButton(width/2 + 100, formY, '66+', ageRangeSelected === '66+');
    
    // Submit button
    formY += 100;
    let canSubmit = genderSelected !== '' && ageRangeSelected !== '';
    drawButton(width/2 - 100, formY, 200, 50, 'Select Leader', canSubmit); // Changed button size and text
    
    pop(); // Restore original font
}

function drawSelection() {
    background(234, 212, 188); // Same beige as demographic form
    
    // Add grainy effect
    loadPixels();
    for (let i = 0; i < pixels.length; i += 4) {
        let grain = random(-15, 15);
        pixels[i] += grain;     // Red
        pixels[i + 1] += grain; // Green
        pixels[i + 2] += grain; // Blue
    }
    updatePixels();
    
    // Instructions text at the top
    push();
    fill(50, 40, 143); // Dark blue text
    textFont('Helvetica');
    textAlign(CENTER);
    
    textSize(24);
    textStyle(BOLD);
    text('Instructions', width/2, 60);
    
    textSize(16);
    textStyle(NORMAL);
    textAlign(LEFT);
    let instructX = width/2 - 300;
    text('* Click on 4 faces in each round that you perceive as leaders', instructX, 100);
    text('* You must select exactly 4 people per round', instructX, 125);
    text('* There are 4 rounds total', instructX, 150);
    text('* After all rounds, you\'ll see an analysis of your selections', instructX, 175);
    pop();
    
    // Calculate grid (positioned lower to make room for instructions)
    let totalGridWidth = gridCols * (faceSize + gridSpacing) - gridSpacing;
    let totalGridHeight = gridRows * (faceSize + gridSpacing) - gridSpacing;
    gridOffsetX = (width - totalGridWidth) / 2;
    gridOffsetY = 220; // Fixed position below instructions
    
    // Draw faces
    for (let i = 0; i < faces.length; i++) {
        let col = i % gridCols;
        let rowIndex = floor(i / gridCols);
        let x = gridOffsetX + col * (faceSize + gridSpacing);
        let y = gridOffsetY + rowIndex * (faceSize + gridSpacing);
        
        drawFace(faces[i], x, y, i);
    }
    
    // Draw next button if exactly 4 selected - positioned below faces
    if (selectedFaces.length === selectionsPerRound) {
        let buttonY = gridOffsetY + (gridRows * (faceSize + gridSpacing)) + 30; // 30px below grid
        drawButton(width/2 - 100, buttonY, 200, 50, 'NEXT ROUND', true);
    }
}

function drawFace(face, x, y, index) {
    let isSelected = selectedFaces.includes(index);
    let isHovered = mouseX > x && mouseX < x + faceSize && 
                    mouseY > y && mouseY < y + faceSize;
    
    push();
    
    // Background
    fill(255);
    stroke(200);
    strokeWeight(1);
    rect(x, y, faceSize, faceSize);
    
    // Image
    if (face.image) {
        image(face.image, x, y, faceSize, faceSize);
    }
    
    // Selection highlight - RED RGB(195, 41, 17)
    if (isSelected) {
        noFill();
        stroke(195, 41, 17); // Red selection color
        strokeWeight(6); // Increased from 4 to 6
        rect(x, y, faceSize, faceSize);
        // Removed selection number circle
    }
    
    // Hover effect
    if (isHovered && !isSelected) {
        noFill();
        stroke(100);
        strokeWeight(2);
        rect(x, y, faceSize, faceSize);
    }
    
    pop();
}

function drawResults() {
    background(245, 245, 240);
    
    fill(0);
    textAlign(CENTER);
    textSize(40);
    textStyle(BOLD);
    text('Results', width/2, 100);
    
    textSize(16);
    textStyle(NORMAL);
    text('Thank you for participating in this study.', width/2, 150);
    text('Here\'s an analysis of your leadership selections.', width/2, 175);
    
    // Legend at top (centered)
    push();
    textSize(14);
    textAlign(LEFT);
    
    // Male legend
    fill(50, 40, 143);
    rect(width/2 - 100, 210, 20, 20);
    fill(0);
    text('Male', width/2 - 75, 225);
    
    // Female legend
    fill(234, 143, 1);
    rect(width/2 + 10, 210, 20, 20);
    fill(0);
    text('Female', width/2 + 35, 225);
    pop();
    
    // Calculate stats
    let yourMaleCount = allSelections.filter(s => s.gender === 'Male').length;
    let yourFemaleCount = allSelections.filter(s => s.gender === 'Female').length;
    let total = allSelections.length;
    
    let yourMalePct = ((yourMaleCount / total) * 100).toFixed(0);
    let yourFemalePct = ((yourFemaleCount / total) * 100).toFixed(0);
    
    // Your Selections Pie Chart
    push();
    textSize(18);
    textStyle(BOLD);
    text('Your Selections', width/2 - 200, 280);
    
    let pieX = width/2 - 200;
    let pieY = 400;
    let pieSize = 200;
    
    // Draw pie chart
    let maleAngle = (yourMaleCount / total) * TWO_PI;
    
    // Male slice (dark blue)
    fill(50, 40, 143);
    arc(pieX, pieY, pieSize, pieSize, 0, maleAngle, PIE);
    
    // Female slice (orange)
    fill(234, 143, 1);
    arc(pieX, pieY, pieSize, pieSize, maleAngle, TWO_PI, PIE);
    
    // Percentages only (white text)
    textSize(24);
    textStyle(BOLD);
    fill(255);
    
    // Male percentage
    let maleTextAngle = maleAngle / 2;
    let maleTextX = pieX + cos(maleTextAngle) * 60;
    let maleTextY = pieY + sin(maleTextAngle) * 60;
    text(`${yourMalePct}%`, maleTextX, maleTextY);
    
    // Female percentage
    let femaleTextAngle = maleAngle + (TWO_PI - maleAngle) / 2;
    let femaleTextX = pieX + cos(femaleTextAngle) * 60;
    let femaleTextY = pieY + sin(femaleTextAngle) * 60;
    text(`${yourFemalePct}%`, femaleTextX, femaleTextY);
    pop();
    
    // All Participants Pie Chart
    push();
    textSize(18);
    textStyle(BOLD);
    textAlign(CENTER);
    text('All Participants', width/2 + 200, 280);
    
    pieX = width/2 + 200;
    
    // Draw pie chart (using aggregate data)
    let allMaleAngle = (allParticipantsData.avgMalePct / 100) * TWO_PI;
    
    // Male slice (dark blue)
    fill(50, 40, 143);
    arc(pieX, pieY, pieSize, pieSize, 0, allMaleAngle, PIE);
    
    // Female slice (orange)
    fill(234, 143, 1);
    arc(pieX, pieY, pieSize, pieSize, allMaleAngle, TWO_PI, PIE);
    
    // Percentages only (white text)
    textSize(24);
    textStyle(BOLD);
    fill(255);
    
    // Male percentage
    let allMaleTextAngle = allMaleAngle / 2;
    let allMaleTextX = pieX + cos(allMaleTextAngle) * 60;
    let allMaleTextY = pieY + sin(allMaleTextAngle) * 60;
    text(`${allParticipantsData.avgMalePct}%`, allMaleTextX, allMaleTextY);
    
    // Female percentage
    let allFemaleTextAngle = allMaleAngle + (TWO_PI - allMaleAngle) / 2;
    let allFemaleTextX = pieX + cos(allFemaleTextAngle) * 60;
    let allFemaleTextY = pieY + sin(allFemaleTextAngle) * 60;
    text(`${allParticipantsData.avgFemalePct}%`, allFemaleTextX, allFemaleTextY);
    pop();
    
    // Footer text - compact and positioned higher
    fill(0);
    textSize(16);
    textAlign(CENTER);
    textStyle(NORMAL);
    text('Your data has been recorded. This study explores implicit biases in leadership perception.', width/2, pieY + 160);
    text('Research shows that people often unconsciously favor certain demographic characteristics', width/2, pieY + 185);
    text('when identifying leadership potential, which can contribute to systemic inequality.', width/2, pieY + 210);
}

function drawStatBox(x, y, w, h, label, value, description) {
    fill(255);
    stroke(0);
    strokeWeight(2);
    rect(x, y, w, h);
    
    fill(0);
    noStroke();
    textAlign(CENTER, TOP);
    textSize(12);
    textStyle(NORMAL);
    text(label, x + w/2, y + 15);
    
    textSize(48);
    textStyle(BOLD);
    text(value, x + w/2, y + 40);
    
    textSize(14);
    textStyle(NORMAL);
    text(description, x + w/2, y + 95);
}

function drawButton(x, y, w, h, label, enabled) {
    let isHovered = mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;
    
    if (enabled) {
        if (isHovered) {
            fill(210, 130, 0); // Slightly darker orange on hover
        } else {
            fill(234, 143, 1); // Orange background RGB(234, 143, 1)
        }
        cursor(isHovered ? HAND : ARROW);
    } else {
        fill(234, 143, 1); // Orange even when disabled (was gray)
        cursor(ARROW);
    }
    
    noStroke(); // No stroke
    rect(x, y, w, h, 5);
    
    fill(50, 40, 143); // Dark blue text
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(20); // Increased from 16 to 20
    textStyle(BOLD);
    text(label, x + w/2, y + h/2);
    
    return isHovered && enabled;
}

function drawRadioButton(x, y, label, selected) {
    let isHovered = dist(mouseX, mouseY, x + 10, y + 10) < 15;
    
    // Circle
    stroke(50, 40, 143); // Dark blue stroke
    strokeWeight(2);
    fill(234, 212, 188); // Beige background
    circle(x + 10, y + 10, 20);
    
    if (selected) {
        fill(50, 40, 143); // Dark blue fill when selected
        noStroke();
        circle(x + 10, y + 10, 10);
    }
    
    // Label
    fill(50, 40, 143); // Dark blue text
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(16);
    text(label, x + 30, y + 10);
    
    if (isHovered) cursor(HAND);
}

function drawTextInput(x, y, w, h, value, active, fieldName) {
    stroke(active ? 0 : 150);
    strokeWeight(active ? 2 : 1);
    fill(255);
    rect(x, y, w, h);
    
    fill(0);
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(16);
    text(value + (active ? '|' : ''), x + 10, y + h/2);
    
    let isHovered = mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;
    if (isHovered) cursor(TEXT);
}

function mousePressed() {
    // Debounce clicks to prevent multiple rapid registrations
    let currentTime = millis();
    if (currentTime - lastClickTime < clickDebounceMs) {
        console.log('Click ignored - too fast');
        return;
    }
    lastClickTime = currentTime;
    
    cursor(ARROW);
    
    if (currentScreen === 'instruction') {
        // START button area (adjusted to match image)
        let btnX = width/2 - 60;
        let btnY = height * 0.75;
        let btnW = 120;
        let btnH = 60;
        
        if (mouseX > btnX && mouseX < btnX + btnW &&
            mouseY > btnY && mouseY < btnY + btnH) {
            currentScreen = 'demographic';
        }
    } else if (currentScreen === 'demographic') {
        handleDemographicClick();
    } else if (currentScreen === 'selection') {
        handleSelectionClick();
    }
}

function handleDemographicClick() {
    let formY = 220; // Updated to match new position
    
    // Gender clicks
    if (dist(mouseX, mouseY, width/2 - 190, formY + 40) < 15) genderSelected = 'Male';
    if (dist(mouseX, mouseY, width/2 - 40, formY + 40) < 15) genderSelected = 'Female';
    if (dist(mouseX, mouseY, width/2 + 110, formY + 40) < 15) genderSelected = 'Other';
    
    // Age Range clicks (first row)
    formY += 120;
    if (dist(mouseX, mouseY, width/2 - 190, formY + 40) < 15) ageRangeSelected = '18-25';
    if (dist(mouseX, mouseY, width/2 - 40, formY + 40) < 15) ageRangeSelected = '26-35';
    if (dist(mouseX, mouseY, width/2 + 110, formY + 40) < 15) ageRangeSelected = '36-45';
    
    // Age Range clicks (second row)
    formY += 60;
    if (dist(mouseX, mouseY, width/2 - 190, formY + 10) < 15) ageRangeSelected = '46-55';
    if (dist(mouseX, mouseY, width/2 - 40, formY + 10) < 15) ageRangeSelected = '56-65';
    if (dist(mouseX, mouseY, width/2 + 110, formY + 10) < 15) ageRangeSelected = '66+';
    
    // Submit button - updated position and size
    formY += 100;
    if (genderSelected !== '' && ageRangeSelected !== '') {
        if (mouseX > width/2 - 100 && mouseX < width/2 + 100 &&
            mouseY > formY && mouseY < formY + 50) {
            participantData = {
                gender: genderSelected,
                ageRange: ageRangeSelected
            };
            console.log('Participant data set:', participantData); // Debug log
            currentScreen = 'selection';
        }
    }
}

function handleSelectionClick() {
    // Next button - positioned below faces
    if (selectedFaces.length === selectionsPerRound) {
        let buttonY = gridOffsetY + (gridRows * (faceSize + gridSpacing)) + 30;
        if (mouseX > width/2 - 100 && mouseX < width/2 + 100 &&
            mouseY > buttonY && mouseY < buttonY + 50) {
            nextRound();
            return;
        }
    }
    
    // Face clicks
    for (let i = 0; i < faces.length; i++) {
        let col = i % gridCols;
        let rowIndex = floor(i / gridCols);
        let x = gridOffsetX + col * (faceSize + gridSpacing);
        let y = gridOffsetY + rowIndex * (faceSize + gridSpacing);
        
        if (mouseX > x && mouseX < x + faceSize && 
            mouseY > y && mouseY < y + faceSize) {
            toggleSelection(i);
            break;
        }
    }
}

function toggleSelection(index) {
    let selectedIndex = selectedFaces.indexOf(index);
    
    console.log('Clicked face:', index);
    console.log('Currently selected:', selectedFaces);
    
    if (selectedIndex > -1) {
        // Face is already selected, deselect it
        selectedFaces.splice(selectedIndex, 1);
        console.log('Deselected face', index);
    } else {
        // Face not selected, try to add it
        if (selectedFaces.length < selectionsPerRound) {
            selectedFaces.push(index);
            console.log('Selected face', index);
        } else {
            console.log('Already at max selections (4)'); // Updated to 4
        }
    }
    
    console.log('After toggle:', selectedFaces);
}

function nextRound() {
    // Record selections
    selectedFaces.forEach(index => {
        allSelections.push({
            faceId: faces[index].id,
            gender: faces[index].gender,
            round: currentRound
        });
    });
    
    if (currentRound < totalRounds) {
        currentRound++;
        selectedFaces = [];
        generateFaces(); // Generate new random 10 faces
    } else {
        finishStudy();
    }
}

function finishStudy() {
    currentScreen = 'results';
    
    // Send data to sheets
    sendDataToSheets();
    
    // Wait 2 seconds for data to be saved, then fetch aggregate
    setTimeout(() => {
        // Fetch aggregate data from Google Sheets using CSV export
        const SHEET_ID = '1k6eVlKSXF5A71uCm-ZRwo9uXUgEX8TTgoPTdvWVD0ik';
        const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;
        
        fetch(CSV_URL)
            .then(response => response.text())
            .then(csvText => {
                console.log('CSV fetched successfully');
                console.log('CSV content:', csvText.substring(0, 500)); // First 500 chars
                
                // Parse CSV
                const lines = csvText.split('\n');
                console.log('Total lines:', lines.length);
                const rows = lines.slice(1); // Skip header
                
                let totalMale = 0;
                let totalFemale = 0;
                
                rows.forEach(row => {
                    if (row.trim() === '') return;
                    const cols = row.split(',');
                    // Since Age_Range column is currently empty, Face_Gender is at index 5
                    // When Age_Range is fixed, it will still be at index 5
                    const faceGender = cols[5]?.trim(); // Face_Gender column with safe access
                    
                    console.log('Row:', cols, 'FaceGender:', faceGender);
                    
                    if (faceGender === 'Male') totalMale++;
                    if (faceGender === 'Female') totalFemale++;
                });
                
                console.log('Total Male:', totalMale, 'Total Female:', totalFemale);
                
                const total = totalMale + totalFemale;
                
                if (total > 0) {
                    allParticipantsData = {
                        avgMalePct: Math.round((totalMale / total) * 100),
                        avgFemalePct: Math.round((totalFemale / total) * 100)
                    };
                } else {
                    // No data yet, use 50/50
                    allParticipantsData = {
                        avgMalePct: 50,
                        avgFemalePct: 50
                    };
                }
                
                console.log('Final aggregate data:', allParticipantsData);
            })
            .catch(error => {
                console.error('Error fetching aggregate data:', error);
                // Fallback to 50/50
                allParticipantsData = {
                    avgMalePct: 50,
                    avgFemalePct: 50
                };
            });
    }, 2000); // Wait 2 seconds
}

function sendDataToSheets() {
    // Prepare data
    const submissionData = {
        timestamp: new Date().toISOString(),
        participant: participantData,
        selections: allSelections,
        summary: {
            maleCount: allSelections.filter(s => s.gender === 'Male').length,
            femaleCount: allSelections.filter(s => s.gender === 'Female').length
        }
    };
    
    console.log('Sending data to Google Sheets:', submissionData);
    
    // Send to Google Sheets
    const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbygyNXXayEqmIOkqPz_FIMb0JqA0ADJs6P69FkGV8SIy1yCX0M3U8Z8nMjya8Poldb8gg/exec';
    
    fetch(WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
    })
    .then(() => {
        console.log('Data sent successfully!');
    })
    .catch(error => {
        console.error('Error sending data:', error);
    });
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
