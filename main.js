console.log("hi");

const XLEnum = {
    STUDENT_ID: 0,
    STUDENT_NAME: 1,
    ASSIGNMENT_NAME: 2,
    ASSIGNMENT_DESC: 3,
    SCORE: 4,
    WEIGHT: 5,
    ASSIGNMENT_TYPE: 6,
    ASSIGNMENT_DATE: 7,
    REPORT_CARD_ROWS: 8,
    SUBJECT: 9,      
}

window.addEventListener("load", () => {
    const csvUpload = document.getElementById("csv_upload");
    const xlsxUpload = document.getElementById("xlsx_upload");


    csvUpload.addEventListener("change", async e => {
        parseCSV(await e.target.files[0].text())
    })
    xlsxUpload.addEventListener("change", async e => {
        parseXLSX(XLSX.read(await e.target.files[0].arrayBuffer()))
    })
    function getBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
    }
    
    let classroomInfo;
    let synergySheet;
    
    /**
     * 
     * @param {string} csv 
     */
    function parseCSV(csv) {
        const titleEl = document.getElementById("classroom_title");
        const scoreEl = document.getElementById("classroom_score");
        const studentCountEl = document.getElementById("classroom_student_count");
    
        const cells = csvToArray(csv)
    
        if (cells[0][0] != "Last Name" || cells[0][1] != "First Name" || cells[0][2] != "Email Address" || cells[1][0] != "Date" || cells[2][0] != "Points") {
            console.warn("Uploaded CSV is not valid!")
        }
    
        const assignmentName = cells[0][3];
        const assignmentScore = cells[2][3];
        const studentDict = {};
        const studentInfo = cells.slice(3).map((cell) => {
            const student = {
                lastName: cell[0],
                firstName: cell[1],
                email: cell[2],
                score: cell[3]
            }
            studentDict[student.firstName + " " + student.lastName] = student;
            return student
        })
        console.log(studentInfo);
        gradedCount = studentInfo.filter(info => info.score != "").length;
        console.log(assignmentName, assignmentScore)
    
        titleEl.innerText = "Title: " + assignmentName;
        scoreEl.innerText = "Score Possible: " + assignmentScore;
        studentCountEl.innerText = `${gradedCount} Graded / ${studentInfo.length} Students`
    
        classroomInfo = {
            students: studentDict,
            assignmentName,
            assignmentScore
        };
        attemptShowCombine()
    }
    function parseXLSX(xslxFile) {
        const studentCountEl = document.getElementById("synergy_student_count");
    
        const sheet = csvToArray(XLSX.utils.sheet_to_csv(xslxFile.Sheets[xslxFile.SheetNames[0]]));
        console.log(sheet);
        const studentCount = sheet.slice(1).filter(row => row[1] != "").length;
        console.log(sheet.slice(2))
    
        studentCountEl.innerText = `${studentCount} Students`
    
        synergySheet = sheet;
        attemptShowCombine()
    }
    
    function attemptShowCombine() {
        if(classroomInfo && synergySheet) {
            const combineButton = document.getElementById("combine");
            combineButton.addEventListener("click", () => {combine()})
            combineButton.style.display = "inherit";
        }
    }
    
    function combine() {
        synergySheet.map((row, i) => {
            if (i == 0) return row;
            // Student Permanent ID, Student Name, Assignment Name, Assignment Description, Overall Score, Weight, Assignment Type, Assignment Date, Report Card Rows, Subject
            const name = row[XLEnum.STUDENT_NAME]
            const studentInfo = classroomInfo.students[name];
            row[XLEnum.ASSIGNMENT_NAME] = classroomInfo.assignmentName;
            row[XLEnum.SCORE] = `${studentInfo.score}/${classroomInfo.assignmentScore}`;
            return row;
        })
        const worksheet = XLSX.utils.aoa_to_sheet(synergySheet)
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Grades");
        XLSX.writeFile(workbook, "Grades.xlsx")
    }
    
    csvToArray = (csv) => csv.split('\n').map(s => s.split(','));
})