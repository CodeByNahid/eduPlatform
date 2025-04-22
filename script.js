let posts = [];
let currentPage = 1;
let postsPerPage = 5; // Change as needed

async function fetchPosts() {
  try {
    const res = await fetch("posts.json");
    posts = await res.json();
    loadHome();
  } catch (error) {
    console.error("Error loading posts.json:", error);
  }
}


const courses = Array.from({ length: 12 }, (_, i) => ({
    class: i + 1,
    topics: [`Mathematics for Class ${i + 1}`, `Science for Class ${i + 1}`, `English for Class ${i + 1}`]
}));



function loadHome() {
    const homeContent = document.getElementById("homeContent");
    const pagination = document.getElementById("pagination");
    
    const start = (currentPage - 1) * postsPerPage;
    const end = start + postsPerPage;
    const paginatedPosts = posts.slice(start, end);

    homeContent.innerHTML = "";
    paginatedPosts.forEach(p => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `<h3>${p.title}</h3><p>${p.content}</p><small>${new Date(p.date).toLocaleDateString()}</small>`;
        card.onclick = () => showPostDetail(p.id);
        homeContent.appendChild(card);
    });

    // Only show pagination if there are more than 10 posts
    pagination.innerHTML = "";
    if (posts.length > postsPerPage) {
        const totalPages = Math.ceil(posts.length / postsPerPage);
        
        // Previous button
        if (currentPage > 1) {
            const prevBtn = document.createElement("button");
            prevBtn.textContent = "Previous";
            prevBtn.className = "page-btn";
            prevBtn.onclick = () => {
                currentPage--;
                loadHome();
                window.scrollTo(0, 0);
            };
            pagination.appendChild(prevBtn);
        }
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement("button");
            btn.textContent = i;
            btn.className = `page-btn ${i === currentPage ? "active" : ""}`;
            btn.onclick = () => {
                currentPage = i;
                loadHome();
                window.scrollTo(0, 0);
            };
            pagination.appendChild(btn);
        }
        
        // Next button
        if (currentPage < totalPages) {
            const nextBtn = document.createElement("button");
            nextBtn.textContent = "Next";
            nextBtn.className = "page-btn";
            nextBtn.onclick = () => {
                currentPage++;
                loadHome();
                window.scrollTo(0, 0);
            };
            pagination.appendChild(nextBtn);
        }
    }
}

function loadPosts() {
    const postContent = document.getElementById("postContent");
    postContent.innerHTML = "";
    
    posts.forEach(p => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `<h3>${p.title}</h3><p>${p.content}</p><small>${new Date(p.date).toLocaleDateString()}</small>`;
        card.onclick = () => showPostDetail(p.id);
        postContent.appendChild(card);
    });
}

function showPostDetail(postId) {
    const post = posts.find(p => p.id === postId);
    const detailContent = document.getElementById("postDetailContent");
    
    detailContent.innerHTML = `
    <div class="card">
        <h2>${post.title}</h2>
        <p class="post-date">Posted on: ${new Date(post.date).toLocaleDateString()}</p>
        <div class="post-detail">${post.detail}</div>
        <button onclick="showSection('posts')" class="back-btn">← Back to Posts</button>
    </div>
  `;
    
    document.querySelectorAll("main section").forEach(s => s.style.display = "none");
    document.getElementById("post-detail").style.display = "block";
    updateActiveNav(null);
}

function showSection(id) {
    document.querySelectorAll("main section").forEach(s => s.style.display = "none");
    document.getElementById(id).style.display = "block";
    updateActiveNav(id);
    
    if (id === "home") loadHome();
    if (id === "posts") loadPosts();
    if (id === "courses") loadCourses();
}

function loadCourses() {
    const classGrid = document.querySelector(".class-grid");
    classGrid.innerHTML = "";
    
    courses.forEach(course => {
        const card = document.createElement("div");
        card.className = "class-card";
        card.textContent = `Class ${course.class}`;
        card.onclick = () => showClassTopics(course.class);
        classGrid.appendChild(card);
    });
}

function showClassTopics(cls) {
    const topicContainer = document.getElementById("classTopics");
    const classData = courses.find(c => c.class === cls);
    topicContainer.innerHTML = `<h3>Topics for Class ${cls}</h3><ul>` +
        classData.topics.map(t => `<li>${t}</li>`).join('') + '</ul>';
}

function updateActiveNav(sectionId) {
    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.remove("active");
        if (sectionId && link.getAttribute("href") === `#${sectionId}`) {
            link.classList.add("active");
        }
    });
}

