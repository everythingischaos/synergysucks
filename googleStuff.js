/* exported gapiLoaded */
/* exported gisLoaded */
/* exported handleAuthClick */
/* exported handleSignoutClick */

// TODO(developer): Set to client ID and API key from the Developer Console
const CLIENT_ID =
    "477492377681-15hlhfubmud23tab1biqttd6dua77cm7.apps.googleusercontent.com";
const API_KEY = "AIzaSyDYK2clSm9IR3YqcxH_YvVbVPfgo709Yxk";

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = "https://classroom.googleapis.com/$discovery/rest";

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = "https://www.googleapis.com/auth/classroom.coursework.students.readonly \ https://www.googleapis.com/auth/classroom.rosters.readonly"
let tokenClient;
let gapiInited = false;
let gisInited = false;

let authorizeButton;
let coursesDiv;
let courseworkDiv;

let studentsData = {};

window.onload = () => {
    authorizeButton = document.getElementById("authorize_button");
    coursesDiv = document.getElementById("courses_div");
    courseworkDiv = document.getElementById("coursework_div");
    console.log(document.getElementById("authorize_button"))
    authorizeButton.style.visibility = "hidden";
    authorizeButton.addEventListener('click', () => {
        handleAuthClick();
    })
}



/**
 * Callback after api.js is loaded.
 */
function gapiLoaded() {
    gapi.load("client", initializeGapiClient);
}

/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 */
async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
    maybeEnableButtons();
}

/**
 * Callback after Google Identity Services are loaded.
 */
function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: "", // defined later
    });
    gisInited = true;
    maybeEnableButtons();
}

/**
 * Enables user interaction after all libraries are loaded.
 */
function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        authorizeButton.style.visibility = "visible";
    }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick() {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw resp;
        }
        authorizeButton.innerText = "Refresh";
        await listCourses();
    };

    if (gapi.client.getToken() === null) {
        // Prompt the user to select a Google Account and ask for consent to share their data
        // when establishing a new session.
        tokenClient.requestAccessToken({ prompt: "consent" });
    } else {
        // Skip display of account chooser and consent dialog for an existing session.
        tokenClient.requestAccessToken({ prompt: "" });
    }
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken("");
        coursesDiv.innerText = "";
        authorizeButton.innerText = "Authorize";
    }
}

/**
 * Print the names of the first 10 courses the user has access to. If
 * no courses are found an appropriate message is printed.
 */
async function listCourses() {
    let response;
    try {
        response = await gapi.client.classroom.courses.list({
            pageSize: 10,
            teacherId: "me",
        });
    } catch (err) {
        coursesDiv.innerText = err.message;
        return;
    }

    const courses = response.result.courses;
    if (!courses || courses.length == 0) {
        coursesDiv.innerText = "No courses found.";
        return;
    }
    // Flatten to string to display
    const output = courses.reduce(
        // (str, course) => `${str}<input value='${course.id}' id='class_${course.id}' type='radio' name='course'><label for='class_${course.id}'>${course.name}</label><br/>`,
        (str, course) => `${str}<button id='class_${course.id}' onclick='getClass(${course.id})'>${course.name}</button><br/>`,
        "Courses:<br/>"
    );
    coursesDiv.innerHTML = output;
    
}
async function getClass(id) {
    getStudents(id)
    let response;
    try {
        response = await gapi.client.classroom.courses.courseWork.list({
            courseId: id
        });
    } catch (err) {
        coursesDiv.innerText = err.message;
        return;
    }

    const courseWork = response.result.courseWork;
    if (!courseWork || courseWork.length == 0) {
        courseworkDiv.innerText = "No courseWork found.";
        return;
    }
    // Flatten to string to display
    const output = courseWork.reduce(
        // (str, course) => `${str}<input value='${course.id}' id='class_${course.id}' type='radio' name='course'><label for='class_${course.id}'>${course.name}</label><br/>`,
        (str, work) => `${str}<button id='class_${work.id}' onclick='getCourseWork(${id},${work.id})'>${work.title}</button><br/>`,
        "Coursework:<br/>"
    );
    courseworkDiv.innerHTML = output;
}

async function getStudents(courseId) {
    console.log(courseId)
    let response;
    try {
        response = await gapi.client.classroom.courses.students.list({
            courseId: courseId
        });
    } catch (err) {
        console.error(err.message);
        return;
    }

    response.result.students.forEach((student) => studentsData[student.profile.id] = student.profile.name.fullName);
    console.log(studentsData)
}

async function getCourseWork(courseId, workId) {
    let response;
    try {
        response = await gapi.client.classroom.courses.courseWork.studentSubmissions.list({
            courseId: courseId,
            courseWorkId: workId,
            states: ["RETURNED"]
        });
    } catch (err) {
        coursesDiv.innerText = err.message;
        return;
    }


    console.log("courseworkthing", response);
    const submissions = response.result.studentSubmissions;
    let csv = submissions.reduce(
        (str, submission) => `${str}${studentsData[submission.userId]}, ${submission.assignedGrade}\n`,
        'Name,Grade\n'
    )
    console.log("bruh", csv)
    document.getElementById("output").innerText = csv;
    // if (!courseWork || courseWork.length == 0) {
    //     courseworkDiv.innerText = "No courseWork found.";
    //     return;
    // }
    // // Flatten to string to display
    // const output = courseWork.reduce(
    //     // (str, course) => `${str}<input value='${course.id}' id='class_${course.id}' type='radio' name='course'><label for='class_${course.id}'>${course.name}</label><br/>`,
    //     (str, work) => `${str}<button id='class_${work.id}' onclick='getCourseWork(${work.id})'>${work.title}</button><br/>`,
    //     "Coursework:<br/>"
    // );
    // courseworkDiv.innerHTML = output;
}