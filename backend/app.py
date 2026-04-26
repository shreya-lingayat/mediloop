from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import uuid
import secrets
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)


def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="root",
        database="mediloop_db"
    )


def _new_id():
    return str(uuid.uuid4())[:8]


def _init_schema():
    # Schema is user-managed and fixed; do not alter it here.
    return


def _get_available_credits(cur, patient_id):
    cur.execute(
        """
        SELECT IFNULL(SUM(amount), 0) AS total
        FROM Credit
        WHERE patient_id=%s AND expiry_date >= CURDATE()
        """,
        (patient_id,)
    )
    row = cur.fetchone()
    return float(row["total"] if row else 0.0)


@app.route('/register', methods=['POST'])
def register():
    data = request.json or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""
    email = (data.get("email") or "").strip()
    if not username or not password or not email:
        return jsonify({"error": "Username, password and email are required."}), 400
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters."}), 400

    con = get_db_connection()
    cur = con.cursor(dictionary=True)
    try:
        cur.execute("SELECT username FROM Admin WHERE username=%s", (username,))
        if cur.fetchone():
            return jsonify({"error": "Username already exists."}), 409
        cur.execute(
            "INSERT INTO Admin (username, password_hash, email, reset_token, token_expiry) VALUES (%s,%s,%s,NULL,NULL)",
            (username, generate_password_hash(password), email)
        )
        con.commit()
        return jsonify({"message": "Registration success"}), 201
    finally:
        cur.close()
        con.close()


@app.route('/login', methods=['POST'])
def login():
    data = request.json or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""
    if not username or not password:
        return jsonify({"error": "Username and password are required."}), 400

    con = get_db_connection()
    cur = con.cursor(dictionary=True)
    try:
        cur.execute("SELECT password_hash FROM Admin WHERE username=%s", (username,))
        row = cur.fetchone()
        if not row or not check_password_hash(row["password_hash"], password):
            return jsonify({"error": "Invalid username or password."}), 401
        return jsonify({"message": "Login success"}), 200
    finally:
        cur.close()
        con.close()


@app.route('/forgot_password', methods=['POST'])
def forgot_password():
    data = request.json or {}
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip()
    if not username or not email:
        return jsonify({"error": "Username and email are required."}), 400

    con = get_db_connection()
    cur = con.cursor(dictionary=True)
    try:
        cur.execute("SELECT username FROM Admin WHERE username=%s AND email=%s", (username, email))
        if not cur.fetchone():
            return jsonify({"error": "Account not found."}), 404
        token = secrets.token_urlsafe(24)
        expiry = datetime.now() + timedelta(minutes=30)
        cur.execute(
            "UPDATE Admin SET reset_token=%s, token_expiry=%s WHERE username=%s",
            (token, expiry, username)
        )
        con.commit()
        return jsonify({"message": "Reset token generated", "reset_token": token}), 200
    finally:
        cur.close()
        con.close()


@app.route('/reset_password', methods=['POST'])
def reset_password():
    data = request.json or {}
    username = (data.get("username") or "").strip()
    token = (data.get("token") or "").strip()
    new_password = data.get("new_password") or ""
    if not username or not token or not new_password:
        return jsonify({"error": "Username, token and new password are required."}), 400
    if len(new_password) < 8:
        return jsonify({"error": "New password must be at least 8 characters."}), 400

    con = get_db_connection()
    cur = con.cursor(dictionary=True)
    try:
        cur.execute("SELECT reset_token, token_expiry FROM Admin WHERE username=%s", (username,))
        row = cur.fetchone()
        if not row or row["reset_token"] != token:
            return jsonify({"error": "Invalid reset token."}), 401
        if not row["token_expiry"] or row["token_expiry"] < datetime.now():
            return jsonify({"error": "Reset token expired."}), 401

        cur.execute(
            "UPDATE Admin SET password_hash=%s, reset_token=NULL, token_expiry=NULL WHERE username=%s",
            (generate_password_hash(new_password), username)
        )
        con.commit()
        return jsonify({"message": "Password reset successful."}), 200
    finally:
        cur.close()
        con.close()


