import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard_new'
import Subjects from './pages/Subjects'
import SubjectDetail from './pages/SubjectDetail'
import LiveLecture from './pages/LiveLecture'
import NotesViewer from './pages/NotesViewer'
import Webinar from './pages/Webinar'
import Profile from './pages/Profile'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-secondary-50">
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/subjects/:subjectId" element={<SubjectDetail />} />
            <Route path="/subjects/:subjectId/lecture" element={<LiveLecture />} />
            <Route path="/notes/:id" element={<NotesViewer />} />
            <Route path="/webinar" element={<Webinar />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Layout>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </div>
    </Router>
  )
}

export default App
