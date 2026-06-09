"""
Kaelthas Backend API Test Suite
Tests all backend endpoints with session management
"""
import requests
import json
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "https://images-81.preview.emergentagent.com/api"
SESSION_COOKIE = "kael_sid"

class TestSession:
    """Manages test session with cookie persistence"""
    def __init__(self):
        self.session = requests.Session()
        self.results = []
        
    def test(self, name: str, method: str, endpoint: str, 
             expected_status: int = 200, data: Optional[Dict] = None,
             check_cookie: bool = False, should_have_cookie: bool = False) -> Dict[str, Any]:
        """Execute a test request and validate response"""
        url = f"{BASE_URL}{endpoint}"
        print(f"\n{'='*80}")
        print(f"TEST: {name}")
        print(f"URL: {method} {url}")
        if data:
            print(f"DATA: {json.dumps(data, indent=2)}")
        
        try:
            if method == "GET":
                resp = self.session.get(url)
            elif method == "POST":
                resp = self.session.post(url, json=data)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            print(f"STATUS: {resp.status_code}")
            
            # Check status code
            status_ok = resp.status_code == expected_status
            if not status_ok:
                print(f"❌ Expected status {expected_status}, got {resp.status_code}")
            
            # Parse response
            try:
                response_data = resp.json()
                print(f"RESPONSE: {json.dumps(response_data, indent=2)}")
            except:
                response_data = resp.text
                print(f"RESPONSE (text): {response_data}")
            
            # Check cookie if required
            cookie_ok = True
            if check_cookie:
                has_cookie = SESSION_COOKIE in resp.cookies
                cookie_ok = has_cookie == should_have_cookie
                if should_have_cookie and not has_cookie:
                    print(f"❌ Expected Set-Cookie {SESSION_COOKIE}, but not found")
                elif not should_have_cookie and has_cookie:
                    print(f"❌ Expected no Set-Cookie {SESSION_COOKIE}, but found one")
                else:
                    print(f"✅ Cookie check passed")
            
            # Overall result
            passed = status_ok and cookie_ok
            result = {
                "name": name,
                "passed": passed,
                "status_code": resp.status_code,
                "expected_status": expected_status,
                "response": response_data,
                "cookies": dict(resp.cookies)
            }
            
            if passed:
                print(f"✅ TEST PASSED")
            else:
                print(f"❌ TEST FAILED")
            
            self.results.append(result)
            return result
            
        except Exception as e:
            print(f"❌ TEST ERROR: {str(e)}")
            result = {
                "name": name,
                "passed": False,
                "error": str(e)
            }
            self.results.append(result)
            return result
    
    def print_summary(self):
        """Print test summary"""
        print(f"\n{'='*80}")
        print("TEST SUMMARY")
        print(f"{'='*80}")
        
        passed = sum(1 for r in self.results if r.get("passed", False))
        total = len(self.results)
        
        print(f"\nTotal Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {passed/total*100:.1f}%\n")
        
        print("Detailed Results:")
        for i, result in enumerate(self.results, 1):
            status = "✅ PASS" if result.get("passed", False) else "❌ FAIL"
            print(f"{i}. {status} - {result['name']}")
            if not result.get("passed", False) and "error" in result:
                print(f"   Error: {result['error']}")
            elif not result.get("passed", False):
                print(f"   Expected: {result.get('expected_status')}, Got: {result.get('status_code')}")
        
        return passed, total

