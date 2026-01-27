'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HRSidebar } from '@/components/hr-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  FileText, 
  Plus, 
  ArrowLeft,
  Save,
  Trash2,
  DragDrop,
  Eye,
  Settings,
  HelpCircle
} from 'lucide-react'
import { getCurrentUser, getAllUsers, initializeStorage, createForm } from '@/lib/storage'
import type { User } from '@/lib/storage'

interface FormField {
  id: string
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'email' | 'number' | 'date'
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
}

interface FormData {
  title: string
  description: string
  type: 'survey' | 'feedback' | 'application' | 'assessment'
  status: 'draft' | 'published'
  fields: FormField[]
}

export default function HRFormsCreate() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    type: 'survey',
    status: 'draft',
    fields: []
  })
  const [newField, setNewField] = useState<FormField>({
    id: '',
    type: 'text',
    label: '',
    placeholder: '',
    required: false,
    options: []
  })

  useEffect(() => {
    initializeStorage()
    const user = getCurrentUser()
    if (!user || user.role !== 'hr') {
      router.push('/login')
      return
    }
    setCurrentUser(user)
  }, [router])

  const handleAddField = () => {
    if (!newField.label.trim()) return
    
    const field: FormField = {
      ...newField,
      id: Date.now().toString(),
      options: (newField.type === 'select' || newField.type === 'radio') ? newField.options || [] : undefined
    }
    
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, field]
    }))
    
    setNewField({
      id: '',
      type: 'text',
      label: '',
      placeholder: '',
      required: false,
      options: []
    })
  }

  const handleRemoveField = (fieldId: string) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }))
  }

  const handleSaveForm = (publish: boolean = false) => {
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please fill in the form title and description')
      return
    }

    if (formData.fields.length === 0) {
      alert('Please add at least one field to the form')
      return
    }

    setLoading(true)
    
    try {
      const formToCreate = {
        ...formData,
        status: publish ? 'published' : 'draft',
        createdAt: new Date().toISOString(),
        responses: []
      }
      
      createForm(formToCreate)
      router.push('/hr/forms')
    } catch (error) {
      console.error('Error creating form:', error)
      alert('Failed to create form')
    } finally {
      setLoading(false)
    }
  }

  const getFieldTypeLabel = (type: string) => {
    switch(type) {
      case 'text': return 'Short Text'
      case 'textarea': return 'Long Text'
      case 'select': return 'Dropdown'
      case 'radio': return 'Multiple Choice'
      case 'checkbox': return 'Checkbox'
      case 'email': return 'Email'
      case 'number': return 'Number'
      case 'date': return 'Date'
      default: return type
    }
  }

  const renderFormField = (field: FormField, isPreview: boolean = false) => {
    const commonProps = {
      placeholder: field.placeholder,
      required: field.required,
      disabled: isPreview
    }

    switch(field.type) {
      case 'textarea':
        return <Textarea {...commonProps} rows={3} />
      case 'select':
        return (
          <Select disabled={isPreview}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center gap-2">
                <input type="radio" name={field.id} disabled={isPreview} />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center gap-2">
                <input type="checkbox" disabled={isPreview} />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )
      default:
        return <Input type={field.type} {...commonProps} />
    }
  }

  if (!currentUser) {
    return <div className="flex h-screen bg-gray-100"><div className="animate-pulse bg-gray-200 h-full w-full"></div></div>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <HRSidebar userName={currentUser.name} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => router.push('/hr/forms')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create New Form</h1>
                <p className="text-gray-600 mt-2">Design your form with custom fields</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setPreviewMode(!previewMode)}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                {previewMode ? 'Edit' : 'Preview'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleSaveForm(false)}
                disabled={loading}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button 
                onClick={() => handleSaveForm(true)}
                disabled={loading}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                {loading ? 'Publishing...' : 'Publish Form'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Configuration */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Form Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Enter form title"
                      disabled={previewMode}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Describe what this form is for"
                      rows={3}
                      disabled={previewMode}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Form Type *</Label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(value: FormData['type']) => setFormData({...formData, type: value})}
                        disabled={previewMode}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="survey">Survey</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                          <SelectItem value="application">Application</SelectItem>
                          <SelectItem value="assessment">Assessment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(value: FormData['status']) => setFormData({...formData, status: value})}
                        disabled={previewMode}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </Card>

              {!previewMode && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Field</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fieldType">Field Type</Label>
                      <Select 
                        value={newField.type} 
                        onValueChange={(value: FormField['type']) => setNewField({...newField, type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Short Text</SelectItem>
                          <SelectItem value="textarea">Long Text</SelectItem>
                          <SelectItem value="select">Dropdown</SelectItem>
                          <SelectItem value="radio">Multiple Choice</SelectItem>
                          <SelectItem value="checkbox">Checkbox</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="fieldLabel">Field Label *</Label>
                      <Input
                        id="fieldLabel"
                        value={newField.label}
                        onChange={(e) => setNewField({...newField, label: e.target.value})}
                        placeholder="Enter field label"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="fieldPlaceholder">Placeholder (Optional)</Label>
                      <Input
                        id="fieldPlaceholder"
                        value={newField.placeholder || ''}
                        onChange={(e) => setNewField({...newField, placeholder: e.target.value})}
                        placeholder="Enter placeholder text"
                      />
                    </div>
                    
                    {(newField.type === 'select' || newField.type === 'radio' || newField.type === 'checkbox') && (
                      <div>
                        <Label>Options (one per line)</Label>
                        <Textarea
                          value={newField.options?.join('\n') || ''}
                          onChange={(e) => setNewField({...newField, options: e.target.value.split('\n').filter(opt => opt.trim())})}
                          placeholder="Option 1&#10;Option 2&#10;Option 3"
                          rows={3}
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="fieldRequired"
                        checked={newField.required}
                        onChange={(e) => setNewField({...newField, required: e.target.checked})}
                      />
                      <Label htmlFor="fieldRequired">Required field</Label>
                    </div>
                    
                    <Button onClick={handleAddField} className="w-full gap-2">
                      <Plus className="h-4 w-4" />
                      Add Field
                    </Button>
                  </div>
                </Card>
              )}
            </div>

            {/* Form Preview / Fields List */}
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {previewMode ? 'Form Preview' : 'Form Fields'}
                  </h3>
                  {!previewMode && formData.fields.length > 0 && (
                    <span className="text-sm text-gray-500">
                      {formData.fields.length} field{formData.fields.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                
                {formData.fields.length > 0 ? (
                  <div className="space-y-4">
                    {formData.fields.map((field) => (
                      <div key={field.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <Label className="text-sm font-medium">
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            {renderFormField(field, previewMode)}
                          </div>
                          {!previewMode && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveField(field.id)}
                              className="ml-2 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        {!previewMode && (
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <span>{getFieldTypeLabel(field.type)}</span>
                            {field.required && <span>• Required</span>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {previewMode ? 'No fields to preview' : 'Add fields to build your form'}
                    </p>
                  </div>
                )}
              </Card>

              {previewMode && (
                <Card className="p-6 bg-blue-50 border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <HelpCircle className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium text-blue-900">Preview Mode</h4>
                  </div>
                  <p className="text-sm text-blue-800">
                    This is how your form will appear to users. Switch back to edit mode to make changes.
                  </p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
