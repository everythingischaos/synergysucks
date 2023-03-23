console.log("hi");

document.querySelector("#filesubmit").addEventListener("submit", async (e) => {
  e.preventDefault();
  const file = await getBase64(document.querySelector("#file").files[0]);
  console.log(file);
  let xl = read(file, {type: "base64"});
  console.log(xl);
});

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}