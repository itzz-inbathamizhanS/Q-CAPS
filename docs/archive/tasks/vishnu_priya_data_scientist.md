# Role: Data Scientist & Analytics Engine
**Team Member:** Vishnu Priya
**Focus:** Recommendation Algorithm, Backend API, Database, Scoring Logic

## Exactly What You Need to Build
You are building the "Brain." You need to create a Backend Server (Python FastAPI or Node.js) connected to a database (MongoDB/SQLite). Your most critical task is to build a **Special Recommendation Algorithm**. This algorithm will collect data on how a user answers quizzes and what the scanner finds on their network, and use that data to automatically recommend *exactly* what that individual user needs to study next to close their specific skill gaps.

## How to Use AI to Help You Build It
You can use AI to write the complex mathematical algorithms and API endpoints for you!
**Example Prompts to give your AI:**
*   *"Write a Python algorithm that analyzes a user's historical quiz scores. If they constantly fail questions tagged 'Lattice Math', the algorithm should output a recommendation JSON array pushing them to retake Module 2."*
*   *"Write a Python FastAPI server with an endpoint `/submit-score` that receives a JSON payload of quiz answers, calculates a percentage, and saves it to an SQLite database."*

---

## Your Individual Sub-Segmented Plan

### Phase 1: API Contracts & Mocking (Days 1-3)
*   **Sub-task 1.1:** Meet with the Frontend developer and agree on exactly what the JSON data will look like. (e.g., `{"user_xp": 500, "recommendation": "Retake PQC Basics"}`).
*   **Sub-task 1.2:** Give the Frontend developer a fake JSON example so they can start building their screens.
*   **Sub-task 1.3:** Setup your empty Python/Node backend project.

### Phase 2: Database & APIs (Days 4-7)
*   **Sub-task 2.1:** Create a local database schema that can store a `User`, their `Quiz_Scores`, and their `Scanner_Logs`.
*   **Sub-task 2.2:** Build the API endpoints that the Frontend will eventually call.
*   **Sub-task 2.3:** Write the backend script that calls the Project Lead's Python Scanner tool when a user requests a scan.

### Phase 3: The Recommendation Algorithm (Days 8-10)
*   **Sub-task 3.1:** Build your **Special Recommendation Algorithm**. It must read a user's weak points from the database and output targeted learning paths (e.g., "Your scanner shows RSA vulnerabilities, and you failed the classical cryptography quiz. Recommendation: Complete the 'Migration Strategy' module immediately").
*   **Sub-task 3.2:** Write the script that calculates a user's global ranking (Leaderboard logic) based on their database scores.
