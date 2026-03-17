document.addEventListener("DOMContentLoaded", function () {
    const opentab = document.getElementById("btn-open-task");
    const closetab = document.getElementById("cancel");
    const element = document.getElementById("add");
    const linkInbox = document.getElementById("link-inbox");
    const linktoday = document.getElementById("link-today");
    const upcoming_list = document.getElementById("upcoming");
    const linkCompleted = document.getElementById("link-completed");

    // --- NAVIGARE ---
    linkInbox.onclick = function (e) {
        e.preventDefault();
        element.style.display = "none";
        document.getElementById("task-list-container").style.display = "block";
        document.getElementById("task-list-today").style.display = "none";
        document.getElementById("task-list-upcoming").style.display = "none";
        document.getElementById("task-list-completed").style.display = "none";
        afiseazaTaskuri();
    };

    linktoday.onclick = function (e) {
        e.preventDefault();
        element.style.display = "none";
        document.getElementById("task-list-container").style.display = "none";
        document.getElementById("task-list-today").style.display = "block";
        document.getElementById("task-list-upcoming").style.display = "none";
        document.getElementById("task-list-completed").style.display = "none";
        afiseaza_azi();
    };

    upcoming_list.onclick = function (e) {
        e.preventDefault();
        element.style.display = "none";
        document.getElementById("task-list-container").style.display = "none";
        document.getElementById("task-list-today").style.display = "none";
        document.getElementById("task-list-upcoming").style.display = "block";
        document.getElementById("task-list-completed").style.display = "none";
        upcoming();
    };

    linkCompleted.onclick = function (e) {
        e.preventDefault();
        element.style.display = "none";
        document.getElementById("task-list-container").style.display = "none";
        document.getElementById("task-list-today").style.display = "none";
        document.getElementById("task-list-upcoming").style.display = "none";
        document.getElementById("task-list-completed").style.display = "block";
        afiseaza_completate();
    };

    // --- LOGICĂ FORMULAR ---
    opentab.onclick = (e) => { e.preventDefault(); element.style.display = "block"; };
    closetab.onclick = () => { reset(); };

    // Setare dată minimă
    let now = new Date();
    let data_format = now.toISOString().split('T')[0];
    const dataacum = document.getElementById("date");
    dataacum.value = data_format;
    dataacum.setAttribute("min", data_format);

    // Meniu Prioritate
    const openpriority = document.getElementById("Priority");
    const priorityMenu = document.getElementById("priority-menu");
    let valoarePrioritate = "4";

    openpriority.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        priorityMenu.style.display = priorityMenu.style.display === "block" ? "none" : "block";
    };

    priorityMenu.onclick = (e) => {
        const item = e.target.closest(".priority-item");
        if (item) {
            valoarePrioritate = item.getAttribute("data-value");
            openpriority.innerText = "🚩 P" + valoarePrioritate;
            priorityMenu.style.display = "none";
        }
    };

    // Submit Task
    const submitBtn = document.getElementById("submit");
    const textInput = document.getElementById("text-task");
    const dateInput = document.getElementById("date");

    submitBtn.onclick = function () {
        const titlu = textInput.value.trim();
        const dataTask = dateInput.value;

        if (titlu.length < 3) { alert("Nume prea scurt!"); return; }

        const Tasknou = {
            id: Date.now(),
            titlu: titlu,
            data: dataTask,
            prioritate: valoarePrioritate,
            completat: false
        };

        let listaTaskuri = JSON.parse(localStorage.getItem("taskurileMele")) || [];
        listaTaskuri.push(Tasknou);
        localStorage.setItem("taskurileMele", JSON.stringify(listaTaskuri));

        reset();
        afiseazaTaskuri();
    };

    function reset() {
        textInput.value = "";
        dataacum.value = data_format;
        valoarePrioritate = "4";
        openpriority.innerText = "Priority";
        element.style.display = "none";
    }

    // --- APELURI INIȚIALE (În interiorul listener-ului) ---
    afiseazaTaskuri();
});

// --- FUNCȚII GLOBALE (Să fie accesibile de butoanele din carduri) ---

function afiseazaTaskuri() {
    const container = document.getElementById("task-list-container");
    if (!container) return;
    container.innerHTML = "";
    let lista = JSON.parse(localStorage.getItem("taskurileMele")) || [];
    
    // FILTRU: Doar cele nefinalizate
    let lista_activa = lista.filter(t => !t.completat);
    lista_activa.sort((a, b) => new Date(a.data) - new Date(b.data));

    lista_activa.forEach(task => container.appendChild(creeazaCardHTML(task)));
}

function afiseaza_azi() {
    const container = document.getElementById("task-list-today");
    container.innerHTML = "";
    let lista = JSON.parse(localStorage.getItem("taskurileMele")) || [];
    let azi = new Date().toISOString().split('T')[0];

    let lista_today = lista.filter(t => t.data === azi && !t.completat);
    lista_today.forEach(task => container.appendChild(creeazaCardHTML(task)));
}

function upcoming() {
    const container = document.getElementById("task-list-upcoming");
    container.innerHTML = "";
    let lista = JSON.parse(localStorage.getItem("taskurileMele")) || [];
    let azi = new Date().toISOString().split('T')[0];

    let lista_up = lista.filter(t => t.data > azi && !t.completat);
    lista_up.forEach(task => container.appendChild(creeazaCardHTML(task)));
}

function afiseaza_completate() {
    const container = document.getElementById("task-list-completed");
    container.innerHTML = "<h3>✅ Task-uri finalizate</h3>";
    let lista = JSON.parse(localStorage.getItem("taskurileMele")) || [];
    let lista_comp = lista.filter(t => t.completat);

    lista_comp.forEach(task => container.appendChild(creeazaCardHTML(task)));
}

function creeazaCardHTML(task) {
    const div = document.createElement("div");
    div.className = "task-card";
    const culori = { "1": "#db4c3f", "2": "#eb8909", "3": "#246fe0", "4": "gray" };
    div.style.borderLeft = `5px solid ${culori[task.prioritate]}`;

    div.innerHTML = `
        <div class="task-left">
            <input type="checkbox" class="complete-check" ${task.completat ? 'checked disabled' : ''} 
                   onclick="finalizeazaTask(${task.id})">
            <div>
                <strong style="${task.completat ? 'text-decoration: line-through; color: gray;' : ''}">${task.titlu}</strong>
                <small>📅 ${task.data}</small>
            </div>
        </div>
        <div class="task-actions">
            <button class="delete-btn" onclick="stergeTask(${task.id})">🗑️</button>
        </div>
    `;
    return div;
}

function finalizeazaTask(id) {
    let lista = JSON.parse(localStorage.getItem("taskurileMele")) || [];
    lista = lista.map(t => t.id === id ? { ...t, completat: true } : t);
    localStorage.setItem("taskurileMele", JSON.stringify(lista));
    
    // Refresh la ce e vizibil
    afiseazaTaskuri();
    afiseaza_azi();
    upcoming();
}

function stergeTask(id) {
    if (confirm("Ștergi definitiv?")) {
        let lista = JSON.parse(localStorage.getItem("taskurileMele")) || [];
        lista = lista.filter(t => t.id !== id);
        localStorage.setItem("taskurileMele", JSON.stringify(lista));
        afiseazaTaskuri(); afiseaza_azi(); upcoming(); afiseaza_completate();
    }
}
