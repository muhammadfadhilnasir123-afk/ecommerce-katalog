import os

files_to_remove = [
    "verify_register.py",
    "test_auth_api.py",
    "deploy_check.py",
    "search_git.py"
]

for f in files_to_remove:
    path = os.path.join(r"C:\Users\Lenovo\.gemini\antigravity-ide\scratch\ecommerce-catalog", f)
    if os.path.exists(path):
        os.remove(path)
        print(f"Removed {f}")
    else:
        print(f"Not found {f}")
