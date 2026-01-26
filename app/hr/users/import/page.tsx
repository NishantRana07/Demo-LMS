'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { HRSidebar } from '@/components/hr-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  Upload, 
  Download, 
  ArrowLeft, 
  Save, 
  FileText,
  Users,
  CheckCircle,
  AlertCircle,
  Info,
  Trash2,
  Eye
} from 'lucide-react'
import { getCurrentUser, initializeStorage, createUser } from '@/lib/storage'
import type { User } from '@/lib/storage'

interface ImportData {
  name: string
  email: string
  phone: string
  role: string
  department: string
  position: string
  location: string
  joinDate: string
  status: string
}

export default function ImportUsers() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [csvData, setCsvData] = useState<ImportData[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importSettings, setImportSettings] = useState({
    sendWelcomeEmail: false,
    assignTraining: false,
    skipDuplicates: true,
    defaultRole: 'employee',
    defaultStatus: 'active'
  })
  const [previewMode, setPreviewMode] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    initializeStorage()
    const user = getCurrentUser()
    if (!user || user.role !== 'hr') {
      router.push('/login')
      return
    }
    setCurrentUser(user)
  }, [router])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'text/csv') {
      setSelectedFile(file)
      parseCSV(file)
    } else {
      alert('Please upload a valid CSV file')
    }
  }

  const parseCSV = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      
      const data: ImportData[] = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        if (values.length >= 3) { // At least name, email, phone
          data.push({
            name: values[0] || '',
            email: values[1] || '',
            phone: values[2] || '',
            role: values[3] || importSettings.defaultRole,
            department: values[4] || '',
            position: values[5] || '',
            location: values[6] || '',
            joinDate: values[7] || new Date().toISOString().split('T')[0],
            status: values[8] || importSettings.defaultStatus
          })
        }
      }
      setCsvData(data)
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    setLoading(true)
    let successCount = 0
    let errorCount = 0

    try {
      for (const userData of csvData) {
        try {
          const newUser: User = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: userData.name,
            email: userData.email,
            password: 'defaultPassword123', // TODO: Implement proper password handling
            role: userData.role as 'hr' | 'employee' | 'candidate',
            createdAt: new Date().toISOString(),
            joined: userData.joinDate,
            department: userData.department,
            isActive: true
          }

          createUser(newUser)
          successCount++

          if (importSettings.sendWelcomeEmail) {
            // TODO: Implement welcome email functionality
            console.log('Welcome email would be sent to:', userData.email)
          }

          if (importSettings.assignTraining) {
            // TODO: Implement training assignment functionality
            console.log('Training would be assigned to:', userData.name)
          }
        } catch (error) {
          errorCount++
          console.error('Error importing user:', userData.name, error)
        }
      }

      alert(`Import completed! Success: ${successCount}, Errors: ${errorCount}`)
      router.push('/hr/users')
    } catch (error) {
      console.error('Import failed:', error)
      alert('Import failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const template = `name,email,phone,role,department,position,location,joinDate,status
John Doe,john.doe@example.com,+1234567890,employee,Engineering,Software Engineer,New York,2024-01-15,active
Jane Smith,jane.smith@example.com,+0987654321,hr,Human Resources,HR Manager,London,2024-01-10,active`
    
    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'user_import_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const removeRow = (index: number) => {
    setCsvData(prev => prev.filter((_, i) => i !== index))
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
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" onClick={() => router.push('/hr/users')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Import Users</h1>
              <p className="text-gray-600 mt-2">Bulk import users from CSV file</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Upload Section */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload CSV File
              </h3>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-gray-600">Drop your CSV file here or click to browse</p>
                    <p className="text-sm text-gray-500">Maximum file size: 10MB</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4"
                  >
                    Select File
                  </Button>
                </div>

                {selectedFile && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-800">File selected: {selectedFile.name}</span>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={downloadTemplate} className="gap-2">
                    <Download className="h-4 w-4" />
                    Download Template
                  </Button>
                  <div className="text-sm text-gray-500">
                    Download the CSV template to see the required format
                  </div>
                </div>
              </div>
            </Card>

            {/* Import Settings */}
            {csvData.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Import Settings
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="defaultRole">Default Role</Label>
                    <Select value={importSettings.defaultRole} onValueChange={(value) => setImportSettings(prev => ({ ...prev, defaultRole: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="hr">HR</SelectItem>
                        <SelectItem value="employee">Employee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="defaultStatus">Default Status</Label>
                    <Select value={importSettings.defaultStatus} onValueChange={(value) => setImportSettings(prev => ({ ...prev, defaultStatus: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="sendWelcomeEmail"
                      checked={importSettings.sendWelcomeEmail}
                      onChange={(e) => setImportSettings(prev => ({ ...prev, sendWelcomeEmail: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="sendWelcomeEmail">Send welcome email to new users</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="assignTraining"
                      checked={importSettings.assignTraining}
                      onChange={(e) => setImportSettings(prev => ({ ...prev, assignTraining: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="assignTraining">Assign default training</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="skipDuplicates"
                      checked={importSettings.skipDuplicates}
                      onChange={(e) => setImportSettings(prev => ({ ...prev, skipDuplicates: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="skipDuplicates">Skip duplicate emails</Label>
                  </div>
                </div>
              </Card>
            )}

            {/* Data Preview */}
            {csvData.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Data Preview ({csvData.length} users)
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewMode(!previewMode)}
                  >
                    {previewMode ? 'Hide Preview' : 'Show Preview'}
                  </Button>
                </div>

                {previewMode && (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600 mb-2">
                      Review the data before importing. You can remove individual rows if needed.
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-200">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-200 px-4 py-2 text-left">Name</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Email</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Phone</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Role</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Department</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {csvData.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="border border-gray-200 px-4 py-2">{row.name}</td>
                              <td className="border border-gray-200 px-4 py-2">{row.email}</td>
                              <td className="border border-gray-200 px-4 py-2">{row.phone}</td>
                              <td className="border border-gray-200 px-4 py-2">{row.role}</td>
                              <td className="border border-gray-200 px-4 py-2">{row.department}</td>
                              <td className="border border-gray-200 px-4 py-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeRow(index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Import Actions */}
            {csvData.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={handleImport}
                    disabled={loading}
                    className="gap-2"
                  >
                    <Users className="h-4 w-4" />
                    {loading ? 'Importing...' : `Import ${csvData.length} Users`}
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/hr/users')}>
                    Cancel
                  </Button>
                </div>
                
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Before you import:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Make sure your CSV file matches the template format</li>
                        <li>Review the preview data for any errors</li>
                        <li>Ensure all required fields are filled</li>
                        <li>Check email addresses for validity</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
