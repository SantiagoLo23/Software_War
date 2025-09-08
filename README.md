
# Semester Project: The Rise of Juan Sao Ville

## 📖 Overview
This full-stack web application is part of a semester-long adventure to master modern web development. The app is built around a fictional narrative where an evil witcher named **Juan Sao Ville** attempts to convert developers into data scientists. The system tracks victims, manages agents (Slaves of SaaS), and provides a resistance space for developers.

## 🛠️ Tech Stack
- **Backend**: NestJS (Node.js)
- **Database**: MongoDB
- **Frontend**: Next.js + React
- **UI Framework**: Tailwind CSS or shadcn/ui (optional)
- **Authentication**: JWT-based role access

## 👥 User Roles
- **Juan Sao Ville** (Admin): Full control, assigns rewards, views all data
- **Slaves** (Agents): Capture developers, view stats, compete on leaderboard
- **Developers** (Victims/Resisters): Access tips, submit feedback

## 📄 Features
- Role-based login system
- Dashboards for each role
- Capture form and victim tracking
- Leaderboard for slave productivity
- Resistance page with memes and feedback form

## 🚀 Setup Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/semester-project.git
   cd semester-project
   ```
2. Install dependencies (backend and frontend):
   ```bash
   cd backend
   npm install
   cd ../frontend
   npm install
   ```
3. Configure environment variables:
   - Create `.env` files in both `backend` and `frontend` folders
   - Add necessary variables like MongoDB URI, JWT secret, etc.
4. Run the development servers:
   ```bash
   # Backend
   npm run start:dev

   # Frontend
   npm run dev
   ```

## 📦 Branching Strategy
- Main development will occur on the `main` branch.
- Feature branches may be created for specific modules if needed.

## 🤝 Contribution Guidelines
- Commit messages should be clear and descriptive.
- Use pull requests for merging changes.
- Document any new features or changes in the README or separate docs.

## 📚 License
This project is for educational purposes as part of a university semester assignment.
