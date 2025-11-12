# Project 2 – Git/GitHub Onboarding Guide

This quick guide shows how to clone, edit, commit, and push to the class repository.

**Repository:** https://github.com/minhanhnguy/Project2-ENGR1340.git

---

## 1. Clone the repository

```bash
git clone https://github.com/minhanhnguy/Project2-ENGR1340.git
cd Project2-ENGR1340
```

---

## 2. Make and track changes

Check what changed:
```bash
git status
```

Stage everything:
```bash
git add .
```

Commit with a short message:
```bash
git commit -m "Add new feature"
```

---

## 3. Sync and push

Always pull before pushing:
```bash
git pull origin main
```

Then push to GitHub:
```bash
git push origin main
```

---

## 4. Quick recap

```bash
git clone <repo-url>
cd <repo>
git add .
git commit -m "message"
git pull origin main
git push origin main
```

---

## 5. Tips

- Commit often, write clear messages.  
- Always pull before pushing.  
- Don’t overwrite teammates’ work without notice.  