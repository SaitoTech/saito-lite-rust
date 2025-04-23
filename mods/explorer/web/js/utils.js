// Add pagination control functionality
const BLOCKS_PER_PAGE = 200;

function createPaginationControls() {
    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'pagination';
    paginationDiv.innerHTML = `
        <button id="prevPage" class="page-btn">&lt; Previous</button>
        <span id="pageInfo">Page <span id="currentPageNum">1</span></span>
        <button id="nextPage" class="page-btn">Next &gt;</button>
    `;
    
    const grid = document.querySelector('.explorer-grid');
    grid.parentNode.insertBefore(paginationDiv, grid);
    
    document.getElementById('prevPage').addEventListener('click', () => changePage(-1));
    document.getElementById('nextPage').addEventListener('click', () => changePage(1));
}

function changePage(delta) {
    const urlParams = new URLSearchParams(window.location.search);
    let currentPage = parseInt(urlParams.get('page')) || 1;
    currentPage += delta;
    
    if (currentPage < 1) currentPage = 1;
    
    // Redirect to new page
    window.location.href = `?page=${currentPage}`;
}

document.addEventListener('DOMContentLoaded', () => {
    createPaginationControls();
    
    // Update current page display
    const urlParams = new URLSearchParams(window.location.search);
    const currentPage = parseInt(urlParams.get('page')) || 1;
    document.getElementById('currentPageNum').textContent = currentPage;
    
    // Disable prev/next buttons as needed
    document.getElementById('prevPage').disabled = currentPage === 1;
    // Note: You might want to pass total blocks count from server to calculate max pages
}); 