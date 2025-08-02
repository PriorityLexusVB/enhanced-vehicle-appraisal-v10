"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebaseconfig"

export default function FixedTradeInForm() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const [scannerInitialized, setScannerInitialized] = useState(false)
  const [cameraPermission, setCameraPermission] = useState<string>('pending')
  const scannerRef = useRef<any>(null)
  const [formData, setFormData] = useState({
    vin: "",
    year: "",
    make: "",
    model: "",
    mileage: "",
    notes: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Get authenticated user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  // Initialize barcode scanner when modal opens
  useEffect(() => {
    if (showBarcodeScanner && !scannerInitialized) {
      initializeScanner()
    }
    
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error)
      }
    }
  }, [showBarcodeScanner])

  const initializeScanner = async () => {
    try {
      // Dynamic import to avoid SSR issues
      const Html5QrcodeModule = await import('html5-qrcode')
      const { Html5Qrcode } = Html5QrcodeModule
      
      const scanner = new Html5Qrcode("barcode-reader")
      scannerRef.current = scanner
      
      // Get camera devices
      const devices = await Html5Qrcode.getCameras()
      if (devices && devices.length) {
        setCameraPermission('granted')
        
        // Use back camera if available
        const cameraId = devices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear')
        )?.id || devices[0].id
        
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 100 }, // Barcode scanning area
          aspectRatio: 1.0,
          disableFlip: false,
        }
        
        await scanner.start(
          cameraId,
          config,
          (decodedText, decodedResult) => {
            console.log("Barcode scanned:", decodedText)
            handleBarcodeScanned(decodedText)
          },
          (errorMessage) => {
            // Ignore frequent scanning errors - this is normal
          }
        )
        
        setScannerInitialized(true)
      } else {
        setCameraPermission('denied')
      }
    } catch (error) {
      console.error("Scanner initialization error:", error)
      setCameraPermission('denied')
    }
  }

  const handleBarcodeScanned = (barcodeText: string) => {
    // Clean and validate as VIN
    const cleanVIN = barcodeText.replace(/[^A-Z0-9]/g, '').toUpperCase()
    
    if (cleanVIN.length === 17) {
      // Valid VIN found
      setFormData(prev => ({ ...prev, vin: cleanVIN }))
      setShowBarcodeScanner(false)
      
      // Stop scanner
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error)
        setScannerInitialized(false)
      }
      
      alert(`VIN Successfully Scanned: ${cleanVIN}`)
    } else if (barcodeText.length >= 8) {
      // Might be a partial VIN or other vehicle identifier
      console.log("Potential VIN fragment:", barcodeText)
    }
  }

  const closeBarcodeScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(console.error)
      setScannerInitialized(false)
    }
    setShowBarcodeScanner(false)
    setCameraPermission('pending')
  }

  // Real barcode scanner modal
  if (showBarcodeScanner) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '15px',
          textAlign: 'center',
          maxWidth: '400px',
          margin: '20px',
          width: '90%'
        }}>
          <h2 style={{ marginBottom: '20px' }}>📱 VIN Barcode Scanner</h2>
          
          {cameraPermission === 'pending' && (
            <div style={{ padding: '40px' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>⏳</div>
              <p>Initializing camera...</p>
            </div>
          )}
          
          {cameraPermission === 'granted' && (
            <div>
              <div 
                id="barcode-reader" 
                style={{ 
                  width: '100%', 
                  marginBottom: '20px',
                  border: '2px solid #007bff',
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}
              />
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
                📄 Position VIN barcode in the blue scanning area
              </p>
            </div>
          )}
          
          {cameraPermission === 'denied' && (
            <div style={{ padding: '20px' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>📷❌</div>
              <p style={{ color: 'red', marginBottom: '10px' }}>
                Camera access denied or unavailable
              </p>
              <p style={{ fontSize: '14px', color: '#666' }}>
                Please allow camera access and try again, or use manual VIN entry.
              </p>
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={closeBarcodeScanner}
              style={{
                flex: 1,
                backgroundColor: '#666',
                color: 'white',
                padding: '12px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Close Scanner
            </button>
            <button
              onClick={() => {
                closeBarcodeScanner()
                alert("Use the manual VIN entry field below")
              }}
              style={{
                flex: 1,
                backgroundColor: '#007bff',
                color: 'white',
                padding: '12px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Manual Entry
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Success page
  if (submitSuccess) {
    return (
      <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
        <h1>Success! 🎉</h1>
        <p>Vehicle submission complete!</p>
        <div style={{ marginTop: '30px' }}>
          <p><strong>VIN:</strong> {formData.vin}</p>
          <p><strong>Vehicle:</strong> {formData.year} {formData.make} {formData.model}</p>
          <p><strong>Mileage:</strong> {formData.mileage}</p>
        </div>
        <button
          onClick={() => setSubmitSuccess(false)}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '15px 30px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '30px'
          }}
        >
          Submit Another Vehicle
        </button>
      </div>
    )
  }

  // Main form
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '15px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        overflow: 'hidden'
      }}>
        
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #007bff 0%, #6610f2 100%)',
          color: 'white',
          padding: '30px',
          textAlign: 'center'
        }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>
            ✨ Vehicle Trade-In System
          </h1>
          <p style={{ margin: 0, opacity: 0.9 }}>Enhanced VIN Scanner • Smart OCR • Photo Capture</p>
        </div>

        {/* Form Content */}
        <div style={{ padding: '40px' }}>
          
          {/* VIN Section */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '15px' }}>🔍 Vehicle Identification</h3>
            <div style={{ marginBottom: '15px' }}>
              <input
                type="text"
                placeholder="Enter 17-digit VIN"
                value={formData.vin}
                onChange={(e) => setFormData(prev => ({ ...prev, vin: e.target.value.toUpperCase() }))}
                maxLength={17}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontFamily: 'monospace',
                  textAlign: 'center'
                }}
              />
            </div>
            <button
              onClick={() => setShowBarcodeScanner(true)}
              style={{
                width: '100%',
                backgroundColor: '#28a745',
                color: 'white',
                padding: '15px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              📱 Scan VIN Barcode
            </button>
          </div>

          {/* Vehicle Info */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '15px' }}>🚗 Vehicle Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <input
                type="text"
                placeholder="Year"
                value={formData.year}
                onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                style={{ padding: '12px', border: '2px solid #ddd', borderRadius: '8px' }}
              />
              <input
                type="text"
                placeholder="Make"
                value={formData.make}
                onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
                style={{ padding: '12px', border: '2px solid #ddd', borderRadius: '8px' }}
              />
              <input
                type="text"
                placeholder="Model"
                value={formData.model}
                onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                style={{ padding: '12px', border: '2px solid #ddd', borderRadius: '8px' }}
              />
            </div>
            <input
              type="number"
              placeholder="Current Mileage"
              value={formData.mileage}
              onChange={(e) => setFormData(prev => ({ ...prev, mileage: e.target.value }))}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                marginBottom: '15px'
              }}
            />
            <textarea
              placeholder="Additional notes about the vehicle..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={() => {
              if (!formData.vin.trim()) {
                alert("Please enter a VIN number")
                return
              }
              setIsSubmitting(true)
              // Simulate submission
              setTimeout(() => {
                setIsSubmitting(false)
                setSubmitSuccess(true)
              }, 2000)
            }}
            disabled={isSubmitting}
            style={{
              width: '100%',
              backgroundColor: isSubmitting ? '#6c757d' : '#28a745',
              color: 'white',
              padding: '18px',
              border: 'none',
              borderRadius: '8px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
          >
            {isSubmitting ? '⏳ Submitting...' : '🚀 Submit Vehicle'}
          </button>

        </div>
      </div>
    </div>
  )
}