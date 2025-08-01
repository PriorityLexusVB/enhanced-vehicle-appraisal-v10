#!/usr/bin/env python3
"""
Gemini AI Vehicle Damage Analysis Test
Tests the /api/analyze-vehicle-photos endpoint with actual damaged car images
"""

import requests
import json
import sys
import time
from datetime import datetime

class GeminiAIDamageAnalysisTester:
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

    def test_gemini_ai_damage_analysis(self, scenario):
        """Test Gemini AI analysis with damaged vehicle images"""
        self.tests_run += 1
        
        print(f"\n🔍 Testing: {scenario['name']}")
        print(f"   Description: {scenario['description']}")
        print(f"   Photo URLs: {scenario['photo_urls']}")
        
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
            # Make API request
            url = f"{self.base_url}/api/analyze-vehicle-photos"
            print(f"   Making request to: {url}")
            
            response = requests.post(
                url,
                json=test_data,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            print(f"   Response Status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                
                if result.get('success'):
                    analysis = result.get('data', {}).get('analysis', {})
                    
                    # Test 1: Check if analysis contains damage assessment
                    damage_detected = self.check_damage_detection(analysis, scenario)
                    
                    # Test 2: Check severity assessment
                    severity_appropriate = self.check_severity_assessment(analysis, scenario)
                    
                    # Test 3: Check trade-in impact analysis
                    trade_impact_present = self.check_trade_in_impact(analysis)
                    
                    # Test 4: Check professional quality
                    professional_quality = self.check_professional_quality(analysis)
                    
                    # Overall assessment
                    all_tests_passed = damage_detected and severity_appropriate and trade_impact_present and professional_quality
                    
                    details = {
                        "damage_detected": damage_detected,
                        "severity_appropriate": severity_appropriate,
                        "trade_impact_present": trade_impact_present,
                        "professional_quality": professional_quality,
                        "confidence_score": analysis.get('confidence_score', 0),
                        "vehicle_grade": analysis.get('vehicle_grade', 'Unknown'),
                        "photos_analyzed": result.get('data', {}).get('photosAnalyzed', 0)
                    }
                    
                    self.log_result(scenario['name'], all_tests_passed, json.dumps(details, indent=2))
                    
                    # Print detailed analysis for review
                    self.print_analysis_details(analysis, scenario)
                    
                    return all_tests_passed
                    
                else:
                    self.log_result(scenario['name'], False, f"API returned success=false: {result.get('error', 'Unknown error')}")
                    return False
                    
            else:
                error_text = response.text[:500] if response.text else "No response body"
                self.log_result(scenario['name'], False, f"HTTP {response.status_code}: {error_text}")
                return False
                
        except requests.exceptions.Timeout:
            self.log_result(scenario['name'], False, "Request timeout (30s)")
            return False
        except requests.exceptions.RequestException as e:
            self.log_result(scenario['name'], False, f"Request error: {str(e)}")
            return False
        except Exception as e:
            self.log_result(scenario['name'], False, f"Unexpected error: {str(e)}")
            return False

    def check_damage_detection(self, analysis, scenario):
        """Check if AI correctly identifies damage types"""
        overall_condition = analysis.get('overall_condition', '').lower()
        exterior_condition = analysis.get('exterior_condition', '').lower()
        detailed_findings = analysis.get('detailed_findings', '').lower()
        
        # Combine all analysis text
        full_analysis = f"{overall_condition} {exterior_condition} {detailed_findings}"
        
        # Check for expected damage types
        damage_keywords = ['damage', 'dent', 'scratch', 'collision', 'impact', 'broken', 'cracked', 'bent']
        damage_detected = any(keyword in full_analysis for keyword in damage_keywords)
        
        print(f"   ✓ Damage Detection: {'PASS' if damage_detected else 'FAIL'}")
        return damage_detected

    def check_severity_assessment(self, analysis, scenario):
        """Check if severity assessment matches damage level"""
        severity_assessment = analysis.get('severity_assessment', {})
        primary_severity = severity_assessment.get('primary_severity', 'unknown').lower()
        
        # Check if severity is appropriate for the scenario
        expected_severity = scenario['expected_severity'].lower()
        
        # Allow some flexibility in severity assessment
        severity_mapping = {
            'minor': ['minor', 'light'],
            'moderate': ['moderate', 'medium'],
            'major': ['major', 'significant', 'moderate'],  # Allow moderate for major
            'severe': ['severe', 'critical', 'major']  # Allow major for severe
        }
        
        acceptable_severities = severity_mapping.get(expected_severity, [expected_severity])
        severity_appropriate = primary_severity in acceptable_severities
        
        print(f"   ✓ Severity Assessment: {'PASS' if severity_appropriate else 'FAIL'} (Expected: {expected_severity}, Got: {primary_severity})")
        return severity_appropriate

    def check_trade_in_impact(self, analysis):
        """Check if trade-in impact analysis is present"""
        trade_in_factors = analysis.get('trade_in_factors', [])
        has_trade_impact = len(trade_in_factors) > 0
        
        print(f"   ✓ Trade-in Impact Analysis: {'PASS' if has_trade_impact else 'FAIL'} ({len(trade_in_factors)} factors identified)")
        return has_trade_impact

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

    def print_analysis_details(self, analysis, scenario):
        """Print detailed analysis for review"""
        print(f"\n📋 DETAILED ANALYSIS RESULTS for {scenario['name']}:")
        print("=" * 60)
        
        print(f"Overall Condition: {analysis.get('overall_condition', 'N/A')}")
        print(f"Exterior Condition: {analysis.get('exterior_condition', 'N/A')}")
        print(f"Confidence Score: {analysis.get('confidence_score', 'N/A')}%")
        print(f"Vehicle Grade: {analysis.get('vehicle_grade', 'N/A')}")
        
        severity = analysis.get('severity_assessment', {})
        print(f"Primary Severity: {severity.get('primary_severity', 'N/A')}")
        print(f"Total Issues: {severity.get('total_issues', 'N/A')}")
        
        trade_factors = analysis.get('trade_in_factors', [])
        print(f"Trade-in Factors ({len(trade_factors)}):")
        for i, factor in enumerate(trade_factors[:3], 1):  # Show first 3
            print(f"  {i}. {factor}")
        
        print("=" * 60)

    def test_api_endpoint_availability(self):
        """Test if the API endpoint is available"""
        self.tests_run += 1
        
        print(f"\n🔍 Testing API Endpoint Availability")
        
        try:
            # Test with minimal valid data
            test_data = {
                "submissionId": "availability_test",
                "photoUrls": ["https://via.placeholder.com/400x300.jpg"],
                "submissionData": {}
            }
            
            url = f"{self.base_url}/api/analyze-vehicle-photos"
            response = requests.post(
                url,
                json=test_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code in [200, 400, 500]:  # Any response indicates endpoint exists
                self.log_result("API Endpoint Availability", True, f"Endpoint accessible (HTTP {response.status_code})")
                return True
            else:
                self.log_result("API Endpoint Availability", False, f"Unexpected status code: {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_result("API Endpoint Availability", False, f"Endpoint not accessible: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all damage analysis tests"""
        print("🚗 GEMINI AI VEHICLE DAMAGE ANALYSIS TEST")
        print("=" * 50)
        print(f"Backend URL: {self.base_url}")
        print(f"Test Scenarios: {len(self.test_scenarios)}")
        print("=" * 50)
        
        # Test 1: API endpoint availability
        endpoint_available = self.test_api_endpoint_availability()
        
        if not endpoint_available:
            print("\n❌ API endpoint not available. Skipping damage analysis tests.")
            return self.generate_summary()
        
        # Test 2: Run damage analysis tests for each scenario
        for scenario in self.test_scenarios:
            self.test_gemini_ai_damage_analysis(scenario)
            time.sleep(2)  # Brief pause between tests
        
        return self.generate_summary()

    def generate_summary(self):
        """Generate test summary"""
        print(f"\n📊 TEST SUMMARY")
        print("=" * 30)
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 ALL TESTS PASSED - Gemini AI damage analysis working perfectly!")
        elif self.tests_passed > 0:
            print("⚠️  PARTIAL SUCCESS - Some tests passed, review failures")
        else:
            print("❌ ALL TESTS FAILED - Critical issues with Gemini AI analysis")
        
        return {
            "tests_run": self.tests_run,
            "tests_passed": self.tests_passed,
            "success_rate": (self.tests_passed/self.tests_run*100) if self.tests_run > 0 else 0,
            "results": self.test_results
        }

def main():
    """Main test execution"""
    # Use the deployed Vercel URL from test_result.md
    backend_url = "https://app-3b12vq076-robs-projects-98a6166f.vercel.app"
    
    if len(sys.argv) > 1:
        backend_url = sys.argv[1]
    
    print(f"🔧 Using backend URL: {backend_url}")
    
    tester = GeminiAIDamageAnalysisTester(backend_url)
    summary = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if summary["tests_passed"] == summary["tests_run"] else 1)

if __name__ == "__main__":
    main()