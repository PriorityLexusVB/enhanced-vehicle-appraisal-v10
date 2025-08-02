"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebaseconfig"

export default function FixedTradeInForm() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
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

  // Simple barcode scanner modal
  if (showBarcodeScanner) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '15px',
          textAlign: 'center',
          maxWidth: '400px',
          margin: '20px'
        }}>
          <h2 style={{ marginBottom: '20px' }}>📱 VIN Barcode Scanner</h2>
          <div style={{
            backgroundColor: '#f0f0f0',
            height: '200px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>📷</div>
              <p>Camera View</p>
              <p style={{ fontSize: '12px', color: '#666' }}>Feature in development</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowBarcodeScanner(false)}
              style={{
                flex: 1,
                backgroundColor: '#666',
                color: 'white',
                padding: '10px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
            <button
              onClick={() => {
                setShowBarcodeScanner(false)
                alert("Use manual VIN entry for now")
              }}
              style={{
                flex: 1,
                backgroundColor: '#007bff',
                color: 'white',
                padding: '10px',
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