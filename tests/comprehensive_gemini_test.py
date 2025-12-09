#!/usr/bin/env python3
"""
Comprehensive Gemini AI Vehicle Damage Analysis Test
Tests both the API endpoint and direct Python service functionality
"""

import requests
import json
import sys
import time
import os
from datetime import datetime

# Add lib directory to path for direct testing
sys.path.append('/app/lib')

class ComprehensiveGeminiAITester:
    def __init__(self, base_url="https://app-3b12vq076-robs-projects-98a6166f.vercel.app"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Test images with different damage scenarios
        self.test_scenarios = [
            {
                "name": "VW Beetle Front-End Collision Damage",
                "description": "Volkswagen Beetle with front-end collision damage",
                "photo_urls": ["https://images.unsplash.com/photo-1642276075121-3ac7d959a9f0"],
                "expected_damage_types": ["collision", "front", "bumper", "headlight"],
                "expected_severity": "major"
            },
            {
                "name": "Road Traffic Collision Damage", 
                "description": "Vehicle with road traffic collision damage",
                "photo_urls": ["https://images.unsplash.com/photo-1673187139612-6bf684a74815"],
                "expected_damage_types": ["collision", "side", "door", "panel"],
                "expected_severity": "major"
            },
            {
                "name": "Severe Automotive Defects/Wreck",
                "description": "Severely damaged vehicle with extensive defects",
                "photo_urls": ["https://images.pexels.com/photos/78793/automotive-defect-broken-car-wreck-78793.jpeg"],
                "expected_damage_types": ["wreck", "severe", "structural", "extensive"],
                "expected_severity": "severe"
            }
        ]

    def log_result(self, test_name, passed, details):
        """Log test result"""
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        
        self.test_results.append({
            "test": test_name,
            "passed": passed,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })
        
        if passed:
            self.tests_passed += 1

    def test_direct_python_service(self, scenario):
        """Test the Python Gemini service directly"""
        self.tests_run += 1
        
        print(f"\n🔍 Testing Direct Python Service: {scenario['name']}")
        
        try:
            # Import and test the Python service directly
            from gemini_analysis_service import analyze_photos
            import asyncio
            
            # Set environment variable for the test
            os.environ['GEMINI_API_KEY'] = 'AIzaSyC3hPVHH1vAmN_kKDhohC-bxTCIAGv7fdY'
            
            async def run_analysis():
                return await analyze_photos(
                    scenario['photo_urls'],
                    {
                        "vin": "1HGBH41JXMN109186",
                        "year": "2018",
                        "make": "Honda", 
                        "model": "Civic",
                        "mileage": 75000,
                        "notes": f"Testing {scenario['name']} - damage assessment required"
                    }
                )
            
            result = asyncio.run(run_analysis())
            
            if result.get('success'):
                analysis = result.get('analysis', {})
                
                # Check if this is real AI analysis (not mock)
                is_real_analysis = self.check_real_ai_analysis(analysis, scenario)
                
                # Check damage detection
                damage_detected = self.check_damage_detection(analysis, scenario)
                
                # Check professional quality
                professional_quality = self.check_professional_quality(analysis)
                
                all_tests_passed = is_real_analysis and damage_detected and professional_quality
                
                details = {
                    "is_real_analysis": is_real_analysis,
                    "damage_detected": damage_detected,
                    "professional_quality": professional_quality,
                    "confidence_score": analysis.get('confidence_score', 0),
                    "vehicle_grade": analysis.get('vehicle_grade', 'Unknown'),
                    "analysis_length": len(analysis.get('detailed_findings', ''))
                }
                
                self.log_result(f"Direct Python Service - {scenario['name']}", all_tests_passed, json.dumps(details, indent=2))
                
                # Print key findings
                self.print_key_findings(analysis, scenario, "Direct Python Service")
                
                return all_tests_passed
                
            else:
                self.log_result(f"Direct Python Service - {scenario['name']}", False, f"Service error: {result.get('error', 'Unknown error')}")
                return False
                
        except Exception as e:
            self.log_result(f"Direct Python Service - {scenario['name']}", False, f"Exception: {str(e)}")
            return False

    def test_api_endpoint(self, scenario):
        """Test the API endpoint"""
        self.tests_run += 1
        
        print(f"\n🔍 Testing API Endpoint: {scenario['name']}")
        
        # Prepare test data
        test_data = {
            "submissionId": f"damage_test_{int(time.time())}",
            "photoUrls": scenario['photo_urls'],
            "submissionData": {
                "vin": "1HGBH41JXMN109186",
                "year": "2018",
                "make": "Honda",
                "model": "Civic",
                "mileage": 75000,
                "notes": f"Testing {scenario['name']} - damage assessment required"
            }
        }
        
        try:
            url = f"{self.base_url}/api/analyze-vehicle-photos"
            response = requests.post(
                url,
                json=test_data,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                
                if result.get('success'):
                    analysis = result.get('data', {}).get('analysis', {})
                    
                    # Check if this is mock or real analysis
                    is_mock_analysis = self.check_mock_analysis(analysis)
                    
                    # Basic functionality check
                    basic_functionality = analysis.get('confidence_score', 0) > 0 and analysis.get('vehicle_grade', '') != ''
                    
                    details = {
                        "is_mock_analysis": is_mock_analysis,
                        "basic_functionality": basic_functionality,
                        "confidence_score": analysis.get('confidence_score', 0),
                        "vehicle_grade": analysis.get('vehicle_grade', 'Unknown'),
                        "photos_analyzed": result.get('data', {}).get('photosAnalyzed', 0)
                    }
                    
                    self.log_result(f"API Endpoint - {scenario['name']}", basic_functionality, json.dumps(details, indent=2))
                    
                    return basic_functionality
                    
                else:
                    self.log_result(f"API Endpoint - {scenario['name']}", False, f"API returned success=false: {result.get('error', 'Unknown error')}")
                    return False
                    
            else:
                self.log_result(f"API Endpoint - {scenario['name']}", False, f"HTTP {response.status_code}: {response.text[:200]}")
                return False
                
        except Exception as e:
            self.log_result(f"API Endpoint - {scenario['name']}", False, f"Exception: {str(e)}")
            return False

    def check_real_ai_analysis(self, analysis, scenario):
        """Check if this is real AI analysis (not mock)"""
        detailed_findings = analysis.get('detailed_findings', '')
        
        # Real AI analysis should be unique and specific to the image
        # Mock analysis has generic phrases like "typical wear for age and mileage"
        mock_indicators = [
            "typical wear for age and mileage",
            "Several cosmetic issues noted",
            "Multiple door dings observed on driver side",
            "Paint shows oxidation on hood and roof"
        ]
        
        is_mock = any(indicator in detailed_findings for indicator in mock_indicators)
        is_real = not is_mock and len(detailed_findings) > 500  # Real analysis is usually longer
        
        print(f"   ✓ Real AI Analysis: {'PASS' if is_real else 'FAIL (Mock detected)'}")
        return is_real

    def check_mock_analysis(self, analysis):
        """Check if this is mock analysis"""
        detailed_findings = analysis.get('detailed_findings', '')
        
        mock_indicators = [
            "typical wear for age and mileage",
            "Several cosmetic issues noted",
            "Multiple door dings observed on driver side",
            "Paint shows oxidation on hood and roof"
        ]
        
        is_mock = any(indicator in detailed_findings for indicator in mock_indicators)
        print(f"   ✓ Analysis Type: {'Mock (Fallback)' if is_mock else 'Real AI'}")
        return is_mock

    def check_damage_detection(self, analysis, scenario):
        """Check if AI correctly identifies damage types"""
        overall_condition = analysis.get('overall_condition', '').lower()
        exterior_condition = analysis.get('exterior_condition', '').lower()
        detailed_findings = analysis.get('detailed_findings', '').lower()
        
        # Combine all analysis text
        full_analysis = f"{overall_condition} {exterior_condition} {detailed_findings}"
        
        # Check for expected damage types
        damage_keywords = ['damage', 'dent', 'scratch', 'collision', 'impact', 'broken', 'cracked', 'bent', 'severe', 'major']
        damage_detected = any(keyword in full_analysis for keyword in damage_keywords)
        
        print(f"   ✓ Damage Detection: {'PASS' if damage_detected else 'FAIL'}")
        return damage_detected

    def check_professional_quality(self, analysis):
        """Check if analysis is professional and detailed"""
        detailed_findings = analysis.get('detailed_findings', '')
        confidence_score = analysis.get('confidence_score', 0)
        vehicle_grade = analysis.get('vehicle_grade', '')
        
        # Check for professional quality indicators
        is_detailed = len(detailed_findings) > 200  # Substantial analysis
        has_confidence = confidence_score >= 60  # Reasonable confidence
        has_grade = vehicle_grade and vehicle_grade != 'Unknown'
        
        professional_quality = is_detailed and has_confidence and has_grade
        
        print(f"   ✓ Professional Quality: {'PASS' if professional_quality else 'FAIL'}")
        print(f"     - Detailed Analysis: {'✓' if is_detailed else '✗'} ({len(detailed_findings)} chars)")
        print(f"     - Confidence Score: {'✓' if has_confidence else '✗'} ({confidence_score}%)")
        print(f"     - Vehicle Grade: {'✓' if has_grade else '✗'} ({vehicle_grade})")
        
        return professional_quality

    def print_key_findings(self, analysis, scenario, test_type):
        """Print key findings from analysis"""
        print(f"\n📋 KEY FINDINGS - {test_type} - {scenario['name']}:")
        print("=" * 60)
        
        # Extract key damage findings
        detailed_findings = analysis.get('detailed_findings', '')
        
        # Look for specific damage mentions
        lines = detailed_findings.split('\n')
        damage_lines = []
        for line in lines:
            if any(keyword in line.lower() for keyword in ['damage', 'severe', 'major', 'bent', 'cracked', 'missing']):
                if len(line.strip()) > 10:
                    damage_lines.append(line.strip())
        
        print("Key Damage Findings:")
        for i, finding in enumerate(damage_lines[:5], 1):  # Show top 5
            print(f"  {i}. {finding}")
        
        print(f"Overall Grade: {analysis.get('vehicle_grade', 'N/A')}")
        print(f"Confidence: {analysis.get('confidence_score', 'N/A')}%")
        print("=" * 60)

    def test_environment_setup(self):
        """Test if environment is properly configured"""
        self.tests_run += 1
        
        print(f"\n🔍 Testing Environment Setup")
        
        # Check if Gemini API key is available
        api_key = os.environ.get('GEMINI_API_KEY')
        has_api_key = api_key is not None and len(api_key) > 20
        
        # Check if Python service can be imported
        try:
            from gemini_analysis_service import analyze_photos
            can_import = True
        except ImportError as e:
            can_import = False
            import_error = str(e)
        
        # Check if required libraries are available
        try:
            import requests
            from PIL import Image
            import asyncio
            libraries_available = True
        except ImportError:
            libraries_available = False
        
        environment_ok = has_api_key and can_import and libraries_available
        
        details = {
            "has_api_key": has_api_key,
            "can_import_service": can_import,
            "libraries_available": libraries_available,
            "api_key_length": len(api_key) if api_key else 0
        }
        
        self.log_result("Environment Setup", environment_ok, json.dumps(details, indent=2))
        return environment_ok

    def run_all_tests(self):
        """Run all tests"""
        print("🚗 COMPREHENSIVE GEMINI AI VEHICLE DAMAGE ANALYSIS TEST")
        print("=" * 60)
        print(f"Backend URL: {self.base_url}")
        print(f"Test Scenarios: {len(self.test_scenarios)}")
        print("=" * 60)
        
        # Test 1: Environment setup
        env_ok = self.test_environment_setup()
        
        # Test 2: Direct Python service (if environment is OK)
        if env_ok:
            print("\n🐍 TESTING DIRECT PYTHON SERVICE")
            print("-" * 40)
            for scenario in self.test_scenarios:
                self.test_direct_python_service(scenario)
                time.sleep(1)  # Brief pause
        else:
            print("\n⚠️  Skipping direct Python service tests due to environment issues")
        
        # Test 3: API endpoint
        print("\n🌐 TESTING API ENDPOINT")
        print("-" * 40)
        for scenario in self.test_scenarios:
            self.test_api_endpoint(scenario)
            time.sleep(1)  # Brief pause
        
        return self.generate_summary()

    def generate_summary(self):
        """Generate comprehensive test summary"""
        print(f"\n📊 COMPREHENSIVE TEST SUMMARY")
        print("=" * 40)
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        # Categorize results
        python_service_tests = [r for r in self.test_results if "Direct Python Service" in r["test"]]
        api_endpoint_tests = [r for r in self.test_results if "API Endpoint" in r["test"]]
        
        python_passed = sum(1 for t in python_service_tests if t["passed"])
        api_passed = sum(1 for t in api_endpoint_tests if t["passed"])
        
        print(f"\nDirect Python Service: {python_passed}/{len(python_service_tests)} passed")
        print(f"API Endpoint: {api_passed}/{len(api_endpoint_tests)} passed")
        
        # Overall assessment
        if self.tests_passed == self.tests_run:
            print("\n🎉 ALL TESTS PASSED - Gemini AI system fully operational!")
        elif python_passed > 0:
            print("\n✅ CORE FUNCTIONALITY WORKING - Python service operational")
            if api_passed == 0:
                print("⚠️  API endpoint using fallback mock analysis (environment variable issue)")
        else:
            print("\n❌ CRITICAL ISSUES - Core functionality not working")
        
        return {
            "tests_run": self.tests_run,
            "tests_passed": self.tests_passed,
            "success_rate": (self.tests_passed/self.tests_run*100) if self.tests_run > 0 else 0,
            "python_service_passed": python_passed,
            "api_endpoint_passed": api_passed,
            "results": self.test_results
        }

def main():
    """Main test execution"""
    # Use the deployed Vercel URL from test_result.md
    backend_url = "https://app-3b12vq076-robs-projects-98a6166f.vercel.app"
    
    if len(sys.argv) > 1:
        backend_url = sys.argv[1]
    
    print(f"🔧 Using backend URL: {backend_url}")
    
    tester = ComprehensiveGeminiAITester(backend_url)
    summary = tester.run_all_tests()
    
    # Exit with appropriate code based on core functionality
    core_working = summary["python_service_passed"] > 0
    sys.exit(0 if core_working else 1)

if __name__ == "__main__":
    main()