# EduScribe - Logical Frontend Workflow

## 🎯 **New User-Centric Design**

The frontend has been completely redesigned around a **subject-based workflow** that makes sense for students and educators. Here's how it works:

---

## 🔄 **Complete User Journey**

### **1. Dashboard (`/`)**
**What users see:**
- Welcome screen with personal stats (Active Subjects, Total Lectures, Study Hours)
- **My Subjects** section showing enrolled courses with progress bars
- **Quick Actions**: Browse Subjects, Join Webinar, Quick Lecture
- **Webinar option** prominently displayed for future functionality

**Key Features:**
- Subject cards with color coding and progress tracking
- Direct navigation to subject details
- Webinar integration teaser

---

### **2. My Subjects (`/subjects`)**
**What users see:**
- Grid/List view of all enrolled subjects
- Search and filter functionality (including starred subjects)
- Each subject shows: instructor, lecture count, progress, next lecture date

**Key Features:**
- **Star/favorite subjects** for quick access
- **Start Lecture** button directly from subject card
- **View Details** to dive deeper into each subject
- Add new subjects functionality

---

### **3. Subject Detail (`/subjects/:id`)**
**What users see:**
- Subject header with instructor info and description
- **Two tabs**: Lectures & Documents
- **Quick Actions**: Start New Lecture, Upload Documents, Export All Notes
- Complete lecture history for that specific subject

**Key Features:**
- **Subject-specific context** - all lectures belong to this subject
- **Document management** per subject (for RAG context)
- **Lecture management** with search, filter, and star functionality
- **Start Lecture** button that maintains subject context

---

### **4. Live Lecture (`/subjects/:id/lecture`)**
**What users see:**
- **Subject context** in header (Machine Learning - CS-401)
- Real-time recording interface with subject-aware note generation
- Live transcription with importance scoring
- Generated notes that understand the subject context

**Key Features:**
- **Subject-aware AI processing** - notes are generated with subject context
- **Document integration** - uses uploaded subject materials for better context
- **Breadcrumb navigation** back to subject detail page

---

### **5. Webinar (`/webinar`)**
**What users see:**
- **Browse Webinars**: Live and upcoming webinars
- **My Webinars**: Registered webinars
- **Host Webinar**: Create and schedule webinars
- **Full webinar interface** with video, chat, screen sharing

**Key Features:**
- **Live webinar participation** with AI note generation
- **Webinar hosting** capabilities
- **Interactive features**: chat, hand raising, screen sharing
- **AI-powered notes** for webinar content

---

### **6. Profile (`/profile`)**
**What users see:**
- Personal information management
- Study statistics and progress
- Notification preferences
- Data export and privacy controls

---

## 🧠 **Logical Workflow Benefits**

### **For Students:**
1. **Subject Organization**: All lectures are organized by subject/course
2. **Context Awareness**: AI knows which subject you're studying
3. **Progress Tracking**: See completion progress per subject
4. **Easy Navigation**: Intuitive flow from subject → lectures → notes
5. **Document Integration**: Upload course materials per subject for better AI context

### **For Educators:**
1. **Webinar Hosting**: Built-in webinar functionality
2. **Subject Management**: Organize content by course
3. **Student Engagement**: Interactive features and real-time feedback
4. **Content Export**: Easy export of all course materials

---

## 🔗 **Technical Implementation**

### **Routing Structure:**
```
/ (Dashboard)
├── /subjects (All Subjects)
├── /subjects/:id (Subject Detail)
├── /subjects/:id/lecture (Live Lecture with Subject Context)
├── /notes/:id (Notes Viewer)
├── /webinar (Webinar Hub)
└── /profile (User Profile)
```

### **Data Flow:**
1. **Subject Selection** → Provides context for AI processing
2. **Document Upload** → Per-subject RAG knowledge base
3. **Live Recording** → Subject-aware transcription and note generation
4. **Note Storage** → Organized by subject for easy retrieval

### **Key Components:**
- **Subject-based Navigation**: Sidebar shows user's enrolled subjects
- **Context Preservation**: Subject ID flows through all related pages
- **Smart Defaults**: Lecture titles auto-suggest based on subject
- **Progress Tracking**: Visual progress bars and completion metrics

---

## 🚀 **Ready for Backend Integration**

### **API Endpoints Needed:**
```javascript
// Subjects
GET /api/subjects                    // User's enrolled subjects
GET /api/subjects/:id               // Subject details
POST /api/subjects                  // Add new subject

// Lectures (Subject-specific)
GET /api/subjects/:id/lectures      // All lectures for subject
POST /api/subjects/:id/lectures     // Start new lecture
GET /api/lectures/:id/notes         // Get lecture notes

// Documents (Subject-specific)
POST /api/subjects/:id/documents    // Upload subject documents
GET /api/subjects/:id/documents     // List subject documents

// Webinars
GET /api/webinars                   // Browse webinars
POST /api/webinars                  // Create webinar
POST /api/webinars/:id/join         // Join webinar

// User Profile
GET /api/user/profile               // User information
PUT /api/user/profile               // Update profile
GET /api/user/stats                 // Study statistics
```

---

## 🎨 **UI/UX Highlights**

- **Color-coded subjects** for visual organization
- **Progress indicators** showing completion status
- **Star/favorite system** for important content
- **Responsive design** works on all devices
- **Intuitive navigation** with breadcrumbs and back buttons
- **Real-time updates** during live sessions
- **Modern interface** with smooth animations and transitions

---

## 📱 **Mobile-First Design**

- **Collapsible sidebar** for mobile navigation
- **Touch-friendly controls** for recording interface
- **Responsive grids** that adapt to screen size
- **Optimized webinar interface** for mobile participation

The frontend is now **production-ready** and provides a logical, user-friendly workflow that makes sense for educational use cases!
