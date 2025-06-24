# 🖥️ BlogSpot Frontend

**BlogSpot Frontend** is a modern, **React-based web application** that serves as the user interface for the BlogSpot blogging platform. It connects to the **BlogSpot Backend API** to display blog posts, manage user authentication, and enable content creation. The frontend is deployed on **Vercel** for reliable and scalable hosting.

---

## 🚀 Features

- 📱 **Responsive Design**: Optimized for all screen sizes using **Tailwind CSS**  
- 🔐 **User Authentication**: JWT-based login and registration  
- ✍️ **Post Management**: View, create, update, and delete blog posts  
- 🖼️ **Media Support**: Displays media stored via Cloudinary on the backend  
- 🔗 **Secure API Integration**: All API communication over HTTPS

---

## 🛠 Tech Stack

| Category        | Technology                     |
|----------------|---------------------------------|
| Framework       | React                          |
| Styling         | Tailwind CSS                   |
| Build Tool      | Vite                           |
| HTTP Client     | Axios                          |
| Deployment      | Vercel                         |

---

## 📋 Prerequisites

- Node.js 18.x+  
- npm 10.x+  
- Git  
- Vercel account (for deployment)  
- Access to BlogSpot Backend API: `https://blogspot-backend.nikhilrajpk.in/api/`

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

git clone https://github.com/nikhilrajpk/blogSpot_frontend.git
cd blogSpot_frontend
2. Install Dependencies

npm install
3. Configure Environment Variables
Create a .env file:

touch .env
Add:


REACT_APP_API_URL=https://blogspot-backend.nikhilrajpk.in/api/
4. Run Locally

npm run dev
App will run at: http://localhost:5173

5. Build for Production

npm run build
6. Deploy on Vercel
Install Vercel CLI:

npm install -g vercel
Login to Vercel:


vercel login
Deploy the project:


vercel
Set the environment variable in Vercel Dashboard:

env

REACT_APP_API_URL=https://blogspot-backend.nikhilrajpk.in/api/
Access the live app:
🌐 https://blogspot-frontend.nikhilrajpk.in

📁 Project Structure

├── public/               # Static assets
├── src/
│   ├── assets/           # Images and styles
│   ├── components/       # Reusable React components
│   ├── pages/            # Page components (e.g., Home, Login)
│   ├── App.jsx           # Main App component
│   ├── main.jsx          # Entry point
├── .env                  # Environment variables
├── package.json          # Project metadata and dependencies
├── vite.config.js        # Vite configuration
🤝 Contributing
Fork the repository

Create a feature branch:


git checkout -b feature-name
Commit your changes:

git commit -m "Add feature"
Push your branch:


git push origin feature-name
Open a pull request 🚀
