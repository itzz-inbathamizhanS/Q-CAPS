# Q-CAPS Master Implementation Plan (Team of 4)

This plan breaks down the entire Q-CAPS project into manageable segments. You can use these exact segments as prompts for AI generation or as Jira/Trello tickets for your team members.

## User Review Required
> [!IMPORTANT]
> Review these segments with your Faculty Guide. Once approved, your team can start executing **Segment 1** immediately without blocking each other.

---

## Segment 1: The Foundation (Mock Data & Basic UI)
*Goal: Get the core platform running with fake data so the UI developer can start building.*

### 1. Frontend (Cyber Member 2)
- Initialize the React/Vite project.
- Build the basic routing: Home, Scanner, Training, Assessment, Profile.
- Implement a static Tailwind CSS layout with placeholders.

### 2. Analytics / Backend (Data Science Member)
- Define the exact JSON structures (the "API Contract") for what the Scanner and Quizzes will output.
- Create hardcoded JSON files (mock data) and give them to the Frontend member.

### 3. Scanner Engine (Project Lead)
- Research Python libraries for network scanning (e.g., `ssl`, `cryptography`, `nmap`).
- Write a basic Python script that can accept a URL and check its SSL certificate version.

### 4. Content & Labs (Cyber Member 3)
- Write a document containing 10 basic cryptography quiz questions.
- Write a 1-page summary on Shor's Algorithm and ML-KEM to be used as placeholder text on the Training page.

---

## Segment 2: The Core Logic (Real Functionality)
*Goal: Replace the fake data with real, working code.*

### 1. Frontend (Cyber Member 2)
- Connect the React application to the Backend API (using `fetch` or `axios`).
- Build the interactive Quiz UI (radio buttons, submit button, next question logic).

### 2. Analytics / Backend (Data Science Member)
- Build a Python FastAPI or Node/Express server.
- Create API endpoints: `POST /api/scan`, `POST /api/submit-quiz`, `GET /api/leaderboard`.
- Connect the server to a basic SQLite or MongoDB database to store users.

### 3. Scanner Engine (Project Lead)
- Upgrade the Python script to specifically detect RSA, ECC, and check for hybrid quantum-safe certificates.
- Convert the script into an API route so the Frontend can trigger a scan from the website.

### 4. Content & Labs (Cyber Member 3)
- Design the first "Hacker Scenario" for the assessment.
- Implement secure JWT (JSON Web Token) authentication for the Login/Signup pages.

---

## Segment 3: Gamification & Analytics Engine
*Goal: Turn the platform into an addictive game.*

### 1. Frontend (Cyber Member 2)
- Add visual flair: Animations when a user submits a correct quiz answer.
- Build the **Global Leaderboard** page and the User Profile "Badges" display.

### 2. Analytics / Backend (Data Science Member)
- Write the Elo/MMR scoring algorithm: Calculate exactly how many XP points a user gets based on quiz difficulty.
- Build the algorithm that combines Scanner Results + Quiz Scores to generate the final **Organizational Readiness Score**.

### 3. Scanner Engine (Project Lead)
- Frame the scanner as a "Recon Mission". When the scanner finishes, output a "Mission Success" or "Bounty Found" JSON object containing XP points earned.

### 4. Content & Labs (Cyber Member 3)
- Create 3 distinct difficulty levels of quizzes (Novice, Professional, Quantum Expert).
- Map specific badges to specific modules (e.g., "Lattice Logic Badge" for completing the ML-DSA module).

---

## Segment 4: Testing & Publication Prep
*Goal: Polish the platform and run the user study for your research paper.*

### Team Effort
- **Deploy the Platform:** Host the Frontend on Vercel/Netlify, and the Backend on Render/Heroku.
- **Run the User Study:** Have 30 classmates use the platform from start to finish.
- **Analyze Data (Data Scientist):** Generate charts proving that user knowledge increased after using Q-CAPS.
- **Write the Paper:** Compile the results for IEEE/ACM submission.
