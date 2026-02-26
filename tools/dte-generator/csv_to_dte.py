#!/usr/bin/env python3
"""
DTE File Generator — CSV → DTE (Daily Transaction Extract) Converter
Follows Cuscal DTE File Specification v6.0

Usage:
    python csv_to_dte.py input.csv [--output output.dte] [--client MX51] [--business-date 20260225] [--run-date 20260225]

Each record in the DTE file is exactly 700 bytes, terminated by CR+LF.
File structure: Header Record → Detail Records → Trailer Record → Filler Record
"""

import csv
import sys
import argparse
from datetime import datetime

RECORD_LEN = 700


def pad_num(value, length):
    """NUM format: right justified, zero filled"""
    return str(int(value)).zfill(length)[:length]


def pad_an(value, length):
    """AN format: left justified, space filled"""
    return str(value).ljust(length)[:length]


def build_header(client_name, business_date, run_date):
    """
    Header Record — 700 bytes
    Field 1: Record Number      (1,  8, NUM) = "00000000"
    Field 2: File Type           (9,  8, AN)  = "DAILYTXN"
    Field 3: Client Inst Name    (17, 8, AN)
    Field 4: File Format         (25, 1, AN)  = "A"
    Field 5: Business Date       (26, 8, AN)  = YYYYMMDD
    Field 6: File Run Date       (34, 8, AN)  = YYYYMMDD
    Field 7: Filler              (42, 659, AN) = spaces
    """
    rec = ""
    rec += pad_num(0, 8)                          # Field 1: Record Number
    rec += pad_an("DAILYTXN", 8)                  # Field 2: File Type
    rec += pad_an(client_name, 8)                 # Field 3: Client Institution Name
    rec += pad_an("A", 1)                         # Field 4: File Format (ASCII)
    rec += pad_an(business_date, 8)               # Field 5: Business Date
    rec += pad_an(run_date, 8)                    # Field 6: File Run Date
    rec += pad_an("", 659)                        # Field 7: Filler
    assert len(rec) == RECORD_LEN, f"Header length {len(rec)} != {RECORD_LEN}"
    return rec


