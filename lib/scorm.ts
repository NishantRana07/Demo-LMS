// SCORM Package Support for LMS

export interface SCORMPackage {
  id: string
  title: string
  description: string
  version: string
  manifest: SCORMManifest
  launchUrl: string
  uploadedAt: string
  fileSize: number
  status: 'active' | 'inactive'
}

export interface SCORMManifest {
  xmlns: string
  version: string
  organizations: SCORMOrganization[]
  resources: SCORMResource[]
}

export interface SCORMOrganization {
  id: string
  title: string
  items: SCORMItem[]
}

export interface SCORMItem {
  id: string
  identifier: string
  title: string
  parameters?: string
  isvisible?: boolean
  items?: SCORMItem[]
}

export interface SCORMResource {
  identifier: string
  type: string
  href: string
  adlcp: {
    scormtype: string
  }
  files: string[]
}

export interface SCORMTrackingData {
  userId: string
  packageId: string
  lessonStatus: 'completed' | 'incomplete' | 'not attempted' | 'failed' | 'passed'
  scoreRaw?: number
  scoreMax?: number
  scoreMin?: number
  sessionTime: string
  totalTime: string
  entry: 'ab-initio' | 'resume' | ''
  exit: 'normal' | 'suspend' | 'logout' | 'time-out' | ''
  credit: 'credit' | 'no-credit'
  location: string
  interactions: SCORMInteraction[]
  objectives: SCORMObjective[]
  timestamp: string
}

export interface SCORMInteraction {
  id: string
  type: 'true-false' | 'choice' | 'fill-in' | 'matching' | 'performance' | 'sequencing' | 'likert' | 'numeric'
  timestamp: string
  learnerResponse: string
  result: 'correct' | 'wrong' | 'unanticipated' | 'neutral'
  description?: string
  weight?: number
  latency?: string
}

export interface SCORMObjective {
  id: string
  scoreRaw?: number
  scoreMax?: number
  scoreMin?: number
  completionStatus: 'completed' | 'incomplete' | 'not attempted'
  progressMeasure?: number
  description?: string
}

export class SCORMManager {
  private static instance: SCORMManager
  private api: SCORMAPI | null = null

  static getInstance(): SCORMManager {
    if (!SCORMManager.instance) {
      SCORMManager.instance = new SCORMManager()
    }
    return SCORMManager.instance
  }

  // Parse SCORM manifest file (imsmanifest.xml)
  async parseManifest(manifestContent: string): Promise<SCORMManifest> {
    try {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(manifestContent, 'text/xml')
      
      const manifest = xmlDoc.querySelector('manifest')
      if (!manifest) {
        throw new Error('Invalid SCORM manifest: No manifest element found')
      }

      const organizations: SCORMOrganization[] = []
      const organizationNodes = xmlDoc.querySelectorAll('organization')
      
      organizationNodes.forEach(orgNode => {
        const org: SCORMOrganization = {
          id: orgNode.getAttribute('identifier') || '',
          title: orgNode.querySelector('title')?.textContent || '',
          items: []
        }

        const items = orgNode.querySelectorAll('item')
        items.forEach(itemNode => {
          org.items.push(this.parseItem(itemNode))
        })

        organizations.push(org)
      })

      const resources: SCORMResource[] = []
      const resourceNodes = xmlDoc.querySelectorAll('resource')
      
      resourceNodes.forEach(resourceNode => {
        const resource: SCORMResource = {
          identifier: resourceNode.getAttribute('identifier') || '',
          type: resourceNode.getAttribute('type') || '',
          href: resourceNode.getAttribute('href') || '',
          adlcp: {
            scormtype: resourceNode.getAttribute('adlcp:scormtype') || 'asset'
          },
          files: []
        }

        const files = resourceNode.querySelectorAll('file')
        files.forEach(fileNode => {
          resource.files.push(fileNode.getAttribute('href') || '')
        })

        resources.push(resource)
      })

      return {
        xmlns: manifest.getAttribute('xmlns') || '',
        version: manifest.getAttribute('version') || '1.2',
        organizations,
        resources
      }
    } catch (error) {
      console.error('Error parsing SCORM manifest:', error)
      throw new Error('Failed to parse SCORM manifest')
    }
  }

  private parseItem(itemNode: Element): SCORMItem {
    const item: SCORMItem = {
      id: itemNode.getAttribute('id') || '',
      identifier: itemNode.getAttribute('identifierref') || '',
      title: itemNode.querySelector('title')?.textContent || '',
      parameters: itemNode.getAttribute('parameters') || undefined,
      isvisible: itemNode.getAttribute('isvisible') === 'true',
      items: []
    }

    const childItems = itemNode.querySelectorAll(':scope > item')
    childItems.forEach(childItem => {
      item.items!.push(this.parseItem(childItem))
    })

    return item
  }

  // Initialize SCORM API for a package
  initializeAPI(packageId: string): SCORMAPI {
    this.api = new SCORMAPI(packageId)
    return this.api
  }

  // Get tracking data for a user and package
  getTrackingData(userId: string, packageId: string): SCORMTrackingData | null {
    if (typeof window === 'undefined') return null
    
    const key = `scorm_tracking_${userId}_${packageId}`
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  }

