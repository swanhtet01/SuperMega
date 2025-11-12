# Yangon Tyre Factory - Complete Remote Management System Specification

**Based on Real Data Analysis from Plant A & Plant B**

---

## SYSTEM VISION

**Enable complete remote factory management - eliminate need for physical visits**

The system must provide:
- Real-time production visibility
- Quality control monitoring
- Work diary and schedule tracking
- Communication and announcements
- AI-powered insights and alerts
- Multi-department management (Production, Sales, Inventory, Finance)
- Role-based access (Supervisor, Manager, Executive, Admin)

---

## DATA SOURCES ANALYZED

### Plant A (Section-07 - Bias Tyre Production)
- Daily production reports (Excel + PNG via Viber)
- Weekly summaries (PNG screenshots)
- Monthly reports
- **Quality System**: Simple A/B/R categorization
  - A = Approved (good)
  - B = Defect (minor issues)
  - R = Rejected (major defects)

### Plant B (Bilin - Radial Tyre Production)
- Detailed defect tracking (50+ defect types)
- 5W1H root cause analysis
- Weekly defect reports by tire size
- Production line tracking (W1, W3, W4, Line W3 M10)
- Claims and durability tracking
- MBO (Management by Objectives)
- Building production specifications
- Raw materials tracking

---

## CORE MODULES

### 1. PRODUCTION MODULE

#### Plant A (Bias Tyre) - Daily Entry
- Production Date
- Batch Number (e.g., "44-25")
- Section (default: Section-07)
- Shift Type (1-shift, 3-shift)
- Tire Size (5.00-12, 6.00-12, 7.00-16, 8.25-16, 10.00-20, 11.00-20, etc.)
- Batch Code (555-AG, 711-R, 712-RL, 713-L, 723-Grip, 737-L, 747-L)
- Targets (1-Shift, 3-Shift)
- **Curing Results:**
  - A (Approved)
  - B (Defect)
  - R (Rejected)
  - Total Produced
- **Weight Tracking:**
  - Spec Weight
  - Weight Sample 1, 2, 3
  - Average Weight
  - Total Weight
- Supervisor Name
- Notes

#### Plant B (Radial Tyre) - Detailed Defect Tracking
- **50+ Defect Categories:**
  - **Bead Defects**: Undercure, Separation (AIB), Crack, Toe, Deformation, Blister (AIB), Bare, Damage (FMB)
  - **Inner Liner**: Undercure, Blister (AII), Separation (AIC), Bare
  - **Steel Belt**: Folded, Separation
  - **Sidewall**: Splice, Blister, Lightness, Separation, Crack, Bare (BRS), Undercure, ပိန် Blow Too Much, ဖောင်း
  - **Shoulder**: Bare, Crack, Separation, Blister
  - **Process Issues**: Bladder Folded (BCR), Foreign Particle (FMS), Bad Stencil (BDS), Not Correct Width (BDM), Narrow Bead, Bad Trimming, Tread Overflow
  - **Pressure/Test**: Lost Pressure မိုဟ, Flange Test, Bladder Mark (Blနာ), MEPE (POF), Cut Sample
  - **Curing Issues**: Center Line Off, Undercure, Over Cure
  - **Other**: Component Separation, Tread Damage, အဆက်နီး, Flange Ring Fault, Buckle on Case, Kinked Bead (KKB), Open Case Joint (OCJ)

- **Defect Tracking by:**
  - Tire Size (145R12C, 155R12C, 165R13C, 175R14C, 185R14C, 195R15C, 6.50R16, 7.00R16, etc.)
  - Week (W1, W2, W3, W4, W5)
  - Day (daily breakdown)
  - B vs R classification

#### Flap Production
- Production Date
- Batch Number
- Flap Size (Flap 7.00/7.50-15, Flap 7.50/8.25-16, Flap 8.25/9.00-16, Flap 10.00/11.00-20, etc.)
- Shift Type
- Target
- Quantity Produced
- Quantity Defective
- Unit Weight
- Total Weight
- Notes (Myanmar language support for "အသားမပြည့်" - incomplete/defective)

---

### 2. QUALITY CONTROL MODULE

