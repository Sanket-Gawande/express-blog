//function for reloading new quote
async function fetchQuote() {
  let quote = document.querySelector(".quote");
  let author = document.querySelector(".author");

  const url = "https://quotes.stormconsultancy.co.uk/random.json";
  fetch(url)
    .then((res) => res.json())
    .then((obj) => {
      quote.innerHTML = obj.quote;
      author.innerHTML = "--- " + obj.author;
      console.log("loaded !");
    })
    .catch((err) => console.log(err));
}

// function to handle validation for profile picture i.e. file type and size . also preview on image selection is included
let file = document.querySelector("#profile");

file.onchange = () => {
  let name = this.files[0].name;
  let size = this.files[0].size;
  let arr = name.split(".");
  let ext = arr[arr.length - 1];

  validExt = ["jpg", "png", "jpeg", "svg", "webp"];
  if (validExt.includes(ext)) {
    if (size <= 500000) {
      obj = new FileReader();
      obj.readAsDataURL(file.files[0]);
      obj.onload = function () {
        console.log(obj.result);

        document.querySelector("#preview").src = this.result;
      };
    } else {
      alert(
        "File size is too big , please upload  file under 500kb\n\nFile size : " +
          size / 1000 +
          "kb"
      );
      file.value = "";
    }
  } else {
    alert("Invalid file type , Please upload jpg/jpeg/png/svg");
    file.value = "";
  }
};

// thumbnail size , input file type and preview script
let thumbnail = document.querySelector("#thumbnail");
thumbnail.onchange = function () {
  let name = this.files[0].name;
  let size = this.files[0].size;
  let arr = name.split(".");
  let ext = arr[arr.length - 1];
  validExt = ["jpg", "png", "jpeg", "svg", "webp"];
  if (validExt.includes(ext)) {
    if (size <= 500000) {
      obj = new FileReader();
      obj.readAsDataURL(thumbnail.files[0]);
      obj.onload = function () {
        //	console.log(this.result)
        document.querySelector("#post_preview").src = this.result;
      };
    } else {
      alert(
        "File size is too big , please upload  file under 500kb\n\nFile size : " +
          size / 1000 +
          "kb"
      );
      thumbnail.value = "";
    }
  } else {
    alert("Invalid file type , Please upload jpg/jpeg/png/svg");
    thumbnail.value = "";
  }
};

 const profileEvent = () => {
  console.log("it works !")
}


console.log("afn kdhtio")
function  click(){
  console.log("it clicked !!!")
}
