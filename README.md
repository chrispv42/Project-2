# GIFScout — Clean Giphy Search (Project 2)

A sleek, professional Giphy search app with **true Light/Dark mode**, **glassmorphism**, **Bootstrap 5.3.8** polish, and a **custom flex grid** for results (to meet the project requirement). Includes **SASS** for extra credit. The project’s rubric emphasizes a custom grid, responsiveness (desktop and ≤320px), and separate files. :contentReference[oaicite:1]{index=1} :contentReference[oaicite:2]{index=2}

## Features
- Search form (type=search) + button
- Fetches Giphy **Search Endpoint** and renders results as cards
- **Custom flex grid** (`.grid` + `.col`) — not Bootstrap’s grid
- **Light/Dark mode** toggle; also respects `prefers-color-scheme`
- **Glassmorphism** card wrapper
- Mobile-first with ≤320px stacking per spec

## Getting Started
1. Open `main.js` and set your API key:
   ```js
   const API_KEY = "REPLACE_ME_WITH_YOUR_GIPHY_API_KEY";

## Tech Stack

HTML, CSS, SASS (extra credit), Vanilla JavaScript
Bootstrap 5.3.8 (CDN) for base styles/components
Google Fonts (..)

## Structure
project-root/
│
├── index.html
├── CSS/
│   └── style.css
├── JS/
│   └── script.js
└── Images/
    └── image.png

## How to Use

Enter a term and click Search.
Click Open on any card to view the GIF at Giphy.

## Ideas for Future Improvement

1. Pagination / infinite scroll
2. Filters: rating, type, stickers vs gifs
3. Saved searches & favorites
4. Skeleton loaders and retry

