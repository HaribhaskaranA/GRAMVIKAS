"""
GRAMVIKAS AI - Deterministic Scheme Eligibility Engine.
Accurate multi-variable rule evaluation matching citizen parameters against government guidelines.
"""

from typing import Dict, Any, List, Optional
from backend.models.schemas import (
    EligibilityCheckRequest,
    SchemeEligibilityResult,
    CriterionEvaluation,
    EligibilityOutcome
)

def evaluate_scheme_eligibility(scheme: Dict[str, Any], params: EligibilityCheckRequest) -> SchemeEligibilityResult:
    """
    Evaluates a citizen's profile or form inputs against a scheme's criteria.
    Produces deterministic outcomes: potentially_eligible, more_information_required, or cannot_confirm.
    """
    criteria = scheme.get("criteria", {})
    matched: List[CriterionEvaluation] = []
    unmet: List[CriterionEvaluation] = []
    missing: List[str] = []
    
    total_applicable_rules = 0
    passed_rules = 0

    # 1. AGE CHECK
    min_age = criteria.get("min_age", 0)
    max_age = criteria.get("max_age", 120)
    if params.age is None:
        missing.append("age")
    else:
        total_applicable_rules += 1
        if min_age <= params.age <= max_age:
            passed_rules += 1
            matched.append(CriterionEvaluation(
                criterion="Age Requirement",
                satisfied=True,
                details=f"Citizen age {params.age} falls within required range ({min_age}-{max_age} years)."
            ))
        else:
            unmet.append(CriterionEvaluation(
                criterion="Age Requirement",
                satisfied=False,
                details=f"Citizen age {params.age} is outside eligible range ({min_age}-{max_age} years)."
            ))

    # 2. GENDER CHECK
    allowed_genders = [g.lower() for g in criteria.get("allowed_genders", ["all"])]
    if "all" not in allowed_genders:
        if not params.gender:
            missing.append("gender")
        else:
            total_applicable_rules += 1
            if params.gender.lower() in allowed_genders:
                passed_rules += 1
                matched.append(CriterionEvaluation(
                    criterion="Gender Category",
                    satisfied=True,
                    details=f"Target gender '{params.gender}' matches scheme specification."
                ))
            else:
                unmet.append(CriterionEvaluation(
                    criterion="Gender Category",
                    satisfied=False,
                    details=f"Scheme specifically reserved for {', '.join(allowed_genders)}."
                ))

    # 3. INCOME CEILING CHECK
    max_income = criteria.get("max_annual_income")
    if max_income is not None:
        if params.annual_income is None:
            missing.append("annual_income")
        else:
            total_applicable_rules += 1
            if params.annual_income <= max_income:
                passed_rules += 1
                matched.append(CriterionEvaluation(
                    criterion="Annual Income Ceiling",
                    satisfied=True,
                    details=f"Reported income ₹{params.annual_income:,.0f} is within limit of ₹{max_income:,.0f}."
                ))
            else:
                unmet.append(CriterionEvaluation(
                    criterion="Annual Income Ceiling",
                    satisfied=False,
                    details=f"Reported income ₹{params.annual_income:,.0f} exceeds maximum threshold of ₹{max_income:,.0f}."
                ))

    # 4. LANDHOLDING ACRES CHECK
    max_land = criteria.get("max_landholding_acres")
    if max_land is not None:
        if params.landholding_acres is None:
            missing.append("landholding_acres")
        else:
            total_applicable_rules += 1
            if params.landholding_acres <= max_land:
                passed_rules += 1
                matched.append(CriterionEvaluation(
                    criterion="Landholding Area",
                    satisfied=True,
                    details=f"Land holding of {params.landholding_acres} acres is within {max_land} acres ceiling."
                ))
            else:
                unmet.append(CriterionEvaluation(
                    criterion="Landholding Area",
                    satisfied=False,
                    details=f"Land holding of {params.landholding_acres} acres exceeds maximum allowed {max_land} acres."
                ))

    # 5. OCCUPATION CHECK
    allowed_occ = [o.lower() for o in criteria.get("allowed_occupations", ["all"])]
    if "all" not in allowed_occ:
        if not params.occupation:
            missing.append("occupation")
        else:
            total_applicable_rules += 1
            if params.occupation.lower() in allowed_occ:
                passed_rules += 1
                matched.append(CriterionEvaluation(
                    criterion="Occupation Type",
                    satisfied=True,
                    details=f"Occupation '{params.occupation}' is directly eligible for this programme."
                ))
            else:
                unmet.append(CriterionEvaluation(
                    criterion="Occupation Type",
                    satisfied=False,
                    details=f"Occupation '{params.occupation}' is not listed among target groups ({', '.join(allowed_occ)})."
                ))

    # 6. RATION CARD CHECK
    allowed_ration = criteria.get("allowed_ration_cards", ["all"])
    if "all" not in allowed_ration:
        if not params.ration_card_type:
            missing.append("ration_card_type")
        else:
            total_applicable_rules += 1
            if params.ration_card_type.upper() in [r.upper() for r in allowed_ration]:
                passed_rules += 1
                matched.append(CriterionEvaluation(
                    criterion="Ration Card Category",
                    satisfied=True,
                    details=f"Ration card '{params.ration_card_type}' meets priority welfare classification."
                ))
            else:
                unmet.append(CriterionEvaluation(
                    criterion="Ration Card Category",
                    satisfied=False,
                    details=f"Requires {', '.join(allowed_ration)} card; citizen has {params.ration_card_type}."
                ))

    # 7. DISABILITY REQUIREMENT CHECK
    requires_pwd = criteria.get("requires_disability", False)
    if requires_pwd:
        total_applicable_rules += 1
        if params.has_disability:
            passed_rules += 1
            matched.append(CriterionEvaluation(
                criterion="PwD Special Benefit",
                satisfied=True,
                details="Citizen is registered as Person with Disability (PwD)."
            ))
        else:
            unmet.append(CriterionEvaluation(
                criterion="PwD Special Benefit",
                satisfied=False,
                details="Scheme specifically mandates Persons with Benchmark Disability (PwD)."
            ))

    # Calculate Outcome & Score
    if total_applicable_rules == 0:
        score_pct = 100
    else:
        score_pct = int((passed_rules / total_applicable_rules) * 100)

    # Determine status
    if unmet:
        status: EligibilityOutcome = "cannot_confirm"
    elif missing and score_pct >= 50:
        status = "more_information_required"
    elif score_pct == 100:
        status = "potentially_eligible"
    else:
        status = "more_information_required"

    # Multilingual explanation construction
    lang = (params.language or "en").lower()
    if status == "potentially_eligible":
        if lang == "ta":
            explanation = f"வாழ்த்துகள்! நீங்கள் '{scheme.get('title_ta', scheme['title_en'])}' திட்டத்தின் அனைத்து முதன்மை தகுதிகளையும் நிறைவு செய்கிறீர்கள்."
        elif lang == "hi":
            explanation = f"बधाई! आप '{scheme.get('title_hi', scheme['title_en'])}' योजना के सभी मुख्य पात्रता मानदंडों को पूरा करते हैं।"
        else:
            explanation = f"You appear to meet the primary criteria for '{scheme['title_en']}'. Please assemble the verified documents below to proceed."
    elif status == "more_information_required":
        missing_str = ", ".join(missing) if missing else "further documentation"
        if lang == "ta":
            explanation = f"உங்கள் விவரங்களின்படி நீங்கள் தகுதியுடையவராக இருக்கலாம், ஆனால் முழுமையாக உறுதிசெய்ய மேலும் சில தகவல்கள் ({missing_str}) தேவைப்படுகின்றன."
        elif lang == "hi":
            explanation = f"प्रारंभिक जानकारी के अनुसार आप पात्र हो सकते हैं, लेकिन पुष्टि के लिए कुछ अतिरिक्त विवरण ({missing_str}) आवश्यक हैं।"
        else:
            explanation = f"You may be eligible, but additional details ({missing_str}) are required to confirm full qualification."
    else:
        unmet_names = ", ".join([u.criterion for u in unmet])
        if lang == "ta":
            explanation = f"தற்போது உங்கள் விவரங்கள் இத்திட்டத்தின் சில நிபந்தனைகளுடன் ({unmet_names}) பொருந்தவில்லை."
        elif lang == "hi":
            explanation = f"वर्तमान में आपके विवरण योजना की कुछ शर्तों ({unmet_names}) से मेल नहीं खाते हैं।"
        else:
            explanation = f"Your current profile does not satisfy one or more strict requirements: {unmet_names}."

    # Steps and docs in selected language
    if lang == "ta":
        app_steps = criteria.get("application_steps_ta") or criteria.get("application_steps_en", [])
    elif lang == "hi":
        app_steps = criteria.get("application_steps_hi") or criteria.get("application_steps_en", [])
    else:
        app_steps = criteria.get("application_steps_en", [])

    return SchemeEligibilityResult(
        scheme_id=scheme["id"],
        scheme_title=scheme["title_en"] if lang == "en" else scheme.get(f"title_{lang}", scheme["title_en"]),
        status=status,
        score_percentage=score_pct,
        matched_criteria=matched,
        unmet_criteria=unmet,
        missing_fields=missing,
        explanation=explanation,
        required_documents=criteria.get("required_documents", []),
        application_steps=app_steps
    )
