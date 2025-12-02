#!/usr/bin/env python
"""Test script to verify package imports"""

try:
    import _cffi_backend
    print("✓ _cffi_backend imported successfully!")
except ImportError as e:
    print(f"✗ _cffi_backend import failed: {e}")

try:
    import cryptography
    print("✓ cryptography imported successfully!")
except ImportError as e:
    print(f"✗ cryptography import failed: {e}")

try:
    import bcrypt
    print("✓ bcrypt imported successfully!")
except ImportError as e:
    print(f"✗ bcrypt import failed: {e}")

try:
    import flask
    print("✓ flask imported successfully!")
except ImportError as e:
    print(f"✗ flask import failed: {e}")

print("\nAll critical packages checked!")
