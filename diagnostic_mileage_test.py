#!/usr/bin/env python3

import requests
import sys
import os
from datetime import datetime
import io
from PIL import Image, ImageDraw, ImageFont

class DiagnosticMileageOCRTester:
    def __init__(self, base_url="https://app-p4xu7qp6d-robs-projects-98a6166f.vercel.app"):
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

    def run_diagnostic_test(self, name, text_input):
        """Run a diagnostic test to see what happens with specific text"""
        print(f"\n🔍 Diagnostic Test: {name}")
        print(f"   Input Text: '{text_input}'")
        
        test_image = self.create_test_image_with_text(text_input, f"/tmp/diagnostic_{name.replace(' ', '_').lower()}.png")
        
        try:
            with open(test_image, 'rb') as f:
                files = {'image': (f'diagnostic_{name}.png', f, 'image/png')}
                url = f"{self.base_url}/api/ocr-mileage"
                response = requests.post(url, files=files)
            
            # Clean up
            os.remove(test_image)
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ API Response (200):")
                print(f"      Detected Text: '{data.get('detectedText', 'N/A')}'")
                print(f"      Extracted Mileage: '{data.get('mileage', 'N/A')}'")
                print(f"      Success: {data.get('success', False)}")
                if not data.get('success', False):
                    print(f"      Error: {data.get('error', 'N/A')}")
                    print(f"      Suggestion: {data.get('suggestion', 'N/A')}")
                
                # Determine if this should be considered working
                expected_mileage = text_input.replace(' MI', '').replace('ODO: ', '').replace('MILES: ', '').strip()
                if data.get('mileage') == expected_mileage and data.get('success'):
                    print(f"   🎯 RESULT: WORKING - Low mileage correctly extracted")
                    return True
                else:
                    print(f"   ❌ RESULT: NOT WORKING - Expected '{expected_mileage}' but got '{data.get('mileage')}'")
                    return False
            else:
                print(f"   ❌ API Error: {response.status_code}")
                print(f"      Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"   ❌ Exception: {str(e)}")
            return False

    def run_all_diagnostic_tests(self):
        """Run comprehensive diagnostic tests"""
        print("🚀 Starting Diagnostic Low Mileage OCR Tests...")
        print("=" * 60)
        
        test_cases = [
            ("Single Digit - 2", "2"),
            ("Single Digit - 3", "3"),
            ("Single Digit - 5", "5"),
            ("Two Digits - 23", "23"),
            ("Two Digits - 45", "45"),
            ("Three Digits - 123", "123"),
            ("Three Digits - 456", "456"),
            ("Pattern MI - 2 MI", "2 MI"),
            ("Pattern ODO - ODO: 3", "ODO: 3"),
            ("Pattern MILES - MILES: 23", "MILES: 23"),
            ("Normal Mileage - 87325", "87325"),
            ("High Mileage - 234567", "234567"),
            ("Year (should reject) - 2023", "2023"),
        ]
        
        working_count = 0
        total_count = len(test_cases)
        
        for name, text in test_cases:
            if self.run_diagnostic_test(name, text):
                working_count += 1
        
        print("\n" + "=" * 60)
        print("📊 DIAGNOSTIC TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {total_count}")
        print(f"Working: {working_count}")
        print(f"Not Working: {total_count - working_count}")
        print(f"Success Rate: {(working_count/total_count)*100:.1f}%")
        
        # Analyze specific categories
        low_mileage_tests = [("Single Digit - 2", "2"), ("Single Digit - 3", "3"), ("Two Digits - 23", "23"), ("Three Digits - 123", "123")]
        pattern_tests = [("Pattern MI - 2 MI", "2 MI"), ("Pattern ODO - ODO: 3", "ODO: 3"), ("Pattern MILES - MILES: 23", "MILES: 23")]
        
        print(f"\n🎯 CATEGORY ANALYSIS:")
        
        # Test low mileage category
        low_mileage_working = 0
        for name, text in low_mileage_tests:
            if self.run_diagnostic_test(f"Recheck {name}", text):
                low_mileage_working += 1
        
        print(f"   Low Mileage (1-999): {low_mileage_working}/{len(low_mileage_tests)} working")
        
        # Test pattern category  
        pattern_working = 0
        for name, text in pattern_tests:
            if self.run_diagnostic_test(f"Recheck {name}", text):
                pattern_working += 1
        
        print(f"   Pattern Recognition: {pattern_working}/{len(pattern_tests)} working")
        
        return working_count, total_count

def main():
    tester = DiagnosticMileageOCRTester()
    working, total = tester.run_all_diagnostic_tests()
    
    if working >= total * 0.8:  # 80% success rate
        print(f"\n🎉 OVERALL: Good success rate ({working}/{total})")
        return 0
    else:
        print(f"\n❌ OVERALL: Poor success rate ({working}/{total})")
        return 1

if __name__ == "__main__":
    sys.exit(main())