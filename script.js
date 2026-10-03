// =========================
// SUPABASE CONFIG
// =========================

const supabaseUrl =
    "https://uaihfdlpfryvgvrmnmjc.supabase.co";

const supabaseKey =
    "sb_publishable_n9njImEoqHVhf4l7Ap9Oxw_GHw1ZTws";

const supabaseClient =
    supabase.createClient(
        supabaseUrl,
        supabaseKey
    );


// =========================
// PROMPTS ARRAY
// =========================

let prompts = [];


// =========================
// PROMPT CONTAINER
// =========================

const promptContainer =
    document.getElementById("promptContainer");


// =========================
// PROMPT HEADING
// =========================

const promptHeading =
    document.getElementById("promptHeading");


// =========================
// LOAD PROMPTS FROM DATABASE
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

        console.log(error);

        promptContainer.innerHTML = `
            <div class="prompt-card">
                <div class="prompt-content">
                    <h3>Database Error ❌</h3>
                    <p>
                        Prompts load nahi ho rahe.
                    </p>
                </div>
            </div>
        `;

        return;
    }


    prompts = data || [];


    // DATABASE TEST
    console.log("DATABASE DATA:", data);


    displayPrompts(prompts);
}


// =========================
// DISPLAY PROMPTS
// =========================

function displayPrompts(promptList) {

    promptContainer.innerHTML = "";


    if (promptList.length === 0) {

        promptContainer.innerHTML = `
            <div class="prompt-card">
                <div class="prompt-content">
                    <h3>No Prompts Found</h3>

                    <p>
                        Is category mein abhi koi prompt available nahi hai.
                    </p>
                </div>
            </div>
        `;

        return;
    }


    promptList.forEach(function(item) {

        const card =
            document.createElement("div");


        card.className =
            "prompt-card";


        card.innerHTML = `

            <img
                src="${item.image}"
                alt="${item.title}"
            >

            <div class="prompt-content">

                <h3>
                    ${item.title}
                </h3>

                <p>
                    ${item.description}
                </p>

                <p>
                    <strong>Category:</strong>
                    ${item.category}
                </p>

                <div
                    style="
                        display:flex;
                        gap:10px;
                        flex-wrap:wrap;
                    "
                >

                    <a
                        href="prompt.html?id=${item.id}"
                        class="view-btn"
                    >
                        View Prompt
                    </a>

                    <button
                        class="view-btn"
                        onclick="copyPrompt(${item.id})"
                    >
                        📋 Copy Prompt
                    </button>

                </div>

            </div>

        `;


        promptContainer.appendChild(card);

    });

}


// =========================
// CATEGORY FILTER
// =========================

function filterCategory(category) {

    if (category === "All") {

        if (promptHeading) {

            promptHeading.textContent =
                "Latest AI Prompts";

        }

        displayPrompts(prompts);

        return;
    }


    if (promptHeading) {

        promptHeading.textContent =
            category + " AI Prompts";

    }


    const filteredPrompts =
        prompts.filter(function(item) {

            return item.category
                .toLowerCase()
                === category.toLowerCase();

        });


    displayPrompts(filteredPrompts);


    document.getElementById("templates")
        .scrollIntoView({

            behavior: "smooth"

        });

}


// =========================
// SEARCH
// =========================

const searchInput =
    document.getElementById("searchInput");


if (searchInput) {

    searchInput.addEventListener(
        "input",
        function() {

            const searchText =
                searchInput.value
                    .toLowerCase()
                    .trim();


            if (searchText === "") {

                if (promptHeading) {

                    promptHeading.textContent =
                        "Latest AI Prompts";

                }

                displayPrompts(prompts);

                return;
            }


            if (promptHeading) {

                promptHeading.textContent =
                    "Search Results";

            }


            const filteredPrompts =
                prompts.filter(function(item) {

                    return (

                        item.title
                            .toLowerCase()
                            .includes(searchText)

                        ||

                        item.category
                            .toLowerCase()
                            .includes(searchText)

                        ||

                        item.description
                            .toLowerCase()
                            .includes(searchText)

                    );

                });


            displayPrompts(filteredPrompts);

        }
    );

}


// =========================
// COLLECTION FILTER
// =========================

function openCollection(category) {

    filterCategory(category);

}


// =========================
// COPY PROMPT
// =========================

function copyPrompt(id) {

    const selectedPrompt =
        prompts.find(function(item) {

            return item.id == id;

        });


    if (!selectedPrompt) {

        alert("Prompt nahi mila!");

        return;

    }


    const promptText =
        selectedPrompt.prompt;


    navigator.clipboard.writeText(promptText)

        .then(function() {

            alert(
                "Prompt Copied Successfully! 📋"
            );

        })

        .catch(function() {

            alert(
                "Copy failed. Please try again."
            );

        });

}


// =========================
// LOAD DATABASE PROMPTS
// =========================

loadPrompts();