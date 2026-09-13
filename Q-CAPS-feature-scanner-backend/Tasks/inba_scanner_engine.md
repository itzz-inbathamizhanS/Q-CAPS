# Role: Quantum Scanner Engine
**Team Member:** Inba
**Focus:** Network Scanning Logic, Repository Management, Code Integration

## Exactly What You Need to Build
You are building the core technical feature of Q-CAPS: a script that analyzes a URL/IP address and determines if its SSL/TLS certificates are using outdated classical cryptography (like RSA-2048) or quantum-safe algorithms. You are also managing the GitHub repository.

## How to Use AI to Help You Build It
You can use AI to generate the complex network connection scripts and certificate parsing logic.
**Example Prompts to give your AI:**
*   *"Write a Python script using the `ssl` and `socket` libraries that connects to a given URL, downloads its SSL certificate, and outputs the encryption algorithm (e.g., RSA, ECDSA) in JSON format."*
*   *"How do I set up GitHub branch protection rules so my team members can only merge code via Pull Requests?"*

---

## Your Individual Sub-Segmented Plan

### Phase 1: GitHub Setup & Research (Days 1-3)
*   **Sub-task 1.1:** Setup the `Q-CAPS` GitHub repository with a `.gitignore` to block `node_modules`.
*   **Sub-task 1.2:** Turn on Branch Protection for the `main` branch. 
*   **Sub-task 1.3:** Research the Python `cryptography` library to understand how to read x509 certificates.

### Phase 2: Building the Scanner (Days 4-7)
*   **Sub-task 2.1:** Write a basic Python script that successfully returns the certificate details of `https://google.com`.
*   **Sub-task 2.2:** Add logic to flag vulnerabilities (e.g., `if algo == 'RSA' and bits < 3072: flag = 'VULNERABLE TO SHORS ALGORITHM'`).
*   **Sub-task 2.3:** Format the script so it outputs pure JSON, making it easy for the Data Scientist to read it into their API.

### Phase 3: Project Management & Code Review (Days 8-10)
*   **Sub-task 3.1:** As your teammates finish their modules, they will submit Pull Requests on GitHub. You must review their code to make sure it doesn't break the app.
*   **Sub-task 3.2:** Merge the Frontend UI, Backend API, and your Python Scanner together into the `main` branch.
