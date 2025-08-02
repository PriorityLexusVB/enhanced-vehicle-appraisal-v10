"use client"

import { useState, useEffect, useRef } from "react"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebaseconfig"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Camera, Upload, Car, CheckCircle, Loader2, Zap, Target, FileText, Eye, QrCode } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import PhotoGuidance from "@/components/PhotoGuidance"
import { auth } from '../lib/firebaseconfig'
import { onAuthStateChanged, User } from 'firebase/auth'

export default function EnhancedVehicleTradeInForm() {
  const [user, setUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    year: "",
    make: "",
    model: "",
    vin: "",
    mileage: "",
    notes: "",
    exterior1: null as File | null,
    exterior2: null as File | null,
    interior1: null as File | null,
    interior2: null as File | null,
    odometer: null as File | null,
    vinPhoto: null as File | null,
    licensePlate: null as File | null,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [ocrProcessing, setOcrProcessing] = useState(false)
  const [ocrResult, setOcrResult] = useState("")
  const [vinOcrProcessing, setVinOcrProcessing] = useState(false)
  const [vinOcrResult, setVinOcrResult] = useState("")
  const [plateOcrProcessing, setPlateOcrProcessing] = useState(false)
  const [plateOcrResult, setPlateOcrResult] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [vehicleInfo, setVehicleInfo] = useState<any>(null)
  const [vinDecoding, setVinDecoding] = useState(false)
  const [currentPhotoType, setCurrentPhotoType] = useState<string>('')
  const [showGuidance, setShowGuidance] = useState(false)
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)

  // Barcode scanning for VIN - SIMPLIFIED VERSION
  const handleBarcodeResult = (result: string) => {
    console.log("📱 Barcode scanned:", result)
    // Clean and validate VIN
    const cleanVIN = result.replace(/[^A-Z0-9]/g, '').toUpperCase()
    if (cleanVIN.length === 17) {
      setFormData(prev => ({ ...prev, vin: cleanVIN }))
      toast({
        title: "VIN Scanned Successfully!",
        description: `VIN: ${cleanVIN}`,
      })
      setShowBarcodeScanner(false)
      // Trigger VIN decode
      if (cleanVIN.length === 17) {
        decodeVIN(cleanVIN)
      }
    } else {
      toast({
        title: "Invalid VIN",
        description: "VIN must be 17 characters long",
        variant: "destructive"
      })
    }
  }

  // Simple Barcode Scanner Component - FIXED RENDERING
  const BarcodeScanner = () => {
    // Force render debugging
    if (!showBarcodeScanner) {
      return null
    }
    
    // Create a portal to render outside of the form
    return (
      <>
        <div 
          className="fixed inset-0 z-50"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 0, 0, 0.9)', // Bright red background
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            style={{
              backgroundColor: 'white',
              border: '5px solid red',
              boxShadow: '0 0 50px rgba(255, 0, 0, 0.5)'
            }}
          >
            <div className="mb-4 text-center">
              <div className="text-4xl mb-2">🎉 SUCCESS!</div>
              <h3 className="text-xl font-bold text-green-600">MODAL IS WORKING!</h3>
              <p className="text-sm text-gray-600 mb-2">You can see this modal! Button click successful!</p>
              <div className="bg-yellow-100 p-2 rounded mt-2">
                <p className="text-xs text-yellow-800">⚠️ Actual barcode scanning in development</p>
              </div>
            </div>
            
            <div className="bg-green-100 h-32 rounded-lg flex items-center justify-center border-2 border-green-300 mb-4">
              <div className="text-center">
                <QrCode className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <p className="text-green-700 font-bold">BUTTON WORKS!</p>
                <p className="text-xs text-green-600">Modal rendering successful</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowBarcodeScanner(false)}
                className="flex-1 bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
              >
                ✅ Close Modal
              </button>
              <button
                onClick={() => {
                  setShowBarcodeScanner(false)
                  alert("Perfect! The barcode scanner button is working. Use manual VIN entry for now.")
                }}
                className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                📝 Use Manual Entry
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }
  const photoTypeMapping = {
    'exterior1': { guidance: 'front', label: 'Front View', required: true },
    'exterior2': { guidance: 'rear', label: 'Rear View', required: true },
    'interior1': { guidance: 'interior-front', label: 'Interior Front', required: true },
    'interior2': { guidance: 'dashboard', label: 'Dashboard', required: true },
    'odometer': { guidance: 'odometer', label: 'Odometer Reading', required: true },
    'vinPhoto': { guidance: 'vin', label: 'VIN Plate', required: true }
  }

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const steps = [
    { title: "VIN", icon: Target, description: "Scan VIN Plate" },
    { title: "Vehicle", icon: Car, description: "Info & Odometer" },
    { title: "Photos", icon: Camera, description: "Vehicle Photos" }
  ]

  // Get authenticated user on mount and restore form data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      // FIX: Set userEmail from authenticated user
      if (currentUser && currentUser.email) {
        setUserEmail(currentUser.email)
      }
    })
    
    // Try to restore form data from localStorage (prevent data loss)
    try {
      const savedData = localStorage.getItem('tradeInFormData')
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        console.log("🔄 Restoring form data from localStorage:", parsedData)
        setFormData(prev => ({ ...prev, ...parsedData }))
      }
    } catch (error) {
      console.log("No saved form data found")
    }
    
    return () => unsubscribe()
  }, [])

  // Calculate completion percentage - REMOVED LICENSE PLATE
  const getCompletionPercentage = () => {
    const totalFields = 6 // vinPhoto, odometer, exterior1, exterior2, interior1, interior2
    const completedFields = [
      formData.vinPhoto,
      formData.odometer,
      formData.exterior1,
      formData.exterior2,
      formData.interior1,
      formData.interior2
    ].filter(Boolean).length
    
    return Math.round((completedFields / totalFields) * 100)
  }

  // Step validation logic - simplified for VIN-only workflow
  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 0: // VIN scan step
        return formData.vin || vinOcrResult
      case 1: // Vehicle info & odometer
        return formData.vin && (formData.mileage || ocrResult)
      case 2: // Photos - At least 2 photos required (more flexible)
        const photoCount = [formData.exterior1, formData.exterior2, formData.interior1, formData.interior2, formData.vinPhoto, formData.odometer].filter(Boolean).length
        return photoCount >= 2 // Allow submission with at least 2 photos
      default:
        return true
    }
  }

  const handleInputChange = (field: string, value: string) => {
    console.log(`✏️ Input changed: ${field} = ${value}`)
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }
      // Backup to localStorage to prevent data loss
      localStorage.setItem('tradeInFormData', JSON.stringify(newData))
      return newData
    })
    if (field === "vin" && value.length === 17) {
      console.log("🔍 Triggering VIN decode for:", value)
      decodeVIN(value)
    }
  }

  const decodeVIN = async (vin: string) => {
    setVinDecoding(true)
    try {
      const response = await fetch('/api/vin-decode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vin }),
      })
      const result = await response.json()
      if (result.success && result.vehicle) {
        setVehicleInfo(result.vehicle)
        setFormData(prev => ({
          ...prev,
          year: result.vehicle.year || prev.year,
          make: result.vehicle.make || prev.make,
          model: result.vehicle.model || prev.model,
        }))
        toast({
          title: "🚗 VIN Decoded!",
          description: `${result.vehicle.year} ${result.vehicle.make} ${result.vehicle.model}`,
        })
      }
    } catch (error) {
      console.error("VIN decode error:", error)
    } finally {
      setVinDecoding(false)
    }
  }

  const processOdometorOCR = async (file: File) => {
    setOcrProcessing(true)
    setOcrResult("")
    try {
      const formDataOCR = new FormData()
      formDataOCR.append("image", file)
      const response = await fetch("/api/ocr-mileage", {
        method: "POST",
        body: formDataOCR,
      })
      const result = await response.json()
      const mileage = result.mileage || "UNREADABLE"
      setOcrResult(mileage)
      if (mileage !== "UNREADABLE") {
        setFormData(prev => ({ ...prev, mileage }))
        toast({
          title: "🎯 Mileage Detected!",
          description: `Auto-read: ${mileage} miles`,
        })
      }
    } catch (error) {
      setOcrResult("UNREADABLE")
    } finally {
      setOcrProcessing(false)
    }
  }

  const processVinOCR = async (file: File) => {
    setVinOcrProcessing(true)
    setVinOcrResult("")
    try {
      const formDataOCR = new FormData()
      formDataOCR.append("image", file)
      const response = await fetch("/api/ocr-vin", {
        method: "POST",
        body: formDataOCR,
      })
      const result = await response.json()
      const vin = result.vin || "UNREADABLE"
      setVinOcrResult(vin)
      if (vin !== "UNREADABLE") {
        setFormData(prev => ({ ...prev, vin }))
        decodeVIN(vin)
        toast({
          title: "🎯 VIN Scanned!",
          description: `Extracted: ${vin}`,
        })
      }
    } catch (error) {
      setVinOcrResult("UNREADABLE")
    } finally {
      setVinOcrProcessing(false)
    }
  }

  const processLicensePlateOCR = async (file: File) => {
    setPlateOcrProcessing(true)
    setPlateOcrResult("")
    try {
      const formDataOCR = new FormData()
      formDataOCR.append("image", file)
      const response = await fetch("/api/ocr-license-plate", {
        method: "POST",
        body: formDataOCR,
      })
      const result = await response.json()
      const plate = result.licensePlate || "UNREADABLE"
      setPlateOcrResult(plate)
      if (plate !== "UNREADABLE") {
        toast({
          title: "📋 License Plate Scanned!",
          description: `Plate: ${plate}`,
        })
      }
    } catch (error) {
      setPlateOcrResult("UNREADABLE")
    } finally {
      setPlateOcrProcessing(false)
    }
  }

  const handleFileChange = async (field: string, file: File | null) => {
    console.log(`📸 Photo captured for ${field}:`, file ? file.name : 'no file')
    
    // Prevent any form reset during photo processing
    if (file) {
      console.log(`💾 Saving ${field} to form data...`)
      setFormData(prev => ({ ...prev, [field]: file }))
      
      // Process OCR if applicable
      if (field === "odometer" && file) {
        console.log("🔍 Starting odometer OCR...")
        await processOdometorOCR(file)
      } else if (field === "vinPhoto" && file) {
        console.log("🔍 Starting VIN OCR...")
        await processVinOCR(file)
      }
      
      console.log(`✅ ${field} processing complete`)
    }
  }

  const PhotoUploadField = ({ field, label, description, processing, result, icon: Icon, useGuidance = true }: any) => {
    const photoType = photoTypeMapping[field as keyof typeof photoTypeMapping]
    
    // Only show guidance for VIN and odometer (removed license plate)
    const shouldShowGuidance = useGuidance && photoType && ['vin', 'odometer'].includes(photoType.guidance)
    
    return (
      <div className="space-y-2">
        <Label className="text-base font-medium text-center block">{label}</Label>
        {description && <p className="text-sm text-muted-foreground text-center">{description}</p>}
        
        <div className="relative">
          <Input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => handleFileChange(field, e.target.files?.[0] || null)}
            className="hidden"
            id={field}
          />
          <Label
            htmlFor={field}
            className="block cursor-pointer"
          >
            {shouldShowGuidance && !formData[field] ? (
              // Show photo guidance as DIRECTLY CLICKABLE area (single click!)
              <div className="relative">
                <PhotoGuidance photoType={photoType.guidance as any} isActive={true} />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-lg">
                  <div className="text-center text-white">
                    <Camera className="w-8 h-8 mx-auto mb-2" />
                    <span className="text-sm font-medium">Tap Photo Guide to Capture</span>
                  </div>
                </div>
              </div>
            ) : (
              // Regular photo capture area or success state
              <div className={`flex items-center justify-center w-full h-40 border-2 rounded-xl transition-all hover:border-primary/50 hover:bg-accent/50 ${
                processing ? "opacity-50 border-dashed" : ""
              } ${formData[field] ? "border-primary bg-primary/10" : "border-border border-dashed"}`}>
                <div className="text-center">
                  {processing ? (
                    <>
                      <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                      <span className="text-sm font-medium">Scanning...</span>
                    </>
                  ) : formData[field] ? (
                    <>
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <span className="text-sm font-medium text-green-600">Photo Captured</span>
                      {result && result !== "UNREADABLE" && (
                        <div className="mt-2">
                          <Badge variant="default" className="text-xs">
                            {field === "odometer" ? `${result} miles` : result}
                          </Badge>
                        </div>
                      )}
                    </>
                  ) : (
                    // Simple capture for all photos (no more double-click guidance)
                    <>
                      <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <span className="text-sm">Tap to Capture</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </Label>
        </div>
      </div>
    )
  }

  const uploadFiles = async (submissionId: string) => {
    const photoUrls: string[] = []
    const files = Object.values(formData).filter(f => f instanceof File) as File[]
    const totalFiles = files.length
    
    console.log(`📤 Upload check: Found ${totalFiles} files to upload`)
    
    // If no files to upload, return empty array immediately
    if (totalFiles === 0) {
      console.log("⚡ No photos to upload, skipping Firebase Storage entirely")
      setUploadProgress(100)
      return photoUrls // Return empty array immediately
    }
    
    console.log(`📤 Starting Firebase Storage upload for ${totalFiles} files...`)
    
    // Only try Firebase Storage if we actually have files
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fieldName = Object.keys(formData)[Object.values(formData).indexOf(file)]
        console.log(`⬆️ Uploading ${fieldName} (${i + 1}/${totalFiles})...`)
        
        const storageRef = ref(storage, `tradeins/${submissionId}/${fieldName}.jpg`)
        await uploadBytes(storageRef, file)
        const url = await getDownloadURL(storageRef)
        photoUrls.push(url)
        setUploadProgress(((i + 1) / totalFiles) * 100)
        console.log(`✅ ${fieldName} uploaded successfully`)
      }
      console.log(`🎉 All uploads complete: ${photoUrls.length}/${totalFiles} files uploaded`)
    } catch (error) {
      console.error(`💥 Firebase Storage error:`, error)
      // Continue anyway - don't let photo upload failure block submission
      setUploadProgress(100)
    }
    
    return photoUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setUploadProgress(0)
    setSubmitError("")

    // Mobile-specific timeout to prevent infinite spinning
    const timeout = setTimeout(() => {
      if (isSubmitting) {
        console.error("❌ Mobile submission timeout after 15 seconds")
        setSubmitError("Submission timeout - please try again")
        setIsSubmitting(false)
      }
    }, 15000) // 15 second timeout for mobile

    try {
      console.log("🚀 Starting submission process...")
      console.log("📱 Mobile device detected, using optimized submission...")
      const submissionId = `submission_${Date.now()}`
      
      console.log("📤 Checking for photo uploads...")
      let photoUrls: string[] = []
      
      try {
        photoUrls = await uploadFiles(submissionId)
        console.log(`📸 Photo upload result: ${photoUrls.length} photos uploaded`)
      } catch (uploadError) {
        console.error("⚠️ Photo upload failed, continuing without photos:", uploadError)
        photoUrls = [] // Continue with empty photo array
        setUploadProgress(100) // Mark upload as complete
      }
      
      console.log("💾 Saving to database...")
      const submission = {
        submittedBy: user?.email || userEmail || 'mobile-user@priority-appraisal.com',
        vin: formData.vin,
        year: formData.year,
        make: formData.make,
        model: formData.model,
        mileage: parseInt(formData.mileage) || 0,
        notes: formData.notes,
        photoUrls,
        createdAt: new Date(), // Use regular Date instead of serverTimestamp() for mobile compatibility
        submissionId,
        vehicleInfo,
        ocrResults: {
          mileage: ocrResult,
          vin: vinOcrResult
        }
      }

      await addDoc(collection(db, "appraisals"), submission)
      console.log("✅ Submission successful!")
      
      // Clear timeout since we succeeded
      clearTimeout(timeout)
      
      // Clear localStorage backup after successful submission
      localStorage.removeItem('tradeInFormData')
      
      setSubmitSuccess(true)
      
    } catch (error) {
      console.error("❌ Submission error:", error)
      clearTimeout(timeout)
      
      // Mobile-friendly error messages
      if (error instanceof Error) {
        if (error.message.includes('network')) {
          setSubmitError("Network error - check your connection and try again")
        } else if (error.message.includes('permission')) {
          setSubmitError("Permission error - please refresh and try again")
        } else {
          setSubmitError(`Mobile submission failed: ${error.message}`)
        }
      } else {
        setSubmitError("Mobile submission failed - please try again")
      }
    } finally {
      setIsSubmitting(false)
      clearTimeout(timeout)
    }
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="pt-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4 text-green-800">Success! 🎉</h2>
            {vehicleInfo && (
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold">{vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}</h3>
                <p className="text-sm text-green-700">Trade-in Value: {vehicleInfo.tradeInValue}</p>
              </div>
            )}
            <p className="text-muted-foreground mb-6">Vehicle submitted for appraisal review</p>
            <Button onClick={() => setSubmitSuccess(false)} className="w-full">
              Submit Another Vehicle
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const MobileStepIndicator = () => (
    <div className="flex justify-between items-center mb-4 px-2">
      {steps.map((step, index) => (
        <div key={index} className="flex flex-col items-center relative">
          {index < steps.length - 1 && (
            <div className={`absolute top-5 left-8 w-16 h-0.5 ${
              index < currentStep ? 'bg-primary' : 'bg-muted'
            }`} />
          )}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
            index <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            {index + 1}
          </div>
          <span className={`text-xs mt-1 text-center ${index <= currentStep ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
            {step.title}
          </span>
        </div>
      ))}
    </div>
  )

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b p-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🚀 Trade-In v6.0
            </h1>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                ✨ Smart OCR
              </Badge>
              <Badge variant="outline" className="text-xs">
                {getCompletionPercentage()}% Complete
              </Badge>
            </div>
          </div>
          <MobileStepIndicator />
        </div>

        <div className="p-3 pb-24">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 0: VIN Scanner Only */}
            {currentStep === 0 && (
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Scan VIN
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {/* Single VIN Scanning Section */}
                  <div className="space-y-3">
                    <div className="relative">
                      <Input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handleFileChange("vinPhoto", e.target.files?.[0] || null)}
                        className="hidden"
                        id="vinPhoto"
                      />
                      <Label
                        htmlFor="vinPhoto"
                        className="block cursor-pointer"
                      >
                        <div className="flex items-center justify-center w-full h-40 border-2 border-blue-400 rounded-xl bg-blue-50 hover:bg-blue-100 transition-all">
                          <div className="text-center">
                            {vinOcrProcessing ? (
                              <>
                                <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
                                <span className="text-base font-medium">Scanning VIN...</span>
                              </>
                            ) : formData.vinPhoto ? (
                              <>
                                <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-3" />
                                <span className="text-base font-medium text-green-600">VIN Captured</span>
                                {vinOcrResult && (
                                  <div className="mt-2 text-sm font-mono bg-white p-2 rounded border">
                                    {vinOcrResult}
                                  </div>
                                )}
                              </>
                            ) : (
                              <>
                                <Target className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                                <span className="text-base font-medium">Tap to Scan VIN Plate</span>
                                <p className="text-sm text-gray-600 mt-1">Point camera at 17-digit VIN</p>
                              </>
                            )}
                          </div>
                        </div>
                      </Label>
                    </div>
                    
                    {/* Show VIN result if available */}
                    {vinOcrResult && vehicleInfo && (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-center">
                          <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                          <p className="font-semibold text-green-800">{vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}</p>
                          <p className="text-sm text-green-600">Trade-in: {vehicleInfo.tradeInValue}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Manual Entry Option */}
                  <div className="text-center space-y-3">
                    <h3 className="font-medium text-center text-gray-600">Manual Entry or Barcode Scan</h3>
                    <div className="space-y-3">
                      <Input
                        placeholder="Enter 17-digit VIN manually"
                        value={formData.vin}
                        onChange={(e) => handleInputChange("vin", e.target.value.toUpperCase())}
                        maxLength={17}
                        className="text-center font-mono"
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={() => {
                            setShowBarcodeScanner(true)
                            // Add visual feedback
                            setSubmitError("Barcode scanner button was clicked! State set to OPEN")
                            setTimeout(() => setSubmitError(""), 3000)
                          }}
                          variant="outline"
                          className="flex-1 flex items-center justify-center gap-2"
                        >
                          <QrCode className="w-4 h-4" />
                          Scan VIN Barcode
                        </Button>
                      </div>
                      
                      {/* Visual Debug Info - No console needed */}
                      <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-center">
                        <div>🔍 Debug Status: Barcode Scanner = {showBarcodeScanner ? '✅ OPEN' : '❌ CLOSED'}</div>
                        <div className="mt-1">Click count test: <span id="clickCounter">0</span></div>
                      </div>
                      
                      {/* Test button to verify modal system works */}
                      <div className="mt-2">
                        <Button
                          type="button"
                          onClick={() => {
                            setShowBarcodeScanner(true)
                            alert("Test button clicked! Modal should appear now.")
                          }}
                          variant="secondary"
                          size="sm"
                          className="w-full"
                        >
                          🧪 TEST: Force Open Barcode Scanner
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 1: Vehicle Info & Odometer */}
            {currentStep === 1 && (
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
                  <CardTitle className="flex items-center">
                    <Car className="w-5 h-5 mr-2" />
                    🚗 Vehicle Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-6">
                  {/* Vehicle Information Display */}
                  {vehicleInfo && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h3 className="font-semibold text-blue-800 text-center mb-3">✅ Vehicle Identified</h3>
                      <div className="space-y-2 text-center">
                        <p className="text-lg font-bold">{vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}</p>
                        <p className="text-sm"><strong>VIN:</strong> {formData.vin}</p>
                        <p className="text-green-600 font-semibold">Trade-in Value: {vehicleInfo.tradeInValue}</p>
                      </div>
                    </div>
                  )}

                  {!vehicleInfo && formData.vin && (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h3 className="font-semibold text-yellow-800 text-center mb-2">🔍 VIN Entered</h3>
                      <p className="text-center font-mono text-sm">{formData.vin}</p>
                      <p className="text-center text-xs text-yellow-600 mt-2">Processing vehicle information...</p>
                    </div>
                  )}


                  {/* Odometer Section */}
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <h3 className="font-semibold text-blue-600 text-lg">📊 Scan Odometer</h3>
                      <p className="text-sm text-muted-foreground">Point camera directly at odometer display for best results</p>
                    </div>
                    <PhotoUploadField
                      field="odometer"
                      label="📈 Odometer Reading"
                      description="Point camera at odometer display"
                      processing={ocrProcessing}
                      result={ocrResult}
                      icon={Target}
                      useGuidance={true}
                    />
                    
                    {/* Show mileage result if available */}
                    {ocrResult && (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-center">
                          <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
                          <p className="font-semibold text-green-800">Mileage: {ocrResult} miles</p>
                        </div>
                      </div>
                    )}

                    {/* Manual mileage entry if OCR fails */}
                    <div className="pt-4 border-t">
                      <Label className="text-center block mb-2">✏️ Manual Mileage Entry</Label>
                      <Input
                        type="number"
                        placeholder="Enter mileage if scan fails"
                        value={formData.mileage}
                        onChange={(e) => handleInputChange("mileage", e.target.value)}
                        className="text-center"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Vehicle Photos */}
            {currentStep === 2 && (
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                  <CardTitle className="flex items-center">
                    <Camera className="w-5 h-5 mr-2" />
                    📸 Vehicle Photos
                    {vehicleInfo && (
                      <Badge className="ml-2 bg-white text-purple-600">
                        {vehicleInfo.make} {vehicleInfo.model}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-6">
                  <div className="text-center text-muted-foreground mb-4">
                    <p className="text-sm">📷 Take clear photos of your vehicle from all angles</p>
                    <div className="mt-2 text-xs bg-purple-50 p-2 rounded">
                      💡 <strong>Photo Tips:</strong> Good lighting, clean lens, steady hands for best results
                    </div>
                  </div>

                  {/* Vehicle Photos Grid - Stacked Vertically */}
                  <div className="space-y-4">
                    <PhotoUploadField
                      field="exterior1"
                      label="🚗 Front/Side View"
                      description="Front and driver side view"
                      processing={false}
                      result=""
                      icon={Camera}
                      useGuidance={false}
                    />
                    <PhotoUploadField
                      field="exterior2"
                      label="🚗 Rear View"
                      description="Back of vehicle"
                      processing={false}
                      result=""
                      icon={Camera}
                      useGuidance={false}
                    />
                    <PhotoUploadField
                      field="interior1"
                      label="🪑 Interior Front"
                      description="Dashboard and front seats"
                      processing={false}
                      result=""
                      icon={Camera}
                      useGuidance={false}
                    />
                    <PhotoUploadField
                      field="interior2"
                      label="🪑 Interior Rear"
                      description="Back seats and cargo"
                      processing={false}
                      result=""
                      icon={Camera}
                      useGuidance={false}
                    />
                  </div>

                  {/* Notes Section */}
                  <div className="space-y-2 pt-4 border-t">
                    <Label>📝 Condition Notes</Label>
                    <Textarea
                      placeholder="Note any damage, wear, special features, or issues..."
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Summary */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-medium text-center mb-2">📋 Capture Summary</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { key: 'vinPhoto', label: 'VIN' },
                        { key: 'odometer', label: 'Odometer' },
                        { key: 'exterior1', label: 'Front/Side' },
                        { key: 'exterior2', label: 'Rear' }, 
                        { key: 'interior1', label: 'Interior F' },
                        { key: 'interior2', label: 'Interior R' }
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center">
                          {formData[key as keyof typeof formData] ? 
                            <CheckCircle className="w-3 h-3 text-green-600 mr-1" /> : 
                            <div className="w-3 h-3 border border-gray-400 rounded mr-1" />
                          }
                          <span className={formData[key as keyof typeof formData] ? 'text-green-600' : 'text-gray-500'}>
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Review & Submit */}
            {currentStep === 3 && (
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                  <CardTitle className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Review & Submit
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {vehicleInfo && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium">🚗 Vehicle Information</h3>
                      <p><strong>Vehicle:</strong> {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}</p>
                      <p><strong>VIN:</strong> {formData.vin}</p>
                      <p><strong>Mileage:</strong> {formData.mileage || ocrResult} miles</p>
                      <p><strong>Trade-in Value:</strong> <span className="text-green-600 font-semibold">{vehicleInfo.tradeInValue}</span></p>
                    </div>
                  )}
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">📸 Capture Summary</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {[
                        { key: 'vinPhoto', label: 'VIN Plate' },
                        { key: 'odometer', label: 'Odometer' },
                        { key: 'exterior1', label: 'Front/Side' },
                        { key: 'exterior2', label: 'Rear' },
                        { key: 'interior1', label: 'Dashboard' },
                        { key: 'interior2', label: 'Interior' }
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center">
                          {formData[key as keyof typeof formData] ? 
                            <CheckCircle className="w-4 h-4 text-green-600 mr-1" /> : 
                            <div className="w-4 h-4 border border-gray-400 rounded mr-1" />
                          }
                          <span className={formData[key as keyof typeof formData] ? 'text-green-600' : 'text-gray-500'}>
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes Display */}
                  {formData.notes && (
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <h4 className="font-medium text-yellow-800 mb-1">📝 Your Notes</h4>
                      <p className="text-sm text-yellow-700">{formData.notes}</p>
                    </div>
                  )}

                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <span className="text-green-700 text-sm">
                      ✨ Smart OCR System Active • Ready for submission
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {uploadProgress > 0 && uploadProgress < 100 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading Photos...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                </CardContent>
              </Card>
            )}
          </form>
        </div>

        {/* Mobile Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1"
              >
                ← Previous
              </Button>
            )}
            
            {currentStep < 3 ? (
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!canProceedToNextStep()}
                  className="flex-1 disabled:opacity-50"
                >
                  {!canProceedToNextStep() ? (
                    currentStep === 0 ? "Scan VIN First" :
                    currentStep === 1 ? "Complete Vehicle Info" :
                    "Take At Least 2 Photos"
                  ) : "Next →"}
                </Button>
                {currentStep === 2 && (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    variant="outline"
                    className="px-4"
                  >
                    Skip Photos
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {submitError && (
                  <div className="text-sm text-red-600 text-center bg-red-50 p-2 rounded">
                    {submitError}
                  </div>
                )}
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting... ({Math.round(uploadProgress)}%)
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Submit Vehicle
                    </>
                  )}
                </Button>
                {isSubmitting && (
                  <div className="text-xs text-gray-500 text-center">
                    📱 Mobile submission in progress... (max 15 sec)
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Desktop version
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Card className="max-w-4xl mx-auto shadow-xl">
        <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardTitle className="text-3xl font-bold">
            🚀 Enhanced Trade-In System v6.0
          </CardTitle>
          <p className="text-blue-100">Smart OCR • VIN Scanner • Enhanced Photo Capture</p>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Vehicle Information</h3>
                
                <div>
                  <Label className="flex items-center mb-2">
                    VIN Number {vinDecoding && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                  </Label>
                  <Input
                    placeholder="Enter 17-digit VIN"
                    value={formData.vin}
                    onChange={(e) => handleInputChange("vin", e.target.value.toUpperCase())}
                    maxLength={17}
                    className="font-mono"
                  />
                  {vehicleInfo && (
                    <div className="mt-2 p-3 bg-green-50 rounded-lg">
                      <div className="font-medium text-green-800">
                        ✅ {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
                      </div>
                      <div className="text-sm text-green-600">
                        Trade-in Value: {vehicleInfo.tradeInValue}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Year</Label>
                    <Input
                      type="number"
                      value={formData.year}
                      onChange={(e) => handleInputChange("year", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Make</Label>
                    <Input
                      value={formData.make}
                      onChange={(e) => handleInputChange("make", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Model</Label>
                    <Input
                      value={formData.model}
                      onChange={(e) => handleInputChange("model", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label>Mileage</Label>
                  <Input
                    type="number"
                    placeholder="Enter mileage or scan odometer"
                    value={formData.mileage}
                    onChange={(e) => handleInputChange("mileage", e.target.value)}
                  />
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Additional vehicle details..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    rows={4}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Smart Photo Capture</h3>
                <div className="space-y-4">
                  <PhotoUploadField
                    field="vinPhoto"
                    label="VIN Plate Scanner"
                    description="Scan VIN → Auto-decode vehicle info"
                    processing={vinOcrProcessing}
                    result={vinOcrResult}
                    icon={Target}
                  />
                  
                  <PhotoUploadField
                    field="odometer"
                    label="Odometer Scanner"
                    description="Auto-read mileage display"
                    processing={ocrProcessing}
                    result={ocrResult}
                    icon={Zap}
                  />
                </div>
              </div>
            </div>

            {uploadProgress > 0 && (
              <div>
                <Progress value={uploadProgress} />
                <p className="text-center text-sm mt-2">{Math.round(uploadProgress)}% uploaded</p>
              </div>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-lg">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting Enhanced Trade-In...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Submit Enhanced Vehicle
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Barcode Scanner Modal - MOVED OUTSIDE FORM */}
      <BarcodeScanner />
    </div>
  )
}