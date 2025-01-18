import json
import re
import sys

def validate_json(file_path):
    with open(file_path, 'r') as file:
        data = json.load(file)

    errors = []
    valid_mitigation_strategies = [
        "Application Control",
        "Application Hardening",
        "Multi-factor authentication",
        "Patch Applications",
        "Patch Operating Systems",
        "Restrict administrative privileges",
        "Regular backups",
        "Restrict Microsoft Office macros",
    ]

    for idx, item in enumerate(data, start=1):
        item_errors = []
        mitigation_strategy = item.get("MitigationStrategy")
        control_reference = item.get("ControlReference")
        control = item.get("Control")
        test_methodology = item.get("TestMethodology")
        ml1 = item.get("ML1")
        ml2 = item.get("ML2")
        ml3 = item.get("ML3")

        # Validate MitigationStrategy
        if mitigation_strategy not in valid_mitigation_strategies:
            item_errors.append("Invalid MitigationStrategy.")

        # Validate ControlReference
        if control_reference:
            if len(control_reference) != 9:
                item_errors.append("ControlReference must be 9 characters long.")
            else:
                match = re.match(r"^(ML[123])-(AC|AH|MF|PA|PO|RA|RB|RM)-(\d{2})$", control_reference)
                if not match:
                    item_errors.append("ControlReference format is invalid.")
        else:
            item_errors.append("ControlReference is missing or empty.")

        # Validate Control
        if not control:
            item_errors.append("Control must not be empty.")

        # Validate TestMethodology
        if not test_methodology:
            item_errors.append("TestMethodology must not be empty.")

        # Validate ML1, ML2, ML3
        for field, value in [("ML1", ml1), ("ML2", ml2), ("ML3", ml3)]:
            if value not in [True, None, "TRUE", ""]:
                item_errors.append(f"{field} must be TRUE or NULL.")

        # Collect line-specific errors
        if item_errors:
            errors.append({
                "line": idx,
                "errors": item_errors
            })

    return errors

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate_json.py <path_to_json_file>")
        sys.exit(1)

    json_file = sys.argv[1]
    validation_errors = validate_json(json_file)

    if validation_errors:
        print("Validation failed. Lines with issues:")
        for error in validation_errors:
            print(f"Line {error['line']}:")
            for issue in error['errors']:
                print(f"  - {issue}")
        sys.exit(1)
    else:
        print("Validation successful! All checks passed.")
        sys.exit(0)
