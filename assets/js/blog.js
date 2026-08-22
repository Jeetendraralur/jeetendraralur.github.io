document.addEventListener('DOMContentLoaded', () => {
    const postContainer = document.getElementById('post-content');
    const blogListContainer = document.querySelector('.blog-list');

    // Helper to get relative base path of the project
    // blog.js is loaded from either /blog/index.html or /blog/post.html
    const fetchPathPrefix = '';

    if (postContainer) {
        // --- SINGLE POST VIEW ---
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');

        if (!postId) {
            postContainer.innerHTML = '<h2>Post not found</h2><p class="description">Invalid post ID specified.</p>';
            return;
        }

        // Fetch registry and load correct post
        fetch('posts.json')
            .then(res => {
                if (!res.ok) throw new Error('Failed to load posts.json');
                return res.json();
            })
            .then(posts => {
                const post = posts.find(p => p.id === postId);
                if (!post) {
                    postContainer.innerHTML = '<h2>Post not found</h2><p class="description">The requested post does not exist.</p>';
                    return;
                }

                // Update document title
                document.title = `${post.title} | My Blog`;

                // Fetch the Markdown file
                return fetch(post.file)
                    .then(res => {
                        if (!res.ok) throw new Error(`Failed to load markdown: ${post.file}`);
                        return res.text();
                    })
                    .then(markdown => {
                        // Render using marked library
                        if (typeof marked !== 'undefined') {
                            postContainer.innerHTML = `
                                <header class="blog-post-header">
                                    <h1>${post.title}</h1>
                                    <p class="date">${post.date}</p>
                                </header>
                                <div class="markdown-body">
                                    ${marked.parse(markdown)}
                                </div>
                            `;
                        } else {
                            // Fallback if marked didn't load
                            postContainer.innerHTML = `
                                <h1>${post.title}</h1>
                                <p class="date">${post.date}</p>
                                <pre style="white-space: pre-wrap; font-family: monospace;">${markdown}</pre>
                            `;
                        }
                    });
            })
            .catch(err => {
                console.error(err);
                postContainer.innerHTML = '<h2>Error Loading Post</h2><p class="description">Failed to load the article contents.</p>';
            });
    } else if (blogListContainer) {
        // --- ARCHIVE / POSTS LIST VIEW ---
        fetch('posts.json')
            .then(res => {
                if (!res.ok) throw new Error('Failed to load posts.json');
                return res.json();
            })
            .then(posts => {
                if (posts.length === 0) {
                    blogListContainer.innerHTML = '<li class="item"><p class="description">No posts found yet.</p></li>';
                    return;
                }

                // Render list
                blogListContainer.innerHTML = posts.map(post => `
                    <li class="item">
                        <div class="item-header">
                            <a href="post.html?id=${post.id}" class="item-title">${post.title}</a>
                            <span class="date">${post.date.split(',')[0]}</span>
                        </div>
                        <p class="description">${post.excerpt}</p>
                    </li>
                `).join('');
            })
            .catch(err => {
                console.error(err);
                blogListContainer.innerHTML = '<li class="item"><p class="description" style="color: var(--accent-terracotta);">Error loading blog feed.</p></li>';
            });
    }
});
