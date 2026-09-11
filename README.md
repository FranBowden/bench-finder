# Bench Finder 2.0

Bench Finder is a React-based website that helps you locate and explore benches near your location. It fetches bench data from OpenStreetMap and displays it on an interactive Mapbox GL map, showing distances from your current position.

## Live Demo
Check out the live version here: [Bench Finder](https://bench-finder.onrender.com)


**What's new in 2.0**  a full redesign, plus real fixes to how the app actually behaves:
- Redesigned, responsive UI (desktop sidebar + a draggable bottom sheet on mobile)
- Map markers render via a single WebGL layer instead of one DOM marker per bench, so it stays fast at any result count
- Instant straight-line distance estimates for the list, with the real routed distance/duration + walking route fetched only for the bench you actually select
- Fixed bench results and walking-time lookups that were silently failing (Overpass/Mapbox request issues)
- Unit test suite (Vitest) covering the core fetching, distance, and click-handling logic

## Tech Stack
- TypeScript
- React
- TailwindCSS
- Express.js
- Node.js
- Mapbox GL
- OpenStreetMap API
- Vitest (unit tests)

## Features

- Detect your current location and display it on the map
- Show nearby benches as markers on the Mapbox GL map
- Display a list of the nearest benches with distances and directions
- Change search area radius
- Search for benches in a specific town or area using a search bar
- **Upcoming Features:**
  - Filter benches by type or characteristics

## Credits
- Bench icons by [DinosoftLabs](https://www.flaticon.com/free-icons/bench) from Flaticon

---

<details>
<summary><h2 style="display:inline">Version 1.0 (original)</h2></summary>

The original release, before the 2.0 redesign — kept here for reference.

<img width="1908" height="811" alt="Screenshot of the original Bench Finder website" src="https://github.com/user-attachments/assets/b7f0b803-f04f-4fe8-9776-6a7c7f08cb92" />

</details>