def main():
    """Run all backend tests"""
    test = TestSession()
    
    print("="*80)
    print("KAELTHAS BACKEND API TEST SUITE")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print(f"Session Cookie: {SESSION_COOKIE}")
    
    # Test 1: GET /api/status
    result = test.test(
        "1. Get server status",
        "GET", "/status",
        expected_status=200
    )
    
    # Verify status response has required fields
    if result.get("passed"):
        resp = result["response"]
        required_fields = ["realm", "expansion", "registeredAccounts", "createdCharacters", "playersOnline"]
        missing = [f for f in required_fields if f not in resp]
        if missing:
            print(f"⚠️  Missing fields in status response: {missing}")
    
    # Test 2: POST /api/register
    register_data = {
        "username": "testhero",
        "email": "testhero@example.com",
        "password": "Test1234"
    }
    result = test.test(
        "2. Register new account",
        "POST", "/register",
        data=register_data,
        expected_status=200,
        check_cookie=True,
        should_have_cookie=True
    )
    
    # Verify register response has account
    if result.get("passed"):
        resp = result["response"]
        if "account" not in resp:
            print(f"⚠️  Missing 'account' in register response")
        else:
            print(f"✅ Account created: {resp['account'].get('username')}")
    
    # Test 3: GET /api/me (with cookie from registration)
    result = test.test(
        "3. Get current user (authenticated)",
        "GET", "/me",
        expected_status=200
    )
    
    # Verify me response has account
    if result.get("passed"):
        resp = result["response"]
        if "account" not in resp:
            print(f"⚠️  Missing 'account' in /me response")
    
    # Test 4: POST /api/login
    login_data = {
        "username": "testhero",
        "password": "Test1234"
    }
    result = test.test(
        "4. Login with credentials",
        "POST", "/login",
        data=login_data,
        expected_status=200,
        check_cookie=True,
        should_have_cookie=True
    )
    
    # Test 5: GET /api/characters
    result = test.test(
        "5. Get characters (auto-creates demo)",
        "GET", "/characters",
        expected_status=200
    )
    
    # Verify characters response
    if result.get("passed"):
        resp = result["response"]
        if "characters" not in resp:
            print(f"⚠️  Missing 'characters' in response")
        else:
            char_count = len(resp["characters"])
            print(f"✅ Characters returned: {char_count}")
            if char_count != 2:
                print(f"⚠️  Expected 2 demo characters, got {char_count}")
    
    # Test 6: POST /api/account/password
    password_data = {
        "newPassword": "NewPass1"
    }
    result = test.test(
        "6. Change account password",
        "POST", "/account/password",
        data=password_data,
        expected_status=200
    )
    
    # Verify password change response
    if result.get("passed"):
        resp = result["response"]
        if not resp.get("ok"):
            print(f"⚠️  Expected {{'ok': true}} in response")
    
    # Test 7: GET /api/forum/categories
    result = test.test(
        "7. Get forum categories",
        "GET", "/forum/categories",
        expected_status=200
    )
    
    # Verify categories response
    if result.get("passed"):
        resp = result["response"]
        if "categories" not in resp:
            print(f"⚠️  Missing 'categories' in response")
        else:
            cat_count = len(resp["categories"])
            print(f"✅ Categories returned: {cat_count}")
            if cat_count != 5:
                print(f"⚠️  Expected 5 default categories, got {cat_count}")
            # Check for stats in each category
            for cat in resp["categories"]:
                if "threadCount" not in cat or "postCount" not in cat:
                    print(f"⚠️  Category '{cat.get('name')}' missing stats")
    
    # Test 8: POST /api/forum/categories/general/threads
    thread_data = {
        "title": "My first thread",
        "content": "Hello Northrend"
    }
    result = test.test(
        "8. Create new forum thread",
        "POST", "/forum/categories/general/threads",
        data=thread_data,
        expected_status=200
    )
    
    # Store thread ID for later tests
    thread_id = None
    if result.get("passed"):
        resp = result["response"]
        if "thread" not in resp or "post" not in resp:
            print(f"⚠️  Missing 'thread' or 'post' in response")
        else:
            thread_id = resp["thread"].get("_id")
            print(f"✅ Thread created with ID: {thread_id}")
    
    # Test 9: GET /api/forum/categories/general/threads
    result = test.test(
        "9. List threads in general category",
        "GET", "/forum/categories/general/threads",
        expected_status=200
    )
    
    # Verify threads list
    if result.get("passed"):
        resp = result["response"]
        if "category" not in resp or "threads" not in resp:
            print(f"⚠️  Missing 'category' or 'threads' in response")
        else:
            threads = resp["threads"]
            print(f"✅ Threads in category: {len(threads)}")
            # Check if our thread is in the list
            if thread_id:
                found = any(t.get("_id") == thread_id for t in threads)
                if found:
                    print(f"✅ New thread found in list")
                else:
                    print(f"⚠️  New thread not found in list")
    
    # Test 10: GET /api/forum/threads/{threadId}
    if thread_id:
        result = test.test(
            "10. Get thread details",
            "GET", f"/forum/threads/{thread_id}",
            expected_status=200
        )
        
        # Verify thread details
        if result.get("passed"):
            resp = result["response"]
            if "thread" not in resp or "posts" not in resp:
                print(f"⚠️  Missing 'thread' or 'posts' in response")
            else:
                posts = resp["posts"]
                print(f"✅ Posts in thread: {len(posts)}")
    else:
        print("⚠️  Skipping test 10: No thread ID available")
        test.results.append({
            "name": "10. Get thread details",
            "passed": False,
            "error": "No thread ID from previous test"
        })
    
    # Test 11: POST /api/forum/threads/{threadId}/posts
    if thread_id:
        reply_data = {
            "content": "Nice thread!"
        }
        result = test.test(
            "11. Reply to thread",
            "POST", f"/forum/threads/{thread_id}/posts",
            data=reply_data,
            expected_status=200
        )
        
        # Verify reply response
        if result.get("passed"):
            resp = result["response"]
            if "post" not in resp:
                print(f"⚠️  Missing 'post' in response")
            else:
                print(f"✅ Reply created")
    else:
        print("⚠️  Skipping test 11: No thread ID available")
        test.results.append({
            "name": "11. Reply to thread",
            "passed": False,
            "error": "No thread ID from previous test"
        })
    
    # Test 12: POST /api/logout
    result = test.test(
        "12. Logout",
        "POST", "/logout",
        expected_status=200
    )
    
    # Verify logout response
    if result.get("passed"):
        resp = result["response"]
        if not resp.get("ok"):
            print(f"⚠️  Expected {{'ok': true}} in response")
    
    # Test 13: Error cases
    print(f"\n{'='*80}")
    print("ERROR CASE TESTS")
    print(f"{'='*80}")
    
    # 13a: Register duplicate username
    result = test.test(
        "13a. Register duplicate username (should fail)",
        "POST", "/register",
        data=register_data,
        expected_status=400
    )
    
    # 13b: Login with wrong password
    wrong_login = {
        "username": "testhero",
        "password": "WrongPassword123"
    }
    result = test.test(
        "13b. Login with wrong password (should fail)",
        "POST", "/login",
        data=wrong_login,
        expected_status=401
    )
    
    # 13c: Access /me without cookie
    # Clear session cookies first
    test.session.cookies.clear()
    result = test.test(
        "13c. Access /me without authentication (should fail)",
        "GET", "/me",
        expected_status=401
    )
    
    # Print summary
    passed, total = test.print_summary()
    
    return 0 if passed == total else 1

if __name__ == "__main__":
    exit(main())
