#!/usr/bin/env python3
"""
Seed test users into the database via the app's seed API endpoint.
Run this script once before running the test suite.
"""
import urllib.request
import urllib.error
import json
import sys

BASE_URL = 'http://localhost:3000'

def seed_users():
    url = f'{BASE_URL}/api/setup/seed-test-users'
    try:
        req = urllib.request.Request(url, method='GET')
        with urllib.request.urlopen(req, timeout=30) as response:
            data = json.loads(response.read().decode())
            print("Seed result:", json.dumps(data, ensure_ascii=False, indent=2))
            return True
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.read().decode()}", file=sys.stderr)
        return False
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return False

if __name__ == '__main__':
    success = seed_users()
    sys.exit(0 if success else 1)
