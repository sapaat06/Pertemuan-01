document.addEventListener("DOMContentLoaded", () => {

    // 1. Ambil elemen DOM
    const todoForm = document.querySelector("#todoForm");
    const taskInput = document.querySelector("#taskInput");
    const inputError = document.querySelector("#inputError");
    const inputmax = document.querySelector("#inputmax");
    const todoList = document.querySelector("#todoList");
    const taskCounter = document.querySelector("#taskCounter");
    const clearCompletedBtn = document.querySelector("#clearCompletedBtn");

    // 2. Fungsi membaca dan menyimpan ke LocalStorage
    const getTasks = () => JSON.parse(localStorage.getItem("todo_tasks")) || [];

    const saveTasks = (tasks) => {
        localStorage.setItem("todo_tasks", JSON.stringify(tasks));
    };

    // 3. Fitur Task Counter
    const updateTaskCounter = () => {
        const tasks = getTasks();
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        const unfinished = total - completed;

        taskCounter.textContent =
            `Total: ${total} Tugas | Selesai: ${completed} | Belum Selesai: ${unfinished}`;
    };

    // 4. Fungsi menampilkan daftar tugas
    const renderTasks = () => {
        const tasks = getTasks();
        todoList.innerHTML = "";

        if (tasks.length === 0) {
            const emptyMessage = document.createElement("li");
            emptyMessage.textContent = "Belum ada tugas tersimpan.";
            emptyMessage.style.textAlign = "center";
            emptyMessage.style.color = "#64748b";
            emptyMessage.style.fontSize = "13px";
            emptyMessage.style.padding = "10px";

            todoList.appendChild(emptyMessage);
        } else {
            tasks.forEach((task, index) => {
                const li = document.createElement("li");
                li.className = `todo-item ${task.completed ? "completed" : ""}`;

                const taskText = document.createElement("span");
                taskText.className = "todo-text";
                taskText.textContent = task.text;

                const actions = document.createElement("div");
                actions.className = "todo-actions";

                const completeBtn = document.createElement("button");
                completeBtn.type = "button";
                completeBtn.className = "action-btn complete-btn";
                completeBtn.dataset.index = index;
                completeBtn.textContent = task.completed ? "Batal" : "Selesai";

                const deleteBtn = document.createElement("button");
                deleteBtn.type = "button";
                deleteBtn.className = "action-btn delete-btn";
                deleteBtn.dataset.index = index;
                deleteBtn.textContent = "Hapus";

                actions.appendChild(completeBtn);
                actions.appendChild(deleteBtn);

                li.appendChild(taskText);
                li.appendChild(actions);

                todoList.appendChild(li);
            });
        }

        updateTaskCounter();
    };

    // 5. Tambah tugas saat formulir dikirim
    todoForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const taskText = taskInput.value.trim();
        const tasks = getTasks();

        if (tasks.length >= 5) {
            taskInput.classList.add("error");
            inputError.style.display = "none";
            inputmax.style.display = "block";
            return;
        }

        if (taskText.length < 3) {
            taskInput.classList.add("error");
            inputError.style.display = "block";
            inputmax.style.display = "none";
            return;
        }

        // Hilangkan pesan error jika input valid
        taskInput.classList.remove("error");
        inputError.style.display = "none";
        inputmax.style.display = "none";

        // Simpan tugas baru
        tasks.push({
            text: taskText,
            completed: false
        });

        saveTasks(tasks);

        taskInput.value = "";
        renderTasks();
    });

    // Hilangkan pesan error saat pengguna mulai mengetik ulang
    taskInput.addEventListener("input", () => {
        taskInput.classList.remove("error");
        inputError.style.display = "none";
        inputmax.style.display = "none";
    });

    // 6. Tangani tombol Selesai, Batal, dan Hapus
    todoList.addEventListener("click", (e) => {
        const button = e.target.closest("button");

        if (!button) return;

        const index = Number(button.dataset.index);
        const tasks = getTasks();

        if (!Number.isInteger(index) || index < 0 || index >= tasks.length) {
            return;
        }

        // Tandai tugas selesai atau batalkan
        if (button.classList.contains("complete-btn")) {
            tasks[index].completed = !tasks[index].completed;

            saveTasks(tasks);
            renderTasks();
        }

        // Fitur konfirmasi sebelum menghapus
        else if (button.classList.contains("delete-btn")) {
            const confirmation = confirm(
                "Apakah Anda yakin ingin menghapus tugas ini?"
            );

            if (confirmation) {
                tasks.splice(index, 1);

                saveTasks(tasks);
                renderTasks();

                if (tasks.length < 5) {
                    inputmax.style.display = "none";
                    taskInput.classList.remove("error");
                }
            }
        }
    });

    // 7. Fitur Bersihkan Tugas Selesai
    clearCompletedBtn.addEventListener("click", () => {
        const tasks = getTasks();
        const remainingTasks = tasks.filter(task => !task.completed);

        if (remainingTasks.length === tasks.length) {
            alert("Tidak ada tugas selesai untuk dibersihkan.");
            return;
        }

        saveTasks(remainingTasks);
        renderTasks();

        if (remainingTasks.length < 5) {
            inputmax.style.display = "none";
            taskInput.classList.remove("error");
        }

        alert("Tugas yang sudah selesai berhasil dibersihkan.");
    });

    // 8. Tampilkan tugas saat halaman dibuka
    renderTasks();
});
