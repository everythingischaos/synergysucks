console.log("hi");

window.addEventListener("load", () => {
    const csvUpload = document.getElementById("csv_upload");
    const xlsxUpload = document.getElementById("xlsx_upload");


    csvUpload.addEventListener("change", async e => {
        parseCSV(await e.target.files[0].text())
    })
})
function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * 
 * @param {string} csv 
 */
function parseCSV(csv) {
    const titleEl = document.getElementById("classroom_title");
    const scoreEl = document.getElementById("classroom_score");
    const studentCountEl = document.getElementById("classroom_student_count");

    const rows = csv.split('\n');
    const cells = rows.map(s => s.split(','));

    if (cells[0][0] != "Last Name" || cells[0][1] != "First Name" || cells[0][2] != "Email Address" || cells[1][0] != "Date" || cells[2][0] != "Points") {
        console.warn("Uploaded CSV is not valid!")
    }

    const assignmentName = cells[0][3];
    const assignentScore = cells[2][3];
    const studentInfo = cells.slice(3).map((cell) => {
        return {
            lastName: cell[0],
            firstName: cell[1],
            email: cell[2],
            score: cell[3]
        }
    })
    console.log(studentInfo);
    gradedCount = studentInfo.filter(info => info.score != "").length;
    console.log(assignmentName, assignentScore)

    titleEl.innerText = "Title: " + assignmentName;
    scoreEl.innerText = "Score Possible: " + assignentScore;
    studentCountEl.innerText = `${gradedCount} Graded / ${studentInfo.length} Students`

}