# Document Upload Workflow for Lectures

## 🎯 **New Functionality Overview**

The frontend now supports a proper document upload workflow where users can upload lecture-specific documents that will be processed by the backend for better AI-powered note generation.

---

## 🔄 **Complete Workflow**

### **1. Subject Detail Page**
- **Start New Lecture** button now opens a modal instead of directly navigating
- **Lecture Setup Modal** allows users to:
  - Enter lecture title
  - Upload multiple documents (PDF, PPT, DOC, TXT)
  - See upload progress with visual indicators
  - Remove unwanted documents

### **2. Document Upload Process**
- **Drag & drop interface** for easy file selection
- **Multiple file support** with file type validation
- **Real-time upload status** with loading indicators
- **File size display** and document preview
- **Error handling** for failed uploads

### **3. Live Lecture Integration**
- **Document context display** showing uploaded files
- **AI processing confirmation** that documents are ready
- **Enhanced note generation** using document context
- **Lecture title pre-filled** from setup

---

## 📋 **Technical Implementation**

### **SubjectDetail.jsx Changes:**
```javascript
// New state for lecture setup
const [showLectureSetup, setShowLectureSetup] = useState(false)
const [lectureTitle, setLectureTitle] = useState('')
const [lectureDocuments, setLectureDocuments] = useState([])
const [isUploading, setIsUploading] = useState(false)

// Document upload handler
const handleFileUpload = (files) => {
  const newDocuments = Array.from(files).map(file => ({
    id: Date.now() + Math.random(),
    name: file.name,
    size: file.size,
    type: file.type,
    file: file,
    status: 'ready'
  }))
  setLectureDocuments([...lectureDocuments, ...newDocuments])
}

// Start lecture with document context
const startLecture = async () => {
  // Upload documents to backend
  // Navigate with document context
  navigate(`/subjects/${subjectId}/lecture`, {
    state: {
      lectureTitle,
      documents: lectureDocuments,
      subjectName: subject.name
    }
  })
}
```

### **LiveLecture.jsx Changes:**
```javascript
// Receive document context from navigation
const location = useLocation()
const lectureSetup = location.state || {}
const { lectureTitle: setupTitle, documents: setupDocuments = [] } = lectureSetup

// Display uploaded documents
{setupDocuments.length > 0 && (
  <div className="bg-secondary-50 rounded-lg p-4">
    <div className="flex items-center space-x-2 mb-3">
      <CheckCircle className="w-5 h-5 text-green-500" />
      <span>Documents processed and ready for AI context</span>
    </div>
    {/* Document list */}
  </div>
)}
```

---

## 🎨 **UI/UX Features**

### **Lecture Setup Modal:**
- **Clean modal design** with proper spacing
- **File upload area** with drag & drop support
- **Document list** with status indicators
- **Progress indicators** during upload
- **Validation messages** for errors
- **Cancel/Start buttons** with proper states

### **Document Status Indicators:**
- **Ready** - Green checkmark
- **Uploading** - Spinning loader
- **Uploaded** - Green checkmark
- **Error** - Red alert icon

### **Live Lecture Display:**
- **Document context card** showing uploaded files
- **Processing confirmation** with green checkmark
- **File list** with icons and names
- **Clean integration** with existing UI

---

## 🔗 **Backend Integration Points**

### **API Endpoints Needed:**
```javascript
// Upload documents for lecture
POST /api/subjects/:subjectId/lectures/documents
{
  lectureTitle: string,
  documents: File[]
}

// Start lecture with document context
POST /api/subjects/:subjectId/lectures
{
  title: string,
  documentIds: string[],
  startTime: timestamp
}

// Get processed document context
GET /api/lectures/:lectureId/context
{
  documents: [
    {
      id: string,
      name: string,
      processedContent: string,
      vectorEmbeddings: array
    }
  ]
}
```

### **Document Processing Flow:**
1. **Upload** - Files sent to backend
2. **Processing** - Extract text, create embeddings
3. **Storage** - Store in vector database (FAISS)
4. **Context** - Use during live transcription for better notes
5. **RAG Integration** - Query documents during note generation

---

## 📱 **User Experience**

### **Improved Workflow:**
1. **Select Subject** → View subject details
2. **Start New Lecture** → Opens setup modal
3. **Enter Title** → Add lecture title
4. **Upload Documents** → Drag & drop files
5. **Start Lecture** → Documents processed, lecture begins
6. **AI Enhancement** → Notes generated with document context

### **Benefits:**
- **Better AI Notes** - Context from uploaded documents
- **Organized Workflow** - Clear step-by-step process
- **Visual Feedback** - Users see upload progress
- **Error Handling** - Clear error messages
- **Mobile Friendly** - Works on all devices

---

## 🚀 **Ready for Backend**

The frontend is now fully prepared for backend integration with:
- **Document upload handling**
- **Progress tracking**
- **Error management**
- **Context passing between pages**
- **Clean API integration points**

Users can now upload lecture-specific documents that will be processed by the backend to provide better, more contextual AI-generated notes!
