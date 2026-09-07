# A1 — Computing Foundations
**module_id:** `track_a_a1_computing_foundations`
**Level:** Beginner | **Estimated Time:** 120 minutes | **Track:** A — Foundations

## Learning Objectives
- Explain what a computer actually does at the hardware level (CPU, memory, storage).
- Understand what an operating system and a process are, and why that matters for security later.
- Write and run basic Python programs.
- Understand core algorithm/data-structure concepts and use Git for version control.
- Navigate a Linux command line confidently.

---

## 1.1 Computer Fundamentals
A computer is fundamentally a machine that follows instructions extremely fast and extremely literally. Every action — opening a browser, running a scan, encrypting a file — ultimately reduces to billions of simple operations executed by the **CPU (Central Processing Unit)**. Understanding this "instructions in, instructions out" model is the foundation for understanding both how software works and how it can be attacked (e.g., an attacker exploiting how the CPU executes instructions is the basis of side-channel attacks, covered much later in Track C).

## 1.2 Operating Systems and Processes
An **operating system (OS)** manages hardware resources and runs **processes** — individual running programs, each with their own memory space, isolated from other processes. This isolation is a foundational security concept: it's *why* one browser tab crashing doesn't crash your whole computer, and it's the same principle behind sandboxing and containerization used in modern cybersecurity architecture.

## 1.3 CPU, Memory, and Storage
- **CPU** — executes instructions.
- **Memory (RAM)** — fast, temporary storage for data actively being used; lost when powered off.
- **Storage (disk/SSD)** — slower, permanent storage.

This distinction matters directly for cryptography: cryptographic keys held only in memory are more vulnerable to certain live-system attacks, while keys on disk are vulnerable to different threats (theft, unauthorized access) — informing key-management decisions covered in Track B.

## 1.4 Programming Concepts
Variables, functions, loops, conditionals, and data types are the building blocks of every program you'll write in this course, including the Python scanning and scoring scripts your teammates are building.

## 1.5 Python Fundamentals
Python is the primary language used across Q-CAPS — Inba's scanner engine and Vishnu Priya's backend both use it. Core skills to build here: variables and data types, control flow (`if`/`for`/`while`), functions, working with strings and JSON, and using libraries (`import`).

**🎨 Interactive/Visual Requirement:**
> In-browser Python code sandbox (e.g., embedded Pyodide) where learners can run small snippets directly and see output immediately, rather than just reading code blocks.

## 1.6 Algorithms and Data Structures
Basic algorithmic thinking (searching, sorting, complexity/Big-O intuition at a beginner level) and core data structures (lists, dictionaries, sets) — enough to read and reason about code you'll encounter throughout the program, including quantum algorithm pseudocode later in Track B.

## 1.7 Git and Development Environments
Version control is not optional for any team-based technical project. Learners should be able to: clone a repository, create a branch, commit changes, push to a remote, and open a Pull Request — exactly the workflow your own Q-CAPS team already uses.

## 1.8 Linux Fundamentals
Basic command-line navigation (`cd`, `ls`, `pwd`), file operations (`cp`, `mv`, `rm`), permissions (`chmod`), and process management (`ps`, `kill`) — essential because most servers, scanning tools, and cloud infrastructure run on Linux.

---

## Module Wrap-Up
- Knowledge check quiz covering all 8 sections above.
- Practical assessment: complete a short Python scripting exercise and a Git workflow exercise (clone → branch → commit → push → PR).
- Unlocks: `A2 — Mathematics Foundations`.