  // Save tracking data
  saveTrackingData(data: SCORMTrackingData): void {
    if (typeof window === 'undefined') return
    
    const key = `scorm_tracking_${data.userId}_${data.packageId}`
    localStorage.setItem(key, JSON.stringify(data))
  }

  // Get all SCORM packages
  getPackages(): SCORMPackage[] {
    if (typeof window === 'undefined') return []
    
    const packages = localStorage.getItem('scorm_packages')
    return packages ? JSON.parse(packages) : []
  }

  // Save SCORM package
  savePackage(packageData: Omit<SCORMPackage, 'id' | 'uploadedAt'>): SCORMPackage {
    const packages = this.getPackages()
    const newPackage: SCORMPackage = {
      ...packageData,
      id: `scorm_${Date.now()}`,
      uploadedAt: new Date().toISOString()
    }
    
    packages.push(newPackage)
    localStorage.setItem('scorm_packages', JSON.stringify(packages))
    return newPackage
  }

  // Delete SCORM package
  deletePackage(packageId: string): boolean {
    const packages = this.getPackages()
    const index = packages.findIndex(p => p.id === packageId)
    if (index === -1) return false
    
    packages.splice(index, 1)
    localStorage.setItem('scorm_packages', JSON.stringify(packages))
    return true
  }
}

// SCORM Runtime API Implementation
export class SCORMAPI {
  private packageId: string
  private userId: string | null = null
  private isInitialized = false
  private data: SCORMTrackingData

  constructor(packageId: string) {
    this.packageId = packageId
    this.data = {
      userId: '',
      packageId,
      lessonStatus: 'not attempted',
      sessionTime: '0000:00:00',
      totalTime: '0000:00:00',
      entry: 'ab-initio',
      exit: '',
      credit: 'credit',
      location: '',
      interactions: [],
      objectives: [],
      timestamp: new Date().toISOString()
    }
  }

  // Initialize SCORM communication
  initialize(userId: string): string {
    this.userId = userId
    
    // Load existing tracking data if available
    const existingData = SCORMManager.getInstance().getTrackingData(userId, this.packageId)
    if (existingData) {
      this.data = existingData
      this.data.entry = 'resume'
    } else {
      this.data.userId = userId
      this.data.entry = 'ab-initio'
    }
    
    this.isInitialized = true
    return 'true'
  }

  // Terminate SCORM communication
  terminate(value: string): string {
    if (!this.isInitialized) return 'false'
    
    this.data.exit = value || 'normal'
    this.data.timestamp = new Date().toISOString()
    
    if (this.userId) {
      SCORMManager.getInstance().saveTrackingData(this.data)
    }
    
    this.isInitialized = false
    return 'true'
  }

  // Get and set values
  getValue(parameter: string): string {
    if (!this.isInitialized) return ''
    
    switch (parameter) {
      case 'cmi.core.lesson_status':
        return this.data.lessonStatus
      case 'cmi.core.score.raw':
        return this.data.scoreRaw?.toString() || ''
      case 'cmi.core.score.max':
        return this.data.scoreMax?.toString() || ''
      case 'cmi.core.score.min':
        return this.data.scoreMin?.toString() || ''
      case 'cmi.core.session_time':
        return this.data.sessionTime
      case 'cmi.core.total_time':
        return this.data.totalTime
      case 'cmi.core.entry':
        return this.data.entry
      case 'cmi.core.exit':
        return this.data.exit
      case 'cmi.core.credit':
        return this.data.credit
      case 'cmi.core.lesson_location':
        return this.data.location
      case 'cmi.suspend_data':
        return JSON.stringify({
          interactions: this.data.interactions,
          objectives: this.data.objectives
        })
      default:
        return ''
    }
  }

  setValue(parameter: string, value: string): string {
    if (!this.isInitialized) return 'false'
    
    switch (parameter) {
      case 'cmi.core.lesson_status':
        this.data.lessonStatus = value as any
        break
      case 'cmi.core.score.raw':
        this.data.scoreRaw = parseFloat(value) || 0
        break
      case 'cmi.core.score.max':
        this.data.scoreMax = parseFloat(value) || 0
        break
      case 'cmi.core.score.min':
        this.data.scoreMin = parseFloat(value) || 0
        break
      case 'cmi.core.session_time':
        this.data.sessionTime = value
        break
      case 'cmi.core.total_time':
        this.data.totalTime = value
        break
      case 'cmi.core.exit':
        this.data.exit = value as any
        break
      case 'cmi.core.lesson_location':
        this.data.location = value
        break
      case 'cmi.suspend_data':
        try {
          const suspendData = JSON.parse(value)
          this.data.interactions = suspendData.interactions || []
          this.data.objectives = suspendData.objectives || []
        } catch (e) {
          console.error('Error parsing suspend data:', e)
        }
        break
      default:
        return 'false'
    }
    
    return 'true'
  }

  // Commit data
  commit(value: string): string {
    if (!this.isInitialized) return 'false'
    
    if (this.userId) {
      SCORMManager.getInstance().saveTrackingData(this.data)
    }
    
    return 'true'
  }

  // Get last error
  getLastError(): string {
    return '0' // No error
  }

  // Get error string
  getErrorString(errorCode: string): string {
    return 'No error'
  }

  // Get diagnostic
  getDiagnostic(errorCode: string): string {
    return 'No diagnostic information available'
  }
}

export const scormManager = SCORMManager.getInstance()
