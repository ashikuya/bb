"""
Smoke Test: AzerothCore Integration Fallback to MongoDB
Tests that when AC_AUTH_HOST is not set, all endpoints work with MongoDB fallback
"""
import requests
import json
import sys

BASE_URL = "https://images-81.preview.emergentagent.com/api"
SESSION_COOKIE = "kael_sid"

class SmokeTest:
    def __init__(self):
        self.session = requests.Session()
        self.passed = 0
        self.failed = 0
        self.test_num = 0
        
    def test(self, name: str, method: str, endpoint: str, 
             expected_status: int = 200, data: dict = None) -> dict:
        """Execute a test and return response"""
        self.test_num += 1
        url = f"{BASE_URL}{endpoint}"
        print(f"\n{'='*80}")
        print(f"Test {self.test_num}: {name}")
        print(f"{method} {url}")
        if data:
            print(f"Data: {json.dumps(data)}")
        
        try:
            if method == "GET":
                resp = self.session.get(url)
            elif method == "POST":
                resp = self.session.post(url, json=data)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            print(f"Status: {resp.status_code} (expected {expected_status})")
            
            try:
                response_data = resp.json()
                print(f"Response: {json.dumps(response_data, indent=2)}")
            except:
                response_data = resp.text
                print(f"Response (text): {response_data}")
            
            if resp.status_code == expected_status:
                print(f"✅ PASS")
                self.passed += 1
                return {"passed": True, "status": resp.status_code, "data": response_data}
            else:
                print(f"❌ FAIL - Expected {expected_status}, got {resp.status_code}")
                self.failed += 1
                return {"passed": False, "status": resp.status_code, "data": response_data}
                
        except Exception as e:
            print(f"❌ ERROR: {str(e)}")
            self.failed += 1
            return {"passed": False, "error": str(e)}
    
    def summary(self):
        """Print test summary"""
        print(f"\n{'='*80}")
        print("SMOKE TEST SUMMARY")
        print(f"{'='*80}")
        print(f"Total: {self.passed + self.failed}")
        print(f"Passed: {self.passed}")
        print(f"Failed: {self.failed}")
        print(f"Success Rate: {self.passed/(self.passed+self.failed)*100:.1f}%")
        return self.failed == 0

def main():
    test = SmokeTest()
    
    print("="*80)
    print("SMOKE TEST: AC Integration DISABLED → MongoDB Fallback")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print("Testing with NEW user: smoketest2")
    
    # Test 1: Register with smoketest2
    result = test.test(
        "Register new account (smoketest2)",
        "POST", "/register",
        data={
            "username": "smoketest2",
            "email": "smoke2@test.com",
            "password": "Test1234"
        },
        expected_status=200
    )
    
    if not result["passed"]:
        print("\n⚠️  Registration failed - cannot continue with remaining tests")
        test.summary()
        return 1
    
    # Verify cookie was set
    if SESSION_COOKIE not in test.session.cookies:
        print(f"❌ FAIL - No {SESSION_COOKIE} cookie set after registration")
        test.failed += 1
    else:
        print(f"✅ Session cookie set: {SESSION_COOKIE}")
    
    # Test 2: GET /api/me
    result = test.test(
        "Get current user (/api/me)",
        "GET", "/me",
        expected_status=200
    )
    
    if result["passed"] and "account" in result["data"]:
        account = result["data"]["account"]
        print(f"✅ Account verified: {account.get('username')}")
    
    # Test 3: Change password
    result = test.test(
        "Change password",
        "POST", "/account/password",
        data={"newPassword": "NewPass1"},
        expected_status=200
    )
    
    if result["passed"] and result["data"].get("ok"):
        print(f"✅ Password change confirmed")
    
    # Test 4: Logout
    result = test.test(
        "Logout",
        "POST", "/logout",
        expected_status=200
    )
    
    # Test 5: Login with NEW password
    result = test.test(
        "Login with new password (NewPass1)",
        "POST", "/login",
        data={
            "username": "smoketest2",
            "password": "NewPass1"
        },
        expected_status=200
    )
    
    if not result["passed"]:
        print("❌ CRITICAL: Password change did not work - login with new password failed")
    else:
        print("✅ Password change verified - login successful with new password")
    
    # Test 6: GET /api/characters
    result = test.test(
        "Get characters (should return 2 demo)",
        "GET", "/characters",
        expected_status=200
    )
    
    if result["passed"] and "characters" in result["data"]:
        char_count = len(result["data"]["characters"])
        print(f"Characters returned: {char_count}")
        if char_count == 2:
            print(f"✅ Correct: 2 demo characters created")
        else:
            print(f"⚠️  Expected 2 demo characters, got {char_count}")
    
    # Test 7: GET /api/status
    result = test.test(
        "Get server status",
        "GET", "/status",
        expected_status=200
    )
    
    if result["passed"]:
        status = result["data"]
        required = ["realm", "expansion", "registeredAccounts", "createdCharacters", "playersOnline"]
        missing = [f for f in required if f not in status]
        if missing:
            print(f"⚠️  Missing fields: {missing}")
        else:
            print(f"✅ All status fields present")
    
    # Test 8: Create forum thread
    result = test.test(
        "Create forum thread",
        "POST", "/forum/categories/general/threads",
        data={
            "title": "Smoke test thread",
            "content": "Testing MongoDB fallback"
        },
        expected_status=200
    )
    
    if result["passed"] and "thread" in result["data"]:
        print(f"✅ Forum thread created")
    
    # Test 9: Password validation - too short
    print(f"\n{'='*80}")
    print("PASSWORD VALIDATION TESTS")
    print(f"{'='*80}")
    
    result = test.test(
        "Register with password too short (abc)",
        "POST", "/register",
        data={
            "username": "shortpass",
            "email": "short@test.com",
            "password": "abc"
        },
        expected_status=400
    )
    
    if result["passed"]:
        print(f"✅ Correctly rejected password < 4 chars")
    
    # Test 10: Password validation - too long
    result = test.test(
        "Register with password too long (20 chars)",
        "POST", "/register",
        data={
            "username": "longpass",
            "email": "long@test.com",
            "password": "12345678901234567890"  # 20 characters
        },
        expected_status=400
    )
    
    if result["passed"]:
        print(f"✅ Correctly rejected password > 16 chars")
    
    # Summary
    success = test.summary()
    
    if success:
        print("\n✅ ALL SMOKE TESTS PASSED - MongoDB fallback working correctly")
        return 0
    else:
        print(f"\n❌ SMOKE TESTS FAILED - {test.failed} test(s) failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
