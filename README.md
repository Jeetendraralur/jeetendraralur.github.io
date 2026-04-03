# Minimalistic Personal Website Template

This is a clean, minimalistic, and easy-to-edit personal website designed for GitHub Pages.

## 📁 Structure
- `/index.html`: Your main landing page (About, CV, Projects).
- `/blog/index.html`: The list of all your blog posts.
- `/blog/posts/`: Individual blog post files.
- `/assets/css/style.css`: All the styling rules.

## 🖋️ Typography
- **Headings & Main Info**: Uses `Inter` (Sans-serif) for professional clarity.
- **Descriptions & Technical Details**: Uses `Departure Mono` (a distinctive pixel font) to add character to the smaller details.

## 🚀 How to...

### Edit Your Info
1. Open `index.html`.
2. Find the sections (About, Projects, Experience).
3. Update the text within the `<h2>`, `<p>`, and `<li>` tags.

### Add a Blog Post
1. Go to `blog/posts/`.
2. Copy `template.html` and rename it (e.g., `my-new-story.html`).
3. Open the new file and change the `<h1>` title and the content inside `<main>`.
4. Open `blog/index.html` and add a new link to your post at the top of the list.

### Change Colors or Fonts
1. Open `assets/css/style.css`.
2. Update the variables at the top under `:root`. For example, change `--bg-color` or `--accent-color`.

## 💡 A Better Way? (Scale)
This manual approach is great for keeping things simple and having 100% control without needing any software.

However, if you plan to write **many blog posts**, updating the index manually can become tedious. In that case, I recommend:
1. **Jekyll**: GitHub Pages has built-in support for Jekyll. You can write posts in **Markdown** (`.md`) files and the site will build the index automatically.
2. **Hugo**: If you want a faster, more modern generator.

For now, this template gives you a solid, aesthetically pleasing foundation that is easy to understand and edit!
