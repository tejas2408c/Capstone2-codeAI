import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Chat } from '@google/genai';
import { marked } from 'marked';

const codingLanguages = [
    'Python',
    'Java',
    'C',
    'C++',
    'R'
];

const App = () => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'model'; parts: string }>>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [sidebarTab, setSidebarTab] = useState<'languages' | 'history'>('languages');
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Optimized system instruction for CodeAI
    const systemInstruction = `You are CodeAI, an expert programming tutor specializing in Python, Java, C, C++, and R.

**Your Goal:** Teach coding concepts step-by-step, mimicking the structure of top online textbooks (like W3Schools, MDN, or GeeksforGeeks).

**Guidelines:**
1.  **Teaching Style:** 
    - Be clear, concise, and structured. 
    - Use "Step 1", "Step 2" formats.
    - Refer to "standard library documentation" style explanations.
2.  **Code:** Always use Markdown code blocks (e.g., \`\`\`python ... \`\`\`).
3.  **Interactive Questions & MCQs (CRITICAL):**
    - When asking the user to solve a problem or answering a request for a quiz, you **MUST** use HTML \`<details>\` tags to hide the hint and the answer.
    - Do not show the answer immediately.
    - **Format:**
    
      **Question:** [The Question Text]
      
      <details class="hint-details">
      <summary>💡 Need a Hint?</summary>
      [A subtle hint that guides them without giving it away]
      </details>
      
      <details class="answer-details">
      <summary>👁️ Show Answer</summary>
      [The full correct answer with code explanation]
      </details>

4.  **Formatting:** Ensure there are empty lines around the HTML tags so Markdown renders correctly.
`;

    useEffect(() => {
        const initChat = async () => {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                const chatSession = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: {
                        systemInstruction,
                    },
                });
                setChat(chatSession);

                // Initial greeting
                setIsLoading(true);
                const initialGreeting = "Hello! I'm **CodeAI**. I can teach you Python, Java, C, C++, or R step-by-step.\n\nSelect a language from the menu to start a structured course, or ask me to generate practice questions!";
                setMessages([{ role: 'model', parts: initialGreeting }]);
                setIsLoading(false);

            } catch (err) {
                console.error("Initialization error:", err);
                setError("Failed to initialize CodeAI. Please check the API key.");
            }
        };
        initChat();
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const sendMessage = async (messageText: string) => {
        if (isLoading || !messageText.trim()) return;

        setIsLoading(true);
        setError(null);

        const userMessage = { role: 'user' as const, parts: messageText };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');

        if (!chat) {
            setError("Chat session is not initialized.");
            setIsLoading(false);
            return;
        }

        try {
            const stream = await chat.sendMessageStream({ message: messageText });

            let currentModelMessage = "";
            setMessages(prev => [...prev, { role: 'model', parts: "" }]);

            for await (const chunk of stream) {
                const chunkText = chunk.text;
                if (chunkText) {
                    currentModelMessage += chunkText;
                    setMessages(prev => {
                        const newMessages = [...prev];
                        newMessages[newMessages.length - 1].parts = currentModelMessage;
                        return newMessages;
                    });
                }
            }
        } catch (err) {
            console.error("API error:", err);
            setError("Sorry, something went wrong. Please try again.");
            setMessages(prev => prev.slice(0, -1));
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(inputValue);
    };

    const handleLanguageSelect = (language: string) => {
        sendMessage(`I want to learn ${language}. Please teach me step-by-step from the basics, like an online textbook course.`);
        setIsSidebarOpen(false);
    };

    const parseMessage = (text: string) => {
        const rawHtml = marked.parse(text);
        return { __html: rawHtml };
    };

    return (
        <div className="app-shell">
            <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h2>CodeAI Menu</h2>
                    <button className="close-btn" onClick={() => setIsSidebarOpen(false)} aria-label="Close menu">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <nav className="sidebar-nav">
                    <button 
                        className={`sidebar-nav-button ${sidebarTab === 'languages' ? 'active' : ''}`}
                        onClick={() => setSidebarTab('languages')}>
                        Curriculum
                    </button>
                    <button 
                        className={`sidebar-nav-button ${sidebarTab === 'history' ? 'active' : ''}`}
                        onClick={() => setSidebarTab('history')}>
                        History
                    </button>
                </nav>
                <div className="sidebar-content">
                    {sidebarTab === 'languages' && (
                        <ul className="chapter-list">
                            {codingLanguages.map((lang, index) => (
                                <li key={index} className="chapter-item" onClick={() => handleLanguageSelect(lang)}>
                                    <span className="lang-icon">{'</>'}</span> {lang}
                                </li>
                            ))}
                        </ul>
                    )}
                    {sidebarTab === 'history' && (
                        <ul className="history-list">
                            {messages.filter(msg => msg.role === 'user').map((msg, index) => (
                                <li key={index} className="history-item" onClick={() => {
                                    setInputValue(msg.parts);
                                    setIsSidebarOpen(false);
                                }}>
                                    <div className="history-text">{msg.parts}</div>
                                </li>
                            )).reverse()}
                        </ul>
                    )}
                </div>
            </aside>
            <div className="container">
                <header className="header">
                    <button className="menu-button" onClick={() => setIsSidebarOpen(true)} aria-label="Open menu">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    </button>
                    <div className="header-title-group">
                        <h1 className="title">CodeAI</h1>
                        <p className="subtitle">Learn Python, Java, C, C++, R</p>
                    </div>
                </header>
                <main className="chat-window">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.role === 'user' ? 'user-message' : 'model-message'}`}>
                        <div className="avatar">
                            {msg.role === 'user' ? '🧑‍💻' : '🤖'}
                        </div>
                        <div className={`message-content ${msg.role === 'user' ? 'user-message-content' : 'model-message-content'}`} dangerouslySetInnerHTML={parseMessage(msg.parts)}></div>
                        </div>
                    ))}
                    {isLoading && messages[messages.length - 1]?.role === 'user' && (
                        <div className="message model-message">
                            <div className="avatar">🤖</div>
                            <div className="typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </main>
                <footer className="footer">
                    {error && <p className="error-text">{error}</p>}
                    <form onSubmit={handleFormSubmit} className="input-form">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask to teach a concept, or generate a quiz..."
                            className="input"
                            disabled={isLoading}
                            aria-label="Chat input"
                        />
                        <button type="submit" className="send-button" disabled={isLoading} aria-label="Send message">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                        </button>
                    </form>
                </footer>
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
