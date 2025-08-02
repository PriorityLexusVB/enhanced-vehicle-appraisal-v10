"use client"

import { useState } from "react"

export default function EnhancedVehicleTradeInForm() {
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)

  // SIMPLE MODAL TEST
  if (showBarcodeScanner) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'red',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h1>🎉 MODAL WORKS!</h1>
          <p>Button clicked successfully!</p>
          <button 
            onClick={() => setShowBarcodeScanner(false)}
            style={{
              backgroundColor: 'blue',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Close Modal
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🔧 MINIMAL TEST VERSION</h1>
      <p>This is a minimal version to test if the component loads at all.</p>
      
      <div style={{ marginTop: '20px' }}>
        <p>Debug Status: Barcode Scanner = {showBarcodeScanner ? '✅ OPEN' : '❌ CLOSED'}</p>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <button
          onClick={() => setShowBarcodeScanner(true)}
          style={{
            backgroundColor: 'blue',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          🔘 Test Barcode Scanner
        </button>
        
        <button
          onClick={() => alert("Button works! showBarcodeScanner = " + showBarcodeScanner)}
          style={{
            backgroundColor: 'green',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🧪 Test Alert
        </button>
      </div>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <h3>VIN Entry (Basic):</h3>
        <input 
          type="text" 
          placeholder="Enter VIN" 
          style={{ width: '100%', padding: '5px', marginTop: '5px' }}
        />
      </div>
      
      <div style={{ marginTop: '20px', color: 'red' }}>
        <p><strong>If you can see this page, the component is loading correctly.</strong></p>
        <p>If the barcode scanner button shows red modal, the state management works.</p>
      </div>
    </div>
  )
}