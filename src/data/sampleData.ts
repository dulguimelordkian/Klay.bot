export const SAMPLE_SYMPTOM_CASES = [
  {
    title: "Persistent Morning Cough & Low-grade Fever",
    symptoms: "Dry hacking cough mostly in the morning, mild fatigue, low-grade temperature around 99.8°F, slight throat scratchiness for 5 days.",
    duration: "5 days",
    severity: 4,
    ageGroup: "Adult (35yo)",
    medicalHistory: "Seasonal allergic rhinitis, no chronic illnesses",
    accompanyingSymptoms: "Post-nasal drip, mild sinus fullness, no shortness of breath",
  },
  {
    title: "Right Lower Quadrant Abdominal Discomfort",
    symptoms: "Dull ache starting near belly button that has shifted to lower right abdomen, mild nausea, loss of appetite.",
    duration: "18 hours",
    severity: 6,
    ageGroup: "Young Adult (24yo)",
    medicalHistory: "None",
    accompanyingSymptoms: "Low appetite, hurts more when walking or coughing, no vomiting yet",
  },
  {
    title: "Sudden Severe Headache with Visual Aura",
    symptoms: "Throbbing unilateral temple pain, zigzag flashing lights in left visual field before headache onset, sensitivity to light and sound.",
    duration: "4 hours",
    severity: 8,
    ageGroup: "Adult (42yo)",
    medicalHistory: "Prior history of episodic migraines, hypertension",
    accompanyingSymptoms: "Nausea, photophobia, mild neck stiffness",
  },
];

export const SAMPLE_LAB_REPORTS = [
  {
    title: "Routine Lipid Panel & Metabolic Screen",
    content: `PATIENT LAB RESULTS:
- Total Cholesterol: 242 mg/dL (High, Ref: <200)
- Triglycerides: 195 mg/dL (Borderline, Ref: <150)
- HDL-C: 41 mg/dL (Low, Ref: >50)
- LDL-C (calculated): 162 mg/dL (Elevated, Ref: <100)
- Fasting Glucose: 108 mg/dL (Impaired fasting glucose / Pre-diabetes range, Ref: 70-99)
- Hemoglobin A1c: 5.8% (Prediabetes range: 5.7 - 6.4%)
- eGFR: >90 mL/min/1.73m2 (Normal kidney filtration)`,
  },
  {
    title: "Chest X-Ray / CT Radiology Impression",
    content: `IMPRESSION:
1. Patchy bibasilar airspace opacities, right greater than left, consistent with developing bronchopneumonia or multifocal inflammatory process.
2. Mild blunting of the right costophrenic sulcus suggestive of trace pleural effusion.
3. Cardiomegaly is not identified.
4. Thoracic aortic calcification noted, mild atherosclerotic changes.
RECOMMENDATION: Clinical correlation recommended; follow-up radiograph in 4-6 weeks post-antimicrobial therapy to verify resolution.`,
  },
  {
    title: "Complete Blood Count (CBC) with Differential",
    content: `COMPLETE BLOOD COUNT:
- WBC: 12.8 x10^3/uL (High, Ref: 4.0 - 10.5)
- RBC: 4.65 x10^6/uL (Normal)
- Hemoglobin: 14.1 g/dL (Normal, Ref: 13.5 - 17.5)
- Hematocrit: 42.0% (Normal)
- Platelets: 285 x10^3/uL (Normal)
- Neutrophils %: 78% (Elevated relative neutrophilia, Ref: 40-70%)
- Lymphocytes %: 16% (Low relative, Ref: 20-40%)
- Band neutrophils: 4% (Mild left shift)`,
  },
];

export const SAMPLE_MEDICATIONS = [
  {
    name: "Metformin",
    currentMeds: "Lisinopril 10mg daily, Multivitamin",
    condition: "Newly diagnosed Type 2 Diabetes",
  },
  {
    name: "Amoxicillin-Clavulanate (Augmentin)",
    currentMeds: "Birth control pills (oral contraceptive), Ibuprofen as needed",
    condition: "Acute bacterial sinusitis",
  },
  {
    name: "Atorvastatin (Lipitor)",
    currentMeds: "Amlodipine 5mg, Omega-3 fish oil",
    condition: "Hyperlipidemia & cardiovascular risk reduction",
  },
  {
    name: "Levothyroxine (Synthroid)",
    currentMeds: "Calcium carbonate supplement, Iron tablet",
    condition: "Primary Hypothyroidism",
  },
];

export const SAMPLE_CLINICAL_PROMPTS = [
  {
    title: "Type 2 Diabetes Follow-up Encounter",
    docType: "SOAP Note",
    specialty: "Internal Medicine / Primary Care",
    patientAge: "58",
    gender: "Male",
    chiefComplaint: "Routine 3-month diabetes follow-up and blood pressure check",
    vitals: "BP 138/84, HR 72, Weight 204 lbs (down 4 lbs), BMI 29.8, A1c today 7.1% (prior 7.6%)",
    rawNotes: `Patient presents for scheduled 3-month DM2 follow-up. Complies with Metformin 1000mg BID. Reports walking 30 mins 4x/week, reduced sugary drinks. Denies hypoglycemia episodes, polydipsia, polyuria, chest pain, SOB, or paresthesias in feet. Monofilament exam today shows intact protective sensation bilaterally. Pedal pulses 2+ symmetric. Eye exam completed last month at optometrist (normal, no retinopathy). Labs: A1c 7.1%, eGFR >90, Urine albumin-to-creatinine ratio 18 mcg/mg (normal). Plan: Continue Metformin 1000mg BID, continue lifestyle modifications, repeat A1c in 3-6 months.`,
  },
  {
    title: "Inpatient Pneumonia Shift Handoff",
    docType: "SBAR Handoff",
    specialty: "Hospitalist / Medical Inpatient Floor",
    patientAge: "71",
    gender: "Female",
    chiefComplaint: "Community-acquired pneumonia on IV Ceftriaxone + Azithromycin",
    vitals: "T 99.1F, BP 124/76, HR 82, RR 18, SpO2 95% on 2L nasal cannula",
    rawNotes: `Patient admitted 48 hours ago for right lower lobe CAP. Has received 2 doses IV Ceftriaxone 1g and oral Azithromycin 500mg. Oxygen requirement decreased from 4L to 2L NC today. Leukocytosis improving (WBC 14.2 -> 9.8). Tolerating oral diet. Blood cultures from admission have no growth at 48 hours. Plan for overnight: Wean O2 to room air if SpO2 >=93% overnight. If stable tomorrow morning, transition to oral Cefpodoxime and plan for discharge home with physical therapy evaluation.`,
  },
  {
    title: "Post-Op Knee Arthroscopy Discharge Summary",
    docType: "Discharge Summary",
    specialty: "Orthopedic Surgery / Ambulatory Care",
    patientAge: "46",
    gender: "Female",
    chiefComplaint: "Left knee partial medial meniscectomy and chondroplasty",
    vitals: "Afebrile, BP 118/74, HR 68, pain 3/10 with weight-bearing",
    rawNotes: `Patient underwent uncomplicated left knee partial medial meniscectomy today. Portal sites clean and dry with Steri-Strips intact, compressive ACE wrap applied. Distal neurovascular exam intact (DP/PT pulses palpable, sensation to light touch intact). Tolerated oral fluids and voided spontaneously. Weight-bearing as tolerated with crutches for support. Rx given for Acetaminophen/Ibuprofen rotation, Celebrex 200mg daily x 5 days. Cryotherapy instructions provided. Post-op follow-up in 10-14 days for wound check and PT protocol initiation.`,
  },
];