@app.route('/change_password', methods=['POST'])
def change_password():
    data = request.json or {}
    username = (data.get("username") or "").strip()
    old_password = data.get("old_password") or ""
    new_password = data.get("new_password") or ""
    if not username or not old_password or not new_password:
        return jsonify({"error": "All fields are required."}), 400

    con = get_db_connection()
    cur = con.cursor(dictionary=True)
    try:
        cur.execute("SELECT password_hash FROM Admin WHERE username=%s", (username,))
        row = cur.fetchone()
        if not row or not check_password_hash(row["password_hash"], old_password):
            return jsonify({"error": "Current password is incorrect."}), 401
        cur.execute(
            "UPDATE Admin SET password_hash=%s WHERE username=%s",
            (generate_password_hash(new_password), username)
        )
        con.commit()
        return jsonify({"message": "Password updated successfully."}), 200
    finally:
        cur.close()
        con.close()


@app.route('/change_username', methods=['POST'])
def change_username():
    data = request.json or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""
    new_username = (data.get("new_username") or "").strip()
    if not username or not password or not new_username:
        return jsonify({"error": "All fields are required."}), 400

    con = get_db_connection()
    cur = con.cursor(dictionary=True)
    try:
        cur.execute("SELECT password_hash FROM Admin WHERE username=%s", (username,))
        row = cur.fetchone()
        if not row or not check_password_hash(row["password_hash"], password):
            return jsonify({"error": "Password is incorrect."}), 401

        cur.execute("SELECT username FROM Admin WHERE username=%s", (new_username,))
        if cur.fetchone():
            return jsonify({"error": "Username already taken."}), 409

        cur.execute("UPDATE Admin SET username=%s WHERE username=%s", (new_username, username))
        con.commit()
        return jsonify({"message": "Username updated successfully."}), 200
    finally:
        cur.close()
        con.close()


