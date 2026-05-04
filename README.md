# 🤖 AI-Based Question Paper Generator

A professional, visually stunning AI-powered platform designed to help educators generate high-quality question papers in seconds. Featuring a premium "Cyber-AI" aesthetic, a friendly robot assistant, and a persistent history system.

![AI Question Paper Generator](robot.png) *(Ensure robot.png is present in the root directory)*

## ✨ Features

- **🚀 Smart Generation**: Instantly generate structured exam papers with MCQs, Short Answers, Long Answers, and True/False questions.
- **🤖 Interactive AI Assistant**: A cute, animated 3D robot mascot that guides you through the process with context-aware tips and emotional expressions.
- **📜 Paper History**: Persistent storage using `localStorage`. Save your creations and access them anytime later.
- **📄 Professional Formatting**: Formal exam headers including Subject, Topic, Date, Duration, and automated Marks Distribution.
- **🖨️ Print-Ready Layout**: Optimized `@media print` styles ensure your generated papers look perfect on physical paper, stripping away UI elements for a clean academic look.
- **🎨 Premium Aesthetics**: A "Cyber-Pastel" design language featuring glassmorphism, mesh gradients, and interactive mouse parallax effects.

## 🛠️ Technology Stack

- **Frontend**: Semantic HTML5, Vanilla CSS3 (Custom Design System), Vanilla JS (ES6+)
- **Backend**: Node.js, Express.js
- **AI Engine**: Google Gemini 1.5 Flash (via @google/generative-ai)
- **Security**: Environment variables via `dotenv`
- **Deployment**: Optimized for Render (Web Service), Heroku, or any Node.js host.

## 🚀 How to Run Locally

1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/ai-question-generator.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root and add your Gemini API key:
   ```env
   AI_API_KEY=your_gemini_api_key_here
   APP_NAME=EduAI Generator
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Open `http://localhost:3000` in your browser.

## 🌐 Deployment on Render (Web Service)

This project is now a **Node.js Web Service**. To deploy it:

1. **Push your code** to a GitHub repository.
2. **Log in to Render** and click **"New +"** -> **"Web Service"**.
3. **Connect your GitHub repository**.
4. **Environment**:
   - Go to the **"Environment"** tab.
   - Add `AI_API_KEY` (Your Google Gemini API Key).
   - Add `APP_NAME` (e.g., AI Question Paper Generator).
5. **Settings**:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
6. Click **"Create Web Service"**.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/your-username/ai-question-generator/issues).

## 📝 License

This project is [MIT](https://opensource.org/licenses/MIT) licensed.
