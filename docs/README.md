# myfiling.ai Platform Documentation

Welcome to the complete myfiling.ai documentation hub. This directory contains all platform-wide documentation.

---

## 📚 Quick Links

### Getting Started
- **[GETTING-STARTED.md](#)** — Set up your development environment
- **[ARCHITECTURE.md](#)** — Understand the complete platform architecture
- **[DEVELOPMENT.md](#)** — Local development guide

### Component Guides
- **[dashboard/README.md](../dashboard/README.md)** — React frontend guide
- **[detector/README.md](../detector/README.md)** — PDF analysis engine guide (TO CREATE)
- **[api/README.md](../api/README.md)** — Backend API guide (TO CREATE)

### Technical Documentation
- **[API.md](#)** — REST API endpoint documentation (OpenAPI/Swagger)
- **[DETECTOR.md](#)** — PDF detection engine technical guide
- **[DATABASE.md](#)** — Database schema and design
- **[SECURITY.md](#)** — Security policies and best practices

### Operational Guides
- **[DEPLOYMENT.md](#)** — Production deployment procedures
- **[PERFORMANCE.md](#)** — Performance benchmarks and optimization
- **[MONITORING.md](#)** — Logging, metrics, and alerting
- **[TROUBLESHOOTING.md](#)** — Common issues and solutions

### Contributing
- **[CONTRIBUTING.md](#)** — Contribution guidelines
- **[CODE-STYLE.md](#)** — Code style and conventions
- **[TESTING.md](#)** — Testing strategies and examples

### How-To Guides
- **[guides/adding-new-defect.md](guides/adding-new-defect.md)** — Add a new filing defect type
- **[guides/adding-new-court.md](guides/adding-new-court.md)** — Support a new court
- **[guides/integrating-ml-model.md](guides/integrating-ml-model.md)** — Integrate ML models
- **[guides/scaling-to-production.md](guides/scaling-to-production.md)** — Scale the platform

---

## 🏗️ Platform Architecture Overview

```
legal-analysis-platform/
├── dashboard/              # React frontend (User interface)
├── detector/         # Python PDF analysis engine
├── api/              # FastAPI backend (REST API)
├── shared/           # Shared code & models
└── docs/             # This directory
```

### Component Responsibilities

| Component | Purpose | Technology |
|-----------|---------|-----------|
| **dashboard** | User interface for uploading & analyzing filings | React 18, JavaScript, CSS |
| **detector** | PDF parsing & defect detection | Python, pdfplumber, rule engine |
| **api** | REST API, orchestration, database | FastAPI, PostgreSQL, Redis |
| **shared** | Constants, models, enums used by all | Python, JSON schemas |

---

## 🚀 Quick Start

### Option 1: Frontend Only (Development)
```bash
cd dashboard
python -m http.server 8000
# Open http://localhost:8000
```

### Option 2: Full Stack (Docker)
```bash
docker-compose up
# Frontend: http://localhost:3000
# API: http://localhost:5000
# Docs: http://localhost:5000/docs
```

### Option 3: Local Development
```bash
# Frontend
cd dashboard && npm install && npm start

# API (new terminal)
cd api && pip install -r requirements.txt && python wsgi.py

# Detector (as library in API)
cd detector && pip install -r requirements.txt
```

---

## 📋 Key Concepts

### Defect Severity Levels
- **Critical**: File-breaking issues (filing will be rejected)
  - Court fee stamp missing
  - Vakalatnama not found
  - Affidavit not notarized
  
- **Minor**: Issues that may cause queries
  - Formatting problems
  - Font size violations
  - Index mismatches
  
- **Warning**: Best practice recommendations
  - Deponent visibility
  - Certified copy format

### Scoring System
```
If critical defects exist:
  score = MAX(0, 40 - (critical_count × 10))

If only minor defects:
  score = MAX(0, 100 - (minor_count × 15))

Score Ranges:
  71-100% → "Safe to file" (green)
   41-70% → "Fix issues first" (yellow)
    0-40% → "Must fix before filing" (red)
```

See **[dashboard/docs/SCORING-SYSTEM.md](../dashboard/docs/SCORING-SYSTEM.md)** for details.

---

## 🔄 Data Flow

```
Frontend (dashboard)
  ↓ (upload PDF)
API (api/)
  ↓ (file received)
Detector Engine (detector/)
  ↓ (parse & analyze PDF)
API (api/)
  ↓ (store result, calculate score)
Frontend (dashboard)
  ↓ (display results)
User
```

---

## 📁 Documentation Structure

### Root-Level Docs (This Directory)
- Architecture overviews
- Setup & deployment
- Operations & monitoring

### Component-Level Docs
- `dashboard/docs/` — Frontend-specific guides
- `detector/README.md` — Detector engine guide
- `api/README.md` — API guide

### Inline Documentation
- Code comments (why, not what)
- Docstrings for functions
- Type hints for clarity

---

## 🔐 Security

### Development
- No credentials in code
- Use `.env` files for secrets
- Never commit sensitive data

### Production
- All traffic over HTTPS
- JWT authentication
- Rate limiting enabled
- Database encryption
- Regular security audits

See **[SECURITY.md](#)** for full security policy.

---

## 📈 Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| PDF Analysis | < 5 seconds | 50-page filing |
| API Response | < 1 second | After analysis complete |
| Frontend Load | < 500ms | Initial page load |
| Database Query | < 100ms | Typical query |

See **[PERFORMANCE.md](#)** for benchmarks & optimization.

---

## 🧪 Testing

### Unit Tests
```bash
cd detector && pytest
cd api && pytest
cd dashboard && npm test
```

### Integration Tests
```bash
cd api && pytest tests/integration/
```

### End-to-End Tests
```bash
# (Selenium/Playwright tests in future)
```

See **[TESTING.md](#)** for strategies.

---

## 🤝 Contributing

1. **Read** [CONTRIBUTING.md](#)
2. **Fork** the repository
3. **Create** a feature branch
4. **Write** tests
5. **Submit** a pull request

See **[CODE-STYLE.md](#)** for code conventions.

---

## 📞 Support

- **Questions?** Check the FAQ in [TROUBLESHOOTING.md](#)
- **Found a bug?** Open an issue on GitHub
- **Feature request?** Discuss on GitHub Discussions
- **Security issue?** Email security@myfiling.ai (setup needed)

---

## 📚 Additional Resources

### External Links
- [Python documentation](https://docs.python.org/)
- [FastAPI docs](https://fastapi.tiangolo.com/)
- [React documentation](https://react.dev/)
- [pdfplumber docs](https://github.com/jsvine/pdfplumber)

### Related Docs
- **[dashboard README](../dashboard/README.md)** — Frontend project overview
- **[CHANGELOG.md](#)** — Release notes & version history
- **[VERSION](#)** — Current version file

---

## 🎯 Roadmap

### Phase 1: dashboard (✅ Complete)
- React frontend with UI/UX
- Mock scoring system
- Sample filings for demo

### Phase 2: Detector + API (⏳ In Progress)
- PDF parsing engine
- Rule-based defect detection
- REST API backend
- Database persistence

### Phase 3: Production
- User authentication
- Saved filing history
- Payment integration
- Mobile app

See **[ROADMAP.md](#)** for detailed timeline.

---

## 📝 License

MIT License - See LICENSE file in root directory.

---

**Last Updated:** June 5, 2026  
**Maintained by:** myfiling.ai team  
**Questions?** See CONTRIBUTING.md
