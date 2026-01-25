'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { 
  X, 
  Upload, 
  FileText, 
  Video, 
  Image, 
  Archive, 
  Plus,
  Trash2,
  File
} from 'lucide-react'
import { RichTextEditorFixed } from '@/components/rich-text-editor-fixed'
import type { Course, Lesson } from '@/lib/storage'

interface CreateCourseModalProps {
  onClose: () => void
  onSubmit: (courseData: Omit<Course, 'id' | 'createdAt'>) => void
}

const SUPPORTED_FILE_TYPES = {
  'application/pdf': { type: 'document', icon: FileText, name: 'PDF' },
  'application/msword': { type: 'document', icon: FileText, name: 'Word' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { type: 'document', icon: FileText, name: 'Word' },
  'application/vnd.ms-powerpoint': { type: 'document', icon: FileText, name: 'PowerPoint' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { type: 'document', icon: FileText, name: 'PowerPoint' },
  'video/mp4': { type: 'video', icon: Video, name: 'MP4 Video' },
  'video/webm': { type: 'video', icon: Video, name: 'WebM Video' },
  'video/quicktime': { type: 'video', icon: Video, name: 'QuickTime' },
  'text/plain': { type: 'text', icon: FileText, name: 'Text' },
  'text/csv': { type: 'text', icon: FileText, name: 'CSV' },
  'application/zip': { type: 'scorm', icon: Archive, name: 'SCORM Package' },
  'application/x-zip-compressed': { type: 'scorm', icon: Archive, name: 'SCORM Package' },
  'image/jpeg': { type: 'document', icon: Image, name: 'JPEG' },
  'image/png': { type: 'document', icon: Image, name: 'PNG' },
  'image/gif': { type: 'document', icon: Image, name: 'GIF' }
}

export function CreateCourseModal({ onClose, onSubmit }: CreateCourseModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    points: 100,
    duration: 1,
    status: 'draft' as 'active' | 'draft' | 'archived'
  })

  const [lessons, setLessons] = useState<Lesson[]>([])
  const [dragActive, setDragActive] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }))
  }

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return

    Array.from(files).forEach((file) => {
      const fileType = SUPPORTED_FILE_TYPES[file.type as keyof typeof SUPPORTED_FILE_TYPES]
      
      if (!fileType) {
        alert(`Unsupported file type: ${file.type}. Supported types: PDF, Word, PowerPoint, MP4, WebM, QuickTime, Text, CSV, ZIP (SCORM), and images.`)
        return
      }

      const newLesson: Lesson = {
        id: `lesson-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        courseId: '',
        title: file.name.replace(/\.[^/.]+$/, ''),
        content: `Uploaded file: ${file.name}`,
        type: fileType.type as 'video' | 'document' | 'text',
        fileName: file.name,
        fileSize: file.size,
        fileUrl: URL.createObjectURL(file),
        duration: fileType.type === 'video' ? 30 : 15,
        completed: false,
        order: lessons.length + 1,
        points: 10
      }

      setLessons(prev => [...prev, newLesson])
    })
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  const removeLesson = (lessonId: string) => {
    setLessons(prev => prev.filter(lesson => lesson.id !== lessonId))
  }

  const updateLesson = (lessonId: string, updates: Partial<Lesson>) => {
    setLessons(prev => prev.map(lesson => 
      lesson.id === lessonId ? { ...lesson, ...updates } : lesson
    ))
  }

  const addTextLesson = () => {
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      courseId: '',
      title: 'New Text Lesson',
      content: 'Enter your lesson content here...',
      type: 'text',
      completed: false,
      order: lessons.length + 1,
      points: 10,
      duration: 15
    }
    setLessons(prev => [...prev, newLesson])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description) {
      alert('Please fill in all required fields')
      return
    }

    if (lessons.length === 0) {
      alert('Please add at least one lesson to the course')
      return
    }

    const courseData: Omit<Course, 'id' | 'createdAt'> = {
      title: formData.title,
      description: formData.description,
      createdBy: 'current-user',
      assignedTo: [],
      lessons: lessons.map((lesson, index) => ({ ...lesson, order: index + 1 })),
      points: formData.points,
      category: formData.category,
      difficulty: formData.difficulty,
      status: formData.status,
      duration: formData.duration
    }

    onSubmit(courseData)
  }

  const getFileIcon = (type: string) => {
    const fileType = Object.values(SUPPORTED_FILE_TYPES).find(ft => ft.type === type)
    if (fileType) {
      const IconComponent = fileType.icon
      return <IconComponent className="h-5 w-5" />
    }
    return <File className="h-5 w-5" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Create New Course</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Course Title *</label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter course title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category</option>
                  <option value="Onboarding">Onboarding</option>
                  <option value="Professional Skills">Professional Skills</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Technical">Technical</option>
                  <option value="Leadership">Leadership</option>
                  <option value="Safety">Safety</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <RichTextEditorFixed
                value={formData.description}
                onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                placeholder="Enter course description"
                height="150px"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Difficulty</label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Points</label>
                <Input
                  name="points"
                  type="number"
                  value={formData.points}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Duration (hours)</label>
                <Input
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Course Content</h3>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTextLesson}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Text Lesson
                  </Button>
                </div>
              </div>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drop files here or click to upload
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Supports PDF, Word, PowerPoint, MP4, WebM, QuickTime, Text, CSV, ZIP (SCORM), and images
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.webm,.mov,.txt,.csv,.zip,.jpg,.jpeg,.png,.gif"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  Choose Files
                </Button>
              </div>

              {lessons.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="font-medium">Lessons ({lessons.length})</h4>
                  {lessons.map((lesson, index) => (
                    <div key={lesson.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0">
                        {getFileIcon(lesson.type)}
                      </div>
                      <div className="flex-1">
                        <Input
                          value={lesson.title}
                          onChange={(e) => updateLesson(lesson.id, { title: e.target.value })}
                          className="mb-2"
                          placeholder="Lesson title"
                        />
                        <div className="text-sm text-gray-500 mb-2">
                          {lesson.fileName && `${lesson.fileName} • ${formatFileSize(lesson.fileSize || 0)}`}
                          {lesson.type === 'text' && 'Text lesson'}
                        </div>
                        {lesson.type === 'text' && (
                          <div className="mt-2">
                            <RichTextEditorFixed
                              value={lesson.content}
                              onChange={(value) => updateLesson(lesson.id, { content: value })}
                              placeholder="Enter lesson content..."
                              height="120px"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={lesson.duration}
                          onChange={(e) => updateLesson(lesson.id, { duration: parseInt(e.target.value) || 15 })}
                          className="w-20"
                          placeholder="Duration"
                        />
                        <span className="text-sm text-gray-500">min</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLesson(lesson.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Create Course
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