function searchContent() {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase().trim();
    const postContent = document.getElementById("postContent");
    
    // Clear previous results
    postContent.innerHTML = "";
    
    // If empty search, show all posts
    if (!searchTerm) {
        loadPosts();
        return;
    }
    
    // Basic search implementation
    const results = posts.filter(post => {
        return post.title.toLowerCase().includes(searchTerm) || 
               post.content.toLowerCase().includes(searchTerm) ||
               post.detail.toLowerCase().includes(searchTerm);
    });
    
    // Display results
    if (results.length === 0) {
        postContent.innerHTML = `<div class="card"><p>No results found for "${searchTerm}"</p></div>`;
    } else {
        results.forEach(post => {
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `<h3>${post.title}</h3><p>${post.content}</p>`;
            card.onclick = () => showPostDetail(post.id);
            postContent.appendChild(card);
        });
    }
    
    // Show the posts section
    showSection("posts");
}
// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Helper function to escape regex special characters
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getBestMatchField(post, searchTerms, cleanDetail) {
    const fields = [
        { name: 'title', value: post.title },
        { name: 'content', value: post.content },
        { name: 'detail', value: cleanDetail }
    ];
    
    let bestField = fields[0];
    let bestScore = 0;
    
    fields.forEach(field => {
        const score = calculateMatchScore(field.value, searchTerms);
        if (score > bestScore) {
            bestScore = score;
            bestField = field;
        }
    });
    
    return bestField.name;
}

function getPreviewContent(post, searchTerm, searchTerms) {
    let content = '';
    const field = getBestMatchField(post, searchTerms, post.cleanDetail);
    
    if (field === 'detail') {
        content = post.cleanDetail;
    } else {
        content = post[field];
    }

    // Find the best match position
    let bestPosition = -1;
    let bestTerm = '';
    
    searchTerms.forEach(term => {
        const pos = content.toLowerCase().indexOf(term);
        if (pos >= 0 && (bestPosition === -1 || pos < bestPosition)) {
            bestPosition = pos;
            bestTerm = term;
        }
    });

    if (bestPosition >= 0) {
        const start = Math.max(0, bestPosition - 30);
        const end = Math.min(content.length, bestPosition + bestTerm.length + 100);
        let preview = content.substring(start, end);
        
        if (start > 0) preview = '...' + preview;
        if (end < content.length) preview = preview + '...';
        
        return highlightMatches(preview, searchTerms);
    }
    
    // Fixed: Added searchTerms parameter in return statement
    return highlightMatches(content.substring(0, 150) + '...', searchTerms);
}

function highlightMatches(text, searchTerms) {
    if (!searchTerms || searchTerms.length === 0) return escapeHtml(text);
    
    // First escape the HTML
    let highlighted = escapeHtml(text);
    
    // Then apply highlighting
    searchTerms.forEach(term => {
        if (term.length < 2) return; // Skip single characters
        const regex = new RegExp(`(${escapeRegex(term)})`, 'gi');
        highlighted = highlighted.replace(regex, '<mark>$1</mark>');
    });
    
    return highlighted;
}

function calculateMatchScore(text, searchTerms) {
    if (!text || !searchTerms || searchTerms.length === 0) return 0;
    
    const textLower = text.toLowerCase();
    let score = 0;
    
    searchTerms.forEach(term => {
        if (term.length < 2) return; // Ignore single characters
        
        // Exact match
        if (textLower === term) {
            score += 100;
            return;
        }
        
        // Starts with term
        if (textLower.startsWith(term)) {
            score += 50;
            return;
        }
        
        // Word boundary match (whole word)
        const wordRegex = new RegExp(`\\b${escapeRegex(term)}\\b`, 'i');
        if (wordRegex.test(text)) {
            score += 40;
            return;
        }
        
        // Contains term
        if (textLower.includes(term)) {
            score += 30;
        }
    });
    
    return score;
}



window.onload = () => {
    document.querySelectorAll(".nav-links a").forEach(link => {
      link.addEventListener("click", e => {
        e.preventDefault();
        const sectionId = link.getAttribute("href").substring(1);
        showSection(sectionId);
      });
    });
  
    fetchPosts(); // Load posts from external JSON
  
    document.querySelector('.search-btn').addEventListener('click', searchContent);
    
    // Also add event listener for Enter key in search input
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchContent();
        }
    });
    loadHome();
    loadCourses();
};