#### 5W1H Analysis (Root Cause Analysis)
- **Why**: Why did the defect occur?
- **What**: What is the defect?
- **Where**: Where did it occur? (Line, machine, station)
- **When**: When did it occur? (Date, shift, time)
- **Who**: Who was involved? (Operator, supervisor)
- **How**: How did it happen? (Process, method)

#### Claims & Durability Tracking
- Customer claim details
- Tire size and batch
- Defect type
- Root cause analysis
- Corrective action
- Follow-up

#### Quality Insights
- Defect trends by tire size
- Defect trends by defect type
- Week-over-week comparison
- Year-over-year comparison (2024 vs 2025)
- Top defect types
- Quality improvement tracking

---

### 3. WORK DIARY & SCHEDULE MODULE

#### Work Diary
- Date
- Shift
- Production Line (W1, W3, W4, Line W3 M10, etc.)
- Activities performed
- Issues encountered
- Actions taken
- Supervisor notes
- Attachments (photos, documents)

#### Schedule Management
- **Production Schedule**: Daily production plans by line
- **Maintenance Schedule**: Equipment maintenance calendar
- **Meeting Schedule**: Management meetings, reviews
- **Holiday Calendar**: Factory holidays, shutdowns
- **Shift Roster**: Who's working when

#### MBO (Management by Objectives)
- Objectives by department
- KPIs and targets
- Progress tracking
- Achievement status
- Review notes

---

### 4. SALES MODULE

#### Dealers
- Dealer Code
- Dealer Name
- Contact Person
- Phone, Email
- Address, City, Region
- Credit Limit
- Current Balance
- Active Status

#### Sales Orders
- Order Number
- Order Date
- Dealer
- Order Items (Tire Size, Quantity, Unit Price)
- Total Amount
- Paid Amount
- Status (Pending, Confirmed, Delivered, Paid, Cancelled)
- Delivery Date
- Payment Terms
- Notes

---

### 5. INVENTORY MODULE

#### Raw Materials
- Material Code
- Material Name
- Category
- Unit
- Current Stock
- Minimum Stock
- Unit Cost
- Supplier
- Last Restock Date

#### Finished Goods
- Tire Size
- Tire Type
- Batch Code
- Current Stock
- Minimum Stock
- Unit Price
- Location

---

### 6. FINANCIAL MODULE

#### Transactions
- Transaction Date
- Type (Revenue, Expense, Payment Received, Payment Made)
- Category
- Amount
- Description
- Reference Number
- Related Entity (Dealer, Supplier)
- Payment Method
- Notes

---

### 7. COMMUNITY & COMMUNICATION MODULE

#### Announcements Board
- Title
- Content
- Category (Production, Sales, HR, Safety, Maintenance, General)
- Priority (Low, Normal, High, Urgent)
- Pinned Status
- Target Roles
- Target Departments
- Scheduled For (future announcements)
- Expires At
- Attachments
- Posted By
- View Count

#### Updates Feed
- Activity feed (recent entries, changes)
- System notifications
- Quality alerts
- Inventory alerts
- Achievement badges

---

### 8. FILE MANAGEMENT & AUTO-SYNC

#### Excel Upload
- Drag-and-drop upload
- Auto-detect file type
- Parse and extract data
- Validate data quality
- Preview before import
- Error handling

#### Google Drive Auto-Sync
- Monitor specified folders
- Auto-download new files
- Extract data from Excel
- OCR for PNG images (optional)
- Schedule hourly/daily sync
- Sync logs

---

### 9. AI INSIGHTS & ALERTS

#### Auto Insights
- Daily production summary
- Quality trend analysis
- Weight variance detection
- Defect pattern recognition
- Inventory optimization
- Cost anomaly detection
- Sales pattern recognition

#### Smart Alerts
- Quality drop alert (B+R ratio > threshold)
- Weight variance alert
- Low inventory alert
- Overdue payment alert
- Production target miss
- Unusual expense alert
- Defect spike alert (specific defect types)

---

### 10. REPORTING

#### Auto-Generated Reports
- Daily production report (matching Excel format)
- Weekly summary report
- Monthly production analysis
- Defect analysis report (Plant B style)
- Sales report
- Inventory report
- Financial report (P&L, Balance Sheet)

