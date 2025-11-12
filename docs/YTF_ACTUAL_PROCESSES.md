# Yangon Tyre Factory - Actual Production Processes

## Data Source Analysis
Based on actual production data from Plant A (Daily Production Reports - Nov 2025)

---

## 1. PRODUCTION DATA STRUCTURE

### Daily Production Report Fields
- **Date**: DD/MM/YYYY format (e.g., 01/11/2025)
- **Batch Number**: Format "Bach No: XX-XX" (e.g., "44-25")
- **Shift**: 1-Shift, 3-Shift system
- **Section**: Section-07 (Bias Tyre Production)

### Tire Production Record
```
Sr No | Size of Tyre | Target (1-Shift, 3-Shift) | Curing (A, B, R) | Total | Spec Wt | Weight (Kg) | Actual Weights
```

**Key Fields:**
- **Tire Size**: Examples: 5.00-12, 6.00-12, 6.50-16, 7.00-16, 7.50-16, 8.25-16, 10.00-20, 11.00-20
- **Batch Codes**: 555, 711, 712, 713, 723, 727, 737, 747 (different specifications)
- **Target**: Production target per shift
- **Curing Results**:
  - **A**: Approved (good quality)
  - **B**: Defect B (minor defects)
  - **R**: Rejected (major defects)
- **Spec Weight**: Standard specification weight for the tire size
- **Actual Weight**: Measured weights (1 no, total)

### Flap Production (Inner Tubes)
```
Flap 7.00/7.50-15
Flap 7.50/8.25-16
Flap 8.25/9.00-16
Flap 8.25/9.00-20
Flap 10.00/11.00-20
Flap 11.00-20
```

**Flap Fields:**
- Target (1-Shift, 3-Shift)
- Production count
- Weight per unit
- Notes (e.g., "အသားမပြည့်" - incomplete/defective)

---

## 2. ACTUAL TIRE SIZES PRODUCED

### Passenger/Light Vehicle Tires
- 5.00-12 (Batch 711, 712, 747)
- 5.50-13 (Batch 711, 713)
- 6.00-12 (Batch 555 - AG Agricultural)
- 6.00-13 (Batch 711, 713)
- 6.00-14 (Batch 711, 713)
- 6.00-15 (Batch 711, 713)
- 6.50-14 (Batch 711)
- 6.50-15 (Batch 711, 713)
- 6.50-16 (Batch 711, 713 - Tube & Tubeless)

### Medium Truck Tires
- 7.00-15 (Batch 711, 723-Grip)
- 7.00-16 (Batch 711, 713, 723-Grip, 727)
- 7.50-15 (Batch 711)
- 7.50-16 (Batch 555-AG, 711, 713, 723-Grip, 747)
- 8.25-16 (Batch 711-HW, 713-Min, 737, 747)

### Heavy Truck Tires
- 8.25-20 (Batch 717, 737, 747)
- 9.00-20 (Batch 717, 737, 746, 747)
- 10.00-20 (Batch 747)
- 11.00-20 (Batch 747)

### Agricultural Tires
- 6.00-12 AG (Batch 555)
- 6.00-16 AG (Batch 555)
- 6.50-20 AG (Batch 575)
- 7.50-16 AG (Batch 555)
- 8.00-18 AG (Batch 555)

### Special Tires
- 155R12C (Radial)

---

## 3. BATCH CODE MEANINGS

Based on observed patterns:
- **555**: Agricultural (AG) tires
- **575**: Agricultural special
- **711**: Standard R (Rib pattern)
- **712**: Standard RL pattern
- **713**: L (Lug pattern)
- **717**: R pattern for heavy truck
- **723**: Grip pattern
- **727**: Special R pattern
- **737**: L pattern for heavy truck
- **746**: L pattern for 9.00-20
- **747**: L pattern (most common for large tires)

---

## 4. QUALITY CONTROL CATEGORIES

### Three-Tier Quality System
1. **A (Approved)**: Good quality, meets all specifications
2. **B (Defect B)**: Minor defects, may need rework
3. **R (Rejected)**: Major defects, cannot be sold

### Weight Quality Control
- Each tire size has a **Spec Weight** (standard)
- Actual weights are measured for 3 samples
- Average weight is calculated
- Deviation from spec weight indicates quality issues

---

## 5. PRODUCTION WORKFLOW

### Daily Process
1. **Target Setting**: Shift targets set (1-Shift, 3-Shift)
2. **Curing**: Tires go through curing process
3. **Quality Inspection**: Categorized as A, B, or R
4. **Weight Measurement**: 3 samples weighed per batch
5. **Daily Report**: Compiled by production supervisor (e.g., "PHYU PHYU AYE")

### Shift System
- **1-Shift**: Single shift production
- **3-Shift**: Three shift production (24-hour operation)
- Targets are set per shift type

---

## 6. REPORTING REQUIREMENTS

### Daily Report Format
- Header: Section, Batch No, Date
- Production table: All tire sizes produced
- Flap production table
- Total weight calculation (Tyre + Flap)
- Prepared by: Supervisor name

### Weekly Report
- Aggregated daily data
- Tire size performance tracking
- Weight consistency tracking

### Monthly Report
- Monthly production summary
- Tire size distribution
- Quality metrics (A/B/R ratios)

---

## 7. KEY METRICS TO TRACK

### Production Metrics
- Daily production by tire size
- Shift efficiency (actual vs target)
- Total weight produced

### Quality Metrics
- Approval rate (A / Total)
- Defect rate (B / Total)
- Rejection rate (R / Total)
- Weight variance (Actual vs Spec)

### Inventory Metrics
- Finished goods by tire size
- Flap inventory
- Raw material consumption

---

## 8. SYSTEM REQUIREMENTS

### Must Support
1. **Multiple batch codes** per tire size
2. **A/B/R quality categorization** (not just pass/fail)
3. **Weight tracking** with spec comparison
4. **Flap production** as separate product line
5. **Shift-based targets** and reporting
6. **Daily, weekly, monthly** aggregation
7. **Supervisor/operator** tracking
8. **Myanmar language** support for notes

### Data Entry Needs
- Quick daily entry form matching current Excel format
- Batch number auto-generation
- Weight calculation automation
- Quality summary auto-calculation

### Reporting Needs
- Daily production report (PDF/Excel export)
- Weekly summary by tire size
- Monthly production analysis
- Weight variance alerts
- Quality trend analysis

---

## 9. INTEGRATION POINTS

### Current Systems
- **Viber**: Daily reports shared as images
- **Excel**: Manual data entry and calculation
- **Google Drive**: File storage and sharing

### Future Integration
- Automatic data import from production floor
- Real-time quality alerts
- Automated report generation
- Mobile app for supervisors
- WhatsApp/Viber notifications

---

## 10. NEXT STEPS

1. ✅ Analyze actual data structure
2. ⏳ Update database schema to match YTF structure
3. ⏳ Rebuild production entry form
4. ⏳ Import historical data (2019-2025)
5. ⏳ Create YTF-specific dashboards
6. ⏳ Build automated daily/weekly/monthly reports
7. ⏳ Add weight variance alerts
8. ⏳ Implement quality trend analysis
9. ⏳ Mobile-friendly interface for floor supervisors
10. ⏳ Training and rollout

---

**Document Created**: November 12, 2025
**Data Source**: Plant A Daily Production Reports (2025)
**Analyzed By**: AI System based on actual YTF data