@app.route('/add_medicine', methods=['POST'])
def add_medicine():
    data = request.json or {}
    con = get_db_connection()
    cur = con.cursor()
    try:
        medicine_id = _new_id()
        cur.execute(
            "INSERT INTO Medicine VALUES (%s,%s,%s,%s)",
            (medicine_id, data["medicine_name"], data["category"], data["unit_price"])
        )
        con.commit()
        return jsonify({"medicine_id": medicine_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        con.close()


@app.route('/get_medicines')
def get_medicines():
    con = get_db_connection()
    cur = con.cursor(dictionary=True)
    try:
        cur.execute("SELECT * FROM Medicine ORDER BY medicine_name")
        return jsonify(cur.fetchall())
    finally:
        cur.close()
        con.close()


@app.route('/add_supplier', methods=['POST'])
def add_supplier():
    data = request.json or {}
    con = get_db_connection()
    cur = con.cursor()
    try:
        supplier_id = _new_id()
        cur.execute(
            "INSERT INTO Supplier VALUES (%s,%s,%s,%s)",
            (supplier_id, data["supplier_name"], data["contact_no"], data["license_no"])
        )
        con.commit()
        return jsonify({"supplier_id": supplier_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        con.close()


@app.route('/get_suppliers')
def get_suppliers():
    con = get_db_connection()
    cur = con.cursor(dictionary=True)
    try:
        cur.execute("SELECT * FROM Supplier ORDER BY supplier_name")
        return jsonify(cur.fetchall())
    finally:
        cur.close()
        con.close()


@app.route('/add_batch', methods=['POST'])
def add_batch():
    data = request.json or {}
    con = get_db_connection()
    cur = con.cursor()
    try:
        batch_id = _new_id()
        cur.execute(
            """
            INSERT INTO Batch (batch_id, medicine_id, supplier_id, manufacturing_date, quantity_available, purchase_price)
            VALUES (%s,%s,%s,%s,%s,%s)
            """,
            (
                batch_id,
                data["medicine_id"],
                data["supplier_id"],
                data["manufacturing_date"],
                data["quantity_available"],
                data["purchase_price"]
            )
        )
        con.commit()
        return jsonify({"batch_id": batch_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        con.close()


@app.route('/get_batch_details/<batch_id>')
def get_batch_details(batch_id):
    con = get_db_connection()
    cur = con.cursor(dictionary=True)
    try:
        cur.execute(
            """
            SELECT b.*, m.medicine_name, s.supplier_name
            FROM Batch b
            JOIN Medicine m ON b.medicine_id=m.medicine_id
            JOIN Supplier s ON b.supplier_id=s.supplier_id
            WHERE b.batch_id=%s
            """,
            (batch_id,)
        )
        row = cur.fetchone()
        if not row:
            return jsonify({"error": "Batch not found"}), 404
        return jsonify(row)
    finally:
        cur.close()
        con.close()


@app.route('/add_patient', methods=['POST'])
def add_patient():
    data = request.json or {}
    name = (data.get("name") or "").strip()
    contact = (data.get("contact") or "").strip()
    address = (data.get("address") or "").strip()
    registration_date = data.get("date") or datetime.now().date()
    if not name or not contact:
        return jsonify({"error": "Name and contact are required."}), 400

    con = get_db_connection()
    cur = con.cursor(dictionary=True)
    try:
        cur.execute("SELECT patient_id FROM Patient WHERE contact_no=%s", (contact,))
        if cur.fetchone():
            return jsonify({"error": "Patient with this phone already exists."}), 409
        patient_id = _new_id()
        cur.execute(
            "INSERT INTO Patient VALUES (%s,%s,%s,%s,%s)",
            (patient_id, name, address, contact, registration_date)
        )
        con.commit()
        return jsonify({"patient_id": patient_id, "msg": "Patient added successfully"}), 201
    finally:
        cur.close()
        con.close()


@app.route('/update_patient/<patient_id>', methods=['PUT'])
def update_patient(patient_id):
    data = request.json or {}
    name = (data.get("name") or "").strip()
    contact = (data.get("contact") or "").strip()
    address = (data.get("address") or "").strip()
    if not name or not contact:
        return jsonify({"error": "Name and contact are required."}), 400

    con = get_db_connection()
    cur = con.cursor(dictionary=True)
    try:
        cur.execute("SELECT patient_id FROM Patient WHERE contact_no=%s AND patient_id<>%s", (contact, patient_id))
        if cur.fetchone():
            return jsonify({"error": "Another patient with this phone exists."}), 409

        cur.execute(
            "UPDATE Patient SET p_name=%s, address=%s, contact_no=%s WHERE patient_id=%s",
            (name, address, contact, patient_id)
        )
        con.commit()
        return jsonify({"message": "Patient updated successfully."}), 200
    finally:
        cur.close()
        con.close()


@app.route('/search_patient')
def search_patient():
    name = request.args.get("name", "")
    con = get_db_connection()
    cur = con.cursor(dictionary=True)
    try:
        cur.execute(
            """
            SELECT p.patient_id, p.p_name, p.address, p.contact_no, p.registration_date,
                   IFNULL(SUM(CASE WHEN c.expiry_date >= CURDATE() THEN c.amount ELSE 0 END), 0) AS total_credits
            FROM Patient p
            LEFT JOIN Credit c ON p.patient_id = c.patient_id
            WHERE p.p_name LIKE %s OR p.contact_no LIKE %s
            GROUP BY p.patient_id
            ORDER BY p.p_name
            LIMIT 10
            """,
            (f"%{name}%", f"%{name}%")
        )
        return jsonify(cur.fetchall())
    finally:
        cur.close()
        con.close()


@app.route('/get_batches/<medicine_id>')
def get_batches(medicine_id):
    con = get_db_connection()
    cur = con.cursor(dictionary=True)
    try:
        cur.execute(
            """
            SELECT * FROM Batch
            WHERE medicine_id=%s AND quantity_available>0
            ORDER BY manufacturing_date ASC
            """,
            (medicine_id,)
        )
        return jsonify(cur.fetchall())
    finally:
        cur.close()
        con.close()


@app.route('/confirm_sale', methods=['POST'])
def confirm_sale():
    data = request.json or {}
    patient_id = data["patient_id"]
    cart = data.get("cart") or []
    use_credits = bool(data.get("use_credits", True))
    if not cart:
        return jsonify({"error": "Cart is empty"}), 400

    con = get_db_connection()
    cur = con.cursor(dictionary=True)
    try:
        total_amount = float(sum(float(i["sub_amount"]) for i in cart))
        available_credits = _get_available_credits(cur, patient_id)
        credits_used = min(available_credits, total_amount) if use_credits else 0.0
        final_amount = round(total_amount - credits_used, 2)
        remaining_credits = round(available_credits - credits_used, 2)

        transaction_id = _new_id()
        cur.execute(
            "INSERT INTO Transaction_Table VALUES (%s,%s,%s,%s,%s)",
            (transaction_id, patient_id, datetime.now().date(), final_amount, "DONE")
        )

        for item in cart:
            qty = int(item["quantity"])
            batch_id = item["batch_id"]
            cur.execute("SELECT quantity_available FROM Batch WHERE batch_id=%s", (batch_id,))
            row = cur.fetchone()
            if not row or int(row["quantity_available"]) < qty:
                con.rollback()
                return jsonify({"error": "Stock low"}), 400
            cur.execute(
                "INSERT INTO Transaction_Item VALUES (%s,%s,%s,%s)",
                (transaction_id, batch_id, qty, float(item["sub_amount"]))
            )
            cur.execute(
                "UPDATE Batch SET quantity_available = quantity_available - %s WHERE batch_id=%s",
                (qty, batch_id)
            )

        if credits_used > 0:
            cur.execute(
                "INSERT INTO Credit VALUES (%s,%s,%s,CURDATE(),DATE_ADD(CURDATE(), INTERVAL 30 DAY))",
                (_new_id(), patient_id, -credits_used)
            )

        con.commit()
        return jsonify({
            "transaction_id": transaction_id,
            "credits_used": round(credits_used, 2),
            "remaining_credits": remaining_credits,
            "final_amount": final_amount
        }), 200
    except Exception as e:
        con.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        con.close()


@app.route('/return_medicine', methods=['POST'])
def return_medicine():
    data = request.json or {}
    transaction_id = data["transaction_id"]
    batch_id = data["batch_id"]
    quantity = int(data["quantity"])
    if quantity <= 0:
        return jsonify({"error": "Invalid quantity"}), 400

    con = get_db_connection()
    cur = con.cursor(dictionary=True)
    try:
        cur.execute(
            """
            SELECT t.patient_id, t.transaction_date, ti.quantity, ti.sub_amount
            FROM Transaction_Table t
            JOIN Transaction_Item ti ON t.transaction_id=ti.transaction_id
            WHERE t.transaction_id=%s AND ti.batch_id=%s
            """,
            (transaction_id, batch_id)
        )
        tx = cur.fetchone()
        if not tx:
            return jsonify({"error": "Transaction not found"}), 404

        cur.execute(
            """
            SELECT IFNULL(SUM(quantity),0) AS returned_qty
            FROM Return_Request
            WHERE transaction_id=%s AND batch_id=%s AND return_status='APPROVED'
            """,
            (transaction_id, batch_id)
        )
        returned_qty = int(cur.fetchone()["returned_qty"])
        allowed = int(tx["quantity"]) - returned_qty
        if quantity > allowed:
            return jsonify({"error": "Return quantity exceeds purchased"}), 400

        days = (datetime.now().date() - tx["transaction_date"]).days
        unit_price = float(tx["sub_amount"]) / float(tx["quantity"])
        base_amount = quantity * unit_price
        if days <= 7:
            credit_amount = base_amount * 0.75
        elif days <= 15:
            credit_amount = base_amount * 0.25
        else:
            credit_amount = 0.0

        return_id = _new_id()
        cur.execute(
            "INSERT INTO Return_Request VALUES (%s,%s,%s,%s,%s,%s)",
            (return_id, transaction_id, batch_id, quantity, "APPROVED", datetime.now().date())
        )
        cur.execute(
            "UPDATE Batch SET quantity_available = quantity_available + %s WHERE batch_id=%s",
            (quantity, batch_id)
        )
        if credit_amount > 0:
            cur.execute(
                "INSERT INTO Credit VALUES (%s,%s,%s,CURDATE(),DATE_ADD(CURDATE(), INTERVAL 30 DAY))",
                (_new_id(), tx["patient_id"], round(credit_amount, 2))
            )
        con.commit()
        return jsonify({"return_id": return_id, "credit_added": round(credit_amount, 2), "days": days}), 200
    except Exception as e:
        con.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        con.close()


@app.route('/patient_medicine_history/<patient_id>')
def patient_medicine_history(patient_id):
    con = get_db_connection()
    cur = con.cursor(dictionary=True)
    try:
        cur.execute(
            """
            SELECT t.transaction_id, t.transaction_date, m.medicine_name, ti.quantity, ti.sub_amount, ti.batch_id
            FROM Transaction_Table t
            JOIN Transaction_Item ti ON t.transaction_id=ti.transaction_id
            JOIN Batch b ON ti.batch_id=b.batch_id
            JOIN Medicine m ON b.medicine_id=m.medicine_id
            WHERE t.patient_id=%s
            ORDER BY t.transaction_date DESC
            """,
            (patient_id,)
        )
        purchases = cur.fetchall()

        cur.execute(
            """
            SELECT rr.return_id, rr.transaction_id, rr.batch_id, rr.quantity, rr.return_status, rr.return_date
            FROM Return_Request rr
            JOIN Transaction_Table t ON rr.transaction_id=t.transaction_id
            WHERE t.patient_id=%s
            ORDER BY rr.return_date DESC
            """,
            (patient_id,)
        )
        returns = cur.fetchall()

        cur.execute(
            "SELECT credit_id, amount, issue_date, expiry_date FROM Credit WHERE patient_id=%s ORDER BY issue_date DESC",
            (patient_id,)
        )
        credits = cur.fetchall()

        earned = sum(float(c["amount"]) for c in credits if float(c["amount"]) > 0)
        used = abs(sum(float(c["amount"]) for c in credits if float(c["amount"]) < 0))
        remaining = sum(float(c["amount"]) for c in credits if c["expiry_date"] >= datetime.now().date())

        return jsonify({
            "purchases": purchases,
            "returns": returns,
            "credits": credits,
            "credit_summary": {
                "earned": round(earned, 2),
                "used": round(used, 2),
                "remaining": round(remaining, 2)
            }
        })
    finally:
        cur.close()
        con.close()


@app.route('/dashboard_stats')
def dashboard_stats():
    con = get_db_connection()
    cur = con.cursor(dictionary=True)
    stats = {}
    try:
        cur.execute("SELECT COUNT(*) AS count FROM Patient")
        stats["total_patients"] = cur.fetchone()["count"]
        cur.execute("SELECT COUNT(*) AS count FROM Medicine")
        stats["total_medicines"] = cur.fetchone()["count"]
        cur.execute("SELECT COUNT(*) AS count FROM Batch WHERE quantity_available < 10")
        stats["low_stock_items"] = cur.fetchone()["count"]
        cur.execute(
            """
            SELECT COUNT(*) AS count FROM Batch
            WHERE DATE_ADD(manufacturing_date, INTERVAL 2 YEAR) <= CURDATE() + INTERVAL 30 DAY
            """
        )
        stats["expiring_soon"] = cur.fetchone()["count"]
        return jsonify(stats)
    finally:
        cur.close()
        con.close()


@app.route('/expiry_alert')
def expiry_alert():
    con = get_db_connection()
    cur = con.cursor(dictionary=True)
    try:
        cur.execute(
            """
            SELECT b.batch_id, b.manufacturing_date, b.quantity_available, b.purchase_price,
                   m.medicine_name, s.supplier_name,
                   DATE_ADD(b.manufacturing_date, INTERVAL 2 YEAR) AS expiry_date,
                   DATEDIFF(DATE_ADD(b.manufacturing_date, INTERVAL 2 YEAR), CURDATE()) AS days_to_expiry
            FROM Batch b
            JOIN Medicine m ON b.medicine_id=m.medicine_id
            JOIN Supplier s ON b.supplier_id=s.supplier_id
            WHERE DATE_ADD(b.manufacturing_date, INTERVAL 2 YEAR) <= CURDATE() + INTERVAL 30 DAY
            ORDER BY DATE_ADD(b.manufacturing_date, INTERVAL 2 YEAR) ASC
            """
        )
        return jsonify(cur.fetchall())
    finally:
        cur.close()
        con.close()


@app.route('/get_transactions')
def get_transactions():
    con = get_db_connection()
    cur = con.cursor(dictionary=True)
    try:
        cur.execute(
            """
            SELECT t.transaction_id, t.transaction_date, t.total_amount, t.status, p.p_name AS patient_name
            FROM Transaction_Table t
            JOIN Patient p ON t.patient_id=p.patient_id
            ORDER BY t.transaction_date DESC
            """
        )
        rows = cur.fetchall()
        for row in rows:
            row["credits_used"] = 0
        return jsonify(rows)
    finally:
        cur.close()
        con.close()


@app.route('/get_all_credits')
def get_all_credits():
    con = get_db_connection()
    cur = con.cursor(dictionary=True)
    try:
        cur.execute(
            """
            SELECT c.credit_id, c.patient_id, p.p_name, c.amount, c.issue_date, c.expiry_date
            FROM Credit c JOIN Patient p ON c.patient_id=p.patient_id
            ORDER BY c.issue_date DESC
            """
        )
        return jsonify(cur.fetchall())
    finally:
        cur.close()
        con.close()


if __name__ == '__main__':
    _init_schema()
    app.run(debug=True)
