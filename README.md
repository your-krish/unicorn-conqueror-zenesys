# ⚡ STRATIQ OS - Enterprise Operations & Autonomous Supply Chain Command

An enterprise-grade autonomous supply chain command center with real-time multi-site buffer health tracking, incident resolution workflows, and Supabase cloud persistence.

# Link: https://ais-dev-jyiv4lj4f6qcfnvavl2ohq-877849359722.asia-southeast1.run.app

## ✨ Features

- 🌐 **Real-time Global Supply Chain Command** - Live status monitoring across suppliers, hubs, and distribution centers
- 🛡️ **Role-Based Access Control (RBAC)** - Seamless CEO View (executive metrics) vs. Admin View (entity management & cloud config)
- 🔐 **Supabase & Google OAuth 2.0** - Cloud database synchronization and secure one-click sign-in
- 🚨 **Incident Command Center** - Automated mitigation playbooks, disruption alerts, and emergency response workflows
- 📊 **Executive Analytics & Reports** - SLA tracking, cost efficiency benchmarks, and multi-facility performance audits
- 🌓 **Adaptive Theming** - High-contrast Light, Dark, and System Auto UI modes

## 🛠️ Technologies Used

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion
- **Backend & Database**: Supabase (PostgreSQL, Realtime, OAuth Authentication)
- **Deployment**: Google Cloud Run & AI Studio Build
- **Architecture**: Client-Side Single Page Application (SPA) with Cloud Database Sync

## 📂 Project Structure

```text
stratiq-os/
├── src/
│   ├── components/
│   │   ├── admin/          # Role management & Cloud database settings
│   │   ├── approvals/      # Purchase orders & vendor approval workflows
│   │   ├── audit/          # Compliance & audit trail logs
│   │   ├── auth/           # Google OAuth & role-routing login system
│   │   ├── dashboard/      # Supply chain KPI monitoring & interactive map
│   │   ├── incidents/      # Incident command & automated playbooks
│   │   ├── inventory/      # Multi-site stock levels & buffer health
│   │   ├── layout/         # Navigation bar & system sidebar
│   │   ├── procurement/    # Purchase orders & supplier bidding
│   │   ├── reports/        # Executive export & analytical reports
│   │   └── workforce/      # Warehouse staffing & logistics personnel
│   ├── context/
│   │   ├── AuthContext.tsx # User session, Google OAuth & RBAC state
│   │   └── RealtimeContext.tsx # Supabase live event streaming
│   ├── lib/
│   │   └── supabase.ts     # Supabase client config & fallback schema
│   ├── types/              # TypeScript enterprise data schemas
│   ├── App.tsx             # Main application router & view switcher
│   └── main.tsx            # Application entry point
├── package.json            # Project dependencies & build scripts
└── README.md               # Project documentation