def build_detail(seq_num, row):
    """
    Transaction Detail Record — 700 bytes (59 fields per v6.0 spec)
    """
    rec = ""
    rec += pad_num(seq_num, 8)                                                        # F1:  Record Sequence Number (1, 8)
    rec += pad_an(row.get("message_type", "0200"), 4)                                 # F2:  Message Type (9, 4)
    rec += pad_an(row.get("original_message_type", ""), 4)                            # F3:  Original Message Type (13, 4)

    pan = row.get("pan", "")
    rec += pad_num(len(pan) if pan else 0, 2)                                         # F4:  PAN Length (17, 2)
    rec += pad_an(pan, 19)                                                            # F5:  PAN (19, 19)

    rec += pad_an(row.get("processing_code", "000000"), 6)                            # F6:  Processing Code (38, 6)
    rec += pad_num(row.get("amount_aud_cents", "0"), 12)                              # F7:  Transaction Amount AUD (44, 12)
    rec += pad_num(row.get("amount_original_currency_cents", "0"), 12)                # F8:  Transaction Amount Original Currency (56, 12)
    rec += pad_num(row.get("cardholder_amount_cents", "0"), 12)                       # F9:  Cardholder Amount (68, 12)
    rec += pad_an(row.get("transmission_datetime", ""), 10)                           # F10: Transmission Date and Time MMDDHHMISS (80, 10)
    rec += pad_num(row.get("system_trace", "0"), 6)                                   # F11: System Trace Audit Number (90, 6)
    rec += pad_an(row.get("local_time", ""), 6)                                       # F12: Local Time HHMMSS (96, 6)
    rec += pad_an(row.get("local_date", ""), 4)                                       # F13: Local Date MMDD (102, 4)
    rec += pad_an(row.get("expiry_date", "0000"), 4)                                  # F14: Expiry Date YYMM (106, 4)
    rec += pad_an(row.get("settlement_date", ""), 4)                                  # F15: Settlement Date MMDD (110, 4)
    rec += pad_num(row.get("merchant_category_code", "5411"), 4)                      # F16: Merchant Category Code (114, 4)
    rec += pad_num(row.get("acquiring_country_code", "036"), 3)                       # F17: Acquiring Inst Country Code (118, 3)
    rec += pad_num(row.get("pos_entry_mode", "071"), 3)                               # F18: Point of Service Entry Mode (121, 3)
    rec += pad_num(row.get("card_sequence", "0"), 3)                                  # F19: Card Sequence Number (124, 3)
    rec += pad_num(row.get("pos_condition_code", "00"), 2)                            # F20: POS Condition Code (127, 2)
    rec += pad_an(row.get("acquirer_id", ""), 11)                                     # F21: Acquirer ID (129, 11)
    rec += pad_an(row.get("retrieval_ref_number", ""), 12)                            # F22: Retrieval Reference Number (140, 12)
    rec += pad_an(row.get("auth_id_response", ""), 6)                                 # F23: Authorisation ID Response (152, 6)
    rec += pad_an(row.get("response_code", "00"), 2)                                  # F24: Response Code (158, 2)
    rec += pad_an(row.get("terminal_id", ""), 8)                                      # F25: Card Acceptor Terminal ID (160, 8)
    rec += pad_an(row.get("card_acceptor_id", ""), 15)                                # F26: Card Acceptor ID (168, 15)
    rec += pad_an(row.get("card_acceptor_name", ""), 40)                              # F27: Card Acceptor Name/Location (183, 40)
    rec += pad_num(row.get("transaction_currency_code", "036"), 3)                    # F28: Transaction Currency Code (223, 3)
    rec += pad_num(row.get("cardholder_currency_code", "036"), 3)                     # F29: Cardholder Currency Code (226, 3)
    rec += pad_num(row.get("cash_component_cents", "0"), 12)                          # F30: Cash Component Amount (229, 12)
    rec += pad_an(row.get("original_data_elements", ""), 42)                          # F31: Original Data Elements (241, 42)
    rec += pad_an(row.get("account_id_1", ""), 28)                                    # F32: Account ID 1 (283, 28)
    rec += pad_an(row.get("account_id_2", ""), 28)                                    # F33: Account ID 2 (311, 28)
    rec += pad_an(row.get("issuer_id", ""), 11)                                       # F34: Issuer ID (339, 11)
    rec += pad_an(row.get("merchants_state", ""), 1)                                  # F35: Merchant's State Code (350, 1)
    rec += pad_an(row.get("merchant_number", ""), 16)                                 # F36: Merchant Number (351, 16)
    rec += pad_an(row.get("device_type", "POS"), 3)                                   # F37: Device Type (367, 3)
    rec += pad_an(row.get("acquirer_name", ""), 32)                                   # F38: Acquirer Name (370, 32)
    rec += pad_an(row.get("issuer_name", ""), 32)                                     # F39: Issuer Name (402, 32)
    rec += pad_an(row.get("settlement_institution", ""), 8)                           # F40: Settlement Institution (434, 8)
    rec += pad_an(row.get("auth_code_indicator", ""), 1)                              # F41: Authorisation Code (442, 1)
    rec += pad_num(row.get("surcharge_fee_cents", "0"), 8)                            # F42: Amount, transaction fee (443, 8)
    rec += pad_an(row.get("customer_specific_data", ""), 40)                          # F43: Customer Specific Data (451, 40)
    rec += pad_an(row.get("dcc_opt_in", "NAD"), 3)                                    # F44: DCC Opt In (491, 3)
    rec += pad_num(row.get("dcc_txn_amount_aud_cents", "0"), 12)                      # F45: DCC Transaction Amount AUD (494, 12)
    rec += pad_num(row.get("dcc_cardholder_amount_cents", "0"), 12)                   # F46: DCC Cardholder Amount (506, 12)
    rec += pad_num(row.get("dcc_cardholder_exponent", "0"), 1)                        # F47: DCC Cardholder Amount Exponent (518, 1)
    rec += pad_num(row.get("exchange_rate", "0"), 15)                                 # F48: Exchange Rate (519, 15)
    rec += pad_num(row.get("offered_currency", "0"), 3)                               # F49: Offered Currency (534, 3)
    rec += pad_num(row.get("client_margin_percent", "0"), 6)                          # F50: Client Margin Percent (537, 6)
    rec += pad_num(row.get("commission_amount_cents", "0"), 4)                        # F51: Commission Amount (543, 4)
    rec += pad_num(row.get("dcc_revenue_cents", "0"), 6)                              # F52: DCC Revenue (547, 6)
    rec += pad_an(row.get("dcc_revenue_sign", " "), 1)                                # F53: DCC Revenue Sign (553, 1)
    rec += pad_an(row.get("wallet_provider", ""), 20)                                 # F54: Wallet Provider (554, 20)
    rec += pad_an(row.get("card_type", " "), 1)                                       # F55: Card Type (574, 1)
    rec += pad_an(row.get("domestic_indicator", " "), 1)                              # F56: Domestic Indicator (575, 1)
    rec += pad_an(row.get("eftpos_routed", "0"), 1)                                   # F57: eftpos Routed (576, 1)
    rec += pad_an(row.get("par_data", ""), 29)                                        # F58: PAR Data (577, 29)
    rec += pad_an("", 95)                                                             # F59: Filler (606, 95)

    if len(rec) != RECORD_LEN:
        print(f"WARNING: Detail record length {len(rec)} != {RECORD_LEN} (seq {seq_num})", file=sys.stderr)
        # Pad or truncate to fix
        if len(rec) < RECORD_LEN:
            rec += " " * (RECORD_LEN - len(rec))
        else:
            rec = rec[:RECORD_LEN]

    return rec


