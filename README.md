# Capstone2-codeAI
# CodeAI

An interactive AI-powered coding tutor designed to teach Python, Java, C, C++, and R. CodeAI provides step-by-step learning, mimics online textbooks, and generates interactive quizzes with hints and answers.

## ✨ Features

- **Multi-Language Support:** Learn Python, Java, C, C++, and R.
- **Interactive Quizzes:** Ask for practice questions and get "Hint" and "Show Answer" buttons.
- **Textbook-Style Teaching:** Step-by-step structured lessons based on popular online documentation.
- **Sidebar Navigation:** Quickly switch languages or review your search history.
- **Code Highlighting:** Clean, readable code blocks for all examples.
- **Streaming Responses:** Real-time explanations.

## 🚀 Getting Started

Follow these instructions to get the project running.

### Prerequisites

You need a modern web browser and a Google Gemini API Key.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/CodeAI.git
    cd CodeAI
    ```

2.  **Create an Environment File:**
    In the root directory, create a `.env` file.

3.  **Add your API Key:**
    - Get your key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    - Add it to `.env`:
      ```
      API_KEY="YOUR_GEMINI_API_KEY_HERE"
      ```

4.  **Run the application:**
    Open `index.html` in your browser.

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript
- **AI Model:** Google Gemini API (`gemini-2.5-flash`)
- **Rendering:** `marked` for Markdown to HTML conversion
- **Styles:** Custom CSS Variables

---

_CodeAI is an educational tool._
