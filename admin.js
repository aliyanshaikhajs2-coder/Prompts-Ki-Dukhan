console.log("ADMIN JS LOADED");
// =========================
// SUPABASE CONFIG
// =========================

const supabaseUrl = "https://uaihfdlpfryvgvrmnmjc.supabase.co";

const supabaseKey =
    "sb_publishable_n9njImEoqHVhf4l7Ap9Oxw_GHw1ZTws";

const supabaseClient = supabase.createClient(
    supabaseUrl,
    supabaseKey
);


// =========================
// ADMIN LOGIN
// =========================

const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {

    loginBtn.addEventListener("click", async function () {

        const email =
            document.getElementById("loginEmail").value;

        const password =
            document.getElementById("loginPassword").value;


        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });


        if (error) {

            console.log("LOGIN ERROR:", error);

            alert("Login Failed ❌");

            return;
        }


        document.getElementById("loginBox")
            .style.display = "none";

        document.getElementById("dashboard")
            .style.display = "block";


        alert("Admin Login Successful ✅");

        loadPrompts();

    });

}


// =========================
// VARIABLES
// =========================

let editId = null;

let editImage = "";

let adminPrompts = [];


const form =
    document.getElementById("promptForm");

const adminPromptList =
    document.getElementById("adminPromptList");

const submitBtn =
    document.getElementById("submitBtn");


// =========================
// ADD / UPDATE PROMPT
// =========================

    form.addEventListener("submit", async function (event) {
    event.preventDefault();


    const title =
        document.getElementById("title").value;

    const category =
        document.getElementById("category").value;

    const description =
        document.getElementById("description").value;

    const prompt =
        document.getElementById("prompt").value;

    const imageFile =
        document.getElementById("image").files[0];


    // =========================
    // UPDATE PROMPT
    // =========================

    if (editId !== null) {

        const updateData = {

            title: title,

            category: category,

            description: description,

            prompt: prompt

        };


        // New image selected
        if (imageFile) {

            const reader =
                new FileReader();


            reader.onload = async function () {

                updateData.image =
                    reader.result;

                await updatePrompt(updateData);

            };


            reader.readAsDataURL(imageFile);

        }

        else {

            // Purani image rahegi

            await updatePrompt(updateData);

        }


        return;
    }


    // =========================
    // ADD NEW PROMPT
    // =========================

    if (!imageFile) {

        alert("Please select image!");

        return;
    }


    const reader =
        new FileReader();


    reader.onload = async function () {

        const { error } =
            await supabaseClient
                .from("prompts")
                .insert([
                    {
                        title: title,

                        category: category,

                        description: description,

                        prompt: prompt,

                        image: reader.result
                    }
                ]);


        if (error) {

            console.log(
                "ADD PROMPT ERROR:",
                error
            );

            alert("Prompt Save Error ❌");

            return;
        }


        alert(
            "Prompt Saved Successfully ✅"
        );


        form.reset();


        await loadPrompts();

    };


    reader.readAsDataURL(imageFile);

});


// =========================
// UPDATE PROMPT
// =========================

async function updatePrompt(updateData) {

    const { error } =
        await supabaseClient
            .from("prompts")
            .update(updateData)
            .eq("id", editId);


    if (error) {

        console.log(
            "UPDATE ERROR:",
            error
        );

        alert("Update Error ❌");

        return;
    }


    alert(
        "Prompt Updated Successfully ✅"
    );


    editId = null;

    editImage = "";

    form.reset();

    submitBtn.innerText =
        "Add Prompt";


    await loadPrompts();

}


// =========================
// SHOW PROMPTS
// =========================

async function loadPrompts() {

    const { data, error } =
        await supabaseClient
            .from("prompts")
            .select("*")
            .order("created_at", {
                ascending: false
            });


    if (error) {

        console.log(
            "LOAD ERROR:",
            error
        );

        return;
    }


    adminPrompts =
        data || [];


    adminPromptList.innerHTML =
        "";


    if (adminPrompts.length === 0) {

        adminPromptList.innerHTML =
            "<p>No prompts added yet.</p>";

        return;
    }


    adminPrompts.forEach(
        function (item) {

            const adminCard =
                document.createElement("div");


            adminCard.className =
                "admin-prompt";


            adminCard.innerHTML = `

                <img
                    src="${item.image}"
                    alt="${item.title}"
                >

                <div>

                    <h3>
                        ${item.title}
                    </h3>

                    <p>
                        Category: ${item.category}
                    </p>

                    <button
                        onclick="editPrompt(${item.id})">
                        ✏️ Edit
                    </button>

                    <button
                        onclick="deletePrompt(${item.id})">
                        🗑️ Delete
                    </button>

                </div>

            `;


            adminPromptList.appendChild(
                adminCard
            );

        }
    );

}


// =========================
// EDIT PROMPT
// =========================

function editPrompt(id) {

    const item =
        adminPrompts.find(
            function (prompt) {

                return String(prompt.id) ===
                    String(id);

            }
        );


    if (!item) {

        alert(
            "Prompt not found ❌"
        );

        return;
    }


    editId =
        item.id;


    editImage =
        item.image;


    document.getElementById("title").value =
        item.title || "";


    document.getElementById("category").value =
        item.category || "";


    document.getElementById("description").value =
        item.description || "";


    document.getElementById("prompt").value =
        item.prompt || "";


    submitBtn.innerText =
        "Update Prompt";


    form.scrollIntoView({
        behavior: "smooth"
    });

}


// =========================
// DELETE PROMPT
// =========================

async function deletePrompt(id) {

    const confirmDelete =
        confirm(
            "Kya aap ye prompt delete karna chahte hain?"
        );


    if (!confirmDelete) {

        return;
    }


    // =========================
    // CHECK LOGIN USER
    // =========================

    const { data: userData, error: userError } =
        await supabaseClient.auth.getUser();


    if (userError || !userData.user) {

        alert(
            "Admin login nahi hai ❌"
        );

        console.log(
            "USER ERROR:",
            userError
        );

        return;
    }


    console.log(
        "DELETE USER ID:",
        userData.user.id
    );


    // =========================
    // DELETE
    // =========================

    const { data, error } =
    await supabaseClient
        .from("prompts")
        .delete()
        .eq("id", id)
        .select();


     console.log("DELETE RESULT:", data);
     console.log("DELETE ERROR:", error);
    
    if (error) {

        console.log(
            "DELETE ERROR:",
            error
        );

        alert(
            "Delete Error ❌"
        );

        return;
    }


    // =========================
    // VERIFY DELETE
    // =========================

    const { data: checkData } =
        await supabaseClient
            .from("prompts")
            .select("id")
            .eq("id", id);


    if (checkData && checkData.length > 0) {

        alert(
            "Prompt delete nahi hua ❌"
        );

        console.log(
            "ROW STILL EXISTS:",
            checkData
        );

        return;
    }


    alert(
        "Prompt Deleted 🗑️"
    );


    await loadPrompts();

}


// =========================
// LOAD ON START
// =========================

loadPrompts();

// =========================
// ADMIN LOGOUT
// =========================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", async function () {

        const { error } =
            await supabaseClient.auth.signOut();

        if (error) {

            console.log("LOGOUT ERROR:", error);

            alert("Logout Failed ❌");

            return;
        }

        document.getElementById("dashboard")
            .style.display = "none";

        document.getElementById("loginBox")
            .style.display = "block";

        alert("Logout Successful ✅");

    });

}