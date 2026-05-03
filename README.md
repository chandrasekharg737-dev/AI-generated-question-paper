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

- **Structure**: Semantic HTML5
- **Styling**: Vanilla CSS3 (Custom Design System, Keyframe Animations, Glassmorphism)
- **Logic**: Vanilla JavaScript (ES6+, LocalStorage API, DOM Manipulation)
- **Deployment**: Optimized for static hosting (GitHub Pages, Render, Vercel)

## 🚀 How to Run Locally

1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/ai-question-generator.git
   ```
2. Navigate to the project directory:
   ```bash
   cd ai-question-generator
   ```
3. Open `index.html` in your favorite browser.

## 🌐 Deployment on Render

This project is a **Static Site**. To deploy it on [Render](https://render.com/):

1. **Push your code** to a GitHub repository.
2. **Log in to Render** and click **"New +"** -> **"Static Site"**.
3. **Connect your GitHub repository**.
4. **Environment**:
   - Go to the **"Environment"** tab.
   - Add `AI_API_KEY` (your real key).
   - Add `APP_NAME` (e.g. AI Question Paper Generator).
5. **Settings**:
   - **Build Command**: `echo "const ENV = { AI_API_KEY: '$AI_API_KEY', APP_NAME: '$APP_NAME' };" > env.js`
   - **Publish Directory**: `.`
6. Click **"Create Static Site"**.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/your-username/ai-question-generator/issues).

## 📝 License

This project is [MIT](https://opensource.org/licenses/MIT) licensed.
