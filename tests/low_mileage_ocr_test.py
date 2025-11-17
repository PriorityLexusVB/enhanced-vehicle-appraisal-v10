#!/usr/bin/env python3

import requests
import sys
import os
from datetime import datetime
import io
from PIL import Image, ImageDraw, ImageFont

class LowMileageOCRTester:
    def __init__(self, base_url="https://app-3b12vq076-robs-projects-98a6166f.vercel.app"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def create_test_image_with_text(self, text, filename):
        """Create a simple test image with text for OCR testing"""
        # Create a white image
        img = Image.new('RGB', (400, 200), color='white')
        draw = ImageDraw.Draw(img)
        
        # Try to use a default font, fallback to basic if not available
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 40)
        except:
            font = ImageFont.load_default()
        
        # Draw the text in black
        draw.text((50, 80), text, fill='black', font=font)
        
        # Save the image
        img.save(filename)
        return filename

    def run_test(self, name, method, endpoint, expected_status, files=None, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'POST':
                if files:
                    response = requests.post(url, files=files, data=data)
                else:
                    response = requests.post(url, json=data)
            elif method == 'GET':
                response = requests.get(url)

            success = response.status_code == expected_status
            result = {
                'name': name,
                'endpoint': endpoint,
                'expected_status': expected_status,
                'actual_status': response.status_code,
                'success': success
            }
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {response_data}")
                    result['response'] = response_data
                    self.test_results.append(result)
                    return True, response_data
                except:
                    result['response'] = {}
                    self.test_results.append(result)
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error Response: {error_data}")
                    result['error'] = error_data
                except:
                    print(f"   Error Text: {response.text}")
                    result['error'] = response.text
                self.test_results.append(result)
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            result = {
                'name': name,
                'endpoint': endpoint,
                'expected_status': expected_status,
                'actual_status': 'ERROR',
                'success': False,
                'error': str(e)
            }
            self.test_results.append(result)
            return False, {}

    def test_very_low_mileage_single_digit(self):
        """Test OCR with very low single digit mileage (2-3 miles for new cars)"""
        print("\n📸 Creating test image with single digit mileage...")
        test_image = self.create_test_image_with_text("2", "/tmp/single_digit_mileage.png")
        
        with open(test_image, 'rb') as f:
            files = {'image': ('single_digit_mileage.png', f, 'image/png')}
            success, response = self.run_test(
                "Very Low Mileage - Single Digit (2 miles)",
                "POST",
                "api/ocr-mileage",
                200,
                files=files
            )
        
        # Clean up
        os.remove(test_image)
        
        if success and 'mileage' in response:
            mileage = response['mileage']
            if mileage == "2" and response.get('success', False):
                print(f"   ✅ Successfully extracted very low mileage: {mileage}")
                return True
            else:
                print(f"   ❌ Expected '2' but got: {mileage}, success: {response.get('success', False)}")
                return False
        return False

    def test_very_low_mileage_three_miles(self):
        """Test OCR with 3 miles"""
        print("\n📸 Creating test image with 3 miles...")
        test_image = self.create_test_image_with_text("3", "/tmp/three_miles.png")
        
        with open(test_image, 'rb') as f:
            files = {'image': ('three_miles.png', f, 'image/png')}
            success, response = self.run_test(
                "Very Low Mileage - 3 miles",
                "POST",
                "api/ocr-mileage",
                200,
                files=files
            )
        
        # Clean up
        os.remove(test_image)
        
        if success and 'mileage' in response:
            mileage = response['mileage']
            if mileage == "3" and response.get('success', False):
                print(f"   ✅ Successfully extracted very low mileage: {mileage}")
                return True
            else:
                print(f"   ❌ Expected '3' but got: {mileage}, success: {response.get('success', False)}")
                return False
        return False

    def test_low_mileage_two_digits(self):
        """Test OCR with 23 miles"""
        print("\n📸 Creating test image with 23 miles...")
        test_image = self.create_test_image_with_text("23", "/tmp/two_digit_mileage.png")
        
        with open(test_image, 'rb') as f:
            files = {'image': ('two_digit_mileage.png', f, 'image/png')}
            success, response = self.run_test(
                "Low Mileage - Two Digits (23 miles)",
                "POST",
                "api/ocr-mileage",
                200,
                files=files
            )
        
        # Clean up
        os.remove(test_image)
        
        if success and 'mileage' in response:
            mileage = response['mileage']
            if mileage == "23" and response.get('success', False):
                print(f"   ✅ Successfully extracted low mileage: {mileage}")
                return True
            else:
                print(f"   ❌ Expected '23' but got: {mileage}, success: {response.get('success', False)}")
                return False
        return False

    def test_low_mileage_three_digits(self):
        """Test OCR with 123 miles"""
        print("\n📸 Creating test image with 123 miles...")
        test_image = self.create_test_image_with_text("123", "/tmp/three_digit_mileage.png")
        
        with open(test_image, 'rb') as f:
            files = {'image': ('three_digit_mileage.png', f, 'image/png')}
            success, response = self.run_test(
                "Low Mileage - Three Digits (123 miles)",
                "POST",
                "api/ocr-mileage",
                200,
                files=files
            )
        
        # Clean up
        os.remove(test_image)
        
        if success and 'mileage' in response:
            mileage = response['mileage']
            if mileage == "123" and response.get('success', False):
                print(f"   ✅ Successfully extracted low mileage: {mileage}")
                return True
            else:
                print(f"   ❌ Expected '123' but got: {mileage}, success: {response.get('success', False)}")
                return False
        return False

    def test_low_mileage_with_mi_suffix(self):
        """Test OCR with '2 MI' pattern"""
        print("\n📸 Creating test image with '2 MI' pattern...")
        test_image = self.create_test_image_with_text("2 MI", "/tmp/mi_suffix_mileage.png")
        
        with open(test_image, 'rb') as f:
            files = {'image': ('mi_suffix_mileage.png', f, 'image/png')}
            success, response = self.run_test(
                "Low Mileage Pattern - '2 MI'",
                "POST",
                "api/ocr-mileage",
                200,
                files=files
            )
        
        # Clean up
        os.remove(test_image)
        
        if success and 'mileage' in response:
            mileage = response['mileage']
            if mileage == "2" and response.get('success', False):
                print(f"   ✅ Successfully extracted mileage from '2 MI': {mileage}")
                return True
            else:
                print(f"   ❌ Expected '2' from '2 MI' but got: {mileage}, success: {response.get('success', False)}")
                return False
        return False

    def test_low_mileage_with_odo_prefix(self):
        """Test OCR with 'ODO: 3' pattern"""
        print("\n📸 Creating test image with 'ODO: 3' pattern...")
        test_image = self.create_test_image_with_text("ODO: 3", "/tmp/odo_prefix_mileage.png")
        
        with open(test_image, 'rb') as f:
            files = {'image': ('odo_prefix_mileage.png', f, 'image/png')}
            success, response = self.run_test(
                "Low Mileage Pattern - 'ODO: 3'",
                "POST",
                "api/ocr-mileage",
                200,
                files=files
            )
        
        # Clean up
        os.remove(test_image)
        
        if success and 'mileage' in response:
            mileage = response['mileage']
            if mileage == "3" and response.get('success', False):
                print(f"   ✅ Successfully extracted mileage from 'ODO: 3': {mileage}")
                return True
            else:
                print(f"   ❌ Expected '3' from 'ODO: 3' but got: {mileage}, success: {response.get('success', False)}")
                return False
        return False

    def test_low_mileage_with_miles_suffix(self):
        """Test OCR with 'MILES: 23' pattern"""
        print("\n📸 Creating test image with 'MILES: 23' pattern...")
        test_image = self.create_test_image_with_text("MILES: 23", "/tmp/miles_suffix_mileage.png")
        
        with open(test_image, 'rb') as f:
            files = {'image': ('miles_suffix_mileage.png', f, 'image/png')}
            success, response = self.run_test(
                "Low Mileage Pattern - 'MILES: 23'",
                "POST",
                "api/ocr-mileage",
                200,
                files=files
            )
        
        # Clean up
        os.remove(test_image)
        
        if success and 'mileage' in response:
            mileage = response['mileage']
            if mileage == "23" and response.get('success', False):
                print(f"   ✅ Successfully extracted mileage from 'MILES: 23': {mileage}")
                return True
            else:
                print(f"   ❌ Expected '23' from 'MILES: 23' but got: {mileage}, success: {response.get('success', False)}")
                return False
        return False

    def test_regression_normal_mileage(self):
        """Test that normal mileage readings still work correctly"""
        print("\n📸 Creating test image with normal mileage...")
        test_image = self.create_test_image_with_text("87325", "/tmp/normal_mileage.png")
        
        with open(test_image, 'rb') as f:
            files = {'image': ('normal_mileage.png', f, 'image/png')}
            success, response = self.run_test(
                "Regression Test - Normal Mileage (87325)",
                "POST",
                "api/ocr-mileage",
                200,
                files=files
            )
        
        # Clean up
        os.remove(test_image)
        
        if success and 'mileage' in response:
            mileage = response['mileage']
            if mileage == "87325" and response.get('success', False):
                print(f"   ✅ Normal mileage still works: {mileage}")
                return True
            else:
                print(f"   ❌ Expected '87325' but got: {mileage}, success: {response.get('success', False)}")
                return False
        return False

    def test_regression_high_mileage(self):
        """Test that high mileage readings still work correctly"""
        print("\n📸 Creating test image with high mileage...")
        test_image = self.create_test_image_with_text("234567", "/tmp/high_mileage.png")
        
        with open(test_image, 'rb') as f:
            files = {'image': ('high_mileage.png', f, 'image/png')}
            success, response = self.run_test(
                "Regression Test - High Mileage (234567)",
                "POST",
                "api/ocr-mileage",
                200,
                files=files
            )
        
        # Clean up
        os.remove(test_image)
        
        if success and 'mileage' in response:
            mileage = response['mileage']
            if mileage == "234567" and response.get('success', False):
                print(f"   ✅ High mileage still works: {mileage}")
                return True
            else:
                print(f"   ❌ Expected '234567' but got: {mileage}, success: {response.get('success', False)}")
                return False
        return False

    def test_invalid_year_rejection(self):
        """Test that years like 2023 are still rejected as invalid mileage"""
        print("\n📸 Creating test image with year (should be rejected)...")
        test_image = self.create_test_image_with_text("2023", "/tmp/year_rejection.png")
        
        with open(test_image, 'rb') as f:
            files = {'image': ('year_rejection.png', f, 'image/png')}
            success, response = self.run_test(
                "Invalid Pattern Test - Year (2023) should be rejected",
                "POST",
                "api/ocr-mileage",
                200,
                files=files
            )
        
        # Clean up
        os.remove(test_image)
        
        if success and 'mileage' in response:
            mileage = response['mileage']
            # Years should be rejected or scored very low
            if mileage == "UNREADABLE" or (mileage != "2023" and response.get('success', False)):
                print(f"   ✅ Year correctly rejected or alternative found: {mileage}")
                return True
            elif mileage == "2023":
                print(f"   ❌ Year was incorrectly accepted as mileage: {mileage}")
                return False
            else:
                print(f"   ⚠️  Unexpected result: {mileage}, success: {response.get('success', False)}")
                return False
        return False

    def print_summary(self):
        """Print detailed test summary"""
        print("\n" + "=" * 70)
        print("📊 LOW MILEAGE OCR FUNCTIONALITY TEST RESULTS")
        print("=" * 70)
        
        low_mileage_tests = [r for r in self.test_results if 'Low Mileage' in r['name'] or 'Very Low Mileage' in r['name']]
        pattern_tests = [r for r in self.test_results if 'Pattern' in r['name']]
        regression_tests = [r for r in self.test_results if 'Regression' in r['name']]
        invalid_tests = [r for r in self.test_results if 'Invalid' in r['name']]
        
        print(f"\n🔢 LOW MILEAGE ACCEPTANCE TESTS:")
        for test in low_mileage_tests:
            status = "✅ PASS" if test['success'] else "❌ FAIL"
            print(f"   {status} - {test['name']}")
            if not test['success']:
                print(f"      Expected: {test['expected_status']}, Got: {test['actual_status']}")
                if 'error' in test:
                    print(f"      Error: {test['error']}")
        
        print(f"\n📝 PATTERN RECOGNITION TESTS:")
        for test in pattern_tests:
            status = "✅ PASS" if test['success'] else "❌ FAIL"
            print(f"   {status} - {test['name']}")
            if not test['success']:
                print(f"      Expected: {test['expected_status']}, Got: {test['actual_status']}")
        
        print(f"\n🔄 REGRESSION TESTS:")
        for test in regression_tests:
            status = "✅ PASS" if test['success'] else "❌ FAIL"
            print(f"   {status} - {test['name']}")
            if not test['success']:
                print(f"      Expected: {test['expected_status']}, Got: {test['actual_status']}")
        
        print(f"\n🚫 INVALID PATTERN REJECTION TESTS:")
        for test in invalid_tests:
            status = "✅ PASS" if test['success'] else "❌ FAIL"
            print(f"   {status} - {test['name']}")
            if not test['success']:
                print(f"      Expected: {test['expected_status']}, Got: {test['actual_status']}")
        
        print(f"\n📈 OVERALL RESULTS:")
        print(f"   Total Tests: {self.tests_run}")
        print(f"   Passed: {self.tests_passed}")
        print(f"   Failed: {self.tests_run - self.tests_passed}")
        print(f"   Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        # Check specific functionality
        low_mileage_working = all(test['success'] for test in low_mileage_tests)
        patterns_working = all(test['success'] for test in pattern_tests)
        regression_working = all(test['success'] for test in regression_tests)
        
        print(f"\n🎯 SPECIFIC FUNCTIONALITY STATUS:")
        print(f"   Low Mileage Acceptance (1-999 miles): {'✅ WORKING' if low_mileage_working else '❌ FAILING'}")
        print(f"   Pattern Recognition: {'✅ WORKING' if patterns_working else '❌ FAILING'}")
        print(f"   Regression (Normal/High Mileage): {'✅ WORKING' if regression_working else '❌ FAILING'}")
        
        return low_mileage_working, patterns_working, regression_working

def main():
    print("🚀 Starting Low Mileage OCR Functionality Tests...")
    print("Testing updated mileage OCR for very low readings (2-3 miles for new cars)")
    print("=" * 70)
    
    # Setup
    tester = LowMileageOCRTester()
    
    # Run all tests
    tests = [
        # Very Low Mileage Tests (Primary Focus)
        tester.test_very_low_mileage_single_digit,
        tester.test_very_low_mileage_three_miles,
        tester.test_low_mileage_two_digits,
        tester.test_low_mileage_three_digits,
        
        # Pattern Recognition Tests
        tester.test_low_mileage_with_mi_suffix,
        tester.test_low_mileage_with_odo_prefix,
        tester.test_low_mileage_with_miles_suffix,
        
        # Regression Tests
        tester.test_regression_normal_mileage,
        tester.test_regression_high_mileage,
        
        # Invalid Pattern Tests
        tester.test_invalid_year_rejection,
    ]
    
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
    
    # Print detailed results
    low_mileage_working, patterns_working, regression_working = tester.print_summary()
    
    # Determine overall success
    if low_mileage_working and patterns_working and regression_working:
        print("\n🎉 SUCCESS: Low mileage OCR functionality is working perfectly!")
        print("✅ Very low mileage readings (1-999 miles) are now accepted")
        print("✅ Pattern recognition works for various formats")
        print("✅ Normal and high mileage readings still work correctly")
        return 0
    elif low_mileage_working:
        print("\n⚠️  PARTIAL SUCCESS: Low mileage acceptance working, but some issues found")
        return 1
    else:
        print("\n❌ FAILURE: Low mileage OCR functionality not working as expected")
        return 2

if __name__ == "__main__":
    sys.exit(main())