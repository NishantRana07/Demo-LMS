'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  FileArchive, 
  CheckCircle, 
  AlertCircle, 
  X,
  Package,
  Settings,
  Play,
  Eye
} from 'lucide-react'
import { scormManager, type SCORMPackage } from '@/lib/scorm'

interface SCORMUploadProps {
  onPackageUploaded?: (packageData: SCORMPackage) => void
  courseId?: string
}

export function SCORMUpload({ onPackageUploaded, courseId }: SCORMUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [packages, setPackages] = useState<SCORMPackage[]>([])
  const [selectedPackage, setSelectedPackage] = useState<SCORMPackage | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    version: '1.2'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadPackages = useCallback(() => {
    const allPackages = scormManager.getPackages()
    setPackages(allPackages)
  }, [])

  useEffect(() => {
    loadPackages()
  }, [loadPackages])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.zip')) {
      setError('Please upload a ZIP file containing the SCORM package')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setError('')
    setSuccess('')

    try {
      // Read the ZIP file
      const arrayBuffer = await file.arrayBuffer()
      
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Extract and parse manifest (in a real implementation, you'd use JSZip)
      const manifestContent = await extractManifestFromZip(arrayBuffer)
      
      // Parse the SCORM manifest
      const manifest = await scormManager.parseManifest(manifestContent)
      
      // Create SCORM package
      const packageData = scormManager.savePackage({
        title: formData.title || `SCORM Package ${Date.now()}`,
        description: formData.description || 'SCORM learning package',
        version: formData.version,
        manifest,
        launchUrl: 'index.html', // Default launch file
        fileSize: file.size,
        status: 'active'
      })

      setSuccess('SCORM package uploaded successfully!')
      onPackageUploaded?.(packageData)
      loadPackages()
      
      // Reset form
      setFormData({ title: '', description: '', version: '1.2' })
      if (event.target) {
        event.target.value = ''
      }
      
    } catch (error) {
      console.error('Upload error:', error)
      setError('Failed to upload SCORM package. Please check the file format.')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const extractManifestFromZip = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    // In a real implementation, you would use JSZip to extract imsmanifest.xml
    // For now, return a sample manifest
    return `<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2" xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2" version="1.2">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="org1">
    <organization identifier="org1">
      <title>${formData.title || 'Default Course'}</title>
      <item identifier="item1" identifierref="res1">
        <title>Main Content</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="res1" type="webcontent" href="index.html" adlcp:scormtype="sco">
      <file href="index.html"/>
    </resource>
  </resources>
</manifest>`
  }

  const deletePackage = (packageId: string) => {
    if (confirm('Are you sure you want to delete this SCORM package?')) {
      scormManager.deletePackage(packageId)
      loadPackages()
      if (selectedPackage?.id === packageId) {
        setSelectedPackage(null)
      }
    }
  }

  const launchPackage = (packageData: SCORMPackage) => {
    // In a real implementation, this would open the SCORM content in a new window
    // with the SCORM API properly initialized
    window.open(`/scorm-player/${packageData.id}`, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Upload SCORM Package</h3>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Package Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter package title"
              />
            </div>
            <div>
              <Label htmlFor="version">SCORM Version</Label>
              <select
                id="version"
                value={formData.version}
                onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="1.2">SCORM 1.2</option>
                <option value="2004">SCORM 2004</option>
              </select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter package description"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="file">SCORM Package (ZIP file)</Label>
            <div className="mt-1">
              <Input
                id="file"
                type="file"
                accept=".zip"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </div>
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 animate-pulse" />
                <span className="text-sm">Uploading SCORM package...</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">{success}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Existing Packages */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileArchive className="h-5 w-5" />
            <h3 className="text-lg font-semibold">SCORM Packages</h3>
          </div>
          <Badge variant="secondary">{packages.length} packages</Badge>
        </div>

        {packages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileArchive className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No SCORM packages uploaded yet</p>
            <p className="text-sm">Upload a SCORM package to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{pkg.title}</h4>
                    <p className="text-sm text-muted-foreground">{pkg.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        SCORM {pkg.version}
                      </Badge>
                      <Badge variant={pkg.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {pkg.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {(pkg.fileSize / 1024 / 1024).toFixed(1)} MB
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => launchPackage(pkg)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deletePackage(pkg.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Package Details */}
      {selectedPackage && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Package Details</h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedPackage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Title</Label>
                <p className="font-medium">{selectedPackage.title}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Version</Label>
                <p className="font-medium">SCORM {selectedPackage.version}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Launch URL</Label>
                <p className="font-medium">{selectedPackage.launchUrl}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Status</Label>
                <Badge variant={selectedPackage.status === 'active' ? 'default' : 'secondary'}>
                  {selectedPackage.status}
                </Badge>
              </div>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Description</Label>
              <p className="text-sm">{selectedPackage.description}</p>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Organizations</Label>
              <div className="space-y-2">
                {selectedPackage.manifest.organizations.map((org) => (
                  <div key={org.id} className="p-2 border rounded">
                    <p className="font-medium text-sm">{org.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {org.items.length} items
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Resources</Label>
              <div className="space-y-2">
                {selectedPackage.manifest.resources.slice(0, 5).map((resource) => (
                  <div key={resource.identifier} className="p-2 border rounded">
                    <p className="font-medium text-sm">{resource.href}</p>
                    <p className="text-xs text-muted-foreground">
                      Type: {resource.type} | Files: {resource.files.length}
                    </p>
                  </div>
                ))}
                {selectedPackage.manifest.resources.length > 5 && (
                  <p className="text-xs text-muted-foreground">
                    ... and {selectedPackage.manifest.resources.length - 5} more resources
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
