# 🧩 Sudoku

<p>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
</p>

A modern, responsive **Sudoku game** built with React, TypeScript, and Tailwind CSS. Generate puzzles of varying difficulty, solve them with a clean, intuitive UI, and track your progress with a built-in timer and mistake counter.

---

## Table of Contents

- [Features](#-features)
- [Demo](#-demo)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## Features

- **Puzzle Generator** — randomly generated, uniquely solvable puzzles
- **Multiple Difficulty Levels** — Easy, Medium, Hard, Expert
- **Notes / Pencil Mode** — jot down candidate numbers in a cell
- **Timer** — track how long it takes you to solve a puzzle
- **Undo / Redo** — step back and forth through your moves
- **Mistake Tracking** — highlights invalid entries in real time
- **Hint System** — get a nudge when you're stuck
- **Light / Dark Mode** — play comfortably at any time of day
- **Fully Responsive** — works on desktop, tablet, and mobile
- **Auto-Save Progress** — resume your game where you left off

---

## Tech Stack

| Category         | Technology                     |
|-------------------|--------------------------------|
| Framework         | React                          |
| Language          | TypeScript                     |
| Build Tool        | Vite                           |
| Styling           | Tailwind CSS                   |
| State Management  | React Context / Hooks          |
| Deployment        | Vercel / Netlify               |
| Version Control   | Git & GitHub                   |

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/TahiraNawab123/Sudoku.git
   cd Sudoku
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

4. **Open the app**

   Visit `http://localhost:5173` in your browser.

### Build for Production

```bash
npm run build
```
---

## Usage

1. Choose a difficulty level to start a new game.
2. Click a cell and enter a number (1–9) using the on-screen keypad or your keyboard.
3. Toggle **Notes Mode** to add candidate numbers to a cell.
4. Use **Undo/Redo** if you make a mistake.
5. Use a **Hint** if you get stuck.
6. Solve the puzzle before the timer runs out (if timed mode is enabled) — or just relax and enjoy!

---

## Project Structure

```
Sudoku/
├── public/                # Static assets
├── src/
│   ├── components/        # Reusable UI components (Grid, Cell, Keypad, etc.)
│   ├── hooks/              # Custom React hooks (useTimer, useSudoku, etc.)
│   ├── utils/               # Sudoku generator & solver logic
│   ├── context/            # Global state management
│   ├── styles/              # Tailwind/global styles
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a new branch 
3. Commit your changes
4. Push to the branch 
5. Open a Pull Request

---

<p align="center"> If you like this project, consider giving it a star!</p>
