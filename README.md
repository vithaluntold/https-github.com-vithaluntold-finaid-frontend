# GlobalXchange FinAid - Frontend

React SPA featuring an AI agent marketplace and execution interfaces for financial tasks.

## 🏗️ Architecture

- **Framework**: React 18 with Create React App
- **Routing**: React Router v5
- **Styling**: SCSS modules + Ant Design
- **State Management**: React Query for API state
- **File Processing**: Papa Parse for CSV handling
- **Deployment**: Render.com static site

## 🎯 Features

### Agent Marketplace
- Browse and select from multiple AI financial agents
- Different capability levels: Junior (samjr), Senior (samsr), Super Senior (samsupersr)
- Agent profiles with detailed capabilities and use cases

### Execution Interfaces
- **ExecutionBackend**: Direct integration with Python Flask API
- **ClaudeExecute**: Direct Anthropic API integration
- **Execute**: OpenAI GPT integration
- Real-time file processing with progress indicators

### File Processing
- CSV/Excel upload and processing
- Real-time results display with pagination
- Download processed results
- Error handling and validation

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Backend API running (see backend repository)

### Installation
```bash
npm install
npm start
```

Application runs on `http://localhost:3000`

### Build for Production
```bash
npm run build
```

## 🔧 Environment Variables

Optional configuration:
```bash
REACT_APP_API_URL=http://localhost:3000  # Backend API URL
```

## 🏛️ Project Structure

```
├── public/                  # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── ExecutionBackend/  # Backend API components
│   │   ├── ClaudeExecute/     # Anthropic integration
│   │   ├── Execute/           # OpenAI integration
│   │   ├── custom/            # Reusable UI components
│   │   ├── home/              # Landing page components
│   │   ├── marketplace/       # Agent marketplace
│   │   └── navbar/            # Navigation
│   ├── pages/              # Route components
│   ├── assets/             # Static assets and data
│   │   ├── data/           # Configuration and constants
│   │   ├── functions/      # Utility functions
│   │   └── images/         # Images and icons
│   └── app.scss           # Global styles
└── package.json
```

## 🎨 Component Architecture

### Component Naming Convention
- `ExecutionBackend/` - Components that call Python backend APIs
- `ClaudeExecute/` - Direct Anthropic API integration components  
- `Execute/` - OpenAI API integration components
- Agent variations: `samjr/`, `samsr/`, `samsupersr/` represent capability levels

### File Processing Workflow
1. User uploads CSV/Excel file via drag-and-drop or file picker
2. File converted to FormData for API transmission
3. Backend processes file through appropriate AI agent
4. Results displayed with pagination and download options

### Styling System
- SCSS modules: `component.module.scss` pattern
- Global styles in `app.scss`
- Ant Design (antd) components for UI consistency
- Custom dropdowns and form elements

## 🔗 API Integration

Frontend integrates with backend APIs using configurable base URL:

```javascript
import { finaidAgentsURL } from "../../../assets/data";
const response = await axios.post(`${finaidAgentsURL}/api/coa-generator/generate-csv`, formData);
```

## 🚀 Deployment

### Render.com
1. Connect this repository to Render
2. Create Static Site with:
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`
3. Set `REACT_APP_API_URL` environment variable to backend URL

### Available Scripts

- `npm start` - Development server
- `npm run build` - Production build
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (irreversible)

## 📱 Routes

- `/` - Home/Landing page
- `/marketplace` - Agent marketplace
- `/marketplace/{agentid}` - Agent profile page
- `/execute/{provider}/{finaid}` - Agent execution interface
  - `provider`: `gpt`, `claude`, or `backend`
  - `finaid`: Agent identifier

## 🧩 Key Dependencies

- **React**: UI framework
- **React Router v5**: Client-side routing
- **Axios**: HTTP client for API calls
- **Ant Design**: UI component library
- **Papa Parse**: CSV parsing
- **React Query**: Server state management
- **React Paginate**: Pagination component
- **React Toastify**: Toast notifications
- **SASS**: CSS preprocessing

## 👥 Maintained by

**vithaluntold** (vithal@financegroup.com)

## 📄 License

Private - All rights reserved

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
