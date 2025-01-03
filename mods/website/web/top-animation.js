let saito = false,
    animID,
    timeoutID,
    nonsaito_init = 250,
    total_frames = 680,
    total_loop = 620,
    saito_loop = 300,
    counter = 0,
    popup = 1,
    pause = true,
    svgDoc = null,
    isInitialized = false,
    start_anim = true;

// Update selector function to use SVG document with safety check
function $(e) {
    if (!svgDoc) return null;
    return svgDoc.querySelector(e);
}

function switch_mode() {
    if (!svgDoc || !isInitialized) return;
    
    if (saito) {
        for (let e = 1; e < 26; e++) {
            const element = $("#dots" + e);
            if (element) element.setAttribute("class", "n b");
        }
        $("#saito_users")?.classList.remove("n");
        $("#saito_lines")?.classList.remove("n");
        $("#saito_nodes")?.classList.remove("n");
        $("#saito_popups")?.classList.remove("n");
        $("#non_saito_nds")?.classList.add("n");
        $("#saito_nds")?.classList.remove("n");
    } else {
        for (let e = 1; e < 26; e++) {
            const element = $("#dots" + e);
            if (element) element.setAttribute("class", "n");
        }
        $("#nonsaito_icons")?.classList.remove("n");
        $("#infrastructure")?.classList.remove("n");
        $("#user_lines")?.classList.remove("n");
        $("#circles")?.classList.remove("n");
        $("#app_lines")?.classList.remove("n");
        $("#nonsaito_nodes")?.classList.remove("n", "h");
        $("#nonsaito_popups")?.classList.remove("n");
        $("#non_saito_nds")?.classList.remove("n");
        $("#saito_nds")?.classList.add("n");
    }
}

function initial_state() {
    if (!svgDoc || !isInitialized) return;
    
    clearTimeout(timeoutID);
    counter = 0;
    popup = 1;
    
    // Remove any existing classes that might hide elements
    $("#nonsaito_icons")?.classList.remove("n", "op", "h");
    $("#infrastructure")?.classList.remove("n", "op", "h");
    $("#user_lines")?.classList.remove("n", "op", "h");
    $("#circles")?.classList.remove("n", "op", "h");
    $("#app_lines")?.classList.remove("n", "op", "h");
    $("#nonsaito_nodes")?.classList.remove("n", "op", "h");
    $("#nonsaito_popups")?.classList.remove("n");
    
    // Set initial visibility states
    $("#replay_bttn")?.classList.add("n", "h");
    
    // Initialize money elements
    for (let e = 1; e < 12; e++) {
        const moneyElement = $("#money" + e);
        if (moneyElement) moneyElement.setAttribute("class", "op h n");
    }
    
    // Initialize node glow elements
    for (let e = 1; e < 8; e++) {
        const nodeGlow = $("#node_glow" + e);
        if (nodeGlow) nodeGlow.setAttribute("class", "op h");
    }
    
    // Initialize popup elements
    for (let e = 1; e < 5; e++) {
        const popup = $("#popup" + e);
        if (popup) popup.setAttribute("class", "");
    }
    
    for (let e = 1; e < 7; e++) {
        const spopup = $("#spopup" + e);
        if (spopup) spopup.setAttribute("class", "");
    }
}

function add_cl(o, t, n) {
    if (!svgDoc || !isInitialized) return;
    for (let e = 0; e < t.length; e++) {
        const element = $("#" + o + t[e]);
        if (element) element.classList.add(n);
    }
}

function remove_cl(o, t, n) {
    if (!svgDoc || !isInitialized) return;
    for (let e = 0; e < t.length; e++) {
        const element = $("#" + o + t[e]);
        if (element) element.classList.remove(n);
    }
}

function animate() {
    if (!svgDoc || !isInitialized) return;
    
    console.log("Animation frame:", counter); // Debug log
    
    if (pause) return;
    
    if (counter === 0) {
        // Make sure elements are visible
        $("#nonsaito_icons")?.classList.remove("n", "op", "h");
        $("#infrastructure")?.classList.remove("n", "op", "h");
        $("#user_lines")?.classList.remove("n", "op", "h");
        $("#circles")?.classList.remove("n", "op", "h");
        $("#app_lines")?.classList.remove("n", "op", "h");
    }
    
    if (counter === nonsaito_init) {
        $("#nonsaito_nodes")?.classList.remove("n", "op", "h");
        $("#nonsaito_popups")?.classList.remove("n");
    }
    
    if (counter === total_frames) {
        $("#replay_bttn")?.classList.remove("n", "h");
        $("#switch")?.classList.remove("n", "h");
        $("#learn_more")?.classList.add("vis");
        pause = true;
        return;
    }
    
    if (counter === total_loop) counter = 0;
    
    counter++;
    animID = requestAnimationFrame(animate);
}

function animate2() {
    if (!svgDoc || !isInitialized) return;
    
    console.log("Animation2 frame:", counter); // Debug log
    
    if (pause) return;
    
    if (counter === 0) {
        $("#saito_users").classList.remove("n");
        $("#saito_lines").classList.remove("n");
        $("#saito_nodes").classList.remove("n");
    }
    
    if (counter === saito_loop) {
        $("#saito_popups").classList.remove("n");
    }
    
    if (counter === total_frames) {
        $("#replay_bttn").classList.remove("n", "h");
        $("#learn_more").classList.add("vis");
        pause = true;
        return;
    }
    
    if (counter === total_loop) counter = 0;
    
    counter++;
    animID = requestAnimationFrame(animate2);
}

// Initialize everything only after SVG is loaded
function initializeAnimation() {
    const svgObject = document.querySelector('#top_animation');
    
    if (!svgObject) {
        console.error('SVG object not found');
        return;
    }

    // Add click handler for the HTML button first
    const htmlButton = document.querySelector("#bttn_anim_01");
    if (htmlButton) {
        htmlButton.addEventListener("click", function() {
            if (start_anim) {
                const animTitle = document.querySelector("#animation-ttl");
                const closeBtn = document.querySelector("#close_bttn");
                
                if (animTitle) animTitle.classList.add("fadeout");
                if (closeBtn) closeBtn.classList.remove("invis");
                
                pause = false;
                counter = 0;
                animID = requestAnimationFrame(animate);
                console.log("Animation started from HTML button");
            }
            start_anim = false;
        });
    }

    // Add click handler for the close button in HTML
    const closeBtn = document.querySelector("#close_bttn");
    if (closeBtn) {
        closeBtn.addEventListener("click", function() {
            cancelAnimationFrame(animID);
            saito = false;
            pause = true;
            start_anim = true;
            initial_state();
            switch_mode();
            $("#switch").classList.add("n", "h");
            $("#switch").classList.remove("saito");
            $("#circles").classList.add("shift_right");
            $("#init_lines").classList.add("shift_right");
            $("#miner_icns").classList.add("shift_right");
            $("#node_icns").classList.add("shift_right");
            $("#user_icons").classList.add("shift_right");
            $("#learn_more").classList.remove("vis");
            $("#animation-ttl").classList.remove("fadeout");
            $("#close_bttn").classList.add("invis");
            animID = requestAnimationFrame(animate);
        });
    }

    // Handle SVG load
    svgObject.addEventListener('load', function() {
        svgDoc = svgObject.contentDocument;
        
        if (!svgDoc) {
            console.error('SVG document not accessible');
            return;
        }

        console.log("SVG loaded successfully");
        isInitialized = true;

        // Initialize animation state
        switch_mode();
        initial_state();
    });
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAnimation);
} else {
    initializeAnimation();
} 