#### Export Functions
- Export to Excel (original format)
- Export to PDF
- Export charts as images
- Bulk export for audits

---

## ROLE-BASED ACCESS (4 ROLES)

### 1. Supervisor (Lowest)
- **Can Do:**
  - Enter production data
  - Enter quality inspection data
  - View own team's data
  - View announcements
  - View schedule
- **Cannot Do:**
  - View other teams' data
  - Access financial data
  - Manage users
  - Change system settings

### 2. Manager
- **Can Do:**
  - Everything Supervisor can do
  - View entire department data
  - Generate department reports
  - Post announcements (department level)
  - Manage department schedule
  - View department financial summary
- **Cannot Do:**
  - View other departments' detailed data
  - Access full financial records
  - Manage users
  - Change system settings

### 3. Executive
- **Can Do:**
  - View all data across all departments
  - Access all reports and insights
  - View AI-generated insights
  - View all financial data
  - Post company-wide announcements
  - Remote monitoring dashboard
- **Cannot Do:**
  - Edit data (read-only)
  - Manage users
  - Change system settings

### 4. Admin
- **Can Do:**
  - Everything Executive can do
  - Manage users and roles
  - Change system settings
  - Configure integrations
  - Access audit logs
  - Manage backups

---

## KEY FEATURES FOR REMOTE MANAGEMENT

### Executive Dashboard (Main Remote Monitoring Page)
- **Today's Production Status**
  - Total produced (A + B + R)
  - Approval rate (A %)
  - Defect rate (B %)
  - Rejection rate (R %)
  - By plant, by line

- **Quality Alerts**
  - Active quality issues
  - Defect spikes
  - Weight variances

- **Sales Performance**
  - Today's orders
  - Pending deliveries
  - Overdue payments

- **Inventory Status**
  - Low stock items
  - Out of stock items
  - Restock needed

- **Financial Summary**
  - Today's revenue
  - Today's expenses
  - Outstanding receivables

- **Recent Announcements**
  - Pinned messages
  - Latest updates

- **AI Insights**
  - Automatic insights
  - Recommendations
  - Trend predictions

### Mobile-Responsive Design
- Works on phone, tablet, desktop
- Fast loading on slow connections
- Offline data entry (sync when online)
- Push notifications for critical alerts

---

## TECHNICAL REQUIREMENTS

### Database
- MySQL/TiDB (already configured)
- Support for Myanmar Unicode text
- Efficient indexing for fast queries
- Regular backups

### File Storage
- S3 for uploaded files
- Support for Excel, PNG, PDF
- Automatic file processing

### Integration
- Google Drive API for auto-sync
- WhatsApp/Viber for notifications (future)
- Email for reports

### Security
- Role-based access control
- Audit logs for all changes
- Encrypted sensitive data
- Secure file upload

---

## SUCCESS METRICS

- **Reduce factory visits by 80%**
- **Real-time visibility** into all operations
- **Faster decision making** (insights within 24h)
- **Reduce data entry time by 50%** (via uploads)
- **Zero data loss** (auto-sync + backups)
- **Improve quality** (early defect detection)
- **Reduce inventory costs** (optimization)

---

## IMPLEMENTATION PRIORITY

### Phase 1: Core Infrastructure (CURRENT)
1. ✅ Database schema with all modules
2. ✅ Role-based access system
3. ✅ Basic UI framework

### Phase 2: Production & Quality (NEXT)
1. Production data entry (Plant A format)
2. Defect tracking (Plant B format)
3. Dashboard with real-time KPIs
4. Excel upload and parsing

### Phase 3: Communication & Scheduling
1. Announcements board
2. Schedule calendar
3. Work diary
4. Updates feed

### Phase 4: Sales, Inventory, Financial
1. Sales order management
2. Inventory tracking
3. Financial transactions
4. Reports

### Phase 5: AI & Automation
1. Auto insights
2. Smart alerts
3. Predictive analytics
4. Google Drive auto-sync

### Phase 6: Polish & Deploy
1. Mobile optimization
2. Testing with real data
3. Training materials
4. Production deployment

---

**Document Version**: 1.0
**Date**: November 12, 2025
**Status**: Ready for Implementation

