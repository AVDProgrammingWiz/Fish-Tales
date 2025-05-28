document.addEventListener('DOMContentLoaded', () => {
  // Common functions
  const getPosts = () => JSON.parse(localStorage.getItem('posts')) || [];
  const savePosts = (posts) => localStorage.setItem('posts', JSON.stringify(posts));
  const getSubscribers = () => JSON.parse(localStorage.getItem('subscribers')) || [];
  const saveSubscribers = (subscribers) => localStorage.setItem('subscribers', JSON.stringify(subscribers));

  // Home page logic
  if (document.getElementById('blog-posts')) {
    const blogPosts = document.getElementById('blog-posts');
    const starredPostsContainer = document.getElementById('starred-posts-container');
    const newsletterForm = document.getElementById('newsletter-form');
    const newsletterMessage = document.getElementById('newsletter-message');

    // Render starred posts
    const renderStarredPosts = () => {
      const posts = getPosts().filter(post => post.starred);
      starredPostsContainer.innerHTML = '';
      if (posts.length === 0) {
        starredPostsContainer.innerHTML = '<p class="text-gray-600">No featured posts yet.</p>';
        return;
      }
      posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'starred-post-card';
        postElement.innerHTML = `
          <h3>${post.title}</h3>
          <p>${post.content.substring(0, 150)}...</p>
          <p class="author">By ${post.author} on ${post.date}</p>
        `;
        starredPostsContainer.appendChild(postElement);
      });
    };

    // Render regular posts
    const renderPosts = () => {
      const posts = getPosts();
      blogPosts.innerHTML = '<h2 class="text-2xl font-semibold text-green-800 mb-4 col-span-full">All Posts</h2>';
      posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post-card';
        postElement.innerHTML = `
          <h3>${post.title}</h3>
          <p>${post.content.substring(0, 100)}...</p>
          <p class="author">By ${post.author} on ${post.date}</p>
        `;
        blogPosts.appendChild(postElement);
      });
    };

    // Handle newsletter subscription
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email-input').value;
      const subscribers = getSubscribers();
      if (!subscribers.includes(email)) {
        subscribers.push(email);
        saveSubscribers(subscribers);
        newsletterMessage.classList.remove('hidden');
        setTimeout(() => newsletterMessage.classList.add('hidden'), 3000);
        newsletterForm.reset();
      }
    });

    renderStarredPosts();
    renderPosts();
  }

  // Editor page logic
  if (document.getElementById('password-section')) {
    const passwordSection = document.getElementById('password-section');
    const editorSection = document.getElementById('editor-section');
    const passwordForm = document.getElementById('password-form');
    const passwordError = document.getElementById('password-error');
    const postForm = document.getElementById('post-form');
    const postList = document.getElementById('post-list');

    // Password check
    passwordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const password = document.getElementById('password-input').value;
      if (password === 'angler123') {
        passwordSection.classList.add('hidden');
        editorSection.classList.remove('hidden');
        renderPostList();
      } else {
        passwordError.classList.remove('hidden');
        setTimeout(() => passwordError.classList.add('hidden'), 3000);
      }
    });

    // Render post list for deletion
    const renderPostList = () => {
      const posts = getPosts();
      postList.innerHTML = '';
      posts.forEach((post, index) => {
        const li = document.createElement('li');
        li.className = 'bg-white p-4 rounded-md shadow-md flex justify-between items-center';
        li.innerHTML = `
          <span>${post.title} by ${post.author}${post.starred ? ' (Starred)' : ''}</span>
          <button class="delete-btn" data-index="${index}">Delete</button>
        `;
        postList.appendChild(li);
      });

      // Add delete event listeners
      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const index = btn.getAttribute('data-index');
          const posts = getPosts();
          posts.splice(index, 1);
          savePosts(posts);
          renderPostList();
        });
      });
    };

    // Handle new post creation
    postForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('post-title').value;
      const content = document.getElementById('post-content').value;
      const author = document.getElementById('post-author').value;
      const starred = document.getElementById('post-starred').checked;
      const date = new Date().toLocaleDateString();

      const posts = getPosts();
      posts.push({ title, content, author, date, starred });
      savePosts(posts);
      postForm.reset();
      renderPostList();
    });
  }
});
