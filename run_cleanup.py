import os
for f in ["clean_temp.py", "run_cleanup.py"]:
    if os.path.exists(f):
        try:
            os.remove(f)
        except:
            pass
