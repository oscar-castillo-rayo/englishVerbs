const d = document,
  $table = d.querySelector(".crud-table"),
  $template = d.getElementById("dataTemplate").content,
  fragment = d.createDocumentFragment(),
  $searchVerbsInput = d.querySelector("input.search-verbs-input"),
  $searchVerbsBtn = d.querySelector(".search-verbs-btn"),
  $notificacionVerbs = d.querySelector(".notificacion-verbs");
let storedNumbers = localStorage.getItem("numbers");
let numbers = storedNumbers ? JSON.parse(storedNumbers) : [];
let verbToFind = "";
let data = [];

const readData = async (data) => {
  try {
    const response = await axios.get(
      "https://63f5ac61ab76703b15af5179.mockapi.io/englishVerbs" //http://localhost:3000/englishVerbs"
    );
    const data = response.data;
    return data;
  } catch (error) {
    let message = error.response.statusText || "Ocurrió un error";
    $table.insertAdjacentHTML(
      "afterend",
      `<p><b>Error ${error.response.status}: ${message}</b></p>`
    );
  }
};

async function verbMenu(option) {
  if (option === 1) printVerbsData(data);
  else if (option === 2) printRandonVerbs(data);
}

const printRandonVerbs = (response) => {
  let random = [];
  let dataToPrint = [];

  try {
    for (let i = 0; i < 10; i++) {
      random[i] = generateUniqueRandomNumber(1, response.length, numbers);
      numbers.push(random[i]);
    }
    localStorage.setItem("numbers", JSON.stringify(numbers));

    response.forEach((el) => {
      for (let i = 0; i < 10; i++) {
        if (el.id === random[i]) {
          dataToPrint.push(el);
        }
      }
    });
    printVerbsData(dataToPrint);
  } catch (error) {
    $table.setAttribute("style", "visibility:hidden");
    $notificacionVerbs.innerHTML = error;
  }
};

printSearchesVerb = async (verb) => {
  if (data === []) {
    data = await readData();
  }

  let dataToPrint = [];
  data.forEach((data) => {
    if (data.simpleForm.includes(String(verb).toUpperCase())) {
      dataToPrint.push(data);
    }
  });
  printVerbsData(dataToPrint);
};

printVerbsData = (dataToPrint) => {
  $table.querySelector("tbody").innerHTML = "";
  $notificacionVerbs.innerHTML = "";
  if (dataToPrint.length > 0) {
    $table.setAttribute("style", "visibility:visible");
    dataToPrint.forEach((data) => {
      // body
      $template.querySelector(".id").textContent = data.id;
      $template.querySelector(".type").textContent = data.type;
      $template.querySelector(".simple-form").textContent = data.simpleForm;
      $template.querySelector(".third-person").textContent = data.thirdPerson;
      $template.querySelector(".simplePast").textContent = data.simplePast;
      $template.querySelector(".pastPasticiple").textContent =
        data.pastParticiple;
      $template.querySelector(".gerund").textContent = data.gerund;
      $template.querySelector(".meaning").textContent = data.meaning;

      let $clone = d.importNode($template, true);
      fragment.appendChild($clone);
    });
    $table.querySelector("tbody").appendChild(fragment);
  } else {
    $table.setAttribute("style", "visibility:hidden");
    $notificacionVerbs.innerHTML = "No results";
    $table.querySelector("tbody").insertAdjacentHTML;
  }
};

function generateUniqueRandomNumber(min, max, excludedNumbers) {
  if (excludedNumbers.length === max - min + 1) {
    throw new Error(
      "Ya se han generado todos los números posibles, presione reset para poder generar nuevamente."
    );
  }
  let randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

  if (excludedNumbers.includes(randomNumber)) {
    return generateUniqueRandomNumber(min, max, excludedNumbers);
  }

  return randomNumber;
}

d.addEventListener("DOMContentLoaded", async (e) => {
  data = await readData();
  verbMenu(1);
});

d.addEventListener("click", (e) => {
  const $btnAleatorio = d.querySelector(".agregar-aleatorios"),
    $btnTodos = d.querySelector(".mostrar-todos"),
    $btnResetRandom = d.querySelector(".reset-random");
  if (e.target === $btnAleatorio) {
    d.querySelector("tbody").innerHTML = "";
    verbMenu(2);
  }
  if (e.target === $btnTodos) {
    d.querySelector("tbody").innerHTML = "";
    verbMenu(1);
  }
  if (e.target === $btnResetRandom) {
    numbers = [];
    storedNumbers = localStorage.setItem("numbers", JSON.stringify(numbers));
  }
  if (e.target === $searchVerbsBtn) {
    $searchVerbsInput.value !== ""
      ? printSearchesVerb(verbToFind)
      : verbMenu(1);
  }
});

$searchVerbsInput.addEventListener("keyup", (e) => {
  const pattern = new RegExp("^[A-Z]+$", "i");
  if (e.key && pattern) {
    if (e.key === "Backspace") {
      verbToFind = verbToFind.substring(0, verbToFind.length - 1);
      printSearchesVerb(verbToFind);
    } else {
      verbToFind += e.key;
      printSearchesVerb(verbToFind);
    }
  }
});
