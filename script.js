
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

    if (!promptContainer) {
        console.error(
            "Prompt container nahi mila. HTML mein promptContainer ID check karo."
        );
        return;
    }

    promptContainer.innerHTML = `
        <div class="prompt-card">
            <div class="prompt-content">
                <h3>Loading Prompts...</h3>
            </div>
        </div>
    `;

    try {

        const { data, error } =
            await supabaseClient
                .from("prompts")
                .select("*")
                .order("created_at", {
                    ascending: false
                });

        // =========================
        // SHOW REAL DATABASE ERROR
        // =========================

        if (error) {

            console.error("SUPABASE ERROR:", error);

            promptContainer.innerHTML = `
                <div class="prompt-card">
                    <div class="prompt-content">
                        <h3>Database Error ❌</h3>
                        <p><strong>Code:</strong> ${error.code || "N/A"}</p>
                        <p><strong>Message:</strong> ${error.message || "Unknown error"}</p>
                        <p><strong>Details:</strong> ${error.details || "N/A"}</p>
                        <p><strong>Hint:</strong> ${error.hint || "N/A"}</p>
                    </div>
                </div>
            `;

            return;
        }

        prompts = data || [];

        console.log("DATABASE DATA:", data);

        displayPrompts(prompts);

    } catch (err) {

        console.error("UNEXPECTED ERROR:", err);

        promptContainer.innerHTML = `
            <div class="prompt-card">
                <div class="prompt-content">
                    <h3>Connection Error ❌</h3>
                    <p>${err.message || "Supabase se connection nahi ho raha."}</p>
                </div>
            </div>
        `;
    }
}


// =========================
// DISPLAY PROMPTS
// =========================

function displayPrompts(promptList) {

    if (!promptContainer) return;

    promptContainer.innerHTML = "";

    if (!promptList || promptList.length === 0) {

        promptContainer.innerHTML = `
            <div class="prompt-card">
                <div class="prompt-content">
                    <h3>No Prompts Found</h3>
                    <p>Abhi koi prompt available nahi hai.</p>
                </div>
            </div>
        `;

        return;
    }

    promptList.forEach(function(item) {

        const card = document.createElement("div");
        card.className = "prompt-card";

        const image = document.createElement("img");
        image.src = item.image || "";
        image.alt = item.title || "AI Prompt";
        image.loading = "lazy";

        const content = document.createElement("div");
        content.className = "prompt-content";

        const title = document.createElement("h3");
        title.textContent = item.title || "Untitled Prompt";

        const description = document.createElement("p");
        description.textContent = item.description || "";

        const category = document.createElement("p");
        const categoryLabel = document.createElement("strong");
        categoryLabel.textContent = "Category: ";
        category.appendChild(categoryLabel);
        category.appendChild(
            document.createTextNode(item.category || "Uncategorized")
        );

        const actions = document.createElement("div");
        actions.style.display = "flex";
        actions.style.gap = "10px";
        actions.style.flexWrap = "wrap";

        const viewLink = document.createElement("a");
        viewLink.href = "prompt.html?id=" + encodeURIComponent(item.id);
        viewLink.className = "view-btn";
        viewLink.textContent = "View Prompt";

        const copyButton = document.createElement("button");
        copyButton.className = "view-btn";
        copyButton.textContent = "📋 Copy Prompt";
        copyButton.addEventListener("click", function() {
            copyPrompt(item.id);
        });

        actions.appendChild(viewLink);
        actions.appendChild(copyButton);

        content.appendChild(title);
        content.appendChild(description);
        content.appendChild(category);
        content.appendChild(actions);

        card.appendChild(image);
        card.appendChild(content);

        promptContainer.appendChild(card);

    });
}


// =========================
// CATEGORY FILTER
// =========================

function filterCategory(category) {

    if (category === "All") {

        if (promptHeading) {
            promptHeading.textContent = "Latest AI Prompts";
        }

        displayPrompts(prompts);
        return;
    }

    if (promptHeading) {
        promptHeading.textContent = category + " AI Prompts";
    }

    const filteredPrompts =
        prompts.filter(function(item) {

            return (item.category || "").toLowerCase() ===
                category.toLowerCase();

        });

    displayPrompts(filteredPrompts);

    const templates = document.getElementById("templates");

    if (templates) {
        templates.scrollIntoView({
            behavior: "smooth"
        });
    }
}


// =========================
// SEARCH
// =========================

const searchInput =
    document.getElementById("searchInput");

if (searchInput) {

    searchInput.addEventListener("input", function() {

        const searchText =
            searchInput.value.toLowerCase().trim();

        if (searchText === "") {

            if (promptHeading) {
                promptHeading.textContent = "Latest AI Prompts";
            }

            displayPrompts(prompts);
            return;
        }

        if (promptHeading) {
            promptHeading.textContent = "Search Results";
        }

        const filteredPrompts =
            prompts.filter(function(item) {

                return (
                    (item.title || "").toLowerCase().includes(searchText) ||
                    (item.category || "").toLowerCase().includes(searchText) ||
                    (item.description || "").toLowerCase().includes(searchText)
                );

            });

        displayPrompts(filteredPrompts);

    });
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

async function copyPrompt(id) {

    const selectedPrompt =
        prompts.find(function(item) {
            return item.id == id;
        });

    if (!selectedPrompt) {
        alert("Prompt nahi mila!");
        return;
    }

    const promptText = selectedPrompt.prompt || "";

    try {

        await navigator.clipboard.writeText(promptText);
        alert("Prompt Copied Successfully! 📋");

    } catch (err) {

        console.error("COPY ERROR:", err);
        alert("Copy failed. Please try again.");

    }
}


// =========================
// LOAD DATABASE PROMPTS
// =========================

loadPrompts();