def build_trailer(record_count, total_amount_aud, total_dcc_amount_aud):
    """
    Trailer Record — 700 bytes
    Field 1: Record Number             (1,  8, AN)  = "88888888"
    Field 2: Record Count              (9,  8, NUM) = count of detail records
    Field 3: Total Transaction Amt AUD (17, 12, NUM)
    Field 4: Total DCC Txn Amt AUD     (29, 12, NUM)
    Field 5: Filler                    (41, 660, AN) = spaces
    """
    rec = ""
    rec += pad_an("88888888", 8)                  # Field 1: Record Number (trailer marker)
    rec += pad_num(record_count, 8)               # Field 2: Record Count
    rec += pad_num(total_amount_aud, 12)          # Field 3: Total Transaction Amount AUD
    rec += pad_num(total_dcc_amount_aud, 12)      # Field 4: Total DCC Transaction Amount AUD
    rec += pad_an("", 660)                        # Field 5: Filler
    assert len(rec) == RECORD_LEN, f"Trailer length {len(rec)} != {RECORD_LEN}"
    return rec


def build_filler():
    """
    Filler Record — 700 bytes
    Field 1: Record Type (1, 8, AN) = "99999999"
    Field 2: Filler      (9, 692, AN) = filled with "9"
    """
    rec = "99999999" + "9" * 692
    assert len(rec) == RECORD_LEN, f"Filler length {len(rec)} != {RECORD_LEN}"
    return rec


def convert_csv_to_dte(csv_path, output_path, client_name="MX51", business_date=None, run_date=None):
    """Main conversion: reads CSV, writes DTE file."""
    today = datetime.now()
    if not business_date:
        business_date = today.strftime("%Y%m%d")
    if not run_date:
        run_date = today.strftime("%Y%m%d")

    # Read CSV
    with open(csv_path, "r", newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    if not rows:
        print("ERROR: No data rows found in CSV", file=sys.stderr)
        sys.exit(1)

    # Build records
    records = []

    # Header
    records.append(build_header(client_name, business_date, run_date))

    # Detail records
    total_amount_aud = 0
    total_dcc_amount = 0
    for i, row in enumerate(rows, start=1):
        records.append(build_detail(i, row))
        try:
            total_amount_aud += int(row.get("amount_aud_cents", "0") or "0")
        except ValueError:
            pass
        try:
            total_dcc_amount += int(row.get("dcc_txn_amount_aud_cents", "0") or "0")
        except ValueError:
            pass

    # Trailer
    records.append(build_trailer(len(rows), total_amount_aud, total_dcc_amount))

    # Filler
    records.append(build_filler())

    # Write DTE file with CR+LF line endings
    with open(output_path, "w", newline="", encoding="ascii") as f:
        for rec in records:
            f.write(rec + "\r\n")

    print(f"DTE file generated successfully:")
    print(f"  Output:          {output_path}")
    print(f"  Client:          {client_name}")
    print(f"  Business Date:   {business_date}")
    print(f"  Run Date:        {run_date}")
    print(f"  Detail Records:  {len(rows)}")
    print(f"  Total Amount:    ${total_amount_aud / 100:.2f} AUD")
    print(f"  Record Length:   {RECORD_LEN} bytes")
    print(f"  File Size:       {(len(records)) * (RECORD_LEN + 2)} bytes")


def main():
    parser = argparse.ArgumentParser(
        description="Convert CSV to DTE (Daily Transaction Extract) file — Cuscal v6.0 spec"
    )
    parser.add_argument("input_csv", help="Path to input CSV file")
    parser.add_argument("--output", "-o", help="Output DTE file path (default: input with .dte extension)")
    parser.add_argument("--client", "-c", default="MX51", help="Client Institution Name (8 chars max, default: MX51)")
    parser.add_argument("--business-date", "-b", help="Business date YYYYMMDD (default: today)")
    parser.add_argument("--run-date", "-r", help="File run date YYYYMMDD (default: today)")

    args = parser.parse_args()

    output = args.output
    if not output:
        output = args.input_csv.rsplit(".", 1)[0] + ".dte"

    convert_csv_to_dte(args.input_csv, output, args.client, args.business_date, args.run_date)


if __name__ == "__main__":
    main()
